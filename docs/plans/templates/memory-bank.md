---
title: Memory-bank template
status: active
updated: 2026-08-17
scope: standards
---

# Memory-bank template

Canonical template for active files in `memory-bank/*`.

```md
---
title: <short-title>
status: active | dormant | historical
updated: YYYY-MM-DD
owner: <team/person, optional>
next-owner: <team/person, optional>
scope: <short scope>
depends-on: <docs/specs links>
source: <authoritative source if decision-bearing>
---
```

- Use `status: active` while it affects execution this week/iteration.
- Move to `dormant` when still useful but no pending actions.
- Move to `historical` when obsolete and no longer guides execution.

