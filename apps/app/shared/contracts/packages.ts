import { z } from "zod";
import { SourceEvidenceSchema, SourceWarningSchema } from "./common";

export const PackagePriceSchema = z.discriminatedUnion("confidence", [
  z.object({
    confidence: z.literal("exact_round_trip"),
    amount: z.number().nonnegative(),
    currency: z.literal("RUB"),
  }),
  z.object({
    confidence: z.literal("estimated_split_trip"),
    amount: z.number().nonnegative(),
    currency: z.literal("RUB"),
    note: z.string().min(1).max(200),
  }),
]);

export type PackagePrice = z.infer<typeof PackagePriceSchema>;

export const TripPackageSchema = z.object({
  id: z.string().min(1).max(100),
  ideaId: z.string().min(1).max(80).optional(),
  title: z.string().min(1).max(160),
  destination: z.string().min(1).max(120),
  role: z.enum(["optimal", "faster_or_comfortable"]),
  transport: z.object({
    mode: z.string().min(1).max(80),
    price: z.number().nonnegative().optional(),
    currency: z.string().min(1).max(8).optional(),
    outbound: z.unknown().optional(),
    return: z.unknown().optional(),
    checkoutRef: z.unknown().optional(),
    returnCheckoutRef: z.unknown().optional(),
  }),
  hotel: z.object({
    name: z.string().min(1).max(160),
    price: z.number().nonnegative().optional(),
    currency: z.string().min(1).max(8).optional(),
    nights: z.number().int().positive().optional(),
    checkoutRef: z.unknown().optional(),
  }).optional(),
  price: PackagePriceSchema,
  breakdown: z.object({
    transport: z.number().nonnegative().optional(),
    hotel: z.number().nonnegative().optional(),
  }),
  source: z.literal("Tutu MCP"),
  updatedAt: z.string().datetime(),
  timestamp: z.string().datetime(),
  isPartial: z.boolean(),
});

export type TripPackage = z.infer<typeof TripPackageSchema>;

export const PackagesRequestSchema = z.object({
  intent: z.record(z.string(), z.unknown()),
  idea: z.record(z.string(), z.unknown()),
  preferences: z.record(z.string(), z.unknown()).default({}),
  sessionSeed: z.string().trim().min(1).max(128),
});

export type PackagesRequest = z.infer<typeof PackagesRequestSchema>;

export const PackagesResponseSchema = z.object({
  packages: z.array(TripPackageSchema).max(2),
  warnings: z.array(SourceWarningSchema).max(20),
  sources: z.array(SourceEvidenceSchema).max(20),
  requestId: z.string().min(1).max(128).optional(),
  preferenceSummary: z.string().max(240).optional(),
});

export type PackagesResponse = z.infer<typeof PackagesResponseSchema>;
