# Туту Куда? — interface system

## Direction and feel

Warm, kinetic, trustworthy. A traveler who is tired of comparing tabs asks «Куда?» and gets a postcard that can be pulled toward a destination. The product should feel like ticket paper and train-window light, not like a dating app or a SaaS dashboard.

## Domain

- Ticket paper and perforation
- Train-window light
- Folded map geometry
- Continuous route thread
- Weekend postcard crop
- Honest Tutu checkout, never in-app payment theatre

## Color world

- Deep navy `#0D0B68` — ink, primary action, mark field
- Ultraviolet `#7D71FF` — route thread, question mark, scarce accent
- Warm ticket `#FCFAF5` — canvas
- Raised paper `#FFFFFF` — cards
- Horizon peach `#FFD3B0` and window sun `#EFBA6F` — postcard sky only
- Path mint `#C8E4D0` — ground / checkout-ready

Neutrals do the structure. Violet is the signature, not decoration.

## Signature

The **route thread**: a single line that starts at the prompt, stretches to the card edge while dragging, and later binds transport, stay, and checkout. The logo turns the same line into the question mark of «Куда?». The destination is literally a `?`.

Signature placements: header lockup, landing hero, prompt, idea postcard (reacts to drag), package breakdown.

## Rejected defaults

- Tinder red / green like-pass cloning → navy / ultraviolet thread cues
- Inter / system UI chrome → self-hosted Onest
- Generic SaaS cards and equal radii everywhere → ticket postcard, 16px card radius, dashed stamp edge
- Glass, neon, random gradients, emoji icons, AI blobs

## Depth and spacing

- Depth: layered paper shadow + quiet tonal shift. No glass.
- Base unit: 4px. Touch: 48px. Control gap: 8px+. Min width: 360px.
- Type: Onest variable, body 16px, headlines with tight tracking.

## Motion

- Press: 120ms, scale 0.97
- Card decision: spring stiffness 420, damping 34
- Thread reveal: 450ms, SVG `pathLength`
- Animate only transform, opacity, SVG path
- Reduced motion: drag still decides; card exits through opacity, no fly-away

## Components

- **Wordmark** — 40px navy stamp + stacked «Туту / Куда?»
- **Button primary** — min-height 48, navy fill, 4px ultraviolet shelf
- **Idea postcard** — stamp edge, peach/mint sky, live thread, tags, no invented prices
- **LIVE · Tutu MCP** badge — navy pill on package cards
