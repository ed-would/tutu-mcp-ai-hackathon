# Token budgets and incomplete responses

Recommended task-level output budgets:

| Work type | `max_output_tokens` |
|---|---:|
| Smoke test | 1,024 |
| Bounded review / security / plan / critic | 16,384 |
| Large discovery | 16,000 |
| Hard ceiling | 32,768 |

Task-level values override the worker default.

When the result contains:

```json
{
  "result": { "status": "BLOCKED" },
  "diagnostic": {
    "code": "OUTPUT_BUDGET_EXHAUSTED",
    "reason": "max_output_tokens"
  }
}
```

this means DeepSeek returned `incomplete` without usable output. It is not a code or security finding.

Create a new bounded task with `16384` or, only when justified, `32768`. Prefer splitting independent responsibilities before raising the hard ceiling.
