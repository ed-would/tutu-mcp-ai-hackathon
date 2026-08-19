import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../server/mcp/client", () => ({
  connectTutuMcp: vi.fn(),
  closeTutuMcp: vi.fn(),
}));

import { packagesHandler } from "../api/packages";
import { connectTutuMcp } from "../server/mcp/client";

const connectMock = vi.mocked(connectTutuMcp);

function request(body: unknown, headers: Record<string, string> = { "content-type": "application/json" }): Request {
  return new Request("http://localhost/api/packages", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

const valid = {
  intent: {
    origin: "Москва",
    departureDate: "2026-09-10",
    returnDate: "2026-09-13",
    adults: 1,
    hotelPreferences: { breakfast: true, freeCancellation: true, mode: "ignore-me" },
  },
  idea: { city: "Казань" },
  preferences: {},
  sessionSeed: "api-test",
};

describe("packages API boundary", () => {
  beforeEach(() => connectMock.mockReset());

  it("rejects an oversized body before opening MCP", async () => {
    const oversized = JSON.stringify({ ...valid, padding: "x".repeat(17_000) });
    const response = await packagesHandler(new Request("http://localhost/api/packages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: oversized,
    }));
    expect(response.status).toBe(413);
    expect((await response.json()).code).toBe("BODY_TOO_LARGE");
    expect(connectMock).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON/content type before opening MCP and still opens MCP for family parties", async () => {
    const mediaTypeResponse = await packagesHandler(request(valid, { "content-type": "text/plain" }));
    expect(mediaTypeResponse.status).toBe(415);

    const childResponse = await packagesHandler(request({
      ...valid,
      intent: { ...valid.intent, childrenAges: [8] },
    }));
    expect(childResponse.status).not.toBe(422);
    expect(connectMock).toHaveBeenCalled();
  });
});
