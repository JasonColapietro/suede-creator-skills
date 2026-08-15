# Stdio Test Blocks

Copy-paste JSON-RPC blocks that exercise initialize, tools, resources, and prompts over stdio, plus the lifecycle and malformed-input probes.

## Stdio Test Blocks

Run from the repo root. The canonical gate starts real child processes and
tests complete sessions rather than isolated requests:

```bash
npm run test:mcp
```

It must pass lifecycle enforcement and version negotiation; list/call/read/get
coverage; closed input and output schemas; read-only annotations;
`structuredContent` plus both text forms; profile filtering; malformed input;
the 1 MiB transport bound; invalid profile handling; stdout JSON purity; and
clean healthy stderr.

For a manual readback, keep initialization and later requests in the same
server process. A new process is a new MCP session:

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"suede-mcp-qa","version":"1.0.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized","params":{}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
  '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"suede_install_options","arguments":{"surface":"mcp"}}}' \
  | node mcp/suede-skills-mcp.mjs --profile all
```

The initialization result must report protocol `2025-06-18`, server version
`0.12.0`, and explicit tools/resources/prompts capabilities. `tools/list` must
return exactly the 8 tools above. Each tool must expose `inputSchema`,
`outputSchema`, and annotations with `readOnlyHint: true`,
`destructiveHint: false`, `idempotentHint: true`, and `openWorldHint: false`.
The successful call must return `structuredContent`; `content[0]` must be useful
human text and `content[1]` must be the same structured payload serialized as
JSON for backwards-compatible clients.

To prove the lifecycle guard independently:

```bash
printf '%s\n' '{"jsonrpc":"2.0","id":4,"method":"tools/list","params":{}}' \
  | node mcp/suede-skills-mcp.mjs --profile all
```

This must return error `-32000` because `notifications/initialized` has not
completed. Use the automated suite for post-initialization negative paths; a
standalone `tools/call` example is invalid because it starts a fresh session.

Error codes: `-32700` parse error; `-32600` invalid request, duplicate
initialization, or transport overflow; `-32601` unsupported method; `-32602`
invalid params, arguments, tool, resource, or prompt; `-32000` request before
session readiness; `-32603` unexpected internal error. A parse error correctly
uses `id: null`. A raw stack trace or any non-JSON stdout is a High failure.
