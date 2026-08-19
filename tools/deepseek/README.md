# Installed DeepSeek worker

This directory is managed by `create-codex-yandex-deepseek-worker`.

- `worker.ts` — hardened read-only execution engine.
- `system.md` — trusted instructions sent to DeepSeek.
- `task.mjs` — creates materialized task packets from profiles.
- `doctor.mjs` — checks the local installation without sending a request.
- `profiles/` — task-specific defaults and constraints.
- `schemas/` — task and result contracts.

Runtime state is stored separately:

```text
.deepseek/tasks/   generated task packets
.deepseek/runs/    generated evidence packets
```

Use the root project scripts:

```bash
npm run deepseek:doctor
npm run deepseek:task -- --list
npm run deepseek:smoke
```

For npm, pnpm, Yarn, and Bun command variants, see the installed repository skills under `.agents/skills/deepseek-worker-core/references/`.
