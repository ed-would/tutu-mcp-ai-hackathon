---
title: Spec-driven development (SDD)
status: active
updated: 2026-08-17
scope: standards
---

# Spec-driven development (SDD)

**Purpose:** Write durable specifications before implementation. Specs are the
primary agent input, not a verbal task dump.

**Non-goals:** Tool-specific planning UX → host adapter documentation. Testing →
`testing-and-verification.md`. ADR taxonomy → `adr-and-doc-taxonomy.md`.

**Owner:** Project maintainers · **Status:** Active · **Last reviewed:** 2026-08-12

## The core idea

A **spec** states what must be true and how success is measured. A **plan** states
how to implement it. The plan may live in a technical-plan document or a host's
temporary workflow, but a host command is never a prerequisite for SDD.

In this repo:

- Specs → **`specs/`**
- Implementation skeletons → `docs/plans/`
- Product ordering → `docs/product/mvp-implementation-plan.md`

## Where specs live

- MUST put feature specs in `specs/features/`.
- MUST put entities and lifecycles in `specs/domain/`.
- MUST put system/API boundaries in `specs/architecture/`.
- SHOULD use `specs/adr/` or `docs/decisions/` for recorded choices.
- Follow `specs/README.md` for status, owner, dependencies, acceptance criteria,
  and open questions.

AVOID creating a parallel `docs/specs/` tree.

## When a durable spec is required

| Situation | Required record |
| --------- | --------------- |
| Trivial, single-file, non-contract change | No new spec; record acceptance detail in the task if useful |
| Small non-contract change across two files | Extend the nearest existing spec or add concise acceptance criteria |
| Any API or domain entity/status/lifecycle change | MUST update or add a durable spec, even if implementation touches one file |
| Multiple modules, public boundary, or competing approaches | MUST update/add a durable spec and, when a choice is significant, an ADR |

The durable spec is the gate for implementation. Do not defer a required contract
to chat history or infer it from an unaccepted plan.

## Feature spec shape

Feature specs MUST use the full metadata contract in `specs/README.md`:
`spec_id`, `title`, `status`, `scope`, `owner`, `dependencies`, `last_reviewed`,
`canonical_decision`, and `review_trigger`. Do not replace that contract with an
abbreviated metadata block. All keys are mandatory; use an empty list or `NONE`
only where the current contract explicitly permits it.

The body template is:

```markdown
# <Feature title>

## Goal

## Scope

- In: …
- Out: …

## Acceptance criteria

- [ ] …

## Open questions

- …
```

Align sections with existing files in `specs/features/` when extending them.
`/spec` (or an equivalent host workflow) MAY create or update a durable spec with
`DRAFT` or `PROPOSED` status, but those statuses do not authorize implementation.
Implementation MUST wait until the spec has an accepted A-gated governance status
(normally `ACCEPTED`, or an explicitly governed accepted variant such as
`POST_DEMO_ACCEPTED`) and a named owner.

## Gated workflow

1. **Specify** — update `specs/` and resolve or explicitly track open questions.
2. **Plan** — record implementation sequencing in `docs/plans/` when
   the work is non-trivial.
3. **Implement** — work against the accepted scope and acceptance criteria.
4. **Verify** — apply `docs/agents/verification.md` and
   `testing-and-verification.md`.

Agents SHOULD NOT start large implementation until the required spec is agreed.
If the spec and an instruction conflict, stop and report the conflict.

## Spec as agent context

- Attach or reference `specs/...` rather than pasting whole specifications.
- Quote the relevant acceptance criteria when claiming completion.
- Update the spec when implementation or an accepted decision changes its scope.

## Pitfalls (AVOID)

Vague tickets; prose novels without testable criteria; over-specified class-level
design; static specs that are never updated after decisions.

## Sources

| Practice | Source |
| -------- | ------ |
| Spec-driven kits | GitHub Spec Kit; Addy Osmani — good specs for AI |
| AGENTS.md lessons | GitHub blog — great AGENTS.md |
| In-repo catalog | `specs/README.md` |
