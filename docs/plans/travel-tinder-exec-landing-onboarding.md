---
title: Travel Tinder — Execution Plan (Landing + Guide + Onboarding)
status: active
updated: 2026-08-19
scope: docs/plans
---

# Travel Tinder — План 2.4 (landing и `/guide` / пользовательская документация)

## 0) Позиционирование блока

Лендинг и `/guide` делаются после стабильного `/discover` и закрытых smoke-gate backend:
1. `/` — продуктовый вход в приложении (внутри `apps/app`).
2. `/guide` — пользовательский onboarding, без технического перегруза.
3. GitHub Pages используется только как возможный mirror публикации гайд-слайдов/демо-скринкастов после фиксации MVP в Vercel, **не как основной runtime-источник truth**.

## 1) Landing `/`

1. Hero: одна ценностная фраза + CTA.
2. Блок «Как это работает» (3 шага).
3. Превью flow с видео/скрином (без MCP runtime на превью).
4. Ограничения и безопасность:
   - что умеет / не умеет,
   - why no payments,
   - почему только live MCP + NeuralDeep fallback.
5. CTA:
   - на `/guide`;
   - на запуск `/discover`.
6. FAQ по pricing semantics:
   - exact vs estimated,
   - почему иногда `~`,
   - что происходит при timeout/fallback.
7. Accessibility:
   - readable contrast;
   - focus-visible states;
   - responsive min width 360.

## 2) User Guide `/guide` (максимально детализированная пользовательская часть)

1. Язык чисто продуктовый, без technical jargon.
2. Полный сценарий в 6 этапов:
   1. Как вводить запрос.
   2. Как отвечать на уточнения (до 3).
   3. Как работают свайпы и пороги.
   4. Что такое exact/estimated и откуда берется цена.
   5. Что означает checkout transition на tutu.ru.
   6. Как восстановить сессию/что делать при ошибках.
3. Поведенческие правила:
   - все микрокопи согласуются с `docs/plans/travel-tinder-exec-frontend.md`.
   - `/guide` не зависит от MCP runtime для показа справки.
4. Добавить раздел accessibility:
   - keyboard mode,
   - reduced motion,
   - focus and safe areas,
   - reset и privacy.
5. Финальные actions:
   - перейти в `/discover`;
   - continue previous session seed if exists.

## 3) Переход в продукт

1. `/guide` → `/discover` без потери состояния.
2. Навигация работает после reload.
3. Микрокопи `/` / `/guide`/`/discover` не противоречат:
   - exact/estimated;
   - absence of in-app payment;
   - family flow semantics.

## 4) Onboarding + GH Pages ветка

1. Базовый продуктовый onboarding всегда в приложении (`/guide`) и доступен по ссылке прямо из `/`.
2. Optional GH Pages:
   - только после закрытия core MVP и проверки 360/desktop;
   - зеркалирование в `docs/README` разрешено только как external documentation artifact;
   - нельзя делегировать на GH Pages основной production path `/guide`.
3. Проверить, что ссылочные пути в README и pitch указывают в первую очередь на `/` и `/guide` внутри Vercel.

## 5) Acceptance для блока

1. Проверка ссылок:
   - `/` → `/guide` → `/discover`.
2. Проверка readability:
   - 360×800,
   - 360×844,
   - 768×1024,
   - 1440×900.
3. Проверка сценария без ошибок на reload на всех трех маршрутах.
4. Проверка CTA:
   - CTA с правильным локальным текстом и aria-label;
   - валидация кнопок.

## 6) Deliverables после закрытия блока

1. `README.md` + `docs/landing`/`guide` section:
   - one-sentence value statement,
   - user onboarding description,
   - public links.
2. `/guide` синхронизирован с фактическим продуктовым flow.
3. `/guide` тестирует не-tech пользователю в 60-секундном туре (можно как отдельный screenshot-story).

## 7) Документация после реализации (детальная спецификация)

README обязателен как центральная техническая и судейская страница продукта:

1. Одно предложение о «Туту Куда?».
2. Проблема + traveller-first value proposition.
3. GIF/скриншоты полного flow.
4. Архитектурная диаграмма.
5. Таблица выбора стека:
   - Vite,
   - React vs Vue,
   - TS7,
   - Vercel Functions,
   - MCP client,
   - Vitest,
   - Playwright.
6. Реальные MCP tools + ограничения.
7. `exact / estimated` pricing contract.
8. Preference-learning algorithm.
9. Локальный запуск и env.
10. Полный список проверок (lint/type/test/smoke/e2e/acceptance).
11. Vercel deploy (Root directory, build, Node, env, деплой).
12. Матрица 100 баллов с реальными evidence.
13. Security/privacy.
14. Известные ограничения + roadmap.
15. Production URL, `/guide`, репозиторий (публичные links).

Синхронизация внешних документов после релиз-готовности:

- `AGENTS.md`:
  - обновление точных npm-команд и `apps/app`;
  - актуальность entry points.
- `docs/agents/architecture.md`:
  - Vite/React/Vercel архитектура,
  - `apps/app` как фактическая root,
  - удаление ссылок на устаревший stack-маршрут.
- `docs/agents/verification.md`:
  - актуальные команды/гейты (Oxlint/Oxfmt/Stylelint/Vitest/Playwright).
- `docs/agents/judging-criteria.md`:
  - все пути только на реально существующий стек `apps/app`,
  - использовать фактические `apps/app` пути и npm-команды.
- `docs/memory-bank/*`:
  - актуальный статус, риски, deployment, notes по допущениям.
- Плановые документы в `docs/plans/` остаются источником execution/evidence; отдельный legacy-каталог не требуется.
- `/guide`:
  - только пользовательское объяснение,
  - без технического перегруза.

Допущения финального блока документации (закрыть в конце):

- Основная география: Россия и СНГ.
- Основной сценарий полностью динамический.
- Основной flow: минимум два лайка после пяти решений.
- Tutu MCP — единственный источник live travel фактов.
- NeuralDeep может деградировать, но путь пользователя не должен падать.
- Vercel-конфигурация описывается для самостоятельной настройки пользователем/владельцем.
- Существующие незакоммиченные изменения и пользовательские изменения не перезаписываются.

## 8) Промпт-пакет для дизайна и креатива (привязан к creator-vibe)

### Prompt direction board

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

### Prompt UI reference

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

### Abstract assets pack

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
