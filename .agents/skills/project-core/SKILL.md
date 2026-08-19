---
name: project-core
description: This skill should be used for the Tutu MCP hackathon repo whenever work touches application code, Tutu MCP integration (tools, playbooks, endpoint), docs/tutu-mcp/ reference material, agent instructions under docs/agents/, or package.json / build scripts once added. Also use for substantive docs edits that affect agent instructions, verification, or the MCP integration narrative. The full when-to-use matrix is in the skill body; .cursor/rules/project.mdc is the always-applied summary.
---

# Tutu MCP Hack — Project Skill

## When to use this skill

- Apply for any change to application source (web app, bot, agent runtime, CLI — wherever the team places it).
- Apply for changes to `docs/tutu-mcp/` that affect tool names, playbooks, or the live API narrative agents rely on.
- Apply for substantive changes to `docs/` that affect agent instructions, verification rules, or MCP integration guidance (including `docs/agents/*`).
- Apply for any change to `package.json` that affects build, scripts, or runtime dependencies (once the project has a toolchain).
- Apply for MCP client configuration (`.cursor/mcp.json`, Claude/Codex connector setup) when it affects how agents call Tutu.

## When NOT to use this skill

- Skip when editing only `README.md` (Russian hackathon brief) with no agent-guidance impact.
- Skip for pure documentation fixes (typos, formatting) that do not change meaning and do not touch MCP contracts or app behavior.
- Skip for changes limited to `.gitignore` / `.cursorignore` with no behavioral impact.

## Scope

Applies when working on a hackathon solution that uses Tutu MCP for travel search (avia, rail, bus, hotels, etrain, multitransport) and checkout links.

The always-applied rule slice lives in `.cursor/rules/project.mdc`; this file is the full trigger matrix and procedural detail.

## Documentation (Markdown)

- Align with `.cursor/rules/project.mdc` _Documentation links_ and _Visible file paths in prose_.

## Key Paths

| Component        | Path                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| Hackathon brief  | `README.md`                                                          |
| MCP reference    | `docs/tutu-mcp/tutu-mcp.md`, `docs/tutu-mcp/*.json`, `docs/tutu-mcp/*_instructions.md` |
| Agent docs       | `docs/agents/*` (progressive disclosure for `AGENTS.md`)           |
| Codex automation| `.cursor/rules/`, `.cursor/skills/`, `.cursor/agents/`, `.cursor/commands/` |
| Application code | TBD by team — document in `docs/agents/architecture.md` when chosen  |

## MCP Conventions

- **Endpoint:** `https://mcp.tutu.ru/mcp` — remote Streamable HTTP, no authentication.
- **Tools:** discover via `tools/list`; follow playbooks in `docs/tutu-mcp/get_*_instructions.md`.
- **Checkout:** MCP returns checkout URLs only — no payment on the MCP side.
- **Docs sync:** when live API behavior diverges from `docs/tutu-mcp/`, update the reference in the same change set.

## Agent checklist

Before claiming work complete, follow [verification.md](../../../docs/agents/verification.md).

## Related docs

- `AGENTS.md` — compact agent entry; links into `docs/agents/*.md`.
- `docs/agents/README.md` — index of progressive-disclosure agent docs.
- `docs/agents/mcp-integration.md` — MCP endpoint, tools, and integration contract for agents.
