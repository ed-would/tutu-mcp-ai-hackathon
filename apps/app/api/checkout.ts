import { getRequestId } from "../server/observability/request-id";
import {
  CheckoutMcpError,
  CheckoutPayloadError,
  CheckoutRequestSchema,
  collectCheckoutRefs,
  type CheckoutErrorBody,
  type CheckoutRef,
  type CheckoutStep,
} from "../server/checkout/validation";
import { createCheckoutLink, createCheckoutSteps, toCheckoutStep } from "../server/checkout/service";
import { parseJsonBody } from "../server/http/request";

type CheckoutLinkResult = {
  url: string;
  kind: string;
  fallbackUrl?: string;
  note?: string;
  steps?: CheckoutStep[];
};

type CheckoutDependencies = {
  createCheckoutLink: (checkoutRef: CheckoutRef) => Promise<CheckoutLinkResult>;
  createCheckoutSteps?: (refs: CheckoutRef[]) => Promise<CheckoutLinkResult>;
};

const defaultDependencies: CheckoutDependencies = { createCheckoutLink, createCheckoutSteps };

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

function linkToStep(ref: CheckoutRef, result: CheckoutLinkResult, index: number, total: number): CheckoutStep {
  return result.steps?.[index] ?? toCheckoutStep(ref, result, index, total);
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

  const refs = collectCheckoutRefs(parsed.value);
  if (refs.length === 0) {
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
    if (refs.length > 1 && dependencies.createCheckoutSteps) {
      const result = await dependencies.createCheckoutSteps(refs);
      const steps = result.steps ?? refs.map((ref, index) => linkToStep(ref, result, index, refs.length));
      return jsonResponse({ ...result, steps, requestId }, 200, requestId);
    }

    const steps: CheckoutStep[] = [];
    let first: CheckoutLinkResult | undefined;
    for (const [index, checkoutRef] of refs.entries()) {
      const result = await dependencies.createCheckoutLink(checkoutRef);
      first ??= result;
      steps.push(linkToStep(checkoutRef, result, index, refs.length));
    }
    if (!first || steps.length === 0) {
      return errorResponse(requestId, 502, "MCP_CHECKOUT_FAILED", "Tutu checkout is unavailable.", true, "mcp-call");
    }
    return jsonResponse({ ...first, steps, requestId }, 200, requestId);
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
