---
title: Docs placement and ownership
status: active
updated: 2026-08-19
scope: standards
---

# Plans and standards

Implementation plans, pitch prep, and universal AI development standards for this hackathon repo.

## Cursor IDE standards (primary)

Cursor-specific practices: rules, skills, subagents, Plan Mode, `@` context, `.cursor/` layout.

**Start here:** [standards-cursor/00-index.md](standards-cursor/00-index.md)

| File | Topic |
| ---- | ----- |
| [01-cursor-product-alignment.md](standards-cursor/01-cursor-product-alignment.md) | Cursor-first product alignment |
| [02-cursor-workspace-layout.md](standards-cursor/02-cursor-workspace-layout.md) | `.cursor/` tree, rules, skills, agents |
| [03-cursor-ai-infrastructure.md](standards-cursor/03-cursor-ai-infrastructure.md) | Rules, skills, MCP, subagents |
| [04-agents-and-skills.md](standards-cursor/04-agents-and-skills.md) | Agent/skill/rule templates |
| [06-prompting-and-plan-mode.md](standards-cursor/06-prompting-and-plan-mode.md) | Prompts, Plan Mode, `@` context |
| [07-cursor-context-sessions.md](standards-cursor/07-cursor-context-sessions.md) | Sessions, hooks, `AGENTS.md` |
| [08-cursor-anti-patterns.md](standards-cursor/08-cursor-anti-patterns.md) | Cursor-specific mistakes |

## Cross-tool standards (companion)

Tool-agnostic AI dev standards referenced from the Cursor set above.

**Index:** [standards/00-index.md](standards/00-index.md)

High-signal entries for hackathon work:

* [standards/testing-and-verification.md](standards/testing-and-verification.md)
* [standards/mcp.md](standards/mcp.md)
* [standards/git.md](standards/git.md)
* [standards/spec-driven-development.md](standards/spec-driven-development.md)

## Implementation plans

Add prefix-named plans here as the solution takes shape (`product-`, `architecture-`, `docs-`, etc.). Naming rules: [standards/structure-and-naming.md](standards/structure-and-naming.md).

| File | Topic |
| ---- | ----- |
| [product-travel-tinder.md](product-travel-tinder.md) | Tutu Travel Tinder product and MVP direction |
| [travel-tinder-exec-roadmap.md](travel-tinder-exec-roadmap.md) | Ordered execution roadmap |
| [travel-tinder-exec-qa.md](travel-tinder-exec-qa.md) | QA and release verification steps |
| [travel-tinder-exec-qa-matrix.md](travel-tinder-exec-qa-matrix.md) | QA evidence matrix |

---

`docs` is durable documentation.  
`memory-bank` is active context.

For this repository:

* `memory-bank/` = current execution memory.
* `docs/` = durable docs used after decisions or for repeatable reference.
* `docs/archive/` = non-active, historically important, obsolete materials.

## 1) Where active docs live in `docs`

* `docs/decisions/` — accepted or superseding product/integration decisions.
* `docs/product/` — product thesis and roadmap-level context.
* `docs/plans/` — implementation choreography and delivery plans.
* `docs/standards/` — process and verification rules.
* `docs/references/` — contextual references and comparisons.
* `docs/research/` — active research evidence and evidence procedures.
* `docs/agents/` — agent workflow guidance.
* `docs/archive/` — historical/non-active but traceable records.
* `docs/templates/*` — canonical templates for this repository.

## 2) What goes to archive in docs

Move a file to archive when it is no longer active and should not guide execution:

* completed historical plans,
* old instructions,
* deprecated design directions,
* resolved handoff sets,
* superseded research summaries,
* finished idea sets, including design/concept collections.

Archive destination for all types: `docs/archive/...` (preserve former subtree when useful).

## 3) Archive strategy in this repo now

New rule:

* historical materials go to `docs/archive/` as final destination.

## 4) Placement by file type

* Handoff context:
  * active continuation: `memory-bank/handoffs/`,
  * completed: `docs/archive/handoffs/`.
* Designs / concepts:
  * active exploration: `memory-bank/design-lab/`,
  * adopted / official: `docs/` in dedicated area,
  * discarded: `docs/archive/designs/` or related archive subfolder.
* Research material:
  * active: `docs/research/*`,
  * historical: `docs/archive/`.

## 5) Triage checklist for new files

