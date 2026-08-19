import { useState } from "react";
import { estimatedPriceDemo, exactPriceDemo } from "./guideCopy";

const cards = [exactPriceDemo, estimatedPriceDemo];

export function PriceDemo() {
  const [picked, setPicked] = useState<"exact" | "estimated">("exact");

  return (
    <div className="guide-price-list">
      {cards.map((card) => {
        const active = picked === card.kind;
        return (
          <button
            key={card.kind}
            type="button"
            className={`package-card guide-price-card is-${card.kind} ${active ? "is-active" : "is-quiet"}`}
            aria-pressed={active}
            onClick={() => setPicked(card.kind)}
          >
            <div className="package-card-head">
              <span className="package-number">пример · как в Туту</span>
              <span className="price-kind">{card.badge}</span>
            </div>
            <strong className="guide-price-title">{card.title}</strong>
            <div className="package-price">
              {card.amount}
              <small>{card.note}</small>
            </div>
            <div className="package-parts">
              {card.parts.map((part) => (
                <div key={part}>
                  <span>состав</span>
                  <strong>{part}</strong>
                </div>
              ))}
            </div>
          </button>
        );
      })}
      <p className="guide-demo-note" role="status">
        {picked === "exact"
          ? "Точная сумма — текущие предложения на момент сборки. Бронь ещё не начата."
          : "Знак ≈ напоминает: поезд и автобус покупаются двумя билетами. Итог может сдвинуться."}
      </p>
    </div>
  );
}
