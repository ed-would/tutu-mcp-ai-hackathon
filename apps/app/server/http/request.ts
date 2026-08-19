import { z } from "zod";
import type { ApiError } from "../../shared/contracts/common.js";
import { getRequestId } from "../observability/request-id.js";
import { jsonResponse } from "./response.js";

export const MAX_JSON_BODY_BYTES = 16 * 1024;

type ParseSuccess<T> = { ok: true; value: T; requestId: string };
type ParseFailure = { ok: false; response: Response; requestId: string };
export type ParsedJson<T> = ParseSuccess<T> | ParseFailure;

/** Read and validate a small JSON request without logging user input. */
export async function parseJsonBody<T>(request: Request, schema: z.ZodType<T>, stage: ApiError["stage"]): Promise<ParsedJson<T>> {
  const requestId = getRequestId(request);
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType && contentType !== "application/json") {
    return { ok: false, requestId, response: jsonResponse({ code: "UNSUPPORTED_MEDIA_TYPE", message: "Content-Type must be application/json.", retryable: false, requestId, stage }, 415, requestId) };
  }
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_JSON_BODY_BYTES) {
    return { ok: false, requestId, response: jsonResponse({ code: "BODY_TOO_LARGE", message: "Request body is too large.", retryable: false, requestId, stage }, 413, requestId) };
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return { ok: false, requestId, response: jsonResponse({ code: "INVALID_BODY", message: "Request body could not be read.", retryable: false, requestId, stage }, 400, requestId) };
  }
  if (new TextEncoder().encode(raw).byteLength > MAX_JSON_BODY_BYTES) {
    return { ok: false, requestId, response: jsonResponse({ code: "BODY_TOO_LARGE", message: "Request body is too large.", retryable: false, requestId, stage }, 413, requestId) };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, requestId, response: jsonResponse({ code: "INVALID_JSON", message: "Request body must be valid JSON.", retryable: false, requestId, stage }, 400, requestId) };
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, requestId, response: jsonResponse({ code: "VALIDATION_ERROR", message: "Request body failed validation.", retryable: false, requestId, stage }, 400, requestId) };
  }
  return { ok: true, value: result.data, requestId };
}
