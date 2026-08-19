import { addDaysIso, todayIso } from "./calendar";
import type { TravelIntent } from "./travel";

export type ClarifyValues = {
  origin: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  budget: string;
};

export function defaultClarifyValues(draft?: Partial<TravelIntent>): ClarifyValues {
  return {
    origin: draft?.origin ?? "",
    departureDate: draft?.departureDate ?? "",
    returnDate: draft?.returnDate ?? "",
    adults: draft?.adults ?? 2,
    children: draft?.childrenAges?.length ?? 0,
    budget: draft?.budgetRub ? String(draft.budgetRub) : "",
  };
}

export function clarifyFromAnswers(answers: Record<string, string>, draft?: Partial<TravelIntent>): ClarifyValues {
  const base = defaultClarifyValues(draft);
  const adults = Number(answers.adults);
  const children = Number(answers.children);
  return {
    origin: answers.origin?.trim() || base.origin,
    departureDate: answers.departureDate?.trim() || answers.dateFrom?.trim() || base.departureDate,
    returnDate: answers.returnDate?.trim() || answers.dateTo?.trim() || base.returnDate,
    adults: Number.isFinite(adults) && adults > 0 ? adults : base.adults,
    children: Number.isFinite(children) && children >= 0 ? children : base.children,
    budget: answers.budget?.trim() || base.budget,
  };
}

export function answersFromClarify(values: ClarifyValues): Record<string, string> {
  return {
    origin: values.origin.trim(),
    departureDate: values.departureDate,
    returnDate: values.returnDate,
    adults: String(values.adults),
    children: String(values.children),
    budget: values.budget.replace(/\s/g, ""),
  };
}

export function validateClarify(values: ClarifyValues): string | undefined {
  if (!values.origin.trim()) return "Укажите город отправления.";
  if (!values.departureDate || !values.returnDate) return "Выберите даты выезда и возвращения.";
  if (values.returnDate < values.departureDate) return "Дата возвращения не может быть раньше выезда.";
  if (values.adults < 1) return "Нужен хотя бы один взрослый пассажир.";
  const budget = Number(values.budget.replace(/\s/g, ""));
  if (!Number.isFinite(budget) || budget < 1000) return "Укажите бюджет числом, например 40000.";
  return undefined;
}

export function minTripDate(): string {
  return addDaysIso(todayIso(), 1);
}
