# Package-manager commands

Detect the host project's package manager from `package.json#packageManager` or its lockfile.

Run an existing task:

```bash
# npm
npm run deepseek -- --task .deepseek/tasks/<id>.json --out .deepseek/runs/<id>.json

# pnpm
pnpm run deepseek -- --task .deepseek/tasks/<id>.json --out .deepseek/runs/<id>.json

# Yarn
yarn deepseek --task .deepseek/tasks/<id>.json --out .deepseek/runs/<id>.json

# Bun
bun run deepseek -- --task .deepseek/tasks/<id>.json --out .deepseek/runs/<id>.json
```

Use `--force` only when intentionally replacing an existing run packet.
