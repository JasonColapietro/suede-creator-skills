# Suede Skills MCP

`suede-skills-mcp.mjs` is a small local stdio MCP server for Suede skills.

It is useful when an agent needs structured access to:

- Suede skill discovery for outcome routing, Johnny Suede
  writing/design modes, Apple and iOS surfaces, Suedify, design, anti-slop
  copywriting, Suede SEO/AEO/AI EO, visual QA, artist campaigns, and creator
  utilities;
- public GitHub skill installs, local plugin notes, MCP, and skill-copy install options;
- SEO/AEO/AI EO copy audit scaffolds;
- A-F website visibility, CTA, rendered design-signal, and code-grade
  scaffolds;
- multi-lane QA checklists for skill, MCP, docs, public site changes,
  max-agent loops, and rights evidence checks.

For public positioning, launch copy, public explainer language, Suedify
messaging, MCP explanation, social posts, emails, FAQ answers, and evidence
boundaries, use [`PROMO.md`](../PROMO.md).

Run it directly:

```bash
node mcp/suede-skills-mcp.mjs --profile all
```

Profiles:

- `all`: expose the full public catalog.
- Area profiles `workflow`, `creator`, `marketing`, and `consumer` narrow the
  server to the corresponding plugin-bundle context. `artist` remains a legacy
  alias for the creator context.
- Specialty profiles `ship`, `craft`, `found`, `demand`, `revenue`, and
  `position` narrow the server to one catalog specialty.

The server is dependency-free and speaks newline-delimited JSON-RPC over stdio.
It supports `initialize`, `ping`, `tools/list`, `tools/call`,
`resources/list`, `resources/read`, `prompts/list`, and `prompts/get`.

Current surface: 9 tools (`list_suede_skills`, `list_suede_specialties`,
`search_suede_skills`, `get_suede_skill`, `suede_install_options`,
`suede_copy_seo_audit`, `suede_visibility_grade`, `suede_code_grade`,
`suede_qa_checklist`), 7 resources (`suede://catalog`, `suede://specialties`,
`suede://plugins`, `suede://copy-seo-audit`, `suede://visibility-grade`,
`suede://code-grade`, `suede://qa-checklist`), and 5 prompts
(`suede-copy-seo-audit`, `suede-plugin-install`, `suede-visibility-grade`,
`suede-code-grade`, `suede-full-qa`).

The plugin manifest registers `suede_creator_mcp` (`creator` profile),
`suede_workflow_mcp` (`workflow` profile), and `suede_marketing_mcp`
(`marketing` profile). Catalog additions are exposed through
the generic discovery tool and `suede://catalog`; adding a skill does not add a
new tool, resource, or prompt.
