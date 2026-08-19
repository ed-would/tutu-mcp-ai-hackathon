---
title: "Туту Куда?" — детальный план разработки и сдачи Travel Tinder
status: active
updated: 2026-08-19
scope: tinder
---

# «Туту Куда?» — детальный план разработки и сдачи Travel Tinder

Важное: этот документ работает как продуктовый reference-артефакт.
Операционный порядок выполнения и runtime-gates находятся в
`docs/plans/travel-tinder-exec-roadmap.md`.

Реализация в `docs/plans/travel-tinder-exec-roadmap.md` дополнительно разрезается на 5 под-планов:
1. `docs/plans/travel-tinder-exec-infra.md` — bootstrap/infra/guardrails.
2. `docs/plans/travel-tinder-exec-backend.md` — API + MCP + pricing/contracts.
3. `docs/plans/travel-tinder-exec-frontend.md` — /discover + swipe + preference + UX.
4. `docs/plans/travel-tinder-exec-landing-onboarding.md` — /, /guide, пользовательская документация.
5. `docs/plans/travel-tinder-exec-qa.md` — Vitest + Playwright + e2e + freeze.

## 1. Результат и границы MVP

К этому моменту должен существовать один публичный Vercel-деплой:

- `/` — путешественник-ориентированный лендинг.
- `/discover` — рабочее mobile-first приложение.
- `/guide` — интерактивная пользовательская документация.
- `/api/*` — server-only LLM и Tutu MCP интеграция.
- `/api/health` — безопасная диагностика LLM/MCP.

Главный динамический сценарий:

```mermaid
flowchart LR
    A["Свободный запрос"] --> B["До 3 уточнений"]
    B --> C["8 динамических идей"]
    C --> D["Idea Deck: свайпы"]
    D --> E["Видимое обучение предпочтений"]
    E --> F["Live Tutu MCP prefetch после лайка"]
    F --> G["Package Deck"]
    G --> H["Match detail"]
    H --> I["Checkout-ссылки tutu.ru"]
```

Продукт не использует заранее заготовленные маршруты в основном сценарии. Rule-based fallback допустим только при отказе NeuralDeep; расписание, цены, отели и checkout всегда приходят из live Tutu MCP.

За пределами MVP: аккаунты, БД, оплата внутри приложения, dark mode, нативный iOS, голос, аналитика, seat map, автоматический выбор конкретных мест/номеров, география вне России и СНГ.

---

## 2. Архитектура и обоснование стека

### Каноническая структура

Приложение размещается в `apps/app`, чтобы соответствовать текущим `AGENTS.md`, architecture и verification.

```text
apps/app/
├── api/                    # Vercel Node.js Functions
│   ├── interpret.ts
│   ├── packages.ts
│   ├── checkout.ts
│   └── health.ts
├── server/
│   ├── llm/
│   ├── mcp/
│   ├── packages/
│   └── observability/
├── shared/
│   ├── contracts/
│   └── schemas/
├── src/
│   ├── app/
│   ├── features/
│   ├── components/
│   ├── state/
│   ├── styles/
│   └── assets/
├── e2e/
├── scripts/
└── public/
```

### Зафиксированный стек

