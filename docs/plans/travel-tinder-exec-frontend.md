---
title: Travel Tinder — Execution Plan (Discover + UX + Preference)
status: active
updated: 2026-08-19
scope: docs/plans
---

# Travel Tinder — План 2.3 (frontend: `/discover`, swipe, preference, core UX)

## Легенда статуса (аудит 2026-08-19)

| Индикатор | Значение |
| --------- | -------- |
| 🟢 | Полностью выполнено — соответствует плану в рабочем коде |
| 🟡 | Частично — есть зачаток, но не по спецификации или без полировки |
| 🔴 | Не выполнено — отсутствует или только упомянуто в плане |

**Сводка:** 🟢 ~32 · 🟡 ~26 · 🔴 ~30 (из ~88 проверяемых пунктов)

**Визуальный удар (этот проход):** логотип «Куда?» как stamp + wordmark, self-hosted Onest, `apps/app/src/styles/tokens.css`, postcard-карточки, Motion spring, нить тянется за drag. Проверено: `typecheck` / `test` / `build`. `/pw` (Playwright MCP) в этой сессии **недоступен** — сервер `user-playwright` не подключён; визуальную приёмку нужно повторить, когда MCP browser живой.

**Главные пробелы дальше:** bottom sheet, PrefMeter / ε-greedy, match detail, staged MCP loading, FAQ/MCP proof на лендинге, desktop preference rail.

**Что уже держит вертикальный срез:** routes `/` · `/discover` · `/guide`, live API, swipe + keyboard, localStorage, `RouteThread` на drag, бренд-цвета, Onest, stamp-логотип.

---

## 0) Пререквизиты

1. 🟢 Infra и backend на уровне compile-ready API (`apps/app/api/*`, orchestrator, smoke scripts; `npm run build` проходит).
2. 🟡 `/guide`/`/` сценарий согласован с `docs/plans/travel-tinder-exec-landing-onboarding.md` по microcopy — страницы есть, но копирайт и блоки не совпадают с планом (другие заголовки, нет FAQ / MCP proof / полного гида).

---

## 1) Flow и экраны (полная копия логики из исходного плана)

### 1.1) Главный путь `/discover`

1. 🟡 **Промпт-экран:**
   - 🟢 one-shot поле prompt (`DiscoverPage` → `Intent`, textarea + submit);
   - 🟡 quick chips — есть 3 длинных примера, но **не** плановые: «на выходные», «вдвоём», «с детьми», «до 40 000 ₽»;
   - 🔴 до 3 уточнений через **bottom sheet** — сейчас отдельный full-screen `Clarify`, не sheet.
2. 🟡 **Idea deck:**
   - 🟢 генерится ровно 8 идей (контракт `InterpretResponse`, fallback `buildIdeas`);
   - 🟢 карточка идеи без выдуманных цен;
   - 🟡 основа маршрута: hook + признаки — есть `title`, `summary`, `tags`, `vibe`, но **нет** явных «3 причин соответствия».
3. 🟢 **Свайп:**
   - 🟢 touch drag (`SwipePostcard` + Motion);
   - 🟢 mouse drag на desktop;
   - 🟢 buttons/keyboard fallback:
     - 🟢 кнопки «Не сейчас» / «Хочу» с `← / →`;
     - 🟢 клавиши `←`, `→`, `Enter/Space`.
4. 🟡 **Preference reveal:**
   - 🟡 живые сигналы (`topSignals`, `signal-panel`) — без exploration-сигнала и без «Изменить»;
   - 🔴 не ощущается как «живой переход» — статичный экран после 8-го свайпа.
5. 🟡 **Сборка пакетов и match:**
   - 🟢 после reveal вызывается `/api/packages` (до 2 liked ideas);
   - 🔴 live loading stages — один блок `LoadingRoute`, без 3 этапов;
   - 🟡 package deck — список карточек есть;
   - 🔴 match detail — отдельного экрана нет, только inline `PackageCard` + checkout link.

### 1.2) Состояния

1. 🔴 `loading` — staged: «сравниваем транспорт», «проверяем назад», «ищем проживание».
2. 🟡 `empty` — нет вариантов: только текстовые ошибки, dedicated empty UI нет.
3. 🟡 `error` — частичная деградация с actionable CTA (`inline-error`, retry на intent).
4. 🟡 `partial` — warning при частичном packages (`session.warning`), но без явного partial-state layout.
5. 🟡 `success` — idea deck 🟢; match deck 🔴 (нет отдельного match flow).

---

## 2) State, preference learning и determinism

1. 🟡 **Zustand + localStorage** как единственный persistent слой:
   - 🟢 session seed (`newSeed`, `session.seed`);
   - 🟢 likes / skips (через `likes` + индекс deck);
   - 🟡 preference vector — простой `Record<string, number>` в `travel.ts`, не Zustand store;
   - 🟢 сессия идей (ideas, index, phase в localStorage);
   - 🟡 last error context — `session.error`, без отдельного error context объекта.
2. 🟡 **Preference engine:**
   - 🟢 like +1.0;
   - 🟡 pass -0.35 — в коде **-0.45** (`nextPreference`);
   - 🔴 ε-greedy 15%;
   - 🔴 нормализация в диапазон `[-1,1]`.
