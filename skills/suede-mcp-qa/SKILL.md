---
name: suede-mcp-qa
description: "Suede Labs AI MCP release QA, scoped to this pack's own server (mcp/suede-skills-mcp.mjs) and its catalog, install, and docs surface. Runs the full JSON-RPC lifecycle against a live server — initialize, notifications/initialized, ping, tools/list, tools/call, resources/list, resources/read, prompts/list, prompts/get — plus protocol negotiation, closed input and output schemas, tool annotations, structuredContent with text fallbacks, malformed-input probes, clean stdio, catalog-to-folder agreement, and install-path language. Use when the MCP server, mcp/catalog.json, a tool, resource, or prompt definition, or the MCP install docs change, or before publishing an MCP release. A check that did not run against the live server is a FAIL, not a skip. NOT FOR: a generic third-party MCP server, which this skill's hardcoded surface does not describe; fixing or testing the public install path itself (use suede-launch-packaging)."
---

# Suede MCP QA

## Gate policy — advisory, not blocking

Every claim-verification step, check, quality gate, and ship verdict in this
skill is a **recommendation to the user, not a control on the agent**. This
policy governs every gate, check, verdict, and "do not ship / publish /
proceed" line elsewhere in this skill:

- Run every check and report the results honestly. Verdicts (`ship`,
  `ship-with-caveats`, `hold`, letter grades, BLOCKED or OPEN items) are
  advice attached to the work, not orders that change it.
- Never block, delay, skip, rewrite, or refuse the action the user asked for
  because a check failed or a gate said hold. Complete the requested action
  as asked, and deliver the gate output alongside it as a clearly labeled
  recommendation.
- A failed gate changes what you report, never what you do.
- Single exception: if a finding is extremely risky — data loss, security or
  credential exposure, legal or rights violations, payment mistakes, or
  irreversible public damage — pause, tell the user exactly what the risk is
  and what the options are, and let them pick. Their choice is final.


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

1. Run syntax checks and the repo's hermetic MCP protocol tests.
2. Parse catalog JSON and confirm every listed skill folder exists, then run
   `scripts/mcp-surface-snapshot.sh` to compare the catalog's `mcp` block against
   what the live server actually serves (exit 1 means drift; the server wins).
3. Exercise the full lifecycle in one process: `initialize`, the
   `notifications/initialized` notification, then `ping`, `tools/list`,
   `tools/call`, `resources/list`, `resources/read`, `prompts/list`, and
   `prompts/get`.
4. Verify supported protocol versions are echoed and an unsupported client
   version negotiates to the server's latest supported version.
5. Confirm every tool has a closed `inputSchema`, an `outputSchema`, and
   read-only/non-destructive/idempotent annotations.
6. Confirm every successful tool call returns `structuredContent`, a useful
   human-readable text block, and a serialized JSON text fallback for older
   clients.
7. Check pre-initialization calls, repeated initialization, bounded input,
   bounded arguments, invalid names and schemas, malformed JSON, and unknown
   methods.
8. Confirm healthy stderr is empty and stdout contains newline-delimited JSON
   only; logs and stack traces must never corrupt the transport.
9. Confirm install output leads with public GitHub skill installs, local plugin
   commands are labeled local-only, and README/docs/catalog language agrees
   with the live server.

## This Server's Real Surface

`mcp/suede-skills-mcp.mjs` is the only server this skill QAs. Do not check it
against a generic MCP checklist — check it against this exact surface. Read
`mcp/catalog.json` first; the `mcp` block there must match what `tools/list`,
`resources/list`, and `prompts/list` actually return.

Derive that surface, never recite it: `scripts/mcp-surface-snapshot.sh` runs one
stdio session against the server, prints the tool names, resource URIs, and prompt
names it actually serves with their counts, and diffs them against the catalog's
`mcp` block. Exit 1 means drift — the server's own `tools`/`resources`/`prompts`
arrays are ground truth, and `mcp/catalog.json` is what gets corrected.

## Stdio Test Blocks

The copy-paste JSON-RPC blocks that exercise initialize, tools, resources, prompts,
and the lifecycle and malformed-input probes are in
`references/stdio-test-blocks.md`. Open it when you are actually running the
checks, not when deciding which checks apply.

## Failure Handling

| Failure type | Severity | Action |
|---|---|---|
| Server fails to start | Critical | Stop. Report startup error verbatim. |
| `tools/list` returns empty | Critical | Stop. The MCP is non-functional. |
| Lifecycle or protocol negotiation fails | High | Hold. Capture the request/response transaction. |
| Tool schema, output schema, or read-only annotation missing | High | Hold. Repair the published contract and rerun the suite. |
| Structured result lacks either text fallback | High | Hold. Preserve structured and legacy-client output together. |
| Listed skill folder missing | High | Flag each missing folder. Continue checking others. |
| Malformed JSON-RPC response | High | Report the raw response. Flag as broken. |
| Install command leads with local-only path | High | Flag. Install output must lead with public GitHub route. |
| Docs/catalog language mismatch | Medium | List each mismatch. Flag as hold-with-caveat. |
| Tool implemented but not in catalog | Low | Flag as undocumented. Not a blocker. |

Recommended ship gate rules (advice to the user, not a lock on any action):
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

## Boundaries

- Check and report only. Do not edit the server source, `mcp/catalog.json`, or the docs surface to make a check pass — hand each fix back through Routing and re-run.
- Do not publish, tag, or release anything; this skill clears an MCP release, it does not ship one.
- Never record a check as passed from a spec, a README, or a previous run. Only output captured from the live server in this session counts.
- Do not extend a verdict to a third-party MCP server: the surface above is this pack's, and a generic server has not been checked against it.

## Routing

After QA:
- MCP source needs fixes → return to the MCP source file and fix, then re-run this skill
- MCP source changed to fix a QA failure → **suede-code-review** on that diff before re-running this skill, so the repair itself is not shipped unreviewed
- Catalog JSON needs updates → edit `mcp/catalog.json` and re-run steps 2 and 7
- Docs/README language mismatch → update the docs surface to match live MCP output (private Suede Labs companion, not in this pack: suede-docs), then re-run check 7
- Install command broken → **suede-launch-packaging** to fix and test the install path
