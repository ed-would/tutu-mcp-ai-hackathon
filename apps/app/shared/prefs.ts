export const LIKE_WEIGHT = 1;
export const PASS_WEIGHT = -0.35;
export const MAX_LIKED_DIRECTIONS = 3;

export type PreferenceVector = Record<string, number>;

export type RankablePackage = {
  id: string;
  role?: string;
  transport: { mode: string };
  price: { amount: number };
};

export function clipWeight(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-1, Math.min(1, value));
}

export function nextPreference(vector: PreferenceVector, tags: string[], liked: boolean): PreferenceVector {
  const delta = liked ? LIKE_WEIGHT : PASS_WEIGHT;
  return tags.reduce<PreferenceVector>((next, tag) => {
    const key = tag.trim();
    if (!key) return next;
    return { ...next, [key]: clipWeight((next[key] ?? 0) + delta) };
  }, vector);
}

export function numericPreferences(preferences: Record<string, unknown>): PreferenceVector {
  const weights: PreferenceVector = {};
  for (const [key, value] of Object.entries(preferences)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      weights[key] = clipWeight(value);
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [innerKey, innerValue] of Object.entries(value as Record<string, unknown>)) {
        if (typeof innerValue === "number" && Number.isFinite(innerValue)) {
          weights[innerKey] = clipWeight(innerValue);
        }
      }
    }
  }
  return weights;
}

export function topSignals(vector: PreferenceVector, limit = 3): string[] {
  return Object.entries(vector)
    .sort((left, right) => right[1] - left[1])
    .filter(([, value]) => value > 0)
    .slice(0, limit)
    .map(([key]) => key);
}

export function preferenceSummary(preferences: Record<string, unknown>): string | undefined {
  const top = topSignals(numericPreferences(preferences));
  if (top.length === 0) return undefined;
  return `вам важны ${top.join(", ")}`;
}

export function seedUnit(seed: string): number {
  let hash = 2166136261;
  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 2 ** 32;
}

function scorePackage(pkg: RankablePackage, weights: PreferenceVector): number {
  const mode = pkg.transport.mode.toLocaleLowerCase();
  let score = pkg.role === "optimal" ? 1 : 0.4;
  if (weights[mode] !== undefined) score += weights[mode];
  const price = pkg.price.amount;
  score += price > 0 ? Math.max(0, 1 - price / 200_000) : 0;
  return score;
}

/** 85% relevance, 15% ε-greedy exploration. Same seed → same order. */
export function rankPackages<T extends RankablePackage>(
  packages: T[],
  preferences: Record<string, unknown>,
  sessionSeed: string,
): T[] {
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
