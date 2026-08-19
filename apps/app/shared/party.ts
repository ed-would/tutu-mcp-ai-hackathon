export const MAX_ADULTS = 6;
export const MAX_CHILDREN = 4;
/** Child fare for MCP `children_ages` — UI collects a count, hotels still need ages. */
export const CHILD_FARE_AGE = 8;

export type PartyCounts = {
  adults?: number;
  children: number;
  childrenAges: number[];
};

function readCount(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value.trim());
  return undefined;
}

export function clampAdults(value: number): number {
  return Math.min(MAX_ADULTS, Math.max(1, value));
}

export function clampChildren(value: number): number {
  return Math.min(MAX_CHILDREN, Math.max(0, value));
}

export function childrenAgesFromCount(count: number): number[] {
  return Array.from({ length: clampChildren(count) }, () => CHILD_FARE_AGE);
}

export function partyFromAnswers(answers?: Record<string, unknown>): PartyCounts {
  const adults = readCount(answers?.adults);
  const children = readCount(answers?.children) ?? 0;
  return {
    ...(adults !== undefined && adults >= 1 ? { adults: clampAdults(adults) } : {}),
    children: clampChildren(children),
    childrenAges: childrenAgesFromCount(children),
  };
}
