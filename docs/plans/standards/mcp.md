---
title: MCP integration
status: active
updated: 2026-08-19
scope: standards
---

# MCP integration

**Purpose:** Configure and consume MCP servers safely at the project level.
Covers config locations, transport types, secret handling, and security rules.

**Non-goals:** Building MCP servers — only consumption and security. Tool
invocation patterns and Tutu-specific playbooks → `docs/tutu-mcp/tutu-mcp.md`.

**Owner:** Project maintainers · **Status:** Active · **Last reviewed:** 2026-08-19

## Config locations

| Product | Project scope | User scope |
| ------- | ------------- | ---------- |
| **Cursor** | `.cursor/mcp.json` | `~/.cursor/mcp.json` |
| Others | Follow vendor documentation | Follow vendor documentation |

MUST (when the product supports it): keep project-specific server definitions in
the project-level file and commit non-secret config.

AVOID: committing raw secrets — use environment variable indirection supported by
the host (e.g. `${env:VAR_NAME}` in Cursor).

## Config format

Local `stdio` server:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "my-mcp-server"],
      "env": {
        "API_KEY": "${env:MY_API_KEY}"
      }
    }
  }
}
```

Remote `Streamable HTTP` server (no auth — e.g. Tutu MCP):

```json
{
  "mcpServers": {
    "tutu": {
      "url": "https://mcp.tutu.ru/mcp"
    }
  }
}
```

Remote server with auth:

```json
{
  "mcpServers": {
    "remote-server": {
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${env:SERVICE_TOKEN}"
      }
    }
  }
}
```

## Transport types

| Transport | Use for |
| --------- | ------- |
| `stdio` | Local CLI servers (single user) |
| `SSE` | Remote server, multiple users, OAuth |
| `Streamable HTTP` | Remote server, multiple users, OAuth |

## Security rules

* MUST: Secrets via environment indirection — never hardcode in committed config.
* MUST: Review MCP server source before installing (it runs on your machine).
* SHOULD: Restricted API keys with least privilege.
* SHOULD: Prefer `stdio` for sensitive integrations when feasible.
* AVOID: Installing servers from unknown sources without auditing.

## `.gitignore` note

If config references local `.env` files, ensure they are ignored. Non-secret
project `mcp.json` may be committed when the team agrees.

## This project

The Tutu MCP endpoint (`https://mcp.tutu.ru/mcp`) is a remote Streamable HTTP
server with no auth. It is a **Protected Contract** — do not change the URL
without explicit team agreement. See `docs/tutu-mcp/tutu-mcp.md` for the full API
reference and `docs/agents/mcp-integration.md` for integration rules.

## Sources

| Rule | Source |
| ---- | ------ |
| Cursor `mcp.json` paths | [cursor.com/docs/context/mcp](https://cursor.com/docs/context/mcp) |
| `mcpServers` JSON shape | [cursor.com/docs/context/mcp](https://cursor.com/docs/context/mcp) |
| Transports | [cursor.com/docs/context/mcp](https://cursor.com/docs/context/mcp) |
| Secrets interpolation | [cursor.com/docs/context/mcp](https://cursor.com/docs/context/mcp) |
| Audit / least privilege | [cursor.com/docs/context/mcp](https://cursor.com/docs/context/mcp) |
