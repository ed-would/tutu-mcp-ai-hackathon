export const TUTU_MCP_TOOLS = [
  "search_avia",
  "search_bus",
  "search_hotels",
  "search_multitransport",
  "create_checkout_link",
] as const;

export const MCP_DURATION_BUDGETS = {
  llmMs: 8_000,
  mcpCallMs: 12_000,
  routeMs: 20_000,
} as const;

export type TutuMcpToolName = (typeof TUTU_MCP_TOOLS)[number];

/** Config-only fingerprint of the tools this app is allowed to call. */
export function mcpToolFingerprint(tools: readonly string[] = TUTU_MCP_TOOLS): { tools: string[]; hash: string } {
  const normalized = [...tools].sort();
  let hash = 2166136261;
  for (const character of normalized.join("\n")) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return { tools: [...TUTU_MCP_TOOLS], hash: (hash >>> 0).toString(16).padStart(8, "0") };
}
