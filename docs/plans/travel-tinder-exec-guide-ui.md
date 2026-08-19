---
title: Travel Tinder — Guide onboarding UI
status: active
updated: 2026-08-19
scope: plans
---

# Travel Tinder — Guide onboarding UI

Isolated implementation spec for the interactive `/guide` tour. Content obligations come from [travel-tinder-exec-landing-onboarding.md](travel-tinder-exec-landing-onboarding.md) and [product-travel-tinder.md](product-travel-tinder.md). This file owns **how** the onboarding page is built.

## Isolation

This workstream edits only the onboarding route. Parallel chats own backend and the home/landing page.

Allowed:

- `apps/app/src/pages/GuidePage.tsx`
- `apps/app/src/components/guide/`
- `apps/app/src/styles/guide.css` (imported only from the guide page)
- `apps/app/tests/guide-session.test.ts`
- `docs/plans/travel-tinder-exec-guide-ui.md`

Do not edit backend, MCP, LLM, `apps/app/api/`, Discover, Home, `apps/app/src/app/App.tsx`, `apps/app/src/styles/global.css`, tokens, README, or other exec plans.

Reuse Discover visuals by applying existing class names. New look lives under `.page-guide` / `.guide-*`. The Discover session key `tutu-kuda-session-v1` is **read-only**.

## Feeling

The guide is a short live rehearsal of «Туту Куда?», not a manual. A traveler who still does not know where to go should feel pulled through six stages — lighter, trusted, ready to open `/discover`.

Voltage lives in touching a postcard, watching the route thread move, and seeing exact versus approximate prices as two different objects. Copy stays warm Russian editorial voice. No MCP/LLM jargon, emoji, glass, neon, or Tinder red/green.

Motion uses only `transform`, `opacity`, and SVG path. Honor `prefers-reduced-motion`.

## Interaction

Sequential six-stage tour with local React state `stage: 0..5`.

1. Prompt — playable textarea and chips, rehearsal submit, no API.
2. Clarifications — two editable local fields. No hidden Moscow-weekend default.
3. Swipes — guide-local postcard (do not import Discover deck). Drag and `Не сейчас` / `Хочу`. No prices on ideas.
4. Prices — switchable exact versus estimated cards. No in-app payment.
5. Checkout — tappable rehearsal checklist marked as example. No live tutu.ru navigation from the demo.
6. Errors and memory — honest error plus in-place retry. Reset copy refers to this browser only.

Always-visible skip to `/discover`. Back / Next in a sticky bar. Last stage primary CTA: «Продолжить маршрут» if a Discover session is already started, otherwise «Попробовать со своей поездкой». Secondary: «На главную».

Demos must not write `tutu-kuda-session-v1` and must not call `/api/*`.

## Layout

- Phone (360×800, 360×844): column of progress, playable demo, short copy, sticky actions with safe-area padding.
- Desktop (768 / 1440): two columns inside `.page-guide` only — demo left, copy right. Not a fake phone frame.

## Verification

```bash
npm run --prefix apps/app typecheck
npm run --prefix apps/app test
npm run --prefix apps/app build
```

Skip MCP smokes. Visual QA on `/guide` only. Full suite rules: [verification.md](../agents/verification.md).
