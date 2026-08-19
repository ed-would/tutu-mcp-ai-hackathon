---
name: deepseek-tests
description: Missing regression and failure-path test analysis through the repository's external DeepSeek V4 Flash worker.
---

# Test-gap analysis

Use when the independent responsibility is identifying missing tests for changed behavior, authorization, isolation, or failure paths.

Do not ask the worker to execute tests or edit test files.

## Profile

Use `test-gap-finder`.

## Procedure

1. Read `../deepseek-worker-core/SKILL.md` and its relevant references.
2. Bound the task to one changed feature or risk surface.
3. Include implementation, existing related tests, and exact Git paths when applicable.
4. Create the task with `node tools/deepseek/task.mjs --profile test-gap-finder ...`.
5. Run the project's `deepseek` script and save the result under `.deepseek/runs/`.
6. Read the compact evidence packet only.
7. Verify that every proposed test maps to a demonstrated behavior or risk.

## Completion rule

Return prioritized missing test cases and their evidence. Do not present different test style as missing coverage.
