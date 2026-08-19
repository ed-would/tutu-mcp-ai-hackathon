import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { resolveSwipeDecision, threadPullFromOffset } from "../../lib/swipe";
import { toneFromPull } from "../../lib/thread";
import type { DestinationIdea } from "../../lib/travel";
import { RouteThread } from "../RouteThread";

export type PostcardIdea = Pick<DestinationIdea, "destination" | "title" | "summary" | "tags" | "vibe">;

type SwipePostcardProps = {
  idea: PostcardIdea;
  onLike: () => void;
  onPass: () => void;
  stayAfterDecide?: boolean;
  compact?: boolean;
  titleId?: string;
  desktopPhotoSrc?: string;
};

export function SwipePostcard({
  idea,
  onLike,
  onPass,
  stayAfterDecide = false,
  compact = false,
  titleId = "idea-title",
  desktopPhotoSrc,
}: SwipePostcardProps) {
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
    if (stayAfterDecide) {
      x.set(0);
      opacity.set(1);
      setPull(0);
      busy.current = false;
    }
  }

  function onDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const decision = resolveSwipeDecision(info.offset.x, widthOfCard(), info.velocity.x);
    void settle(decision);
  }

  return (
    <motion.article
      ref={cardRef}
      className={`idea-card ${compact ? "is-compact" : ""} is-${tone}`}
      style={{ x, rotate, opacity }}
      drag="x"
      dragMomentum={false}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      whileTap={reducedMotion ? undefined : { scale: 0.985 }}
    >
      <div className="card-stamp">открытка маршрута</div>
      <div className={`postcard-sky${desktopPhotoSrc ? " has-desktop-photo" : ""}`} aria-hidden="true">
        {desktopPhotoSrc ? (
          <img className="postcard-photo" src={desktopPhotoSrc} alt="" decoding="async" />
        ) : null}
        <span className="postcard-fold" />
        <span className="postcard-sun" />
        <span className="postcard-horizon" />
        <span className={`swipe-cue swipe-cue-pass ${pull < -0.2 ? "is-on" : ""}`}>не сейчас</span>
        <span className={`swipe-cue swipe-cue-like ${pull > 0.2 ? "is-on" : ""}`}>хочу</span>
        <RouteThread label="Маршрут к направлению" pull={pull} tone={tone} />
      </div>
      <div className="idea-content">
        <p className="eyebrow">{idea.destination}</p>
        {compact ? <h2 id={titleId}>{idea.title}</h2> : <h1 id={titleId}>{idea.title}</h1>}
        <p className="idea-summary">{idea.summary}</p>
        <div className="tag-list">{idea.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
        {idea.vibe ? <p className="vibe-line">{idea.vibe}</p> : null}
      </div>
    </motion.article>
  );
}
