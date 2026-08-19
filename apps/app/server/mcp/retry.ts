const RETRYABLE = /timeout|timed out|network|ECONNRESET|EAI_AGAIN|429|502|503|504/i;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryableMcpError(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    const status = (error as { status?: unknown }).status;
    if (status === 429 || status === 502 || status === 503 || status === 504) return true;
  }
  const message = error instanceof Error ? error.message : String(error);
  return RETRYABLE.test(message);
}

/** One extra attempt for immediately-failed retry-safe MCP errors. */
export async function withMcpRetry<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (!isRetryableMcpError(error)) throw error;
    await sleep(200);
    return run();
  }
}
