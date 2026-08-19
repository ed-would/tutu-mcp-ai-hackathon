---
title: Travel Tinder — Execution Plan (QA + Evidence + Freeze Checklist)
status: active
updated: 2026-08-19
scope: docs/plans
---

# Travel Tinder — План 2.5 (QA, e2e, smoke, доказательная база, freeze checklist)

## 0) Пререквизиты

1. Блоки 2.1–2.4 завершены до уровня локального compile-ready.
2. Backend, frontend и landing compile-ready; runtime-gates отмечены в roadmap.
3. Предоставлены smoke endpoints и test scripts.
4. Для финального зачета и матричной проверки используется:
   - `docs/plans/travel-tinder-exec-qa-matrix.md`.

---

## 1) Unit + integration (`Vitest`)

### 1.1) Что тестируем обязательно

1. LLM JSON success/invalid JSON/fallback.
2. <= 3 clarification questions.
3. Date range и party validation.
4. Family vs adult routing.
5. exact/estimated distinction.
6. hotel children → `children_ages`.
7. hotel stay total not multiplied by nights.
8. avia round-trip exact marking.
9. split rail/bus estimated marking.
10. preference updates + normalization.
11. ε-greedy ranking reproducible by seed.
12. malformed MCP fields не заполняются догадками.
13. partial `Promise.allSettled` remains usable.
14. checkout URL не мутируется и проверяется allowlist.
15. API error has unified fields: `code`, `message`, `retryable`, `requestId`, `stage`.

### 1.2) Покрытие contracts

1. API contracts: interpret/packages/checkout/health.
2. Preference scoring formulas.
3. Timeout policy and retry policy.
4. State persistence after reload.

### 1.3) Команды

```bash
npm run --prefix apps/app test
npm run --prefix apps/app typecheck
```

---

## 2) E2E (`Playwright`) — обязательный блок

### 2.1) Основные сценарии (`360 px` first)

1. `/` → prompt → 3 clarification.
2. idea swipe + 2 likes.
3. `/api/packages` call + package deck.
4. match + checkout redirect CTA.
5. reset/empty states.

### 2.2) Свайп альтернативы

1. drag right/left.
2. keyboard path.
3. button path.
4. desktop hover/click path.

### 2.3) Ошибки и деградация

1. family prompt не показывает неподтверждённый rail.
2. one-upstream fail => warning + non-fatal.
3. timeout => retry и сохранённый intent.
4. reset очищает localStorage.
5. partial transport/hotel path поддерживается.

### 2.4) Навигационные и accessibility сценарии

1. `/`, `/guide`, `/discover` открываются напрямую и после reload.
2. focus не теряется на sticky area.
3. `prefers-reduced-motion` отключает тяжелые полёты.
4. accessible labels для icon controls.

### 2.5) Визуальная валидация

1. Скриншоты ключевых экранов:
   - 360×800,
   - 360×844,
   - 768×1024,
   - 1440×900.
2. Проверка route-thread visibility.

### 2.6) Команда

```bash
npm run --prefix apps/app e2e
```

и/или отдельный скрипт run (по конфигу проекта).

---

## 3) Smoke и health gates

1. `npm run --prefix apps/app mcp-smoke` — обязательный live tool-ls check + schema fingerprint.
2. `npm run --prefix apps/app packages-smoke` — обязательный live package path.
3. `GET /api/health` возвращает безопасный статус `ok/degraded`.
4. Preview build + production health + checkout endpoint.

---

## 4) Lint/style/type gates

1. `npm run --prefix apps/app format:check`
2. `npm run --prefix apps/app lint`
3. `npm run --prefix apps/app test`
4. `npm run --prefix apps/app typecheck`
5. `npm run --prefix apps/app build`
6. `npm run --prefix apps/app mcp-smoke`
7. `npm run --prefix apps/app packages-smoke`
8. `npm run --prefix apps/app preflight`

Дополнительно:
- Oxlint/Oxfmt/Stylelint — как в `docs/agents/verification.md`;
- Browser acceptance строго через `/pw` (не ad hoc automation).

---

