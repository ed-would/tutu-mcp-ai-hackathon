import { describe, expect, it } from "vitest";
import { LIKE_WEIGHT, PASS_WEIGHT, clipWeight, nextPreference, preferenceSummary, rankPackages, seedUnit } from "../shared/prefs";

describe("preference weights", () => {
  it("applies like +1 and pass -0.35, then clips to [-1, 1]", () => {
    const liked = nextPreference({}, ["море"], true);
    expect(liked.море).toBe(LIKE_WEIGHT);
    const passed = nextPreference(liked, ["море"], false);
    expect(passed.море).toBe(clipWeight(LIKE_WEIGHT + PASS_WEIGHT));
    const clipped = nextPreference({ море: 0.8 }, ["море", "море"], true);
    expect(clipped.море).toBe(1);
  });

  it("writes a human summary from the strongest positive tags", () => {
    expect(preferenceSummary({ море: 1, еда: 0.4, шумно: -0.35 })).toBe("вам важны море, еда");
    expect(preferenceSummary({})).toBeUndefined();
  });

  it("ranks across liked directions with a stable seed", () => {
    const packages = [
      { id: "kazan-optimal", role: "optimal", transport: { mode: "avia" }, price: { amount: 30_000 } },
      { id: "sochi-fast", role: "faster_or_comfortable", transport: { mode: "bus" }, price: { amount: 18_000 } },
      { id: "kaliningrad-optimal", role: "optimal", transport: { mode: "bus" }, price: { amount: 22_000 } },
    ];
    const first = rankPackages(packages, { bus: 1 }, "stable-seed");
    const second = rankPackages(packages, { bus: 1 }, "stable-seed");
    expect(first.map((item) => item.id)).toEqual(second.map((item) => item.id));
    expect(seedUnit("stable-seed")).toBe(seedUnit("stable-seed"));
  });
});
