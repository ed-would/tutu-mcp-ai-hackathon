type RouteThreadProps = { className?: string; label?: string };

export function RouteThread({ className = "", label = "Линия вашего маршрута" }: RouteThreadProps) {
  return (
    <svg className={`route-thread-art ${className}`} viewBox="0 0 480 88" role="img" aria-label={label} preserveAspectRatio="none">
      <path className="route-thread-shadow" d="M8 60 C94 12, 126 84, 214 48 S354 12, 472 38" />
      <path className="route-thread-path" d="M8 60 C94 12, 126 84, 214 48 S354 12, 472 38" />
      <circle className="route-thread-start" cx="8" cy="60" r="6" />
      <circle className="route-thread-stop" cx="472" cy="38" r="6" />
    </svg>
  );
}
