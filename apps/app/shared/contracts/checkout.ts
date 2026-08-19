import { z } from "zod";
import { SourceWarningSchema } from "./common.js";

const CheckoutRefSchema = z
  .record(z.string(), z.unknown())
  .refine((value) => Object.keys(value).length > 0, "checkoutRef must not be empty");

export const CheckoutRequestSchema = z
  .object({
    checkoutRef: CheckoutRefSchema.optional(),
    checkout_ref: CheckoutRefSchema.optional(),
    refs: z.array(CheckoutRefSchema).min(1).max(8).optional(),
  })
  .strict();

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

export const CheckoutStepSchema = z.object({
  order: z.number().int().min(1).max(8),
  label: z.string().min(1).max(160),
  url: z.string().url(),
  product: z.enum(["transport_outbound", "transport_return", "hotel"]),
  kind: z.string().min(1).max(120).optional(),
  fallbackUrl: z.string().url().optional(),
  note: z.string().max(500).optional(),
});

export type CheckoutStep = z.infer<typeof CheckoutStepSchema>;

export const CheckoutResponseSchema = z.object({
  url: z.string().url(),
  kind: z.string().min(1).max(120),
  fallbackUrl: z.string().url().optional(),
  note: z.string().max(500).optional(),
  requestId: z.string().min(1).max(128).optional(),
  steps: z.array(CheckoutStepSchema).min(1).max(8),
  warnings: z.array(SourceWarningSchema).max(20).optional(),
});

export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;
