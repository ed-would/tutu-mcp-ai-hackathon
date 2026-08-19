---
title: Handoff template
status: active
updated: 2026-08-17
scope: standards
---

# Handoff template

Canonical template for continuation packets in `memory-bank/handoffs/*.md`.

```md
---
title: handoff-bN
status: active | archived
updated: YYYY-MM-DD
owner: <from, optional>
next-owner: <to, optional>
scope: <handoff scope>
depends-on: <docs/specs links>
---

## Completed
- ...

## Work in scope
- ...

## Constraints
- protected contracts
- validation commands

## Next actions
- ...

## Stop conditions
- when scope is done
```

- If handoff is completed and no longer needed for continuation, move it to `docs/archive/handoffs/`.

