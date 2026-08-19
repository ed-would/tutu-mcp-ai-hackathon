# Architecture and repository map

High-level layout for the Tutu MCP hackathon project. Coding rules live in [typescript-conventions.md](typescript-conventions.md) and [project.mdc](../../.cursor/rules/project.mdc).

## Repository layout (current)

| Area        | Responsibility                                                                 |
| ----------- | ------------------------------------------------------------------------------ |
| `README.md` | Hackathon brief, dates, judging criteria, MCP quick start (Russian)            |
| `docs/tutu-mcp/` | Live Tutu MCP reference: overview, tools JSON, playbooks, sample payloads      |
| `docs/agents/` | Progressive-disclosure instructions for AI agents (`AGENTS.md` index)     |
| `docs/plans/tinder/` | Travel Tinder MVP — product, architecture, pitch, deploy, QA checklists |
| `apps/web/` | **Application root** — Next.js 15 Travel Tinder web app (see below)           |
| `.cursor/`  | Rules, skills, agents, commands for Cursor automation                          |
| `AGENTS.md` | Compact agent entry point at repo root                                         |
| `.cursorrules` | Legacy pointer to `AGENTS.md` and `.cursor/rules/project.mdc`              |

## Application (`apps/web`)

| Path | Role |
| ---- | ---- |
| `src/app/` | App Router: `/`, `/deck`, `/match/[id]`, `/health`, `/api/*` |
| `src/components/` | UI — brand, deck, home, layout, match, prefs, prompt |
| `src/lib/llm/` | NeuralDeep client, intent, ideas, schemas, fallback |
| `src/lib/mcp/` | Tutu MCP client, search tools, checkout, playbooks |
| `src/lib/packages/` | Package builder, ranking, offer parsing |
| `src/lib/prefs/` | Preference vector, scoring, labels |
| `src/lib/state/` | Zustand store (`TinderStore`) |
| `scripts/` | `mcp-smoke`, `packages-smoke`, `fallback-smoke` |
| `public/brand/` | Tutu logo SVG and static brand assets |
| `.env.example` | `NEURALDEEP_*` template (copy to `.env.local`) |

**Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Zustand, Framer Motion, Zod, OpenAI SDK (NeuralDeep), MCP SDK (Tutu), Vitest.

**Detailed plan:** [docs/plans/tinder/architecture.md](../plans/tinder/architecture.md).

## MCP reference (`docs/tutu-mcp/`)

| File | Role |
| ---- | ---- |
| `tutu-mcp.md` | Main cheat sheet: endpoint, transport, tool index |
| `tutu-mcp-tools.json` | Dump of `tools/list` |
| `overview.md` | Server overview |
| `get_*_instructions.md` | Per-domain playbooks (avia, rail, bus, hotels, etrain, multitransport) |
| `*.json` | Sample responses and dictionaries |

**Endpoint:** `https://mcp.tutu.ru/mcp` (remote / Streamable HTTP, no auth).

## Hackathon tracks (from README)

* Fresh look at the service — improve trips via MCP
* Tool optimization — faster, more accurate, stable responses
* Interface solution — widgets, bots, services
* Agent experiments — AI assistants, reviews, routes

Travel Tinder track: **interface solution** + **agent experiments** (NeuralDeep intent + Tutu MCP packages).

## Standards (`docs/plans/`)

| Folder | Role |
| ------ | ---- |
| `docs/plans/standards-cursor/` | Cursor IDE standards — rules, skills, subagents, Plan Mode |
| `docs/plans/standards/` | Cross-tool companion — MCP, Git, testing, SDD, ADRs |
| `docs/plans/tinder/` | Travel Tinder MVP — brand, product, pitch, deploy, PW checklist |

Index: [docs/plans/README.md](../plans/README.md).

## Project automation

* **Rules:** `.cursor/rules/project.mdc`, `.cursor/rules/markdown-style.mdc`
* **Skills:** `.cursor/skills/project-core/SKILL.md`, `.cursor/skills/project-standards/SKILL.md`
* **Agent definitions:** `.cursor/agents/*.md`
* **Commands:** `.cursor/commands/*.md`

## Suggested layout as the app grows

```text
tutu-mcp-hack/
├── README.md
├── AGENTS.md
├── apps/
│   └── web/                # Next.js Travel Tinder app
├── docs/tutu-mcp/
├── docs/
│   ├── README.md
│   ├── agents/
│   └── plans/
│       ├── standards-cursor/
│       ├── standards/
│       └── tinder/
├── .cursor/
└── ...
```

Update this file when the application root and build commands change.
