import { afterEach, describe, expect, it, vi } from "vitest";
import {
  checkoutRefsOf,
  getCheckout,
  getPackages,
  nextPreference,
  transportLabel,
  transportModeLabel,
  type DestinationIdea,
  type PackageOption,
} from "../src/lib/travel";

const idea: DestinationIdea = {
  id: "idea-1",
  destination: "Казань",
  title: "Казань",
  summary: "Город у воды",
  tags: ["еда"],
  vibe: "спокойно",
};

describe("travel client helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps transport modes to Russian uppercase labels", () => {
    expect(transportModeLabel("avia")).toBe("АВИА");
    expect(transportModeLabel("rail")).toBe("ПОЕЗД");
    expect(transportLabel({ mode: "avia" })).toBe("АВИА");
    expect(transportLabel({ mode: "bus", title: "Автобус" })).toBe("АВТОБУС");
  });

  it("collects distinct checkout refs for a split trip", () => {
    const item: PackageOption = {
      id: "kazan-optimal",
      transport: { mode: "bus", checkoutRef: { offer_hash: "out" }, returnCheckoutRef: { offer_hash: "back" } },
      hotel: { name: "Волга", checkoutRef: { hotel_alias: "volga" } },
      checkoutRef: { offer_hash: "out" },
    };
    expect(checkoutRefsOf(item)).toEqual([
      { offer_hash: "out" },
      { offer_hash: "back" },
      { hotel_alias: "volga" },
    ]);
  });

  it("sends childrenAges and the preference vector to packages", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ packages: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await getPackages(
      idea,
      { origin: "Москва", departureDate: "2026-09-10", returnDate: "2026-09-13", adults: 2, childrenAges: [8] },
      "seed",
      nextPreference({}, idea, true),
    );
    const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string) as {
      intent: { childrenAges: number[] };
      preferences: Record<string, number>;
    };
    expect(body.intent.childrenAges).toEqual([8]);
    expect(body.preferences).toEqual({ еда: 1 });
  });

  it("asks checkout for ordered refs instead of a single handle", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://tutu.ru/x", kind: "deeplink", steps: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await getCheckout([{ offer_hash: "out" }, { hotel_alias: "volga" }]);
    const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string) as { refs: unknown[] };
    expect(body.refs).toHaveLength(2);
  });
});
