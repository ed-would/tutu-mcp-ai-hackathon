---
title: Travel Tinder — Accelerated Execution Roadmap
status: active
updated: 2026-08-19
scope: docs/plans
---

# Travel Tinder — Accelerated Execution Roadmap

Этот файл — единственный оперативный порядок выполнения. Отдельный контрактный
этап и пакет дополнительных спецификаций не требуются: решения фиксируются
непосредственно в runtime-gates ниже.

## Цель и жёсткая граница

За один короткий execution-цикл собрать и задеплоить честный вертикальный срез:

`prompt → ideas → likes → preference reveal → live Tutu package → match → checkout URL`.

Нельзя вырезать live Tutu MCP, checkout, core flow, `/guide`, production build и
smoke checks. При отставании первыми вырезаются drag-polish, secondary packages,
семейная глубина, расширенная desktop-версия, hooks и вторичные документы.

## Шесть ускоренных волн

### Wave A — Scaffold и ранний deploy

Владелец: `travel-tinder-exec-infra.md`.

- Создать `apps/app` на Vite + React + TypeScript.
- Настроить SPA routes `/`, `/discover`, `/guide`, server functions и rewrites.
- Добавить `.env.example`, базовые npm scripts и `/api/health`.
- Получить ранний preview/deploy сразу после scaffold.

Runtime-gate: `build` проходит, preview открывается, direct reload и `/api/health`
работают. До закрытия gate остальные блоки не расширяют инфраструктуру.

### Wave B — Backend live vertical slice

Владелец: `travel-tinder-exec-backend.md`; стартует после Wave A.

- Реализовать `/api/interpret`, `/api/packages`, `/api/checkout` с общими схемами.
- Подключить NeuralDeep и детерминированный fallback.
- Подключить реальные Tutu MCP search и checkout tools.
- Сохранить exact/estimated semantics, partial warnings и opaque Tutu URLs.

Runtime-gate: live smoke возвращает хотя бы один честный package и checkout/search
URL. Если время ограничено, сначала закрыть multitransport + hotel + checkout;
прямой avia-search и вторичные варианты — optional.

### Wave C — Discover и preference loop

Владелец: `travel-tinder-exec-frontend.md`; после минимального API shape из Wave B.

- Собрать mobile-first `/discover`.
- Реализовать prompt, clarification, восемь ideas, like/pass buttons.
- Показать preference reveal и вызвать packages максимум для двух liked ideas.
- Добавить package cards, match detail, checkout CTA, loading/empty/error states.
- Сохранить минимальное session state в localStorage.

Runtime-gate: пользователь проходит весь core flow на 360px без ручного обхода
ошибок. Drag, сложные motion states и desktop rail — только после этого gate.

### Wave D — Landing и guide

Владелец: `travel-tinder-exec-landing-onboarding.md`; статический контент может
готовиться параллельно Wave B/C, но интегрируется после появления routes из Wave A.

- Сделать компактный `/` с value proposition, тремя шагами и CTA.
- Сделать `/guide` с пользовательским объяснением flow, цен и перехода на Tutu.
- Синхронизировать README и публичные ссылки с фактическим приложением.

Runtime-gate: `/` → `/guide` → `/discover` и direct reload работают на preview.

### Wave E — Критическая QA

Владелец: `travel-tinder-exec-qa.md`; unit smoke можно писать параллельно Wave B/C,
финальная acceptance-проверка начинается после Wave C/D.

- Проверить LLM fallback, preference update, price semantics, malformed/partial MCP.
- Проверить opaque checkout URL и Tutu host validation.
- Выполнить typecheck, test, build, mcp-smoke и packages-smoke.
- Через `/pw` проверить 360px happy path, reload, overflow, CTA и один error state.

Runtime-gate: критические команды зелёные либо явно помечены `blocked` с причиной;
core production flow подтверждён вручную.

### Wave F — Evidence, production deploy и freeze

Владелец: root/orchestrator; evidence ledger — `travel-tinder-exec-qa-matrix.md`.

- Заполнить матрицу только фактическими `pass/fail/blocked/na` evidence.
- Проверить production `/api/health`, public URL, `/guide`, commit hash и smoke.
- После feature freeze разрешены только core-flow, deploy, secret, checkout и
  broken-link fixes.

Runtime-gate: production URL открывается, главная демонстрация проходит, известные
ограничения записаны. После этого roadmap считается закрытым.

## Параллельные треки

Без нарушения runtime-зависимостей можно выполнять параллельно:

- Wave B backend contracts/schemas и Wave C UI shell, если UI использует временный
  typed adapter без фиктивных travel facts.
- Unit tests for contracts и подготовку QA smoke scripts одновременно с backend.
- Static copy/design work для Wave D одновременно с backend/frontend.
- Evidence matrix skeleton и deploy dashboard setup с момента появления scaffold.

Нельзя параллельно менять одну и ту же public contract surface. Один writer владеет
каждым файлом; интеграция проводится после соответствующего runtime-gate.

## Минимальный command-set

```bash
npm run --prefix apps/app typecheck
npm run --prefix apps/app test
npm run --prefix apps/app build
npm run --prefix apps/app mcp-smoke
npm run --prefix apps/app packages-smoke
```

Browser acceptance выполняется через `/pw`. Форматтеры, hooks и расширенная CI
автоматизация не блокируют demo deploy.
