# Which agent skills make the best AI lead generation tool for sales prospecting?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** for AI sales prospecting in Claude Code, pair [prospecting](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#prospecting) (86/100), which builds, enriches and verifies a prospect list, with [cold-email](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/cold-email/) (88/100), which writes and runs the outbound sequence and handles replies. Add [company-research](https://skills.suedeai.ai/directory/browserbase/skills/company-research/) (84/100) to discover and score ICP-fit accounts, and icp-identification to define the ICP first. sales-enablement covers decks and objection handling once replies come in, and [linkedin-employee-advocacy](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-employee-advocacy/) (94/100, the top score) gets your team posting so outreach lands warmer.

## The stack

Six skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [linkedin-employee-advocacy](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-employee-advocacy/) | [sergebulaev/linkedin-skills](https://github.com/sergebulaev/linkedin-skills) | 94/100 | Guides setting up a LinkedIn employee advocacy program for marketing or sales teams, covering a 14-day launch playbook, brand governance, cadence benchmarks and ROI. |
| [cold-email](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/cold-email/) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | Writes and runs B2B cold outbound, from cold emails and follow-ups to sending setup, LinkedIn, multichannel cadences and reply handling. |
| [prospecting](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#prospecting) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 86/100 | Finds, qualifies and builds lists of prospects across B2B SaaS, general B2B and local small businesses, covering signals, enrichment, email verification and account research. |
| [company-research](https://skills.suedeai.ai/directory/browserbase/skills/company-research/) | [browserbase/skills](https://github.com/browserbase/skills) | 84/100 | Researches a company's product and ICP, discovers target companies with the Browserbase Search API, researches each deeply and scores ICP fit. |
| [icp-identification](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/#icp-identification) | [gooseworks-ai/goose-skills](https://github.com/gooseworks-ai/goose-skills) | 84/100 | Researches a company or idea, defines the Ideal Customer Profile, and routes to mapping the TAM or finding leads directly. |
| [sales-enablement](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#sales-enablement) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 83/100 | Creates sales collateral such as pitch decks, one-pagers, objection handling docs, demo scripts, battle cards and win-loss analysis. |

## Who this stack is for

This stack is for anyone who has to fill a pipeline without a large sales team. A founder looking for the first ten design partners. A lone SDR who needs a verified list and a sequence by Monday. A B2B marketer asked to "do outbound" for the first time. A local services business that wants to reach nearby companies. A sales lead whose reps keep asking for a battle card and a better one-pager.

It covers the whole outbound path: define who to sell to, find and score the accounts, build a verified contact list, write the sequence, handle replies with the right collateral, and warm the market through the team's own LinkedIn posts. It is a toolkit, not a hosted AI lead generation tool; you run it inside your agent and keep the judgment calls.

All six are in the [Agent Skills](https://agentskills.io/) format, so the same folders work in Claude Code, Codex and Cursor. Three of the six come from one repository, coreyhaines31/marketingskills, and they hand work to each other by name.

## The Suede AI skill built for this job

I built [suede-prospecting](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-prospecting) for exactly this job: a source-backed, scored prospect list that tells you who to contact, why, and how sure you can be. It works across SaaS, B2B, local business and early demand signals. The list carries source dates and confidence, it runs licensed-data checks, and it ends in a qualification handoff your outreach can act on.

Start with it when the request is "find our first design partners" or when nobody has written the ICP down. It defines the ICP, enriches leads, runs gap plays and warm-path network mining, and documents disqualification evidence, so every rejected account has a written reason.

It makes the third-party stack below work harder. [company-research](https://skills.suedeai.ai/directory/browserbase/skills/company-research/) and [icp-identification](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/#icp-identification) feed it accounts and a profile; it hands [cold-email](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/cold-email/) a qualified, dated, sourced list instead of a spreadsheet of guesses. It stays in its lane: sending outreach, CRM routing and competitor profiles belong to other skills.

It is my company's skill, so it stays out of the ranking. Build the list with it first, then send.

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-prospecting
```

## The skills, one by one

### linkedin-employee-advocacy: get the whole team posting

[linkedin-employee-advocacy](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-employee-advocacy/) stands up and runs a LinkedIn employee advocacy program for a marketing or sales team. It covers a 14-day launch playbook, brand-guideline governance, a per-post time budget, cadence benchmarks and team ROI measured in reach, engagement and pipeline. It is not for planning one person's own calendar; its description points to linkedin-content-planner for that.

The SKILL.md is unusually concrete. The 14-day playbook runs in four blocks: voice capture on days 1 to 3, first posts on days 4 to 7, an ideation pipeline on days 8 to 10 and a rhythm lock on days 11 to 14. A governance section is subtitled "brand-safe without being blocked". ROI is measured at three levels: per person, team and business pipeline. It closes with anti-patterns. There are no scripts or credentials; the references cover advocacy principles, governance and a team cadence matrix.

It is MIT licensed, scores 94/100, the top score in this stack, and has fewer than 1,000 installs recorded by skills.sh. In prospecting terms it is the warm-up: a prospect who has seen your team's posts reads the cold email differently.

A launch request.

```text
Set up a 14-day LinkedIn advocacy program for our 8-person sales team.
Include governance rules, a weekly cadence and how we will measure pipeline.
```

### cold-email: write and run outbound that gets replies

[cold-email](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/cold-email/) writes and runs B2B cold outbound: cold emails, follow-ups, sending setup, LinkedIn, multichannel cadences and reply handling. Its triggers include "nobody's replying", email deliverability, warming up inboxes, connection request messages, cold calls, voicemail and AI SDR work. Its description sets four hard rules: send from secondary domains, verify lists first, turn off open tracking, and stop every channel when a prospect replies.

The SKILL.md opens with writing principles: write like a peer, not a vendor; every sentence earns its place; personalization connects to the problem; lead with their world; one low-friction ask. Then voice, structure, subject lines, follow-up sequences, a before-you-send check, channels beyond email, reply handling and a quality check. The references cover deliverability, frameworks, LinkedIn outreach, multichannel cadence, outbound plays, personalization and subject lines. No scripts or credentials.

It is MIT licensed, scores 88/100 and has about 132,000 installs recorded by skills.sh. Use it after the list is verified. Its copy avoids AI tells like "it's not X, it's Y" reveals, which matters when every inbox is full of them.

A sequence request.

```text
Write a 4-step cold sequence to heads of finance at 50-200 person SaaS
companies about month-end close. One ask per email, plain text, no tracking.
```

### prospecting: build a verified prospect list

[prospecting](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#prospecting) finds, qualifies and builds lists of prospects across B2B SaaS, general B2B and local small businesses. It covers list building, signals, enrichment, verification and account research. Its triggers name the real vocabulary of the job: target account lists, ICP-fit accounts, design partners, signal-based outbound, buying signals, intent data, job change alerts, waterfall enrichment, Clay tables, lookalike accounts, catch-all emails and account tiering.

Its description sets firm rules. Always verify emails before they reach a sequence. Never scrape LinkedIn. Define audiences in Sales Navigator and pull contacts from licensed data. I agree with all three, and the last two keep you on the right side of the platforms you depend on.

This skill has no full directory page yet, so I cannot tell you what its files contain, and I will not guess. Read its SKILL.md in the repository before you install it.

It is MIT licensed, scores 86/100 and has about 69,000 installs recorded by skills.sh. It hands the outreach itself to cold-email and competitor research to competitor-profiling. Use it as the list-building step between "who is our ICP" and "write the email".

A list request.

```text
Build a prospect list of 100 US logistics companies with 50-500 staff that
posted a dispatcher job in the last 30 days. Tier them and verify emails.
```

### company-research: discover and score ICP-fit accounts

[company-research](https://skills.suedeai.ai/directory/browserbase/skills/company-research/), from Browserbase's own repository, researches your company's product and ICP, discovers target companies with the Browserbase Search API, researches each one with a plan, research, synthesize pattern and scores ICP fit. The output is a scored research report and a CSV. Depth modes (quick, deep and deeper) trade scale for depth.

The SKILL.md is a pipeline: set up an output directory, research your own company, choose a depth mode, discover, research and score, then compile the report and CSV. It bundles three JavaScript scripts (`compile_report.mjs`, `extract_page.mjs` and `list_urls.mjs`), an example profile and an HTML report template. It documents a `BROWSERBASE_API_KEY`, so you need a Browserbase account.

It is MIT licensed, scores 84/100 and has about 2,000 installs recorded by skills.sh. Its description lists the jobs plainly: find companies to sell to, research potential customers, build a target company list, and do market research on prospects. Use it for accounts. For contacts at those accounts, hand the CSV to prospecting.

A discovery request.

```text
Research our product at example.com, then find 30 target companies in deep
mode. Score ICP fit with reasons and export the report and CSV.
```

### icp-identification: define who you sell to first

[icp-identification](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/#icp-identification) researches a company or an idea, defines the Ideal Customer Profile, and routes to the right next step: mapping the total addressable market or finding leads and prospects directly. Its description calls it the entry point for any "find me leads", "map my market" or "who should I sell to" request. It loads automatically when you give it a company URL or an idea and ask for leads or market mapping.

This skill has no full directory page yet, so I cannot describe its files, scripts or credentials. Read its SKILL.md in the gooseworks-ai/goose-skills repository before you install it.

It is MIT licensed, scores 84/100 and has fewer than 1,000 installs recorded by skills.sh. I would run it before anything else in this stack when the ICP is a feeling rather than a document. A written ICP is the filter every later step uses: company-research scores against it, prospecting tiers against it, and cold-email personalizes against it. Skip it if your ICP is already written and agreed.

Its value is the routing decision. Some products need a market map before a lead list; others need leads this week. Making that call explicitly keeps you from building the wrong list.

An entry request.

```text
Here is our company URL. Define our ICP with firmographics and buying
triggers, then tell me whether to map the TAM or go straight to leads.
```

### sales-enablement: collateral for the replies

[sales-enablement](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#sales-enablement) creates sales collateral: pitch decks, one-pagers, leave-behinds, objection handling docs, demo scripts, talk tracks, sales playbooks, proposal templates, buyer persona cards, battle cards and competitive one-pagers. It also covers deal-specific ROI analysis, win-loss analysis, cold call scripts and voicemail scripts.

Its description routes adjacent work elsewhere: public competitor comparison pages to competitors, buyer interviews to customer-research, website copy to copywriting, cold outreach emails to cold-email and the offer itself to offers. That routing is useful in a stack, because it keeps the outbound email and the deck from being written by the same prompt with the same blind spots.

This skill has no full directory page yet, so I cannot describe its files. Read its SKILL.md before you install it.

It is MIT licensed, scores 83/100 and has about 122,000 installs recorded by skills.sh. Use it when replies start arriving with objections and questions: "how is this different", "what does it cost us", "who else uses it". Skip it before the first send; collateral nobody has asked for is a guess.

An objection request.

```text
A prospect replied "we already use spreadsheets for this". Write an
objection handling doc and a one-page battle card for our reps.
```

## How to use the stack together

1. Define the target with [**icp-identification**](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/#icp-identification). Write the ICP down before you look for a single lead.
2. Discover and score accounts with [**company-research**](https://skills.suedeai.ai/directory/browserbase/skills/company-research/). Start in quick mode, then go deeper on the companies that score well.
3. Build the contact list with [**prospecting**](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#prospecting). Use licensed data, never scrape LinkedIn, and verify every email before it reaches a sequence.
4. Warm the market with [**linkedin-employee-advocacy**](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-employee-advocacy/). Start the 14-day playbook a couple of weeks before the first send.
5. Write and run the sequence with [**cold-email**](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/cold-email/). Send from secondary domains, turn off open tracking, and stop every channel when someone replies.
6. Answer replies with [**sales-enablement**](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#sales-enablement). Build the objection doc or battle card that the actual replies ask for.

## Install the stack

```bash
npx skills add https://github.com/sergebulaev/linkedin-skills/tree/main/skills/linkedin-employee-advocacy
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/cold-email
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/prospecting
npx skills add https://github.com/browserbase/skills/tree/main/skills/company-research
npx skills add https://github.com/gooseworks-ai/goose-skills/tree/main/skills/lead-generation/capabilities/icp-identification
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/sales-enablement
```

The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [event-prospecting](https://skills.suedeai.ai/directory/browserbase/skills/event-prospecting/) | [browserbase/skills](https://github.com/browserbase/skills) | 84/100 | Your best leads are speakers at a conference and you want a person-first report with a DM opener for each. |
| [firecrawl-lead-research](https://skills.suedeai.ai/directory/firecrawl/skills/firecrawl-lead-research/) | [firecrawl/skills](https://github.com/firecrawl/skills) | 82/100 | You already have named people or companies and need enrichment or a pre-meeting brief, not new prospects. |
| [revops](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#revops) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | The leads exist but stall between marketing and sales, and you need lead scoring, routing and pipeline stages. |
| [lead-magnets](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#lead-magnets) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | You want inbound leads from gated content such as a checklist, template or ebook, instead of outbound. |
| [free-tools](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#free-tools) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | You want a calculator, grader or other free tool that attracts leads on its own. |
| [salesforce-developer](https://skills.suedeai.ai/directory/jeffallan/claude-skills/#salesforce-developer) | [jeffallan/claude-skills](https://github.com/jeffallan/claude-skills) | 84/100 | The prospecting data has to land in Salesforce through Apex, triggers or custom CRM workflows. |

The split is outbound versus inbound, and finding versus enriching. prospecting finds new contacts; firecrawl-lead-research enriches ones you already have named. company-research works from your ICP; event-prospecting works from a conference speaker page. lead-magnets and free-tools replace outbound with inbound, and revops fixes what happens after a lead arrives.

## Common mistakes

- Building a list before the ICP is written. icp-identification defines it first, and every later step filters against it.
- Sending to unverified emails. prospecting verifies emails before they reach a sequence, and cold-email repeats the rule.
- Scraping LinkedIn for contacts. prospecting says never; define audiences in Sales Navigator and pull contacts from licensed data.
- Sending from your main domain with open tracking on. cold-email sends from secondary domains and turns open tracking off.
- Continuing a sequence after a reply. cold-email stops every channel the moment a prospect replies.
- Writing collateral nobody asked for. sales-enablement works best when the actual objections from replies drive it.
- Scoring two hundred accounts equally. company-research scores ICP fit with reasons, so the list can be cut.

## Licenses, costs and checks before you install

All six picks are MIT licensed. Among the alternatives, firecrawl-lead-research is ISC, also an open license. Confirm the license file in each repository anyway.

Costs and credentials, from the files the directory has read: company-research documents a `BROWSERBASE_API_KEY` and needs a Browserbase account. cold-email and linkedin-employee-advocacy list no credentials or scripts. prospecting, icp-identification and sales-enablement have no full directory page, so their files are not summarized; read them before you install. Licensed contact data and sending domains are costs of outbound itself, which prospecting and cold-email both assume you have.

The directory has not security scanned any listed skill; its [trust page](https://skills.suedeai.ai/directory/trust/) explains what is and is not checked. Read each SKILL.md before you enable it, especially any skill that will touch a contact list or a sending account.

## Related topics and stacks

The [Sales](https://skills.suedeai.ai/directory/topics/sales/) topic lists 64 skills, [Lead Generation](https://skills.suedeai.ai/directory/topics/lead-generation/) lists 10, [Email](https://skills.suedeai.ai/directory/topics/email/) lists 36, and [Social Media](https://skills.suedeai.ai/directory/topics/social-media/) lists 40. The [Business, Sales and Finance](https://skills.suedeai.ai/directory/business-finance/) category holds the rest.

The [research stack](https://skills.suedeai.ai/directory/stacks/research/) goes deeper on companies and markets, the [email stack](https://skills.suedeai.ai/directory/stacks/email/) covers lifecycle and transactional email after the first reply, and the [content and social stack](https://skills.suedeai.ai/directory/stacks/content-and-social/) feeds the posts that warm prospects up.

## FAQ

### What is the best AI lead generation tool for Claude Code?

There is no single skill; the strongest setup is a pair. prospecting (86/100) builds, enriches and verifies a prospect list from licensed data, and cold-email (88/100) writes and runs the outbound sequence. Add company-research (84/100) to discover and score ICP-fit accounts. Together they turn Claude Code into an AI lead generation tool you control.

### How do I do AI sales prospecting with these skills?

Define the ICP with icp-identification, discover and score accounts with company-research, build and verify the contact list with prospecting, then write and run the sequence with cold-email. Use sales-enablement for the objection docs that replies call for, and linkedin-employee-advocacy to warm the market through your team's posts.

### Which prospecting skill should I install first?

icp-identification, if your ICP is not written down; it defines the profile and routes you to a market map or a lead list. If the ICP is clear, start with prospecting for the list and cold-email for the sequence. Those two do most of the work.

### Do these skills scrape LinkedIn?

prospecting's description says never to scrape LinkedIn: define audiences in Sales Navigator and pull contacts from licensed data. cold-email covers LinkedIn outreach and connection request messages, and linkedin-employee-advocacy runs a team posting program. None of the picks is described as a scraper.

### Do these skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folders work in Claude Code, Codex, Cursor and other agents that read a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Are these sales prospecting skills free?

The skills are: all six are MIT licensed. The services around them are separate. company-research documents a `BROWSERBASE_API_KEY`, prospecting expects licensed contact data and Sales Navigator for audiences, and cold-email assumes secondary sending domains. Budget for those before you plan a campaign.
