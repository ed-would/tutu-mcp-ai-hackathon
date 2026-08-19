---
title: Travel Tinder — Visual Asset Prompts (Image Generation)
status: active
updated: 2026-08-19
scope: docs/plans
---

# Travel Tinder — Visual Asset Prompts

Copy-paste prompts for ChatGPT (or any image model) to generate cohesive visual assets for **«Туту Куда?»**.

**Related docs:**

- Product visual direction: [`.interface-design/system.md`](../../.interface-design/system.md)
- Frontend execution plan: [travel-tinder-exec-frontend.md](travel-tinder-exec-frontend.md) (section 5 — design workflow)
- Guide UI spec: [travel-tinder-exec-guide-ui.md](travel-tinder-exec-guide-ui.md)

**How to use:**

1. Copy one prompt block into ChatGPT image generation (or DALL·E / Midjourney with equivalent settings).
2. Generate variants; pick the best; trace to SVG in Figma for logo and UI-critical assets.
3. For logo and favicon, prefer flat vector output — raster is a reference only.
4. Append `Flat vector / editorial illustration, no photorealism` if the model drifts toward photos.

---

## Asset map

| # | Asset | Where in product | Priority |
| - | ----- | ---------------- | -------- |
| 1 | Logo mark + wordmark + favicon | Header, favicon, OG | High |
| 2 | Hero banner | `/` landing | High |
| 3 | Idea postcard | `/discover` swipe deck | High |
| 4 | Six abstract backgrounds | Postcard image zones | High |
| 5 | Preference reveal | After 8 swipes | Medium |
| 6 | Staged loading (×3) | Package assembly | Medium |
| 7 | Package card | Match deck | Medium |
| 8 | Match detail hero | Package detail screen | Medium |
| 9 | Guide tour steps (×6) | `/guide` onboarding | Medium |
| 10 | OG / social preview | Meta tags, pitch deck | Medium |

### Brand anchors (all assets)

- Deep navy `#0D0B68` — ink, primary action, stamp field
- Ultraviolet `#7D71FF` — route thread, question mark accent (scarce)
- Warm ticket `#FCFAF5` — canvas
- Raised paper `#FFFFFF` — cards
- Horizon peach `#FFD3B0`, window sun `#EFBA6F` — postcard sky only
- Path mint `#C8E4D0` — ground / checkout-ready
- Typography in product: Onest; in creatives — bold expressive Cyrillic editorial
- Signature: **route thread** — one continuous line from prompt → card edge → checkout

### Reject everywhere

Tinder red/green, glassmorphism, neon gradients, emoji icons, AI blobs, stock landmarks (Eiffel Tower, etc.), generic SaaS cards, fake booking details, illegible decorative text.

---

## 1. Logo — «Туту Куда?»

### Concept

Wordplay: **«туда-туда»** (round-trip / back-and-forth travel) + **«Куда?»** (where to?). The question mark is the **destination point** on the route thread — not decoration.

- **Stamp** — 48×48 navy square, ticket perforation on the left
- **Route thread** — violet `#7D71FF` curve ending in a `?` shape
- **Golden nodes** — origin and destination (`#EFBA6F`)
- **Wordmark** — kicker «Туту» + bold «Куда?» with violet `?`

Reference implementation: `apps/app/src/components/BrandMark.tsx`.

### 1.1 Logo mark (icon)

```text
Design a premium app icon / logo mark for a Russian travel discovery product called "Туту Куда?" (Tutu Kuda).

CONCEPT:
- Play on words: "туда-туда" (back-and-forth travel) + "Куда?" (Where to?).
- The question mark IS the destination point on a route line — not a random decoration.
- Feels like a postage stamp on a ticket, not a dating app or airline logo.

VISUAL ELEMENTS:
- Square stamp format, 48×48px equivalent, rounded corners ~12px.
- Deep navy background #0D0B68.
- Left edge: subtle ticket perforation dashes (5–6 short vertical lines, cream #FCFAF5 at 28% opacity).
- Route thread: one continuous curved line in ultraviolet #7D71FF, 3px stroke, rounded caps.
  - Starts bottom-left with a small golden dot #EFBA6F (origin).
  - Curves upward and right, then the line terminates in a question mark shape — the "?" is formed BY the route thread itself, not typed text.
  - Optional second golden dot near the "?" base (destination).
- The "?" should read instantly as "where are we going?" — kinetic, warm, not corporate.

STYLE:
- Flat vector, no gradients, no 3D, no shadows on the mark itself.
- Tactile ticket-paper feel, editorial, trustworthy.
- Suitable for favicon, app icon, header at 40px height.

OUTPUT:
- Single logo mark on transparent OR on #FCFAF5 warm white.
- Vector-clean edges, scalable to 16px favicon.
- No text except the integrated "?" as part of the route line.
- No emoji, no Tinder colors, no glass, no neon, no generic compass or airplane clichés.

REJECT: red/green swipe colors, heart icons, location pin stock icons, glossy 3D, illegible decorative curves.
```

