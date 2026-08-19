import { describe, expect, it } from "vitest";
import { CheckoutResponseSchema } from "../shared/contracts/checkout";
import { InterpretRequestSchema, InterpretResponseSchema, TravelIntentSchema } from "../shared/contracts/intent";
import { PackagePriceSchema, PackagesResponseSchema } from "../shared/contracts/packages";

const intent = {
  origin: "Москва",
  destination: "Казань",
  departureDate: "2026-09-01",
  returnDate: "2026-09-05",
  adults: 2,
  childrenAges: [],
  pace: "balanced" as const,
  interests: ["еда"],
  desiredVibe: "спокойно и вкусно",
  allowedTransport: ["avia" as const],
  hotelPreferences: { mode: "choose_self" as const },
};

describe("shared contracts", () => {
  it("enforces prompt limit and intent dates", () => {
    expect(InterpretRequestSchema.safeParse({ prompt: "x".repeat(601), locale: "ru-RU" }).success).toBe(false);
    expect(TravelIntentSchema.safeParse(intent).success).toBe(true);
    expect(TravelIntentSchema.safeParse({ ...intent, departureDate: "tomorrow" }).success).toBe(false);
  });

  it("keeps interpret response discriminated", () => {
    expect(InterpretResponseSchema.safeParse({ status: "needs_clarification", questions: [], draftIntent: {} }).success).toBe(true);
    expect(InterpretResponseSchema.safeParse({ status: "ready", intent, ideas: [], generation: "rule_fallback" }).success).toBe(false);
  });

  it("distinguishes exact and estimated package price", () => {
    expect(PackagePriceSchema.safeParse({ confidence: "exact_round_trip", amount: 100, currency: "RUB" }).success).toBe(true);
    expect(PackagePriceSchema.safeParse({ confidence: "estimated_split_trip", amount: 100, currency: "RUB", note: "wrong" }).success).toBe(false);
  });

  it("rejects malformed checkout response", () => {
    expect(CheckoutResponseSchema.safeParse({ packageId: "p", steps: [{ order: 1, label: "Book", url: "https://tutu.ru/x", product: "hotel" }], warnings: [] }).success).toBe(true);
    expect(CheckoutResponseSchema.safeParse({ packageId: "p", steps: [], warnings: [] }).success).toBe(false);
  });
});