| Слой | Решение | Почему |
|---|---|---|
| Сборка | Vite 8.1 | Подходит для SPA, быстрый HMR, единый Rolldown/Oxc pipeline, минимальная конфигурация. Vite 8 — stable. [Официальный анонс](https://vite.dev/blog/announcing-vite8) |
| UI | React 19.2 | Прямой TSX typecheck, зрелые accessible primitives, наиболее надёжная агентная генерация, production-ready gesture/drag через Motion |
| Почему не Vue | Vue остаётся технически хорошей альтернативой, но потребовал бы дополнительный `vue-tsc`-слой для SFC при новом TS7. Vite, Vitest и Motion поддерживают оба фреймворка, поэтому React выбран по снижению интеграционного риска, а не из-за runtime-превосходства |
| Язык | TypeScript 7 strict | Stable native compiler, значительно ускоренный typecheck. [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) |
| Runtime | Node.js 24 LTS | Совпадает с локальным runtime и поддерживается Vercel как default LTS. [Vercel Node 24](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) |
| Backend | Vercel TypeScript Functions | Один deploy для SPA и API, стандартные `Request`/`Response`, server-only secrets. [Vercel Functions](https://vercel.com/docs/functions/runtimes/node-js) |
| MCP | `@modelcontextprotocol/client` | Официальный `Client` + `StreamableHTTPClientTransport`; отдельное соединение на serverless request, обязательное закрытие transport. [MCP client guide](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/client.md) |
| LLM | NeuralDeep через OpenAI-compatible SDK | Structured output для intent/ideas, server-only ключи, rule-based fallback |
| Network state | TanStack Query | Cancellation, retries, background prefetch после лайка, явные loading/error states |
| Client state | Zustand + localStorage | Preference vector, история свайпов, session seed, restart; БД не нужна |
| Схемы | Zod | Один контракт для API input/output, LLM JSON и нормализованных MCP-данных |
| Motion | `motion/react` | Drag physics, velocity, AnimatePresence, touch/mouse parity, reduced motion. [Motion drag](https://motion.dev/docs/react-drag) |
| CSS | CSS Modules + semantic CSS tokens | Vite-native, удобный Stylelint, отсутствие Tailwind-шаблонности и длинных utility-цепочек |
| Unit/integration | Vitest 4.1 | Использует Vite config и тот же transformation pipeline. [Почему Vitest](https://vitest.dev/guide/why.html) |
| E2E | Playwright 1.62 | Реальные browser/touch/keyboard сценарии и accessibility snapshots. [Release notes](https://playwright.dev/docs/release-notes) |
| Lint/format | Oxlint + Oxfmt + Stylelint | Без ESLint, TSLint, Prettier. Oxlint запускается type-aware, но отдельный TS7 typecheck сохраняется, поскольку встроенный type-check Oxlint пока experimental. [Oxlint](https://oxc.rs/docs/guide/usage/linter.html), [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) |
| Package manager | npm workspaces | В репозитории уже есть `package-lock.json`; второй lockfile не создаётся |

React Compiler, Tailwind, SSR и дополнительный backend-фреймворк не включаются: они не закрывают новый критерий и расширяют поверхность отказа.

### Server/client boundary

- Браузер никогда не обращается к NeuralDeep или Tutu MCP напрямую.
- `api/*` принимает только ограниченные Zod-схемы и возвращает нормализованные данные.
- Ключи NeuralDeep доступны только в Vercel Functions.
- Сервер не хранит пользовательские сессии и не переиспользует MCP transport между запросами.
- Исходные MCP payload не логируются и не показываются пользователю.
- Checkout URL проверяется на `https:` и Tutu host, после чего передаётся byte-for-byte без ручной пересборки.
- Prompt ограничивается 600 символами; body — 16 KB.
- Все запросы получают `requestId`, stage и duration; город, prompt и состав семьи не попадают в production-логи целиком.

---

## 3. Публичные интерфейсы и модель данных

### `POST /api/interpret`

Вход:

```ts
type InterpretRequest = {
  prompt: string;
  answers?: Record<string, string | string[]>;
  locale: "ru-RU";
};
```

Ответ — discriminated union:

```ts
type InterpretResponse =
  | {
      status: "needs_clarification";
      questions: ClarificationQuestion[]; // максимум 3
      draftIntent: Partial<TravelIntent>;
    }
  | {
      status: "ready";
      intent: TravelIntent;
      ideas: DestinationIdea[]; // ровно 8
      generation: "llm" | "rule_fallback";
    };
```

`TravelIntent` содержит:

- город отправления;
- даты туда/обратно;
- взрослые и точные возраста детей;
- общий бюджет;
- темп, интересы и desired vibe;
- допустимые виды транспорта;
- предпочтения отеля: завтрак, отмена, кровати, вид либо явное «выбери сам».

Если отсутствуют критичные данные, одна bottom sheet задаёт до трёх вопросов. Никаких скрытых defaults «Москва + следующие выходные».

### `POST /api/packages`

Вход:

```ts
type PackagesRequest = {
  intent: TravelIntent;
  idea: DestinationIdea;
  preferences: PreferenceVector;
  sessionSeed: string;
};
```

Ответ:

```ts
type PackagesResponse = {
  packages: TripPackage[];
  warnings: SourceWarning[];
  sources: SourceEvidence[];
};
```

Оркестрация:

- Взрослые:
  - `search_multitransport` туда и обратно для мультимодального сравнения;
  - `search_avia` с `return_date` для настоящего round-trip авиаоффера;
  - `search_hotels` с preferences gate.
- Семьи:
  - `search_avia` round-trip;
  - `search_bus` туда и обратно;
  - `search_hotels` с `children_ages`;
  - rail исключается из семейной цены: MCP принимает там только взрослых.
- Все независимые вызовы запускаются через `Promise.allSettled`.
- Одновременно обрабатываются максимум две понравившиеся идеи.
- Live prefetch начинается только после лайка; нелайкнутые идеи не вызывают MCP.
- Для ранжирования используются максимум три понравившихся направления.
- Для одного направления строится максимум два пакета: «оптимальный» и «быстрее/комфортнее».

### Цена и честность

```ts
type PackagePrice =
  | {
      confidence: "exact_round_trip";
      amount: number;
      currency: "RUB";
    }
  | {
      confidence: "estimated_split_trip";
      amount: number;
      currency: "RUB";
      note: "Два отдельных билета; цена может измениться";
    };
```

- Авиа round-trip + whole-stay hotel: точный total текущих офферов.
- Поезд/автобус туда + обратно + отель: полный ориентир с `≈`, breakdown и двумя отдельными транспортными покупками.
- Цена отеля уже содержит весь stay и никогда не умножается повторно на ночи.
- Карточка всегда показывает timestamp, источник `Tutu MCP` и статус точности.
- Частичный ответ разрешён: например, транспорт без отеля. UI не скрывает отсутствующую часть и не выдаёт её за пакет.

### `POST /api/checkout`

Принимает выбранные opaque `checkout_ref` и возвращает:

```ts
type CheckoutStep = {
  order: number;
  label: string;
  url: string;
  product: "transport_outbound" | "transport_return" | "hotel";
};
```

- Авиа: transport round-trip + hotel, два шага.
- Поезд/автобус: туда + обратно + hotel, три шага.
- Кнопка называется «Перейти к бронированию», не «Корзина готова».
- Для avia сохраняются passenger counts, `is_round_trip` и `return_departure_at`.
- Приложение не обещает оплату или завершённое бронирование.

### `GET /api/health`

Возвращает только:

- `app: ok`;
- `llm: ok | degraded`;
- `mcp: ok | degraded`;
- schema/tool fingerprint;
- durations и timestamp.

Никаких env, raw errors или ключей.

### Preference engine

Вектор содержит веса интересов, темпа, бюджета, комфорта и транспорта.

- Like: `+1.0` по тегам идеи.
- Pass: `-0.35`.
- Веса нормализуются в `[-1, 1]`.
- 85% ранжирования — weighted relevance.
- 15% — ε-greedy exploration.
- Seed хранится в session, чтобы поведение можно было воспроизвести в тесте.
- UI показывает человеческие выводы: «Похоже, вам важны поезда, гастрономия и короткая дорога», а не технический массив весов.

---

## 4. UX, экраны и визуальная система

### Позиционирование

Публичное имя: **«Туту Куда?»**

Тон: смело и тепло, без подросткового сленга.

Главная аудитория: путешественник, уставший сравнивать десятки вкладок и ещё не решивший, куда ехать. Бизнес-выгода Tutu объясняется ниже на лендинге: больше discovery, preference data, повторных сессий и нативных спецпроектов.

Визуальное направление: **Tutu Lab — «живая открытка + маршрутная нить»**.

- Официальные цвета логотипа: `#0D0B68` и `#7D71FF`.
- Light-only.
- Базовая сетка 4 px.
- Body не меньше 16 px.
- Touch controls 48×48 CSS px, промежуток не меньше 8 px.
- Минимальная ширина — 360 px.
- Контрольные viewport: `360×800`, `360×844`, `768×1024`, `1440×900`.
- Self-hosted variable Cyrillic font Onest; системный fallback не блокирует запуск.
- Один depth-язык: мягкая слоистая тень + тональный сдвиг поверхностей.
- Никаких emoji-иконок, glassmorphism, случайных градиентов, неона, гигантских одинаковых rounded cards и декоративных AI-клякс.

### Signature-механика

Сквозь весь продукт проходит «маршрутная нить»:

- начинается у prompt;
- при свайпе тянется к краю карточки;
- после лайка превращается в сохранённый маршрут;
- на loading screen соединяет реальные MCP-этапы;
- на match detail связывает транспорт, проживание и checkout.

Signature должна быть видна минимум в пяти местах: hero, prompt, idea card, preference meter, package breakdown, match detail.

### Экраны

1. **Landing hero `/`**
   - Крупный вопрос: «Куда вас потянет в этот раз?»
   - Подзаголовок: «Опишите поездку — свайпы поймут ваш вкус, а Туту соберёт живые варианты».
   - Интерактивная мини-карточка демонстрирует свайп без API.
   - CTA: «Начать выбирать».
   - Ниже: проблема, 3 шага, live MCP proof, польза Tutu, пользовательский FAQ, CTA на `/guide`.

2. **Intent Composer**
   - Одно крупное поле с видимым label.
   - Примеры prompt меняются, но не заменяют label.
   - Quick chips: «на выходные», «вдвоём», «с детьми», «до 40 000 ₽».
   - После submit — bottom sheet только для недостающих данных.

3. **Idea Deck**
   - 8 динамических идей.
   - Карточка: направление, эмоциональный hook, 3 причины соответствия, travel tags.
   - Idea deck не показывает придуманные цены.
   - Основной жест: горизонтальный drag.
   - Равноправные альтернативы: кнопки «Не сейчас» / «Хочу», клавиши `←` / `→`.
   - Threshold: 28% ширины либо velocity ≥700 px/s.
   - После пяти решений и минимум двух лайков появляется CTA «Собрать поездки».

4. **Preference Reveal**
   - Короткий живой переход, а не dashboard.
   - Показывает три наиболее сильных сигнала и один exploration-сигнал.
   - Есть «Изменить» и полный reset.

5. **Live Package Loading**
   - Честные стадии: «Сравниваем транспорт», «Проверяем дорогу обратно», «Ищем проживание».
   - Skeleton резервирует финальный layout.
   - Ошибка одного upstream превращается в warning и частичный результат.
   - После 20 секунд предлагается retry или возврат к идеям.

6. **Package Deck**
   - 4–6 live пакетов.
   - Крупно: точная или ориентировочная полная цена.
   - Breakdown: туда, обратно, отель, ночи, компания.
   - Время в пути, вид транспорта, название станции/аэропорта из MCP.
   - Badge `LIVE · Tutu MCP`.
   - Не перегружается сырыми тарифными деталями.

7. **Match Detail**
   - Hero/photo из live Tutu hotel response.
   - «Почему вам подходит» связано с preference vector.
   - Точный/ориентировочный price explanation.
   - Honest missing-data messages.
   - Checkout checklist из двух или трёх шагов.
   - Возможность вернуться в deck без потери состояния.

8. **Guide `/guide`**
   - Пользовательский, не технический документ.
   - Интерактивно повторяет: запрос → уточнения → свайпы → live packages → переход на Tutu.
   - Объясняет точные и ориентировочные цены, отсутствие оплаты внутри приложения, privacy и reset.
   - Содержит CTA на `/discover`.

### Motion tokens

- Press: 100–140 ms, scale не ниже `0.97`.
- Card decision: spring `stiffness 420`, `damping 34`.
- Sheet/modal: 220–280 ms.
- Route-line reveal: до 450 ms только в редких переходах.
- Анимируются только `transform`, `opacity` и SVG path.
- `prefers-reduced-motion`: drag сохраняется функционально, но карточка исчезает через opacity без пролёта.
- Desktop не превращается в растянутый телефон: по центру deck, справа preference/explanation rail; управление мышью и кнопками.

### Design workflow и prompt pack

Перед кодированием UI:

1. `creator-vibe` фиксирует человека, действие и эмоциональный результат.
2. `interface-design` создаёт Domain / Color world / Signature / Rejected defaults.
3. `ui-ux-pro-max` проверяет 360 px, drag alternatives, touch, focus и reduced motion.
4. ImageGen создаёт только direction board и абстрактные локальные assets; реальные package photos идут из Tutu.
5. Решения сохраняются в `.interface-design/system.md` и в локальном design-system файле приложения.
6. Каждый экран проходит swap, squint, signature и token tests.

Промпт direction board:

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

Промпт UI reference:

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

Промпт для абстрактных assets:

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

## 5. Матрица критериев судейства

| Критерий | Реализация | Evidence | Gate |
|---|---|---|---|
| Theme, 10 | Prompt → dynamic ideas → live packages → Tutu checkout | `/discover`, MCP logs без payload, checkout screen | Live smoke до tutu.ru |
| Depth, 15 | Idea Deck, Package Deck, Match Detail, preference engine; `search_multitransport`, `search_avia`, `search_hotels`, `create_checkout_link` | Код MCP orchestration + demo script | Package smoke |
| UX/UI, 20 | 360-first, Tutu Lab tokens, signature route thread, drag/buttons/keyboard, loading/empty/error | Screenshots, PW checklist | PW-0…PW-6 |
| Presentation, 5 | 10-минутный traveller-first pitch: проблема, инновация, market breakthrough, обоснование | README/demo script | Dry-run ≤9 минут |
| Documentation, 10 | Подробный README, `/guide`, архитектура, deploy, ограничения, актуальные agent docs | Публичные URL + repo docs | Link check |
| Innovation, 10 | Structured LLM, видимый preference learning, ε-greedy exploration | Preference Reveal и explanation на match | Unit tests + live demo |
| Stability, 10 | Fallback parser, partial results, timeouts, `/health`, retry, smoke и E2E | Health URL, test report | Все обязательные команды green |
| Architecture, 10 | Vite SPA + server-only Vercel Functions, shared Zod contracts, stateless backend | README diagram, `docs/agents/architecture.md` | Architecture review |
| Code quality, 10 | TS7 strict, named exports, Oxlint/Oxfmt/Stylelint, Vitest, no secrets | CI/local command output | Zero lint/type/test failures |

Статус критерия меняется на выполненный только после появления указанного evidence.

---

## 6. Порядок реализации (без timeboxing)

### Этап 0: зафиксировать execution contract

- Route: `VERIFIED`.
- Один writer на пересекающуюся поверхность.
- Correction budget: максимум две стабильные fix/review итерации.
- Зафиксировать обязательные gates и список exclusions.
- Прочитать `PRECODING.md`.
- Не перезаписывать существующие пользовательские изменения.

### Этап 1: каркас и vertical slice

- Создать `apps/app` на Vite 8 + React + TS7.
- Настроить npm workspace и единый lockfile.
- Добавить Vercel `api/health.ts`.
- Подключить официальный MCP client.
- Реализовать `mcp-smoke`: `initialize` → `tools/list` → schema fingerprint.
- Развернуть ранний Vercel Preview.
- Gate: build + TS7 typecheck + live `tools/list`.

### Этап 2: контракты, LLM и MCP orchestration

- Создать Zod-схемы public API.
- Реализовать `/api/interpret`, structured output и fallback.
- Реализовать семейную маршрутизацию без rail.
- Реализовать adult multitransport, avia round-trip и hotel search.
- Добавить timeout: LLM 8 секунд, MCP 12 секунд на call, overall 20 секунд.
- Один retry только для idempotent search при 429/5xx/network.
- Нормализовать exact/estimated price.
- Gate: integration tests и packages smoke на live MCP.

### Этап 3: preference engine и state

- Zustand store с versioned localStorage.
- Swipe history, reset, session seed.
- Weight update, normalization, ranking, ε=0.15.
- Background prefetch на like, concurrency=2.
- Gate: детерминированные Vitest cases.

### Этап 4: UI vertical product

- Сначала реализовать полный functional flow без декоративного polish.
- Затем tokens, typography, route-thread signature и Motion.
- Экран за экраном: composer → clarification → idea deck → reveal → loading → packages → match.
- Добавить все loading/empty/error/partial states.
- Gate: happy path на 360 px и desktop без моков.

### Этап 5: landing и guide

- Landing использует ту же систему, но не копирует product screen.
- `/guide` полностью интерактивен и не зависит от MCP для чтения.
- Добавить метаданные, favicon, social preview, официальный logo SVG.
- Gate: все CTA и прямые URL работают после reload через Vercel rewrite.

### Этап 6: тесты и visual QA

- Полный Vitest.
- Playwright E2E с API fixtures.
- `/pw` на локальном happy path и production preview.
- Visual checks на 360×800, 360×844 и 1440×900.
- Accessibility snapshot, keyboard-only flow, reduced motion.
- Исправлять только blocking/high findings.

### Критерии заморозки изменений

После feature freeze запрещены новые функции. Разрешены только:

- broken flow fixes;
- accessibility blockers;
- production/deploy fixes;
- документационная синхронизация;
- submission link fixes.

При отставании допустимо убирать вторичный polish (art variants, вторичный desktop polish, часть package cards), но не сокращаются:

- live MCP,
- checkout,
- `/guide`,
- error states,
- 360 flow,
- smoke,
- README,
- link check.

Для production deploy сохранить:

- Root Directory: `apps/app`.
- Framework preset: Vite.
- Build: `npm run build`.
- Output: `dist`.
- Node.js: `24.x`.
- Env: `NEURALDEEP_API_KEY`, `NEURALDEEP_BASE_URL`, model identifier.
- Production branch закрепить до freeze.
- Проверить `/api/health`, MCP reachability из serverless и NeuralDeep structured output.

---

## 7. Тестирование и acceptance criteria

### Vitest

- LLM JSON success, invalid JSON, timeout и fallback.
- Не более трёх уточняющих вопросов.
- Date range и party validation.
- Family flow никогда не вызывает multitransport/rail pricing.
- Hotel children преобразуются в `children_ages`.
- Hotel stay total не умножается на ночи.
- Avia round-trip маркируется exact.
- Split rail/bus маркируется estimated.
- Preference updates и normalization.
- ε-greedy ranking воспроизводим по seed.
- Missing MCP fields не заполняются догадками.
- Partial `Promise.allSettled` response остаётся usable.
- Checkout URL не пересобирается и не мутируется.
- Malicious URL/host отклоняется.
- API errors имеют единый `code`, `message`, `retryable`, `requestId`, `stage`.

### Playwright

- 360 px: prompt → clarification → пять свайпов → два лайка → package deck → match → checkout.
- Drag вправо и влево.
- Те же решения через кнопки.
- Те же решения через клавиатуру.
- Семейный prompt не показывает неподтверждённую rail-цену.
- Empty hotel сохраняет transport-only result.
- One-upstream failure отображается warning, не fatal screen.
- Timeout предлагает retry и сохраняет intent.
- Reload восстанавливает session state.
- Reset очищает localStorage.
- `/`, `/guide`, `/discover` открываются напрямую и после refresh.
- Focus не скрывается sticky footer.
- `prefers-reduced-motion` убирает перелёты.
- Accessible names у icon controls.
- Скриншоты ключевых экранов на 360 и desktop.

E2E использует fixtures только для детерминированного UI-теста. Отдельные `mcp-smoke` и `packages-smoke` обязаны обращаться к live Tutu MCP.

### Обязательная финальная команда

```bash
npm run --prefix apps/app format:check
npm run --prefix apps/app lint
npm run --prefix apps/app typecheck
npm run --prefix apps/app test
npm run --prefix apps/app build
npm run --prefix apps/app mcp-smoke
npm run --prefix apps/app packages-smoke
```

Browser acceptance выполняется через `/pw`, не ad hoc shell automation.

---

## 8. Документация после реализации

README переписывается на русском и становится главной технической и судейской страницей:

1. Одно предложение о «Туту Куда?».
2. Проблема и traveller-first value proposition.
3. GIF/скриншоты полного flow.
4. Архитектурная диаграмма.
5. Подробная таблица выбора Vite, React против Vue, TS7, Vercel Functions, MCP client, Vitest и Playwright.
6. Реальные MCP tools и ограничения.
7. Exact/estimated pricing contract.
8. Preference-learning algorithm.
9. Локальный запуск и env.
10. Полные проверки.
11. Vercel deploy.
12. Матрица 100 баллов с реальными evidence.
13. Security/privacy.
14. Известные ограничения и roadmap.
15. Production, `/guide` и repo links.

Одновременно синхронизируются:

- `AGENTS.md` — реальные npm-команды и `apps/app`.
- `docs/agents/architecture.md` — Vite/React/Vercel архитектура.
- `docs/agents/verification.md` — Oxlint/Oxfmt/Stylelint/Vitest/Playwright.
- `docs/agents/judging-criteria.md` — только существующие `apps/app` пути и npm-команды.
- `docs/memory-bank/*` — реальный статус, риски, deployment.
- `/guide` — только пользовательское объяснение без технической перегрузки.

---

## Допущения

- Основная география — Россия и СНГ.
- Основной сценарий полностью динамический.
- Главный flow рассчитан на минимум два лайка после пяти решений.
- Tutu MCP остаётся единственным источником live travel facts.
- NeuralDeep может деградировать, но его отказ не должен ломать пользовательский путь.
- Пользователь самостоятельно настраивает Vercel по подготовленной инструкции параллельно реализации.
- Все существующие незакоммиченные изменения сохраняются и не перезаписываются.
