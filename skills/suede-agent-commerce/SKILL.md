---
name: suede-agent-commerce
description: Make a Suede asset legible to AI agents — encode what it is and what an agent may and may not do, so agents can inspect, route, recommend, license, transact around, and QA it without crossing rights, payout, or registry lines. Use on a Suede song, skill pack, docs, site, API, install commands, or rights and licensing metadata.
---

# Suede Agent Commerce

Use this skill to prepare Suede work for agent-readable discovery and safe
commerce flows.

## Prepare

1. Identify the object agents need to understand: song, catalog, rights
   package, skill pack, site, API, MCP tool, or docs page.
2. Make the object machine-readable with names, descriptions, paths, URLs,
   install commands, rights notes, provenance notes, and claim boundaries.
3. Check whether a payable or routing action is implied. Add caveats for rights,
   payout, licensing, registry, and distribution.
4. Add proof links and verification commands.
5. Route metadata gaps to `suede-seo-audit`, rights gaps to
   `suede-rights-audit`, and install gaps to `suede-install-support`.

## Evidence And Severity Gate

Agents need explicit boundaries. Use a table before recommending actions:

```text
Agent-readable claim:
Status: confirmed | unconfirmed | disputed | unknown | not-applicable
Evidence:
Allowed agent action:
Disallowed agent claim:
Risk: low | medium | high | unknown
Next action:
```

High-risk items block payable, licensing, registry, distribution, routing, or
public recommendation language until verified. Keep install commands, public
URLs, rights notes, provenance notes, and proof links sourceable.

## Output

```text
Agent-readable object:
Metadata:
Evidence table:
Actions agents can take:
Actions agents cannot claim:
Proof links:
Verification:
```
