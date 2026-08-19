# 4. Agents, Skills, and Commands

**Purpose:** Templates and decision rules for subagents, skills, commands, and rules.

**Non-goals:** Generic repo layout → [standards/02-structure-and-naming.md](../standards/02-structure-and-naming.md). Cursor `.cursor/` tree → `02-cursor-workspace-layout.md`. Generic anti-patterns → [standards/04-anti-patterns.md](../standards/04-anti-patterns.md); Cursor-specific → `08-cursor-anti-patterns.md`.

---

## When to use what

| Need                                             | Use                              |
| ------------------------------------------------ | -------------------------------- |
| Persistent coding standard applied every session | Rule (`Always Apply`)            |
| Coding standard applied to specific files        | Rule (`Apply to Specific Files`) |
| Single-purpose repeatable workflow               | Skill                            |
| Complex multi-step task with context isolation   | Subagent                         |
| Shortcut that delegates to a skill/agent         | Command                          |

**Skills = primitives. Subagents = domain specialists and orchestrators.**

---

## Subagent template (`.cursor/agents/<name>.md`)

```markdown
---
name: <kebab-case>
description: <What it does>. Use when <specific trigger condition>.
model: inherit # or: fast (for simple/cheap tasks)
readonly: false # true if agent must never write files
background: false # true for long-running parallel tasks
---

You are a <role> specialising in <domain>.

When invoked:

1. <Step 1>
2. <Step 2>
3. <Step 3>

Output format: <list / diff / checklist / summary>.
Stop when: <clear completion condition>.
```

> MUST: Keep description specific — it is what Agent uses to decide when to delegate.
> AVOID: Prompts longer than ~50 lines; move shared context to docs/ or skills.
> Start with 2–3 focused agents. Add more only when you have clear, distinct use cases.

---

## Skill template (`.cursor/skills/<domain>/SKILL.md`)

```markdown
---
name: <kebab-case> # must match parent folder name
description: <What this skill does and when to invoke it>.
disable-model-invocation: false # true = only runs when explicitly called with /name
---

## When to Use

- Use this skill when <trigger condition>.

## Steps

1. <Step 1>
2. <Step 2>

## References

- See `scripts/` for executable helpers.
- See `references/` for supplementary docs.
```

Optional subdirs: `scripts/` (executable code), `references/` (extra docs), `assets/` (templates, configs).

---

## Rule types

| Type                    | `alwaysApply` | `globs`      | Applied when                         |
| ----------------------- | ------------- | ------------ | ------------------------------------ |
| Always Apply            | `true`        | —            | Every Agent session                  |
| Apply Intelligently     | `false`       | —            | Agent decides based on `description` |
| Apply to Specific Files | `false`       | `*.tsx` etc. | Matching files are in context        |
| Apply Manually          | `false`       | —            | Explicitly `@mentioned` in chat      |

> SHOULD keep each rule file under 500 lines. Split by domain if larger.
> MUST add a `description` for `Apply Intelligently` rules — otherwise Agent cannot decide when to include them.

---

## AGENTS.md structure