### 1.2 Wordmark (horizontal lockup)

```text
Design a horizontal wordmark lockup for "Туту Куда?" — Russian travel discovery app by Tutu.

LAYOUT:
- Left: the stamp icon (navy square, route-thread question mark in violet #7D71FF, ticket perforation, golden route nodes).
- Right: two-line Cyrillic typography:
  - Top line: "Туту" — smaller, muted navy #3F3D6A, kicker style.
  - Bottom line: "Куда?" — bold, deep navy #0D0B68, the "?" in ultraviolet #7D71FF (accent only on the question mark).

TYPOGRAPHY:
- Bold expressive Cyrillic, editorial feel — similar weight to Onest or geometric humanist sans.
- Tight letter-spacing on "Куда?", the "?" slightly larger or in accent color.
- No italic, no script, no decorative serifs.

CONTEXT:
- Warm ticket paper background #FCFAF5.
- Mark + text aligned center-left, comfortable padding.
- Feels warm, kinetic, trustworthy — weekend escape energy, not corporate bank.

OUTPUT:
- Horizontal lockup, ~200×48px proportion, PNG/SVG-ready flat design.
- Light mode only. No drop shadows on text.
- REJECT: Inter font look, SaaS startup aesthetic, English text, emoji, Tinder red/green.
```

### 1.3 Favicon (32×32)

```text
Simplify the "Туту Куда?" stamp logo to a 32×32 favicon. Navy #0D0B68 square, rounded 8px. One violet #7D71FF curved route line ending in a clear question-mark hook. One golden #EFBA6F dot at start. Maximum 3 shapes, readable at 16px. Flat vector, no text letters, no gradients. Transparent or navy background.
```

---

## 2. Hero banner (landing `/`)

### Concept

- Headline: **«Куда вас потянет в этот раз?»**
- Subhead about swipe-based taste learning
- Tilted mini-postcard demonstrating swipe (no API)
- Route thread from headline zone to card edge
- CTA zone: «Начать выбирать»

### Prompt

```text
Create a premium mobile-first hero banner illustration for "Туту Куда?" — a Russian travel taste-discovery app (swipe postcards to learn preferences, then get real Tutu packages).

FORMAT: Vertical mobile hero, 360×640px safe area, 4:5 or 9:16 aspect. NOT a full UI mockup — an expressive hero illustration with space for overlaid headline text at top.

SCENE:
- Warm ticket-paper canvas #FCFAF5.
- Large editorial headline zone at top (leave empty space for text overlay): "Куда вас потянет в этот раз?"
- Center-right: one tilted travel postcard (~15° rotation), layered paper shadow, stamp edge with dashed perforation.
  - Postcard shows abstract horizon: peach sky band #FFD3B0, mint ground #C8E4D0 — NO fake Eiffel Tower, no stock landmarks.
  - Subtle motion hint: postcard slightly shifted as if mid-swipe.
- Signature route thread: thin continuous violet line #7D71FF from upper-left (near headline) curving to the postcard edge — reacts to the card position.
- Small golden nodes #EFBA6F on the thread (origin + destination).
- Bottom: reserved zone for CTA button (navy #0D0B68 pill) — can show placeholder or leave clean.

MOOD: Warm, kinetic, spontaneous weekend escape. Train-window golden light. Trustworthy Tutu brand, not Tinder, not generic travel agency.

PALETTE: #0D0B68 navy, #7D71FF violet (scarce accent), #FCFAF5 warm white, #FFD3B0 peach, #C8E4D0 mint, #EFBA6F sun.

REJECT: Tinder red/green, glassmorphism, neon gradients, emoji, AI blobs, identifiable fake cities, SaaS dashboard, illegible decorative text, English UI copy.

OUTPUT: Single cohesive hero art, editorial collage + paper tactility, suitable as background for live React overlay text.
```

