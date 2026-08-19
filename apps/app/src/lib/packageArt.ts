export const PACKAGE_SQ_COUNT = 6;

export function packageSqSlot(id: string, index: number): number {
  const seed = id.trim() || String(index);
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const start = Math.abs(hash) % PACKAGE_SQ_COUNT;
  return ((start + index) % PACKAGE_SQ_COUNT) + 1;
}

export function assignPackageSqSlots(ids: readonly string[]): number[] {
  const seed = ids.join("\0") || "packages";
  return ids.map((_, index) => packageSqSlot(seed, index));
}
