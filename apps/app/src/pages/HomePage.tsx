import { Link } from "react-router-dom";
import { HeroPostcard } from "../components/discover/HeroPostcard";
import { RouteThread } from "../components/RouteThread";

export function HomePage() {
  return (
    <section className="page page-home" aria-labelledby="home-title">
      <div className="hero-copy">
        <p className="eyebrow">Туту Куда?</p>
        <h1 id="home-title">Куда вас потянет <em>в этот раз?</em></h1>
        <p className="lede">Опишите поездку своими словами. Свайпы поймут вкус, а Туту соберёт живые варианты — без сравнения десятков вкладок.</p>
        <RouteThread label="Нить от вопроса к маршруту" />
        <div className="hero-actions">
          <Link className="button button-primary" to="/discover">Начать выбирать <span aria-hidden="true">→</span></Link>
          <Link className="text-link" to="/guide">Как это работает</Link>
        </div>
      </div>
      <HeroPostcard />
    </section>
  );
}