---

## 3. Idea postcard (swipe deck)

### Concept

Editorial postcard: destination, hook, tags. **No invented prices** on idea cards. Route thread reacts to horizontal drag.

### Prompt

```text
Design a single swipeable "idea postcard" card for a Russian travel discovery app. This is the main product gesture — horizontal drag to like or pass.

FORMAT: Portrait postcard, 4:5 ratio, ~320×400px card area. Slight rotation (~2°) for stack depth. Layered paper shadow.

CARD STRUCTURE:
- Top 60%: abstract travel collage background — train-window light streak, folded-map geometry hints, horizon bands (peach #FFD3B0 sky, mint #C8E4D0 ground). NO identifiable landmarks, NO stock photos.
- Stamp edge: dashed perforation on one side, ticket-paper texture.
- Bottom 40%: clean white #FFFFFF text zone with:
  - Destination name placeholder: "Казань" (example Cyrillic city, bold navy #0D0B68).
  - Hook line: "Уикенд с казанским кремлём и пловом" (warm editorial Russian).
  - 3 small tags as pills: "выходные", "вдвоём", "до 40 000 ₽" — muted navy outline, NOT prices on the idea card itself.

SIGNATURE:
- Violet route thread #7D71FF exits from left edge of card, stretching toward screen edge (as if user is dragging right = "Хочу").
- Golden dot at thread origin on card edge.

STYLE: Editorial postcard, tactile, optimistic. Tutu brand colors only. Light mode.

REJECT: Tinder overlay stamps, heart/X icons, invented hotel prices, neon, glass, emoji, generic Unsplash travel template.

OUTPUT: One postcard design, front face only, product-ready reference for React component.
```

---

## 4. Six abstract backgrounds (postcard pack)

Collage backgrounds without UI, text, or fake landmarks. One batch request for six variants.

### Prompt

```text
Generate a set of SIX cohesive abstract travel-collage backgrounds for a Russian mobile travel discovery app "Туту Куда?". NO UI, NO logos, NO text, NO identifiable fake landmarks.

EACH IMAGE:
- Vertical 4:5 aspect ratio.
- Generous quiet area in lower third for dark navy text overlay.
- Combine: cropped train-window golden light, folded-map geometric folds, ticket-paper fiber texture, soft horizon bands, one thin continuous route line #7D71FF (optional, subtle).

VARIATION ACROSS SIX (same art direction, different mood):
1. Dawn departure — soft peach sky #FFD3B0 dominant.
2. Afternoon window — warm sun streak #EFBA6F through abstract blinds.
3. Evening return — deeper navy wash at top, violet thread glow.
4. Weekend meadow — mint #C8E4D0 ground band, airy.
5. City blur abstract — geometric map fold, no recognizable skyline.
6. Night train — dark navy #0D0B68 upper, single violet route line, warm ticket paper lower.

PALETTE: warm white #FCFAF5 base, deep navy #0D0B68, ultraviolet #7D71FF accents, peach, mint, sun gold — restrained natural accents.

MOOD: Editorial, tactile, energetic, optimistic. Suitable behind Cyrillic headlines.

REJECT: stock-photo composition, surreal landmarks, neon, glossy 3D, AI blobs, Eiffel Tower, beach clichés.

OUTPUT: Six separate images, consistent art direction, collage + paper texture, not photographic realism.
```

---

## 5. Preference reveal

Moment after 8 swipes — top taste signals + one exploration chip.

### Prompt

