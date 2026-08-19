export const SWIPE_DISTANCE_RATIO = 0.28;
export const SWIPE_VELOCITY_PX_S = 700;

export type SwipeDecision = "like" | "pass" | null;

export function resolveSwipeDecision(offsetX: number, width: number, velocityX: number): SwipeDecision {
  if (!Number.isFinite(offsetX) || !Number.isFinite(velocityX) || !Number.isFinite(width) || width <= 0) {
    return null;
  }
  if (Math.abs(velocityX) >= SWIPE_VELOCITY_PX_S) {
    return velocityX > 0 ? "like" : "pass";
  }
  const threshold = width * SWIPE_DISTANCE_RATIO;
  if (offsetX >= threshold) return "like";
  if (offsetX <= -threshold) return "pass";
  return null;
}

export function threadPullFromOffset(offsetX: number, width: number): number {
  if (!Number.isFinite(offsetX) || !Number.isFinite(width) || width <= 0) return 0;
  return Math.max(-1, Math.min(1, offsetX / (width * 0.5)));
}
