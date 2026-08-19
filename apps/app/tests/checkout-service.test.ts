import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../server/mcp/client", () => ({
  connectTutuMcp: vi.fn(),
  closeTutuMcp: vi.fn(),
}));

import { createCheckoutSteps } from "../server/checkout/service";
import { connectTutuMcp, closeTutuMcp } from "../server/mcp/client";

const connectMock = vi.mocked(connectTutuMcp);
const closeMock = vi.mocked(closeTutuMcp);

function linkPayload(url: string) {
  return { structuredContent: { checkout_url: url, kind: "deeplink" } };
}

describe("createCheckoutSteps", () => {
  beforeEach(() => {
    connectMock.mockReset();
    closeMock.mockReset();
  });

  it("keeps remaining booking steps when one MCP link fails", async () => {
    const callTool = vi.fn()
      .mockRejectedValueOnce(new Error("outbound down"))
      .mockResolvedValueOnce(linkPayload("https://hotel.tutu.ru/x"));
    connectMock.mockResolvedValue({ client: { callTool } } as never);

    const result = await createCheckoutSteps([
      { transport: "avia", offer_hash: "rt", is_round_trip: true, return_departure_at: "2026-09-13T18:00:00+03:00" },
      { product_type: "hotels", hotel_alias: "volga" },
    ]);

    expect(callTool).toHaveBeenCalledTimes(2);
    expect(result.steps).toEqual([
      expect.objectContaining({ order: 1, product: "hotel", url: "https://hotel.tutu.ru/x" }),
    ]);
    expect(result.url).toBe("https://hotel.tutu.ru/x");
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it("stops after the checkout route budget instead of waiting out every hung ref", async () => {
    const times = [0, 1, 20_000];
    const callTool = vi.fn().mockResolvedValue(linkPayload("https://tutu.ru/avia"));
    connectMock.mockResolvedValue({ client: { callTool } } as never);

    const result = await createCheckoutSteps(
      [{ offer_hash: "out" }, { hotel_alias: "volga" }],
      { now: () => times.shift() ?? 20_000, routeBudgetMs: 20_000 },
    );

    expect(callTool).toHaveBeenCalledTimes(1);
    expect(result.steps).toHaveLength(1);
  });

  it("fails retryably when every checkout ref misses a URL", async () => {
    const callTool = vi.fn().mockRejectedValue(new Error("down"));
    connectMock.mockResolvedValue({ client: { callTool } } as never);

    await expect(createCheckoutSteps([{ offer_hash: "a" }])).rejects.toMatchObject({
      name: "CheckoutPayloadError",
      retryable: true,
    });
    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
