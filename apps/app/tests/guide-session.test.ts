import { describe, expect, it } from "vitest";
import { DISCOVER_SESSION_KEY, hasActiveDiscoverSession } from "../src/components/guide/session";

function memoryStorage(value: string | null): Pick<Storage, "getItem"> {
  return {
    getItem(key: string) {
      return key === DISCOVER_SESSION_KEY ? value : null;
    },
  };
}

describe("hasActiveDiscoverSession", () => {
  it("returns false when storage is empty", () => {
    expect(hasActiveDiscoverSession(memoryStorage(null))).toBe(false);
  });

  it("returns false for an intent-only session with an empty prompt", () => {
    expect(hasActiveDiscoverSession(memoryStorage(JSON.stringify({ phase: "intent", prompt: "" })))).toBe(false);
  });

  it("returns true when the prompt is already filled", () => {
    expect(hasActiveDiscoverSession(memoryStorage(JSON.stringify({ phase: "intent", prompt: "хочу к морю" })))).toBe(true);
  });

  it("returns true for a mid-deck session", () => {
    expect(hasActiveDiscoverSession(memoryStorage(JSON.stringify({ phase: "deck", prompt: "" })))).toBe(true);
  });

  it("returns false for invalid JSON", () => {
    expect(hasActiveDiscoverSession(memoryStorage("{not-json"))).toBe(false);
  });
});
