---
title: ADR and documentation taxonomy
status: active
updated: 2026-08-17
scope: standards
---

# ADR and documentation taxonomy

**Purpose:** How to classify documentation (Diataxis) and record architectural
decisions in this repository.

**Non-goals:** Code architecture → `architecture-and-docs.md`. Naming →
`structure-and-naming.md`. Agent operations →
`agent-operations-and-security.md`.

**Owner:** Project maintainers · **Status:** Active · **Last reviewed:** 2026-08-12

## Documentation taxonomy (Diataxis)

Keep the four types separate when practical.

| Type | In this repo (approx.) | Answers |
| ---- | ---------------------- | ------- |
| **Tutorial** | Future `docs/tutorials/` if needed | “How do I learn X?” |
| **How-to** | Runbooks in technical plans / ops notes | “How do I accomplish X?” |
| **Reference** | `docs/references/`, `specs/architecture/` | “What is X exactly?” |
| **Explanation** | `docs/decisions/`, product thesis, research synthesis | “Why this way?” |

Do not mix tutorial and reference content in one file once either grows large.

## When to write documentation

- **Tutorial** — onboarding a contributor to a feature path.
- **How-to** — a repeated, non-obvious operational task.
- **Reference** — an API, schema, or configuration lookup.
- **Explanation** — a significant trade-off (also record an ADR/decision).

## ADR / decision records

Record a decision when choosing a library/framework, changing a stable data
format or public API, making a non-obvious trade-off, or deciding not to do
something that appears obvious.

### Storage

- Product-wide decisions: `docs/decisions/NNNN-kebab-title.md`.
- Local technical decisions: `specs/adr/` when scoped to an implementation slice.

### Template

Product-wide decisions in `docs/decisions/` are authored in **Russian**. The
English standard below documents the required shape and quotes the Russian
status vocabulary as literals (with glosses). Do not rewrite those labels into
English inside decision files.

```markdown
# NNNN — <Short title>

Статус: предложено | принято YYYY-MM-DD | устарело | заменено решением NNNN

## Контекст

## Решение

## Последствия
```

English gloss of the template sections: **Status**, **Context**, **Decision**,
**Consequences**. Records in `specs/adr/` MAY use their own catalog convention
until it is separately decided; do not impose the product-wide labels on them.
Within one decision record, use that record's convention consistently. A status
MAY include a date or a replacement number as shown.

| Product-wide status (literal) | Meaning |
| ----------------------------- | ------- |
| `предложено` (proposed) | Under discussion; not yet binding |
| `принято YYYY-MM-DD` (accepted) | In effect from the recorded date |
| `устарело` (deprecated) | Kept for history; no longer applicable |
| `заменено решением NNNN` (superseded) | Replaced by the named decision |

MUST NOT silently edit the substance of an accepted (`принято` / accepted)
decision. Supersede it with a new record and link the two decisions.

## Profile overlay (this project)

| Need | Location |
| ---- | -------- |
| Product MVP marketplace | `docs/product/`, `specs/` |
| Stack / cloud | `docs/decisions/0004-stack-mvp.md`, `docs/plans/` |
| Domain contracts | `specs/domain/`, `specs/features/` |

## Sources

| Practice | Source |
| -------- | ------ |
| Diataxis | [diataxis.fr](https://diataxis.fr) |
| ADR format | Michael Nygard, 2011 |
| Status convention | Existing `docs/decisions/` records in this repository |
