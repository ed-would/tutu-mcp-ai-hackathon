import type { HealthDependencyStatus } from "../../shared/contracts/health";

export const DEFAULT_TUTU_MCP_ENDPOINT = "https://mcp.tutu.ru/mcp";

function getRuntimeEnv(): Record<string, string | undefined> {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return runtime.process?.env ?? {};
}

/** Readiness is configuration-only: health checks never call an upstream service. */
export function getLlmStatus(
  env: Record<string, string | undefined> = getRuntimeEnv(),
): HealthDependencyStatus {
  return env.NEURALDEEP_API_KEY?.trim() ? "ok" : "degraded";
}

/** Return ok only for the canonical Tutu MCP host and HTTPS transport. */
export function getMcpStatus(
  env: Record<string, string | undefined> = getRuntimeEnv(),
): HealthDependencyStatus {
  const endpoint = env.TUTU_MCP_ENDPOINT?.trim() || DEFAULT_TUTU_MCP_ENDPOINT;

  try {
    const url = new URL(endpoint);
    const host = url.hostname.toLowerCase();
    const isCanonicalEndpoint =
      url.protocol === "https:" &&
      host === "mcp.tutu.ru" &&
      url.port === "" &&
      url.pathname === "/mcp" &&
      url.username === "" &&
      url.password === "" &&
      url.search === "" &&
      url.hash === "";
    return isCanonicalEndpoint ? "ok" : "degraded";
  } catch {
    return "degraded";
  }
}
