---
title: Architecture and documentation
status: active
updated: 2026-08-17
scope: standards
---

# Architecture and documentation

**Purpose:** How application code and documentation fit together, and what the
root `AGENTS.md` gateway should contain.

**Non-goals:** File naming → `structure-and-naming.md`. ADRs and taxonomy →
`adr-and-doc-taxonomy.md`. Agent trust, approvals, and tool surfaces →
`agent-operations-and-security.md`. Cursor templates → `.cursor/`.

**Owner:** Project maintainers · **Status:** Active · **Last reviewed:** 2026-08-12

## Code architecture (target state — ADR 0004)

The Nuxt application is not scaffolded yet. Once it exists, agents MUST preserve
the following boundaries unless a newer accepted decision supersedes them:

- UI and domain-facing modules under `app/` (Nuxt-idiomatic modules).
- Thin `server/api` adapters for transport concerns.
- Business logic in `server/services`.
- Shared Zod schemas and types in `shared/`.
- Drizzle schema and migrations for Postgres.
- Small, clearly scoped modules; AVOID god-files.
- MUST use `path.join` or the project-supported `pathe` helper for paths; AVOID
  hardcoded platform-specific separators.
- MUST surface errors with useful context; AVOID empty catches or swallowed errors.
- MUST NOT invent domain behaviour missing from `specs/`.

Do not create or describe these paths as present before the app scaffold lands.
The stack and target layout are governed by `docs/decisions/0004-stack-mvp.md`.

## MVP product boundary

Do not expand the MVP ICP to enterprise or government customers without an
accepted product decision. Research may describe those segments as future context,
but implementation and MVP scope must remain within the accepted contract.

## Documentation as architecture

| Area | Role |
| ---- | ---- |
| `docs/product/` | What we build and MVP readiness |
| `docs/plans/` | How areas will be implemented |
| `docs/decisions/` | Why significant choices were made |
| `specs/` | Contracts for code (entities, features, API) |
| `docs/research/` | Evidence base (archive ≠ current operations) |
| `docs/standards/` | Tool-agnostic working practices |
| `docs/agents/` | Short agent operations (for example verification) |

Significant architecture changes SHOULD have a decision record. Use the taxonomy
and template in `adr-and-doc-taxonomy.md`; do not duplicate that policy here.

Major documentation-tree restructures (bulk moves, renames, or deletions) MUST
receive explicit owner approval before they are applied. After approval, update
the standards index and all affected links in one coherent change; the general
approval boundary is defined in `agent-operations-and-security.md`.

## Release operations (deferred)

The application and release surface do not exist yet. Release/deploy roles and a
release checklist are therefore deferred until the app and its operational
workflow are present. Until then, pre-release evidence is a verification concern
covered by `testing-and-verification.md` and its independent verifier role.

## `AGENTS.md` as agent gateway

Keep it short and actionable. It should contain:

- project purpose (one to three sentences);
- stack and phase (docs-first versus app);
- key paths and quickstart commands (or “not yet”);
- non-negotiables and links to the canonical standards/specs.

It MUST NOT duplicate the full README, dump an entire tree, or embed a multi-page
workflow. Put detail in the canonical document and link to it.

## Sources

| Principle | Source |
| --------- | ------ |
| `AGENTS.md` as root brief | [GitHub — great AGENTS.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/) |
| Progressive disclosure | [A Complete Guide To AGENTS.md](https://www.aihero.dev/a-complete-guide-to-agents-md) |
| ADR for major decisions | `adr-and-doc-taxonomy.md` |
