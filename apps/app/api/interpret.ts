import {
  interpretRequestSchema,
  type InterpretResponse,
  type InterpretRequest,
} from "../server/llm/contracts.js";
import { fallbackIntent } from "../server/llm/fallback.js";
import { generateWithProviders, type FetchLike, type ProviderResult } from "../server/llm/providers.js";
import { getRequestId } from "../server/observability/request-id.js";

const MAX_BODY_BYTES = 16 * 1024;

function jsonResponse(body: unknown, status: number, requestId: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      "x-request-id": requestId,
      ...(status === 405 ? { allow: "POST" } : {}),
    },
  });
}

function errorBody(code: string, message: string, retryable: boolean, requestId: string) {
  return { code, message, retryable, requestId, stage: "interpret" };
}

export type InterpretHandlerOptions = {
  fetchImpl?: FetchLike;
  env?: Record<string, string | undefined>;
};

export async function interpretHandler(
  request: Request,
  options: InterpretHandlerOptions = {},
): Promise<Response> {
  const requestId = getRequestId(request);
  if (request.method !== "POST") {
    return jsonResponse(errorBody("METHOD_NOT_ALLOWED", "Only POST is supported.", false, requestId), 405, requestId);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse(errorBody("BODY_TOO_LARGE", "Запрос слишком большой.", false, requestId), 413, requestId);
  }

  let rawBody: unknown;
  try {
    const bodyText = await request.text();
    if (new TextEncoder().encode(bodyText).byteLength > MAX_BODY_BYTES) {
      return jsonResponse(errorBody("BODY_TOO_LARGE", "Запрос слишком большой.", false, requestId), 413, requestId);
    }
    rawBody = JSON.parse(bodyText);
  } catch {
    return jsonResponse(errorBody("INVALID_JSON", "Ожидается JSON-тело запроса.", false, requestId), 400, requestId);
  }

  const parsed = interpretRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonResponse(errorBody("VALIDATION_ERROR", "Проверьте prompt и locale запроса.", false, requestId), 400, requestId);
  }

  const requestData: InterpretRequest = parsed.data;
  let providerResult: ProviderResult | undefined;
  try {
    providerResult = await generateWithProviders(requestData, options);
  } catch {
    providerResult = undefined;
  }

  const output = providerResult?.output ?? fallbackIntent(requestData);
  const response: InterpretResponse = output.status === "ready"
    ? { ...output, generation: providerResult ? "llm" : "rule_fallback" }
    : output;
  return jsonResponse(response, 200, requestId);
}

export default {
  async fetch(request: Request): Promise<Response> {
    return interpretHandler(request);
  },
};
