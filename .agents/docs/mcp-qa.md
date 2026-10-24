# MCP release QA

Repo-internal checklist for this pack's own MCP server,
`mcp/suede-skills-mcp.mjs`, its `mcp/catalog.json`, and the MCP install docs.
Run it when the server, the catalog, a tool, resource, or prompt definition, or
the MCP install docs change, and before publishing an MCP release.

This used to ship as the public `suede-mcp-qa` skill. It describes only this
server, so it lives with the repo instead of the installable pack.

The verdict is advisory, like every gate in this repo: report what passed and
what failed, and let the requester decide.

## Rules

- Run against a live server, not a spec or README. Start it if it is not
  running.
- Record the exact command and exact output for each check.
- A check that could not run against the live server is a FAIL, not a skip.
- Surface a blocker as soon as it appears.
- A catalog skill counts as present only when its folder exists and its
  `SKILL.md` is readable.
- An install command counts as working only when it ran from a temporary
  destination directory.
- Check and report only. Fix the server, catalog, or docs separately, then
  re-run. A server fix gets a `suede-code` review before the re-run.

## Checks

1. `node --check mcp/suede-skills-mcp.mjs` and `npm run test:mcp`.
2. Parse `mcp/catalog.json`, confirm every listed skill folder exists, then run
   `scripts/mcp-surface-snapshot.sh`. Exit 1 means drift: the server's own
   `tools`, `resources`, and `prompts` arrays are ground truth, and the catalog
   is what gets corrected.
3. Exercise the full lifecycle in one process: `initialize`,
   `notifications/initialized`, then `ping`, `tools/list`, `tools/call`,
   `resources/list`, `resources/read`, `prompts/list`, `prompts/get`.
4. Supported protocol versions are echoed; an unsupported client version
   negotiates to the server's latest supported version.
5. Every tool has a closed `inputSchema`, an `outputSchema`, and read-only,
   non-destructive, idempotent annotations.
6. Every successful call returns `structuredContent`, a useful text block, and
   a serialized JSON text fallback.
7. Probe pre-initialization calls, repeated initialization, bounded input and
   arguments, invalid names and schemas, malformed JSON, and unknown methods.
8. Healthy stderr is empty; stdout carries newline-delimited JSON only.
9. Install output leads with public GitHub skill installs, labels local plugin
   commands as local-only, and README, docs, and catalog wording match the live
   server.

## Manual readback

`npm run test:mcp` is the canonical gate. It starts real child processes and
tests complete sessions: lifecycle enforcement and version negotiation,
list/call/read/get coverage, closed schemas, read-only annotations,
`structuredContent` plus both text forms, profile filtering, malformed input,
the 1 MiB transport bound, invalid profiles, stdout purity, and clean stderr.

For a manual readback, keep initialization and later requests in one server
process. A new process is a new MCP session:

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"suede-mcp-qa","version":"1.0.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized","params":{}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
  '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"suede_install_options","arguments":{"surface":"mcp"}}}' \
  | node mcp/suede-skills-mcp.mjs --profile all
```

The initialization result must report protocol `2025-06-18`, server version
`0.19.3`, and explicit tools/resources/prompts capabilities. `tools/list` must
return exactly the tools the catalog's `mcp` block lists. Each tool must expose
`inputSchema`, `outputSchema`, and annotations with `readOnlyHint: true`,
`destructiveHint: false`, `idempotentHint: true`, and `openWorldHint: false`.
The successful call must return `structuredContent`; `content[0]` must be
useful human text and `content[1]` the same structured payload serialized as
JSON for older clients.

Lifecycle guard on its own:

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
session readiness; `-32603` unexpected internal error. A parse error uses
`id: null`. A raw stack trace or any non-JSON stdout is a High failure.

## Severity

| Failure | Severity | Recommended action |
|---|---|---|
| Server fails to start | Critical | Stop; report the startup error verbatim |
| `tools/list` returns empty | Critical | Stop; the server is non-functional |
| Lifecycle or protocol negotiation fails | High | Hold; capture the request and response |
| Tool schema, output schema, or read-only annotation missing | High | Hold; repair the contract and re-run |
| Structured result lacks either text fallback | High | Hold |
| Listed skill folder missing | High | Flag each one; keep checking |
| Malformed JSON-RPC response | High | Report the raw response |
| Install output leads with a local-only path | High | Flag |
| Docs or catalog wording mismatch | Medium | List each; hold-with-caveat |
| Tool implemented but not cataloged | Low | Flag as undocumented |

Any Critical or High → `hold`. Medium only → `ship-with-caveats`. None →
`ship`.

## Report

```text
Server:
Commands run:
Tools checked:
Resources checked:
Prompts checked:
Install output:
Failures:
Fixes:
Ship gate: ship | ship-with-caveats | hold
```