3. 🔴 **Ранжирование:** 85% weighted relevance; 15% exploration — не на клиенте.
4. 🔴 После **5 решений и >=2 лайков** CTA «Собрать поездки» — сейчас CTA только после прохождения **всех 8** идей.
5. 🟢 Reload в браузере/`back` восстанавливает состояние по localStorage.
6. 🔴 Reset очищает историю с **explicit confirmation** — сейчас мгновенный `reset()` без диалога.

---

## 3) Позиционирование и визуальная система

### Позиционирование

1. 🟢 Публичное имя: **«Туту Куда?»** (header, title).
2. 🟢 Тон: смело и тепло — RU copy, 404 на русском, без подросткового сленга.
3. 🟡 Целевой пользователь — отражён в hero lede, без отдельного problem framing на landing.
4. 🔴 Бизнес-обоснование Tutu на лендинге (discovery retention, preference data, повторные сессии, спецпроекты).
5. 🟢 Визуальное направление: **Tutu Lab — «живая открытка + маршрутная нить»** — stamp-логотип, postcard sky, layered paper, thread на drag.
6. 🟢 **Brand constraints:**
   - 🟢 официальные цвета: `#0D0B68`, `#7D71FF` (`tokens.css`);
   - 🟢 Light-only;
   - 🟢 базовая сетка 4 px;
   - 🟢 body >= 16 px;
   - 🟢 touch controls 48×48 CSS px;
   - 🟢 gap controls >= 8 px;
   - 🟢 min width 360 px;
   - 🟡 контрольные viewport — есть 720 / 768 / 1440 media; ручной `/pw` visual QA ещё впереди;
   - 🟢 self-hosted variable Onest (`@fontsource-variable/onest`);
   - 🟢 мягкая слоистая тень + тональный сдвиг (`--lift-paper`);
   - 🟢 запрет emoji в UI — соблюдается.

### Route-thread signature

🟢 Сквозной символ «маршрутная нить»:
- 🟢 начинается у prompt (`RouteThread` в intent);
- 🟢 при свайпе тянется к краю карточки (`pull` → `buildThreadPath`);
- 🟡 после лайка тон `saved` на package thread; отдельной «сохранённой» нити истории лайков нет;
- 🔴 на loading screen соединяет реальные MCP-этапы;
- 🟡 на package breakdown — нить есть, сегменты ещё не привязаны поштучно;
- 🔴 на match detail — экрана нет.

🟢 Signature заметна минимум в пяти местах:
- 🟢 hero (SVG thread + stamp wordmark);
- 🟢 prompt;
- 🟢 idea card (реагирует на drag);
- 🟡 preference meter — signal panel без meter-компонента;
- 🟢 package breakdown;
- 🔴 match detail.

### Motion tokens

1. 🟢 Press: 100–140 ms, scale не ниже `0.97` (`--press-ms`).
2. 🟢 Card decision: spring `stiffness: 420`, `damping: 34` (`motion/react`).
3. 🔴 Sheet/modal: 220–280 ms — sheet не реализован.
4. 🟢 Route-line reveal: до 450 ms (`pathLength` + `--thread-ms`).
5. 🟢 Анимации только `transform`, `opacity` и SVG path.
6. 🟡 `prefers-reduced-motion`:
   - 🟢 drag-смысл сохраняется;
   - 🟢 карточка уходит через opacity без fly-away;
   - 🔴 desktop preference rail справа — нет;
   - 🟢 мышь и клавиатура как альтернативы drag.
7. 🟡 **Accessibility:**
   - 🟢 фокус и focus-visible;
   - 🟡 readable contrast — muted усилен, WCAG tooling не гоняли;
   - 🟢 keyboard-only в deck (`← → Enter Space`);
   - 🟢 semantic labels на controls.

---

## 4) Экранные спецификации (не сокращаем из мастер-плана)

### Landing hero `/` (в рамках frontend integration)

1. 🟢 Крупный вопрос «Куда вас потянет в этот раз?».
2. 🟢 Подзаголовок про swipe-обучение вкусов.
3. 🟢 Интерактивная мини-карточка демонстрирует swipe без API (`HeroPostcard`).
4. 🟢 CTA «Начать выбирать».
5. 🔴 Ниже:
   - 🔴 проблема;
   - 🔴 3 шага;
   - 🔴 live MCP proof;
   - 🔴 польза от Tutu;
   - 🔴 FAQ;
   - 🟢 CTA на `/guide`.

### Intent Composer

1. 🟢 label-ориентированное поле.
2. 🔴 примеры prompt **меняются**, но не замещают label — chips статичны.
3. 🔴 chips: «на выходные», «вдвоём», «с детьми», «до 40 000 ₽».
4. 🔴 после submit — bottom sheet для недостающих данных.

### Idea Deck

1. 🟢 8 динамических идей.
2. 🟡 Карточка: направление, hook, tags — **нет** явных 3 reasons.
3. 🟢 Main gesture: горизонтальный drag.
4. 🟢 Равноправные альтернативы:
   - 🟢 buttons «Не сейчас» / «Хочу»;
   - 🟢 клавиши `←` / `→`, `Enter/Space`.
