import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatRuDate,
  formatRuDateLong,
  formatRuMonthYear,
  monthGrid,
  parseIsoDate,
  shiftMonth,
  todayIso,
  WEEKDAYS_RU,
} from "../../lib/calendar";

type DatePickerProps = {
  id: string;
  value: string;
  min?: string;
  required?: boolean;
  align?: "start" | "end";
  onChange: (value: string) => void;
};

export function DatePicker({ id, value, min, required, align = "start", onChange }: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const initialView = parseIsoDate(value) ?? parseIsoDate(min ?? "") ?? new Date();
  const [view, setView] = useState({ year: initialView.getFullYear(), month: initialView.getMonth() });
  const today = todayIso();
  const days = useMemo(() => monthGrid(view.year, view.month, min), [view.year, view.month, min]);
  const prev = shiftMonth(view.year, view.month, -1);
  const next = shiftMonth(view.year, view.month, 1);
  const prevDisabled = Boolean(
    min && monthGrid(prev.year, prev.month, min).filter((day) => day.inMonth).every((day) => day.disabled),
  );
  const todayDisabled = Boolean(min && today < min);

  useEffect(() => {
    if (!open) return;
    const source = parseIsoDate(value) ?? parseIsoDate(min ?? "") ?? new Date();
    setView({ year: source.getFullYear(), month: source.getMonth() });
  }, [open, value, min]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function pick(iso: string) {
    onChange(iso);
    setOpen(false);
  }

  return (
    <div className="date-picker" ref={rootRef}>
      <button
        id={id}
        type="button"
        className={`date-picker-trigger ${value ? "" : "is-empty"}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={value ? formatRuDateLong(value) : "Выберите дату"}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{value ? formatRuDate(value) : "ДД мес ГГГГ"}</span>
        <CalendarMark />
      </button>
      {open ? (
        <div
          className={`date-picker-popover ${align === "end" ? "is-end" : ""}`}
          role="dialog"
          aria-label="Календарь"
        >
          <div className="date-picker-header">
            <p className="date-picker-month">{formatRuMonthYear(view.year, view.month)}</p>
            <div className="date-picker-nav">
              <button
                type="button"
                className="date-picker-shift"
                aria-label="Предыдущий месяц"
                disabled={prevDisabled}
                onClick={() => setView(prev)}
              >
                ‹
              </button>
              <button
                type="button"
                className="date-picker-shift"
                aria-label="Следующий месяц"
                onClick={() => setView(next)}
              >
                ›
              </button>
            </div>
          </div>
          <div className="date-picker-weekdays" aria-hidden="true">
            {WEEKDAYS_RU.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="date-picker-grid">
            {days.map((day) => {
              const selectedDay = day.iso === value;
              const todayDay = day.iso === today;
              return (
                <button
                  key={day.iso}
                  type="button"
                  className={[
                    "date-picker-day",
                    day.inMonth ? "" : "is-outside",
                    selectedDay ? "is-selected" : "",
                    todayDay ? "is-today" : "",
                  ].filter(Boolean).join(" ")}
                  disabled={day.disabled}
                  aria-current={todayDay ? "date" : undefined}
                  aria-pressed={selectedDay}
                  onClick={() => pick(day.iso)}
                >
                  {day.day}
                </button>
              );
            })}
          </div>
          <div className="date-picker-footer">
            <button
              type="button"
              className="date-picker-action"
              disabled={required && !value}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Очистить
            </button>
            <button
              type="button"
              className="date-picker-action"
              disabled={todayDisabled}
              onClick={() => pick(today)}
            >
              Сегодня
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CalendarMark() {
  return (
    <svg className="date-picker-mark" viewBox="0 0 20 20" aria-hidden="true">
      <rect x="3" y="4.5" width="14" height="12.5" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 8.2h14M7 3.2v2.6M13 3.2v2.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}
