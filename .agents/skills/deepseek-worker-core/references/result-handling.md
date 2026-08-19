# Result handling

A run is stored at `.deepseek/runs/<task-id>.json`.

Prioritize these fields:

```text
result.status
result.summary
result.findings[]
result.recommendations[]
result.unresolved_questions[]
diagnostic
warnings[]
usage
supplied_files[]
git_diff_files[]
```

Interpret statuses:

- `DONE`: sufficient bounded analysis was returned.
- `DONE_WITH_CONCERNS`: useful output exists but a material limitation remains.
- `NEEDS_CONTEXT`: correct the supplied paths; do not guess.
- `BLOCKED`: external execution or input contract failed.

Verification rules:

- Re-open every cited path for critical/high claims.
- Confirm the evidence supports the claim, not merely that the path exists.
- Do not propagate unsupported line numbers or test-execution claims.
- Resolve disagreements in the parent agent.
