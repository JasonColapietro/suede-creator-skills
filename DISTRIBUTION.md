# Distribution ledger

Where the Suede skill pack is listed, where it is not, what is stale, and what it takes to close each gap. Keep this file current when a listing changes. Numbers below are as of the last audit date and are not maintained by the validator.

Last audit: 2026-09-05. Read-only research by four web-reader agents plus local checks. Nothing was submitted, claimed, or posted during the audit.

Ground truth on the audit date: 74 skills, repository `JasonColapietro/suede-creator-skills`, homepage `https://skills.suedeai.ai`, GitHub description already states 74, 20 GitHub topics set (including `claude-code-plugin`, `claude-skills`, `agent-skills`, `codex`, `mcp-server`).

## Listed

| Directory | Status | Evidence | Staleness | Fix |
| --- | --- | --- | --- | --- |
| skills.sh (Vercel `npx skills`) | Listed, automatic | https://www.skills.sh/jasoncolapietro/suede-creator-skills shows 992 installs; top installs are suede-agent-teams, suede-ai-eval, suede-code, suede-code-grader, suede-code-review | Shows "79 skills" against 74 | No claim mechanism exists. The count refreshes on re-crawl or install traffic. Nothing to file. |
| GetBindu/awesome-claude-code-and-skills | Listed under "Comprehensive Skill Collections" | README entry reads "67 MIT-licensed skills for Claude Code and Codex" | 67 vs 74 | PR to that repo updating the line |
| awesomeclaude.ai/awesome-claude-skills (backed by webfuse-com/awesome-claude) | Listed under "Development & Code Tools" | Entry reads "23-skill pack for agent orchestration with WIP collision detection and rollback trees" | Description is from the first release and describes one skill, not the pack | PR to webfuse-com/awesome-claude replacing the description |
| BehiSecc/awesome-claude-skills | Listed | Same "23-skill pack" line as above | Same | PR to that repo, same replacement |
| ComposioHQ/awesome-claude-skills | Pending | PR #1803 (`frontend-design-review`, a neutralized copy of suede-design) is open with no review as of the audit date | The pack itself is not listed there | Nudge or wait; a pack entry is a separate submission |
| Anthropic official marketplace (`anthropics/claude-plugins-official`) | Submitted, awaiting review | Owner submitted the plugin-directory form on or before 2026-09-05 (owner statement; no public acknowledgement URL yet) | Not listed until Anthropic accepts it | Watch `anthropics/claude-plugins-official` for the entry; nothing else to file |
| SaaSHub | Listed, wrong product | https://www.saashub.com/suede is the paid Suede creator-rights product, not this pack | Not a pack listing | Nothing to do here |

## Not listed

Reach is inferred from stars or self-reported traffic. "Owner action" means an account, form, or login only the owner can operate.

