---
name: deepseek-security
description: Bounded security review through the repository's external DeepSeek V4 Flash worker. Use for a bounded read-only task with narrow repository paths.
---

# Bounded security review

Use for authentication, authorization, tenant isolation, secret handling, injection, and trust-boundary review.

Never accept critical/high claims without independent parent verification.

## Profile

Use `security-review`.

## Procedure

1. Read `../deepseek-worker-core/SKILL.md` and its relevant references.
2. Form one exact objective; split independent responsibilities into separate runs.
3. Select narrow `include` globs and, when reviewing changes, exact `git_diff_paths`.
4. Create the task with `node tools/deepseek/task.mjs --profile security-review ...`.
5. Run the project's `deepseek` package script and save the result under `.deepseek/runs/`.
6. Read the compact evidence packet only.
7. Independently verify every critical/high claim and every claim that affects writes or final approval.

## Completion rule

Return the worker's useful conclusions to the parent with verified evidence, material uncertainty, and any required escalation. Do not present an incomplete or blocked external run as a repository finding.
