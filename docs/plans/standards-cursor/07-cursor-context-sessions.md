# 7. Cursor context, sessions, and hooks

**Purpose:** Cursor-specific context features: `@` references, hooks, and boundaries between `AGENTS.md`, `project.mdc`, and `.cursorrules`.

**Non-goals:** Generic token discipline → [../standards/03-context-and-tokens.md](../standards/03-context-and-tokens.md). Prompt template and Plan Mode → `06-prompting-and-plan-mode.md`.

---

## @-references

General habits (minimum context, avoid huge pastes, phased work) live in [../standards/03-context-and-tokens.md](../standards/03-context-and-tokens.md). In Cursor:

- MUST reference targets with `@file` or `@folder` instead of pasting raw file bodies.
- SHOULD use skills and rules for repeated instructions.

See also `@`-context table in `06-prompting-and-plan-mode.md`.

---

## Subagent isolation

Long research or exploration bloats the main thread. Use a subagent or Cursor’s **Explore** subagent — the parent receives a summary only.

Templates: `04-agents-and-skills.md`.

---

## Session and memory

When to split threads and how to treat `AGENTS.md` as an anchor — see **Session hygiene** in [../standards/03-context-and-tokens.md](../standards/03-context-and-tokens.md). In Cursor, when the model loops or contradicts earlier state, start a new chat and re-anchor with **`@AGENTS.md`**.

### Anchors

- SHOULD start non-trivial work with `@AGENTS.md` and a short task line.
- SHOULD use **`@Past Chats`** when a new thread needs prior discussion without pasting transcripts.
- SHOULD use **`@Branch`** for branch-scoped questions — confirm current product support in [Cursor docs](https://cursor.com/docs).

---

## Hooks

Session hooks run at Agent session start. Use for small, always-needed context (e.g. date, status).

- SHOULD keep hook body short (< ~20 lines) — hooks cost tokens every run.
- AVOID duplicating `AGENTS.md`, linked agent docs under `docs/agents/`, or rules.

---

## Three always-applied files

| File                                              | Read by         | Role                                                |
| ------------------------------------------------- | --------------- | --------------------------------------------------- |
| `AGENTS.md`                                       | Many agents     | Project brief; link deeper docs                     |
| `.cursor/rules/project.mdc` (`alwaysApply: true`) | Cursor          | Thin guardrails, skill pointers, unique conventions |
| `.cursorrules`                                    | Cursor (legacy) | Thin shim — SHOULD point at `AGENTS.md`             |

Rules:

- MUST keep `alwaysApply: true` rules compact (SHOULD ≤ ~25 lines of substantive instruction).
- MUST NOT duplicate the same facts across all three.
- SHOULD trim `.cursorrules` once `AGENTS.md` is canonical.

---

## Review, parallelism, cloud agents

- Parallel local agents and git worktrees — [../standards/03-context-and-tokens.md](../standards/03-context-and-tokens.md) (**Parallelism and review**).
- **Cloud agents** vs local — pick by latency and sandbox; see [Cursor blog — agent best practices](https://cursor.com/blog/agent-best-practices) and verify in current docs.

---

## Sources

| Practice                 | Source                                                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `@file` / `@folder`      | [cursor.com/docs/rules.md](https://cursor.com/docs/rules.md)                                                                 |
| Skills / rules rationale | [cursor.com/docs/skills.md](https://cursor.com/docs/skills.md), [cursor.com/docs/rules.md](https://cursor.com/docs/rules.md) |
| Subagents / Explore      | [cursor.com/docs/subagents.md](https://cursor.com/docs/subagents.md)                                                         |
| Hooks                    | [cursor.com/docs/rules.md](https://cursor.com/docs/rules.md)                                                                 |
| `@Past Chats`, `@Branch` | [cursor.com/blog/agent-best-practices](https://cursor.com/blog/agent-best-practices)                                         |
| AGENTS.md                | [cursor.com/docs/rules.md](https://cursor.com/docs/rules.md)                                                                 |
