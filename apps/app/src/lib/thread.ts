export type ThreadTone = "neutral" | "like" | "pass" | "saved";

export function clampPull(pull: number): number {
  if (!Number.isFinite(pull)) return 0;
  return Math.max(-1, Math.min(1, pull));
}

export function buildThreadPath(pull: number): string {
  const t = clampPull(pull);
  const p = (value: number) => Math.round(value * 10) / 10;
  const endX = p(472 + t * 64);
  const endY = p(38 - t * 20);
  const c1x = p(94 + t * 28);
  const c1y = p(12 - t * 10);
  const c2x = p(126 + t * 16);
  const c2y = p(84 - t * 18);
  const midX = p(214 + t * 40);
  const midY = p(48 - t * 16);
  const sX = p(354 + t * 48);
  const sY = p(12 - t * 8);
  return `M8 60 C${c1x} ${c1y}, ${c2x} ${c2y}, ${midX} ${midY} S${sX} ${sY}, ${endX} ${endY}`;
}

export function threadEndPoint(pull: number): { x: number; y: number } {
  const t = clampPull(pull);
  return { x: 472 + t * 64, y: 38 - t * 20 };
}

export function toneFromPull(pull: number): ThreadTone {
  if (pull > 0.18) return "like";
  if (pull < -0.18) return "pass";
  return "neutral";
}
