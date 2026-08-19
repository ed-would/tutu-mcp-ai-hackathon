---
name: project-standards
description: This skill should be used when the user asks to document or regenerate repository standards, refresh stale content in docs/plans/standards/ after a large refactor, or produce thematic standards markdown with mermaid diagrams—for example requests like "generate standards docs", "describe code standards for this repo", "create a standards document", or "document our engineering conventions". Do not substitute this skill for routine feature work or bugfixes; use project-core for implementation tasks.
---

# Tutu MCP Hack — Project Standards Skill

## When to use this skill

- Invoke when the user explicitly asks to generate standards documentation (for example "generate standards docs", "describe code standards", "create a standards document for this repo", or similar).
- Invoke when a significant refactor is complete and the existing standards docs in `docs/plans/standards/` are stale.

## When NOT to use this skill

- Do not auto-invoke on every request — only on explicit user instruction.
- Do not use when the task is to implement code or fix a bug; follow the `project-core` skill instead.

## Role

Work as a **technical writer**.

- Read application code, MCP integration, and Cursor automation layout.
- Collect **explicit and implicit project standards** from actual code and existing rules/documentation.
- Format them as a set of versioned, navigable markdown files in `docs/plans/standards/`.

## Analysis scope

- Code and structure: application source (when present), `docs/tutu-mcp/`, `.cursor/rules/`, `.cursor/skills/`, `.cursor/agents/`
- Documentation: `AGENTS.md`, `docs/agents/`, `docs/plans/standards-cursor/` (universal Cursor standards — do not overwrite unless asked)

Do not analyze `node_modules/` or generated build artifacts.

## Workflow

1. **Gather context** — review key files from the Analysis scope.
2. **Draft documentation structure** — outline which standards belong in which files.
3. **Write to `docs/plans/standards/`** — one logical block per `.md` file; add `00-index.md` if missing.
4. **Use mermaid diagrams** for architectural and process flows where helpful.
5. **Output** — list files created/updated with one-line descriptions.

## Done criteria

- Identified standard blocks have corresponding `.md` files in `docs/plans/standards/`.
- Each file contains at least one verifiable rule statement (must/should/may).
- `docs/plans/standards/00-index.md` lists all project-specific standard files.

## Constraints

- Do not modify source code — read it only to derive standards.
- Do not overwrite `docs/plans/standards-cursor/` (universal Cursor standards) unless the user explicitly asks.
- Base standards on actual code, `.cursor/rules/`, `AGENTS.md`, and existing docs.
