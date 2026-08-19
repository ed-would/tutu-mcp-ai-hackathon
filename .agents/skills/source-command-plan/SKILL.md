---
name: "source-command-plan"
description: "Produce a prefix-named implementation plan from a task or issue."
---

# source-command-plan

Use this skill when the user asks to run the migrated source command `plan`.

## Command Template

# /plan

Create an **implementation plan** from a task description (AI-driven planning with repo-specific constraints).

## Steps

1. Read [.cursor/rules/project.mdc](.cursor/rules/project.mdc) and [docs/agents/architecture.md](../../docs/agents/architecture.md). Load [.cursor/skills/project-core/SKILL.md](.cursor/skills/project-core/SKILL.md) when the task touches application code, MCP integration, or `package.json`.
2. If the argument is a URL, fetch or summarize the issue; otherwise use the inline description.
3. Search the codebase for entry points, similar patterns, and existing tests.
4. Choose a semantic prefix under `docs/plans/tinder/` for Travel Tinder work, or `docs/plans/` for cross-cutting concerns (`product-`, `architecture-`, `audit-`, `docs-`, `improvement-`, `optimization-`, `release-`) plus a short kebab-case slug. Do not use numeric prefixes.
5. Write the plan file with:
   - **Context** — problem and goal.
   - **Proposed approach** — numbered steps.
   - **Files likely to change** — bullets with one-line rationale each.
   - **Dependencies and risks** — bullets.
   - **Testing strategy** — unit vs e2e; new tests to add.
   - **Verification** — pointer to [docs/agents/verification.md](../../docs/agents/verification.md) for when to run full suite.
6. Present the plan path in chat and ask whether the user wants `/spec` next before coding.
