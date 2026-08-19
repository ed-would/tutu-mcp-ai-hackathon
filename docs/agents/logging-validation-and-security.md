# Logging, validation, and security

## Errors and user-facing messages

- Surface failures with clear, user-readable text (Russian OK in user-facing UI if the product targets Russian speakers).
- Log technical detail to console or structured logs in application code — avoid dumping raw MCP payloads to end users.

## JSON and validation

- Parse JSON with try/catch or a safe parser; never assume MCP responses are well-formed.
- Validate tool arguments against schemas from `tools/list` or `docs/tutu-mcp/tutu-mcp-tools.json` before calling Tutu MCP.

## Security

- **No secrets in repo** — Tutu MCP needs no auth today; use environment variables if auth is added later.
- **Do not commit** `.env`, tokens, or personal travel data from test runs.
- Run subprocesses with `execFile` (or equivalent array-args APIs), not raw shell strings with user input.
- Sanitize user-provided city names, dates, and free text before echoing in logs.

## MCP in this repo

- **Primary integration:** remote Tutu MCP at `https://mcp.tutu.ru/mcp` (see [mcp-integration.md](mcp-integration.md)).
- Prefer Cursor/Claude remote connector or documented client config; avoid shadow MCP installs without team approval.
- If adding `.cursor/mcp.json`, commit only non-secret config; use `${env:VAR}` for any future credentials.
- Follow organizational MCP governance: get explicit approval before installing new MCP servers.

## Checkout links

- MCP returns checkout URLs — open in browser or hand off to the user; do not store payment credentials in the agent or app.
