---
title: Travel Tinder — Execution Plan (Backend + MCP Orchestration)
status: active
updated: 2026-08-19
scope: docs/plans
---

# Travel Tinder — План 2.2 (backend, MCP orchestration, pricing contracts)

## Легенда статуса (аудит 2026-08-19, повторная сверка с кодом)

| Индикатор | Значение |
| --------- | -------- |
| 🟢 | Полностью выполнено — соответствует плану в рабочем коде |
| 🟡 | Частично — есть зачаток, но не по спецификации или без полировки |
| 🔴 | Не выполнено — отсутствует или только упомянуто в плане |

**Сводка:** 🟢 ~58 · 🟡 ~6 · 🔴 0 backend-критичных (из ~64 проверяемых пунктов)

**Evidence (локально, 2026-08-19):** `npm run typecheck` ✅ · `npm run test` ✅ (74/74) · `npm run build` ✅.

**Backend закрыт для демо.** P0/P1 реализованы. Оставшиеся 🟡 — осознанные упрощения под 20s route cap и stateless-сервер, не блокеры питча.

**Что уже держит вертикальный срез:** все 4 route; live `search_avia` round-trip + честный `exact_round_trip`; family `search_avia` + `search_bus` × 2 + `children_ages`; `optimal` / `faster_or_comfortable`; `CheckoutStep[]` при `{ refs }` (и fallback `steps` даже для одного ref); один упавший checkout-ref не роняет остальные шаги; health fingerprint + duration budgets; seed-stable rank + `preferenceSummary`; MCP retry на connect и tool-call; shared/runtime контракты согласованы.

**Что осталось (backend, некритично — не трогаем перед freeze):**

| Пункт | Статус | Комментарий |
| ----- | ------ | ----------- |
| Batch-ranking 3 liked directions на сервере | 🟡 | Клиент шлёт до 3 likes параллельными `/api/packages` и сам склеивает `rankLivePackages` |
| Like/pass накопление весов | 🟡 | Считается на клиенте; сервер только ранжирует пришедший `preferences` (stateless) |
| Health fingerprint | 🟡 | Config-hash ожидаемых tools, не live `tools/list` на каждый `/health` (live — в `mcp-smoke`) |
| MCP retry | 🟡 | 1 повтор, 200 ms backoff на connect и retry-safe tool-call; timeout не ретраится |
| `search_rail` как отдельный tool-call | 🟡 | Не вызывается напрямую; rail идёт через `search_multitransport` |

**Что осталось (фронт, вне scope backend-плана):**

| Пункт | Статус | Где |
| ----- | ------ | --- |
| Multi-step checkout CTA | 🟢 | `DiscoverPage` шлёт `refs[]`, рисует `checkout.steps` |
| `preferenceSummary` в UI | 🟢 | API отдаёт, клиент показывает `.preference-summary` |
| Family flow в UI | 🟢 | `getPackages` передаёт `childrenAges` |
| Bottom sheet clarify | 🔴 | Отдельный экран `ClarifyForm`, не sheet |

---

## 0) Пререквизиты

1. 🟢 Infra scaffold завершён и `/api/health` отвечает (`apps/app/api/health.ts`, `npm run build` проходит).
2. 🟡 Протоколы и tool names — `mcp-smoke` валидирует live `tools/list` (16 tools, `search_avia=true`); `/api/health` отдаёт **config-only** fingerprint ожидаемых tools, не live hash.

---

## 1) Публичные интерфейсы и модель данных

### 1.1) `POST /api/interpret`

**Вход:**

```ts
type InterpretRequest = {
  prompt: string;
  answers?: Record<string, string | string[]>;
  locale: "ru-RU";
};
```

**Выход (discriminated union):**

```ts
type InterpretResponse =
  | {
      status: "needs_clarification";
      questions: ClarificationQuestion[]; // <= 3
      draftIntent: Partial<TravelIntent>;
    }
  | {
      status: "ready";
      intent: TravelIntent;
      ideas: DestinationIdea[]; // ровно 8
      generation: "llm" | "rule_fallback";
    };
```

`TravelIntent` (ядро входа в `/api/packages`) включает:

