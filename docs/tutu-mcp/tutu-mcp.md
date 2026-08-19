# Tutu MCP — шпаргалка для изучения

Живой endpoint: [https://mcp.tutu.ru/mcp](https://mcp.tutu.ru/mcp)  
Лендинг с инструкцией подключения: тот же URL (в браузере — HTML, для агента — MCP Streamable HTTP).

Публичной «доки в Medium» почти нет: вся документация **внутри самого MCP** (`instructions`, playbooks, `tutu://*` resources). Ниже — выжимка с живого сервера **v0.38.0** (снято 2026-08-19).

## Что это

Read-only search layer над Туту:

- отели
- авиа / ЖД / автобусы / электрички
- сборка checkout-ссылок

**Нет:** оплаты, личных кабинетов, бронирований на стороне MCP. Корзина создаётся в браузере пользователя по ссылке.

Сервер: `tutu-mcp-server`, Python 3.12, transport `streamable-http`, без авторизации.

## Главный флоу

```text
search_*  →  (get_offer_details / get_rail_seatmap)  →  create_checkout_link
```

Или отдать готовый `checkout_url` / у отелей `best_offer.checkout_url`.

Перед доменом, который ещё не трогали в сессии, один раз вызвать playbook:

| Домен | Playbook |
| --- | --- |
| avia | `get_avia_instructions` |
| rail | `get_rail_instructions` |
| bus | `get_bus_instructions` |
| etrain | `get_etrain_instructions` |
| hotels | `get_hotels_instructions` |
| multitransport | `get_multitransport_instructions` |

Полные тексты playbooks лежат в этой папке: `get_*_instructions.md`.

## Tools (16)

### Поиск

| Tool | Зачем |
| --- | --- |
| `search_hotels` | отели по городу + датам |
| `search_avia` | авиа |
| `search_rail` | поезда дальнего следования |
| `search_bus` | автобусы |
| `search_etrain` | электрички |
| `search_multitransport` | сравнить все виды транспорта |

Общие фичи поиска:

- пагинация: `page` (≤10), `page_size` (1..30, default 10), смотреть `meta.has_more`
- сортировка транспорта: `price_asc` (default) / `price_desc` / `duration_asc` / `departure_asc`
- фильтры: `price_max`, `direct_only`, `carriers` (имя брать из `meta.carriers_available`, не угадывать)
- `view`: `compact` (default) | `full`
- legacy-алиасы: `from_city`/`to_city`, `checkin_date`/`checkout_date`

### Детали и checkout

| Tool | Зачем |
| --- | --- |
| `get_offer_details` | карточка оффера; у отелей ещё отзывы |
| `get_rail_seatmap` | схема мест по вагонам + тарифы |
| `create_checkout_link` | единый билдер deeplink/checkout URL по `checkout_ref` |
| `fetch_resource` | прочитать `tutu://...`, если клиент не умеет resources |

Схемы аргументов: [`tutu-mcp-tools.json`](./tutu-mcp-tools.json).

## Resources (`tutu://`)

| URI | Содержание |
| --- | --- |
| `tutu://help/overview` | краткий обзор (см. [`overview.md`](./overview.md)) |
| `tutu://geo` | справочник городов/точек |
| `tutu://amenities/dictionary` | код удобства → русская подпись |
| `tutu://status` | health MCP + upstream |
| `tutu://version` | версия, fingerprint схем |
| `tutu://special-offers` | экспериментальные идеи поездок (не прайс) |
| `tutu://debug/memory` | диагностика памяти |

## Prompt

`plan_trip` — бюджетная поездка через `search_multitransport` + `search_hotels`  
Аргументы: `origin`, `destination`, `departure_date`, `return_date`, `budget_rub`, опционально `adults`.

## Важные правила из instructions

1. **Не выдумывать** офферы и поля. Нет поля в ответе → сказать «Туту не вернул это поле».
2. **Не подменять** web-поиском / общим знанием отсутствующие данные.
3. Отзывы отелей — **цитировать** verbatim, с датами.
4. Цены рендерить как в payload; у отелей `price` уже **за весь stay**, не умножать на ночи.
5. Всегда рядом с выбором класть `checkout_url` / `search_results_url`.
6. Смотреть `meta.from` / `meta.to` / `meta.resolved_geo` — что реально зарезолвилось (город + область); если есть `also_named[]` — предупредить про омонимы.
7. Отели: при широком запросе сначала уточнить предпочтения (2–4 вопроса), потом искать.

## Ограничения scope

- Нет оплаты и PII
- Rail/bus/etrain — geo на уровне **города**, не «с Казанского вокзала»
- Avia — исключение: можно аэропорт по имени или IATA (`SVO`, «Шереметьево»)
- Connecting round-trip avia часто падает в `search_redirect`, а не в прямой deeplink

## Живой smoke-тест (2026-08-02)

`search_avia` Москва → СПб на 2026-08-20:

- matched **49** офферов
- cheapest ~**3325 RUB**
- carriers в meta: Аэрофлот, Победа, S7

Сводка: [`sample-search-avia-summary.json`](./sample-search-avia-summary.json)  
Status upstreams: [`status.json`](./status.json) — hotel API / geo-suggest в `ok`.

## Как пощупать руками

```bash
# initialize
curl -s https://mcp.tutu.ru/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"study","version":"0.1"}}}'

# list tools
curl -s https://mcp.tutu.ru/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'

# Claude Code
claude mcp add --transport http tutu https://mcp.tutu.ru/mcp
```

## Файлы в `docs/tutu-mcp/`

| Файл | Что внутри |
| --- | --- |
| `tutu-mcp.md` | эта шпаргалка |
| `overview.md` | официальный `tutu://help/overview` |
| `tutu-mcp-tools.json` | полные description + inputSchema всех 16 tools |
| `get_*_instructions.md` | playbooks по доменам |
| `status.json` / `version.json` | runtime |
| `amenities-dictionary.json` | словарь amenities |
| `special-offers.json` | experimental deals |
| `sample-search-avia-summary.json` | пример ответа поиска |
