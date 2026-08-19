import { useMemo, useState, type FormEvent } from "react";
import { DatePicker } from "./DatePicker";
import { PartyPicker } from "./PartyPicker";
import {
  answersFromClarify,
  clarifyFromAnswers,
  minTripDate,
  validateClarify,
  type ClarifyValues,
} from "../../lib/clarify";
import type { TravelIntent } from "../../lib/travel";

type ClarifyFormProps = {
  answers: Record<string, string>;
  draftIntent?: Partial<TravelIntent>;
  busy: boolean;
  error?: string;
  onSubmit: (answers: Record<string, string>) => void;
};

export function ClarifyForm({ answers, draftIntent, busy, error, onSubmit }: ClarifyFormProps) {
  const initial = useMemo(() => clarifyFromAnswers(answers, draftIntent), [answers, draftIntent]);
  const [values, setValues] = useState<ClarifyValues>(initial);
  const [localError, setLocalError] = useState<string | undefined>();
  const minDate = minTripDate();

  function update(patch: Partial<ClarifyValues>) {
    setValues((current) => ({ ...current, ...patch }));
    setLocalError(undefined);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationError = validateClarify(values);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    onSubmit(answersFromClarify(values));
  }

  const displayError = localError ?? error;

  return (
    <form className="clarify-card" onSubmit={handleSubmit}>
      {displayError ? (
        <div className="inline-error" role="alert">
          <strong>Нужно уточнить ответ.</strong>
          <span>{displayError}</span>
        </div>
      ) : null}

      <label htmlFor="clarify-origin">
        Откуда выезжаете?
        <input
          id="clarify-origin"
          type="text"
          value={values.origin}
          placeholder="Город отправления"
          autoComplete="address-level2"
          onChange={(event) => update({ origin: event.target.value })}
          required
        />
      </label>

      <fieldset className="clarify-fieldset">
        <legend>Даты поездки</legend>
        <div className="clarify-date-row">
          <div className="clarify-date-field">
            <label htmlFor="clarify-departure">Выезд</label>
            <DatePicker
              id="clarify-departure"
              min={minDate}
              value={values.departureDate}
              required
              onChange={(departureDate) => update({ departureDate })}
            />
          </div>
          <div className="clarify-date-field">
            <label htmlFor="clarify-return">Возвращение</label>
            <DatePicker
              id="clarify-return"
              align="end"
              min={values.departureDate || minDate}
              value={values.returnDate}
              required
              onChange={(returnDate) => update({ returnDate })}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="clarify-fieldset">
        <legend>Пассажиры</legend>
        <PartyPicker
          value={{ adults: values.adults, children: values.children }}
          onChange={({ adults, children }) => update({ adults, children })}
        />
      </fieldset>

      <label htmlFor="clarify-budget">
        Бюджет на поездку
        <div className="clarify-budget-row">
          <input
            id="clarify-budget"
            inputMode="numeric"
            value={values.budget}
            placeholder="40 000"
            onChange={(event) => update({ budget: event.target.value.replace(/[^\d\s]/g, "") })}
            required
          />
          <span className="clarify-budget-suffix" aria-hidden="true">₽</span>
        </div>
      </label>

      <button className="button button-primary button-wide" type="submit" disabled={busy}>
        {busy ? "Собираем маршрут…" : "Показать 8 направлений"}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
