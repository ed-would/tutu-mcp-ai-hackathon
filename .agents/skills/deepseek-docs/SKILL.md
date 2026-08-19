---
name: deepseek-docs
description: Documentation and implementation consistency audit through the repository's external DeepSeek V4 Flash worker.
---

# Documentation consistency audit

Use for bounded comparison of documentation, public contracts, configuration, examples, and implementation.

Do not use for purely stylistic copy editing or open-web research.

## Profile

Use `docs-researcher`.

## Procedure

1. Read `../deepseek-worker-core/SKILL.md` and its relevant references.
2. Form one exact documentation claim or surface to verify.
3. Include both the documentation and the minimum implementation/configuration needed to test the claim.
4. Create the task with `node tools/deepseek/task.mjs --profile docs-researcher ...`.
5. Run the project's `deepseek` script and save the result under `.deepseek/runs/`.
6. Read the compact evidence packet only.
7. Independently verify material contradictions before changing docs or code.

## Completion rule

Return exact contradictory paths/claims, user impact, and uncertainty. Do not report preferences as drift.
