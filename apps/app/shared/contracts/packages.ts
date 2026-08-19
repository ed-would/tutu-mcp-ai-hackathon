import { z } from "zod";
import { DestinationIdeaSchema, TravelIntentSchema } from "./intent";
import { PreferenceVectorSchema, SourceEvidenceSchema, SourceWarningSchema } from "./common";

export const PackagePriceSchema = z.discriminatedUnion("confidence", [
  z.object({ confidence: z.literal("exact_round_trip"), amount: z.number().nonnegative(), currency: z.literal("RUB") }),
  z.object({
    confidence: z.literal("estimated_split_trip"),
    amount: z.number().nonnegative(),
    currency: z.literal("RUB"),
    note: z.literal("Два отдельных билета; цена может измениться"),
  }),
]);

export type PackagePrice = z.infer<typeof PackagePriceSchema>;

export const TripSegmentSchema = z.object({
  kind: z.enum(["transport_outbound", "transport_return", "hotel"]),
  title: z.string().min(1).max(160),
  amount: z.number().nonnegative().optional(),
  currency: z.literal("RUB").optional(),
  checkoutRef: z.string().min(1).max(16_384).optional(),
  sourceTool: z.string().min(1).max(120).optional(),
});

export type TripSegment = z.infer<typeof TripSegmentSchema>;

export const TripPackageSchema = z.object({
  id: z.string().min(1).max(100),
  ideaId: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  mode: z.enum(["avia", "rail", "bus", "multitransport"]),
  price: PackagePriceSchema,
  segments: z.array(TripSegmentSchema).min(1).max(8),
  timestamp: z.string().datetime(),
  source: z.literal("Tutu MCP"),
  isPartial: z.boolean().default(false),
  note: z.string().max(500).optional(),
});

export type TripPackage = z.infer<typeof TripPackageSchema>;

export const PackagesRequestSchema = z.object({
  intent: TravelIntentSchema,
  idea: DestinationIdeaSchema,
  preferences: PreferenceVectorSchema,
  sessionSeed: z.string().trim().min(1).max(128),
});

export type PackagesRequest = z.infer<typeof PackagesRequestSchema>;

export const PackagesResponseSchema = z.object({
  packages: z.array(TripPackageSchema).max(2),
  warnings: z.array(SourceWarningSchema).max(20),
  sources: z.array(SourceEvidenceSchema).max(20),
});

export type PackagesResponse = z.infer<typeof PackagesResponseSchema>;
