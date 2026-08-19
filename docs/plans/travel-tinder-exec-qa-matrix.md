---
title: Travel Tinder — Execution QA Matrix
status: active
updated: 2026-08-19
scope: docs/plans
---

# Travel Tinder — Executive QA Matrix (judge criteria evidence)

Матрица используется только для финальной проверки после выполнения всех функциональных блоков.
Критерий считается выполненным **только** при наличии указанного evidence и подтверждения gate.

## 5. Матрица критериев судейства

| Критерий | Что реализовано | Evidence (обязательный артефакт) | Gate |
|---|---|---|---|
| Theme, 10 | Prompt → idea deck → live packages → tutu.ru checkout | `/discover`, live flow traces (без MCP payload), checkout screen | `mcp-smoke` до tutu.ru |
| Depth, 15 | Idea Deck, Package Deck, Match detail, preference engine; real MCP calls: `search_multitransport`, `search_avia`, `search_hotels`, `create_checkout_link` | Код MCP orchestration + demo script | `packages-smoke` |
| UX/UI, 20 | 360-first, Tutu Lab tokens, route-thread signature, drag/buttons/keyboard alternatives, loading/empty/error states | Скриншоты критических экранов + PW checklist | PW-0…PW-6 |
| Presentation, 5 | Traveller-first pitch (10 min): проблема, инновация, рыночный рывок, обоснование | README/demo script | Dry-run ≤9 минут |
| Documentation, 10 | Полный README, `/guide`, архитектура, deploy, ограничения, актуальные agent docs | Публичные URL + repo docs links + link-check result | Финальный link check |
| Innovation, 10 | Structured LLM output, видимый preference learning, ε-greedy ranking | Preference Reveal и explanation в match | Unit tests + live demo |
| Stability, 10 | Fallback-парсер, partial result handling, timeouts, `/health`, retry strategy, smoke + E2E | Health URL + test report | Полный mandatory-command set зелёный |
| Architecture, 10 | Vite SPA, server-only Vercel Functions, shared Zod contracts, stateless backend | README diagram + `docs/agents/architecture.md` | Architecture review |
| Code quality, 10 | TS7 strict, named exports, Oxlint/Oxfmt/Stylelint, Vitest, no secrets in repo | CI/local command output | Zero lint/type/test failures |

### Привязка по подписанным под-планам

- Architecture-критерии: [docs/plans/travel-tinder-exec-infra.md](/Users/23apples/Dev/Projects/_hackathons/tutu-mcp-ai-hackathon/docs/plans/travel-tinder-exec-infra.md), [docs/plans/travel-tinder-exec-backend.md](/Users/23apples/Dev/Projects/_hackathons/tutu-mcp-ai-hackathon/docs/plans/travel-tinder-exec-backend.md), [docs/agents/architecture.md](/Users/23apples/Dev/Projects/_hackathons/tutu-mcp-ai-hackathon/docs/agents/architecture.md).
- Depth/Innovation-критерии: [docs/plans/travel-tinder-exec-backend.md](/Users/23apples/Dev/Projects/_hackathons/tutu-mcp-ai-hackathon/docs/plans/travel-tinder-exec-backend.md), [docs/plans/travel-tinder-exec-frontend.md](/Users/23apples/Dev/Projects/_hackathons/tutu-mcp-ai-hackathon/docs/plans/travel-tinder-exec-frontend.md), [docs/plans/travel-tinder-exec-qa.md](/Users/23apples/Dev/Projects/_hackathons/tutu-mcp-ai-hackathon/docs/plans/travel-tinder-exec-qa.md).
- UX/Documentation-критерии: [docs/plans/travel-tinder-exec-frontend.md](/Users/23apples/Dev/Projects/_hackathons/tutu-mcp-ai-hackathon/docs/plans/travel-tinder-exec-frontend.md), [docs/plans/travel-tinder-exec-landing-onboarding.md](/Users/23apples/Dev/Projects/_hackathons/tutu-mcp-ai-hackathon/docs/plans/travel-tinder-exec-landing-onboarding.md), [docs/plans/travel-tinder-exec-qa.md](/Users/23apples/Dev/Projects/_hackathons/tutu-mcp-ai-hackathon/docs/plans/travel-tinder-exec-qa.md), `README`.
- Stability/QA-критерии: [docs/plans/travel-tinder-exec-qa-matrix.md](/Users/23apples/Dev/Projects/_hackathons/tutu-mcp-ai-hackathon/docs/plans/travel-tinder-exec-qa-matrix.md), [docs/plans/travel-tinder-exec-qa.md](/Users/23apples/Dev/Projects/_hackathons/tutu-mcp-ai-hackathon/docs/plans/travel-tinder-exec-qa.md), `docs/agents/verification.md`.

### Evidence status contract

Для каждого критерия в матрице фиксируются:

1. статус (pass/fail/blocked/na);
2. timestamp;
3. owner;
4. URL/артефакт доказательства;
5. короткий комментарий по критическому риску;
6. план устранения блокера (если не `pass`).

Изменение статуса в `completed` разрешено только после заполнения всех пунктов выше.
