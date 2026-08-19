const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const RETRYABLE = /network|ECONNRESET|EAI_AGAIN|429|502|503|504/i;
const TIMEOUT = /timeout|timed out/i;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function isTimeoutMcpError(error: unknown): boolean {
  return TIMEOUT.test(errorMessage(error));
}

export function isRetryableMcpError(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number" && RETRYABLE_STATUS.has(status)) return true;
  }
  return RETRYABLE.test(errorMessage(error));
}

/**
 * One extra attempt for immediately-failed retry-safe MCP errors.
 * Timeouts already spent the 12s call budget and must not be retried inside the 20s route cap.
 */
export async function withMcpRetry<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (!isRetryableMcpError(error) || isTimeoutMcpError(error)) throw error;
    await sleep(200);
    return run();
  }
}
