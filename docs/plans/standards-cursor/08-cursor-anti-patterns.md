# 08. Cursor anti-patterns

**Purpose:** Mistakes specific to Cursor rules, skills, subagents, commands, and layout.

**Non-goals:** Tool-agnostic list → [../standards/04-anti-patterns.md](../standards/04-anti-patterns.md). Duplicating the same scenario across README, `AGENTS.md`, and long skills — see **Documentation** there (one source of truth).

---

## Structure

- AVOID putting primary subagents in root `agents/` — use `.cursor/agents/`.

## Rules and skills

- AVOID pasting entire style guides into rules — use linters; rules should point at canonical files (see [Cursor blog — agent best practices](https://cursor.com/blog/agent-best-practices)).
- AVOID rules longer than 500 lines — split by domain.
- AVOID `Apply Intelligently` rules without `description` — they will not load predictably.
- AVOID one mega-skill for everything — prefer focused skills.
- AVOID commands that embed full workflows — delegate to a skill or subagent.

## Agents and subagents

- AVOID generic “helper” agents with no trigger story.
- AVOID duplicate agents with overlapping jobs.
- AVOID prompts longer than ~50 lines — move shared context into `docs/` or skills per [../standards/04-anti-patterns.md](../standards/04-anti-patterns.md) (**Documentation**).
- AVOID vague descriptions (“general tasks”).
- AVOID creating many subagents before 2–3 stable ones prove their value.

---

## Sources

| Anti-pattern                                     | Source                                                               |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| `.cursor/agents/` vs root `agents/`              | [cursor.com/docs/subagents.md](https://cursor.com/docs/subagents.md) |
| Rule length, Apply Intelligently + `description` | [cursor.com/docs/rules.md](https://cursor.com/docs/rules.md)         |
| Subagent scope / count / prompt length           | [cursor.com/docs/subagents.md](https://cursor.com/docs/subagents.md) |
| Commands vs skills                               | Editorial                                                            |
