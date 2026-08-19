/** A deliberately small, non-sensitive readiness status for an app dependency. */
export type HealthDependencyStatus = "ok" | "degraded";

export type HealthFingerprint = {
  tools: string[];
  hash: string;
};

export type HealthDurations = {
  llmMs: number;
  mcpCallMs: number;
  routeMs: number;
};

export type HealthResponse = {
  app: "ok";
  llm: HealthDependencyStatus;
  mcp: HealthDependencyStatus;
  timestamp: string;
  requestId: string;
  fingerprint: HealthFingerprint;
  durations: HealthDurations;
};
