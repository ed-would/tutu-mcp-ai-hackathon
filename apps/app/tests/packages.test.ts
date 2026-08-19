import { describe, expect, it } from "vitest";
import { buildPackagesResponse } from "../server/packages/orchestrator";
import { getSearchInputs, type PackagesRequest, type PackageCallResult } from "../server/packages/contracts";

const request: PackagesRequest = {
  intent: {
    origin: "Москва",
    departureDate: "2026-09-10",
    returnDate: "2026-09-13",
    adults: 1,
  },
  idea: { city: "Казань", title: "Казань" },
  preferences: {},
  sessionSeed: "fixture-seed",
};

function callMap(values: Record<string, PackageCallResult | Error>) {
  return async (name: "search_multitransport" | "search_hotels", args: Record<string, unknown>): Promise<PackageCallResult> => {
    if (name === "search_hotels") {
      const value = values.hotels;
      if (value instanceof Error) throw value;
      return value;
    }
    const key = args.origin === "Москва" ? "outbound" : "return";
    const value = values[key];
    if (value instanceof Error) throw value;
    return value;
  };
}

describe("package MCP orchestration", () => {
  it("whitelists hotel search preferences and maps safe aliases", () => {
    const inputs = getSearchInputs({
      ...request,
      intent: {
        ...request.intent,
        hotelPreferences: { breakfast: true, freeCancellation: true, mode: "must-not-pass", propertyType: "ignored" },
      },
    });
    expect("error" in inputs).toBe(false);
    if ("error" in inputs) return;
    expect(inputs.hotelPreferences).toEqual({ breakfast_included: true, free_cancellation: true });
  });

  it("combines outbound and return transport with whole-stay hotel total", async () => {
    const result = await buildPackagesResponse(request, {
      now: () => new Date("2026-08-19T12:00:00.000Z"),
      callTool: callMap({
        outbound: { structuredContent: { variants: [{ product_type: "avia", price: { amount: 12_000, currency: "RUB" }, checkout_ref: { offer_hash: "out" } }] } },
        return: { structuredContent: { variants: [{ product_type: "avia", price: { amount: 14_000, currency: "RUB" }, checkout_ref: { offer_hash: "back" } }] } },
        hotels: { structuredContent: { hotels: [{ name: "Отель Волга", stay: { nights: 3 }, best_offer: { price: { amount: 18_000, currency: "RUB" }, checkout_ref: { hotel_alias: "volga" } } }] } },
      }),
    });
    expect(result.warnings).toEqual([]);
    expect(result.packages).toHaveLength(1);
    expect(result.packages[0]?.price).toMatchObject({ confidence: "estimated_split_trip", amount: 44_000 });
    expect(result.packages[0]?.breakdown).toEqual({ transport: 26_000, hotel: 18_000 });
    expect(result.packages[0]?.hotel?.price).toBe(18_000);
    expect(result.packages[0]?.transport.outbound).toMatchObject({ checkout_ref: { offer_hash: "out" } });
    expect(result.packages[0]?.transport.return).toMatchObject({ checkout_ref: { offer_hash: "back" } });
  });

  it("returns a usable honest partial package when the return leg fails", async () => {
    const result = await buildPackagesResponse(request, {
      callTool: callMap({
        outbound: { content: [{ type: "text", text: JSON.stringify({ variants: [{ mode: "bus", price: 3_000 }] }) }] },
        return: new Error("upstream timeout"),
        hotels: { structuredContent: { hotels: [{ name: "Кама", best_offer: { price: { amount: 5_000 } } }] } },
      }),
    });
    expect(result.warnings.some((warning) => warning.code === "RETURN_UNAVAILABLE")).toBe(true);
    expect(result.packages[0]?.price.confidence).toBe("estimated_split_trip");
    expect(result.packages[0]?.price.note).toContain("неполный");
  });

  it("does not trust malformed MCP responses or call adult-only search for children", async () => {
    let calls = 0;
    const malformed = await buildPackagesResponse(request, {
      callTool: async () => { calls += 1; return { content: [{ type: "text", text: "not-json" }] }; },
    });
    expect(calls).toBe(3);
    expect(malformed.packages).toEqual([]);
    expect(malformed.warnings.some((warning) => warning.code === "OUTBOUND_UNAVAILABLE")).toBe(true);

    let familyCalls = 0;
    const family = await buildPackagesResponse({
      ...request,
      intent: { ...request.intent, childrenAges: [8] },
    }, { callTool: async () => { familyCalls += 1; return {}; } });
    expect(familyCalls).toBe(0);
    expect(family.warnings[0]).toMatchObject({ code: "CHILDREN_UNSUPPORTED", source: "validation" });
  });
});
