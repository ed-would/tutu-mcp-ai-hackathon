import { useState } from "react";

export function SafetyDemo() {
  const [recovered, setRecovered] = useState(false);

  return (
    <div className="guide-demo-card guide-ticket guide-safety">
      {recovered ? (
        <div className="warning" role="status">
          <strong>Часть вариантов не успела загрузиться.</strong>
          <span>Показываем то, что удалось найти. Можно продолжить или начать заново в маршруте.</span>
        </div>
      ) : (
        <div className="inline-error" role="alert">
          <strong>Пока не получилось.</strong>
          <span>Сеть или Туту могли не ответить вовремя. Ничего не потеряно в этом браузере.</span>
        </div>
      )}
      {recovered ? (
        <p className="guide-demo-note">История живёт только у вас на устройстве. На сервер она не уходит.</p>
      ) : (
        <button className="button button-secondary button-wide" type="button" onClick={() => setRecovered(true)}>
          Попробовать ещё раз
        </button>
      )}
    </div>
  );
}
