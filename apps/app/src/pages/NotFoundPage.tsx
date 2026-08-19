import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="page page-not-found" aria-labelledby="not-found-title">
      <p className="eyebrow">маршрут оборвался</p>
      <h1 id="not-found-title">Эта тропа никуда не ведёт.</h1>
      <p className="lede">Вернитесь к вопросу «Куда?» — оттуда снова можно выбрать направление.</p>
      <Link className="button button-primary" to="/">На главную <span aria-hidden="true">→</span></Link>
    </section>
  );
}
