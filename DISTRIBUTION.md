# Distribution ledger

Where the Suede skill pack is listed, where it is not, what is stale, and what it takes to close each gap. Keep this file current when a listing changes. Numbers below are as of the last audit date and are not maintained by the validator.

Last audit: 2026-10-08. Every listing below was loaded and its entry seen on that date. Nothing was submitted, claimed, or posted during the audit. The previous audit was 2026-09-05.

Ground truth on the audit date: 76 skills, repository `JasonColapietro/suede-creator-skills`, homepage `https://skills.suedeai.ai`, MCP package `suede-skills-mcp` on npm and `io.github.JasonColapietro/suede-skills-mcp` in the official MCP Registry. The GitHub description no longer states a count, so it cannot go stale; 20 GitHub topics set.

**Linked listings live in [`docs/listings.json`](docs/listings.json).** That file is the single source for every third-party page the site links to: `scripts/build-listings.mjs` renders it into [`docs/listings.html`](https://skills.suedeai.ai/listings.html), the README "Find it on" block, the homepage "Listed on" strip, and the homepage `SoftwareSourceCode` `sameAs`, and `npm run validate` fails when any of them drifts. Add a URL there only after loading it and seeing the entry, then run `npm run build:listings`. This ledger tracks status, staleness, and gaps; it does not replace the JSON.

## Listed

Every row here is also in `docs/listings.json` unless marked otherwise. Staleness is what the third-party page said on 2026-10-08 against the true count of 76.

| Directory | Status | Evidence | Staleness | Fix |
| --- | --- | --- | --- | --- |
| skills.sh (Vercel `npx skills`) | Listed, automatic | https://www.skills.sh/jasoncolapietro/suede-creator-skills (pack page, grouped by lane via `skills.sh.json`) and the author page https://www.skills.sh/jasoncolapietro | Says 81 skills against 76 | No claim mechanism. The count refreshes on re-crawl or install traffic. |
| SkillsMP (skillsmp.com) | Listed, automatic (was Not listed on 2026-09-05) | https://skillsmp.com/creators/jasoncolapietro/suede-creator-skills | Says 79 against 76 | Crawl-based; wait for the next crawl. |
| SkillsLLM | Listed | https://skillsllm.com/skill/suede-creator-skills (verified pack listing) | None noted | Nothing to do. |
| HOL Plugin Registry (hol.org) | Listed | https://hol.org/registry/plugins/suede-ai%2Fsuede-skills with a published trust score | Says 79 against 76 | Re-scan through the HOL scanner this repo already runs in CI. |
| Skills Directory (skillsdirectory.com) | Listed | Author page https://www.skillsdirectory.com/authors/jasoncolapietro, a graded page per skill (for example `jasoncolapietro-suede-seo-audit`), and the Grade A badge in the README | Says 80 against 76 | Crawl-based. |
| ClaudSkills (claudskills.com) | Listed | Author page https://claudskills.com/author/jasoncolapietro/ and skill page `suede-seo-audit` | Says 77 against 76, and links the old `jasoncolapietro.github.io` homepage instead of `skills.suedeai.ai` | Ask for the homepage URL to be updated; the count follows the crawl. |
| SkillHub (skillhub.club) | Listed (was in the "smaller, crawl GitHub" row on 2026-09-05) | Skill pages for `suede-seo-audit` and `suede-code` | None noted | Nothing to do. |
| Official MCP Registry | Listed (was Not listed on 2026-09-05) | `io.github.JasonColapietro/suede-skills-mcp`, latest version at https://registry.modelcontextprotocol.io/v0.1/servers/io.github.JasonColapietro%2Fsuede-skills-mcp/versions/latest | `server.json` description said "71 Suede skills" and `websiteUrl` pointed at the old github.io homepage; both fixed in this change and live on the next `mcp-publisher` run | Republish `server.json` with the next release. PulseMCP ingests from here. |
| npm | Listed (was Not listed on 2026-09-05) | https://www.npmjs.com/package/suede-skills-mcp, also indexed by npmx.dev, Libraries.io, and Socket (supply-chain report) | None noted | Nothing to do. |
| MCP Market (mcpmarket.com) | Listed | https://mcpmarket.com/server/suede-creator-skills | Says 23 skills, and the page carries a "Claim this listing" link | Owner action: claim the listing, then correct the description. |
| Awesome Claude Skills (awesomeclaude.ai, backed by webfuse-com/awesome-claude) | Listed under "Development and code tools" | https://awesomeclaude.ai/awesome-claude-skills | Still the first-release "23-skill pack" line | PR to webfuse-com/awesome-claude replacing the description. |
| BehiSecc/awesome-claude-skills | Listed | https://github.com/BehiSecc/awesome-claude-skills | Same "23-skill pack" line | PR opened 2026-09-06: BehiSecc/awesome-claude-skills#677. Status not rechecked from this session. |
| GetBindu/awesome-claude-code-and-skills | Listed under "Comprehensive skill collections" | https://github.com/GetBindu/awesome-claude-code-and-skills | Says 67 against 76 | PR opened 2026-09-06: GetBindu/awesome-claude-code-and-skills#194. Status not rechecked from this session. |
| gmh5225/awesome-skills | Listed (new) | https://github.com/gmh5225/awesome-skills | Says 67 against 76 | PR to the repo with the replacement line below. |
| VoltAgent/awesome-agent-skills | Listed (new), community skills | https://github.com/VoltAgent/awesome-agent-skills | None noted | Nothing to do. |
| karanb192/awesome-claude-skills | Listed (new), skill collections | https://github.com/karanb192/awesome-claude-skills | None noted | Nothing to do. |
| hashgraph-online/awesome-ai-plugins | Listed (new), development and workflow | https://github.com/hashgraph-online/awesome-ai-plugins | None noted | Nothing to do. |
| JackyST0/awesome-agent-skills | Listed (new), skills collections | https://github.com/JackyST0/awesome-agent-skills | None noted | Nothing to do. |
| Chat2AnyLLM/awesome-claude-skills | Listed (new), source catalog | https://github.com/Chat2AnyLLM/awesome-claude-skills | None noted | Nothing to do. |
| Trendshift | Listed (new) | https://trendshift.io/repositories/82031 | None noted | Nothing to do. |
| ecosyste.ms awesome index | Listed (new) | https://awesome.ecosyste.ms/projects/github.com%2FJasonColapietro%2Fsuede-creator-skills | None noted | Nothing to do. |
| ComposioHQ/awesome-claude-skills | Pending, not in `docs/listings.json` | PR #1803 (`frontend-design-review`, a neutralized copy of suede-design), README-only entry linking the vendorable copy | The pack itself is not listed there; checked again 2026-10-08 | A pack entry is a separate submission (see Not listed). |
| SaaSHub | Listed, wrong product; not in `docs/listings.json` | https://www.saashub.com/suede is the paid Suede creator-rights product, not this pack | Not a pack listing | Nothing to do here. |

## Not listed

Checked 2026-10-08 unless the row says otherwise. Reach is inferred from stars or self-reported traffic. "Owner action" means an account, form, or login only the owner can operate.

| Directory | Reach | How to get listed | Owner action |
| --- | --- | --- | --- |
| hesreallyhim/awesome-claude-code | 74.5k stars | PR per CONTRIBUTING.md | PR to a third-party repo |
| ComposioHQ/awesome-claude-skills (pack entry) | 53.6k stars | PR with their template | PR to a third-party repo |
| punkpeye/awesome-mcp-servers | 94.3k stars | PR against README; the npm package now gives it the runnable install line it asks for (`npx suede-skills-mcp`) | PR to a third-party repo |
| travisvn/awesome-claude-skills | Large awesome list | PR against README | PR to a third-party repo |
| RankSpotAI/awesome-seo-agent-skills | SEO-specific list, high fit for `suede-seo-audit` and `suede-ai-seo` | PR against README | PR to a third-party repo |
| Anthropic official marketplace (`anthropics/claude-plugins-official`) | Default Claude Code marketplace | Owner submitted the plugin-directory form on or before 2026-09-05 (owner statement); not in the repo as of 2026-10-08 | Watch for the entry; nothing else to file |
| claudemarketplaces.com | Claims 380k monthly visitors | Crawl-based; no form found | Lists only the sibling `agentic-commerce-catalog` MCP, not this pack. Unknown route for the pack. |
| Glama (glama.ai/mcp/servers) | 82k servers indexed | Auto-crawl plus owner claim; "Add Server" button | Add or claim after crawl; the npm package and registry entry should help the crawl |
| Smithery (smithery.ai) | One-click installs in several clients | https://smithery.ai/servers/new behind GitHub login, or `smithery mcp publish` | GitHub login |
| mcp.so | Large MCP index | Submit form on the site | Form |
| claudemarketplace.net | Claims 150k monthly visitors | Not stated | Unknown |
| aitmpl.com (davila7/claude-code-templates) | Popular catalog | PR to the repo, or the "Promote your component" Google Form | Form or PR |
| claudepluginhub.com | Plugin index | Crawl or submit; route not confirmed | Unknown |
| ClawHub (clawhub.ai) | OpenClaw users | `clawhub skill publish <path>` from the CLI; GitHub account must be at least one week old | CLI login |
| codex-marketplace.com | Third-party Codex list | `/submit` | Form |
| claudedirectory.org (tmcpa/claudedirectory), claudeskills.info, agenticskills.io | Smaller | Not rechecked 2026-10-08. claudeskills.info crawls GitHub; agenticskills.io has a "Submit a Skill" form; claudedirectory has a contributing guide | Form for agenticskills.io; otherwise wait |
| Official Codex plugin directory | Codex users | Not open for public submission yet per developers.openai.com/codex/plugins (as of 2026-09-05) | Not possible yet |
| hashgraph-online/awesome-codex-plugins | Backs hol.org/plugins | Fork, run the HOL plugin scanner, add one README line, PR with the score. The pack is already in the HOL Plugin Registry and in hashgraph-online/awesome-ai-plugins. | PR to a third-party repo |
| PulseMCP | Large index | Submissions paused; it ingests the official MCP Registry automatically, where the server is now listed | None; confirm it appears after ingest |
| mcpservers.org, Cline MCP marketplace (cline/mcp-marketplace), Cursor Directory plugins | Medium | PR (Cline), `cursor.directory/plugins/new` | PR or form |
| Hacker News | Largest developer audience | Show HN at https://news.ycombinator.com/submit | Account |
| Product Hunt | Large launch audience | https://www.producthunt.com/posts/new | Account |
| Reddit r/ClaudeAI, r/ClaudeCode | Highest intent | Post | Account |
| dev.to, Hashnode, Medium | Writeup readership | Post | Account |
| There's An AI For That, Futurepedia, Toolify | Broad, low fit | Submission forms; two sites blocked automated checks, so listing status is unconfirmed | Form |

Not verified either way because the site blocked automated reads (as of 2026-09-05): LobeHub (market.lobehub.com), mcp-get.com, There's An AI For That, Toolify, cursor.directory (rate limited).

## Hermes Agent (Nous Research)

Checked 2026-09-16 against `NousResearch/hermes-agent` at `main` (`tools/skills_hub_github.py`,
`website/docs/user-guide/features/skills.md`). The Hermes CLI is not installed on this machine, so
every line below is read from the Hermes source and docs, not from a completed install.

| Route | Status | What it takes |
| --- | --- | --- |
| GitHub tap (`hermes skills tap add JasonColapietro/suede-creator-skills`) | Works with no Hermes-side change | The tap contract is `skills/<name>/SKILL.md` under the default path `skills/`, which is the layout this pack already had. `tests/test_hermes_tap.mjs` pins the parts Hermes fails quietly on: `.`/`_` directory names, unparsable frontmatter, a frontmatter name that disagrees with its directory, symlinks, dotfiles. |
| Single-skill install (`hermes skills install JasonColapietro/suede-creator-skills/skills/<name>`) | Works, no tap needed | Same contract. `_collect_tree_files` pulls the whole skill directory from the pinned tree, so `references/`, `agents/`, and `evals/` come with it. |
| Category pills in the Skills Hub | Shipped 2026-09-16 | `_get_skillsh_groupings` fetches `skills.sh.json` from the repo root of any tap and flattens `groupings` to one title per skill. Generated from `mcp/catalog.json` by `scripts/build-skills-sh-json.mjs`; the same file gives the skills.sh repo page real sections. |
| skills.sh source (`--source skills-sh`) | Already reachable | Hermes searches the skills.sh directory, where the pack is listed. Nothing to file. |
| Well-known endpoint (`well-known:https://skills.suedeai.ai/...`) | Not served | `https://skills.suedeai.ai/.well-known/skills/index.json` returned 404 on 2026-09-16. Serving it means mirroring every `SKILL.md` in the pack into `docs/` (about 1.1 MB) so the static site can answer `/.well-known/skills/<name>/SKILL.md`. Three Hermes routes already work without it; open question, not a gap. |
| Default taps | Not listed | `GitHubSource.DEFAULT_TAPS` ships openai, anthropics, huggingface, NVIDIA, gstack and the science repos. Adding one is a PR to Hermes core. Owner action. |
| Trust level | `community` | Every tap starts at `community`: security-scanned, with the third-party panel on first install. `trusted` requires the repo in `TRUSTED_REPOS` in `tools/skills_guard.py`, also a Hermes core PR. Owner action. |
| Community directories | Not listed | `0xNyk/awesome-hermes-agent` and `ZeroPointRepo/awesome-hermes-skills` both index Hermes skills and plugins. PRs to third-party repos. Owner action. |

Not done and deliberately so: a `.hermes-plugin/` Python plugin. That format exists for plugins that
register tools or lifecycle hooks, and its bundled skills are read-only, excluded from the system
prompt's skill index, and loadable only by explicit `skill_view`. A tap install lands in
`~/.hermes/skills/` and becomes a `/skill-name` command, which is what this pack wants.

## npm

Published: https://www.npmjs.com/package/suede-skills-mcp, built from `scripts/build-mcp-package.mjs` into `dist-npm/` and registered in the official MCP Registry under `io.github.JasonColapietro/suede-skills-mcp` (the `mcpName` field in the package ties the two). npmx.dev, Libraries.io, and Socket index the package automatically. On 2026-09-05 these names returned 404 from the npm registry: `suede-skills-mcp`, `suede-creator-skills`, `suede-mcp`, `@suede/skills-mcp`; the first is now taken by this package.

The `@suedeai` scope is in use by the sibling media product (`@suedeai/mcp-server`, `@suedeai/plugin-suede`), which is a different codebase; do not conflate the two in any listing.

## Own surfaces

All six checked URLs were reachable on the audit date: `/`, `/llms.txt`, `/sitemap.xml`, `/robots.txt`, `/plugins.html`, `/skills/suede-graph-flo-xr.html`. No "suede-ship" or "Suede Ship Gate" naming remains. `robots.txt` and `sitemap.xml` agree. The homepage proof tape said "71 skills, open source" against 74; that line is fixed in the same change that added this file, and the validator now guards it. Dated changelog and blog copy that says 71 or 73 is frozen on purpose and is not a defect.

For the pack's own name, the GitHub repository outranks the site in general web search. A `site:skills.suedeai.ai` count could not be measured with the tools available; use Search Console.

## Draft replacement line for the awesome lists

Count-free, so it cannot go stale the next time a skill lands:

`[suede-creator-skills](https://github.com/JasonColapietro/suede-creator-skills) - Open-source Agent Skills for Claude Code and Codex: AI SEO, code review with an A-F ship grade, CI gates, AI evals, design systems, conversion copy, iOS and Android app shipping, and creator rights. MIT.`

## Next actions

Agent-side, no external mutation: keep `docs/listings.json` current when a listing appears or disappears, run `npm run build:listings`, and keep this file current when a status changes.

Owner-side, in order of reach per minute of effort: claim the MCP Market listing and fix its 23-skill description; a Show HN; the stale-description PRs (webfuse-com/awesome-claude, gmh5225/awesome-skills, plus the open GetBindu and BehiSecc PRs); new entries on hesreallyhim/awesome-claude-code, punkpeye/awesome-mcp-servers (the npm install line now exists), travisvn/awesome-claude-skills, and RankSpotAI/awesome-seo-agent-skills; ask ClaudSkills to point at `skills.suedeai.ai`; then Glama and Smithery for the MCP server.

Owner-side on Hermes, once the tap has been installed at least once and the pills render: PRs to `0xNyk/awesome-hermes-agent` and `ZeroPointRepo/awesome-hermes-skills`, then a Hermes core PR proposing the repo for `DEFAULT_TAPS`. The install routes above need none of them.
