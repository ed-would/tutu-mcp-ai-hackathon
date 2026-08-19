---
title: Document placement guide (single source of truth)
status: active
updated: 2026-08-17
scope: standards
---

# Document placement guide (single source of truth)

Use this guide when deciding where a new file belongs.

## 1) Contract-first outputs (must live in `specs/`)

- Domain and architecture entities, states, enums, constraints.
- API contracts and feature acceptance criteria.
- Anything that directly constrains implementation behavior.

If a file defines what code must do or what is forbidden at runtime, it belongs in
`specs/`.

## 2) Product/implementation decisions (in `docs/decisions/` or product plans)

- Scope changes, overlays, policy clarifications.
- Trade-off or migration decisions that change implementation direction.
- Sequencing and ownership choices that are not themselves code contracts.

If a file says “what we choose” at governance level, put it in
`docs/decisions/`, `docs/product/`, or `docs/plans/` (depending on scope).

## 3) Workstream execution plans (`docs/plans/`)

- Block-by-block plans, dependencies, pipelines, and checkpoints.
- How-to for implementing backend/frontend/db/integrations.
- Frontend/backend implementation sequence and test intent ownership by stream.

Use this for plans and execution choreography.

## 4) Verification and standards (`docs/standards/`)

- Process, naming, testing, security posture, QA, and agent operation rules.
- Any instructions that apply to all contributors and agent workflows.

If it defines “how we work together and verify,” it belongs here.

## 5) Research and evidence (`docs/research/`)

- Raw research, synthesis, audit evidence, and external-facing plans.
- Historical notes and context snapshots used to justify design choices.

Not contract-direct by default; keep links and traceability to canonical surfaces.

## 6) External/contextual references (`docs/references/`)

- Comparative notes, candidate approaches, market snapshots.
- Benchmarking or style inspirations that are not yet authorized for production use.

This folder is not contract authority unless explicitly re-homed into decisions/contracts.

## 7) Working memory (`memory-bank/`)

- Current state, assumptions, experiments, and next actions.
- Rapidly changing operational notes and handoff context.

If it is transient, evolving, or session-bound, keep it here.

## Quick routing decision

If a file can be read by agents to build or validate implementation behavior, it
belongs to one of the canonical sources above. If it is only context for the next
review cycle or current backlog status, put it into `memory-bank/`.
