import { Link } from "react-router-dom";

type WordmarkProps = {
  to?: string;
};

export function Wordmark({ to = "/" }: WordmarkProps) {
  return (
    <Link className="wordmark" to={to} aria-label="Туту Куда? — на главную">
      <img
        className="wordmark-logo"
        src="/logo.png"
        alt="Туту Куда?"
        width={1536}
        height={1024}
        decoding="async"
      />
    </Link>
  );
}
