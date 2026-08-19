import { describe, expect, it, vi } from "vitest";
import { isRetryableMcpError, withMcpRetry } from "../server/mcp/retry";

describe("MCP retry", () => {
  it("retries once on immediate 429/5xx and not on validation errors", async () => {
    const flaky = vi.fn()
      .mockRejectedValueOnce({ status: 429 })
      .mockResolvedValueOnce("ok");
    await expect(withMcpRetry(flaky)).resolves.toBe("ok");
    expect(flaky).toHaveBeenCalledTimes(2);

    const invalid = vi.fn().mockRejectedValue(new Error("VALIDATION_ERROR"));
    await expect(withMcpRetry(invalid)).rejects.toThrow("VALIDATION_ERROR");
    expect(invalid).toHaveBeenCalledTimes(1);
  });

  it("does not retry after a spent call timeout", async () => {
    const timedOut = vi.fn().mockRejectedValue(new Error("MCP timed out"));
    await expect(withMcpRetry(timedOut)).rejects.toThrow("timed out");
    expect(timedOut).toHaveBeenCalledTimes(1);
  });

  it("treats 429 and 503 as retry-safe", () => {
    expect(isRetryableMcpError({ status: 429 })).toBe(true);
    expect(isRetryableMcpError({ status: 503 })).toBe(true);
    expect(isRetryableMcpError(new Error("bad payload"))).toBe(false);
  });
});
