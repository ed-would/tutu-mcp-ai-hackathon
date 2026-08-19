import { describe, expect, it } from "vitest";
import { parseJsonBody } from "../server/http/request";
import { methodNotAllowed } from "../server/http/response";
import { InterpretRequestSchema } from "../shared/contracts/intent";

describe("HTTP helpers", () => {
  it("returns safe validation errors with a request id", async () => {
    const result = await parseJsonBody(new Request("http://localhost/api/interpret", { method: "POST", headers: { "content-type": "application/json" }, body: "{bad" }), InterpretRequestSchema, "interpret");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      expect(result.response.headers.get("x-request-id")).toBeTruthy();
      expect(await result.response.json()).toMatchObject({ code: "INVALID_JSON", stage: "interpret" });
    }
  });

  it("rejects oversized bodies before JSON parsing", async () => {
    const result = await parseJsonBody(new Request("http://localhost/api/interpret", { method: "POST", headers: { "content-type": "application/json" }, body: `{"prompt":"${"x".repeat(16_500)}"}` }), InterpretRequestSchema, "interpret");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it("sets an allow header for unsupported methods", async () => {
    const response = methodNotAllowed(new Request("http://localhost/api/interpret", { method: "GET" }), "POST");
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
  });
});
