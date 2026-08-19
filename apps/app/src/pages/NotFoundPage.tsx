import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="page page-not-found" aria-labelledby="not-found-title">
      <p className="eyebrow">Route not found</p>
      <h1 id="not-found-title">This path wandered off.</h1>
      <p className="lede">Let’s get you back to the beginning, where the good possibilities are.</p>
      <Link className="button button-primary" to="/">Return home <span aria-hidden="true">→</span></Link>
    </section>
  );
}