5. 🟢 Swipe threshold: 28% ширины или velocity ≥ 700 px/s (`resolveSwipeDecision`).
6. 🟢 Idea deck не показывает вымышленных цен.

### Preference Reveal

1. 🟡 Короткий живой переход — статичный экран.
2. 🟡 3 сильнейших сигнала — да; 🔴 1 exploration-сигнал — нет.
3. 🔴 «Изменить» и полный reset с подтверждением — только reset без confirm / без «Изменить».

### Live Package Loading

1. 🔴 3 этапа: «Сравниваем транспорт» / «Проверяем дорогу обратно» / «Ищем проживание».
2. 🔴 Skeleton резервирует финальную сетку.
3. 🟡 upstream failure → warning + partial — на уровне API/текста, без staged UI.
4. 🔴 После 20 sec — retry или возврат к идеям.

### Package Deck

1. 🟡 4–6 live packages — API отдаёт **до 2** на idea (макс. ~4 при 2 likes), не 4–6 как отдельный deck UX.
2. 🟢 Крупно точная/ориентировочная полная цена (label от `confidence`).
3. 🔴 Breakdown: transport outbound / return / hotel / nights / компания — только transport + hotel блоки.
4. 🔴 Время в пути, вид транспорта, станция/аэропорт из MCP — не surfaced в UI.
5. 🟢 Badge: `LIVE · Tutu MCP`.
6. 🟢 Не вводим фальшивые тарифные детальки.

### Match Detail

1. 🔴 Hero/photo из live Tutu hotel response.
2. 🔴 «Почему вам подходит» ↔ preference vector.
3. 🟡 exact/estimated pricing — частично в package card.
4. 🟡 Honest missing-data messages — generic fallbacks.
5. 🔴 Checkout checklist из 2–3 шагов — один CTA / одна ссылка.
6. 🔴 Возврат в deck без потери состояния — нет match → deck navigation.

### Guide `/guide`

1. 🟡 Пользовательский non-technical документ — базовый, 3 шага.
2. 🔴 Интерактивно повторяет полный сценарий (6 этапов из landing-плана).
3. 🔴 exact vs estimated, no payment, privacy, reset — только одна callout про цену.
4. 🟢 CTA на `/discover`.

---

## 5) Design workflow и prompt pack до кодинга

1. 🟢 `creator-vibe` — человек / действие / итог записаны в `.interface-design/system.md`.
2. 🟢 `interface-design` — Domain / Color world / Signature / reject defaults в `.interface-design/system.md`.
3. 🟡 `ui-ux-pro-max` — 360-first, drag alternatives и 48px touch заложены; отдельный audit checklist не прогоняли в браузере.
4. 🟡 `imagegen` — direction lockup сгенерирован; шесть abstract collage backgrounds не клали в продукт (CSS postcard, без AI-blob фото).
5. 🟡 swap / squint / signature / token tests — пройдены при сборке системы; не зафиксированы скриншотами.
6. 🟢 Записать решения в:
   - 🟢 `.interface-design/system.md`;
   - 🟢 локальный design-system: `apps/app/src/styles/tokens.css` + `apps/app/src/styles/global.css`.
7. 🟢 Сохранить промпты — полный набор: [travel-tinder-visual-asset-prompts.md](travel-tinder-visual-asset-prompts.md) (ниже в плане — краткие reference-копии).

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

1. 🟡 Happy path без моков на 360×800 и 360×844 — API live, визуал обновлён, полный `/pw` gate ещё нужен.
2. 🟡 360-first и desktop path с эквивалентным управлением — swipe/кнопки/клавиатура есть; desktop rail нет.
3. 🟢 Family flow не показывает неподтверждённый rail-price — блокируется в `getPackages`.
4. 🟢 Reload восстанавливает session state.
5. 🟢 Reduced motion сохраняет swipe semantics (opacity exit, без fly-away).
6. 🟢 `/guide` и `/discover` открываются напрямую после reload (SPA routes).

---

## 7) Рекомендуемый порядок следующих шагов (для обсуждения)

Приоритет **визуального преобразования** (без изменения backend-контрактов):

1. 🟢 **Логотип «Туту Куда?»** — stamp + wordmark: «?» как точка назначения на нити.
2. 🟢 **Design system** — Onest, `apps/app/src/styles/tokens.css`, `.interface-design/system.md`.
3. 🔴 **Intent Composer** — плановые chips, bottom sheet clarify, rotating examples.
4. 🟢 **Idea Deck polish** — 28% + velocity, spring exit, route-thread на drag, «Хочу».
5. 🔴 **PrefMeter + reveal** — 3 сигнала + exploration, CTA после 5 решений / 2 лайков.
6. 🟡 **Loading + Package + Match** — badge `LIVE · Tutu MCP` есть; staged loading, skeleton и match detail ещё нет.
7. 🟡 **Landing + Guide** — hero/CTA/мини-свайп есть; FAQ, 3 шага, MCP proof и полный гид ещё нет.
