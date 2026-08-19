import { buildThreadPath, threadEndPoint, type ThreadTone } from "../lib/thread";

type RouteThreadProps = {
  className?: string;
  label?: string;
  pull?: number;
  tone?: ThreadTone;
  reveal?: boolean;
};

export function RouteThread({
  className = "",
  label = "Линия вашего маршрута",
  pull = 0,
  tone = "neutral",
  reveal = true,
}: RouteThreadProps) {
  const path = buildThreadPath(pull);
  const end = threadEndPoint(pull);
  return (
    <svg
      className={`route-thread-art is-${tone} ${reveal ? "is-reveal" : ""} ${className}`.trim()}
      viewBox="0 0 480 88"
      role="img"
      aria-label={label}
      preserveAspectRatio="none"
    >
      <path className="route-thread-shadow" d={path} />
      <path className="route-thread-path" pathLength={1} d={path} />
      <circle className="route-thread-start" cx="8" cy="60" r="6" />
      <circle className="route-thread-stop" cx={end.x} cy={end.y} r="6" />
    </svg>
  );
}