- 🟢 город отправления и дата туда/обратно,
- 🟢 `adults` и точные возраста детей,
- 🟢 общий бюджет,
- 🟢 темп поездки, интересы и `desiredVibe`,
- 🟢 допустимые виды транспорта,
- 🟢 `hotelPreferences` (завтрак, отмена, число кроватей, `choose_self` / explicit hotel choice).

**Нормы:**

1. 🟢 Если критичные поля не заполнены, сразу задаём до 3 уточняющих вопросов через один `bottom sheet` (backend: `needs_clarification`, ≤ 3; UI sheet — отдельная задача фронта).
2. 🟡 Никаких скрытых дефолтов (`"Москва"`, `"ближайшие выходные"`) до завершения clarification — rule fallback извлекает из текста, не подставляет молча, но LLM-путь зависит от промпта.
3. 🟢 При валидационной ошибке всегда единый error contract (см. §2).

### 1.2) `POST /api/packages`

**Вход:**

```ts
type PreferenceEngineRequest = {
  intent: TravelIntent;
  idea: DestinationIdea;
  preferences: PreferenceVector;
  sessionSeed: string;
};
```

**Выход:**

```ts
type PackagesResponse = {
  packages: TripPackage[];
  warnings: SourceWarning[];
  sources: SourceEvidence[];
};
```

**Оркестрационный минимум:**

1. Для взрослых:
   - 🟢 `search_multitransport` туда и обратно (мультимодальное сравнение),
   - 🟢 `search_avia` с `return_date` (real round-trip),
   - 🟢 `search_hotels` с `preferences`-gate (whitelist MCP keys + aliases).
2. Для семейного сценария:
   - 🟢 `search_avia` с `return_date` (round-trip),
   - 🟢 `search_bus` туда и обратно,
   - 🟢 `search_hotels` с `children_ages`.
3. 🟢 Поезд и семейка: rail из pricing исключается — family path не вызывает `search_rail` / `search_multitransport`.
4. 🟢 Все независимые MCP-вызовы запускаются через `Promise.allSettled`.
5. 🟢 Live prefetch — только после лайка; непрогретые идеи MCP не вызывают (контракт API; enforcement на клиенте).
6. Параллельная генерация пакетов:
   - 🟢 максимум 2 пакета на идею: `optimal` и `faster_or_comfortable`;
   - 🟡 максимум 3 liked directions — backend обслуживает одну idea за запрос; клиент шлёт до 3 параллельных вызовов и склеивает `rankLivePackages`.

### 1.3) Цена и честность (`TripPackage.price`)

```ts
type PackagePrice =
  | {
      confidence: "exact_round_trip";
      amount: number;
      currency: "RUB";
    }
  | {
      confidence: "estimated_split_trip";
      amount: number;
      currency: "RUB";
      note: "Два отдельных билета; цена может измениться";
    };
```

1. 🟢 Для авиа round-trip + hotel — `exact_round_trip` только при `checkout_ref.is_round_trip=true` + `return_departure_at` и без `is_multi_pnr` (`server/packages/orchestrator.ts`).
2. 🟢 Для автобус/поезд (out + return) + hotel — ориентир с `~`, breakdown и две отдельные транспортные покупки (`estimated_split_trip`).
3. 🟢 Цена отеля уже включает весь stay и не умножается повторно на ночи (покрыто тестами).
4. 🟢 Карточка пакета всегда показывает:
   - 🟢 `timestamp` (и совместимый `updatedAt`),
   - 🟢 `source: "Tutu MCP"`,
   - 🟢 `confidence` (точность).
5. 🟢 Частичные ответы допустимы (например, транспорт без отеля): UI показывает отсутствующий сегмент как отсутствующий, не маскирует и не подставляет фиктивную часть.

### 1.4) `POST /api/checkout`

**Вход:** выбранные `opaque checkout_ref` (по шагам пакета).

**Выход:**

```ts
type CheckoutStep = {
  order: number;
  label: string;
  url: string;
  product: "transport_outbound" | "transport_return" | "hotel";
};
```

