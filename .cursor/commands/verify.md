---
description: Run verification before commit or demo — build, test, lint, or MCP smoke.
argument-hint: "optional: 'quick' (lint only), 'mcp' (MCP smoke test), 'pw' (Playwright QA)"
---

# /verify

Run verification to confirm the project is ready to commit or demo.

## Modes (from the argument)

- **Default** — run build, test, and lint for `apps/web` via pnpm. Report results.
- **`quick`** — lint only (`pnpm --dir apps/web lint`); skip build and test.
- **`mcp`** — run MCP smoke test only (`pnpm --dir apps/web mcp-smoke`).
- **`pw`** — run frontend visual QA via Playwright MCP per [docs/plans/tinder/pw-checklist.md](../../docs/plans/tinder/pw-checklist.md).

## Steps

1. Read [docs/agents/verification.md](../../docs/agents/verification.md) and apply its rules on when to skip the full suite.
2. If the change is documentation-only, skip build/test/lint; report docs-only policy applies. Go to step 6.
3. **If `mcp` mode or MCP integration changed:** run `pnpm --dir apps/web mcp-smoke`; compare tool names with `docs/tutu-mcp/tutu-mcp-tools.json` if docs were updated.
4. **Default / app change:** run from `apps/web` (or via `pnpm --dir apps/web`):

   ```bash
   pnpm install
   pnpm build && pnpm lint && pnpm test
   ```

5. **If `pw` mode:** invoke Playwright MCP (`user-playwright`) against local or deployed URL; work through gates PW-0..PW-6 from [docs/plans/tinder/pw-checklist.md](../../docs/plans/tinder/pw-checklist.md).
6. Report results:

   ```text
   ### Verified
   - mcp: <pass | fail | skipped>
   - build: <pass | fail | skipped>
   - tests: <N passed, M failed | skipped>
   - lint: <pass | fail | skipped>
   - pw: <PW-N passed | skipped>

   ### Follow-up tasks (if any)
   - dev: <fix suggestion>
   - qa: <test suggestion>
   ```

   If any step fails, delegate to the appropriate agent before claiming done.