```text
Design a "preference reveal" screen moment for "Туту Куда?" — after user swiped 8 travel idea postcards, the app shows their top taste signals.

FORMAT: Mobile screen illustration, 360×640, medium fidelity — mood + layout reference, not pixel-perfect UI.

CONTENT:
- Headline zone: "Вот что мы заметили" (leave as design element or lorem).
- Center: 3 signal chips/cards floating with soft paper lift:
  - "Ближе к воде"
  - "Выходные, не длинные"
  - "Вдвоём"
- One smaller "exploration" chip, dashed border, violet accent: "Попробуем горы?"
- Background: warm #FCFAF5, subtle route thread connecting the 3 main signals like a constellation — violet #7D71FF, 450ms-reveal feeling (thread partially drawn).
- Transition mood: alive, not static dashboard — slight motion blur on thread, golden nodes at signal points.

STYLE: Warm editorial, trustworthy, no emoji. Navy text, violet accents scarce.

REJECT: radar charts, pie charts, Tinder match screen, neon, glass, generic analytics dashboard.

OUTPUT: Single screen illustration, kinetic transition feel.
```

---

## 6. Staged loading (MCP package assembly)

Three stages connected by the route thread.

### Prompt

```text
Design a three-stage loading sequence illustration for "Туту Куда?" when assembling real travel packages via Tutu MCP.

FORMAT: Three vertical panels OR one wide triptych, mobile 360px width each.

STAGES (one focal message per panel):
1. "Сравниваем транспорт" — abstract train/plane route lines, outbound arrow.
2. "Проверяем дорогу обратно" — return loop on route thread, round-trip hint.
3. "Ищем проживание" — simplified bed/building silhouette as paper cutout, not realistic hotel photo.

SHARED ELEMENTS:
- Continuous violet route thread #7D71FF connects all three stages left-to-right.
- Golden progress nodes light up stage by stage #EFBA6F.
- Skeleton placeholders for final package card grid (rounded rectangles, paper tone).
- Badge preview: "LIVE · Tutu MCP" navy pill.
- Background #FCFAF5, navy headlines #0D0B68.

MOOD: Trustworthy, honest loading — real data coming, not fake spinner theatre.

REJECT: generic spinning loader, neon progress bars, emoji, glass, fake booking confirmations.

OUTPUT: Cohesive 3-step loading visual system.
```

---

## 7. Package card

Live package summary with honest pricing labels.

### Prompt

```text
Design a "live package card" for Tutu travel packages in "Туту Куда?" app.

CARD (~340px wide):
- White raised paper #FFFFFF, 16px radius, layered shadow.
- Top: "LIVE · Tutu MCP" navy badge pill.
- Large price: "47 200 ₽" bold navy, label "за всех · ориентировочно" muted.
- Breakdown rows with thin route thread connecting segments:
  - Туда: поезд
  - Обратно: поезд
  - Отель: 2 ночи
- Bottom: navy CTA "Перейти к бронированию" — honest external checkout, not in-app payment.

Palette: #0D0B68, #7D71FF thread, #FCFAF5 page, #C8E4D0 checkout-ready hint.

REJECT: fake seat numbers, fabricated airline logos, Tinder styling, neon.

OUTPUT: Single package card, product reference.
```

---

## 8. Match detail hero

Top section when user opens their best package match.

### Prompt

```text
Design a match detail hero for "Туту Куда?" — top of screen when user opens their best package match.

FORMAT: Mobile hero, 360×480 top section.

TOP 50%: Hotel photo placeholder area — use abstract warm interior light through window (NOT fake identifiable hotel). Soft editorial crop.
BOTTOM 50%:
- "Почему вам подходит" section with 3 bullet reasons tied to preference (e.g. "Вы выбирали выходные", "Вам нравились направления у воды").
- Violet route thread binds reasons to a small package summary.
- Price repeat with exact/estimated label.
- Checkout checklist: 2–3 honest steps on Tutu site.

Warm, trustworthy, Tutu brand. REJECT: stock luxury resort clichés, fake 5-star badges, emoji.
```

---

## 9. Guide tour — six step illustrations

One prompt per onboarding stage on `/guide`. See [travel-tinder-exec-guide-ui.md](travel-tinder-exec-guide-ui.md) for full copy obligations.

### 9.1 Step 1 — Prompt