1. If behavior-constraining → `specs/`.
2. If active context → `memory-bank`.
3. If durable explanation/traceability → `docs/*`.
4. If obsolete but historically useful → `docs/archive/`.

## 6) Governance

* Keep docs paths stable once chosen.
* Preserve old filenames in archive when that helps traceability.
* Add a short note where supersession happened (`docs/README.md` parent context files).

## 7) Canonical header standard for active and archived docs

Use front-matter for all new project-level docs, except where format is already governed
by an external spec system.

```md
---
title: <Short title>
status: draft | active | accepted | superseded | archived
updated: YYYY-MM-DD
scope: <docs/decisions | plans | research | standards | references | agents>
owner: <Name/Team, optional>
next-owner: <Name/Team, optional>
source: <links to parent authoritative docs>
---
```

For durable records, also add one-line:

* `supersedes:` previous file(s), if any
* `replaced-by:` new file, if any
* `decision_basis:` short link set (if behavior is constrained)

Owner fields are optional across these docs:

* fill `owner` and `next-owner` only when ownership is explicitly transferred.
* when you work solo, they may be left empty.

## 8) Doc-gardening process (operational)

This keeps docs clean and prevents archive drift.

Doc-gardening is a **manual operational routine** (for now, no file watcher/hook yet):

* when: before each large task, after each completed handoff, and at end-of-sprint.
* who: current task owner or receiving handoff owner.
* how: check this file + `memory-bank/index.md`, then route every touched/dirty doc by status.
* cadence: light checks every 1–2 days, full checks at milestones or before handoff.

1. Validate each file against its route:
   * active, archived, or superseded.
2. Resolve freshness:
   * stale date + no active usage + no dependencies → archive or update.
3. Resolve contradictions:
   * compare with latest `specs/*`, `docs/decisions/*`, `docs/plans/*`.
4. Consolidate:
   * if two docs duplicate the same intent, keep one with freshest evidence and archive the other with `supersedes` metadata.

Keep unresolved, ambiguous, or disputed notes in `memory-bank` until a decision is made.

## 9) What counts as "memory signals"

In this repository, **memory signals** are simple metadata that make context machine-readable:

* status transitions (`active`/`dormant`/`historical`)
* `depends-on` links
* `supersedes` / `replaced-by`
* `next-actions` and continuity markers in handoff/docs

They are implemented via front-matter + index hygiene, not via separate toolchains.

## 10) Plans: `plans` vs `plans`

Current recommendation:

* `docs/plans/` — active, authoritative planning docs used in execution.
* `docs/archive/plans/` — finished or historical plans preserved for traceability.

What goes to active `docs/plans/`:

* implementation sequencing currently being executed,
* cross-functional coordination plans for the next milestones.

What should be moved to `docs/archive/plans/`:

* a plan with completed outcomes and no pending execution dependencies,
* any plan replaced by a later one (keep a short pointer to the replacement),
* abandoned experiments once their outcome is fixed.

Why this split matters:

* keeps one place to find "what we do now,"
* keeps historical records searchable without confusing current workflows.

## 11) Diataxis in this repository

We use a light-weight Diataxis approach (not a full taxonomic rewrite):

* decisions: `docs/decisions/`
* how-to / execution: `docs/plans/`
* reference / explanation: `docs/product/`, `docs/standards/`, `docs/references/`, plus specs
* context continuity: `memory-bank/` and handoff metadata

Routing rule:

* if a doc teaches a user how to do something now, it belongs to plans.
* if a doc explains concepts or gives reusable rules, it belongs to product/standards/references.
* if a doc records why a choice was locked, it belongs to decisions.
* if a doc tracks ephemeral execution memory, it belongs to memory-bank.

## 12) Google-style docs conventions we adopt

Google's developer docs guidance is practical for our size if used selectively:

* short imperative section titles;
* clear role-oriented wording;
* concise intro + "how to use" blocks;
* explicit constraints, conditions, and scope;
* minimal, consistent examples;
* style consistency in headings, capitalization, links, and callouts.

For this repo this means:

* one predictable template per doc type,
* controlled terminology (`scope`, `status`, `depends-on`, `updated`),
* no duplicate intent across folders,
* each doc either instructs, explains, defines policy, or stores active context.

Naming conventions for docs are maintained only in
[`docs/standards/structure-and-naming.md`](standards/structure-and-naming.md); keep naming details there and avoid duplicating policy.
