import { useState } from "react";
import { checkoutModes } from "./guideCopy";

type Mode = keyof typeof checkoutModes;

export function CheckoutDemo() {
  const [mode, setMode] = useState<Mode>("avia");
  const [done, setDone] = useState<number[]>([]);
  const steps = checkoutModes[mode].steps;

  function toggle(index: number) {
    setDone((current) => current.includes(index)
      ? current.filter((item) => item !== index)
      : [...current, index]);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setDone([]);
  }

  return (
    <div className="checkout-ready guide-demo-card guide-ticket">
      <p className="eyebrow">пример · не открывает Туту</p>
      <strong>Как выглядит переход</strong>
      <div className="guide-mode-row" role="tablist" aria-label="Вид транспорта в примере">
        {(Object.keys(checkoutModes) as Mode[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={mode === key}
            className={`chip ${mode === key ? "guide-chip-on" : ""}`}
            onClick={() => switchMode(key)}
          >
            {checkoutModes[key].label}
          </button>
        ))}
      </div>
      <ol className="guide-check-list">
        {steps.map((label, index) => {
          const checked = done.includes(index);
          return (
            <li key={label}>
              <button
                type="button"
                className={`guide-check ${checked ? "is-done" : ""}`}
                aria-pressed={checked}
                onClick={() => toggle(index)}
              >
                <span className="guide-check-mark" aria-hidden="true">
                  {checked ? <span className="guide-check-tick" /> : String(index + 1).padStart(2, "0")}
                </span>
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="guide-demo-note" role="status">
        {done.length === steps.length
          ? "В продукте после этого откроется tutu.ru. Здесь галочки только для понимания шагов."
          : `Отметьте шаги. Для ${checkoutModes[mode].label.toLowerCase()} их ${steps.length}.`}
      </p>
    </div>
  );
}
