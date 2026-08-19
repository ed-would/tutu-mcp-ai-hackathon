# Agent instructions (progressive disclosure)

These files extend the root [AGENTS.md](../../AGENTS.md) so default context stays small. Open a file when the task matches its scope.

When to load **project-core** and what counts as substantive `docs/` changes: [project-core skill](../../.cursor/skills/project-core/SKILL.md) only.

| File                                                                     | Use when                                                               |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| [logging-validation-and-security.md](logging-validation-and-security.md) | Errors, JSON parsing, MCP usage, subprocess safety                     |
| [mcp-integration.md](mcp-integration.md)                                 | Tutu MCP endpoint, tools, playbooks, client setup                      |
| [verification.md](verification.md)                                       | Build/test/lint, MCP smoke test, hackathon submission freeze           |
| [architecture.md](architecture.md)                                       | Repo layout, `docs/tutu-mcp/`, application paths                       |
| [judging-criteria.md](judging-criteria.md)                               | **Primary driver** — scoring criteria; load at start of every session  |

## Suggested `docs/` layout (this repository)

```text
docs/
├── README.md                 # Human-oriented doc index
├── agents/                   # Agent-only progressive disclosure (this folder)
└── plans/
    ├── README.md
    ├── standards-cursor/     # Cursor IDE standards (universal)
    ├── standards/            # Cross-tool companion standards
    └── *.md                  # Implementation plans, pitch prep (create as needed)
```

Other top-level project context: `docs/tutu-mcp/`, `.cursor/rules/`, `.cursor/skills/`, `.cursor/agents/`, `AGENTS.md`.