## 5) Evidence map и финальная синхронизация

1. Матрица по критериям судей:
   - Theme → `/discover`, live logs, checkout.
   - Depth → MCP orchestration + demo script.
   - UX/UI → screenshots + PW findings.
   - Documentation → README/guide/agent docs links.
   - Stability → smoke + health + retries/timeouts.
2. Для каждого элемента evidence обязательно фиксировать:
   - статус (`pass` / `fail` / `blocked`);
   - timestamp;
   - URL/артефакт;
   - owner;
   - next-step if blocked.
3. Перед матрицей:
   - ссылка на публичный deploy (Vercel),
   - ссылка на репозиторий,
   - ссылка на `/guide`,
   - ссылка на видео/walkthrough, если он есть.

---

## 6) Тестирование и acceptance criteria (финальная проверочная матрица)

### 6.1) Vitest (обязательные кейсы)

1. LLM JSON success.
2. invalid JSON.
3. timeout + fallback.
4. Не более трёх вопросов clarification.
5. Date range и party validation.
6. Family flow никогда не вызывает `multitransport`/`rail` pricing.
7. Hotel children преобразуются в `children_ages`.
8. Hotel stay total не умножается на ночи.
9. Avia round-trip маркируется `exact`.
10. Split rail/bus маркируется `estimated`.
11. Preference updates и normalization.
12. ε-greedy ranking воспроизводим по `seed`.
13. Missing MCP fields не заполняются догадками.
14. Partial `Promise.allSettled` response остаётся usable.
15. Checkout URL не пересобирается и не мутируется.
16. Malicious URL/host отклоняется (allowlist).
17. API errors имеют единый контракт: `code`, `message`, `retryable`, `requestId`, `stage`.

### 6.2) Playwright (`360px` first)

1. `/` → prompt → clarification → пять свайпов → два лайка → package deck → match → checkout.
2. Drag вправо/влево.
3. Решение через кнопки.
4. Решение через клавиатуру.
5. Семейный prompt не показывает неподтвержденный `rail`-ценник.
6. Empty hotel → transport-only result.
7. Один upstream-failure: warning, не fatal screen.
8. Timeout: retry + сохранённый intent.
9. Reload восстанавливает session state.
10. Reset очищает localStorage.
11. `/`, `/guide`, `/discover` открываются напрямую и после refresh.
12. Focus не скрывается sticky footer.
13. `prefers-reduced-motion` убирает “перелёты”.
14. Accessible names у icon controls.
15. Скриншоты ключевых экранов на 360×800, 360×844, 768×1024, 1440×900.
16. Route-thread, visual hierarchy и happy path без моков.

### 6.3) Обязательный финальный command-set

```bash
npm run --prefix apps/app format:check
npm run --prefix apps/app lint
npm run --prefix apps/app typecheck
npm run --prefix apps/app test
npm run --prefix apps/app build
npm run --prefix apps/app mcp-smoke
npm run --prefix apps/app packages-smoke
```

### 6.4) Browser acceptance

- `/pw` обязателен для UI-acceptance. Не использовать shell-Playwright.
- `/pw` в двух режимах:
  1) локальный happy path;
  2) deployed preview happy path.
- `mcp-smoke` и `packages-smoke` всегда идут в **live** Tutu MCP.

---

## 7) Freeze policy (без временных привязок)

После того как product acceptance закрыт, разрешены только:

1. исправление сломанных user flows;
2. accessibility blockers;
3. production/deploy и public link fixes;
4. documentation sync;
5. критичные security fixes.

Исключить любые косметические изменения, которые не закрывают blocker.

На этом этапе:

1. matrix lock;
2. evidence lock;
3. финальный link check;
4. commit hash + deployment URL;
5. отправка пакета ссылок.

---

## 8) Нетривиальные риски

1. `/pw` должен использовать browser tool workflow (по AGENTS — только через `/pw`, не shell automation).
2. E2E fixtures допустимы только для стабилизации чисто UI-слоя; MCP smoke не мокируется.
3. После freeze запрещены изменения stack/docs, не относящиеся к blockers.
