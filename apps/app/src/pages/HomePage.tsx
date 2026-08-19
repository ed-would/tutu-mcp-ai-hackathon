import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section className="page page-home" aria-labelledby="home-title">
      <div className="hero-copy">
        <p className="eyebrow">спокойный способ выбрать поездку</p>
        <h1 id="home-title">Найдите место, которое ощущается <em>вашим.</em></h1>
        <p className="lede">Расскажите, чего хочется. Мы покажем несколько направлений — и оставим то, ради которого уже хочется собирать вещи.</p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/discover">Начать маршрут <span aria-hidden="true">→</span></Link>
          <Link className="text-link" to="/guide">Как это работает</Link>
        </div>
      </div>
      <aside className="hero-note" aria-label="Как работает Туту Куда">
        <span className="note-number">01</span>
        <p>По одному маленькому решению за раз.</p>
        <span className="note-line" aria-hidden="true" />
        <p className="note-muted">Ваши предпочтения становятся яснее с каждым выбором.</p>
      </aside>
    </section>
  );
}
