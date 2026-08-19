import { describe, expect, it } from "vitest";
import {
  formatRuDate,
  formatRuDateLong,
  formatRuMonthYear,
  monthGrid,
  parseIsoDate,
  toIsoDate,
  WEEKDAYS_RU,
} from "../src/lib/calendar";

describe("Russian calendar helpers", () => {
  it("formats a date as day, short Russian month and year", () => {
    expect(formatRuDate("2026-08-20")).toBe("20 авг 2026");
    expect(formatRuDateLong("2026-08-20")).toBe("20 августа 2026");
    expect(formatRuMonthYear(2026, 7)).toBe("Август 2026");
  });

  it("starts the week on Monday with Russian weekday labels", () => {
    expect([...WEEKDAYS_RU]).toEqual(["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]);
    const days = monthGrid(2026, 7);
    expect(days[0]).toMatchObject({ iso: "2026-07-27", inMonth: false });
    expect(days[5]).toMatchObject({ iso: "2026-08-01", inMonth: true });
    expect(days.find((day) => day.iso === "2026-08-20")?.inMonth).toBe(true);
  });

  it("disables days before the minimum date", () => {
    const days = monthGrid(2026, 7, "2026-08-20");
    expect(days.find((day) => day.iso === "2026-08-19")?.disabled).toBe(true);
    expect(days.find((day) => day.iso === "2026-08-20")?.disabled).toBe(false);
  });

  it("round-trips local ISO dates without UTC shift", () => {
    const parsed = parseIsoDate("2026-01-01");
    expect(parsed).toBeInstanceOf(Date);
    expect(toIsoDate(parsed!)).toBe("2026-01-01");
    expect(parseIsoDate("2026-13-40")).toBeUndefined();
  });
});
