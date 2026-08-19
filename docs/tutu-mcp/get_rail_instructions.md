# Rail playbook (`search_rail` -> `get_offer_details` / `get_rail_seatmap`
-> `create_checkout_link`)

## Station disambiguation (mandatory)
Big cities have several вокзалы far apart (Москва: Ленинградский /
Казанский / Курский …). The departure / arrival point is in
`legs[].segments[].from|to` as a self-describing string `"City — Station
(code)"` (e.g. `"Москва — Ленинградский вокзал (2006004)"`). Name the
concrete station when comparing offers — don't present trains leaving the
same city from different вокзалы as a shared origin, and don't make the
user infer the station from the URL.

## Train type / brand
When the user names a train type or brand («Ласточка», «Сапсан»,
«фирменный», «двухэтажный»), match it from the offer's
`legs[].segments[].vehicle_meta`: `name` is the brand (may be absent),
with `is_premium` / `is_double_decker` set when true — an unbranded
двухэтажный still carries `is_double_decker` even with no `name`. The
field is omitted only for a plain РЖД train (no brand, no flags); when
it's missing say «не фирменный / не двухэтажный» rather than guessing.
The brand/flags are also how you distinguish two trains when the user
cares about speed/comfort, not just price.

The default `sort=price_asc` returns the cheapest offer first, which is
often a slow long-distance train, NOT the fast Ласточка/Сапсан the user
may have in mind. Don't present offer[0] as «the train» when the request
was for a specific type or the soonest/fastest departure — filter by
`vehicle_meta`, or re-run with `sort='departure_asc'` / `'duration_asc'`,
so the train you show matches what they asked for.

