import { closeTutuMcp, connectTutuMcp } from "../server/mcp/client";
import { withMcpRetry } from "../server/mcp/retry";
import { getRequestId } from "../server/observability/request-id";
import { buildPackagesResponse } from "../server/packages/orchestrator";
import { getSearchInputs, PackagesRequestSchema, type PackageCallResult, type PackageToolName } from "../server/packages/contracts";

export const MAX_PACKAGES_BODY_BYTES = 16 * 1024;

function jsonResponse(body: unknown, status = 200, requestId?: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      ...(status === 405 ? { allow: "POST" } : {}),
      ...(requestId ? { "x-request-id": requestId } : {}),
    },
  });
}

/** Vercel-compatible live package search endpoint. */
export async function packagesHandler(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  if (request.method !== "POST") return jsonResponse({ code: "METHOD_NOT_ALLOWED", message: "Only POST is supported.", retryable: false, requestId, stage: "packages" }, 405, requestId);
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return jsonResponse({ code: "UNSUPPORTED_MEDIA_TYPE", message: "Content-Type must be application/json.", retryable: false, requestId, stage: "validation" }, 415, requestId);
  }
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_PACKAGES_BODY_BYTES) {
    return jsonResponse({ code: "BODY_TOO_LARGE", message: "Request body must be 16 KiB or smaller.", retryable: false, requestId, stage: "validation" }, 413, requestId);
  }
  let body: unknown;
  try {
    const raw = await request.arrayBuffer();
    if (raw.byteLength > MAX_PACKAGES_BODY_BYTES) {
      return jsonResponse({ code: "BODY_TOO_LARGE", message: "Request body must be 16 KiB or smaller.", retryable: false, requestId, stage: "validation" }, 413, requestId);
    }
    body = JSON.parse(new TextDecoder().decode(raw)) as unknown;
  } catch {
    return jsonResponse({ code: "INVALID_JSON", message: "Request body must be valid JSON.", retryable: false, requestId, stage: "validation" }, 400, requestId);
  }

  const parsed = PackagesRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ code: "INVALID_REQUEST", message: "Invalid packages request.", retryable: false, requestId, stage: "validation" }, 422, requestId);
  }
  const inputs = getSearchInputs(parsed.data);
  if ("error" in inputs) {
    return jsonResponse({ code: "INVALID_REQUEST", message: inputs.error, retryable: false, requestId, stage: "validation" }, 422, requestId);
  }

  let connection: Awaited<ReturnType<typeof connectTutuMcp>> | undefined;
  try {
    connection = await connectTutuMcp();
  } catch {
    connection = undefined;
  }
  if (!connection) return jsonResponse({ code: "MCP_UNAVAILABLE", message: "Tutu MCP is temporarily unavailable.", retryable: true, requestId, stage: "mcp-call" }, 503, requestId);
  try {
    const callTool = async (name: PackageToolName, args: Record<string, unknown>, timeoutMs: number): Promise<PackageCallResult> => {
      return withMcpRetry(() => connection.client.callTool({ name, arguments: args }, { timeout: timeoutMs }) as Promise<PackageCallResult>);
    };
    const response = await buildPackagesResponse(body as never, { callTool, requestId });
    const hasValidation = response.warnings.some((warning) => warning.source === "validation");
    const hasUnavailable = response.warnings.some((warning) => warning.code.includes("UNAVAILABLE") || warning.code.includes("TIMEOUT"));
    return jsonResponse(response, hasValidation ? 422 : hasUnavailable && response.packages.length === 0 ? 503 : 200, requestId);
  } catch {
    return jsonResponse({ code: "PACKAGES_FAILED", message: "Package search failed.", retryable: true, requestId, stage: "packages" }, 500, requestId);
  } finally {
    try {
      await closeTutuMcp(connection);
    } catch {
      // Cleanup must not replace an already-created API response.
    }
  }
}

export default { fetch: packagesHandler };
