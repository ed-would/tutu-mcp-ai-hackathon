import {
  closeTutuMcp,
  connectTutuMcp,
} from "../mcp/client";
import type { CheckoutRef } from "./validation";
import { normalizeCheckoutPayload } from "./validation";

export const CHECKOUT_TIMEOUT_MS = 12_000;

/** Call Tutu's pure URL builder with the exact checkout_ref object. */
export async function createCheckoutLink(checkoutRef: CheckoutRef): Promise<
  Omit<import("./validation").CheckoutResponse, "requestId">
> {
  let connection: Awaited<ReturnType<typeof connectTutuMcp>> | undefined;

  try {
    connection = await connectTutuMcp();
    const result = await connection.client.callTool(
      {
        name: "create_checkout_link",
        arguments: checkoutRef,
      },
      { timeout: CHECKOUT_TIMEOUT_MS },
    );

    return normalizeCheckoutPayload(result);
  } finally {
    // Closing must never replace the original MCP error or successful result.
    try {
      await closeTutuMcp(connection);
    } catch {
      // The per-request transport is best-effort cleanup.
    }
  }
}
