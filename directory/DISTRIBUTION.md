# Directory distribution ledger

Where the **Agent Skills Directory** (https://suedeai.directory, mirrored at https://skills.suedeai.ai/directory/, GitHub companion [awesome/README.md](../awesome/README.md)) is listed, where it is not, and what each gap takes. This ledger is for the directory as a product. The pack's own listings live in [../DISTRIBUTION.md](../DISTRIBUTION.md); do not merge the two, because the pack entries on third-party lists describe installable skills and the directory entries describe a place to compare them.

Last activity: 2026-10-28. The initial audit in PR #297 used web search only and sent nothing. The subsequent placement pass directly inspected six roundup pages, verified the canonical site's key pages over HTTPS, and submitted six individualized inclusion requests with owner authorization (five emails and one contact form). Rows not directly checked remain unverified. A sent request is not a confirmed placement.

Ground truth on the audit date, from the 2026-10-22 snapshot in [skills.json](skills.json): 3,868 scored skills from 161 repositories in 16 categories; 1,765 skills score 80–99; scores run 53–95 with a median of 79; grades A 184, B 1,581, C 1,379, D 724; 3,762 skills (97.3%) carry an open license; 739 skills with a full page of their own, which is where the "before you install" panel appears; 6 featured projects; 4 guides; the free Skill AI-visibility check at `/check/`. Figures here are not maintained by the validator and go stale at the next refresh; the ready-to-send copy in [PUBLICITY.md](PUBLICITY.md) keeps a count-free variant for that reason.

## Where the directory stands

The initial search found no external directory mentions; that is a search result, not proof of zero mentions across the web. Direct page inspections on 2026-10-28 confirmed no Suede entry in the localskills, Claude Market, Agensi complete-list, ExplainX, Geekflare and AI Agents Library articles linked below. Related articles under the same publishers were not independently checked.

Current recorded results: **6 inclusion requests submitted (5 emails, 1 form), 1 automated email receipt, 1 form confirmation, 0 confirmed placements, 0 upstream resource-list PRs submitted, 1 resource-list branch prepared but submission blocked by Composio's collaborator-only PR restriction (confirmed in the signed-in browser).** localskills' operator acknowledged receipt with reference **#1005**; Geekflare displayed a successful message-received confirmation. No editorial acceptance has been received. Existing Suede skill-pack entries are not directory placements.

## Submission activity — 2026-10-28

Before sending, searches across the three connected mail accounts found no prior inclusion outreach to these publishers. Agensi had an incoming invitation dated October 27; its existing thread was used. Each outgoing email was read back and verified with Gmail's `SENT` label. Geekflare's form displayed a successful receipt after submission. Neither a sent label nor an automated receipt establishes editorial review or acceptance. Times below are America/New_York.

| Time | Target and route | Subject / request | Actual status | Response / placement |
| --- | --- | --- | --- | --- |
| 16:40:25 EDT | localskills.sh; `support@ezgamehost.com`, the operator contact published in its [terms](https://localskills.sh/terms) | `For the localskills editor: a scored directory for your comparison`; asks the operator to route the comparison request to the editor | **Submitted — receipt acknowledged** from Suede business mail; direct editorial address not published | Automatic reply at 16:40:47 EDT, reference **#1005**; awaiting editorial response; not placed |
| 16:40:38 EDT | Agensi; reply to the existing `Agensi x Jason` outreach thread | `Re: Agensi x Jason`; requests inclusion in the complete-list guide or routing to its maintainer | **Submitted — email reply sent** in the existing thread | Awaiting response; not placed |
| 16:41:00 EDT | Claude Market; `info@aidevelopers.tech`, published on its [contact page](https://www.claudemarket.ai/contact) | `A scored discovery resource for Claude Market's skills roundup`; requests editorial consideration for the guide or marketplaces index | **Submitted — email sent** from Suede business mail | Awaiting response; not placed |
| 16:41:13 EDT | ExplainX; `support@explainx.ai`, published on its [contact page](https://explainx.ai/contact) | `For Yash: a directory candidate for your agent-skills guide`; requests routing to bylined author Yash Thakker | **Submitted — email sent** from Suede business mail | Awaiting response; not placed |
| 16:48 EDT | Geekflare; [contact form](https://geekflare.com/contact/), Geekflare Guides → Correction / Editorial Feedback | Suggests the directory for Sanket Sarwade's Top Platforms table, with methodology and example-page links; submitted as Jason Colapietro with Suede business email | **Submitted — contact form accepted** | Page displayed “Thank you. We have your message and will get back to you as soon as we can.”; awaiting editorial response; not placed |
| 16:48:45 EDT | AI Agents Library; `hello@aiagentslibrary.com`, resolved from its rendered [contact page](https://www.aiagentslibrary.com/contact/) | `For Diana: a scored directory for your AI skills comparison`; relates the directory to the article's published criteria and developer discovery coverage | **Submitted — email sent** from Suede business mail | Awaiting response; not placed |
| After the emails | ComposioHQ/awesome-claude-skills; Community Resources | [Prepared one-line change](https://github.com/JasonColapietro/awesome-claude-skills/commit/d500632c86518f3bf27ca987a66b897c752245f5), branch `add-suede-agent-skills-directory`; proposed title `Add Agent Skills Directory to community resources` | **Not submitted** — API creation returned HTTP 403; after owner-authorized browser fallback and successful sign-in, GitHub explicitly stated that only repository collaborators can open a PR | No upstream PR exists from this attempt; not placed. Signed-in browser restriction verified on 2026-10-28; do not retry through another submission route to bypass the restriction |

All six requests use the count-free positioning from PUBLICITY.md, reference the specific article, link the published methodology and an accessible full skill page, and distinguish structural scoring from security scan status. No paid placement, reciprocal-link condition, inflated metric or claim of security certification was offered. Private email thread contents are retained in mail rather than copied into this public ledger.

## Site checks — 2026-10-28

Direct HTTPS GETs returned HTTP 200 for `/`, `/methodology/`, `/featured/`, `/check/`, `/guides/` and the example full skill page [`/anthropics/skills/mcp-builder/`](https://suedeai.directory/anthropics/skills/mcp-builder/). The five core pages publish self-canonical URLs on `suedeai.directory`. The homepage title is `Claude Code Skills Directory: Best Agent Skills, Graded`; its declared OG image is reachable. The methodology publishes the components and 99-point cap, and the example page contains the score breakdown, source attribution and “Before you install” evidence. These were HTTP and content checks, not an interactive checker test or a rendered social-preview test.

## Use one URL everywhere

Submit **https://suedeai.directory** as the canonical URL. The legacy `https://skills.suedeai.ai/directory/` returned HTTP 200 without a redirect during this pass, so do not assume every legacy URL redirects. The awesome catalog and README badges still print skills.suedeai.ai links; external directory submissions should consistently use the canonical host to avoid duplicate entries.

## Launch assets and measurement

1. Core page availability, canonical tags, homepage title and OG-image availability were checked above. A rendered link-preview check remains separate.
2. Analytics configuration was not changed or audited in this pass. The inclusion requests use the clean canonical URL; submission receipts and confirmed backlinks can be tracked independently of referral analytics.
3. Product Hunt screenshots and a broader launch kit remain launch-specific work. They did not block these editorial inclusion requests.
4. The six requests lead with the published method and installation evidence, without claiming a new data report exists or quoting inventory totals. A data report remains a separate press opportunity.

## Tier 1: roundups that already rank skill directories

These pages compare directories and are relevant editorial inclusion targets. Inclusion remains the publisher's decision; sending a request does not establish a placement. Order reflects the original audit's fit assessment.

| Page | Who runs it | Status 2026-10-28 | Route | Owner action |
| --- | --- | --- | --- | --- |
| claudemarket.ai, [Best places to find Claude Code skills](https://claudemarket.ai/blog/best-places-to-find-claude-code-skills) (also the [Codex](https://claudemarket.ai/blog/best-places-to-find-codex-skills) and [OpenClaw](https://claudemarket.ai/blog/best-places-to-find-openclaw-skills) editions and [best Claude Code marketplaces](https://claudemarket.ai/blog/best-claude-code-marketplaces)) | Claude Market | Directly checked: absent from the Claude Code guide; **request sent** | Published contact email; see activity log | Await response; do not duplicate across sibling posts |
| localskills.sh, [Claude skills marketplace: 8 directories compared](https://localskills.sh/blog/claude-skills-marketplace-guide) | localskills.sh / EZ Game Host, LLC | Directly checked: absent; **request sent** | Published operator email, with request for editorial routing | Await response |
| agensi.io, [Every AI agent skill directory and marketplace in 2026](https://www.agensi.io/learn/complete-list-ai-agent-skill-directories-2026) and [7 marketplaces compared](https://www.agensi.io/learn/best-ai-agent-skills-marketplaces-2026) | Agensi | Directly checked: absent from the complete-list guide; **request sent** | Existing incoming outreach thread; public fallback is [contact](https://www.agensi.io/contact) | Await response; do not send a second request to the fallback |
| aiagentslibrary.com, [The 9 best AI skills libraries and directories](https://www.aiagentslibrary.com/blog/best-ai-skills-libraries-directories/) | AI Agents Library; article by Diana | Directly checked: absent; **request sent** | Published contact email resolved in the rendered page | Await response |
| explainx.ai, [Top 10 AI agent skills directories and registries](https://explainx.ai/blog/top-10-ai-agent-skills-directories-2026) | ExplainX; article by Yash Thakker | Directly checked: absent; **request sent** | Published support email, requesting routing to the author | Await response |
| thepromptindex.com, [AI agent skills guide: directories, install and security](https://www.thepromptindex.com/how-to-use-ai-agent-skills-the-complete-guide.html) | The Prompt Index | Unverified; original search-only lead | Site contact not yet verified | Inspect page and contact route before sending |
| fast.io, [Best Claude Code skills: 2026 curated directory](https://fast.io/resources/awesome-claude-skills-directory-2026/) | Fast.io | Unverified; original search-only lead | Site contact not yet verified | Inspect page and contact route before sending |
| geekflare.com, [Where to find Claude Code skills](https://geekflare.com/guides/find-claude-code-skills/) | Geekflare; article by Sanket Sarwade | Directly checked: absent; **request submitted and form receipt confirmed** | [Contact form](https://geekflare.com/contact/), Guides → Editorial Feedback | Await editorial review; requested resource evaluation, not a guest article or paid placement |
| skillselion.com, [Claude skills marketplace guide](https://skillselion.com/guides/claude-skills-marketplace-guide) | Skillselion | Unverified; original search-only lead | Site contact not yet verified | Inspect page and contact route before sending |
| itechnicallykan.com, [Where to find Claude skills and MCPs](https://itechnicallykan.com/blog/posts/where-to-find-claude-skills-and-mcps/) | Independent blog | Unverified; original search-only lead | Author contact not yet verified | Inspect page and contact route before sending |
| ai-coding-tools-guide.vercel.app, [Agent skills directory](https://ai-coding-tools-guide.vercel.app/agent-skills-directory/) | Independent, likely a GitHub-backed site | Unverified; original search-only lead; could not confirm whether it is a catalog or a list of directories | Find the repository and open a PR | PR or email |

Lead with the published 0–99 structural quality [rubric](https://suedeai.directory/methodology/), source attribution and the "before you install" panel on full skill pages. Use count-free wording. Do not equate scores with security certification, claim installation evidence exists on every listing, or claim uniqueness without current comparison evidence.

## Tier 2: directories of directories and product listings

| Site | Fit | Status 2026-10-28 | Route | Owner action |
| --- | --- | --- | --- | --- |
| aiagentsdirectory.com, category [Agent skills sharing platform](https://aiagentsdirectory.com/category/agent-skills-sharing-platform) | Exact category | Unverified; original search-only lead | Submit form on the site | Form |
| AlternativeTo | skills.sh and skillsdirectory.com both have pages; list the directory as an alternative to each | Unverified; original search-only lead | "Add an app" form, free | Account and form |
| Peerlist projects | An "AI agent skills directory" project page already exists for a competitor | Unverified; original search-only lead | Post a project | Account |
| BetaList | Early-stage product launches; an "AI agents listing" startup is already there | Unverified; original search-only lead | Submit form; free queue is slow, paid skip-the-line exists | Form; spending money needs approval |
| There's An AI For That, Futurepedia, Toolify, Future Tools | Broad AI tool directories, lower fit, high reach | Unconfirmed; the pack audit found two of these block automated checks | Submission forms | Forms |
| everydev.ai tools | Developer tool index that already lists a "skills directory" | Unverified; original search-only lead | Submit route not confirmed | Check the site |
| feedbagel.com | Publishes one post per skills directory (SkillRegistry, Claude Skills Hub, Agent Skills Directory) | Unverified; original search-only lead | Author contact | Email with the one-line pitch |
| SaaSHub, G2, Capterra | Software directories | Unverified; original search-only lead; SaaSHub's `/suede` entry is the paid media product, not this | SaaSHub "submit"; G2 needs a product profile | Low priority until the directory has a product name distinct from the pack on those sites |

## Tier 3: awesome lists

The directory draws its listings from eight awesome lists (see `sources` in [skills.json](skills.json)). A reciprocal entry on each, in a "directories", "resources" or "where to browse" section, is the most natural ask on GitHub: the directory credits and links every one of them.

| List | Section to target | Status 2026-10-28 | Owner action |
| --- | --- | --- | --- |
| travisvn/awesome-claude-skills | Resources or directories section | Directly checked: absent as a directory; **not submitted** | [CONTRIBUTING.md](https://github.com/travisvn/awesome-claude-skills/blob/main/CONTRIBUTING.md) explicitly rejects AI-assisted submissions. Skip this automated route. Existing pack PR #1205 is a separate item. |
| hesreallyhim/awesome-claude-code | Resources | Unverified; original search-only lead | PR |
| ComposioHQ/awesome-claude-skills | Resources → Community Resources | Directly checked: absent; duplicate PR search clear; **branch prepared, upstream PR blocked** | CONTRIBUTING.md and .github inspected; one neutral resource line prepared. [Open the prepared comparison](https://github.com/ComposioHQ/awesome-claude-skills/compare/master...JasonColapietro:awesome-claude-skills:add-suede-agent-skills-directory?expand=1). No upstream submission receipt. Signed-in GitHub explicitly limits new PRs to repository collaborators; this is a repository restriction, not an unresolved login problem. |
| VoltAgent/awesome-agent-skills | Resources | Unverified; original search-only lead | PR |
| BehiSecc/awesome-claude-skills | Collections | Directly checked: absent as a directory; duplicate PR search clear; **not submitted** | README invites fork-and-PR contributions; root contains no separate contribution guide or template. Existing pack entry and pack-update PRs are distinct. |
| karanb192/awesome-claude-skills | Resources | Unverified; original search-only lead | PR |
| heilcheng/awesome-agent-skills, skillmatic-ai/awesome-agent-skills | Resources | Unverified; original search-only lead | PR |
| VoltAgent/awesome-openclaw-skills, 0xNyk/awesome-hermes-agent, hashgraph-online/awesome-codex-plugins | Resources | Unverified; original search-only lead | PR; the directory covers skills those agents can install |

### sindresorhus/awesome (the master list)

Read from `pull_request_template.md` and `create-list.md` on 2026-10-28. The entry must be a **standalone repository** named `awesome-<name>` in lowercase slug form, with a title-case `# Awesome Name of List` heading, the awesome badge on the right of the heading linking back to sindresorhus/awesome, a `contributing.md`, a first section named `Contents` with at most one level of nesting, and the repository must be **at least 30 days old** from its first real commit before the PR. The PR title is `Add Name of List` without the word Awesome, and the submitter must review at least four other open PRs first.

`awesome/README.md` fails on the first two rules: it is a subfolder of `suede-creator-skills`, and its heading is "Suede Awesome Everything". Nothing else blocks it. The route is a dedicated repository, say `JasonColapietro/awesome-scored-agent-skills`, populated by the existing generator (`scripts/build-awesome-directory.mjs` writing into a checkout of that repo, or a workflow that copies `awesome/` into it on each refresh), with the heading changed to "Awesome Scored Agent Skills" in that copy only. Creating a public repository is a publishing act and waits on owner approval. If created in early November, the earliest PR date is early December.

## Tier 4: launch surfaces

Order: Show HN first (Tuesday to Thursday, 8 to 10 am Eastern), Reddit the same day, Product Hunt one week later with the data report as the "what's new" hook. Copy for each is in [PUBLICITY.md](PUBLICITY.md).

| Surface | Status | Route | Notes |
| --- | --- | --- | --- |
| Hacker News, Show HN | Not posted | https://news.ycombinator.com/submit, title must start with "Show HN:" | A directory people can use with no login qualifies. Post the methodology, not the marketing; answer every comment for the first two hours. |
| Product Hunt | Not posted | https://www.producthunt.com/posts/new | Precedent: "OpenClaw Skills", a community skills directory, launched there. Needs the 1270×760 gallery, a maker comment and a first-day plan. |
| Reddit r/ClaudeAI, r/ClaudeCode, r/codex | Not posted | Post from the owner account | Read each subreddit's self-promotion rule on the day; lead with the data, link in the body. |
| dev.to, Hashnode | Not posted | Post | Republish the data report with a canonical link to the directory. |
| Indie Hackers | Not posted | Post | Short "how we scored 3,868 skills" writeup. |
| X (@johnnysuede), LinkedIn (Jason Colapietro) | Not posted | Buffer, after approval | Drafts in PUBLICITY.md. |

## Tier 5: press and newsletters

Use the hook from the data report and author framing (Jason Colapietro, author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent). Verify each route from the outlet's own page before sending; see `skills/suede-public-relations/references/media-outlets.md`.

| Outlet | Why | Route |
| --- | --- | --- |
| Latent Space, The Pragmatic Engineer, Console, DevTools FM, The Changelog | Practitioner developer audience that installs skills | Editor contact; pitch the data, not the launch |
| TLDR AI, Ben's Bites, The Neuron, The Rundown | Daily AI newsletters that pick up Show HN and Product Hunt items | Submission or tips form on each site |
| Hacker Newsletter, Changelog News | Pick from HN; a front-page Show HN is the route | None; comes from the HN result |
| VentureBeat, The New Stack | AI developer tooling coverage | Reporter whose recent bylines cover agent tooling |

## Measuring

- **Third-party mentions:** search both canonical and legacy URLs, then inspect the actual pages. Initial 2026-10-28 search found none; this is not an exhaustive web-wide count.
- **Roundup inclusions:** count only directly verified entries. Current ledger: 0 confirmed inclusions; 6 requests submitted, awaiting editorial response.
- **Referrals:** GA4 by `utm_source` once analytics is live (STRATEGY section 7).
- **Links:** Search Console Links report for suedeai.directory (verify the property first; skills.suedeai.ai is verified, the new host may not be).

## Next actions

1. Read responses in the five existing mail threads and Geekflare's form response before any follow-up. Stop on a decline or opt-out; do not send duplicate requests to sibling articles or fallback addresses.
2. Composio's signed-in PR page limits submissions to repository collaborators. Retain the prepared branch, but do not retry or count it as submitted. Resume only if maintainers reopen contributions or explicitly invite the submission; prioritize other eligible targets.
3. Independently inspect remaining search-only leads and verify their contact routes before contacting them. The six directly checked publishers have already received requests.
4. On acceptance, open the external page and verify the canonical backlink before marking **Confirmed placement**. A positive email or merged PR without checking the resulting listing is not enough.
5. Keep directory placements separate from skill-pack listings and broader launch work. Inventory reconciliation is outside this placement pass.
