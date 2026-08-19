# Мой проект: Tutu travel tinder tech

**tutu travel tinder tech** — mobile-first swipe-сервис для подбора поездок на [Tutu MCP](https://mcp.tutu.ru/mcp): свободный текст → карточки-идеи с обучением на лайках → живые пакеты (транспорт + отели) → checkout на [tutu.ru](https://www.tutu.ru/). 

---

## MCP Туту: как подключить

Endpoint: **[https://mcp.tutu.ru/mcp](https://mcp.tutu.ru/mcp)**  
Transport: remote / Streamable HTTP, **без авторизации**

Публичной внешней доки почти нет — спецификация живёт внутри сервера. Разобрали live API (v0.26.0) и сложили шпаргалку + dump tools/playbooks в `[docs/tutu-mcp/tutu-mcp.md](./docs/tutu-mcp/tutu-mcp.md)`.

Через MCP доступны:

- самолёты — поиск и сравнение рейсов
- поезда — поиск мест и ссылка на оформление
- отели — поиск номеров и анализ отзывов
- электрички — расписание
- автобусы — поиск мест и ссылка на оформление
- multitransport — сравнение видов транспорта
- checkout-ссылки (без оплаты на стороне MCP)

### Быстрый старт

**Cursor** — `.cursor/mcp.json` (проект) или `~/.cursor/mcp.json` (глобально):

```json
{
  "mcpServers": {
    "tutu": {
      "url": "https://mcp.tutu.ru/mcp"
    }
  }
}
```

Сохранить → перезагрузить окно → проверить статус: **Cursor Settings → Tools & Integrations → MCP**.

---

**ChatGPT** (Plus / Pro / Team / Enterprise — Developer Mode):

1. Settings → Connectors → Advanced → включить **Developer Mode**
2. Нажать **Create** → ввести имя `Tutu`, URL `https://mcp.tutu.ru/mcp`, аутентификация — `None`
3. Нажать **Create** — инструменты появятся в чате через меню **+**

---

**Claude**  
Settings → Connectors → Add custom connector → `https://mcp.tutu.ru/mcp`

**Claude Code**

```bash
claude mcp add --transport http tutu https://mcp.tutu.ru/mcp
```

**OpenCode** (`opencode` config)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "tutu": {
      "type": "remote",
      "url": "https://mcp.tutu.ru/mcp",
      "enabled": true
    }
  }
}
```

Инструкция и детали: [mcp.tutu.ru/mcp](https://mcp.tutu.ru/mcp)

---

## Документация

**Техническая документация** (архитектура, MCP-интеграция, локальный запуск) — в этом `README.md` и в папке `docs/`.

**Пользовательская документация** — отдельный интерактивный лендинг на **GitHub Pages**.  
Это не про настройку — это туториал для конечного пользователя: как найти поездку свайпом, чем сервис полезен, пошаговый flow с иллюстрациями и маркетинговым акцентом на преимуществах.

> **Заготовка:** `docs/landing/` — будущий источник GitHub Pages (`gh-pages` ветка или папка `/docs`).  
> Лендинг будет включать: hero с ценностным предложением, анимированный swipe-flow, шаги «как это работает», FAQ и CTA на демо.

---

