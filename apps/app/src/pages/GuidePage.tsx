import { Link } from "react-router-dom";

const steps = [
  ["01", "Опишите ощущение", "Расскажите своими словами, какой отдых сейчас нужен."],
  ["02", "Оставьте то, что цепляет", "Отмечайте направления, которые откликаются. Выбор помогает увидеть ваш ритм."],
  ["03", "Выберите с контекстом", "Смотрите дорогу, проживание и ориентир по цене до перехода на Туту."],
];

export function GuidePage() {
  return (
    <section className="page page-guide" aria-labelledby="guide-title">
      <div className="page-intro">
        <h1 id="guide-title">Поездка может начаться с ощущения.</h1>
        <p className="lede">Туту Куда? превращает его в короткий список, с которым легко принять решение.</p>
      </div>
      <ol className="guide-steps">
        {steps.map(([number, title, body]) => (
          <li className="guide-step" key={number}>
            <span className="step-number">{number}</span>
            <div><h2>{title}</h2><p>{body}</p></div>
          </li>
        ))}
      </ol>
      <div className="guide-callout">
        <p className="eyebrow">важная деталь</p>
        <p>Стоимость помечена как точная или ориентировочная. Бронирование и оплата всегда продолжаются на Туту.</p>
      </div>
      <Link className="button button-primary" to="/discover">Попробовать со своей поездкой <span aria-hidden="true">→</span></Link>
    </section>
  );
}
