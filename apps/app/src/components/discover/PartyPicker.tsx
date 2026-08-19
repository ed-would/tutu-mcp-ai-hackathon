import { MAX_ADULTS, MAX_CHILDREN, clampAdults, clampChildren } from "../../../shared/party";

export type PartyPickerValue = { adults: number; children: number };

export function PartyPicker({ value, onChange }: { value: PartyPickerValue; onChange: (value: PartyPickerValue) => void }) {
  const adults = clampAdults(value.adults);
  const children = clampChildren(value.children);
  return (
    <div className="party-picker">
      <PartyRow
        title="Взрослые"
        hint="От 12 лет"
        value={adults}
        min={1}
        max={MAX_ADULTS}
        decreaseLabel="Меньше взрослых"
        increaseLabel="Больше взрослых"
        onChange={(next) => onChange({ adults: next, children })}
      />
      {children > 0 ? (
        <PartyRow
          title="Дети"
          hint="До 12 лет"
          value={children}
          min={0}
          max={MAX_CHILDREN}
          decreaseLabel="Меньше детей"
          increaseLabel="Больше детей"
          onChange={(next) => onChange({ adults, children: next })}
        />
      ) : (
        <button className="party-add-child" type="button" onClick={() => onChange({ adults, children: 1 })}>
          <ChildMark />
          Добавить ребёнка
        </button>
      )}
    </div>
  );
}

function PartyRow({ title, hint, value, min, max, decreaseLabel, increaseLabel, onChange }: {
  title: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  decreaseLabel: string;
  increaseLabel: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="party-row">
      <div className="party-row-copy">
        <strong>{title}</strong>
        <span>{hint}</span>
      </div>
      <div className="party-stepper">
        <button type="button" className="party-step" aria-label={decreaseLabel} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
        <span className="party-count">{value}</span>
        <button type="button" className="party-step" aria-label={increaseLabel} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}

function ChildMark() {
  return (
    <svg className="party-child-mark" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="5.2" r="2.4" fill="currentColor" />
      <path d="M6.2 17.2V11.4c0-1.4 1.1-2.6 2.6-2.6h2.4c1.5 0 2.6 1.2 2.6 2.6v5.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}
