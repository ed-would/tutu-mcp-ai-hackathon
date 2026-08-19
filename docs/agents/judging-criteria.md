# Judging criteria — agent directive

**This document is a primary driver for all development decisions.**

Every feature, design choice, and implementation detail must be evaluated against these criteria first. When in doubt about scope or priority — refer here.

Source: [hackathon-rules.md](../rules/hackathon-rules.md). Deadline: **21:20 MSK, 19 Aug 2026**.

---

## Scoring (100 points)

**Product — 80 pts · Tech — 20 pts**

### Product — 80 points

| Criterion | Pts | What satisfies it | Status |
| --------- | --- | ----------------- | ------ |
| Theme — travel task fit | 10 | Prompt → ideas → packages → tutu.ru checkout; Tutu MCP as live data source (not mocked) | ☐ |
| Depth — functional coverage | 15 | Idea Deck + Package Deck + Match detail; preference engine; real MCP calls (`searchMultitransport`, `searchAvia`, `searchHotels`, `create_checkout_link`) | ☐ |
| UX/UI quality | 20 | Mobile-first `PhoneShell`; Tutu brand tokens; swipe without drag; RU copy; loading/empty states | ☐ |
| Presentation | 5 | 10-min pitch; four required blocks covered; live demo | ☐ |
| Documentation — AI-checked | 10 | `docs/plans/tinder/*`, `docs/tutu-mcp/`, `docs/agents/`, `AGENTS.md`; interactive onboarding in app | ☐ |
| Innovation | 10 | Visible preference learning (`PrefMeter`); LLM structured output; ε-greedy ranking | ☐ |
| Stability | 10 | Fallbacks (`fallbackIntent`), `/health`, timeouts; smoke tests pass; PW gates pass | ☐ |

### Tech — 20 points

| Criterion | Pts | What satisfies it | Status |
| --------- | --- | ----------------- | ------ |
| Architecture — AI-checked | 10 | Clear server/client split; server-only MCP/LLM; Route Handlers for all external APIs; see [architecture.md](architecture.md) | ☐ |
| Code quality — AI-checked | 10 | Named exports throughout; Zod schemas; Vitest tests; no secrets committed | ☐ |

**Self-check total:** ___ / 100

---

## Agent rules derived from criteria

### Always

* **UX/UI is 20 pts** — the single heaviest criterion. Every UI decision must prioritise clarity, mobile feel, and Tutu brand tokens. Never ship a screen without loading and empty states.
* **Documentation is AI-checked (10 + 10 + 10 pts)** — keep `docs/` accurate and complete at all times. Outdated docs directly lose points.
* **Stability is 10 pts** — every new API route needs error handling and fallback. Run smoke tests before claiming a feature done.
* **Innovation is 10 pts** — surface ML/AI decisions visibly in the UI (e.g. `PrefMeter`). Don't hide them in server logic only.
* **Tutu MCP must be the live data source** — never replace MCP calls with mocked data in production paths.

### Presentation blocks (required, 5 pts)

The pitch must cover all four blocks:

1. **Инновация** — принципиальная новизна, отличие от рынка.
2. **Рыночный прорыв** — незакрытый спрос, который захватывается.
3. **Проблема** — конкретная боль пользователя / бизнеса.
4. **Обоснование решения** — логика, данные, инсайты почему этот подход лучше.

---

## Evidence map

### Theme (10)

* README jury note: swipe / «тиндер» for travel.
* Tutu MCP is the travel data source.

**Files:** `README.md`, `apps/web/src/lib/mcp/*`

### Depth (15)

* **Hybrid flow:** Idea Deck → Package Deck → Match detail.
* **Preference engine:** `apps/web/src/lib/prefs/` + `PrefMeter`.
* **Package builder:** `apps/web/src/lib/packages/buildPackages.ts`, `rankPackages.ts`.

### UX/UI (20)

* Brand tokens in `apps/web/src/app/globals.css` — see [brand-tokens.md](../plans/tinder/brand-tokens.md).
* Swipe without drag (`DeckActions` buttons).
* Visual QA: [pw-checklist.md](../plans/tinder/pw-checklist.md).

### Documentation (10) — AI-checked

| Doc | Purpose |
| --- | ------- |
| `docs/plans/tinder/` | Product, architecture, brand, NeuralDeep, MCP playbooks |
| `docs/tutu-mcp/tutu-mcp.md` | Live tool reference |
| `docs/agents/` | Agent instructions |
| `AGENTS.md` | Commands and entry point |

**Bonus:** interactive docs in the web app (onboarding, tooltips, live examples).

### Innovation (10)

* Like-learning visible in UI (`PrefMeter`, pref vector updates on swipe).
* LLM structured output for intent/ideas (`json_schema`).
* ε-greedy package ranking for exploration vs exploitation.

### Stability (10)

| Mechanism | Location |
| --------- | -------- |
| LLM rule fallback | `apps/web/src/lib/llm/fallbackIntent.ts` |
| Health endpoint | `apps/web/src/app/api/health/route.ts` |
| MCP smoke | `pnpm --dir apps/web mcp-smoke` |
| Package smoke | `pnpm --dir apps/web packages-smoke` |
| Error UI | `apps/web/src/lib/api/error.ts` |
| Playwright gates | [pw-checklist.md](../plans/tinder/pw-checklist.md) |

### Architecture (10) — AI-checked

* Single deployable unit: `apps/web` (Vercel root).
* Server/client split — see [architecture.md](architecture.md).
* No server-side session memory; Zustand + localStorage.

### Code (10) — AI-checked

* Named exports throughout `apps/web/src`.
* Zod: `apps/web/src/lib/llm/schemas.ts`, MCP types.
* Tests: `prefs.test.ts`, `rankPackages.test.ts`, `dates.test.ts`.
* Secrets: `.env.local` only; `.env.example` template.

---

## Submission checklist

Deadline: **21:20 MSK, 19 Aug 2026** (freeze at 21:00).

* [ ] Working prototype link accessible
* [ ] User documentation link accessible — особое внимание
* [ ] Public repo link (code docs as bonus)
* [ ] All links verified — broken = not counted
* [ ] No commits after 21:00 MSK

## Pre-pitch gates

| Gate | Requirement |
| ---- | ----------- |
| PW-5 | Local full happy-path — [pw-checklist.md](../plans/tinder/pw-checklist.md) |
| PW-6 | Deployed URL repeat (ideal) |
| Smoke | `mcp-smoke` + `packages-smoke` pass |
| Pitch | Dry-run ≤ 10 min |
