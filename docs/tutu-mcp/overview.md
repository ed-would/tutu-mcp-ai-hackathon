# Tutu MCP — обзор и как пользоваться

A search layer over Tutu.ru: hotels + avia / rail / bus / etrain, plus
checkout-link building.
Read-only: no payments, no personal accounts, no bookings.

## Flow
`search_*` -> (optional `get_offer_details` / `get_rail_seatmap`) ->
`create_checkout_link` (or use a ready `checkout_url`, or a hotel's
`best_offer.checkout_url`). Legacy aliases: `from_city`/`to_city`,
`checkin_date`/`checkout_date`.

## Per-domain playbooks (call the matching tool)
Detailed per-domain fields, edge-cases and presentation rules live in
instruction TOOLS — call the one for your task:
`get_avia_instructions`, `get_rail_instructions`, `get_bus_instructions`,
`get_etrain_instructions`, `get_hotels_instructions`,
`get_multitransport_instructions`.

## Tools
- `search_hotels` / `search_avia` / `search_rail` / `search_bus` /
  `search_etrain` — single-mode search (paginated; transport modes also
  take `sort` and the `price_max` / `direct_only` / `carriers` filters —
  see `meta.carriers_available` before filtering by carrier).
- `search_multitransport` — fan-out across all four transport modes
  (`optimize_for`; `direct_only` / `carriers` apply per-mode).
- `get_offer_details` — full card for a hotel/transport offer.
- `get_rail_seatmap` — per-car seat layout + per-group fare variants
  (refundable / non-refundable) for a rail offer.
- `create_checkout_link` — single checkout handle for ANY offer (pure URL
  builder): a Tutu deeplink that opens the seat-selection page in the user's
  session (avia / rail / bus) — or, for rail/bus with a user-confirmed seat
  choice, mints the cart with those seats pre-selected — a schedule URL
  (etrain), or the pre-filled hotel page (hotels).
- `fetch_resource` — read any `tutu://` resource as a tool call (for
  clients that don't surface resources).

## Resources
- `tutu://geo` — city/point ids. `tutu://amenities/dictionary` — amenity
  code -> label. `tutu://status` — server + upstream health. `tutu://version`,
  `tutu://debug/memory` — diagnostics. `tutu://special-offers` — experimental ideas only.

## Prompts
- `plan_trip` — orchestrates `search_multitransport` + `search_hotels` to
  fit a trip into a budget.

## Output & grounding
The cross-cutting output rules (reviews verbatim, never invent options,
never substitute web/general knowledge, city/airport disambiguation,
emoji, prices, always surface URLs) are in the server `instructions=`
block and in the per-domain playbooks above.

## Out of scope
- Payment (the checkout URL opens the page where the user pays; we don't
  charge).
- Personal accounts, passport data, booking history.
- Station-level geo input for rail/bus/etrain («с Казанского вокзала»);
  those resolve city-level only. Avia is the exception: `search_avia`
  accepts a specific airport (name or IATA code — «Шереметьево», SVO)
  and narrows results to it (see `get_avia_instructions`).