# Verification

## When the full suite is required

Before claiming a task **complete**, run whatever build/test/lint commands the project defines.

**Application (`apps/app`):**

```bash
cd apps/app && npm install
npm run typecheck && npm run build && npm run test
```

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Local dev server |
| `npm run typecheck` | TypeScript project checks |
| `npm run build` | Production build |
| `npm run test` | Unit tests |
| `npm run mcp-smoke` | MCP `tools/list` + playbook smoke (`scripts/mcp-smoke.ts`) |
| `npm run packages-smoke` | Package builder orchestration smoke (`scripts/packages-smoke.ts`) |

From repo root (equivalent):

```bash
npm run --prefix apps/app dev|typecheck|build|test|mcp-smoke|packages-smoke
```

Required when the change touches **application source**, **MCP integration logic**, **CI**, or **`package.json`** in ways that affect build or runtime.

Do not assert success without evidence when this bar applies.

If runtime behavior changed, update the relevant `docs/` and `docs/tutu-mcp/` files in the same change set before claiming complete.

## Documentation-only work

If the diff is **only** documentation or agent-facing prose (for example `docs/**/*.md`, `AGENTS.md`, `.cursor/rules/*.mdc`, `.cursor/agents/*.md`, `.cursor/skills/**/*.md`, `docs/tutu-mcp/**/*.md` without API drift) and does not change code or assert new runtime behavior, **skip** the full build/test/lint run.

## Frontend visual QA (`/pw`)

UI acceptance uses Cursor `/pw` → Playwright MCP (`user-playwright`), not Shell Playwright.

* Checklist and gates: [travel-tinder-exec-qa.md](../plans/travel-tinder-exec-qa.md) and [travel-tinder-exec-qa-matrix.md](../plans/travel-tinder-exec-qa-matrix.md)
* Pitch dry-run after the local happy path; repeat against the deployed URL when available.

## Hackathon submission

Per [README.md](../../README.md):

* Submit repo link, documentation, and a working demo.
* **Freeze:** no changes after **21:00 MSK, 19 August 2026**.

Before pitch (20 August), run the end-to-end demo flow in [travel-tinder-exec-qa.md](../plans/travel-tinder-exec-qa.md) and fix broken MCP flows.

Judging evidence map: [travel-tinder-exec-qa-matrix.md](../plans/travel-tinder-exec-qa-matrix.md).

## MCP smoke test

**In-app script (preferred):**

```bash
npm run --prefix apps/app mcp-smoke
```

**curl (no app):**

```bash
curl -s https://mcp.tutu.ru/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | head -c 2000
```

Compare tool names with `docs/tutu-mcp/tutu-mcp-tools.json` when updating integration docs.

## Deploy verification

After the deployment step in [travel-tinder-exec-roadmap.md](../plans/travel-tinder-exec-roadmap.md): `npm run --prefix apps/app build` on CI/Vercel; repeat the QA flow on the production URL; `/api/health` shows MCP + LLM status.
