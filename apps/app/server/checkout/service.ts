import {
  closeTutuMcp,
  connectTutuMcp,
} from "../mcp/client";
import { MCP_DURATION_BUDGETS } from "../mcp/tools";
import { withMcpRetry } from "../mcp/retry";
import type { CheckoutRef, CheckoutResponse, CheckoutStep, CheckoutStepProduct } from "./validation";
import { CheckoutPayloadError, normalizeCheckoutPayload } from "./validation";

/** URL builder is local on Tutu's side — keep this well under the 20s route cap. */
export const CHECKOUT_TIMEOUT_MS = 5_000;
export const CHECKOUT_ROUTE_BUDGET_MS = MCP_DURATION_BUDGETS.routeMs;

type CheckoutLink = Omit<CheckoutResponse, "requestId" | "steps">;

function productOf(ref: CheckoutRef, index: number, total: number): CheckoutStepProduct {
  const kind = String(ref.product_type ?? ref.transport ?? ref.product ?? "").toLowerCase();
  if (kind === "hotels" || kind === "hotel") return "hotel";
  if (kind === "avia" && ref.is_round_trip === true) return "transport_outbound";
  if (total === 2) return index === 0 ? "transport_outbound" : "hotel";
  if (total >= 3) {
    if (index === 0) return "transport_outbound";
    if (index === total - 1 && (kind === "hotels" || kind === "hotel" || kind === "")) return "hotel";
    return "transport_return";
  }
  return kind === "hotels" || kind === "hotel" ? "hotel" : "transport_outbound";
}

function labelOf(product: CheckoutStepProduct, ref: CheckoutRef): string {
  if (product === "hotel") return "Проживание";
  if (product === "transport_return") return "Билет обратно";
  if (ref.is_round_trip === true) return "Билеты туда и обратно";
  return "Билет туда";
}

export function toCheckoutStep(ref: CheckoutRef, link: CheckoutLink, index: number, total: number): CheckoutStep {
  const product = productOf(ref, index, total);
  return {
    order: index + 1,
    label: labelOf(product, ref),
    url: link.url,
    product,
    kind: link.kind,
    ...(link.fallbackUrl ? { fallbackUrl: link.fallbackUrl } : {}),
    ...(link.note ? { note: link.note } : {}),
  };
}

async function callCheckoutLink(
  connection: Awaited<ReturnType<typeof connectTutuMcp>>,
  checkoutRef: CheckoutRef,
): Promise<CheckoutLink> {
  const result = await withMcpRetry(() =>
    connection.client.callTool(
      { name: "create_checkout_link", arguments: checkoutRef },
      { timeout: CHECKOUT_TIMEOUT_MS },
    ),
  );
  return normalizeCheckoutPayload(result);
}

/** Call Tutu's pure URL builder with the exact checkout_ref object. */
export async function createCheckoutLink(checkoutRef: CheckoutRef): Promise<Omit<CheckoutResponse, "requestId">> {
  const built = await createCheckoutSteps([checkoutRef]);
  return built;
}

/** Resolve one or more opaque checkout refs into ordered booking steps. */
export async function createCheckoutSteps(
  refs: CheckoutRef[],
  options: { now?: () => number; routeBudgetMs?: number } = {},
): Promise<Omit<CheckoutResponse, "requestId">> {
  if (refs.length === 0) {
    throw new CheckoutPayloadError("VALIDATION_ERROR", "A valid checkoutRef is required.", false);
  }

  const now = options.now ?? Date.now;
  const routeBudgetMs = options.routeBudgetMs ?? CHECKOUT_ROUTE_BUDGET_MS;
  const started = now();
  let connection: Awaited<ReturnType<typeof connectTutuMcp>> | undefined;
  try {
    connection = await connectTutuMcp();
    const steps: CheckoutStep[] = [];
    for (const [index, ref] of refs.entries()) {
      if (now() - started >= routeBudgetMs) break;
      try {
        const link = await callCheckoutLink(connection, ref);
        steps.push(toCheckoutStep(ref, link, index, refs.length));
      } catch {
        // One failed URL must not drop remaining hotel/return steps.
      }
    }
    const ordered = steps.map((step, index) => ({ ...step, order: index + 1 }));
    const first = ordered[0];
    if (!first) {
      throw new CheckoutPayloadError("MCP_INVALID_RESPONSE", "Tutu returned no checkout or fallback URL.", true);
    }
    return {
      url: first.url,
      kind: first.kind ?? "deeplink",
      ...(first.fallbackUrl ? { fallbackUrl: first.fallbackUrl } : {}),
      ...(first.note ? { note: first.note } : {}),
      steps: ordered,
    };
  } finally {
    try {
      await closeTutuMcp(connection);
    } catch {
      // The per-request transport is best-effort cleanup.
    }
  }
}
