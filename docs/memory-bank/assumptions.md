---

## title: Assumptions — Travel Tinder
status: active
updated: 2026-08-19
scope: memory-bank

# Assumptions — Travel Tinder

These are the active product/tech assumptions for the hackathon submission. They are not validated demand signals — the prototype demonstrates feasibility, not market traction.


| Assumption                                                                  | Status          | Notes                                                 |
| --------------------------------------------------------------------------- | --------------- | ----------------------------------------------------- |
| Tutu MCP is reachable from Vercel serverless (no auth, Streamable HTTP)     | ASSUMED         | Verified locally; not yet confirmed from prod edge    |
| NeuralDeep JSON schema output is stable enough for demo                     | ASSUMED         | Fallback intent (`fallbackIntent.ts`) covers failures |
| `searchMultitransport` returns suburban trains for golden ring destinations | ASSUMED         | Observed in local testing (568 ₽ Электричка)          |
| Hotel search may return empty for some destinations                         | KNOWN — handled | Honesty microcopy + transport-only package by design  |
| Jury will judge on mobile viewport (360×844)                                | ASSUMED         | `PhoneShell` ensures desktop also looks correct       |
| Swipe is mandatrory for demo                                                | CONFIRMED       | drag is required per spec                             |


