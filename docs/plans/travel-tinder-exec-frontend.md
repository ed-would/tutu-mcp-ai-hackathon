---
title: Travel Tinder — Execution Plan (Discover + UX + Preference)
status: active
updated: 2026-08-19
scope: docs/plans
---

# Travel Tinder — План 2.3 (frontend: `/discover`, swipe, preference, core UX)

## 0) Пререквизиты

1. Infra и backend на уровне compile-ready API.
2. `/guide`/`/` сценарий согласован с `docs/plans/travel-tinder-exec-landing-onboarding.md` по microcopy.

---

## 1) Flow и экраны (полная копия логики из исходного плана)

### 1.1) Главный путь `/discover`

1. Промпт-экран:
   - one-shot поле prompt;
   - quick chips;
   - до 3 уточнений через bottom sheet.
2. Idea deck:
   - генерится ровно 8 идей;
   - карточка идеи без выдуманных цен;
   - основа маршрута: маршрутный hook + признаки.
3. Свайп:
   - touch drag;
   - mouse drag на desktop;
   - buttons/keyboard fallback:
     - кнопки `← / →` для non-touch;
     - клавиши `←`, `→`, `Enter/Space`.
4. Preference reveal:
   - живые объяснимые сигналы вместо технического dashboard.
5. Сборка пакетов и match:
   - после threshold вызывается `/api/packages`;
   - live loading stages;
   - package deck + match detail.

### 1.2) Состояния

1. `loading` — staged: "сравниваем транспорт", "проверяем назад", "ищем проживание".
2. `empty` — нет вариантов при конкретных constraints.
3. `error` — частичная деградация с actionable CTA.
4. `partial` — показывается usable-состояние без скрытия провалов.
5. `success` — idea deck и match deck.

---

## 2) State, preference learning и determinism

1. Zustand + localStorage как единственный persistent слой:
   - session seed;
   - likes / skips;
   - preference vector;
   - сессия идей;
   - last error context.
2. Preference engine:
   - like +1.0;
   - pass -0.35;
   - ε-greedy 15%;
   - нормализация в диапазон `[-1,1]`.
3. Ранжирование:
   - 85% weighted relevance;
   - 15% exploration.
4. После 5 решений и >=2 лайков появляется CTA «Собрать поездки».
5. Reload в браузере/кнопке `back` восстанавливает состояние по localStorage.
6. Reset очищает историю; user sees explicit confirmation.

---

## 3) Позиционирование и визуальная система

### Позиционирование

1. Публичное имя: **«Туту Куда?»**.
2. Тон: смело и тепло, без подросткового сленга.
3. Целевой пользователь:
   - путешественник, уставший сравнивать десятки вкладок и не определившийся с направлением.
4. Бизнес-обоснование Tutu фиксируем на лендинге:
   - discovery retention;
   - preference data;
   - повторные сессии;
   - native спецпроекты.
5. Визуальное направление: **Tutu Lab — «живая открытка + маршрутная нить»**.
6. Brand constraints:
   - официальные цвета: `#0D0B68`, `#7D71FF`;
   - Light-only;
   - базовая сетка 4 px;
   - body >= 16 px;
   - touch controls 48×48 CSS px;
   - gap controls >= 8 px;
   - min width 360 px;
   - контрольные viewport: `360×800`, `360×844`, `768×1024`, `1440×900`;
   - self-hosted variable Cyrillic font Onest, fallback на безопасный системный шрифт допустим и не блокирует запуск;
   - мягкая слоистая тень + тональный сдвиг поверхностей;
   - запрет: emoji, glassmorphism, случайные градиенты, неон, oversized rounded cards, AI-задекорированные blobs.

### Route-thread signature

Сквозной символ «маршрутная нить»:
- начинается у prompt;
- при свайпе тянется к краю карточки;
- после лайка превращается в сохранённый маршрут;
- на loading screen соединяет реальные MCP-этапы;
- на match detail связывает транспорт, проживание и checkout.

Signature должна быть заметна минимум в пяти местах:
- hero;
- prompt;
- idea card;
- preference meter;
- package breakdown;
- match detail.

### Motion tokens

1. Press: 100–140 ms, scale не ниже `0.97`.
2. Card decision: spring `stiffness: 420`, `damping: 34`.
3. Sheet/modal: 220–280 ms.
4. Route-line reveal: до 450 ms, только в редких переходах.
5. Анимации только `transform`, `opacity` и SVG path.
6. `prefers-reduced-motion`:
   - drag-смысл сохраняется;
   - карточка уходит через opacity без fly-away;
   - desktop:
     - deck центрирован;
     - справа preference/explanation rail;
     - мышь и клавиатура как альтернативы drag.
7. Accessibility:
   - фокус и focus-visible;
   - readable contrast;
   - keyboard-only сценарии проходят;
   - semantic labels на controls.

---

## 4) Экранные спецификации (не сокращаем из мастер-плана)

### Landing hero `/` (в рамках frontend integration)

1. Крупный вопрос «Куда вас потянет в этот раз?».
2. Подзаголовок про swipe-обучение вкусов.
3. Интерактивная мини-карточка демонстрирует swipe без API.
4. CTA «Начать выбирать».
5. Ниже:
   - проблема;
   - 3 шага;
   - live MCP proof;
   - пользу от Tutu;
   - FAQ;
   - CTA на `/guide`.

### Intent Composer

