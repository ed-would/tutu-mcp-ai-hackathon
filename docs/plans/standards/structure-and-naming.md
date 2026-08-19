---
title: Structure and naming
status: active
updated: 2026-08-17
scope: standards
---

# Structure and naming

**Purpose:** Repository layout and naming conventions without IDE-specific
configuration trees.

**Non-goals:** `.cursor/` rules, skills, and commands → `.cursor/` (see
`AGENTS.md`). Architecture narrative → `architecture-and-docs.md`.

**Owner:** Project maintainers · **Scope:** Repository layout and naming
**Status:** Active · **Last reviewed:** 2026-08-12

## Repository layout

The repository is currently docs/spec-first. The application directories shown as
*target state* are architectural intent, not paths that an agent may assume exist.

```text
repo-root/
├── AGENTS.md                 # Agent entry
├── README.md                 # Human product entry
├── docs/
│   ├── product/              # Thesis, MVP plan, validation
│   ├── plans/      # Implementation skeletons
│   ├── decisions/            # Decision log / ADRs (product-wide)
│   ├── references/           # External tech notes
│   ├── research/             # Market research + archive
│   ├── standards/            # This folder (tool-agnostic)
│   └── agents/               # Short agent-facing ops (e.g. verification)
├── specs/                    # Code contracts (SDD)
│   ├── domain/
│   ├── features/
│   ├── architecture/
│   └── adr/                  # Local architecture ADRs
├── memory-bank/              # Operational memory (optional)
└── app/ server/ …            # TARGET STATE: Nuxt app when scaffolded
```

Agents MUST inspect the tree before writing to a target-state path. SHOULD
document IDE directories such as `.cursor/` in `AGENTS.md` so contributors know
what is committed and what is host-specific.

## Naming rules (single source of truth)

### Single source of truth

`docs/standards/structure-and-naming.md` is the canonical rule-set for file and folder naming
for repository docs. Other readmes and templates should reference this file instead of
repeating the naming policy.

### Files and folders

- MUST use **lowercase kebab-case** for generated/project documentation files:
  `order-lifecycle.md`, `0004-stack-mvp.md`.
- AVOID spaces, `UPPER_SNAKE_CASE.md`, or CamelCase for those files.
- **Keep canonical conventions for established top-level/standard files**.
  These are excluded from kebab-case because they are ecosystem/service conventions.
  Start with this non-exhaustive set:
  `AGENTS.md`, `README.md`, `DESIGN.md`, `SKILL.md`, `CHANGELOG.md`,
  `LICENSE.md`, `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
  `PRIVACY.md`.
- Similar convention-based files may also stay in their long-standing names (for
  example: `agent.md`, `cloud.md`, `design.md`, `soul.md`) when they are canonical
  entry points and not standard content docs.

### Memory-bank placement (operational vs canonical docs)

- `docs/**` and `specs/**` are canonical sources of truth for
  implementation-facing rules, decisions, interfaces, contracts, and durable
  architecture.
- `memory-bank/` is operational memory for work-in-progress state:
  - current-state snapshots,
  - open assumptions,
  - experiment logs/results,
  - next actions,
  - operational handoff notes and temporary context.
- Practical rule:
  - if the document is used to **authorize implementation** or define durable
    expectations, it belongs in canonical locations;
  - if it is used to **track decisions, transitions, and open questions** for this
    run/session, it belongs in `memory-bank/`.
- Memory-bank files can be updated frequently and later retired/archived.

### `specs/`

- MUST keep feature/domain/architecture contracts under `specs/` (not
  `docs/specs/`).
- SHOULD use one concern per file; see `specs/README.md`.
- Feature files use kebab-case slugs (`order-board.md`, `hitl-operator.md`).

### `docs/decisions/`

- MUST use a numeric prefix plus kebab-case: `0004-stack-mvp.md`.
- Supersede an accepted decision with a new decision; do not silently rewrite it.

### `docs/standards/`

- MUST use descriptive kebab-case **without** numeric prefixes:
  `testing-and-verification.md`, not `08-testing-and-verification.md`.
- Reading order lives only in `docs/standards/README.md`.

### `docs/plans/`

- SHOULD use clear kebab-case names aligned with areas:
  `backend.md`, `frontend.md`, `database.md`.

### Naming style policy

- For documentation/specs across the repo we keep one case style: lowercase
  kebab-case.
- `UPPER_SNAKE_CASE`/screaming style is usually avoided because it adds no
  functional advantage and increases drift in shell tooling, case-sensitive
  environments, and search ergonomics.
- Allowed exceptions: `README.md`, `AGENTS.md`, `SKILL.md`,
  `CHANGELOG.md`, and platform-level docs in repo conventions.

## Sources

| Rule | Source |
| ---- | ------ |
| `specs/` as contract root | This repo (`specs/README.md`) |
| Decision numeric prefixes | This repo (`docs/decisions/`) |
| Kebab-case Markdown | Editorial |
