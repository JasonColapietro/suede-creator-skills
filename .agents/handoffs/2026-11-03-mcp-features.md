# Handoff: MCP server features and end-to-end pass (started 2026-11-03)

Owner request: "go through our mcp and add features and make sure its good e2e",
approved scope = items 1-5 below. Keep this file current; it is the restart point
if the session ends.

- Worktree: `/home/claude/suede-creator-skills.worktrees/mcp-e2e`
- Branch: `mcp-features-2026-11`, cut from `origin/main` at b102cf0bc9
- Server: `mcp/suede-skills-mcp.mjs` (dependency-free stdio JSON-RPC, Node >= 22)
- Tests: `tests/test_mcp_protocol.mjs` (`npm run test:mcp`); full gate `npm test`, CI `npm run ci`
- npm package is built by `scripts/build-mcp-package.mjs` into `dist-npm/`; publishing to npm is
  manual (no workflow) and needs the owner. Version comes from `VERSION`.
- Commit as Jason Colapietro <55137770+JasonColapietro@users.noreply.github.com>, no attribution
  trailers of any kind. PRs via `gh api` REST (GraphQL blocked). Merge own PR once CI green
  (squash, explicit commit_title/commit_message).

## Findings from the baseline client run (origin/main)

1. Search display bug: results were ranked right-ish but the text output regrouped them by
   specialty, so a weak match printed first. Ranker also scored the "NOT FOR:" clause as matches
   and weighted common words like "ai" as heavily as rare ones. Fixed: NOT FOR stripped, IDF
   weighting, synonym map, ranked text. Eval (scratchpad route-eval.mjs, 23 cases): old top1
   16/23 top3 21/23, new top1 20/23 top3 23/23.
4. `resources/read suede://specialties` double-wrapped `contents` (malformed response).
2. Tool schemas say specialty "earn" but the enum is demand/revenue; "earn" errors.
3. Grading tools (`suede_visibility_grade`, `suede_copy_seo_audit`, `suede_code_grade`) return
   static scaffolds and never inspect the URL or pasted copy.

## Plan and status

- [x] 1. Live page grading: opt-in URL fetch, real A-F checks (title, description, canonical,
      robots/noindex, H1, JSON-LD, OG, sitemap, llms.txt, AI crawler rules in robots.txt)
- [x] 2. Deterministic copy checks on pasted text (vague claims, hedges, CTA, passive voice,
      reading level) using the pack's own copy rules
- [x] 3. Workflow planner tool (goal -> ordered skill sequence)
- [x] 4. `suede://skill/{name}` resource template for every SKILL.md + `completion/complete`
- [x] 5. Dockerfile for Glama checks + newest MCP protocol version
- [x] Fix bugs 1, 2 and 4 with regression tests that fail without the fix
- [ ] Update mcp/README.md, counts (`npm run fix:counts` if prose counts change), run `npm test`
- [ ] PR, CI green, merge, verify main
- Deferred: hosted Streamable HTTP mode (item 6), npm publish (owner action)

## Log

- 2026-11-03: worktree created, baseline run done, handoff written.
- Added mcp/page-audit.mjs (live audit, smoke-tested on a local server: good page A, client-rendered
  noindex page F, private-host and file:// guards refuse) and mcp/copy-check.mjs (house bans,
  hedges, buzzwords, CTA, passive, reading grade; bad sample F 6/100, clean sample A 100/100).
- Server: imports added, PROTOCOL_VERSION 2025-11-25, specialty descriptions fixed, new ranker.
  NEXT: register the 3 new tools + async dispatch, resource template + completions, fix
  specialties wrap, catalog.json mcp lists, build-mcp-package copies mcp/*.mjs, Dockerfile, tests.
- Server wired: 12 tools (new: suede_live_page_audit, suede_copy_check, plan_suede_workflow),
  resources/templates/list + suede://skill/{name}, completion/complete, async dispatch that keeps
  pipelined messages in order, SUEDE_MCP_OFFLINE / SUEDE_MCP_ALLOW_PRIVATE_HOSTS env switches.
- Dockerfile + .dockerignore at repo root (node:22-alpine, mcp/ + skills/, USER node).
- tests/test_mcp_protocol.mjs: 25 tests pass; same file vs origin/main server: 12 fail (proves
  the new tests catch the bugs). Live run through the proxy (NODE_USE_ENV_PROXY=1): skills.suedeai.ai
  A 100, agents.suedeai.ai A 97, example.com F 43.
- Docs counts 9 -> 12 tools: README.md, COPY.md, book/STYLE.md, docs/{llms.txt,plugins.html,
  guide.html,dav/index.html,index.html,copy.html}, mcp/README.md. Left docs/index.html "9.1 ...
  same 9 tools" changelog line as history. Validator strict passes.
  NEXT: npm test; README/COPY are root files pinned by directory/intake/2026-10-31-interface-quality.json,
  so refresh the receipt (first_party.py, see summary of the last session) + npm run build:directory;
  book check may need npm run build:book.
- Committed 05ec580761 (code + docs). Receipt refreshed from a clean clone of that commit
  (clone in scratchpad/rcpt-src with origin set to the canonical GitHub URL; citations at
  scratchpad/intake/citations.json; assessment date 2026-11-03). Scores unchanged.
  `npm run build:directory` rewrote ~4.8k generated files (normal). Full `npm test` running.
  NEXT: if green, commit receipt + generated files, push, open PR via gh api, wait CI, merge squash
  with explicit message, verify main and Vercel deploy of skills.suedeai.ai pages (plugins.html).
