---
title: Git and agent workflow
status: active
updated: 2026-08-17
scope: standards
---

# Git and agent workflow

**Purpose:** Safe branching, commits, and pull requests when agents edit the
repository.

**Non-goals:** Spec writing → `spec-driven-development.md`. Verification →
`testing-and-verification.md`. Agent approvals and trust boundaries →
`agent-operations-and-security.md`.

**Owner:** Project maintainers · **Status:** Active · **Last reviewed:** 2026-08-13

## Branch strategy

| Work type | Branch name |
| --------- | ----------- |
| Feature | `feat/<short-title>` |
| Fix | `fix/<short-title>` |
| Docs / specs / plans | `docs/<short-title>` |
| Chore | `chore/<short-title>` |

Agents MUST NOT commit directly to `main` unless the user explicitly requests it.
Prefer a named branch and a pull request when the repository workflow supports it.

## Commit discipline

Commit only when the user asks (or an explicit standing rule authorises it). One
logical change per commit; never stage unrelated files or use `git add .` blindly.

```text
<type>(<scope>): <imperative summary, ≤72 chars>

<Why — only when non-obvious>

- <key change 1>
- <key change 2>

BREAKING CHANGE: <description>   ← if applicable
Refs: specs/<path> | docs/decisions/<file> | #<issue>
```

Use `feat`, `fix`, `refactor`, `docs`, `chore`, or `test`; keep the subject
imperative and concise. Do not amend pushed commits, force-push `main`, or use
`--no-verify` without explicit approval.

Before a code commit, run the checks in `testing-and-verification.md`, inspect
the staged diff, and ensure no `.env`, secret, credential, or real-PII fixture is
included. The baseline hook path is `lefthook` (`pre-commit`), which should run
`just lint-staged` as the first guard before commit continuation.
Run `just hooks-install` in a fresh local clone before the first commit.
Docs/specs-only changes skip npm checks but still require diff review and the
docs-only verification report.

## Pull requests

Opening or merging a PR requires explicit user approval immediately before the
action. A plan, branch name, or text prepared for a PR is not standing
authorization. Once approved, open a PR when the branch is ready for review or
the change alters a public API, domain contract, or production deployment
configuration. Include what changed, why (links to specs/decisions), verification
evidence, and remaining risks.

## Sources

| Practice | Source |
| -------- | ------ |
| Conventional Commits | [conventionalcommits.org](https://www.conventionalcommits.org) |
| Verification before commit | `testing-and-verification.md` |