Treat repository-root `AGENTS.md` as a **canonical anchor**: it loads on many sessions, so keep it **small** (instruction budget). Community guidance: [A Complete Guide To AGENTS.md](https://www.aihero.dev/a-complete-guide-to-agents-md) — progressive disclosure, avoid auto-generated bloat, prefer capability hints over long path lists that go stale.

**Root `AGENTS.md` SHOULD include** (order flexible):

1. **Project purpose** — one short paragraph or sentence; optional one-line tech stack if it fits
2. **Package manager** — only when not the obvious default for the ecosystem (e.g. pnpm / yarn / corepack)
3. **Quick start** — install, build, test, `lint:fix`; call out any non-standard scripts
4. **Non-negotiables** — protected contracts, agent Git policy, verification before claiming “done”, pointer to `alwaysApply` rules (e.g. `.cursor/rules/project.mdc`) instead of duplicating them
5. **Progressive disclosure** — table or short list of **markdown links** to deeper material (in this repo: `docs/agents/*.md` — conventions, architecture, optional skills catalog, documentation index and specialised agents)

**Linked files** (same logical “project brief”; agents load when needed):

- **Conventions** — typing, logging, errors, paths, JSON validation, security, Git for agents
- **Architecture** — module roles and doc/plugin layout; prefer stable boundaries over exhaustive per-file trees
- **Skills** — long optional catalogs; keep **mandatory** project skills referenced from the root
- **Agents & documentation** — triggers for `.cursor/agents/*` and indexes into `docs/plans/standards/`, `docs/plans/standards-cursor/`, `docs/agents/`, etc.

**Monorepos:** subdirectory `AGENTS.md` files **merge** with root — keep each level minimal ([same guide](https://www.aihero.dev/a-complete-guide-to-agents-md)).

Boundaries with rules and `.cursorrules` → `07-cursor-context-sessions.md` (three always-applied files); generic context habits → [standards/03-context-and-tokens.md](../standards/03-context-and-tokens.md).

---

## Command template (`commands/<name>.md`)

```markdown
---
name: <action-verb>
description: <One sentence — what this command does>.
---

## Steps

1. Invoke skill `/skill-name` with <argument>.
2. (Optional) confirm result.
```

Commands SHOULD delegate to a skill or agent — not embed full logic inline.

---

## Sources

| Rule / Template                                                                        | Source                                                                                                           | Notes                                                                                                                                          |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| "When to use what" table (rules / skills / subagents / commands)                       | [cursor.com/docs/subagents.md](https://cursor.com/docs/subagents.md) — "When to use subagents" table             | Partially confirmed; commands row is editorial                                                                                                 |
| Subagent template path `.cursor/agents/<name>.md`                                      | [cursor.com/docs/subagents.md](https://cursor.com/docs/subagents.md) — "File locations"                          | Officially confirmed                                                                                                                           |
| Subagent frontmatter fields (`name`, `description`, `model`, `readonly`, `background`) | [cursor.com/docs/subagents.md](https://cursor.com/docs/subagents.md) — "Configuration fields" table              | Officially confirmed                                                                                                                           |
| Description drives delegation ("what Agent uses to decide")                            | [cursor.com/docs/subagents.md](https://cursor.com/docs/subagents.md) — "Invest in descriptions"                  | Officially confirmed                                                                                                                           |
| Subagent prompts ≤ ~50 lines; AVOID lengthy prompts                                    | [cursor.com/docs/subagents.md](https://cursor.com/docs/subagents.md) — "Overly long prompts" anti-pattern        | Confirmed                                                                                                                                      |
| Start with 2–3 agents                                                                  | [cursor.com/docs/subagents.md](https://cursor.com/docs/subagents.md) — "Too many subagents" anti-pattern         | Confirmed                                                                                                                                      |
| Skill path `.cursor/skills/<domain>/SKILL.md`                                          | [cursor.com/docs/skills.md](https://cursor.com/docs/skills.md) — "Skill directories"                             | Confirmed                                                                                                                                      |
| Skill frontmatter (`name`, `description`, `disable-model-invocation`)                  | [cursor.com/docs/skills.md](https://cursor.com/docs/skills.md) — "Frontmatter fields"                            | Confirmed                                                                                                                                      |
| `name` must match parent folder name                                                   | [cursor.com/docs/skills.md](https://cursor.com/docs/skills.md) — name field: "Must match the parent folder name" | Confirmed                                                                                                                                      |
| Skill optional dirs: `scripts/`, `references/`, `assets/`                              | [cursor.com/docs/skills.md](https://cursor.com/docs/skills.md) — "Optional directories"                          | Confirmed                                                                                                                                      |
| Rule types table (`alwaysApply`, `globs`)                                              | [cursor.com/docs/rules.md](https://cursor.com/docs/rules.md) — "Rule anatomy"                                    | Confirmed                                                                                                                                      |
| Rule ≤ 500 lines                                                                       | [cursor.com/docs/rules.md](https://cursor.com/docs/rules.md) — "Keep rules under 500 lines"                      | Confirmed                                                                                                                                      |
| `description` required for `Apply Intelligently`                                       | [cursor.com/docs/rules.md](https://cursor.com/docs/rules.md) — FAQ "Why isn't my rule being applied?"            | Confirmed                                                                                                                                      |
| Progressive disclosure, small root `AGENTS.md`, instruction budget, stale path risk    | [A Complete Guide To AGENTS.md](https://www.aihero.dev/a-complete-guide-to-agents-md)                            | Community article; aligns with [standards/03-context-and-tokens.md](../standards/03-context-and-tokens.md) and `07-cursor-context-sessions.md` |
| `AGENTS.md` structure: root essentials + linked pages (e.g. `docs/agents/`)            | Editorial synthesis; [A Complete Guide To AGENTS.md](https://www.aihero.dev/a-complete-guide-to-agents-md)       | Not specified in official Cursor docs; complements Cursor’s AGENTS.md role in [cursor.com/docs/rules.md](https://cursor.com/docs/rules.md)     |
| Command template (`commands/<name>.md`)                                                | Editorial — not from official Cursor docs                                                                        | Cursor docs mention commands but don't specify this folder/format                                                                              |
