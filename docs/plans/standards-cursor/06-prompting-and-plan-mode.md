# 6. Prompting and Plan Mode

**Purpose:** Write effective prompts and know when to use Plan Mode before executing changes.

**Non-goals:** Does not cover rules/skills authoring — see `04-agents-and-skills.md`.

---

## Prompt structure

Use this order for any non-trivial request:

1. **Goal** — what outcome you need
2. **Context** — relevant files, constraints, prior decisions (`@file`, `@folder`)
3. **Constraints** — what must not change, performance limits, compatibility
4. **Acceptance criteria** — how to verify the result is correct
5. **Verify** — explicitly ask Agent to confirm or run tests after

Example:

```text
Goal: Add MCP response validation before showing results to the user.
Context: @docs/tutu-mcp/tutu-mcp.md, @docs/agents/mcp-integration.md — follow existing playbooks.
Constraints: Do not change the Tutu MCP endpoint URL.
Acceptance criteria: Invalid MCP JSON shows a clear error; valid responses render correctly.
Verify: Run MCP smoke test and manual demo after changes.
```

---

## Plan Mode

MUST use Plan Mode (Shift+Tab) before Agent writes code when:

- Task touches 3+ files
- Task involves a breaking change or format change
- Requirements are ambiguous or have multiple valid approaches

SHOULD skip Plan Mode for:

- Single-file edits with a clear outcome
- Routine refactors (rename, move, add a field)

Plan Mode is read-only — Agent proposes a plan and waits for your confirmation before making any changes.

SHOULD use **Save to workspace** so the plan lands in `.cursor/plans/` — shared history, easy resume, and context for later agents. Plans are Markdown: trim steps, add constraints, or fix misunderstandings before approving.

If the approved plan produced the wrong result: revert the diff, tighten the plan, and run again. SHOULD prefer that over many corrective prompts in the same thread.

---

## @-context rules

| Situation                       | Action                                                    |
| ------------------------------- | --------------------------------------------------------- |
| You know the exact file         | `@filename` — attach it directly                          |
| You need a folder               | `@src/components/`                                        |
| File is large (>300 lines)      | Attach with a line range or describe the relevant section |
| You are unsure what is relevant | Skip @-context — Agent will search the codebase           |

AVOID pasting raw file contents into chat — use `@` references instead.

---

## Model selection

| Task                                       | SHOULD use                             |
| ------------------------------------------ | -------------------------------------- |
| Simple edit, rename, format                | Fast model                             |
| Multi-file refactor, architecture analysis | Capable model                          |
| Exploration, codebase search               | Fast model (built-in Explore subagent) |

Switch models mid-conversation: use the model picker. No need to start a new chat.

---

## Debug Mode

Use Debug Mode for bugs that resist normal agent fixes (reproducible but unclear root cause, timing/races, perf, regressions). It SHOULD: form hypotheses, add targeted logging/instrumentation, have you reproduce while collecting data, then fix from evidence — not from guesses.

For simpler errors: attach message/stack, reproduction steps, and ask for analysis before a patch.

---

## Sources

| Practice                                                                           | Source                                                                                                                                                                     | Notes                                                                       |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Prompt structure (Goal / Context / Constraints / Acceptance / Verify)              | Editorial synthesis                                                                                                                                                        | Not from official Cursor docs; based on general prompt engineering practice |
| `@file` / `@folder` for context                                                    | [cursor.com/docs/rules.md](https://cursor.com/docs/rules.md) — "Reference files instead of copying"                                                                        | Confirmed                                                                   |
| Plan Mode (Shift+Tab) before code changes                                          | [cursor.com/docs/agent/plan-mode.md](https://cursor.com/docs/agent/plan-mode.md)                                                                                           | Confirmed                                                                   |
| Plan Mode = read-only, waits for confirmation                                      | [cursor.com/docs/agent/plan-mode.md](https://cursor.com/docs/agent/plan-mode.md)                                                                                           | Confirmed                                                                   |
| "3+ files → use Plan Mode" heuristic                                               | Editorial heuristic                                                                                                                                                        | Not from Cursor docs                                                        |
| @-context rules table (exact file vs folder vs large file)                         | Editorial                                                                                                                                                                  | Not from Cursor docs                                                        |
| Model selection table (fast vs capable)                                            | [cursor.com/docs/subagents.md](https://cursor.com/docs/subagents.md) — "model: fast" field; [cursor.com/docs/agent/overview.md](https://cursor.com/docs/agent/overview.md) | Partially confirmed; table structure is editorial                           |
| Debug Mode                                                                         | [cursor.com/docs/agent/overview.md](https://cursor.com/docs/agent/overview.md)                                                                                             | Confirmed as a mode in Cursor                                               |
| Save plans to `.cursor/plans/`, edit plan Markdown, restart from plan after revert | [cursor.com/blog/agent-best-practices](https://cursor.com/blog/agent-best-practices)                                                                                       | Product blog; aligns with Plan Mode UX                                      |
| Debug Mode: hypotheses, instrumentation, evidence-led fix                          | [cursor.com/blog/agent-best-practices](https://cursor.com/blog/agent-best-practices)                                                                                       | Blog description; verify against current product docs                       |
