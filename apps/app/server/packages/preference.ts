import type { TripPackage } from "./contracts";

const ESTIMATED_NOTE = "Два отдельных билета; цена может измениться";
const PARTIAL_NOTE = "Два отдельных билета или неполный ответ; цена может измениться";

export function packagePriceNote(isPartial: boolean): string {
  return isPartial ? PARTIAL_NOTE : ESTIMATED_NOTE;
}

export function seedUnit(seed: string): number {
  let hash = 2166136261;
  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 2 ** 32;
}

function numericPreferences(preferences: Record<string, unknown>): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const [key, value] of Object.entries(preferences)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      weights[key] = Math.max(-1, Math.min(1, value));
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [innerKey, innerValue] of Object.entries(value as Record<string, unknown>)) {
        if (typeof innerValue === "number" && Number.isFinite(innerValue)) {
          weights[innerKey] = Math.max(-1, Math.min(1, innerValue));
        }
      }
    }
  }
  return weights;
}

function scorePackage(pkg: TripPackage, weights: Record<string, number>): number {
  const mode = pkg.transport.mode.toLocaleLowerCase();
  let score = pkg.role === "optimal" ? 1 : 0.4;
  if (weights[mode] !== undefined) score += weights[mode];
  const price = pkg.price.amount;
  score += price > 0 ? Math.max(0, 1 - price / 200_000) : 0;
  return score;
}

/** 85% relevance, 15% ε-greedy exploration. Same seed → same order. */
export function rankPackages(
  packages: TripPackage[],
  preferences: Record<string, unknown>,
  sessionSeed: string,
): TripPackage[] {
  if (packages.length <= 1) return packages;
  const weights = numericPreferences(preferences);
  const ranked = [...packages].sort((left, right) => {
    const delta = scorePackage(right, weights) - scorePackage(left, weights);
    return delta !== 0 ? delta : left.id.localeCompare(right.id);
  });
  if (seedUnit(sessionSeed) < 0.15 && ranked.length > 1) {
    [ranked[0], ranked[1]] = [ranked[1]!, ranked[0]!];
  }
  return ranked;
}

export function preferenceSummary(preferences: Record<string, unknown>): string | undefined {
  const weights = numericPreferences(preferences);
  const top = Object.entries(weights)
    .filter(([, value]) => value > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([key]) => key);
  if (top.length === 0) return undefined;
  return `вам важны ${top.join(", ")}`;
}
