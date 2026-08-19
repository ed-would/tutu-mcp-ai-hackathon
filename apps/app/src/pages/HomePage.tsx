import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section className="page page-home" aria-labelledby="home-title">
      <div className="hero-copy">
        <p className="eyebrow">A calmer way to choose a trip</p>
        <h1 id="home-title">Find the place that feels like <em>you.</em></h1>
        <p className="lede">Tell us what you need, meet a few possible trips, and keep the one that makes you want to pack.</p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/discover">Start discovering <span aria-hidden="true">→</span></Link>
          <Link className="text-link" to="/guide">See how it works</Link>
        </div>
      </div>
      <aside className="hero-note" aria-label="How Travel Tinder works">
        <span className="note-number">01</span>
        <p>One small decision at a time.</p>
        <span className="note-line" aria-hidden="true" />
        <p className="note-muted">Your preferences get clearer as you go.</p>
      </aside>
    </section>
  );
}
