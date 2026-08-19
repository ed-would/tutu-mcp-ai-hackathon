---
description: Produce a specification before implementation (spec-driven workflow).
argument-hint: 'feature or change description'
---

# /spec

Write a **specification** before any implementation. The spec is the contract for tests and code.

## Steps

1. Read [docs/agents/verification.md](../../docs/agents/verification.md) and [.cursor/rules/project.mdc](.cursor/rules/project.mdc) for constraints. Load [.cursor/skills/project-core/SKILL.md](.cursor/skills/project-core/SKILL.md) if the change touches application code, MCP integration, or `package.json`.
2. Gather context: search application source, `docs/tutu-mcp/`, `docs/`, and tests relevant to the request.
3. Choose a slug for the spec (short `kebab-case` filename). Create `docs/plans/<slug>.md` or `docs/specs/<slug>.md` (create the folder if missing).
4. In the spec file, include these sections (use real headings, not bold-only pseudo-headings):

   - **Goal** — one paragraph.
   - **Scope** — in / out.
   - **Acceptance criteria** — checklist items (`* [ ] ...`).
   - **Edge cases and risks** — bullets.
   - **Affected areas** — likely files or modules.
   - **Test scenarios** — bullets mapping to acceptance criteria.
   - **Open questions** — bullets, or `None`.

5. Present a short summary in chat with a link to the spec file.
6. **Stop before writing production code** unless the user explicitly approves the spec or asks to proceed to implementation.
