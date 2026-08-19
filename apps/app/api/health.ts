import type { HealthResponse } from "../shared/contracts/health";
import { getRequestId } from "../server/observability/request-id";
import { getLlmStatus, getMcpStatus } from "../server/observability/readiness";

function jsonResponse(body: unknown, status = 200, requestId?: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      ...(status === 405 ? { allow: "GET" } : {}),
      ...(requestId ? { "x-request-id": requestId } : {}),
    },
  });
}

/** Vercel-compatible health endpoint using the standard Fetch API primitives. */
export function healthHandler(request: Request): Response {
  const requestId = getRequestId(request);

  if (request.method !== "GET") {
    return jsonResponse(
      {
        code: "METHOD_NOT_ALLOWED",
        message: "Only GET is supported.",
        retryable: false,
        requestId,
        stage: "health",
      },
      405,
      requestId,
    );
  }

  const body: HealthResponse = {
    app: "ok",
    llm: getLlmStatus(),
    mcp: getMcpStatus(),
    timestamp: new Date().toISOString(),
    requestId,
  };

  return jsonResponse(body, 200, requestId);
}

/** Web Handler adapter required by Vercel's current Node.js runtime. */
export default {
  fetch(request: Request): Response {
    return healthHandler(request);
  },
};
