import type { DestinationIdea } from "../../lib/travel";
import { SwipePostcard } from "./SwipePostcard";

type Props = {
  idea: DestinationIdea;
  index: number;
  onPass: () => void;
  onLike: () => void;
};

export function IdeaDeck({ idea, index, onPass, onLike }: Props) {
  return (
    <section className="deck-stage" aria-labelledby="idea-title">
      <div className="deck-progress">
        <span>02 / выбираем направление</span>
        <strong>{String(index + 1).padStart(2, "0")} / 08</strong>
      </div>
      <div className="deck-stack">
        <span className="deck-paper deck-paper-back" aria-hidden="true" />
        <span className="deck-paper deck-paper-mid" aria-hidden="true" />
        <SwipePostcard key={idea.id} idea={idea} onLike={onLike} onPass={onPass} />
      </div>
      <div className="deck-actions" aria-label="Оценить вариант">
        <button className="choice-button choice-pass" type="button" onClick={onPass}>
          <span aria-hidden="true">←</span> Не сейчас
        </button>
        <button className="choice-button choice-like" type="button" onClick={onLike}>
          Хочу <span aria-hidden="true">→</span>
        </button>
      </div>
      <p className="deck-hint">Свайпните открытку, нажмите кнопки или клавиши ← →. Пробел и Enter — «Хочу».</p>
    </section>
  );
}