```text
Illustration for onboarding step 1 "Скажите, куда хочется" — user types a natural-language travel wish in a labeled textarea. Show abstract prompt field with violet route thread starting from the cursor. Warm #FCFAF5, navy text, no API jargon. Mobile 360px, editorial postcard aesthetic. No emoji.
```

### 9.2 Step 2 — Clarify

```text
Onboarding step 2 "Уточним детали" — bottom sheet with chips: "на выходные", "вдвоём", "с детьми", "до 40 000 ₽". Paper sheet sliding up, perforated ticket edge, navy chips, violet selected state. Warm tactile style, Tutu Kuda brand.
```

### 9.3 Step 3 — Swipe

```text
Onboarding step 3 "Листайте идеи" — finger/mouse dragging a tilted travel postcard right. Violet thread stretches to card edge. Buttons "Не сейчас" / "Хочу" below. NO Tinder colors. Peach/mint abstract postcard art. Kinetic, fun, trustworthy.
```

### 9.4 Step 4 — Taste learning

```text
Onboarding step 4 "Мы учимся вашему вкусу" — 3 taste signal pills appearing with soft spring motion. Route thread constellation. Warm reveal, not analytics dashboard.
```

### 9.5 Step 5 — Honest pricing

```text
Onboarding step 5 "Честные цены" — two price objects side by side: "точная" (solid navy) vs "ориентировочная" (dashed violet border). LIVE · Tutu MCP badge. No fake discounts, no payment form.
```

### 9.6 Step 6 — Checkout handoff

```text
Onboarding step 6 "Бронирование на Tutu" — external link CTA, checklist of 2–3 steps on tutu.ru. Mint #C8E4D0 "ready" accent. Trustworthy handoff, not in-app checkout theatre. Route thread ends at checkout door icon (abstract, not literal).
```

---

## 10. OG / social preview

```text
Social preview image 1200×630 for "Туту Куда?" — Russian travel taste-discovery by Tutu.

Left: stamp logo (navy, violet route-question-mark).
Center-right: tilted postcard stack, peach/mint abstract horizons.
Headline: "Куда вас потянет в этот раз?" bold Cyrillic navy.
Subline: "Листайте идеи — соберём поездку на Tutu" smaller muted.
Background #FCFAF5, violet route thread across composition.
Premium editorial, not startup gradient blob. No emoji, no English-only.
```

---

## Bonus — direction board (full product mood)

From the frontend plan; use when locking art direction before individual assets.

```text
Create a premium visual direction board, not a finished UI, for "Туту Куда?" —
an expressive mobile-first travel discovery experiment inside the Russian Tutu
brand. Build the world from movement, changing scenery, train-window light,
ticket-paper tactility, route lines, map folds and spontaneous weekend escapes.
Use the official logo colors deep navy #0D0B68 and ultraviolet #7D71FF as scarce
brand anchors on warm near-white surfaces. Explore bold Cyrillic editorial type,
asymmetric postcard crops, layered paper depth and one continuous route-thread
signature. The feeling is warm, kinetic, trustworthy and product-ready.
Reject Tinder red/green cloning, glassmorphism, neon gradients, emoji icons,
generic SaaS cards, fake dashboards and illegible decorative text.
```

### Bonus — three-screen product reference

```text
Design a medium-fidelity 360px-wide mobile product reference for "Туту Куда?".
Show three coherent states: a natural-language travel prompt, an idea swipe deck,
and a live Tutu package match. One focal action per screen. The swipe card should
feel like a moving editorial postcard, with a route thread reacting to horizontal
drag. Package data must look trustworthy: full-party price, outbound, return,
hotel, LIVE Tutu MCP badge, exact-versus-estimate label, and visible booking steps.
Use deep navy #0D0B68, ultraviolet #7D71FF, warm white, expressive Cyrillic
typography, restrained shadows, 48px touch controls and safe-area padding.
Avoid glass, neon, random gradients, oversized pills, floating blobs, emoji,
generic travel templates and fabricated booking details.
```

---

## Suggested generation order

1. Logo mark → wordmark → favicon (trace to SVG)
2. Hero banner + idea postcard + six backgrounds (core visual pack)
3. Guide steps ×6 (onboarding illustrations)
4. Preference reveal, staged loading, package card, match detail (flow polish)
5. OG / social preview (pitch and meta)
