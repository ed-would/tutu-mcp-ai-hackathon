---
title: Testing and verification
status: active
updated: 2026-08-17
scope: standards
---

# Testing and verification

**Purpose:** Agents verify work before declaring it done.

**Non-goals:** Spec writing → `spec-driven-development.md`. Git →
`git.md`. Project short form → `docs/agents/verification.md`.

**Owner:** Project maintainers · **Status:** Active · **Last reviewed:** 2026-08-13

## The core rule

**Agents MUST NOT claim a task is done without verification evidence.** “It should
work” is not evidence. Report what was checked, the exact command or inspection,
and any check that could not run.

## Phase awareness (this repo)

### Docs / specs only (current)

Until application `package.json` exists:

- MUST check alignment with `specs/`, `docs/decisions/`, and relevant docs.
- MUST NOT invent passing `npm run build`, `npm run test`, or lint results.
- Report: `docs-only verification policy applied`.

### Application present

When the app and scripts exist, run the applicable checks unless the documented
verification policy grants a docs-only exception:

| Check | Canonical command |
| ----- | ----------------- |
| Build | `npm run build` |
| Tests | `npm run test` |
| Lint | `npm run lint` |
| Orchestrator | `just` |

The canonical documentation and report spelling is `npm run test`. `npm test` is
only npm shorthand for the same package `test` script, not a separate check.
`just` is the required orchestration layer for local `app`, `worker`, and `db`
command families.

Optional checks include `npm run test:coverage`, `npm run test:e2e`, and database
migration checks when schema changes. Exact script names live in `AGENTS.md` and
`package.json` once scaffolded; never claim a command was run if it does not exist.

## Test ownership

The primary implementation agent MUST write or adjust tests from the applicable
acceptance criteria as part of the change. The independent verifier MUST review
that test coverage, its mapping to the criteria, and the reported evidence; the
verifier does not replace the implementation agent's test-authoring duty.

The required TDD depth is risk-driven:

- Security, cryptography, idempotency/CAS, queue/retry/crash semantics, tenant
  boundaries, provider adapter contracts, and cross-layer transitions are
  **TDD-mandatory**.
- High-complexity integration paths should follow TDD first; lower-risk "boilerplate"
  modules (typed projections, simple CRUD handlers, routine UI scaffolding) can be
  implemented first and then tested to preserve speed.
- For all categories, every change must still end with explicit traceability from
  `specs/features` acceptance criteria to executed checks.

## Test-driven agent workflow (targeted)

1. For TDD-mandatory paths: write a failing test expressing an acceptance
criterion from `specs/`.
2. Implement the smallest change that passes it.
3. Run the relevant suite and fix regressions.
4. Refactor with tests green and report the evidence.
5. For non-mandatory paths: implement in small steps first, then add a test that
   proves the implemented behaviour before handoff.

AVOID adding non-trivial behaviour without a test or explicit acceptance reason.

## Smoke / manual checks

For hard-to-unit-test paths (auth redirects, HITL, Yandex Cloud):

- SHOULD list smoke steps in the feature spec.
- Ask the agent to execute them when the environment allows.
- Record blocked checks and the reason instead of converting expectation into fact.

Until an application and release surface exist, no agent may claim release
readiness. Pre-release evidence is reviewed by the independent verifier under
this standard; release/deploy roles and checklists are deferred (see
`architecture-and-docs.md`).

## Test conventions (target)

| Convention | Rule |
| ---------- | ---- |
| Unit/integration | Vitest |
| DB integration | Vitest + PostgreSQL 17 test provider (`@testcontainers/postgresql`) |
| E2E | Playwright |
| Location | Co-located or `tests/` per Nuxt norms once chosen |
| Scope | Map to `specs/features/` acceptance criteria |
| Avoid | Live cloud credentials in CI without secrets tooling |
| Lint | `oxlint`, `oxfmt`, `stylelint`, migration/invariant checks for SQL |

### Command families for local execution (`just`)

Local execution profile for app work is standardized around `just` targets:

- `just fe` and `just be` for separate frontend/backend startup.
- `just hooks-install` for local lefthook bootstrap.
- `just lint-frontend`, `just lint-backend`, `just lint-style`, and `just lint`
  for separate and combined linting.
- For every lint domain, both base and auto-fix modes are explicit:
  - `just lint-frontend` / `just lint-frontend-fix`,
  - `just lint-backend` / `just lint-backend-fix`,
  - `just lint-style` / `just lint-style-fix`,
  - combined `just lint` / `just lint-fix`.
- `just lint-staged` and `just lint-staged-fix` run staged-file-aware checks for pre-commit path.

## Sources

| Practice | Source |
| -------- | ------ |
| TDD loop | Classic TDD / Fowler |
| Verification before completion | Editorial; verifier subagent pattern |
| Project phase rules | `docs/agents/verification.md` |
