---
title: AI development standards — index
status: active
updated: 2026-08-19
scope: standards
---

# AI development standards — index

**Purpose:** Entry point for the tool-agnostic practices shared by Cursor, Codex,
Claude, and human contributors.

**Non-goals:** Cursor-only wiring (rules, skills, commands, and subagents). Those
belong under `.cursor/`. This folder is maintained manually; do not add a second
tool-specific standards tree without an explicit decision.

**Owner:** Project maintainers · **Status:** Active · **Last reviewed:** 2026-08-19

## Instruction precedence

The canonical precedence order, conflict stop behavior, and adapter boundary are
defined in `agent-operations-and-security.md`. This index only inventories the
standards; adapters MUST link to that policy rather than copy its hierarchy.

## Standards inventory

| File | Canonical scope | Owner | Last reviewed |
| ---- | --------------- | ----- | ------------- |
| `core-principles.md` | Agent-friendly organisation, context, progressive disclosure, no duplication | Project maintainers | 2026-08-12 |
| `structure-and-naming.md` | Repository layout, naming, specs, and decisions | Project maintainers | 2026-08-12 |
| `architecture-and-docs.md` | Target code architecture, documentation map, `AGENTS.md` gateway | Project maintainers | 2026-08-12 |
| `adr-and-doc-taxonomy.md` | Diataxis and ADR/decision conventions | Project maintainers | 2026-08-12 |
| `spec-driven-development.md` | Durable specs and the specify/plan/implement/verify gate | Project maintainers | 2026-08-12 |
| `doc-placement-guide.md` | Canonical one-page file-placement decision map | Project maintainers | 2026-08-13 |
| `testing-and-verification.md` | Evidence before completion and test expectations | Project maintainers | 2026-08-12 |
| `agent-operations-and-security.md` | Agent surfaces, precedence, approvals, trust boundaries, and five-route subagent orchestration | Project maintainers | 2026-08-13 |
| `observability-and-error-handling.md` | Local Pino logs, typed errors, browser recovery, PostgreSQL diagnostics, and AuditEvent separation | Project maintainers | 2026-08-13 |
| `git.md` | Branches, commits, pull requests, and user authorisation | Project maintainers | 2026-08-12 |
| `mcp.md` | MCP config, transport types, secret handling, and security; Tutu MCP project contract | Project maintainers | 2026-08-19 |

Standards files use descriptive kebab-case names without numeric prefixes. Reading
order is defined only by this inventory table, not by filenames. Decision records
in `docs/decisions/` keep their `NNNN-` prefixes (immutable log).

## This repository

- Product / research / specs / decisions: **Russian**
- `AGENTS.md` + this folder: **English** (standards prose MUST NOT mix languages;
  Russian decision-status literals appear only as quoted vocabulary with an
  English gloss)
- Spec root: **`specs/`** (not `docs/specs/`)
- Decisions: **`docs/decisions/`**
- Stack lock: `docs/decisions/0004-stack-mvp.md`
- Project verification short form: `docs/agents/verification.md`
- Canonical placement map (quick start):
  [doc-placement-guide.md](doc-placement-guide.md).

`README.md` and `DESIGN.md` are root-level human + architecture coordination files
and are intentionally excluded from this list because they are meta-operational
entrypoints for teams and agents.

## Manual maintenance

- Every standard MUST have one owner, a purpose, non-goals, and a `Last reviewed`
  date (normally in its header and reflected in this index).
- Update the canonical file first, then update links and tool adapters. Do not
  maintain parallel copies of the same rule.
- On deletion or renaming, search the repository for the old path and repair all
  references before considering the change complete.
- Re-review this index and the affected standards when the project phase,
  contracts, tool format, or security assumptions change.

## Quality gates — before publishing a standards file

- [ ] No duplicate canonical rule exists elsewhere; link instead of copying.
- [ ] Purpose, non-goals, owner, status, and last-reviewed metadata are present.
- [ ] Directive tone is used where a rule is normative (MUST / SHOULD / AVOID).
- [ ] The file is concise and self-contained enough for its intended task.
- [ ] All paths and examples are real, current, and safe for this repository.
