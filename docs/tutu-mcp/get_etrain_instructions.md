# Etrain playbook — commuter / suburban trains (электрички)
(`search_etrain` -> `create_checkout_link`)

## Station disambiguation (mandatory)
A city often has several commuter stations far apart — СПб (Московский /
Ладожский / Балтийский …), Москва (the radial вокзалы). The departure /
arrival point is in `legs[].segments[].from|to` as a self-describing
string `"City — Station (code)"` (e.g. `"Санкт-Петербург — Московский
вокзал (2004003)"`). Always name the concrete station when comparing
offers — never present two electrichkas that leave the same city from
different stations as if they share an origin, and never make the user
read the station out of the checkout URL.

## Consist type
Each segment may carry `vehicle_meta` ({name: Ласточка/Дальний, code:
swallow/distant, description}) — use it to filter consist type without
parsing labels.

## Fares
Unlike rail, etrain offers keep their full `variants[]` even in `compact`
(commuter fares are usually a single price, and there's NO read-only
etrain detail endpoint to recover them from — see below). Quote the fare
directly from `variants[]`.

## Detail card
No separate read-only etrain detail endpoint.
`get_offer_details(product_type='etrain', details_ref=<offer>)` reformats
the selected search offer with a `ticket` block (eticket, by_passport) and
surfaces `vehicle_type` in the summary.

## Checkout
`create_checkout_link` (transport=etrain) builds the tutu.ru commuter
schedule URL from `checkout_ref` (`departure_etrain_id` /
`arrival_etrain_id` -> st1/st2; station codes are fallback/debug fields).
It does NOT consume `offer_hash` — the schedule page is generic for the
route (no per-offer etrain deeplink exists). The field list is in the
tool's description.

## Grounding
Schedule, stops and carrier facts come from this response — do not
substitute web lookups or general regional-rail knowledge when a field is
missing.