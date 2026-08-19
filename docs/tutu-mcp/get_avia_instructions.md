# Avia playbook (`search_avia` -> `create_checkout_link`)

## Detail card
No confirmed read-only avia detail endpoint. For a presentation card,
pass the selected compact offer object as `details_ref` to
`get_offer_details(product_type='avia', ...)` — it reformats with no
side effects.

## Flight number
The flight number is `legs[].segments[].voyage_no` (e.g. `SU-6026`) — one
per segment, so a connection shows one number per hop. Quote it verbatim;
never reconstruct a flight number from the carrier name or times.

## Filters (`direct_only`, `carriers`)
`direct_only=true` keeps only nonstop flights (every leg a single segment;
round-trip stays direct when both legs are). `carriers=[...]` keeps only offers
where every listed airline matches one of the requested names/ids; a mixed
Aeroflot+S7 offer does not satisfy "only Aeroflot".
`meta.carriers_available` is the per-route airline reference DERIVED from the
fetched offers (avia fetches the full route pool, so it's complete for the
route): each entry has `name` ("Аэрофлот"), `offers_count` and `price_from` —
plus a stable `id` ("1062") ONLY when Tutu ships its carrier facet (the current
`/avia/offers` endpoint doesn't — see the TODO-for-Tutu; filter by `name`).
Matching is a case-insensitive substring on the name, so guessing ("aeroflot"
for "Аэрофлот") silently drops everything. What
each filter removed is in `meta.post_filter_dropped_not_direct` /
`post_filter_dropped_wrong_carrier`. When a filter is active the whole route
pool is fetched before filtering, so an airline listed in `carriers_available`
reliably shows up in the filtered result and `has_more` stays honest — no thin
page from the page-scoped fetch. `meta.total_matched` is the exact count after
filters (before pagination): "сколько всего рейсов Азимута" is one search, not a
page-walk (`meta.total_matched_exact=false` only on a rare >200-offer route).

## Airport-scoped search (input)
`origin` / `destination` accept a specific airport as well as a city — by
name («Шереметьево», «Внуково») or bare IATA code («SVO», «IST»). Tutu's
search runs city-wide, so the server narrows the result to the requested
airport itself: offers via other airports of the same city are dropped and
counted in `meta.post_filter_dropped_wrong_airport` (the key is present
only when the request named a specific airport). The narrowed
endpoint carries
`meta.from/to.kind="airport"` and its `iata` is the AIRPORT's code (for a
city input `iata` is the city code, e.g. MOW). On a round-trip both legs
are held to the airport (out arrives there, return departs there). If
every city flight uses other airports, `meta.airport_note` lists them with
counts — relay it and offer to re-search by city name. A bare IATA code
means the airport, not the metro area: «IST» is Стамбул-Новый only (SAW
dropped), while «Стамбул» covers all airports. Pass the city name whenever
the user doesn't care about the airport.

## Checkout
`create_checkout_link` (transport=avia) returns BOTH:
- `checkout_url` — a Tutu `mtp-deeplink/explicit/avia` that 301-redirects
  to the exact ticket's purchase page (falls back to the search results if
  the offer is no longer available).
- `search_results_url` — the listing page for browsing.
Round-trip: a direct round-trip offer (`checkout_ref.is_round_trip=true`,
one flight outbound + one flight return) now returns a real two-leg deeplink —
it mints a cart with BOTH the outbound and return legs. Forward
`is_round_trip` AND `return_departure_at` from `checkout_ref`; without
`return_departure_at` the tool can't encode the return leg and falls back to
the search page (`kind="search_redirect"`). Connecting round-trips (3+ flights
total, at least one connection) also return `kind="search_redirect"`: the
current `explicit/avia` redirector supports one flight per direction. One-way
offers return the deeplink as before (no `return_departure_at`).
NB cold session: the deeplink reaches the purchase page (cart) only when the
user's browser ALREADY has a tutu session. A cold browser / Telegram in-app
webview (no session) lands on the avia search for this route+date — the user
picks the flight there. (Unlike rail/bus, whose deeplinks open the seat form
cold.) Present `checkout_url` as "go book", not "your cart is ready"; if the
user reports a search page, that's the reason, not an error.
Show `checkout_url` once the user has picked this exact flight; show
`search_results_url` while they compare. For a non-cheapest fare family,
override `offer_hash` with `variants[i].offer_hash` AND pass that
variant's `service_class` — but KEEP forwarding `is_round_trip` +
`return_departure_at` from `checkout_ref`: they're properties of the offer,
not the fare, and the round-trip deeplink needs the return leg (drop them on
an override and a round-trip offer falls back to the search page).

## Separate tickets / self-transfer (`is_multi_pnr`)
An offer flagged `is_multi_pnr=true` has a connection issued as SEPARATE
tickets: the passenger re-claims then re-drops baggage between flights and the
layover is NOT a protected connection (a self-transfer). Relay `multi_pnr_note`
before checkout and suggest a comfortable buffer. This fires for ONE-WAY and
ROUND-TRIP offers alike — a round-trip whose outbound or return is itself a
self-transfer is flagged too, and `has_self_transfer=true` marks that a single
direction is the split. What does NOT get flagged is the ordinary round-trip
there/back split (one booking each way): that's expected — say nothing special.

Pass the searched party — `passengers_full` (adults), `passengers_child`,
`passengers_infant` — from `checkout_ref` into `create_checkout_link`. The
deeplink requests exactly those passengers; omit them and Tutu defaults the
cart to ONE adult, so a 2-adult / family total you quoted won't match what
the user sees. Have the user confirm the passenger count in the cart
before paying. The full input
field list is in `create_checkout_link`'s own description.

## Airport disambiguation (mandatory)
Many cities have several airports far apart: Стамбул IST (European side)
vs SAW (Sabiha Gökçen, Asian side, ~50 km); Москва SVO / DME / VKO / ZIA
(Жуковский, separate ~40 km transfer); London LHR / LGW / STN / LTN;
Paris CDG / ORY / BVA.
- Read the airport from `legs[].segments[].to` — a self-describing string
  `"City — Name (IATA), терм. T"` (e.g. `"Стамбул — Сабиха Гёкчен (SAW)"`,
  `"Москва — Внуково (VKO), терм. A"`). Surface it verbatim: the airport
  name and terminal come straight from the Tutu response, so prefer them
  over the bare code. When the upstream omitted the name the string falls
  back to `"City, IATA"` — then the IATA code is the signal; map it to a
  name only if you're sure (stable global registry, the ONE carve-out from
  the no-general-knowledge rule), otherwise show the code as-is.
- When two offers in one list use different airports of the same city,
  call it out explicitly with a human sentence and a one-line distance/side
  note (e.g. "SAW — Сабиха Гёкчен, это другой аэропорт Стамбула, не IST,
  ~50 км на азиатской стороне").
- Don't assume the user prefers the primary airport; surface both, never
  silently drop the secondary.

## Grounding
Baggage, cabin baggage, refund/change rules, fare-family name, seat policy
and carrier rating must trace to `variants[].conditions` or
`review_summary` in the response. If a field is null/absent, say so —
never fall back to general carrier knowledge or web search.