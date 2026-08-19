# 2. Cursor workspace layout and naming

**Purpose:** `.cursor/` directories, Cursor plugin layout, and related naming.

**Non-goals:** Generic `src/`, `docs/`, `AGENTS.md` placement → [standards/02-structure-and-naming.md](../standards/02-structure-and-naming.md).

---

## `.cursor/` tree (project)

```text
repo-root/
├── .cursor/
│   ├── rules/              # Project rules (*.mdc)
│   ├── skills/             # Project skills (<domain>/SKILL.md)
│   └── agents/             # Project subagents (<name>.md) — canonical Cursor location
├── agents/                 # Role descriptions for Cursor plugins ONLY (not primary subagent storage)
├── .cursor-plugin/         # Cursor plugin manifest (monorepos with plugins)
├── AGENTS.md
└── README.md
```

> MUST: `.cursor/agents/` is the canonical location for Cursor subagents (version-controlled, auto-discovered).
> MUST: Root `agents/` is for plugin role descriptions only — do not use it as primary subagent storage.

---

## Rules

- `.cursor/rules/project.mdc` — always-apply project rules
- `.cursor/rules/<domain>.mdc` — domain-specific rules (kebab-case)
- SHOULD keep each rule file under **500 lines**; split by domain if larger

## Skills

- `.cursor/skills/<domain-name>/SKILL.md`
- Directory name = short domain identifier in kebab-case (`project-core`, `backup-strategy`)
- `name` field in frontmatter MUST match the directory name

## Subagents

- `.cursor/agents/<name>.md`
- `name` in frontmatter: kebab-case, matches filename without `.md`
- AVOID `-agent` suffix — path already encodes type

## Commands

- `commands/<name>.md` (inside a Cursor plugin)
- Short verbs: `backup`, `migrate`, `deploy` — not `run-backup-command`

## Cursor plugin internals

```text
<plugin>/
├── rules/<something>.mdc
├── skills/<name>/SKILL.md
├── commands/<name>.md
└── agents/<name>.md
```

- Identifiers: kebab-case; no redundant type suffixes

### docs/ conventions

Plans, specs, and shared standards follow [standards/02-structure-and-naming.md](../standards/02-structure-and-naming.md) (`docs/plans/`, `docs/specs/`, …).

---

## Sources

| Rule                           | Source                                                               | Notes                              |
| ------------------------------ | -------------------------------------------------------------------- | ---------------------------------- |
| `.cursor/agents/` canonical    | [cursor.com/docs/subagents.md](https://cursor.com/docs/subagents.md) |                                    |
| `~/.cursor/agents/` user scope | [cursor.com/docs/subagents.md](https://cursor.com/docs/subagents.md) |                                    |
| `.cursor/rules/`               | [cursor.com/docs/rules.md](https://cursor.com/docs/rules.md)         |                                    |
| `AGENTS.md` in repo root       | [cursor.com/docs/rules.md](https://cursor.com/docs/rules.md)         |                                    |
| `.cursor/skills/`              | [cursor.com/docs/skills.md](https://cursor.com/docs/skills.md)       |                                    |
| Root `agents/` = plugin-only   | **Editorial**                                                        | Not stated in official Cursor docs |
| Rule files ≤ 500 lines         | [cursor.com/docs/rules.md](https://cursor.com/docs/rules.md)         |                                    |
| Skill directory shape          | [cursor.com/docs/skills.md](https://cursor.com/docs/skills.md)       |                                    |
| `name` matches folder          | [cursor.com/docs/skills.md](https://cursor.com/docs/skills.md)       |                                    |
| Subagent filename kebab-case   | [cursor.com/docs/subagents.md](https://cursor.com/docs/subagents.md) |                                    |
