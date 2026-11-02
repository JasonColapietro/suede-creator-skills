# Directory parity ledger

Written November 2, 2026, against the public pages of each site on that date.
`Not seen` means the feature did not appear on the pages read; `Not checked`
means those pages were not read for that feature. Recheck before quoting.
Futurepedia's classification and feature map has its own ledger in
[FUTUREPEDIA-PARITY.md](FUTUREPEDIA-PARITY.md); this one covers the agent-skill
directories the rebuild was measured against: skills.sh (the install
leaderboard behind `npx skills add`), skillsdirectory.com (its security page in
particular), the awesome lists the dataset is curated from, and the agent and
MCP directories that list non-skill kinds.

Three rules shaped every row. The site is static, so nothing needs an account
or a server. Every number is published with its source and date, and install
counts are skills.sh's, never the directory's own. No listing carries a
security verdict the directory did not produce, which today means none.

## Feature table

| Feature | skills.sh | skillsdirectory.com | suedeai.directory | Where |
| --- | --- | --- | --- | --- |
| Leaderboard by all-time installs | Yes | Not seen | Yes, from the skills.sh snapshot in `installs.json`, attributed on every surface | Hub first tab, `/top/` |
| Trending and hot (weekly installs) | Yes | Not seen | Rising pane: largest weekly gain where skills.sh publishes a series | Hub, `/top/` |
| Install sparkline per skill | Yes | Not seen | Eight-week sparkline on board rows where a series exists | Hub, `/top/` |
| Highest-scoring list | Not seen | Not seen | Top 100 by Suede Skill Check score, excluding Suede's own skills | `/top/` second tab |
| New and recently updated | Not seen | Not checked | Tabs on the hub and `/new/`, from `listed-since.json` and repository commit dates | Hub, `/new/` |
| Search with sort and facets | Search | Not checked | Text search over every listed skill; category, grade, cost lane, capability and sort selects (score, name, updated, installs) | Hub |
| Skill page with install command | Yes | Not checked | Full page for every editorial skill, repository row for the rest; `npx skills add`, plugin and manual routes; copy button | `/<owner>/<repo>/<skill>/` |
| Owner or publisher pages | Owner pages | Not checked | Repository pages, plus a publishers hub with skill count, best score and install total | `/publishers/` |
| At-a-glance facts panel | Partial | Not checked | Publisher, license, cost, installs, scripts, credentials, outside hosts, MCP, security scan, listed since | Skill pages |
| Quality score and grade | Not seen | Not seen | 0 to 99 score from published fields, recomputable from `skills.json`; linked badges | Skill pages, `/methodology/` |
| Third-party security audits | Audit panels from outside scanners | Security page links scanners | No verdicts. The glance panel says `Not scanned by the directory` and links the skills.sh audit page where one exists | Skill pages, `/trust/` |
| Security landing page | Not seen | Yes | `/trust/`: what the directory checks and does not, a matrix of full-page skills by what their files touch, three documented registry attacks with sources, scanners a reader can run, a checklist, FAQ | `/trust/` |
| Categories and topics | Not seen | Not checked | 16 category directories, 12 topic groups, topic pages, cost lanes, capability flags | `/topics/`, `/pricing/`, `/features/` |
| Task shortlists | Not seen | Not seen | Ranked shortlists per job, Suede's skills never ranked | `/for/` |
| Compare tool | Not seen | Not seen | Up to three skills side by side, built in the browser from the search index and each skill's report | `/compare/` |
| Recommended stacks | Not seen | Not seen | Editorial articles per task, each naming the Suede skill that covers it above an article that recommends third-party skills only | `/stacks/` |
| Kinds beyond skills | Skills only | Skills only | Claude Code plugins, Grok bots, MCP servers and rules files, listed with docs and install commands, not graded | `/plugins/`, `/grok/`, `/mcp-servers/`, `/rules/` |
| Agent directory | Not seen | Not seen | Agents hub with its own pages | `/agents/` |
| Featured projects | Not seen | Not seen | Editorial features, newest first, with badge snippets | `/featured/` |
| Save list | Not seen | Not seen | Browser-local list, no account | `/saved/` |
| Badges for publishers | Not seen | Not seen | Score and grade shields per listed skill, repository listing badge | `/badges/` |
| Public data files | None documented | None documented | Search index, installs, kinds, per-skill reports, badges and feeds, documented on one page | `/api/` |
| RSS feed | Not seen | Not seen | New listings feed | `/feed.xml` |
| Sitemaps and llms.txt | Sitemaps | Not checked | Sitemap of every page and `llms.txt` with every page type | `/sitemap.xml`, `/llms.txt` |
| Listing requests | Publish to a repo | Not checked | GitHub issue form; accepted additions land in `inclusions.json` | Footer, `/methodology/` |

## Not built, on purpose

- Accounts, votes, reviews and comments. The site is static and keeps no
  reader data; the save list stays in the browser.
- A newsletter. There is no mailing infrastructure in this repository, and the
  RSS feed covers the follow case.
- The directory's own install telemetry. The `npx skills add` command reports
  to skills.sh, so their count is the one that exists. The snapshot names the
  source and date wherever a count appears.
- Security verdicts. The directory has no scanner pipeline, so no listing is
  called safe, scanned or audited. The trust page explains what the structural
  checks cover and links the scanners a reader can run.
- Per-kind scores. Plugins, bots, MCP servers and rules files are listed from
  verified repositories, not graded, because the Suede Skill Check rubric
  reads SKILL.md fields they do not have.

## Data provenance

| Surface | Source | Refresh |
| --- | --- | --- |
| Install counts, weekly series | skills.sh public search and homepage payload, via `node scripts/directory/installs.mjs` | Manual; the fetch date is published with every count |
| Scores, grades, checks | `skills.json`, recomputable with `scripts/directory/badges.mjs` | `scripts/directory/refresh.sh` |
| Kinds | `kinds.json`; every repository checked to exist before publication | Hand-edited |
| Stacks | `editorial/stacks.json` and `editorial/stacks/*.md`; the build refuses a body that names Suede | Hand-edited |
| Incidents on the trust page | Published vendor write-ups, each linked | Hand-edited |