## Fares & classes (compact-first)
In the default `compact` view a rail offer carries a `fares` summary
`{count, price_from, price_to, currency, refundable_count?,
changeable_count?}`, NOT the full per-class `variants[]`. The counts
answer «есть ли возвратные / обменные?» right from search; for WHICH
price is the refundable one, re-run `search_rail` with `view='full'` —
each variant then carries `conditions: {refundable, changeable}`
(omitted when upstream segments disagree — don't guess then). The raw
variant rows still hold no human class label (купе / плацкарт / СВ live
in `get_offer_details`), so to name a class or its amenities call
`get_offer_details` on the chosen offer — its `variants[].fare_type`
(REFUNDABLE / NON_REFUNDABLE) covers refundability there; exchange
rules (`changeable`) exist ONLY at search level. Don't claim a
class/price/condition the current view doesn't contain.

## Detail card
`get_offer_details(product_type='rail', details_ref=<offer.details_ref>)`
loads `service_classes[]` — one card per class with the human class code
(купе/плацкарт/СВ), description, `amenities[]` (codes + Russian labels —
localize via `tutu://amenities/dictionary`), the per-class rating and
photos — plus lean fare rows in `variants[]` (price + `fare_type`
REFUNDABLE/NON_REFUNDABLE + car/seat counts; join a row to its class
card via `class_index` — an index into `service_classes[]`; the display
name is duplicated as `service_class`), `cars[]`, a `train_vehicle`
block and a `ticket` block. For a fare ladder, walk `variants[]`
(cheapest-first) and label each row from its class card. The field list is in that
tool's description.

**Free seats.** For the train's total free seats sum `cars[].seats_count`
(per-car availability, counted once). Do NOT sum `variants[].seats_count`:
variants are fare rows and several can map to the same seat group, so
summing them double-counts the same inventory across tariffs. For per-car
or per-class availability read `cars[].seats_count` directly.

## Seat map: `get_rail_seatmap`
Call with the same `details_ref` from `search_rail` to let the user pick a
seat by the wagon's layout (read-only).
- `seatmap_status`: `"ok"` = Tutu returned a schema;
  `"no_layout_for_carrier"` (carries `agent_hint`, common for non-РЖД
  commercial brands) = NO SCHEMA, **not** "no seats".
- Seat `type`: LOWER / UPPER / SIDE_LOWER / SIDE_UPPER / SEDENTARY. Join
  fare/class via `seat.group_index` into `cars[].seat_groups[]` — NEVER via
  `seat.type` (two groups in one car can share a type at different service
  classes). Use the precomputed `distance_to_nearest_wc_px` instead of
  doing geometry.
- Fares per group: `seat_groups[].fares[]` lists every fare type of the
  group cheapest-first — one `{fare_type, price, child_price?}` entry per
  type (REFUNDABLE vs NON_REFUNDABLE; missing type → `"UNKNOWN"`).
  `price` is the ADULT fare, `child_price` the CHILD fare of the same
  type when the group is priced for a child. Compare refundable vs
  non-refundable and adult vs child from here; do NOT send the
  user to checkout just to learn a price. `cheapest_fare` is `fares[0]`.
  **Pricing caveat** (`pricing_note` in the response): seatmap prices are
  pre-cart totals and run BELOW the final cart price — checkout
  applies Tutu's own, larger service fee (observed +6–8%), while the
  `search_rail` LISTING price matches the cart to the kopek. So: compare
  fare types / seats by seatmap numbers, but quote the bookable total
  from the search listing (or say the exact final price shows in the
  cart) — never present a seatmap price as the amount to be paid.
  A rare `discounted: true` flags a type where upstream returned only
  discounted prices — say so instead of presenting it as the standard
  fare.
- Children & composition: top-level `passenger_requirements` carries the
  age rules (typically CHILD ≤10 — paid child ticket; BABY ≤5 —
  `needs_ticket=true, chargeable=false`, i.e. an infant rides free but
  STILL needs a ticket in the order). Caveat any `child_price` with the
  age rule and note the exact discount is confirmed on checkout. Before
  `register_checkout_passengers`, make sure each CHILD/INFANT birthday fits
  that rule on the departure date; the tool rechecks the current seatmap and
  refuses an ineligible type before minting or holding seats. The
  rail deeplink can prefill SEATS (and fare/gender — see Checkout) but
  not the passenger composition — the user enters adults/children
  themselves on the opened Tutu page or in the cart (unlike avia, where
  the deeplink forwards the composition).
- Pagination: defaults `max_cars=5` × `max_seats_per_car=40` (keeps a
  ~9-car train under the 64 KB cap). Cars over the cap stay in `cars[]` as
  skeletons (`seats=[]`, `seats_omitted_for_pagination=true`) so you see
  the full train shape. To load one car fully, call again with
  `car_number=<id>` — do NOT bump `max_cars` on the first call to "see
  everything".
- Focused questions: prefer `task=` over paging the whole map. `task=
  'far_from_wc'` returns the farthest seats by `distance_to_nearest_wc_px`
  ranked **per berth type** in `seats_by_type` (so the best LOWER isn't
  hidden behind UPPER berths — for «нижнее подальше от туалета» take the top
  of `LOWER` / `SIDE_LOWER`); `task='female'` returns seats currently
  `gender="FEMALE"`, capped with a `total_female_seats` count + the
  dynamic-policy caveat; `task='summary'` returns per-car available-seat
  counts by berth type. Each is a short ranked answer (best seats + why),
  not hundreds of seats. Tasks run over the whole train by default; pass
  `car_number` to scope a task to one car (e.g. to narrow a long `female`
  list). Task responses keep `seatmap_status` (`ok` / `no_layout_for_carrier`).
- Detail level: the default `view='compact'` omits the raw per-seat
  geometry (`position` / `size` / `nearest_wc_rect`) — you decide on the
  precomputed `distance_to_nearest_wc_px` + seat attributes, not on pixel
  coordinates. Pass `view='full'` only if a client actually draws the car.
- Grounding: window/aisle flags are NOT provided; amenities
  are per-wagon, not per-seat; sold/held seats are omitted by upstream.

## Gender coupes (dynamic)
Read `seat_groups[].is_gender` and `seats[].gender` from the CURRENT
response. Treat only `gender="FEMALE"` as a female seat and only
`gender="MALE"` as male; `MIXED`, `NO_GENDER` and `UNDEFINED` prove
nothing. The policy changes as seats sell — never hardcode a compartment
number as gendered. Remind the user the final gender choice is confirmed
on Tutu checkout.

## Checkout
`create_checkout_link` (transport=rail) builds an `explicit/train` deeplink —
a Tutu redirector the user opens in their own session. TWO modes:

1. **Seat page (default, `kind="deeplink"`)** — built from `checkout_ref`'s
   `departure_geo_point_id` / `arrival_geo_point_id` + `train_number` +
   `departure_at`; lands on THIS train's order/seat page where the user
   picks car and seat. Use when the user hasn't chosen exact seats.
2. **Straight-to-cart (`kind="checkout_deeplink"`)** — ONLY after the user
   explicitly confirmed specific seats from `get_rail_seatmap`: pass the
   seat choice (`car_number` + `seat_numbers`, one per passenger) plus
   `offer_hash` + `segment_hash` (and the `search_id`/`result_id`/`card_id`
   metadata) from `checkout_ref`. The link mints the cart with those exact
   seats pre-selected — it works in a COLD browser (no tutu session
   needed; the cart belongs to whoever opens the link). When the user
   picked a fare, ALWAYS pass `fare_type` (the seatmap `fares[].fare_type`
   string: REFUNDABLE or NON_REFUNDABLE) — omitted, the cart opens on the
   refundable default, which is pricier than a chosen non-refundable
   fare. For gender-policy coupes pass `gender_type` (`MALE`/`FEMALE` —
   ask the user). Composition note: the cart holds the SEATS and fare;
   adults/children details are still entered by the user in the cart.
   Tell the user to verify seat/fare in the cart before paying.

If the geo-point ids are missing it falls back to the tutu.ru/poezda/order
page (`kind="order_url"` + a `note`). Quote the price range from `fares` (or
a class+price from `get_offer_details` / exact seat prices from
`get_rail_seatmap`). `search_rail` only surfaces bookable trains (Tutu's
seatless "возможные предложения" — sold-out / advance-sale trains — are
filtered out, since their deeplink would dead-end), so every offer you
present is safe to hand off. If a train sells out between search and click,
the seat-page deeplink degrades gracefully to the route+date search page
(the train is still listed there) — that's expected, not an error; the
straight-to-cart link may instead error on an expired offer — re-run the
search then.

## Grounding
Car types, seat counts, double-decker presence and train ratings come from
this response or `get_offer_details` — never invent "обычно бывают
плацкарт / купе / СВ" or substitute web facts.