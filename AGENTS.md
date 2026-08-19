# [AGENTS.md](http://AGENTS.md)

This repository is a **Tutu MCP hackathon project** — an AI-assisted travel solution built on top of [Tutu MCP](https://mcp.tutu.ru/mcp) (remote Streamable HTTP, no auth).

Primary context: [README.md](README.md) (hackathon brief, dates, judging criteria) and [docs/tutu-mcp/tutu-mcp.md](docs/tutu-mcp/tutu-mcp.md) (live API reference, tools, playbooks).

## Commands

**App not yet scaffolded.** Commands will be added here once `apps/app` is initialised.

**MCP smoke test** (curl + jq, no app):

```bash
curl -s https://mcp.tutu.ru/mcp -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq .
```



## Always apply

- `[.cursor/rules/project.mdc](.cursor/rules/project.mdc)` — named exports, documentation language, protected contracts; points at **project-core** and **verification** canonical files.
- **Judging criteria (primary driver):** [docs/agents/judging-criteria.md](docs/agents/judging-criteria.md) — load at the start of every session; all decisions must align with scoring criteria.
- **Verification:** [docs/agents/verification.md](docs/agents/verification.md).
- **Project-core (when to load):** [.cursor/skills/project-core/SKILL.md](.cursor/skills/project-core/SKILL.md).
- **MCP integration contract:** [docs/agents/mcp-integration.md](docs/agents/mcp-integration.md).



## Boundaries

- **Protected Contracts** in `[.cursor/rules/project.mdc](.cursor/rules/project.mdc)` are non-negotiable without explicit team agreement.
- **Keep** `AGENTS.md` **accurate** when the change affects what agents must always know: documented **commands**, **Always apply** entries and their links, **MCP contract** pointers, or the **application surface** covered by Protected Contracts.
- Do **not** edit this file solely because directories were renamed if none of the above changed; prefer [docs/agents/architecture.md](docs/agents/architecture.md) or task-specific docs instead.



## Load by task


| Topic                                   | File                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Logging, errors, JSON parsing, security | [docs/agents/logging-validation-and-security.md](docs/agents/logging-validation-and-security.md) |
| Layout of app code, docs, MCP reference | [docs/agents/architecture.md](docs/agents/architecture.md)                                       |
| Tutu MCP endpoint, tools, playbooks     | [docs/agents/mcp-integration.md](docs/agents/mcp-integration.md)                                 |
| Travel Tinder MVP plan                  | [docs/agents/architecture.md](docs/agents/architecture.md) (scaffolding pending)                 |
| Judging criteria and scoring            | [docs/agents/judging-criteria.md](docs/agents/judging-criteria.md)                               |


Short index: [docs/agents/README.md](docs/agents/README.md).



- **External DeepSeek delegation:** for bounded read-only exploration, research, review, validation, security analysis, or independent critique, load the matching `deepseek-`* repository skill under `.agents/skills/`; keep repository writes, conflict resolution, and final approval with the parent agent.

