import { describe, expect, it } from "vitest";
import { answersFromClarify, clarifyFromAnswers, validateClarify } from "../src/lib/clarify";

describe("clarify form helpers", () => {
  it("serializes structured passenger and date answers", () => {
    expect(answersFromClarify({
      origin: "Москва",
      departureDate: "2026-09-12",
      returnDate: "2026-09-15",
      adults: 2,
      children: 1,
      budget: "40 000",
    })).toEqual({
      origin: "Москва",
      departureDate: "2026-09-12",
      returnDate: "2026-09-15",
      adults: "2",
      children: "1",
      budget: "40000",
    });
  });

  it("restores values from stored answers", () => {
    expect(clarifyFromAnswers({
      origin: "Казань",
      departureDate: "2026-10-01",
      returnDate: "2026-10-05",
      adults: "3",
      children: "2",
      budget: "90000",
    })).toMatchObject({
      origin: "Казань",
      departureDate: "2026-10-01",
      returnDate: "2026-10-05",
      adults: 3,
      children: 2,
      budget: "90000",
    });
  });

  it("rejects invalid date order and budget", () => {
    expect(validateClarify({
      origin: "Москва",
      departureDate: "2026-09-15",
      returnDate: "2026-09-12",
      adults: 2,
      children: 0,
      budget: "40000",
    })).toMatch(/возвращения/i);

    expect(validateClarify({
      origin: "Москва",
      departureDate: "2026-09-12",
      returnDate: "2026-09-15",
      adults: 2,
      children: 0,
      budget: "100",
    })).toMatch(/бюджет/i);
  });
});
