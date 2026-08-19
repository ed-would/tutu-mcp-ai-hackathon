import { useState, type FormEvent } from "react";
import { dateChips } from "./guideCopy";
import { PartyPicker } from "../discover/PartyPicker";

export function ClarifyDemo() {
  const [dates, setDates] = useState("");
  const [party, setParty] = useState({ adults: 1, children: 0 });
  const [rehearsed, setRehearsed] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setRehearsed(true);
  }

  return (
    <form className="intent-card clarify-card guide-demo-card guide-ticket" onSubmit={onSubmit}>
      <p className="guide-rehearsal">репетиция · до трёх вопросов</p>
      <label htmlFor="guide-dates">
        Когда вам удобно ехать?
        <input
          id="guide-dates"
          value={dates}
          placeholder="Например, 12–15 сентября"
          onChange={(event) => {
            setDates(event.target.value);
            setRehearsed(false);
          }}
        />
      </label>
      <div className="quick-prompts" aria-label="Подсказки по датам">
        {dateChips.map((chip) => (
          <button
            className={`chip ${dates === chip ? "guide-chip-on" : ""}`}
            type="button"
            key={chip}
            onClick={() => {
              setDates(chip);
              setRehearsed(false);
            }}
          >
            {chip}
          </button>
        ))}
      </div>
      <div className="party-field">
        <p className="party-field-label">Кто едет с вами?</p>
        <PartyPicker
          value={party}
          onChange={(value) => {
            setParty(value);
            setRehearsed(false);
          }}
        />
      </div>
      <button className="button button-primary button-wide" type="submit">
        {rehearsed ? "Ориентиры записаны" : "Показать направления"}
        <span aria-hidden="true">→</span>
      </button>
      {rehearsed ? (
        <p className="guide-demo-note" role="status">В настоящем маршруте после этого появятся восемь открыток.</p>
      ) : null}
    </form>
  );
}
