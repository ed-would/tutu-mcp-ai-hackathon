import { useState, type FormEvent } from "react";
import { promptChips } from "./guideCopy";

export function PromptDemo() {
  const [prompt, setPrompt] = useState("");
  const [rehearsed, setRehearsed] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!prompt.trim()) return;
    setRehearsed(true);
  }

  return (
    <form className="intent-card guide-demo-card guide-ticket" onSubmit={onSubmit}>
      <p className="guide-rehearsal">репетиция · никуда не уйдёт</p>
      <label htmlFor="guide-prompt">Что вы хотите получить от этой поездки?</label>
      <textarea
        id="guide-prompt"
        rows={4}
        value={prompt}
        onChange={(event) => {
          setPrompt(event.target.value);
          setRehearsed(false);
        }}
        placeholder="Например: хочу на несколько дней к морю, хорошую еду и никаких ранних подъёмов"
      />
      <div className="quick-prompts">
        {promptChips.map((chip) => (
          <button
            className={`chip ${prompt === chip ? "guide-chip-on" : ""}`}
            type="button"
            key={chip}
            onClick={() => {
              setPrompt(chip);
              setRehearsed(false);
            }}
          >
            {chip}
          </button>
        ))}
      </div>
      <button className="button button-primary button-wide" type="submit" disabled={!prompt.trim()}>
        {rehearsed ? "Так начинается маршрут" : "Показать возможности"}
        <span aria-hidden="true">→</span>
      </button>
      {rehearsed ? (
        <p className="guide-demo-note" role="status">Дальше появятся живые направления. Здесь мы только пробуем поле.</p>
      ) : null}
    </form>
  );
}
