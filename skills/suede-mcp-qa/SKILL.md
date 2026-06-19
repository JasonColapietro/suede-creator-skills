---
name: suede-mcp-qa
description: Suede MCP server QA workflow for stdio JSON-RPC tools, resources, prompts, catalog output, install options, SEO audit scaffolds, QA checklists, protocol errors, public-safe content, and docs alignment. Use when building, changing, testing, or explaining the Suede Skills MCP.
---

# Suede MCP QA

Use this skill when a Suede MCP server or MCP docs surface changes.

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
