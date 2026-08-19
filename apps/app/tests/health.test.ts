import { describe, expect, it } from "vitest";
import { healthHandler } from "../api/health";
import { getLlmStatus, getMcpStatus } from "../server/observability/readiness";

describe("GET /api/health", () => {
  it("returns safe readiness status and preserves a valid request id", async () => {
    const response = healthHandler(
      new Request("http://localhost/api/health", {
        headers: { "x-request-id": "demo-request-1" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ app: "ok", requestId: "demo-request-1" });
    expect(["ok", "degraded"]).toContain(body.llm);
    expect(["ok", "degraded"]).toContain(body.mcp);
    expect(typeof body.timestamp).toBe("string");
    expect(body.fingerprint.tools).toEqual(expect.arrayContaining(["search_avia", "search_bus", "create_checkout_link"]));
    expect(typeof body.fingerprint.hash).toBe("string");
    expect(body.durations).toMatchObject({ llmMs: 8_000, mcpCallMs: 12_000, routeMs: 20_000 });
    expect(JSON.stringify(body)).not.toContain("NEURALDEEP_API_KEY");
  });

  it("rejects non-GET requests with a safe, correlated error", async () => {
    const response = healthHandler(
      new Request("http://localhost/api/health", { method: "POST" }),
    );
    const body = await response.json();

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET");
    expect(body).toMatchObject({ code: "METHOD_NOT_ALLOWED", requestId: expect.any(String) });
  });
});

describe("health readiness", () => {
  it("uses configuration only and validates the MCP host", () => {
    expect(getLlmStatus({ NEURALDEEP_API_KEY: "secret" })).toBe("ok");
    expect(getLlmStatus({ NEURALDEEP_API_KEY: " " })).toBe("degraded");
    expect(getMcpStatus({ TUTU_MCP_ENDPOINT: "https://mcp.tutu.ru/mcp" })).toBe("ok");
    expect(getMcpStatus({ TUTU_MCP_ENDPOINT: "https://example.com/mcp" })).toBe("degraded");
    expect(getMcpStatus({ TUTU_MCP_ENDPOINT: "https://evil.mcp.tutu.ru/mcp" })).toBe("degraded");
    expect(getMcpStatus({ TUTU_MCP_ENDPOINT: "https://mcp.tutu.ru/other" })).toBe("degraded");
  });
});
