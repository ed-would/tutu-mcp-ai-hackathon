import type { ApiError } from "../../shared/contracts/common";
import { getRequestId } from "../observability/request-id";

export function jsonResponse(body: unknown, status = 200, requestId?: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      ...(requestId ? { "x-request-id": requestId } : {}),
    },
  });
}

export function apiErrorResponse(
  request: Request,
  input: Omit<ApiError, "requestId"> & { requestId?: string },
  status: number,
): Response {
  const requestId = input.requestId ?? getRequestId(request);
  return jsonResponse({ ...input, requestId }, status, requestId);
}

export function methodNotAllowed(request: Request, allowed: "GET" | "POST"): Response {
  const requestId = getRequestId(request);
  return new Response(
    JSON.stringify({ code: "METHOD_NOT_ALLOWED", message: `Only ${allowed} is supported.`, retryable: false, requestId, stage: "http" }),
    {
      status: 405,
      headers: {
        allow: allowed,
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
        "x-request-id": requestId,
      },
    },
  );
}
