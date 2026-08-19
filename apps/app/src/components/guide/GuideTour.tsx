import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { CheckoutDemo } from "./CheckoutDemo";
import { ClarifyDemo } from "./ClarifyDemo";
import { GUIDE_STAGE_COUNT, guideStages } from "./guideCopy";
import { PriceDemo } from "./PriceDemo";
import { PromptDemo } from "./PromptDemo";
import { SafetyDemo } from "./SafetyDemo";
import { hasActiveDiscoverSession } from "./session";
import { SwipeDemo } from "./SwipeDemo";

export function GuideTour() {
  const [stage, setStage] = useState(0);
  const [resume] = useState(() => hasActiveDiscoverSession());
  const reducedMotion = useReducedMotion();
  const current = guideStages[stage] ?? guideStages[0];
  const last = stage >= GUIDE_STAGE_COUNT - 1;
  const pull = stage / Math.max(1, GUIDE_STAGE_COUNT - 1);

  function go(next: number) {
    setStage(Math.max(0, Math.min(GUIDE_STAGE_COUNT - 1, next)));
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(stage + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(stage - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage]);

  return (
    <div className="guide-tour" style={{ "--guide-progress": String(pull) } as CSSProperties}>
      <header className="guide-progress">
        <div className="guide-progress-top">
          <p className="eyebrow">двухминутный гид</p>
          <Link className="text-link" to="/discover">Пропустить гид</Link>
        </div>
        <ol className="guide-stamps" aria-label="Шаги гида">
          {guideStages.map((item, index) => (
            <li key={item.kicker}>
              <button
                type="button"
                className={`guide-stamp ${index === stage ? "is-current" : ""} ${index < stage ? "is-done" : ""}`}
                aria-current={index === stage ? "step" : undefined}
                aria-label={`${item.kicker}. ${item.title}`}
                onClick={() => go(index)}
              >
                {String(index + 1).padStart(2, "0")}
              </button>
            </li>
          ))}
        </ol>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          className="guide-stage"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: reducedMotion ? 0.12 : 0.24, ease: [0.23, 1, 0.32, 1] as const }}
        >
          <div className="guide-copy-head">
            <p className="guide-stage-mark" aria-hidden="true">{String(stage + 1).padStart(2, "0")}</p>
            <p className="eyebrow">{current.kicker}</p>
            <h1 id="guide-title">{current.title}</h1>
          </div>
          <div className="guide-demo">{renderDemo(stage)}</div>
          <p className="lede guide-copy-body">{current.body}</p>
        </motion.div>
      </AnimatePresence>

      <div className="guide-actions">
        <button className="button button-secondary" type="button" onClick={() => go(stage - 1)} disabled={stage === 0}>
          Назад
        </button>
        {last ? (
          <Link className="button button-primary" to="/discover">
            {resume ? "Продолжить маршрут" : "Попробовать со своей поездкой"}
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <button className="button button-primary" type="button" onClick={() => go(stage + 1)}>
            Дальше
            <span aria-hidden="true">→</span>
          </button>
        )}
        {last ? <Link className="text-link guide-home-link" to="/">На главную</Link> : null}
      </div>
    </div>
  );
}

function renderDemo(stage: number) {
  if (stage === 1) return <ClarifyDemo />;
  if (stage === 2) return <SwipeDemo />;
  if (stage === 3) return <PriceDemo />;
  if (stage === 4) return <CheckoutDemo />;
  if (stage === 5) return <SafetyDemo />;
  return <PromptDemo />;
}
