import { z } from "zod";

export const SourceWarningSchema = z.object({
  code: z.string().min(1).max(80),
  message: z.string().min(1).max(300),
  source: z.enum(["transport", "hotel", "validation", "mcp"]).optional(),
  stage: z.string().min(1).max(80).optional(),
  retryable: z.boolean().default(false),
});

export type SourceWarning = z.infer<typeof SourceWarningSchema>;

export const SourceEvidenceSchema = z.object({
  source: z.literal("Tutu MCP").optional(),
  tool: z.string().min(1).max(120),
  fetchedAt: z.string().datetime().optional(),
  receivedAt: z.string().datetime().optional(),
  status: z.enum(["ok", "partial", "unavailable", "complete", "failed"]),
  variants: z.number().int().nonnegative().optional(),
});

export type SourceEvidence = z.infer<typeof SourceEvidenceSchema>;

export const ApiErrorSchema = z.object({
  code: z.string().min(1).max(80),
  message: z.string().min(1).max(500),
  retryable: z.boolean(),
  requestId: z.string().min(1).max(128),
  stage: z.enum(["interpret", "packages", "checkout", "mcp-call", "validation", "http", "health"]),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export const PreferenceVectorSchema = z.object({
  interests: z.record(z.string().min(1).max(60), z.number().min(-1).max(1)).default({}),
  pace: z.record(z.string().min(1).max(40), z.number().min(-1).max(1)).default({}),
  budget: z.number().min(-1).max(1).default(0),
  comfort: z.number().min(-1).max(1).default(0),
  transport: z.record(z.string().min(1).max(40), z.number().min(-1).max(1)).default({}),
});

export type PreferenceVector = z.infer<typeof PreferenceVectorSchema>;
