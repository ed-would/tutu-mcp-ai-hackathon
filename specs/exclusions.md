---
spec_id: hackathon-exclusions
title: Out-of-scope surface and post-demo re-entry gates
status: DRAFT
scope: HACKATHON
owner: TBD
dependencies:
  - specs/README.md
last_reviewed: 2026-08-19
---

# Exclusions — tutu travel tinder tech

## Purpose

Document what is explicitly out of scope for the hackathon build and what the re-entry trigger would be.

## Out of scope (MVP)

| Surface | Behavior | Reason | Re-entry trigger |
|---|---|---|---|
| Native apps (iOS/Android) | not built | web-only scope | post-hackathon |
| In-app payments | not built; deep-links to tutu.ru only | payment stays on tutu.ru | post-hackathon |
| User accounts / auth | not built; session is client-primary (Zustand + localStorage) | simplicity | post-hackathon |
| Embedding-based ranking | not built | MCP + ε-greedy ranking sufficient for MVP | post-hackathon |
| Dark mode | not built | light Tutu shell only | post-hackathon |
| Server-side session storage | not built; client-primary | serverless constraint (Vercel) | post-hackathon |

## Open questions

* No additional exclusions identified. Add rows if new surfaces are proposed.
