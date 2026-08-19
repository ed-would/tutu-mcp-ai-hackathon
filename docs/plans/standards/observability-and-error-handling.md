---
title: Observability and error handling
status: active
updated: 2026-08-17
scope: standards
---

# Observability and error handling

**Purpose:** Canonical local Challenge rules for operational logs, errors, audit,
and UI recovery.

**Non-goals:** Production telemetry, compliance evidence, external sinks, or
runtime implementation.

**Owner:** Project maintainers / backend and security owners · **Status:** Active ·
**Last reviewed:** 2026-08-13

## Scope

This standard is normative for the unscaffolded loopback Challenge. It complements
the accepted decision [0010](../decisions/0010-observability-and-error-handling.md)
and the existing API, RBAC and storage contracts. It does not add a route, grant,
schema, dependency or persistence surface.

## Operational logs

- Nitro/backend/worker MUST use Pino behind a typed logging facade.
- The facade MUST expose a closed allowlist: `timestamp`, `level`, `component`,
  `event_name`, `profile`, `queue_name`, `attempt_type`, `attempt_count`, `state`,
  `latency_ms`, `circuit_state`, `counter_name`, `counter_value`, `request_id`,
  `job_id`, `trace_id`, pseudonymous organization
  hash, `resource_type`, `resource_id`, `status_code`, `duration_ms`, provider or
  model non-secret identifiers, token counts, `error_class`, and `error_code`.
- JSON is written only to process `stdout`/`stderr`. `pino-pretty` is only a
  local-process interactive formatter/viewer and never a telemetry sink; no file,
  Loki, Sentry, Cloud Logging or other
  external telemetry is configured.
- The facade MUST omit pino-http default request/response/error serialization.
  Raw `Error`, stack, dynamic message, SQL text/parameters, headers, cookies,
  tokens, environment values, PII, prompt/source/message, provider body,
  prompt/schema/evaluator hashes, ciphertext/tag/nonce and arbitrary payload are
  forbidden. Redaction occurs
  before serialization; unsafe-field serialization failure fails closed.
- Operational logs are diagnostics, not an audit trail and MUST NOT contain
  `AuditEvent` payloads or transition text.

The initial registry is finite and versioned: `event_name` is one of
`request.completed`, `request.rejected`, `job.started`, `job.completed`,
`job.failed`, `job.expired`, `db.lock_wait`, `db.slow_operation`,
`startup.rejected`; `ui.degraded` is browser-local state vocabulary only and is
not emitted by the server or sent over a network; API-CTL-05 is a post-MVP
backlog item and is not part of the current implementation scope.
`error_class` is one of `config`, `auth`, `validation`, `authorization`,
`conflict`, `limit`, `dependency`, `provider`, `database`, `timeout`, or
`internal`; `error_code` is either an existing accepted API
problem literal or one of the bounded operational literals `startup_invalid`,
`dependency_unavailable`, `provider_unavailable`, `worker_timeout`,
`db_lock_timeout`, `db_slow_operation`, `redaction_failed`,
`payload_auth_failed`, `semantic_rejection`, `partner_post_demo`,
`candidate_invalid`, `generation_stale`, or `source_expired`. These worker/provider
literals are redacted terminal categories, not raw provider or database codes.
`counter_name` is one of `queue_depth`, `claimed_total`, `running_total`,
`terminal_total`, `stale_total`, `redelivery_total`, `dlq_total`,
`schema_repair_total`, `hitl_total`, `semantic_rejection_total`, or
`wall_deadline_expiry_total`; `counter_value` is an integer `0..9007199254740991`.
Counters use the same event/facade/sink and are not a separate metrics transport.
Adding a literal is a contract change and requires traceability plus the owning
B-step review. A dynamic message is never used as an event or error identifier.

The API-to-operational mapping is deterministic: session/launch/Origin/CSRF
problems map to `auth`; forbidden/hidden-resource problems to `authorization`;
malformed/body/content/cursor/schema problems to `validation`; state,
idempotency, generation, route and persona conflicts to `conflict`; rate limits
to `limit`; transport/deadline failures to `timeout`; `crypto_unavailable` to `dependency`;
`provider_unavailable` to `provider`; and `internal_error` to `internal`. The
accepted wire field remains `code`; `error_class` and `error_code` are operational
facade fields only.