1. 🟢 Авиа:
   - один checkout-step для `transport_outbound` с `is_round_trip = true`,
   - `hotel` (2 шага: round-trip transport + hotel) — через `{ refs: [...] }`; UI шлёт `refs[]`.
2. 🟢 Поезд/автобус:
   - `transport_outbound`,
   - `transport_return`,
   - `hotel` (3 шага) — тот же `{ refs }` контракт; один упавший ref не роняет остальные шаги.
3. 🟢 Кнопка в UI — строго «Перейти к бронированию».
4. 🟢 Для avia в шагах сохраняются `passengerCounts`, `is_round_trip`, `return_departure_at` — opaque ref уходит в MCP verbatim.
5. 🟢 Приложение не обещает оплату/завершённое бронирование, только редирект по внешним ссылкам.
6. 🟢 URL проверяются по allowlist и передаются без ручной сборки (`isAllowedTutuUrl`, opaque ref verbatim).

### 1.5) `GET /api/health`

Возвращаем только:

- 🟢 `app: ok`,
- 🟢 `llm: ok | degraded`,
- 🟢 `mcp: ok | degraded`,
- 🟡 `schema/tool fingerprint` — config-hash ожидаемых tools (`server/mcp/tools.ts`); live `tools/list` только в `mcp-smoke`,
- 🟢 `durations`,
- 🟢 `timestamp`.

Ни env-переменные, ни сырые ошибки, ни ключи — 🟢 соблюдается.

### 1.6) Preference engine

Вектор весов учитывает интересы, темп, бюджет, комфорт и транспорт.

1. 🟡 Like: `+1.0` по тегам идеи — клиент считает вектор, сервер ранжирует пакеты если веса пришли.
2. 🟡 Pass: `-0.35` — на клиенте; сервер клипает веса в `[-1, 1]`.
3. 🟢 Веса нормализуются в диапазон `[-1, 1]`.
4. 🟢 Ранжирование:
   - 85% `weighted relevance`,
   - 15% `ε-greedy` exploration.
5. 🟢 `sessionSeed` обязателен в профиле для воспроизводимости.
6. 🟢 Человеческий интерпретируемый вывод — backend отдаёт `preferenceSummary`; UI рисует `.preference-summary`.

---

## 2) Contracts/layers

1. 🟢 Все API/input/output/internal модели через Zod.
2. 🟢 Реализовать shared DTO в `apps/app/shared/contracts` — runtime shape совпадает (packages transport/hotel, checkout `{ url, steps }`).
3. 🟢 Единый error contract:
   ` { code, message, retryable, requestId, stage } `.
4. 🟢 Stage для ошибок: `interpret`, `packages`, `checkout`, `mcp-call`, `validation`.
5. 🟢 Протестировать parse/normalize на happy и malformed payload (`tests/contracts.test.ts`, `packages.test.ts`, `checkout.test.ts`).
6. 🟢 Не логировать raw user intent, MCP payload и секреты.

---

## 3) MCP orchestration и LLM fallback

1. 🟢 Инициализация MCP через `@modelcontextprotocol/client` + streamable transport.
2. Схема обработки:
   1) 🟢 interpret/clarification path;
   2) 🟢 idea generation (LLM + validation + rule fallback);
   3) 🟢 package flow — avia round-trip + multi/bus + hotels;
   4) 🟢 checkout refs только после выбора пакета — `create_checkout_link`, `steps[]` для `{ refs }`.
3. Тайминги:
   - 🟢 LLM 8 сек.
   - 🟢 MCP 12 сек на call.
   - 🟢 Route cap 20 сек.
4. 🟡 Retry для retry-safe ошибок (429/5xx/network) — **1 повтор**, 200 ms пауза (`server/mcp/retry.ts`); connect тоже ретраится; timeout не ретраится.
5. 🟢 Серверная сессия stateless:
   - каждый запрос получает свой MCP-коннект;
   - закрываем transport в finally.
6. 🟢 Partial responses — allowed states; ни один upstream-failure не должен падать в hard crash UI.

---

## 4) Ценовой контракт (exact vs estimated)

