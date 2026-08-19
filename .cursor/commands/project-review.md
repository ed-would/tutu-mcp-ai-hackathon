# /project-review

- Owner: Project maintainers
- Status: Active
- Scope: Perform a read-only, evidence-based review within repository and canonical project surfaces.
- Last reviewed: 2026-08-12

Perform a read-only, evidence-based review of the requested scope.

## Input

An explicit repository-relative path, diff, branch/commit range, or the current working tree when no scope is supplied. Reject absolute paths, paths outside the repository, and arbitrary external directories; ask the owner to provide a canonical in-repository scope.

## Canonical references

- `AGENTS.md` and `.cursor/rules/project.mdc`
- `docs/agents/verification.md`
- Relevant `specs/`, `docs/decisions/`, and `docs/standards/`
- `docs/decisions/0004-stack-mvp.md` for stack constraints when applicable

## Output

Return a concise summary and a findings table with severity, location, issue, and suggestion. Check contracts, acceptance criteria, error handling, tests, style/type expectations, secrets/PII, untrusted input, and stack decisions. End with `approve`, `approve with nits`, or `request changes`.

## Stop condition

Do not edit files, apply fixes, commit, push, invoke tools outside the approved repository scope, or delegate implementation. Stop after reporting all material findings and explicitly distinguish skipped checks from passing checks.
