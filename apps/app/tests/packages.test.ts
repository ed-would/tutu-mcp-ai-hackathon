import { describe, expect, it } from "vitest";
import { buildPackagesResponse } from "../server/packages/orchestrator";
import { getSearchInputs, type PackagesRequest, type PackageCallResult, type PackageToolName, type TripPackage } from "../server/packages/contracts";
import { rankPackages, seedUnit } from "../server/packages/preference";

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
  return async (name: PackageToolName, args: Record<string, unknown>): Promise<PackageCallResult> => {
    if (name === "search_hotels") {
      const value = values.hotels;
      if (value instanceof Error) throw value;
      return value ?? { structuredContent: { hotels: [] } };
    }
    if (name === "search_avia") {
      const value = values.avia;
      if (value instanceof Error) throw value;
      return value ?? { structuredContent: { offers: [] } };
    }
    if (name === "search_bus") {
      const key = args.origin === "Москва" ? "busOutbound" : "busReturn";
      const value = values[key] ?? values.bus;
      if (value instanceof Error) throw value;
      return value ?? { structuredContent: { offers: [] } };
    }
    const key = args.origin === "Москва" ? "outbound" : "return";
    const value = values[key];
    if (value instanceof Error) throw value;
    return value ?? { structuredContent: { variants: [] } };
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
    expect(result.packages.length).toBeGreaterThanOrEqual(1);
    expect(result.packages[0]?.price).toMatchObject({ confidence: "estimated_split_trip", amount: 44_000 });
    expect(result.packages[0]?.breakdown).toEqual({ transport: 26_000, hotel: 18_000 });
    expect(result.packages[0]?.hotel?.price).toBe(18_000);
    expect(result.packages[0]?.transport.outbound).toMatchObject({ checkout_ref: { offer_hash: "out" } });
    expect(result.packages[0]?.transport.return).toMatchObject({ checkout_ref: { offer_hash: "back" } });
  });

  it("marks avia round-trip plus hotel as exact_round_trip without inventing a second ticket", async () => {
    const result = await buildPackagesResponse(request, {
      now: () => new Date("2026-08-19T12:00:00.000Z"),
      callTool: callMap({
        avia: {
          structuredContent: {
            offers: [{
              product_type: "avia",
              price: { amount: 21_000, currency: "RUB" },
              is_round_trip: true,
              legs: [{ duration_min: 90 }, { duration_min: 95 }],
              checkout_ref: {
                transport: "avia",
                offer_hash: "rt",
                is_round_trip: true,
                return_departure_at: "2026-09-13T18:00:00+03:00",
                passengers_full: 1,
              },
            }],
          },
        },
        hotels: { structuredContent: { hotels: [{ name: "Казань Плаза", best_offer: { price: { amount: 9_000, currency: "RUB" }, checkout_ref: { hotel_alias: "plaza" } } }] } },
      }),
    });
    const exact = result.packages.find((item) => item.price.confidence === "exact_round_trip");
    expect(exact?.price.amount).toBe(30_000);
    expect(exact?.hotel?.price).toBe(9_000);
    expect(exact?.transport.checkoutRef).toMatchObject({ is_round_trip: true, return_departure_at: "2026-09-13T18:00:00+03:00" });
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

  it("does not trust malformed MCP responses and routes family searches away from rail/multitransport", async () => {
    let calls = 0;
    const malformed = await buildPackagesResponse(request, {
      callTool: async () => { calls += 1; return { content: [{ type: "text", text: "not-json" }] }; },
    });
    expect(calls).toBe(4);
    expect(malformed.packages).toEqual([]);
    expect(malformed.warnings.some((warning) => warning.code === "OUTBOUND_UNAVAILABLE" || warning.code === "AVIA_UNAVAILABLE")).toBe(true);

    const familyTools: string[] = [];
    let hotelArgs: Record<string, unknown> = {};
    let aviaArgs: Record<string, unknown> = {};
    const family = await buildPackagesResponse({
      ...request,
      intent: { ...request.intent, childrenAges: [8] },
    }, {
      callTool: async (name, args) => {
        familyTools.push(name);
        if (name === "search_hotels") hotelArgs = args;
        if (name === "search_avia") aviaArgs = args;
        return { structuredContent: { offers: [], hotels: [] } };
      },
    });
    expect(familyTools).toEqual(["search_avia", "search_bus", "search_bus", "search_hotels"]);
    expect(aviaArgs).toMatchObject({ children: 1, return_date: "2026-09-13" });
    expect(hotelArgs.children_ages).toEqual([8]);
    expect(family.warnings.some((warning) => warning.code === "CHILDREN_UNSUPPORTED")).toBe(false);
  });

  it("keeps ranking deterministic for the same session seed", () => {
    const packages: TripPackage[] = [
      { id: "a", role: "optimal", title: "a", destination: "Казань", transport: { mode: "avia" }, price: { confidence: "exact_round_trip", amount: 10, currency: "RUB" }, breakdown: {}, source: "Tutu MCP", updatedAt: "t", timestamp: "t", isPartial: false },
      { id: "b", role: "faster_or_comfortable", title: "b", destination: "Казань", transport: { mode: "bus" }, price: { confidence: "estimated_split_trip", amount: 12, currency: "RUB", note: "~" }, breakdown: {}, source: "Tutu MCP", updatedAt: "t", timestamp: "t", isPartial: false },
    ];
    const first = rankPackages(packages, { bus: 1 }, "stable-seed");
    const second = rankPackages(packages, { bus: 1 }, "stable-seed");
    expect(first.map((item) => item.id)).toEqual(second.map((item) => item.id));
    expect(seedUnit("stable-seed")).toBe(seedUnit("stable-seed"));
  });
});
