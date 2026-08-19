import { z } from "zod";
import { SourceWarningSchema } from "./common";

export const CheckoutRequestSchema = z.object({
  packageId: z.string().trim().min(1).max(100),
  refs: z.array(z.string().trim().min(1).max(16_384)).min(1).max(8),
});

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
  packageId: z.string().min(1).max(100),
  steps: z.array(CheckoutStepSchema).min(1).max(8),
  warnings: z.array(SourceWarningSchema).max(20).default([]),
});

export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;
