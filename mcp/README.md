# Suede Skills MCP

`suede-skills-mcp.mjs` is a small local stdio MCP server for Suede skills.

It is useful when an agent needs structured access to:

- Suede skill discovery for Johnny Suede writing/design modes, Apple and iOS
  surfaces, Suedify, design, anti-slop copywriting, Suede SEO/AEO/AI EO,
  visual QA, artist campaigns, and creator utilities;
- public GitHub skill installs, local plugin notes, MCP, and skill-copy install options;
- SEO/AEO/AI EO copy audit scaffolds;
- A-F website visibility, CTA, rendered design-signal, and code-grade
  scaffolds;
- multi-lane QA checklists for skill, MCP, docs, public site changes,
  max-agent loops, and rights evidence checks.

For public positioning, launch copy, ambassador language, Suedify messaging,
MCP explanation, social posts, emails, FAQ answers, and claim boundaries, use
[`PROMO.md`](../PROMO.md).

Run it directly:

```bash
node mcp/suede-skills-mcp.mjs --profile all
```

Profiles:

- `all`: expose workflow, artist, and creator utility skill context.
- `workflow`: expose Suedify, design, anti-slop copywriting, SEO/AEO/AI EO, QA, and public workflow context.
- `artist`: expose artist campaign skill context.
- `creator`: expose public artist and creator utility context.

The server is dependency-free and speaks newline-delimited JSON-RPC over stdio.
It supports `initialize`, `ping`, `tools/list`, `tools/call`,
`resources/list`, `resources/read`, `prompts/list`, and `prompts/get`.

Current surface: 7 tools (`list_suede_skills`, `get_suede_skill`,
`suede_install_options`, `suede_copy_seo_audit`, `suede_visibility_grade`,
`suede_code_grade`, `suede_qa_checklist`), 6 resources (`suede://catalog`,
`suede://plugins`, `suede://copy-seo-audit`, `suede://visibility-grade`,
`suede://code-grade`, `suede://qa-checklist`), and 5 prompts
(`suede-copy-seo-audit`, `suede-plugin-install`, `suede-visibility-grade`,
`suede-code-grade`, `suede-full-qa`).
