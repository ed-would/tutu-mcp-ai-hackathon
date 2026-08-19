import { z } from "zod";
import {
  ClarificationQuestionSchema,
  DestinationIdeaSchema,
  HotelPreferencesSchema,
  InterpretRequestSchema,
  TravelIntentSchema,
  type ClarificationQuestion,
  type DestinationIdea,
  type InterpretRequest,
  type TravelIntent,
} from "../../shared/contracts/intent.js";

export const clarificationQuestionSchema = ClarificationQuestionSchema;
export const hotelPreferencesSchema = HotelPreferencesSchema;
export const travelIntentSchema = TravelIntentSchema;
export const destinationIdeaSchema = DestinationIdeaSchema;

export const generatedReadySchema = z.object({
  status: z.literal("ready"),
  intent: travelIntentSchema,
  ideas: z.array(destinationIdeaSchema).length(8),
});

export const generatedClarificationSchema = z.object({
  status: z.literal("needs_clarification"),
  questions: z.array(clarificationQuestionSchema).min(1).max(3),
  draftIntent: travelIntentSchema.partial(),
});

export const generatedOutputSchema = z.discriminatedUnion("status", [
  generatedReadySchema,
  generatedClarificationSchema,
]);

export const interpretRequestSchema = InterpretRequestSchema;

export type { ClarificationQuestion, DestinationIdea, InterpretRequest, TravelIntent };
export type HotelPreferences = z.infer<typeof hotelPreferencesSchema>;
export type GeneratedReady = z.infer<typeof generatedReadySchema>;
export type GeneratedClarification = z.infer<typeof generatedClarificationSchema>;
export type GeneratedOutput = z.infer<typeof generatedOutputSchema>;
export type InterpretResponse =
  | (GeneratedClarification & { generation?: never })
  | (GeneratedReady & { generation: "llm" | "rule_fallback" });
