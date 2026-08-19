import { getRequestId } from "../server/observability/request-id";
import {
  CheckoutMcpError,
  CheckoutPayloadError,
  CheckoutRequestSchema,
  type CheckoutErrorBody,
  type CheckoutRef,
} from "../server/checkout/validation";
import { createCheckoutLink } from "../server/checkout/service";
import { parseJsonBody } from "../server/http/request";

type CheckoutDependencies = {
  createCheckoutLink: (checkoutRef: CheckoutRef) => Promise<{
    url: string;
    kind: string;
    fallbackUrl?: string;
    note?: string;
  }>;
};

const defaultDependencies: CheckoutDependencies = { createCheckoutLink };

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

function errorResponse(
  requestId: string,
  status: number,
  code: string,
  message: string,
  retryable: boolean,
  stage: CheckoutErrorBody["stage"],
): Response {
  const body: CheckoutErrorBody = { code, message, retryable, requestId, stage };
  return jsonResponse(body, status, requestId);
}

/** Vercel-compatible checkout route. */
export async function checkoutHandler(
  request: Request,
  dependencies: CheckoutDependencies = defaultDependencies,
): Promise<Response> {
  const requestId = getRequestId(request);

  if (request.method !== "POST") {
    return errorResponse(
      requestId,
      405,
      "METHOD_NOT_ALLOWED",
      "Only POST is supported.",
      false,
      "validation",
    );
  }

  // parseJsonBody reads the raw stream and measures encoded bytes, so a
  // missing or misleading Content-Length cannot bypass the 16 KiB limit.
  const parsed = await parseJsonBody(request, CheckoutRequestSchema, "checkout");
  if (!parsed.ok) return parsed.response;

  const checkoutRef = parsed.value.checkoutRef ?? parsed.value.checkout_ref;
  // The schema guarantees this, but retaining the guard keeps this route safe
  // if the schema is ever relaxed or replaced by a shared contract.
  if (!checkoutRef) {
    return errorResponse(
      requestId,
      400,
      "VALIDATION_ERROR",
      "A valid checkoutRef is required.",
      false,
      "validation",
    );
  }

  try {
    const result = await dependencies.createCheckoutLink(checkoutRef);
    return jsonResponse({ ...result, requestId }, 200, requestId);
  } catch (error: unknown) {
    if (error instanceof CheckoutPayloadError) {
      return errorResponse(
        requestId,
        502,
        error.code,
        error.message,
        error.retryable,
        "checkout",
      );
    }

    if (error instanceof CheckoutMcpError) {
      return errorResponse(
        requestId,
        502,
        "MCP_CHECKOUT_FAILED",
        error.message,
        error.retryable,
        "mcp-call",
      );
    }

    const message = error instanceof Error ? error.message : "Tutu checkout is unavailable.";
    const isTimeout = /timeout|timed out|time limit/i.test(message);
    return errorResponse(
      requestId,
      isTimeout ? 504 : 502,
      isTimeout ? "MCP_TIMEOUT" : "MCP_CHECKOUT_FAILED",
      isTimeout ? "Tutu checkout timed out. Try again." : "Tutu checkout is unavailable.",
      true,
      "mcp-call",
    );
  }
}

/** Vercel's Fetch API adapter. */
export default {
  fetch(request: Request): Promise<Response> {
    return checkoutHandler(request);
  },
};
