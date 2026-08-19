import { useState } from "react";
import { SwipePostcard } from "./SwipePostcard";

const demoIdea = {
  destination: "Казань",
  title: "Город двух берегов",
  summary: "Короткий побег: набережная, еда и маршрут, который складывается за один вечер.",
  tags: ["еда", "город", "выходные"],
  vibe: "без ранних подъёмов и без сравнения вкладок",
};

export function HeroPostcard() {
  const [hint, setHint] = useState("Потяните открытку — так выбирают направление. Без бронирования и без API.");

  return (
    <aside className="hero-postcard" aria-label="Демонстрация свайпа">
      <SwipePostcard
        idea={demoIdea}
        compact
        stayAfterDecide
        titleId="hero-idea-title"
        desktopPhotoSrc="/pic-1.png"
        onLike={() => setHint("«Хочу» запоминает вкус. Живые цены появятся уже в маршруте.")}
        onPass={() => setHint("«Не сейчас» отодвигает направление. Следующая открытка будет другой.")}
      />
      <p className="hero-postcard-hint">{hint}</p>
    </aside>
  );
}
