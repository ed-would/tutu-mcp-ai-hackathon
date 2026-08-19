import { z } from "zod";
import { PreferenceVectorSchema } from "./common";

const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD dates.");

export const HotelPreferencesSchema = z.object({
  breakfast: z.boolean().optional(),
  freeCancellation: z.boolean().optional(),
  beds: z.number().int().min(1).max(10).optional(),
  mode: z.enum(["choose_self", "explicit"]).default("choose_self"),
  propertyType: z.string().max(80).optional(),
});

export type HotelPreferences = z.infer<typeof HotelPreferencesSchema>;

export const TravelIntentSchema = z.object({
  origin: z.string().trim().min(1).max(120),
  destination: z.string().trim().min(1).max(120).optional(),
  departureDate: DateSchema,
  returnDate: DateSchema,
  adults: z.number().int().min(1).max(12),
  childrenAges: z.array(z.number().int().min(0).max(17)).max(12).default([]),
  budgetRub: z.number().int().positive().max(100_000_000).optional(),
  pace: z.enum(["slow", "balanced", "active"]).default("balanced"),
  interests: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
  desiredVibe: z.string().trim().min(1).max(160),
  allowedTransport: z.array(z.enum(["avia", "rail", "bus", "multitransport"])).min(1).max(4),
  hotelPreferences: HotelPreferencesSchema.default({ mode: "choose_self" }),
});

export type TravelIntent = z.infer<typeof TravelIntentSchema>;

export const DestinationIdeaSchema = z.object({
  id: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(120),
  destination: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(500),
  tags: z.array(z.string().trim().min(1).max(60)).max(12),
  vibe: z.string().trim().min(1).max(120),
  imageUrl: z.string().url().optional(),
});

export type DestinationIdea = z.infer<typeof DestinationIdeaSchema>;

export const ClarificationQuestionSchema = z.object({
  id: z.string().trim().min(1).max(60),
  prompt: z.string().trim().min(1).max(240),
  options: z.array(z.string().trim().min(1).max(100)).max(8).optional(),
});

export type ClarificationQuestion = z.infer<typeof ClarificationQuestionSchema>;

export const InterpretRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(600),
  answers: z.record(z.string().max(60), z.union([z.string().max(240), z.array(z.string().max(120)).max(8)])).optional(),
  locale: z.literal("ru-RU").default("ru-RU"),
});

export type InterpretRequest = z.infer<typeof InterpretRequestSchema>;

export const InterpretResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("needs_clarification"),
    questions: z.array(ClarificationQuestionSchema).max(3),
    draftIntent: TravelIntentSchema.partial(),
  }),
  z.object({
    status: z.literal("ready"),
    intent: TravelIntentSchema,
    ideas: z.array(DestinationIdeaSchema).length(8),
    generation: z.enum(["llm", "rule_fallback"]),
  }),
]);

export type InterpretResponse = z.infer<typeof InterpretResponseSchema>;

export { PreferenceVectorSchema };
