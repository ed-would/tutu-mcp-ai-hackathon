import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { resolveSwipeDecision, threadPullFromOffset } from "../../lib/swipe";
import { toneFromPull } from "../../lib/thread";
import { cannedPostcards } from "./guideCopy";

export function SwipeDemo() {
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState("Свайпните открытку или нажмите кнопки. Это учебная карточка.");
  const idea = cannedPostcards[index] ?? cannedPostcards[0];

  function decide(liked: boolean) {
    setNote(liked
      ? "Оставили. Так направление попадает в ваш ритм."
      : "Пропустили. Так и должно быть — не всё обязано цеплять.");
    setIndex((current) => (current + 1) % cannedPostcards.length);
  }

  return (
    <div className="guide-swipe">
      <div className="deck-stack">
        <span className="deck-paper deck-paper-back" aria-hidden="true" />
        <span className="deck-paper deck-paper-mid" aria-hidden="true" />
        <GuidePostcard key={`${idea.destination}-${index}`} idea={idea} onLike={() => decide(true)} onPass={() => decide(false)} />
      </div>
      <div className="deck-actions" aria-label="Оценить учебный вариант">
        <button className="choice-button choice-pass" type="button" onClick={() => decide(false)}>
          <span aria-hidden="true">←</span> Не сейчас
        </button>
        <button className="choice-button choice-like" type="button" onClick={() => decide(true)}>
          Хочу <span aria-hidden="true">→</span>
        </button>
      </div>
      <p className="guide-demo-note" role="status">{note}</p>
    </div>
  );
}

type Idea = (typeof cannedPostcards)[number];

function GuidePostcard({ idea, onLike, onPass }: { idea: Idea; onLike: () => void; onPass: () => void }) {
  const cardRef = useRef<HTMLElement | null>(null);
  const busy = useRef(false);
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const opacity = useMotionValue(1);
  const rotate = useTransform(x, [-220, 0, 220], [-9, 0, 9]);
  const [pull, setPull] = useState(0);
  const tone = toneFromPull(pull);

  useEffect(() => {
    busy.current = false;
    x.set(0);
    opacity.set(1);
    setPull(0);
  }, [idea.destination, idea.title, opacity, x]);

  function widthOfCard() {
    return cardRef.current?.offsetWidth ?? 360;
  }

  function onDrag(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    setPull(threadPullFromOffset(info.offset.x, widthOfCard()));
  }

  async function settle(decision: ReturnType<typeof resolveSwipeDecision>) {
    if (busy.current) return;
    const width = widthOfCard();
    if (!decision) {
      await animate(x, 0, { type: "spring", stiffness: 420, damping: 34 });
      setPull(0);
      return;
    }
    busy.current = true;
    if (reducedMotion) {
      await animate(opacity, 0, { duration: 0.16 });
    } else {
      const direction = decision === "like" ? 1 : -1;
      await animate(x, direction * (width + 96), { type: "spring", stiffness: 420, damping: 34 });
    }
    if (decision === "like") onLike();
    else onPass();
  }

  function onDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    void settle(resolveSwipeDecision(info.offset.x, widthOfCard(), info.velocity.x));
  }

  return (
    <motion.article
      ref={cardRef}
      className={`idea-card is-${tone}`}
      style={{ x, rotate, opacity }}
      drag="x"
      dragMomentum={false}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      whileTap={reducedMotion ? undefined : { scale: 0.985 }}
    >
      <div className="card-stamp">учебная открытка</div>
      <div className="postcard-sky" aria-hidden="true">
        <span className="postcard-fold" />
        <span className="postcard-sun" />
        <span className="postcard-horizon" />
        <span className={`swipe-cue swipe-cue-pass ${pull < -0.2 ? "is-on" : ""}`}>не сейчас</span>
        <span className={`swipe-cue swipe-cue-like ${pull > 0.2 ? "is-on" : ""}`}>хочу</span>
      </div>
      <div className="idea-content">
        <p className="eyebrow">{idea.destination}</p>
        <h2 id="guide-postcard-title">{idea.title}</h2>
        <p className="idea-summary">{idea.summary}</p>
        <div className="tag-list">{idea.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <p className="vibe-line">{idea.vibe}</p>
      </div>
    </motion.article>
  );
}
