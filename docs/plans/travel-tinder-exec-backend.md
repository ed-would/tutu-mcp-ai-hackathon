---
title: Travel Tinder — Execution Plan (Backend + MCP Orchestration)
status: active
updated: 2026-08-19
scope: docs/plans
---

# Travel Tinder — План 2.2 (backend, MCP orchestration, pricing contracts)

## 0) Пререквизиты

1. Infra scaffold завершён и `/api/health` отвечает.
2. Протоколы и tool names подтверждены против `docs/tutu-mcp/tutu-mcp.md` перед стартом coding.

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

- город отправления и дата туда/обратно,
- `adults` и точные возраста детей,
- общий бюджет,
- темп поездки, интересы и `desiredVibe`,
- допустимые виды транспорта,
- `hotelPreferences` (завтрак, отмена, число кроватей, `choose_self` / explicit hotel choice).

**Нормы:**

1. Если критичные поля не заполнены, сразу задаём до 3 уточняющих вопросов через один `bottom sheet`.
2. Никаких скрытых дефолтов (`"Москва"`, `"ближайшие выходные"`) до завершения clarification.
3. При валидационной ошибке всегда единый error contract (см. §2).

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
   - `search_multitransport` туда и обратно (мультимодальное сравнение),
   - `search_avia` с `return_date` (real round-trip),
   - `search_hotels` с `preferences`-gate.
2. Для семейного сценария:
   - `search_avia` с `return_date` (round-trip),
   - `search_bus` туда и обратно,
   - `search_hotels` с `children_ages`.
3. Поезд и семейка: rail из pricing исключается, если MCP для rail не принимает возраст детей.
4. Все независимые MCP-вызовы запускаются через `Promise.allSettled`.
5. Live prefetch — только после лайка; непрогретые идеи MCP не вызывают.
6. Параллельная генерация пакетов:
   - максимум 2 liked ideas за цикл,
   - максимум 3 liked directions в ранжировании,
   - для одной идеи максимум 2 пакета: `optimal` и `faster_or_comfortable`.

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

1. Для авиа round-trip + hotel используется точный total текущих офферов.
2. Для автобус/поезд (out + return) + hotel — ориентир с `~`, отдельный breakdown и две отдельные транспортные покупки.
3. Цена отеля уже включает весь stay и не умножается повторно на ночи.
4. Карточка пакета всегда показывает:
   - `timestamp`,
   - `source: "Tutu MCP"`,
   - `confidence` (точность).
5. Частичные ответы допустимы (например, транспорт без отеля): UI показывает отсутствующий сегмент как отсутствующий, не маскирует и не подставляет фиктивную часть.

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

1. Авиа:
   - один checkout-step для `transport_outbound` с `is_round_trip = true`,
   - `hotel` (2 шага: round-trip transport + hotel).
2. Поезд/автобус:
   - `transport_outbound`,
   - `transport_return`,
   - `hotel` (3 шага).
3. Кнопка в UI — строго «Перейти к бронированию».
4. Для avia в шагах сохраняются `passengerCounts`, `is_round_trip`, `return_departure_at`.
5. Приложение не обещает оплату/завершённое бронирование, только редирект по внешним ссылкам.
6. URL проверяются по allowlist и передаются без ручной сборки.

### 1.5) `GET /api/health`

Возвращаем только:

- `app: ok`,
- `llm: ok | degraded`,
- `mcp: ok | degraded`,
- `schema/tool fingerprint`,
- `durations`,
- `timestamp`.

Ни env-переменные, ни сырые ошибки, ни ключи.

### 1.6) Preference engine

Вектор весов учитывает интересы, темп, бюджет, комфорт и транспорт.

1. Like: `+1.0` по тегам идеи.
2. Pass: `-0.35`.
3. Веса нормализуются в диапазон `[-1, 1]`.
4. Ранжирование:
   - 85% `weighted relevance`,
   - 15% `ε-greedy` exploration.
5. `sessionSeed` обязателен в профиле для воспроизводимости.
6. UI показывает человеческий интерпретируемый вывод (например: «вам важны поезда, гастрономия и короткая дорога»), а не сырой вектор.

---

## 2) Contracts/layers

1. Все API/input/output/internal модели через Zod.
2. Реализовать shared DTO в `apps/app/shared/contracts`.
3. Единый error contract:
   ` { code, message, retryable, requestId, stage } `.
4. Stage для ошибок: `interpret`, `packages`, `checkout`, `mcp-call`, `validation`.
5. Протестировать parse/normalize на happy и malformed payload.
6. Не логировать raw user intent, MCP payload и секреты.

---

## 3) MCP orchestration и LLM fallback

1. Инициализация MCP через `@modelcontextprotocol/client` + streamable transport.
2. Схема обработки:
   1) interpret/clarification path;
   2) idea generation (LLM + validation + rule fallback);
3) package flow;
   4) checkout refs только после выбора пакета.
3. Тайминги:
   - LLM 8 сек.
   - MCP 12 сек на call.
   - Route cap 20 сек.
4. Retry только для retry-safe ошибок (429/5xx/network), max attempts и backoff.
5. Серверная сессия stateless:
   - каждый запрос получает свой MCP-коннект;
   - закрываем transport в finally.
6. Partial responses — allowed states; ни один upstream-failure не должен падать в hard crash UI.

---

## 4) Ценовой контракт (exact vs estimated)

1. `exact_round_trip`: для полноценного round-trip pricing.
2. `estimated_split_trip`: для двух отдельных legs с `~`.
3. Для `search_bus`/`search_hotels` соблюдаем partial/complete semantics.
4. Семейный сценарий: rail-прайс исключается, если MCP contract не поддерживает детей на rail.
5. `hotel` стоимость **никогда** не умножается повторно на nights.
6. Каждая карточка цены показывает:
   - источник `Tutu MCP`,
   - timestamp обновления,
   - статус точности.

---

## 5) Checkout + trust boundary

1. Allowlist только разрешённых hosts.
2. Идентификаторы поездок/чека только для построения перехода, без хранения PII.
3. Для avia сохраняем: количество пассажиров, `is_round_trip`, `return_departure_at`.
4. Никаких in-app оплат.

---

## 6) Acceptance (пока backend block is not green)

1. Смоуки:
   - `npm run --prefix apps/app mcp-smoke`
   - `npm run --prefix apps/app packages-smoke`
2. Unit-инварианты:
   - <= 3 clarification questions;
   - family vs adult routing;
   - exact/estimated distinction;
   - отсутствие изобретения полей/URLs;
   - malformed MCP поля не заполняются догадками;
   - hotel price not multiplied by nights;
   - deterministic behavior for seed;
   - timeout/fallback path.
3. Любой divergence от MCP tool names без повторной валидации `docs/tutu-mcp/tutu-mcp-tools.json` = блокер.

---

## 7) Готовность и lock

1. После backend plan: контрактные outputs должны быть доступны для Frontend + QA.
2. Без обновления `docs/agents/verification.md`/`docs/agents/architecture.md` по измененным trust-boundaries backend не закрывается.
3. Все изменения фиксируем в `docs/plans/travel-tinder-exec-backend.md` и соответствующих evidence.