1. 🟢 `exact_round_trip`: для полноценного round-trip pricing.
2. 🟢 `estimated_split_trip`: для двух отдельных legs с `~`.
3. 🟢 Для `search_bus`/`search_hotels` соблюдаем partial/complete semantics.
4. 🟢 Семейный сценарий: rail-прайс исключается, если MCP contract не поддерживает детей на rail.
5. 🟢 `hotel` стоимость **никогда** не умножается повторно на nights.
6. 🟢 Каждая карточка цены показывает:
   - 🟢 источник `Tutu MCP`,
   - 🟢 timestamp обновления (`timestamp` / `updatedAt`),
   - 🟢 статус точности.

---

## 5) Checkout + trust boundary

1. 🟢 Allowlist только разрешённых hosts.
2. 🟢 Идентификаторы поездок/чека только для построения перехода, без хранения PII.
3. 🟢 Для avia сохраняем: количество пассажиров, `is_round_trip`, `return_departure_at` (verbatim в checkout_ref).
4. 🟢 Никаких in-app оплат.

---

## 6) Acceptance

1. Смоуки (проверено 2026-08-19):
   - 🟢 `npm run --prefix apps/app mcp-smoke` — live `tools/list`, fingerprint `3b7655785215`
   - 🟢 `npm run --prefix apps/app packages-smoke` — live packages, `search_avia` + multitransport + hotels
2. Unit-инварианты (`npm run test` — 74/74):
   - 🟢 <= 3 clarification questions;
   - 🟢 family vs adult routing;
   - 🟢 exact/estimated distinction;
   - 🟢 отсутствие изобретения полей/URLs;
   - 🟢 malformed MCP поля не заполняются догадками;
   - 🟢 hotel price not multiplied by nights;
   - 🟢 deterministic behavior for seed;
   - 🟢 timeout/fallback path;
   - 🟢 MCP retry (`tests/mcp-retry.test.ts`);
   - 🟢 partial multi-step checkout (`tests/checkout-service.test.ts`).
3. 🟢 Divergence от MCP tool names = блокер — `mcp-smoke` в `.github/workflows/ci.yml` (`Live MCP tool-name gate`).

---

## 7) Готовность и lock

1. 🟢 После backend plan: контрактные outputs доступны для Frontend + QA.
2. 🟢 Без обновления `docs/agents/verification.md`/`docs/agents/architecture.md` по измененным trust-boundaries backend не закрывается.
3. 🟢 Все изменения фиксируем в `docs/plans/travel-tinder-exec-backend.md` и соответствующих evidence.

---

## 8) Приоритет для жюри

По `docs/agents/judging-criteria.md` — критерии **Theme**, **Depth**, **MCP integration** напрямую смотрят на backend.

| Приоритет | Пункт плана | Статус |
| --------- | ----------- | ------ |
| **P0** | `search_avia` + честный `exact_round_trip` | 🟢 |
| **P0** | Multi-step `CheckoutStep[]` + `create_checkout_link` | 🟢 API + UI `refs[]`; частичный checkout не роняет остальные шаги |
| **P0** | Свести `shared/contracts` и runtime API | 🟢 |
| **P1** | Family flow: `search_avia` + `search_bus` + `children_ages` | 🟢 backend + клиент шлёт `childrenAges` |
| **P1** | Preference engine / server-side rank | 🟢 seed + ε-greedy; клиент шлёт вектор и рисует summary |
| **P1** | Health fingerprint + durations | 🟡 fingerprint config-only; durations 🟢 |
| **P2** | `optimal` / `faster_or_comfortable` | 🟢 |
| **P2** | MCP retry/backoff | 🟡 1 retry / 200 ms на connect и tool-call |
| **P2** | Обновить `verification.md` / `architecture.md` | 🟢 |

---

## 9) Итог

**Backend block: зелёный для хакатона.** Жюри-критичные MCP-вызовы (`search_avia`, `search_multitransport`, `search_hotels`, `create_checkout_link`) работают live; exact vs estimated честный; checkout multi-step готов на API и в UI.

Осознанно не делаем: live `tools/list` в `/api/health`, отдельный `search_rail`, серверную сессию like/pass, batch `/api/packages` на 3 направления в одном запросе (упрётся в 20s cap).
