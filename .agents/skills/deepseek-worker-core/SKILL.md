---
name: deepseek-worker-core
description: Shared protocol for the repository's external DeepSeek V4 Flash evidence worker. Load only when another deepseek-* skill delegates a bounded read-only task.
---

# DeepSeek worker core protocol

Use this protocol only through a task-oriented `deepseek-*` skill.

## Invariants

- The DeepSeek worker is read-only and receives only explicitly supplied files and Git paths.
- The parent agent owns task decomposition, repository writes, conflict resolution, security-sensitive decisions, and final approval.
- One task packet must contain one independent responsibility.
- Never use broad `*`, `**`, or `**/*` globs.
- Never send credentials, environment files, private keys, package-manager auth files, or unrelated repository context.
- Treat `critical` and `high` findings as untrusted claims until independently verified by the parent.
- A `BLOCKED` packet with `OUTPUT_BUDGET_EXHAUSTED` is an external execution failure, not a repository finding.

## Execution sequence

1. Choose the matching task profile.
2. Create a task under `.deepseek/tasks/<task-id>.json` with narrow paths.
3. Run the project's `deepseek` package script and write to `.deepseek/runs/<task-id>.json`.
4. Read the result envelope, not the original large context.
5. Consume `result.summary`, `result.findings`, `result.recommendations`, `result.unresolved_questions`, `diagnostic`, `warnings`, `usage`, and referenced paths.
6. Independently inspect the exact evidence behind every material finding.
7. Keep implementation and final judgment in the parent agent.

## Required references

- Task construction: `references/task-packets.md`
- Result handling: `references/result-handling.md`
- Package-manager commands: `references/package-manager-commands.md`
- Token budgets and incomplete responses: `references/token-budgets.md`
