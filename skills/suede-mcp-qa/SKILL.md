---
name: suede-mcp-qa
description: "Catch MCP drift before release: skill catalogs, tool and resource schemas, prompts, install paths, JSON-RPC behavior, and docs alignment."
---

# Suede MCP QA

Use this skill when a Suede MCP server or MCP docs surface changes.

**Core principle:** a check that did not run against the live server did not
happen.

## Operating Stance

- Run against a live MCP server, not a spec document. If the server is not running, start it before checking.
- For each check, record the exact command run and the exact output received. Do not summarize.
- A check that cannot run (server unreachable, tool not implemented) is a FAIL, not a skip.
- Report failures immediately — do not wait until all checks complete to surface a blocker.
- Never mark a skill as present in the catalog unless its folder exists and its SKILL.md is readable.
- Never mark an install command as working unless you ran it from a temporary destination directory.

## Checks

1. Run syntax checks for the MCP source.
2. Parse catalog JSON and confirm every listed skill folder exists.
3. Exercise `initialize`, `ping`, `tools/list`, `tools/call`,
   `resources/list`, `resources/read`, `prompts/list`, and `prompts/get` when
   supported.
4. Confirm install output leads with public GitHub skill installs.
5. Confirm local plugin commands are labeled as local-only.
6. Check bounded text handling, invalid tool names, invalid resources, and
   malformed JSON-RPC messages.
7. Compare MCP output against README, docs pages, and public catalog language.

## This Server's Real Surface

`mcp/suede-skills-mcp.mjs` is the only server this skill QAs. Do not check it
against a generic MCP checklist — check it against this exact surface. Read
`mcp/catalog.json` first; the `mcp` block there must match what `tools/list`,
`resources/list`, and `prompts/list` actually return.

7 tools: `list_suede_skills`, `get_suede_skill`, `suede_install_options`,
`suede_copy_seo_audit`, `suede_visibility_grade`, `suede_code_grade`,
`suede_qa_checklist`.

6 resources: `suede://catalog`, `suede://plugins`, `suede://copy-seo-audit`,
`suede://visibility-grade`, `suede://code-grade`, `suede://qa-checklist`.

5 prompts: `suede-copy-seo-audit`, `suede-plugin-install`,
`suede-visibility-grade`, `suede-code-grade`, `suede-full-qa`.

If any count drifts, the source (`resources`/`tools`/`prompts` arrays in
`suede-skills-mcp.mjs`) is ground truth, not this list — re-run `tools/list`,
`resources/list`, and `prompts/list` and update both this section and
`mcp/catalog.json`'s `mcp` block to match.

## Stdio Test Blocks

Run each from the repo root. The server speaks newline-delimited JSON-RPC over
stdio — one line in, one line out. `--profile all` exposes the full catalog;
swap in `workflow`, `artist`, or `creator` to test profile scoping.

