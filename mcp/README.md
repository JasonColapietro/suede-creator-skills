# Suede Skills MCP

`suede-skills-mcp.mjs` is a small local stdio MCP server for Suede skills and plugins.

It is useful when an agent needs structured access to:

- Suede plugin and skill discovery;
- Codex plugin, MCP, and skill-copy install options;
- SEO copy audit scaffolds;
- multi-lane QA checklists for plugin, MCP, docs, and public site changes.

Run it directly:

```bash
node mcp/suede-skills-mcp.mjs --profile all
```

Profiles:

- `all`: expose workflow and creator skill context.
- `workflow`: expose Suede workflow skill context.
- `creator`: expose public creator skill context.

The server is dependency-free and speaks newline-delimited JSON-RPC over stdio.
It supports `initialize`, `ping`, `tools/list`, `tools/call`,
`resources/list`, `resources/read`, `prompts/list`, and `prompts/get`.
