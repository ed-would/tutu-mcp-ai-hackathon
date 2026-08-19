# Specs — tutu travel tinder tech

`specs/` — контрактный слой для Travel Tinder. Здесь будут спецификации product/system decisions по мере роста проекта.

## Текущее состояние

Пока основная product и архитектурная документация живёт в `docs/plans/tinder/`:

* [`docs/plans/tinder/product.md`](../docs/plans/tinder/product.md) — product brief, user flow
* [`docs/plans/tinder/architecture.md`](../docs/plans/tinder/architecture.md) — stack, directory layout, server/client boundary
* [`docs/plans/tinder/brand-tokens.md`](../docs/plans/tinder/brand-tokens.md) — design tokens, visual system
* [`docs/plans/tinder/ui-route-stamp.md`](../docs/plans/tinder/ui-route-stamp.md) — Route & Stamp visual identity
* [`docs/plans/tinder/pw-checklist.md`](../docs/plans/tinder/pw-checklist.md) — Playwright QA gates PW-0..PW-6
* [`docs/plans/tinder/judging-checklist.md`](../docs/plans/tinder/judging-checklist.md) — hackathon judging criteria map

## Каталоги (скелеты для будущих спеков)

* `specs/domain/` — entities and lifecycles
* `specs/features/` — user flows and acceptance criteria
* `specs/architecture/` — system/API boundaries
* `specs/adr/` — local technical decisions
* `specs/fixtures/` — versioned test fixtures
* `specs/traceability.md` — requirement-to-test matrix

## Metadata-шаблон для новых спеков

```yaml
---
spec_id: stable-kebab-id
title: Title
status: DRAFT | PROPOSED | ACCEPTED | SUPERSEDED
scope: HACKATHON | POST_DEMO
owner: accountable-role
dependencies: []
last_reviewed: YYYY-MM-DD
---
```
