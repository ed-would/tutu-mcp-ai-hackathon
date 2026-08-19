# Multitransport playbook (`search_multitransport`)

One call fans out avia + railway + bus + etrain in parallel and returns a
unified, sorted top-level `variants[]`. NOTE the nesting AND the rail
exception: each top-level entry is a cross-mode option that, in the default
`compact` view, carries its own fare-family `variants[]` for avia/bus/etrain
— but a RAIL entry instead carries a `fares` summary `{count, price_from,
price_to, currency, refundable_count?, changeable_count?}` (no nested
`variants[]`/`offer_hash`); read the per-class ladder from
`get_offer_details(product_type='rail')` or re-run with `view='full'`.
- `optimize_for='price'|'time'` ranks per mode; `modes` narrows the subset
  (default all four).
- ADULTS ONLY: multitransport takes `adults` and prices every mode for
  adults. For a party with children run the concrete mode's search
  (`search_avia` / `search_bus` take `children`) — its offers are priced
  for the real party, and registration checks the composition against
  what was searched.
- Soft-fails per mode: a down upstream shows up in `meta.unavailable[]` and
  the rest of the result stays usable.
- Prefer CITY input here. If origin/destination names a specific airport,
  only the avia mode narrows to it (other modes search the city or fail
  to resolve); the avia drop counter / note then surface under
  `meta.modes_summary.avia` (`dropped_wrong_airport`, `airport_note`) —
  use them to explain a thin avia block.
- Checkout / detail per entry follows the SAME rules as the single-mode
  tool for that transport: use `checkout_url` when present, else
  `create_checkout_link` with `checkout_ref`; `details_ref` is present for
  rail/bus. For per-mode fields, edge-cases and grounding, read that mode's
  instruction tool (`get_avia_instructions` / `get_rail_instructions` /
  `get_bus_instructions` / `get_etrain_instructions`).