# Agent, LLM, and MCP Security Lane

Load this file when the diff touches an MCP server or client, tool definitions,
agent loops, prompt templates, model calls, retrieval, or agent memory. It adds
security findings only. Whether the agent behaves well (accuracy, refusals,
eval coverage) belongs to **suede-ai-eval**. Last checked against the official
sources below in October 2026.

## Trigger paths

Run the lane when any of these appear in the diff: `@modelcontextprotocol/sdk`
or another MCP SDK import; a `tools/list` or `tools/call` handler; a tool
`description`, `inputSchema`, or `annotations` literal; `.mcp.json` or another
client config that launches a server command; a model SDK call whose output
feeds a tool, a shell, a query, or HTML; a vector store write; an agent memory
file or table.

## Cite the right list

- **OWASP Top 10 for LLM Applications 2025:** LLM01 Prompt Injection, LLM02
  Sensitive Information Disclosure, LLM03 Supply Chain, LLM04 Data and Model
  Poisoning, LLM05 Improper Output Handling, LLM06 Excessive Agency, LLM07
  System Prompt Leakage, LLM08 Vector and Embedding Weaknesses, LLM09
  Misinformation, LLM10 Unbounded Consumption.
  https://genai.owasp.org/llm-top-10/
- **OWASP Top 10 for Agentic Applications 2026** (published December 9, 2025):
  ASI01 Agent Goal Hijack, ASI02 Tool Misuse, ASI03 Identity & Privilege
  Abuse, ASI04 Agentic Supply Chain Vulnerabilities, ASI05 Unexpected Code
  Execution, ASI06 Memory & Context Poisoning, ASI07 Insecure Inter-Agent
  Communication, ASI08 Cascading Failures, ASI09 Human-Agent Trust
  Exploitation, ASI10 Rogue Agents.
  https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/

Cite the web Top 10:2025 category too when one fits (A01 for a missing
authorization check, A05 for injection). One finding, both labels.

## MCP server checks

From the MCP specification (2025-11-25) tools page and security best practices:

| Check | Spec basis | Default severity |
|---|---|---|
| Every tool validates its inputs server-side, not only through `inputSchema` | Servers MUST validate all tool inputs | P1 |
| Each tool enforces access control for the calling user | Servers MUST implement proper access controls | P0 when it reaches data or money |
| Tool calls are rate limited | Servers MUST rate limit tool invocations | P2 (P1 on paid or write tools) |
| Tool output is sanitized before it returns | Servers MUST sanitize tool outputs | P1 when output echoes third-party text |
| Server accepts only tokens issued to itself; no forwarding the client's token downstream | Token passthrough is forbidden; servers MUST NOT accept tokens not issued for the MCP server | P0 |
| HTTP server verifies every inbound request and does not treat a session ID as authentication | Servers MUST verify all inbound requests and MUST NOT use sessions for authentication | P0 |
| Session IDs come from a secure random source and are bound to the user (`<user_id>:<session_id>`) | MUST use secure, non-deterministic session IDs; SHOULD bind to user | P1 |
| OAuth proxy with a static client ID keeps per-client consent, exact `redirect_uri` match, single-use `state` | Confused deputy mitigations (MUST) | P0 |
| Scopes start minimal; no `*`, `all`, or full catalog in `scopes_supported` | Scope minimization guidance | P2 |
| A local server meant for one client uses `stdio`, or an HTTP transport with an auth token or restricted IPC | Local server compromise guidance (SHOULD) | P1 when bound to `0.0.0.0` with no auth |
| If an `outputSchema` is declared, structured results conform to it | Servers MUST conform | P2 |

## MCP client and agent host checks

- **Tool metadata is untrusted.** Clients MUST treat tool annotations as
  untrusted unless they come from trusted servers. A `readOnlyHint` or
  `destructiveHint` that gates confirmation is not a control. Flag code that
  skips a confirmation prompt because a server said a tool is safe (ASI02, P1).
- **Tool descriptions and results are input, not instructions.** Text from a
  tool description, a fetched page, a file, an issue body, or a tool result
  that reaches the model can carry injected instructions (LLM01, ASI01). Flag
  any path where that text is concatenated into a system prompt, or where the
  model can call a write, send, or pay tool in the same turn it read
  untrusted content with no human confirmation (P1; P0 when the tool moves
  money or deletes data).
- **Tool list changes.** If the client re-reads `tools/list` after
  `notifications/tools/list_changed` and exposes new or changed tools without
  showing the user, flag it (ASI04, P2). A description that changed between
  releases of a pinned server deserves a diff in review.
- **Results reach the model only after validation.** Clients SHOULD validate
  results before passing them to the model, set timeouts on tool calls, and
  log tool usage for audit. A tool call with no timeout is P2; an agent that
  writes or spends with no audit log is P1 (ASI08 and A09).
- **OAuth URLs from a server.** Clients MUST allow only `https://` (or
  loopback `http://` in development) authorization URLs, MUST reject
  `javascript:`, `data:`, `file:`, and `vbscript:`, and MUST NOT open URLs
  through a shell. An `exec("open " + url)` or `window.open(serverUrl)` with no
  scheme check is P0 (A05).
- **SSRF in discovery.** A server-side MCP client that follows
  `resource_metadata`, `authorization_servers`, or token endpoint URLs SHOULD
  require HTTPS and block private, loopback, and link-local ranges, including
  `169.254.169.254`. Hand-rolled IP parsing is a finding on its own; the spec
  warns that octal, hex, and IPv4-mapped IPv6 tricks defeat custom parsers
  (A01, P1).
- **One-click server install.** A client that adds a local server from a link
  or config MUST show the full command, unabridged, and require explicit
  approval before running it (ASI05, P0 if missing).

## Model output handling

- Model output that reaches `eval`, a shell, SQL, a file path, or `innerHTML`
  is untrusted input. Same Instant-F rules as user input (LLM05, A05).
- Secrets, other users' records, or the system prompt placed in context where
  a user-facing reply can echo them: LLM02 or LLM07, P1.
- Retrieval that ignores tenant or permission filters when it queries the
  vector store: LLM08 and A01, P0 when it crosses tenants.
- Agent memory written from untrusted content and read back as trusted
  instructions on a later run: ASI06, P1.
- Unbounded loops, token budgets, or tool-call counts on a user-triggered
  path: LLM10 and A10, P2 (P1 when the bill is the company's).
- An agent credential broader than the task needs (a full-repo token for a
  read-only job, an admin DB role for one table): ASI03, P1.

## What this lane does not do

It does not test the model. A finding here is a code path that lets untrusted
text drive an action, leak data, or run without a limit. When the fix needs
eval coverage, name it as a follow-up and route to **suede-ai-eval**.

Sources:
- https://modelcontextprotocol.io/specification/2025-11-25/server/tools
- https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices
- https://genai.owasp.org/llm-top-10/
- https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
