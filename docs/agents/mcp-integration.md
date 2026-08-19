# Tutu MCP integration contract

Operational contract for agents and application code integrating with Tutu MCP.

## Endpoint

| Property   | Value |
| ---------- | ----- |
| URL        | `https://mcp.tutu.ru/mcp` |
| Transport  | Remote / Streamable HTTP |
| Auth       | None |

Do not change the endpoint without team agreement and README update.

## Canonical reference

| Resource | Path |
| -------- | ---- |
| Main cheat sheet | [docs/tutu-mcp/tutu-mcp.md](../tutu-mcp/tutu-mcp.md) |
| Tool dump | [docs/tutu-mcp/tutu-mcp-tools.json](../tutu-mcp/tutu-mcp-tools.json) |
| Overview | [docs/tutu-mcp/overview.md](../tutu-mcp/overview.md) |
| Playbooks | [docs/tutu-mcp/get_avia_instructions.md](../tutu-mcp/get_avia_instructions.md), [get_rail_instructions.md](../tutu-mcp/get_rail_instructions.md), [get_bus_instructions.md](../tutu-mcp/get_bus_instructions.md), [get_hotels_instructions.md](../tutu-mcp/get_hotels_instructions.md), [get_etrain_instructions.md](../tutu-mcp/get_etrain_instructions.md), [get_multitransport_instructions.md](../tutu-mcp/get_multitransport_instructions.md) |

When live API behavior changes, update `docs/tutu-mcp/` in the same change set as code.

## Tool domains

- **Avia** — flight search and comparison
- **Rail** — train seats and checkout links
- **Bus** — bus search and checkout links
- **Hotels** — room search and review analysis
- **Etrain** — suburban train schedules
- **Multitransport** — compare transport modes
- **Checkout** — URLs for booking (no payment via MCP)

## Client setup (examples)

**Claude Code**

```bash
claude mcp add --transport http tutu https://mcp.tutu.ru/mcp
```

**Cursor / Claude** — add custom connector → `https://mcp.tutu.ru/mcp`

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

## Agent usage rules

- Call `tools/list` when unsure of tool names or schemas.
- Follow domain playbooks in `docs/tutu-mcp/get_*_instructions.md` for multi-step flows.
- Prefer structured tool arguments; validate JSON before sending.
- Surface checkout links to users; do not assume payment completes inside the agent.
- Do not commit API keys — Tutu MCP requires no auth today; if that changes, use env vars only.

## Protected fields

Do not rename or remove without team agreement:

- `docs/tutu-mcp/tutu-mcp.md` as the primary human + agent index
- Playbook filenames `get_*_instructions.md`
- Documented endpoint URL in README and this file
