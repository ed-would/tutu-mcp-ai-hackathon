---
description: Run verification before commit or demo — build, test, lint, or MCP smoke.
argument-hint: "optional: 'quick' (lint only), 'mcp' (MCP smoke test), 'pw' (Playwright QA)"
---

# /verify

Run verification to confirm the project is ready to commit or demo.

## Modes (from the argument)

- **Default** — run typecheck, build, and tests for `apps/app` via npm. Report results.
- **`quick`** — typecheck only (`npm run --prefix apps/app typecheck`); skip build and test.
- **`mcp`** — run MCP smoke test only (`npm run --prefix apps/app mcp-smoke`).
- **`pw`** — run frontend visual QA via Playwright MCP per [travel-tinder-exec-qa.md](../../docs/plans/travel-tinder-exec-qa.md).

## Steps

1. Read [docs/agents/verification.md](../../docs/agents/verification.md) and apply its rules on when to skip the full suite.
2. If the change is documentation-only, skip build/test/lint; report docs-only policy applies. Go to step 6.
3. **If `mcp` mode or MCP integration changed:** run `npm run --prefix apps/app mcp-smoke`; compare tool names with `docs/tutu-mcp/tutu-mcp-tools.json` if docs were updated.
4. **Default / app change:** run from `apps/app` (or via `npm run --prefix apps/app`):

   ```bash
   npm install
   npm run typecheck && npm run build && npm run test
   ```

5. **If `pw` mode:** invoke Playwright MCP against local or deployed URL; work through the gates in [travel-tinder-exec-qa.md](../../docs/plans/travel-tinder-exec-qa.md).
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
