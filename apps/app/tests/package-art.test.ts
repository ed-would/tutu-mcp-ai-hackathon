import { describe, expect, it } from "vitest";
import { PACKAGE_SQ_COUNT, assignPackageSqSlots, packageSqSlot } from "../src/lib/packageArt";

describe("package square art", () => {
  it("returns a 1–6 slot and stays stable for the same id and index", () => {
    const first = packageSqSlot("kazan-optimal", 0);
    expect(first).toBeGreaterThanOrEqual(1);
    expect(first).toBeLessThanOrEqual(PACKAGE_SQ_COUNT);
    expect(packageSqSlot("kazan-optimal", 0)).toBe(first);
  });

  it("assigns unique art across a four-pack from one seed", () => {
    const ids = ["kazan-optimal", "kazan-fast", "altai-optimal", "altai-comfort"];
    const slots = assignPackageSqSlots(ids);
    expect(slots).toHaveLength(4);
    expect(new Set(slots).size).toBe(4);
    expect(assignPackageSqSlots(ids)).toEqual(slots);
  });
});
