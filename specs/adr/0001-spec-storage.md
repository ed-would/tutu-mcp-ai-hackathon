---
spec_id: adr-spec-storage
title: Client-primary session storage
status: DRAFT
scope: HACKATHON
owner: TBD
dependencies:
  - docs/plans/tinder/architecture.md
last_reviewed: 2026-08-19
---

# ADR-0001 — Session and state storage

## Context

Travel Tinder is deployed on Vercel (serverless). No shared in-process server state is possible across requests.

## Decision

All user session data (preference vector, swipe history, current intent) lives client-side via **Zustand + localStorage**.

Server Route Handlers are stateless and receive necessary context per-request from the client.

## Consequences

* Simple deployment — no DB, no session store.
* Data is ephemeral per browser; no cross-device sync.
* Acceptable for a hackathon demo.

## Status

DRAFT — to be promoted to ACCEPTED once the architecture is locked.

## Open questions

* None for hackathon scope.
