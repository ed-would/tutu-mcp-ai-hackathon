---
title: General doc template
status: active
updated: 2026-08-17
scope: standards
---

# General doc template

Canonical template for durable docs in `docs/*` (decisions, product, technical plans, standards, references, agents, research).

```md
---
title: <short-title>
status: draft | active | accepted | superseded | archived
updated: YYYY-MM-DD
scope: decisions | plans | product | standards | research | references | agents
owner: <team/person, optional>
next-owner: <team/person, optional>
source: <authoritative source links>
supersedes: <file/path if replaced>
replaces:
  - <optional old file/path list>
---

# <Title>

## Status
- draft | accepted | superseded | archived

## Scope
- what this document controls

## Owner
- optional (fill only when ownership is actually split between people/teams)

## Current state
- short summary

## Decision basis / Evidence
- links to specs/decisions/validation

## Handover
- next-owner
- next-actions
```

