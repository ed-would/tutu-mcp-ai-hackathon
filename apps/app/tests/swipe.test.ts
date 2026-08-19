import { describe, expect, it } from "vitest";
import { resolveSwipeDecision, threadPullFromOffset } from "../src/lib/swipe";
import { buildThreadPath, threadEndPoint, toneFromPull } from "../src/lib/thread";

describe("swipe physics", () => {
  it("accepts a 28 percent offset as a decision", () => {
    expect(resolveSwipeDecision(360 * 0.28, 360, 0)).toBe("like");
    expect(resolveSwipeDecision(-360 * 0.28, 360, 0)).toBe("pass");
    expect(resolveSwipeDecision(90, 360, 0)).toBeNull();
  });

  it("accepts a fast flick even before the distance threshold", () => {
    expect(resolveSwipeDecision(24, 360, 700)).toBe("like");
    expect(resolveSwipeDecision(-12, 360, -800)).toBe("pass");
  });
});

describe("route thread", () => {
  it("stretches the destination point toward the swipe edge", () => {
    expect(threadPullFromOffset(180, 360)).toBe(1);
    expect(threadEndPoint(1).x).toBeGreaterThan(threadEndPoint(0).x);
    expect(threadEndPoint(-1).x).toBeLessThan(threadEndPoint(0).x);
    expect(buildThreadPath(0.5)).toContain("S");
    expect(toneFromPull(0.4)).toBe("like");
    expect(toneFromPull(-0.4)).toBe("pass");
  });
});
