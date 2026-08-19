---
title: Travel Tinder Exec Infra and Architecture
status: active
updated: 2026-08-19
scope: docs/plans
---

# Travel Tinder Exec Infra and Architecture

## 0) Architecture and stack foundation

The implementation baseline for this project is fixed to `apps/app`.

### 0.1 Canonical structure

The application is planned under `apps/app` to stay aligned with current repository instructions and reduce contract/document drift.

```text
apps/app/
├── api/
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

### 0.2 Fixed stack and rationale

| Layer | Decision | Why |
| --- | --- | --- |
| Build | Vite 8.1 | SPA-first toolchain with fast HMR, shared Vite/Rolldown/Oxc pipeline, minimal configuration. |
| UI | React 19.2 | Mature TSX type path, accessible primitives ecosystem, reliable gesture integration via Motion. |
| Why not Vue | Vue remains viable, but requires additional `vue-tsc` SFC overhead in TS7 context; Vite, Vitest and Motion support both, so React is chosen to reduce integration risk. |
| Language | TypeScript 7 strict | Stable native compiler behavior and fast incremental checks. |
| Runtime | Node.js 24 LTS | Matches local runtime and Vercel default LTS support. |
| Backend | Vercel TypeScript Functions | One deploy for SPA + API; standard `Request`/`Response`; server-only secrets. |
| MCP | `@modelcontextprotocol/client` | Official client + `StreamableHTTPClientTransport`; transport opened per serverless request and explicitly closed. |
| LLM | NeuralDeep through OpenAI-compatible SDK | Structured output for intent/ideas, server-only key handling, rule-based fallback. |
| Network state | TanStack Query | Cancellation, retries, background prefetch after like, clear loading/error states. |
| Client state | Zustand + localStorage | Preference vector, swipe history, session seed, restart state; no DB required in MVP. |
| Schemas | Zod | One contract source for API I/O, LLM JSON, and normalized MCP data. |
| Motion | `motion/react` | Drag physics, velocity, AnimatePresence, touch/mouse parity, reduced motion support. |
| CSS | CSS Modules + semantic CSS tokens | Vite-native workflow, Stylelint friendly; avoids heavy utility chaining. |
| Unit/integration | Vitest 4.1 | Uses Vite transform pipeline for aligned testing behavior. |
| E2E | Playwright 1.62 | Real browser/touch/keyboard scenarios and accessibility checks. |
| Lint/format | Oxlint + Oxfmt + Stylelint | No ESLint/TSLint/Prettier in this stack; type-aware linting where practical and separate TS typecheck retained. |
| Package manager | npm workspaces | Repo already has `package-lock.json`; no second lockfile is introduced. |

Excluded in this plan:

1. React Compiler, Tailwind, SSR mode, and additional backend frameworks.
2. These choices add failure surface without reducing score-critical risk in v2.

### 0.3 Server/client boundary

1. Browser never calls NeuralDeep or Tutu MCP directly.
1. `api/*` endpoints accept only strict Zod input/output contracts.
1. NeuralDeep keys are available only inside Vercel Functions.
1. Server does not persist user sessions and does not reuse MCP transport between requests.
1. Raw MCP payload is not logged and is never returned to users.
1. Checkout URLs are validated for `https:` and Tutu host, then forwarded byte-for-byte.
1. Prompt length is capped at 600 chars; request body at 16 KB.
1. Every request logs `requestId`, `stage`, `duration`; city/prompt/family data are not fully logged in production telemetry.

## 1) Остановка/старт

**Блок 2.1 начинается сразу** после подтверждения репозитория и доступности локального окружения.

## 2) Цели и обязательства (максимальное соответствие исходному плану)

1. Инициализировать `apps/app` под выбранный стек (Vite 8 + React + TS7).
2. Настроить app runtime и сборку в единую структуру.
3. Ввести локальные и push-gate: `Justfile`, `lefthook`, `lint-staged` по changed-files.
4. Уточнить deployment-конфиг Vercel.
5. Закрыть non-dev безопасность по секретам и конфигу окружения.
6. Подготовить основу, чтобы все последующие блоки могли запускаться по `npm run --prefix apps/app ...` без drift.

## 2.1) Why this stack in infra (from source plan, unchanged)

1. **Vite 8 + React + TypeScript 7**: нативный SPA/SSR-less путь с быстрым HMR и единым Rollup/Rolldown pipeline.
2. **No Vue** в этом треке: для TS7 добавляется лишний слой проверки (`vue-tsc`) в `npm`/CI, что повышает latency при коротких сроках.
3. **No ESLint/Prettier**: линт/формат — Oxlint/Oxfmt + Stylelint.
4. **Vercel + TS Functions**: единый deploy для SPA и server-only API.
5. **Прямая совместимость с `apps/app`-структурой**, чтобы не возникало конфликтов с AGENTS и `docs/agents/verification.md`.

## 3) Шаги

1. Подготовить структуру репозитория:
1. Корень остается: `apps/app` (вся новая кодовая база только здесь).
2. В `apps/app` — `package.json` со scripts:
   - `dev`, `build`, `lint`, `format`, `format:check`, `test`, `typecheck`, `mcp-smoke`, `packages-smoke`, `preflight`.
3. Инициализировать конфиг:
   - `vite.config.ts`,
   - `tsconfig.json`,
   - `vite-env.d.ts` (или аналог),
   - `tsup`/`node` entry config не используется, если это чистый Vite SPA; иначе зафиксировать почему.
4. Добавить каркас app-слоёв:
   - `index.html`,
   - `src/main.tsx`, `src/app.tsx`,
   - роутер на `/`, `/discover`, `/guide`.

2. Наладить единый запуск и командный слой:
1. `Justfile` с шагами:
   - `just dev`
   - `just build`
   - `just lint`
   - `just format`
   - `just format:check`
   - `just test`
   - `just typecheck`
   - `just mcp-smoke`
   - `just packages-smoke`
   - `just preflight` (`format:check + lint + typecheck + test + build`)
2. Root `package.json`:
   - `npm run --prefix apps/app ...` для делегирования скриптов.

3. Ввести guardrails на push:
1. Установить/настроить `lefthook`.
2. Добавить `pre-commit`:
   - `stylecheck`/`format:check` и/или `lint-staged` в зависимости от policy;
   - минимально достаточно pre-push для enforce-механики.
3. Добавить `pre-push`:
   - запуск `lint-staged`.
   - `lint-staged` по изменённым файлам:
     - `*.ts`/`*.tsx`/`*.js`/`*.jsx` → `lint`/`typecheck` скрипт app.
     - `*.css`/`*.module.css` → `stylelint`.
     - `*.md` → doc lint/или controlled skip с комментарием в changelog.
4. Прописать fallback для отсутствующего diff-слоя:
   - если changed-only недоступен, fallback на `npm run --prefix apps/app lint`.

4. Сверху вверх deployment и секреты:
1. Создать `.vercel/project.json` либо зафиксировать dashboard-профиль (Root Directory: `apps/app`, output `dist`, Node 24).
2. Ввести `.env.example` (без секретов) и проверить, что в git нет `.env` с реальными ключами.
3. Зафиксировать matrix-экспозицию: API keys только в server runtime.

5. Стандарты качества:
1. Наименование файлов/экспорта — по `named exports` из `.cursor/rules/project.mdc`.
2. Один route policy, одна схема данных для shared contracts, никаких ad-hoc локальных API.
3. Публичный минимум: `README` + `docs/plans` должны быть на русском и консистентны со stack.

## 4) Контроль и gate

1. `apps/app` собирается, стартует dev.
2. `npm run --prefix apps/app lint` работает на changed-файлах.
3. `lefthook` реально блокирует push при нарушении правил.
4. `npm run --prefix apps/app format:check` проходит минимум на новых файлах.
5. `npm run --prefix apps/app typecheck` подтверждает TS7 strict baseline.
6. Проверка deployment: preview build и `GET /api/health` доступен после первого деплоя.
7. Проверить отсутствие tracked secret-файлов (`.env`, `.env.local`, credential-паты).

## 5) Output

1. Стабильный скелет в `apps/app`.
2. Готовый слой guardrails для всех следующих реализационных планов.
3. Подготовка окружения для `exec-backend`, `exec-frontend`, `exec-landing-onboarding`, `exec-qa`.

## 6) Связки

1. Backend, frontend, landing и QA стартуют после runtime-gate scaffold: build проходит, `/api/health` отвечает.
2. Интеграционные зависимости между блоками фиксируются в `travel-tinder-exec-roadmap.md`.
