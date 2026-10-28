# Directory distribution ledger

Where the **Agent Skills Directory** (https://suedeai.directory, mirrored at https://skills.suedeai.ai/directory/, GitHub companion [awesome/README.md](../awesome/README.md)) is listed, where it is not, and what each gap takes. This ledger is for the directory as a product. The pack's own listings live in [../DISTRIBUTION.md](../DISTRIBUTION.md); do not merge the two, because the pack entries on third-party lists describe installable skills and the directory entries describe a place to compare them.

Last audit: 2026-10-28. Method: web search only. The session could not load suedeai.directory, skills.suedeai.ai or any of the roundup sites below, so every "Not listed" row rests on search results, not on a page read. Re-read each page before acting on a row. Nothing was submitted, posted or sent during the audit.

Ground truth on the audit date, from the 2026-10-22 snapshot in [skills.json](skills.json): 3,868 scored skills from 161 repositories in 16 categories; 1,765 skills score 80–99; scores run 53–95 with a median of 79; grades A 184, B 1,581, C 1,379, D 724; 3,762 skills (97.3%) carry an open license; 6 featured projects; 4 guides; the free Skill AI-visibility check at `/check/`. Figures here are not maintained by the validator and go stale at the next refresh; the ready-to-send copy in [PUBLICITY.md](PUBLICITY.md) keeps a count-free variant for that reason.

## Where the directory stands

A search for `"suedeai.directory" OR "skills.suedeai.ai/directory"` on 2026-10-28 returned no page outside this repository. A search for `"Suede AI" "Agent Skills Directory"` returned pack listings (mcpmarket.com) and unrelated scoring tools. Every 2026 roundup of skill directories found by search names skills.sh, skillsdirectory.com, SkillsMP, ClaudeSkills.info, ClawHub, LobeHub, awesome lists and the author's own site; none names this directory. The directory has zero third-party mentions. That is the whole gap, and it is a submission gap, not a product gap: the directory already has the two things roundup authors say they rank on, a published method and per-skill install evidence.

## Use one URL everywhere

Submit **https://suedeai.directory** as the canonical URL. `skills.suedeai.ai/directory/...` 301s there (see [README.md](README.md), "Standalone site"). The awesome catalog and README badges still print skills.suedeai.ai links, which is fine, but a listing should never carry both hosts or a directory ends up with two entries.

## Before the first submission (owner checklist)

1. Confirm from a browser that `https://suedeai.directory/`, `/featured/`, `/methodology/`, `/check/` and `/guides/` load, and that the home page `<title>` and `og:image` read well in a link preview. Not checkable from this session.
2. Put analytics on the site first. [STRATEGY.md](STRATEGY.md) section 7 records that the site has none, so referral traffic from every row below is unmeasurable until it does. Tag outbound submission links with `?utm_source=<site>&utm_medium=listing&utm_campaign=directory-launch`.
3. Prepare the launch kit: 1 OG image (1200×630), 4 to 6 screenshots at 1270×760 for Product Hunt (home with scores, a skill page with its "before you install" panel, the methodology page, the check tool), and the 100-word, 250-word and one-line descriptions in [PUBLICITY.md](PUBLICITY.md).
4. Publish the data report (STRATEGY calendar item 6, `/guides/state-of-agent-skills-2026/`) before the press and roundup emails go out. Every pitch below leads with it.

## Tier 1: roundups that already rank skill directories

These pages are the "lists" that matter: they rank directories, they are what AI answers cite when someone asks where to find skills, and inclusion is one email. Most are written by a competing directory, which is normal here; they still add entries. Order by fit.

| Page | Who runs it | Status 2026-10-28 | Route | Owner action |
| --- | --- | --- | --- | --- |
| claudemarket.ai, [Best places to find Claude Code skills](https://claudemarket.ai/blog/best-places-to-find-claude-code-skills) (also the [Codex](https://claudemarket.ai/blog/best-places-to-find-codex-skills) and [OpenClaw](https://claudemarket.ai/blog/best-places-to-find-openclaw-skills) editions and [best Claude Code marketplaces](https://claudemarket.ai/blog/best-claude-code-marketplaces)) | Remote OpenClaw (same operator as remoteopenclaw.com, which mirrors the posts) | Not listed | Email the author via the site contact; the marketplaces index at `/marketplaces` may also take submissions | Send the roundup email |
| localskills.sh, [Claude skills marketplace: 8 directories compared](https://localskills.sh/blog/claude-skills-marketplace-guide) | localskills.sh | Not listed | Site contact | Send the roundup email |
| agensi.io, [Every AI agent skill directory and marketplace in 2026](https://www.agensi.io/learn/complete-list-ai-agent-skill-directories-2026) and [7 marketplaces compared](https://www.agensi.io/learn/best-ai-agent-skills-marketplaces-2026) | Agensi | Not listed | Site contact | Send the roundup email |
| aiagentslibrary.com, [The 9 best AI skills libraries and directories](https://www.aiagentslibrary.com/blog/best-ai-skills-libraries-directories/) | AI Agents Library | Not listed | Site contact or submit form | Send the roundup email |
| explainx.ai, [Top 10 AI agent skills directories and registries](https://explainx.ai/blog/top-10-ai-agent-skills-directories-2026) | ExplainX | Not listed | Site contact | Send the roundup email |
| thepromptindex.com, [AI agent skills guide: directories, install and security](https://www.thepromptindex.com/how-to-use-ai-agent-skills-the-complete-guide.html) | The Prompt Index | Not listed | Site contact | Send the roundup email |
| fast.io, [Best Claude Code skills: 2026 curated directory](https://fast.io/resources/awesome-claude-skills-directory-2026/) | Fast.io | Not listed | Site contact | Send the roundup email |
| geekflare.com, [Where to find Claude Code skills](https://geekflare.com/guides/find-claude-code-skills/) | Geekflare (editorial) | Not listed | Editorial contact; Geekflare takes pitches | Send the roundup email with the data report |
| skillselion.com, [Claude skills marketplace guide](https://skillselion.com/guides/claude-skills-marketplace-guide) | Skillselion | Not listed | Site contact | Send the roundup email |
| itechnicallykan.com, [Where to find Claude skills and MCPs](https://itechnicallykan.com/blog/posts/where-to-find-claude-skills-and-mcps/) | Independent blog | Not listed | Author contact | Send the roundup email |
| ai-coding-tools-guide.vercel.app, [Agent skills directory](https://ai-coding-tools-guide.vercel.app/agent-skills-directory/) | Independent, likely a GitHub-backed site | Not listed; could not confirm whether it is a catalog or a list of directories | Find the repository and open a PR | PR or email |

What to lead with, in every message: the published, recomputable 0–99 rubric with every component listed ([methodology](https://suedeai.directory/methodology/)), the per-skill "before you install" panel (scripts, credentials, outside hosts, MCP use), and the data report. The research in [STRATEGY.md](STRATEGY.md) section 1 found no competing directory publishing all three, and they are what roundup authors rank on.

## Tier 2: directories of directories and product listings

| Site | Fit | Status 2026-10-28 | Route | Owner action |
| --- | --- | --- | --- | --- |
| aiagentsdirectory.com, category [Agent skills sharing platform](https://aiagentsdirectory.com/category/agent-skills-sharing-platform) | Exact category | Not listed | Submit form on the site | Form |
| AlternativeTo | skills.sh and skillsdirectory.com both have pages; list the directory as an alternative to each | Not listed | "Add an app" form, free | Account and form |
| Peerlist projects | An "AI agent skills directory" project page already exists for a competitor | Not listed | Post a project | Account |
| BetaList | Early-stage product launches; an "AI agents listing" startup is already there | Not listed | Submit form; free queue is slow, paid skip-the-line exists | Form; spending money needs approval |
| There's An AI For That, Futurepedia, Toolify, Future Tools | Broad AI tool directories, lower fit, high reach | Unconfirmed; the pack audit found two of these block automated checks | Submission forms | Forms |
| everydev.ai tools | Developer tool index that already lists a "skills directory" | Not listed | Submit route not confirmed | Check the site |
| feedbagel.com | Publishes one post per skills directory (SkillRegistry, Claude Skills Hub, Agent Skills Directory) | Not listed | Author contact | Email with the one-line pitch |
| SaaSHub, G2, Capterra | Software directories | Not listed; SaaSHub's `/suede` entry is the paid media product, not this | SaaSHub "submit"; G2 needs a product profile | Low priority until the directory has a product name distinct from the pack on those sites |

## Tier 3: awesome lists

The directory draws its listings from eight awesome lists (see `sources` in [skills.json](skills.json)). A reciprocal entry on each, in a "directories", "resources" or "where to browse" section, is the most natural ask on GitHub: the directory credits and links every one of them.

| List | Section to target | Status 2026-10-28 | Owner action |
| --- | --- | --- | --- |
| travisvn/awesome-claude-skills | Resources or directories section | Not listed as a directory (the pack has its own PR history; see ../DISTRIBUTION.md) | PR with the awesome-list line in PUBLICITY.md |
| hesreallyhim/awesome-claude-code | Resources | Not listed | PR |
| ComposioHQ/awesome-claude-skills | Resources | Not listed | PR |
| VoltAgent/awesome-agent-skills | Resources | Not listed | PR |
| BehiSecc/awesome-claude-skills | Resources | Not listed | PR |
| karanb192/awesome-claude-skills | Resources | Not listed | PR |
| heilcheng/awesome-agent-skills, skillmatic-ai/awesome-agent-skills | Resources | Not listed | PR |
| VoltAgent/awesome-openclaw-skills, 0xNyk/awesome-hermes-agent, hashgraph-online/awesome-codex-plugins | Resources | Not listed | PR; the directory covers skills those agents can install |

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

- **Third-party mentions:** monthly search for `"suedeai.directory"` and `"skills.suedeai.ai/directory"`; log the count here. Baseline 2026-10-28: 0.
- **Roundup inclusions:** count of Tier 1 rows marked Listed. Baseline: 0 of 11.
- **Referrals:** GA4 by `utm_source` once analytics is live (STRATEGY section 7).
- **Links:** Search Console Links report for suedeai.directory (verify the property first; skills.suedeai.ai is verified, the new host may not be).

## Next actions

Agent-side, no external mutation: keep this file current when a status changes, and update the facts line after each snapshot refresh.

Owner-side, in order: (1) the pre-submission checklist above; (2) send the eleven Tier 1 roundup emails from PUBLICITY.md; (3) the Tier 3 awesome-list PRs, one per repository; (4) approve or decline the dedicated awesome repository; (5) Show HN, Reddit, then Product Hunt; (6) press after the data report is live.
