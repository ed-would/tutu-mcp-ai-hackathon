# Worker profiles

Profiles specialize one hardened runtime without copying worker code.

| Profile | Primary use | Output budget |
|---|---|---:|
| `research` | One repository-grounded technical question | 16,000 |
| `repo-explorer` | Module map, entry points, data flow | 16,000 |
| `docs-researcher` | Documentation/implementation drift | 16,384 |
| `diff-reviewer` | Correctness and regression review | 16,384 |
| `plan-validator` | Plan completeness and ordering | 16,384 |
| `test-gap-finder` | Missing regression and failure-path tests | 16,384 |
| `independent-critic` | Independent evidence-based second opinion | 16,384 |
| `security-review` | Bounded security analysis | 16,384 |

Create a task:

```bash
node tools/deepseek/task.mjs \
  --profile diff-reviewer \
  --id review-001 \
  --objective "Review the bounded change" \
  --include "src/feature/**/*.ts" \
  --git-diff-path src/feature
```
