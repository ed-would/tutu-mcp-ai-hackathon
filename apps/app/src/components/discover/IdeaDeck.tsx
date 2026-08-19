import { type PointerEvent, useRef, useState } from "react";
import type { DestinationIdea } from "../../lib/travel";
import { RouteThread } from "../RouteThread";

type Props = { idea: DestinationIdea; index: number; onPass: () => void; onLike: () => void };

export function IdeaDeck({ idea, index, onPass, onLike }: Props) {
  const startX = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  function onPointerDown(event: PointerEvent<HTMLElement>) { startX.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); }
  function onPointerMove(event: PointerEvent<HTMLElement>) { if (startX.current !== null) setOffset(Math.max(-72, Math.min(72, event.clientX - startX.current))); }
  function onPointerUp() {
    if (offset > 52) onLike();
    else if (offset < -52) onPass();
    startX.current = null;
    setOffset(0);
  }
  return (
    <section className="deck-stage" aria-labelledby="idea-title">
      <div className="deck-progress"><span>02 / выбираем направление</span><strong>{String(index + 1).padStart(2, "0")} / 08</strong></div>
      <article className="idea-card" style={{ transform: `translateX(${offset}px) rotate(${offset / 18}deg)` }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        <div className="card-stamp">маршрут на ощущение</div>
        <div className="postcard-sky"><span className="postcard-sun" /><span className="postcard-horizon" /><RouteThread label="Маршрут к направлению" /></div>
        <div className="idea-content">
          <p className="eyebrow">{idea.destination}</p>
          <h1 id="idea-title">{idea.title}</h1>
          <p className="idea-summary">{idea.summary}</p>
          <div className="tag-list">{idea.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
          <p className="vibe-line">{idea.vibe}</p>
        </div>
      </article>
      <div className="deck-actions" aria-label="Оценить вариант">
        <button className="choice-button choice-pass" type="button" onClick={onPass}><span aria-hidden="true">×</span> Не сейчас</button>
        <button className="choice-button choice-like" type="button" onClick={onLike}>Подходит <span aria-hidden="true">→</span></button>
      </div>
      <p className="deck-hint">Свайпните карточку или используйте кнопки. Стрелка вправо — подходит, влево — пропустить.</p>
    </section>
  );
}