Worker/provider source categories map without invention: invalid provider
auth/profile/model and unavailable dependency map to
`dependency/dependency_unavailable`; provider 429/5xx/refusal/content-filter or
unknown output to `provider/provider_unavailable`; transport timeout, wall
deadline, or circuit-open expiry to `timeout/worker_timeout`; authenticated
payload failure to `database/payload_auth_failed`; accepted semantic outcomes to
`validation/semantic_rejection` or `validation/partner_post_demo`; malformed or
schema-invalid candidate to `validation/candidate_invalid`; stale generation to
`conflict/generation_stale`; and expired source to `dependency/source_expired`.
Retry/replay cannot change the mapping. Raw HTTP, provider, PostgreSQL, or SDK
messages/codes never become facade literals.

## Error contract

- Every handled failure maps to stable `error_class` and `error_code`; a dynamic
  message is never the contract. API wire problems continue to use the accepted
  registry and do not become a new ProblemDetails or endpoint decision.
- Empty catches, silent catches, silent fallbacks and swallowed rejected promises
  are forbidden. A critical error MUST fail closed for the affected request,
  worker job, profile or capability. Only an isolated, non-critical UI failure
  may enter controlled degraded mode and it MUST not mutate server state.
- Startup configuration preflight runs before listener/logger creation. Malformed
  config preserves the no-listener/no-application-log/no-generated-file invariant.

## Browser handling

Nuxt error hooks and an error boundary own browser presentation and recovery.
Browser diagnostics remain local and allowlisted. No browser telemetry endpoint is
defined: API-CTL-05 is `POST_MVP_BACKLOG` because A7 protects an exact
68-operation browser inventory and corresponding RBAC matrix. A future endpoint
requires a successor API/RBAC/security decision and must reject text, stack, URL,
route, query and sensitive metadata.

## Database diagnostics

Native PostgreSQL output MUST use `log_destination=stderr` with
`logging_collector=off`; native `jsonlog`, files, and external sinks are forbidden.
B1 MUST pin `log_statement=none`, `log_min_error_statement=PANIC`,
`log_min_messages=PANIC`, `log_duration=off`, `log_lock_waits=off`,
`log_parameter_max_length=0`, `log_parameter_max_length_on_error=0`,
`log_min_duration_statement=-1`, `log_min_duration_sample=-1`, and
`log_error_verbosity=TERSE`. A local typed adapter/facade, not native PostgreSQL
`jsonlog`, MAY emit allowlisted lock-wait/deadlock and slow-duration metadata from
stable operation/error codes and measured duration, never from a raw PostgreSQL
message, into JSON on `stderr`. SQL statements and parameter values MUST NOT be emitted;
no new DB grant is permitted. B1 MUST scan actual native and normalized stderr
for representative error, lock, and slow cases rather than treating config as
proof.

## Audit separation

`AuditEvent` remains append-only domain evidence written by the accepted trigger/
routine path in the same transaction as a mutation. It contains only its existing
allowlist and never receives `trace_id`, stack, operational log fields, prompt,
message, provider body or secrets. Retention and read permissions remain those in
the security-boundaries and RBAC contracts.

## Delivery gates

Implementation details belong to B0/B1/B3/B4/B8. Required test intents are
`OBS-LOG-01`, `OBS-LOG-02`, `OBS-ERR-01`, `OBS-ERR-02`, `OBS-FAIL-01`, `OBS-UI-01`,
`OBS-DB-01`, and `OBS-AUDIT-01`. This document alone is not runtime/test/build
evidence.

## Sources

PostgreSQL settings and the native `jsonlog`/collector distinction follow the
[PostgreSQL 17 logging configuration](https://www.postgresql.org/docs/17/runtime-config-logging.html).
Exact installed behavior remains a B1 evidence gate.