1. label-ориентированное поле;
2. примеры prompt меняются, но не замещают label;
3. chips: «на выходные», «вдвоём», «с детьми», «до 40 000 ₽»;
4. после submit — bottom sheet для недостающих данных.

### Idea Deck

1. 8 динамических идей.
2. Карточка: направление, эмоциональный hook, 3 причины соответствия, travel tags.
3. Main gesture: горизонтальный drag.
4. Равноправные альтернативы:
   - buttons «Не сейчас» / «Хочу»;
   - клавиши `←` / `→`.
5. Swipe threshold:
   - 28% ширины;
   - или velocity ≥ 700 px/s.
6. Idea deck не показывает вымышленных цен.

### Preference Reveal

1. Короткий живой переход вместо dashboard.
2. Показывает 3 сильнейших сигнала и 1 exploration-сигнал.
3. Есть «Изменить» и полный reset.

### Live Package Loading

1. 3 этапа этапов:
   - «Сравниваем транспорт»;
   - «Проверяем дорогу обратно»;
   - «Ищем проживание».
2. Skeleton резервирует финальную сетку.
3. Один upstream failure превращается в warning + partial result.
4. После 20 sec даём retry или возврат к идеям.

### Package Deck

1. 4–6 live packages;
2. Крупно показывается точная/оценочная полная цена.
3. Breakdown:
   - transport outbound;
   - transport return;
   - hotel;
   - nights;
   - компания.
4. Показываем:
   - время в пути;
   - вид транспорта;
   - имя станции/аэропорта из MCP.
5. Badge: `LIVE · Tutu MCP`.
6. Не вводим фальшивые тарифные детальки.

### Match Detail

1. Hero/photo из live Tutu hotel response.
2. «Почему вам подходит» связано с preference vector.
3. Показ точного/ориентировочного pricing.
4. Honest missing-data messages.
5. Checkout checklist из 2–3 шагов.
6. Возврат в deck без потери состояния.

### Guide `/guide`

1. Пользовательский non-technical документ.
2. Интерактивно повторяет сценарий:
   - запрос → уточнения → свайпы → live packages → переход на Tutu;
3. Объясняет exact vs estimated цены, отсутствие оплаты внутри приложения, privacy и reset.
4. CTA на `/discover`.

---

## 5) Design workflow и prompt pack до кодинга

1. `creator-vibe` — зафиксировать:
   - человек (путешественник),
   - действие,
   - эмоциональный итог.
2. `interface-design` — Domain/Color world/Signature / reject defaults.
3. `ui-ux-pro-max` — 360-first, drag alternatives, touch/focus.
4. `imagegen` для direction board и абстрактных assets; реальные package photo только из Tutu.
5. Перед созданием финальных макетов прогонить swap/squint/signature/token tests.
6. Записать решения в:
   - `.interface-design/system.md`
   - локальный design-system файл приложения (если он создаётся).
7. Сохранить промпты:

```text
Create a premium visual direction board, not a finished UI, for "Туту Куда?" —
an expressive mobile-first travel discovery experiment inside the Russian Tutu
brand. Build the world from movement, changing scenery, train-window light,
ticket-paper tactility, route lines, map folds and spontaneous weekend escapes.
Use the official logo colors deep navy #0D0B68 and ultraviolet #7D71FF as scarce
brand anchors on warm near-white surfaces. Explore bold Cyrillic editorial type,
asymmetric postcard crops, layered paper depth and one continuous route-thread
signature. The feeling is warm, kinetic, trustworthy and product-ready.
Reject Tinder red/green cloning, glassmorphism, neon gradients, emoji icons,
generic SaaS cards, fake dashboards and illegible decorative text.
```

```text
Design a medium-fidelity 360px-wide mobile product reference for "Туту Куда?".
Show three coherent states: a natural-language travel prompt, an idea swipe deck,
and a live Tutu package match. One focal action per screen. The swipe card should
feel like a moving editorial postcard, with a route thread reacting to horizontal
drag. Package data must look trustworthy: full-party price, outbound, return,
hotel, LIVE Tutu MCP badge, exact-versus-estimate label, and visible booking steps.
Use deep navy #0D0B68, ultraviolet #7D71FF, warm white, expressive Cyrillic
typography, restrained shadows, 48px touch controls and safe-area padding.
Avoid glass, neon, random gradients, oversized pills, floating blobs, emoji,
generic travel templates and fabricated booking details.
```

```text
Generate a set of six cohesive abstract travel-collage backgrounds for a Russian
mobile travel discovery app. No UI, no logos, no text, no identifiable fake
landmarks. Combine cropped train-window light, folded-map geometry, ticket-paper
texture, horizon bands and a thin continuous route line. Editorial, tactile,
energetic, optimistic, suitable behind dark navy text. Palette led by warm white,
deep navy and ultraviolet with restrained natural accents. Consistent art
direction across all six, vertical 4:5, generous quiet area for overlay content.
Reject stock-photo composition, surreal landmarks, neon, glossy 3D and AI blobs.
```

---

## 6) Acceptance frontend

1. Happy path без моков на 360×800 и 360×844.
2. 360-first и desktop path с эквивалентными управлением.
3. Family flow не показывает неподтверждённый rail-price.
4. Reload восстанавливает session state.
5. Reduced motion сохраняет swipe semantics.
6. `/guide` и `/discover` открываются напрямую после reload.