**`initialize`**

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | node mcp/suede-skills-mcp.mjs --profile all
```

```json
{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2025-06-18","capabilities":{"tools":{},"resources":{},"prompts":{}},"serverInfo":{"name":"suede-skills-mcp","version":"0.2.0"},"instructions":"Use this MCP when Suede skill discovery, install guidance, visibility grading, code grading, SEO/AEO/AI EO copy audits, or QA checklists will materially help the task."}}
```

**`tools/list`**

```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | node mcp/suede-skills-mcp.mjs --profile all
```

Returns a `tools` array of exactly the 7 tools named above, each with
`name`, `title`, `description`, and `inputSchema`. Confirm the count and every
name — a missing or renamed tool here is a High failure per Checks item 3.

**`tools/call` — successful call**

```bash
echo '{"jsonrpc":"2.0","id":9,"method":"tools/call","params":{"name":"suede_install_options","arguments":{"surface":"mcp"}}}' | node mcp/suede-skills-mcp.mjs --profile all
```

```json
{"jsonrpc":"2.0","id":9,"result":{"content":[{"type":"text","text":"\n## MCP option\nUse the MCP when structured skill discovery, install options, visibility grading, code grading, SEO/AEO/AI EO copy audits, or QA checklists materially help the task.\n- Suede Workflow Skills MCP server: `suede_workflow_mcp`\n- Suede Creator Skills MCP server: `suede_creator_mcp`"}],"structuredContent":{"plugins":[{"...":"truncated — full plugin objects from catalog.json"}],"surface":"mcp"}}}
```

Every successful `tools/call` returns both `content` (text for a model to
read) and `structuredContent` (the same data as structured JSON). Check both
are present, not just one.

**`resources/read` — successful read**

```bash
echo '{"jsonrpc":"2.0","id":4,"method":"resources/read","params":{"uri":"suede://plugins"}}' | node mcp/suede-skills-mcp.mjs --profile all
```

```json
{"jsonrpc":"2.0","id":4,"result":{"contents":[{"uri":"suede://plugins","mimeType":"text/markdown","text":"## Public Codex skill install\n- Suede Workflow Skills: `python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py --repo JasonColapietro/suede-creator-skills --path skills/suede-workflow-skills`\n- Suede Creator Skills: `python3 ...` (truncated — full text continues with local plugin and Claude Code install sections)"}]}}
```

**Negative path — unknown tool name**

```bash
echo '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"not_a_real_tool","arguments":{}}}' | node mcp/suede-skills-mcp.mjs --profile all
```

```json
{"jsonrpc":"2.0","id":5,"error":{"code":-32602,"message":"Unknown tool: not_a_real_tool"}}
```

**Negative path — unknown resource URI**

```bash
echo '{"jsonrpc":"2.0","id":8,"method":"resources/read","params":{"uri":"suede://not-a-real-resource"}}' | node mcp/suede-skills-mcp.mjs --profile all
```

```json
{"jsonrpc":"2.0","id":8,"error":{"code":-32602,"message":"Unknown resource URI: suede://not-a-real-resource"}}
```

**Negative path — unsupported method**

```bash
echo '{"jsonrpc":"2.0","id":10,"method":"totally/bogus","params":{}}' | node mcp/suede-skills-mcp.mjs --profile all
```

```json
{"jsonrpc":"2.0","id":10,"error":{"code":-32601,"message":"Unsupported MCP method: totally/bogus"}}
```

**Negative path — malformed JSON**

```bash
printf '{"jsonrpc":"2.0","id":6,"method":"tools/list", not valid json here}\n' | node mcp/suede-skills-mcp.mjs --profile all
```

```json
{"jsonrpc":"2.0","id":null,"error":{"code":-32700,"message":"Parse error"}}
```

`id` comes back `null` on a parse error — the server never got far enough to
read the request's `id`. Do not flag a `null` id here as broken; flag it if
any other error response returns `null` when the request had a real id.

Full JSON-RPC error code map observed from this server: `-32700` parse error,
`-32600` invalid request (missing/bad `method`, or top-level `jsonrpc` isn't
`"2.0"`), `-32601` unsupported method, `-32602` unknown tool name / unknown
resource URI / unknown prompt name. Any other code, or a raw stack trace
instead of a JSON-RPC error object, is a High failure.

## Failure Handling

| Failure type | Severity | Action |
|---|---|---|
| Server fails to start | Critical | Stop. Report startup error verbatim. |
| `tools/list` returns empty | Critical | Stop. The MCP is non-functional. |
| Listed skill folder missing | High | Flag each missing folder. Continue checking others. |
| Malformed JSON-RPC response | High | Report the raw response. Flag as broken. |
| Install command leads with local-only path | High | Flag. Install output must lead with public GitHub route. |
| Docs/catalog language mismatch | Medium | List each mismatch. Flag as hold-with-caveat. |
| Tool implemented but not in catalog | Low | Flag as undocumented. Not a blocker. |

Ship gate rules:
- Any Critical or High failure → **hold**
- Medium failures only → **ship-with-caveats** (list each caveat)
- No failures → **ship**

## Output

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

## Red Flags — Stop

- "The server ran fine last week; no need to restart it for this." — Run every check against the live server now.
- "The catalog parses, so the folders are surely there." — Open every listed folder and read its SKILL.md.
- "That check can't run, I'll mark it skipped." — A check that cannot run is a FAIL.
- "The output looked right, close enough." — Record the exact command and exact output, verbatim.

## Routing

After QA:
- MCP source needs fixes → return to the MCP source file and fix, then re-run this skill
- Catalog JSON needs updates → edit `mcp/catalog.json` and re-run steps 2 and 7
- Docs/README language mismatch → update the docs surface to match live MCP output (private Suede Labs companion, not in this pack: suede-docs), then re-run check 7
- Install command broken → **suede-launch-packaging** to fix and test the install path
