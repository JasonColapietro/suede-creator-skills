---
name: suede-mcp-qa
description: "Catch a broken Suede Skills MCP before it ships — one that lists missing skills or returns malformed output. Checks source, catalog, every skill folder, tools, resources, prompts, install options, SEO/AEO/AI EO audit scaffolds, QA checklists, JSON-RPC errors, public-safe content, and docs alignment. Use when building, changing, testing, or explaining the Suede Skills MCP, when the catalog may have drifted from the skill folders, or before shipping any MCP server or catalog change. NOT FOR: fixing a broken skill install command outside the MCP (use suede-launch-packaging)."
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
- Docs/README language mismatch → update the docs surface to match live MCP output (use suede-docs — private), then re-run check 7
- Install command broken → **suede-launch-packaging** to fix and test the install path
