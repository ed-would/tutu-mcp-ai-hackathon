/** A deliberately small, non-sensitive readiness status for an app dependency. */
export type HealthDependencyStatus = "ok" | "degraded";

export type HealthResponse = {
  app: "ok";
  llm: HealthDependencyStatus;
  mcp: HealthDependencyStatus;
  timestamp: string;
  requestId: string;
};
