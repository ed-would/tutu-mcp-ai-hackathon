# Task packets

Create tasks through the profile helper whenever practical:

```bash
node tools/deepseek/task.mjs \
  --profile <profile> \
  --id <task-id> \
  --objective "<one exact objective>" \
  --include "<narrow/glob>"
```

Add repeatable options as needed:

```text
--include <glob>
--git-diff-path <path>
--constraint <text>
--max-output-tokens <512..32768>
```

Rules:

- One responsibility per task.
- Prefer explicit directories and extensions.
- Include supporting tests/configuration only when necessary to prove the objective.
- `include_git_diff=true` requires exact `git_diff_paths`.
- Split unrelated modules into separate tasks rather than raising context limits immediately.
- Task ids may contain letters, digits, dots, underscores, and hyphens.
