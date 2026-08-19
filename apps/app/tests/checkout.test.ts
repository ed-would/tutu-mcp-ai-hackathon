import { describe, expect, it, vi } from "vitest";
import { checkoutHandler } from "../api/checkout";
import {
  isAllowedTutuUrl,
  normalizeCheckoutPayload,
} from "../server/checkout/validation";

function request(body: unknown): Request {
  return new Request("http://localhost/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("checkout URL trust boundary", () => {
  it.each([
    "https://evil.example/tutu",
    "http://tutu.ru/order",
    "https://user:pass@tutu.ru/order",
    "https://tutu.ru:8443/order",
    "https://tutu.ru.evil.example/order",
  ])("rejects malicious or non-HTTPS URL %s", (url) => {
    expect(isAllowedTutuUrl(url)).toBe(false);
    expect(() => normalizeCheckoutPayload({ checkout_url: url })).toThrow(
      "invalid checkout URL",
    );
  });

  it("preserves the opaque checkout URL byte-for-byte", () => {
    const url = "https://www.tutu.ru/order/%2fA?b=2&a=%2B#keep";
    const normalized = normalizeCheckoutPayload({ checkout_url: url, kind: "deeplink" });
    expect(normalized.url).toBe(url);
  });

  it("parses a JSON text content block when structuredContent is absent", () => {
    const normalized = normalizeCheckoutPayload({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            checkout_url: "https://tutu.ru/order?opaque=%2F",
            kind: "deeplink",
          }),
        },
      ],
    });
    expect(normalized.url).toBe("https://tutu.ru/order?opaque=%2F");
  });

  it.each(["search_redirect", "hotel_page", "order_url", "seats_url"])(
    "accepts fallback kind %s as a success",
    (kind) => {
      const response = normalizeCheckoutPayload({
        checkout_url: "https://tutu.ru/search?x=1",
        kind,
        fallback_url: "https://hotel.tutu.ru/rooms?x=2",
        fallback_note: "Choose an offer on Tutu.",
      });
      expect(response.kind).toBe(kind);
      expect(response.fallbackUrl).toBe("https://hotel.tutu.ru/rooms?x=2");
      expect(response.note).toBe("Choose an offer on Tutu.");
    },
  );
});

describe("POST /api/checkout", () => {
  it("passes checkoutRef verbatim to the dependency", async () => {
    const createCheckoutLink = vi.fn().mockResolvedValue({
      url: "https://tutu.ru/order?z=1&x=%2F",
      kind: "deeplink",
    });
    const checkoutRef = {
      transport: "avia",
      offer_hash: "opaque/hash",
      search_results_url: "https://avia.tutu.ru/search?a=1",
    };
    const response = await checkoutHandler(request({ checkoutRef }), { createCheckoutLink });

    expect(response.status).toBe(200);
    expect(createCheckoutLink).toHaveBeenCalledWith(checkoutRef);
    await expect(response.json()).resolves.toMatchObject({
      url: "https://tutu.ru/order?z=1&x=%2F",
      kind: "deeplink",
    });
  });

  it("rejects malformed request bodies", async () => {
    const response = await checkoutHandler(request({ checkoutRef: "not-an-object" }), {
      createCheckoutLink: vi.fn(),
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "VALIDATION_ERROR",
      stage: "checkout",
    });
  });

  it("rejects an oversized raw body even with a misleading Content-Length", async () => {
    const createCheckoutLink = vi.fn();
    const oversized = JSON.stringify({ checkoutRef: { transport: "avia", padding: "x".repeat(16_500) } });
    const response = await checkoutHandler(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json", "content-length": "1" },
        body: oversized,
      }),
      { createCheckoutLink },
    );

    expect(response.status).toBe(413);
    expect(createCheckoutLink).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      code: "BODY_TOO_LARGE",
      stage: "checkout",
      retryable: false,
    });
  });
});
