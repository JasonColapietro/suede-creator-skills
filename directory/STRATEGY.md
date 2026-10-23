# Agent Skills Directory: growth and editorial strategy

Owner: Suede AI growth. Written October 23, 2026. Data snapshot referenced: October 19, 2026.

The directory at [skills.suedeai.ai/directory/](https://skills.suedeai.ai/directory/) is a public good with a business job. It should earn search and AI-answer visibility on agent-skill topics, convert the right readers into leads for Suede AI's AEO/GEO/SEO services ([suedeai.agency](https://suedeai.agency)) and Agent Studio ([suedeai.app](https://suedeai.app)), and build links and citations that raise every Suede AI property.

The rule that protects all of it: **commercial relationships never touch scores, listings or rankings.** The score is recomputable from published fields. That independence is the asset other directories lack, and it is what makes the directory worth linking to.

## 1. What the research found

Research ran on October 23, 2026 with web search. The live directory and suedeai.agency / suedeai.app could not be fetched from this environment (permission prompts timed out), so observations of the live site come from the generated HTML in `docs/directory/`, which is what deploys.

### Competing directories and what they do that we do not

| Property | What it is | Pages and features we lack | How it earns links |
| --- | --- | --- | --- |
| skills.sh (Vercel) | Open directory and `npx skills` CLI. Leaderboard ranked by anonymous install telemetry. ([guide, Sept 28, 2026](https://qaskills.sh/blog/skills-sh-agent-skills-directory-guide)) | Trending and Hot, Topics, Official (skills from technology makers), Packs, Audits (combined third-party security results), Docs and API | The CLI itself: every install command in a README points at skills.sh. Our skill pages already print `npx skills add` commands, which advertises their CLI. |
| skillsdirectory.com | Security-graded directory claiming 103,619 skills from 5,316 repositories as of Aug 31, 2026, A to F grades from static analysis. ([article, Sept 2, 2026](https://www.skillsdirectory.com/blog/are-claude-skills-safe)) | A **Learn hub**: install Claude skills, write SKILL.md, skills vs MCP, directories compared, security methodology, security badges. Authors index. Newsletter. Chrome extension. | Original data posts ("what scanning 103,619 skills taught us"), security badges, a report-a-skill flow |
| claudemarket.ai | Directory with best-of pages ranked by installs, for example [Best SEO Skills for Claude Code (2026)](https://www.claudemarket.ai/skills/best-seo-skills). Free JSON API, weekly newsletter, sponsorships. | Category "best of" landing pages per keyword; public API; blog roundups such as [best places to find Claude Code skills](https://claudemarket.ai/blog/best-places-to-find-claude-code-skills) | Roundup posts that list other directories; API users |
| localskills.sh | Registry with publisher accounts and its own CLI. Publishes [8 directories compared](https://localskills.sh/blog/claude-skills-marketplace-guide) (July 2026). | "Directories compared" page that ranks itself first | Comparison posts |
| Claude Code plugin marketplaces | `claude-plugins-official` is added automatically; `anthropics/claude-plugins-community` hosts screened third-party plugins. ([Claude Code docs](https://code.claude.com/docs/en/discover-plugins)) | n/a: these are distribution channels, not editorial sites | Built into the product |
| Awesome lists | Our eight discovery sources (BehiSecc, ComposioHQ, VoltAgent, heilcheng, hesreallyhim, karanb192, skillmatic-ai, travisvn) | n/a | GitHub stars and READMEs |
| MCP directories (Smithery, Glama, PulseMCP, mcp.so) | Server catalogs, frequently compared in roundups ([Descope](https://descope.com/blog/post/mcp-directories)) | Skills-plus-MCP pairing pages | Roundup inclusion |

### What the directory already does better

- A published, recomputable 0–99 score (graded-v2) with every component listed. Nobody else publishes a reproducible quality rubric.
- "Before you install" panels that list scripts, credentials, outside hosts and MCP usage per skill.
- README badges with rendered-README verification and a ledger.
- Editorial intake reviews pinned to a commit.
- Publisher credit and license on every listing.

### Where the directory is invisible

- Neither 2026 roundup of skill directories (claudemarket.ai, July 4, modified Oct 23; localskills.sh, July 8) mentions Suede AI or the directory.
- A search for "skills.suedeai.ai" returns third-party pages about the Suede AI skills pack (claudskills.com, mcpmarket.com, skillsllm.com, Trendshift), not the directory.
- The directory has no guide or "learn" pages. Competitors rank informational queries ("how to install Claude skills", "skills vs MCP", "are Claude skills safe") with exactly those pages.
- No page on the directory links to suedeai.agency or suedeai.app today. The only Suede AI links are to suedeai.ai and its contact page.
- There is no analytics on the site, so traffic and CTA clicks cannot be measured on-site yet (see section 7).

Not verified: actual rankings, impressions or keyword volumes. No Search Console export or keyword tool was available in this session. Every priority below rests on competitor investment, query evidence from search results, and business value, not on volume numbers.

## 2. Keyword clusters mapped to pages

| Cluster | Example queries | Intent | Page type | Page | Business route |
| --- | --- | --- | --- | --- | --- |
| Best skills by job | best SEO skills for Claude Code; Claude Code SEO skills; AI SEO skill; GEO skill | Commercial investigation | Best-of guide built on scores | **Guide: best SEO, AEO and GEO skills** (drafted) + existing category pages | Agency |
| AI visibility | AI visibility audit; get cited by ChatGPT; AEO for developer tools; llms.txt | Commercial, high value | Publisher guide + free tool | **Guide: skill AI visibility** (drafted) + **Skill AI-visibility check** | Agency |
| Install and setup | how to install Claude skills; Claude Code skills folder; npx skills add; Codex skills install | Informational, high volume class | How-to guide | **Guide: install agent skills** (drafted) | Agent Studio |
| Concepts and comparisons | Claude skills vs MCP; skills vs plugins; what is an agent skill | Informational | Comparison guide | **Guide: skills vs MCP servers vs plugins** (drafted) | Agent Studio |
| Safety | are Claude skills safe; malicious agent skills; review a skill before install | Informational, trust | Guide using our own "before you install" data | Planned: are agent skills safe | Agent Studio |
| Publisher | list my Claude skill; skill directory submit; write SKILL.md; skill description best practices | Navigational / how-to | Publisher guide + submit page | Planned: write a SKILL.md that scores 90+; existing submit page | Agency |
| Directory choice | Claude skills marketplace; best places to find Claude skills; skills.sh alternative | Commercial investigation | Comparison | Planned: skill directories compared | Agency (brand) |
| Data | agent skills statistics; state of agent skills | Link bait | Data report from the snapshot | Planned: state of agent skills, October 2026 | Agency (authority) |
| Business automation | multi-agent workflows; AI agents for business operations; agent skills for teams | Commercial | Best-of + use-case guide | Planned: best skills for building AI agents | Agent Studio |
| Marketing teams | best marketing skills for Claude; content and ads skills | Commercial investigation | Best-of guide | Planned: best marketing skills | Agency |

Existing page types keep their jobs: category pages target "<category> skills for Claude Code and Codex"; repository and skill pages target publisher and skill names; methodology and submit pages serve publishers.

## 3. Editorial calendar

Ordered by business value toward agency leads first, then Agent Studio, then authority. Weeks start Monday. Drafts 1 to 4 are in `directory/editorial/` and listed in `directory/editorial/pages.json`.

| # | Week of | Page | Path | Status | Primary route | Why now |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Oct 26 | Best SEO, AEO and GEO skills for Claude Code | `/directory/guides/best-seo-skills/` | Published Oct 23 | Agency | Competitors already rank best-of SEO pages ranked only by installs; ours ranks by a published score and routes to the agency |
| 2 | Oct 26 | How to get your agent skill found in search and cited by AI | `/directory/guides/skill-ai-visibility/` | Published Oct 23 | Agency | Talks directly to devtool companies, the agency's best-fit buyers, and feeds the badge loop |
| 3 | Nov 2 | Skill AI-visibility check (free tool) | `/directory/check/` | Live (v1, static) | Agency | Lead magnet with a clear handoff to an AI visibility engagement |
| 4 | Nov 2 | How to install agent skills in Claude Code, Codex and Cursor | `/directory/guides/install-agent-skills/` | Published Oct 23 | Agent Studio | Highest-volume question class; links from every skill page's install section |
| 5 | Nov 9 | Agent skills vs MCP servers vs plugins | `/directory/guides/skills-vs-mcp-servers/` | Published Oct 23 | Agent Studio | Heavily covered by competitors; we add real paired examples from featured projects |
| 6 | Nov 16 | State of agent skills: October 2026 data report | `/directory/guides/state-of-agent-skills-2026/` | Planned | Agency | Original data is the strongest link magnet in this niche; we hold a full scored snapshot |
| 7 | Nov 23 | How to write a SKILL.md that scores 90+ | `/directory/guides/write-a-skill-md/` | Planned | Agency | Pulls publishers into the score, badge and listing loop |
| 8 | Nov 30 | Are agent skills safe? Review a skill before you install | `/directory/guides/are-agent-skills-safe/` | Planned | Agent Studio | Security questions are rising; we can answer from our own per-skill install records |
| 9 | Dec 7 | Best skills for building AI agents and multi-agent workflows | `/directory/guides/best-ai-agent-skills/` | Planned | Agent Studio | Largest category (599 skills); direct path to Agent Studio |
| 10 | Dec 14 | Best marketing skills for Claude Code and Codex | `/directory/guides/best-marketing-skills/` | Planned | Agency | Broad marketing audience beyond SEO |
| 11 | Dec 21 | Agent skill directories compared | `/directory/guides/skill-directories-compared/` | Planned | Agency (brand) | Ranks for "Claude skills marketplace" queries and gives roundup authors a page to cite |

Rules for every guide: direct answer in the first paragraph; question headings; an FAQ; a "Quotable facts" list with dated figures from the snapshot; Jason Colapietro byline with credentials; primary sources cited for any product or platform claim; every third-party skill shown with its repository and a link to its listing; refresh after each directory refresh.

Calendar item 6 (the data report) uses only figures computable from `directory/skills.json`. Facts already available from the October 19 snapshot: 3,798 listed skills from 159 repositories in 16 categories; scores from 53 to 95 with a median of 78; grades A 125, B 1,576, C 1,373, D 724; 97.2% under an open license; 13.5% of descriptions state a boundary; 25.2% quote an example phrase; 47.1% bundle references; 17.3% bundle scripts; 14.7% declare `allowed-tools`; 13.9% declare `compatibility`.

## 4. Backlink loop: badges and "claim your listing"

### What exists

Every listed skill and repository has a listing badge (`badge.svg`) linked to its listing. Skills scoring 80–99 also get numeric and letter quality shields. `promotion.json` runs a feature offer: a verified README badge can earn a featured placement. `verify_badges.py` checks the rendered README at a recorded commit. As of this writing the verification ledger is empty.

### The loop

1. **Find.** A publisher lands on their listing (from search, from a notification, or from our outreach).
2. **Claim.** The listing page invites the author to "claim" it: add the badge, run the Skill AI-visibility check, and see the open points. (Campaign `publisher-claim` in `directory/services-cta.json`.)
3. **Improve.** The check shows the largest open points. Fixing them raises the score.
4. **Embed.** The badge goes into the README, usually the first page people read about a skill. GitHub marks README links `nofollow`, so the value is referral traffic, discovery by crawlers and models that read READMEs, and one consistent description of the skill across both pages. Followed links come from the roundups, press and data report below.
5. **Verify and feature.** The author requests verification; verified, eligible skills get a featured placement, which gives them a reason to share the listing.
6. **Convert.** Publishers who care about visibility are the agency's best-fit buyers. The check results and the publisher guide both route to suedeai.agency.

### Outreach order

Priority 1: publishers in `marketing-seo` and `writing-content` whose skills score 80 or higher (agency fit). Priority 2: publishers in `ai-agents-llm` scoring 80 or higher (Agent Studio fit). Priority 3: companies listed under "Skills from the companies behind the tools" on the directory home page (high-authority READMEs).

Outreach must be approved before anything is sent. Draft for approval:

> Subject: Your skill is listed in the Agent Skills Directory
>
> Hi {name}, {skill} from {repo} is listed in the Agent Skills Directory at {listing URL} with a score of {score}/100 on our published rubric. The listing credits you and links to your source. If you want readers to find it, the page has a badge snippet for your README, and the free Skill AI-visibility check shows the points still open. Corrections or removal are one form away. Jason Colapietro, Suede AI

### Roundup and press inclusion

The two 2026 roundups of skill directories did not include us. Ask their authors to add the directory, leading with what nobody else has: a recomputable 0–99 score with every component published, and per-skill install-risk summaries. Press pitches use author framing: Jason Colapietro, author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent. Offer the data report (calendar item 6) as the hook, close softly. Nothing is sent without approval.

### Measuring the loop

- Verified badges: count of `status: "verified"` in `directory/promotion.json`.
- Unverified embeds: GitHub code search for `skills.suedeai.ai/directory` in README files, run monthly.
- Referring domains: Search Console Links report for skills.suedeai.ai.

## 5. Lead magnet: Skill AI-visibility check

**Path:** `/directory/check/`. **Promise:** "See how your skill scores, what it is missing, and what to fix so people and AI assistants can find it." Free, no signup.

**Version 1 (static, no backend, no data collection):**

1. Input: a GitHub URL to a repository or skill folder, or a skill name.
2. Look up matches in `/directory/search-index.json` (already published). If found, fetch the skill's `report.json` (already published per skill) and show: listing status, score and grade, the score components with points earned and open, and the three largest open points (the same logic as `improveBlock` in the template).
3. Show a short checklist for the skill's README and home page, each item answerable by the publisher: one-sentence answer at the top; install commands; example prompts; what the skill reads and sends; license; badge linked to the listing; the page is indexable and snippet-eligible (Google's only stated requirement for AI features).
4. Results CTA: if listed, `check-result:a-listed` routes to suedeai.agency; if not found, `check-result:b-not-found` routes to the submit page.
5. Nothing typed into the check leaves the browser except fetches for Suede AI's own static files. If a later version queries the GitHub API from the browser, say so on the page.

**Version 2 (needs approval):** an optional "email me this report" step with explicit consent, sent to the agency's CRM. Requires a backend, a privacy notice update and an approved destination. Not part of the current build.

Why this converts: the check is useful on its own, it shows the gap between a skill and the site behind it, and the next step is a conversation about the site, which is the agency's service.

## 6. CTA system

Variants live in `directory/services-cta.json` under `campaigns`, next to the plain two-card services offer, so one file drives every CTA on the site and in the Awesome catalog. Each outbound URL carries UTM parameters (`utm_source=skills.suedeai.ai`, `utm_medium` by surface, `utm_campaign` = placement, `utm_content` = variant). Category routing decides whether a page promotes the agency or Agent Studio.

Guardrails:

- Never place a CTA inside third-party content: descriptions, install commands, publisher credit, intake reviews.
- No CTA on correction or removal flows.
- Suede AI's own skills stay in their own clearly labeled section and never enter third-party rankings.
- Copy makes no claims about results, prices or availability. Variants that describe a specific agency offer carry a `confirm_offer` note until that offer is confirmed on suedeai.agency.

## 7. KPIs and measurement

No baselines are stated here because none were measurable from this session. Record a baseline in the first week after launch, then report monthly.

| KPI | Definition | Source | Cadence |
| --- | --- | --- | --- |
| Guide impressions and clicks | Search Console Performance for `/directory/guides/` pages, Web search type (includes AI Overviews and AI Mode traffic per Google) | Google Search Console (skills.suedeai.ai is verified; see `docs/google*.html`) | Weekly |
| Target query positions | Average position for each page's `primary_keyword` | Search Console query filter | Monthly |
| AI answer citations | Whether ChatGPT, Perplexity, Claude and Google AI Mode cite a directory page for a fixed prompt set (one prompt per primary keyword), run the same way each month | Manual log or the agency's tracking | Monthly |
| Agency leads from the directory | Sessions and form submissions on suedeai.agency with `utm_source=skills.suedeai.ai` | suedeai.agency analytics and CRM | Monthly |
| Agent Studio signups from the directory | Same, on suedeai.app | suedeai.app analytics | Monthly |
| CTA click-through by variant | Clicks per `utm_content` divided by page views of the placement | Destination analytics for clicks; page views need site analytics (see below) | Monthly |
| Check completions | Completed Skill AI-visibility checks | Site analytics event | Monthly |
| Verified badges | `status: "verified"` count in `promotion.json` | Repository | Monthly |
| Badge embeds | README files referencing `skills.suedeai.ai/directory` | GitHub code search | Monthly |
| Referring domains | Unique domains linking to skills.suedeai.ai | Search Console Links | Monthly |
| Roundup inclusions | Third-party directory roundups that name the directory | Manual search log | Monthly |

**Analytics gap.** The site ships no analytics script today, so on-site page views and CTA click-through cannot be measured. Destination-side UTMs still measure leads. Adding privacy-friendly, cookieless analytics needs an owner decision and a privacy-copy update; until then, rely on Search Console and destination analytics.

## 8. Template status (October 23, 2026)

- The brand in titles, footers, badges and `og:site_name` is "Suede AI Skills Directory". The hub keeps its keyword-led title.
- The four guides are published at `/directory/guides/` with Article, BreadcrumbList and (on the best-SEO guide) ItemList markup. FAQs stay visible but carry no FAQPage markup: Google limits FAQ rich results to well-known government and health sites, and the rest of skills.suedeai.ai does not use FAQPage consistently.
- Codex documents skills at `.agents/skills` (repository) and `$HOME/.agents/skills` (user), with `$skill-installer` as the in-app installer ([OpenAI docs](https://developers.openai.com/codex/skills), checked October 23, 2026). Skill pages now print a project-level copy into `.agents/skills/` instead of the undocumented `~/.codex/skills/.system/...` installer script.
- The Skill AI-visibility check (section 5, version 1) is live at `/directory/check/`.
- Guides, the guides hub and the check are in the sitemap and `llms.txt`, and each guide is linked from the pages its `link_from` field names. The build fails on a `link_from` entry it cannot place and on any guide or CTA link to an internal page that does not exist.
- CTA links to skills.suedeai.ai pages print as relative links without UTM tags; outbound links to suedeai.agency and suedeai.app keep theirs.
