---
name: deepseek-research
description: Repository-grounded research through the repository's external DeepSeek V4 Flash worker. Use for a bounded read-only task with narrow repository paths.
---

# Repository-grounded research

Use for answering one concrete technical question from supplied repository files; use the docs-researcher profile when the question is specifically about documentation drift.

Do not use for open-web research: this worker has no browser or network tools.

## Profile

Use `research`.

## Procedure

1. Read `../deepseek-worker-core/SKILL.md` and its relevant references.
2. Form one exact objective; split independent responsibilities into separate runs.
3. Select narrow `include` globs and, when reviewing changes, exact `git_diff_paths`.
4. Create the task with `node tools/deepseek/task.mjs --profile research ...`.
5. Run the project's `deepseek` package script and save the result under `.deepseek/runs/`.
6. Read the compact evidence packet only.
7. Independently verify every critical/high claim and every claim that affects writes or final approval.

## Completion rule

Return the worker's useful conclusions to the parent with verified evidence, material uncertainty, and any required escalation. Do not present an incomplete or blocked external run as a repository finding.