| Directory | Reach | How to get listed | Owner action |
| --- | --- | --- | --- |
| hesreallyhim/awesome-claude-code | 74.5k stars | PR per CONTRIBUTING.md | PR to a third-party repo |
| ComposioHQ/awesome-claude-skills (pack entry) | 53.6k stars | PR with their template | PR to a third-party repo |
| punkpeye/awesome-mcp-servers | 94.3k stars | PR against README | PR to a third-party repo; needs a runnable install line |
| SkillsMP (skillsmp.com) | Tens of thousands of skills indexed | Automatic GitHub crawl; no form found | None known; wait for crawl |
| claudemarketplaces.com | Claims 380k monthly visitors | Crawl-based; no form found | Unknown |
| claudemarketplace.net | Claims 150k monthly visitors | Not stated | Unknown |
| aitmpl.com (davila7/claude-code-templates) | Popular catalog | PR to the repo, or the "Promote your component" Google Form | Form or PR |
| claudepluginhub.com, claudedirectory.org (tmcpa/claudedirectory), claudeskills.info, skillhub.club, agenticskills.io | Smaller | skillhub.club and claudeskills.info crawl GitHub; agenticskills.io has a "Submit a Skill" form; claudedirectory has a contributing guide | Form for agenticskills.io; otherwise wait |
| ClawHub (clawhub.ai) | OpenClaw users | `clawhub skill publish <path>` from the CLI; GitHub account must be at least one week old | CLI login |
| Official Codex plugin directory | Codex users | Not open for public submission yet per developers.openai.com/codex/plugins | Not possible yet |
| codex-marketplace.com | Third-party Codex list | `/submit` | Form |
| hashgraph-online/awesome-codex-plugins | Backs hol.org/plugins | Fork, run the HOL plugin scanner, add one README line, PR with the score. This repo already runs the HOL scanner in CI. | PR to a third-party repo |
| Official MCP Registry (registry.modelcontextprotocol.io) | Feeds PulseMCP and others automatically | `mcp-publisher` CLI, a `server.json`, and a namespace verified by GitHub OAuth (`io.github.jasoncolapietro/*`) or by DNS/HTTP for `skills.suedeai.ai`. The registry expects an installable package; the MCP is clone-and-run only today. | Publish an npm package first, then GitHub OAuth login |
| Glama (glama.ai/mcp/servers) | 82k servers indexed | Auto-crawl plus owner claim; "Add Server" button | Claim after crawl |
| Smithery (smithery.ai) | One-click installs in several clients | https://smithery.ai/servers/new behind GitHub login, or `smithery mcp publish` | GitHub login |
| PulseMCP | Large index | Submissions paused; it ingests the official MCP Registry automatically | None; publish to the registry |
| mcpservers.org, Cline MCP marketplace (cline/mcp-marketplace), Cursor Directory plugins | Medium | PR (Cline), `cursor.directory/plugins/new` | PR or form |
| Hacker News | Largest developer audience | Show HN at https://news.ycombinator.com/submit | Account |
| Product Hunt | Large launch audience | https://www.producthunt.com/posts/new | Account |
| Reddit r/ClaudeAI, r/ClaudeCode | Highest intent | Post | Account |
| dev.to, Hashnode, Medium | Writeup readership | Post | Account |
| There's An AI For That, Futurepedia, Toolify | Broad, low fit | Submission forms; two sites blocked automated checks, so listing status is unconfirmed | Form |

Not verified either way because the site blocked automated reads: mcp.so, LobeHub (market.lobehub.com), mcp-get.com, There's An AI For That, Toolify, cursor.directory (rate limited).

## npm

No package exists for the skills MCP. These names returned 404 from the npm registry API on the audit date: `suede-skills-mcp`, `suede-creator-skills`, `suede-mcp`, `@suede/skills-mcp`. The `@suedeai` scope is in use by the sibling media product (`@suedeai/mcp-server`, `@suedeai/plugin-suede`), which is a different codebase; do not conflate the two in any listing.

The MCP Registry, Glama, and Smithery index GitHub repositories directly, so npm is not a prerequisite for them. The official MCP Registry is the one place where a packaged distribution matters, and PulseMCP now ingests only from that registry.

## Own surfaces

All six checked URLs were reachable on the audit date: `/`, `/llms.txt`, `/sitemap.xml`, `/robots.txt`, `/plugins.html`, `/skills/suede-graph-flo-xr.html`. No "suede-ship" or "Suede Ship Gate" naming remains. `robots.txt` and `sitemap.xml` agree. The homepage proof tape said "71 skills, open source" against 74; that line is fixed in the same change that added this file, and the validator now guards it. Dated changelog and blog copy that says 71 or 73 is frozen on purpose and is not a defect.

For the pack's own name, the GitHub repository outranks the site in general web search. A `site:skills.suedeai.ai` count could not be measured with the tools available; use Search Console.

## Draft replacement line for the awesome lists

`[suede-creator-skills](https://github.com/JasonColapietro/suede-creator-skills) - 74 open-source Agent Skills for Claude Code and Codex: AI SEO, code review with an A-F ship grade, CI gates, AI evals, design systems, conversion copy, iOS and Android app shipping, and creator rights. MIT.`

## Next actions

Agent-side, no external mutation: keep the count stamps on the site current; keep this file current when a listing changes.

Owner-side, in order of reach per minute of effort: a Show HN, the three awesome-list PRs (two stale descriptions, one new entry on hesreallyhim), then an npm publish of the MCP followed by `mcp-publisher` for the registry, which unlocks PulseMCP without a second submission.
