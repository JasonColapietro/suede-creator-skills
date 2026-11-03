# What is the best AI ad generator skill stack for Claude Code?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** as an AI ad generator inside Claude Code, [ad-creative](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/) (83/100) writes and iterates headlines, descriptions and primary text for any ad platform, and [ads](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ads/) (83/100) plans the campaign: platform, targeting, bidding and budget across Google Ads, Meta, LinkedIn and X. For Meta, [meta-ads-analyzer](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/meta-ads-analyzer/) (84/100) diagnoses performance with Meta's own mechanics. [ad-resize](https://skills.suedeai.ai/directory/bria-ai/bria-skill/ad-resize/) (86/100, the top score) remakes a finished ad for every placement. Add ad-management-intake before a first Meta campaign and google-ads-copy for search ad tests.

## The stack

Six skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [ad-resize](https://skills.suedeai.ai/directory/bria-ai/bria-skill/ad-resize/) | [Bria-AI/bria-skill](https://github.com/Bria-AI/bria-skill) | 86/100 | Resizes a flat ad image into feed, story and banner sizes, redoing the layout for each shape rather than cropping or stretching. |
| [meta-ads-analyzer](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/meta-ads-analyzer/) | [gooseworks-ai/goose-skills](https://github.com/gooseworks-ai/goose-skills) | 84/100 | Diagnoses Meta Ads campaign performance and account gaps using Meta's system mechanics, and recommends what to test or create next. |
| [ad-management-intake](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/ad-management-intake/) | [gooseworks-ai/goose-skills](https://github.com/gooseworks-ai/goose-skills) | 84/100 | Researches a brand, asks only the questions it cannot infer, and records brand facts and a campaign brief for Meta ads. |
| [ad-creative](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 83/100 | Generates, iterates and scales ad creative, including headlines, descriptions, primary text and full ad variations, for any paid advertising platform. |
| [ads](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ads/) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 83/100 | Helps with paid advertising campaigns on Google Ads, Meta, LinkedIn, Twitter/X and other ad platforms, covering PPC, ROAS, retargeting and audience targeting. |
| [google-ads-copy](https://skills.suedeai.ai/directory/nowork-studio/notfair/google-ads-copy/) | [nowork-studio/NotFair](https://github.com/nowork-studio/NotFair) | 76/100 | Generates and A/B tests Google Ads copy, including headlines, descriptions, ad variants and Responsive Search Ad components, to improve click-through rate. |

## Who this stack is for

This stack is for people who spend real money on ads and want an agent to do the work around the spend. A founder running the first Meta campaign with no agency. A growth marketer who needs forty headline variants by Friday and a plan for which to test. A B2B marketer deciding between LinkedIn and Google Search. A designer who has one finished ad and needs it in story, feed and leaderboard sizes.

The picks cover the whole loop: intake, strategy, copy, sizing and diagnosis. Two of them are Meta-specific, one is Google Ads-specific, and the rest work across platforms. None of them places a bid or spends a dollar on its own; you still run the ad account.

All six are in the [Agent Skills](https://agentskills.io/) format, so the same folders work in Claude Code, Codex and Cursor. If you searched for AI Facebook ads or AI Google Ads help, the Meta and Google picks below are the ones to read first.

## The Suede AI skill built for this job

I built [suede-ads](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-ads) for exactly this job: deciding where paid money goes and when to pull it, with numbers instead of hope. It chooses channels, structures campaigns, sets budget pacing and retargeting, and writes kill-or-scale rules from verified unit economics and performance. When the request is "audit our paid campaigns", this is the skill that takes it.

Start with it before you write a single headline. A campaign without a kill rule spends until someone notices, and a channel chosen without unit economics is a guess with a budget attached.

It makes the third-party stack below work harder. Once it has set the channels, structure, pacing and the numbers that decide kill or scale, [ad-creative](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/) and [google-ads-copy](https://skills.suedeai.ai/directory/nowork-studio/notfair/google-ads-copy/) write against a plan, [ad-resize](https://skills.suedeai.ai/directory/bria-ai/bria-skill/ad-resize/) produces the sizes that plan calls for, and [meta-ads-analyzer](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/meta-ads-analyzer/) has a rule to measure against. It stays in its lane: ad asset production, tracking implementation, attribution reconciliation and landing-page work belong to other skills.

It is my company's skill, so it stays out of the ranking. Set the rules with it first, then spend.

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-ads
```

## The skills, one by one

### ad-resize: one finished ad, every placement size

[ad-resize](https://skills.suedeai.ai/directory/bria-ai/bria-skill/ad-resize/) resizes a finished, flat ad image into other sizes with the layout redone for each shape, not cropped or stretched. It covers feed, story, landscape, banner, leaderboard and any pixel size, up to ten sizes per call. It is powered by Bria's Ad Resize service.

The SKILL.md starts with authentication: check for existing credentials, authenticate by device authorization, then verify billing status and resolve an API key. Then it covers input, options, output and the two routes Bria picks between, with examples for every size in a campaign, resizing from a URL, a whole folder at once, and a run slower than its 15-minute ceiling. The files read `BRIA_API_KEY`, document `BRIA_ACCESS_TOKEN` and `REFRESH_TOKEN`, bundle one shell client script and call the network.

It is MIT licensed, scores 86/100, the top score in this stack, and has fewer than 1,000 installs recorded by skills.sh. Use it when the creative is final and approved. Do not use it to design an ad; it resizes what exists, and Bria is a billed service.

A sizing request.

```text
Resize hero-ad.png to 1080x1920, 1200x628 and 728x90 for this campaign.
Keep the logo and headline legible and put the outputs in ads/sized/.
```

### meta-ads-analyzer: diagnose Facebook and Instagram ads on Meta

[meta-ads-analyzer](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/meta-ads-analyzer/) diagnoses Meta Ads performance and account gaps using Meta's actual system mechanics: customer-journey coverage, the Breakdown Effect, the Learning Phase, Auction Overlap, Pacing and Creative Fatigue. It is for performance diagnosis, account audits, full-funnel gap analysis and deciding what to test or create next, with recommendations a novice can follow.

The SKILL.md runs in phases: intake, identifying the right evaluation level, checking Learning Phase status, then six Meta-specific lenses (marginal efficiency, ad relevance, auction overlap, pacing, performance fluctuation and customer-journey coverage), a synthesis through the Breakdown Effect, and the report. It sets mandatory output standards and a metric naming standard. There are no scripts and no credentials in the files; you bring the account data.

It is MIT licensed, scores 84/100 and has fewer than 1,000 installs recorded by skills.sh. I like that its description refuses to force every campaign into a funnel stage. Use it when a Meta campaign is live and something looks wrong. It does not cover Google Ads.

A diagnosis request.

```text
Here is last month's Meta Ads export by ad set. Check Learning Phase status,
look for auction overlap and creative fatigue, and tell me what to test next.
```

### ad-management-intake: the brief before a Meta campaign

[ad-management-intake](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/ad-management-intake/) is the intake stage of a larger Meta ads workflow. It researches the brand first, states what it assumes, and asks only what it cannot infer and what would change money, claims or legal exposure if guessed wrong. It asks at most four questions a turn, in plain business language. It writes the brand's stable facts to `ads/brand.md`, plus the campaign brief and a log of what was asked versus assumed.

The SKILL.md workflow starts with "resume, don't restart", gathers what is known, builds an internal fact sheet, then works through the business and the campaign, states assumptions and writes everything down before handing over. It includes business-type examples, decision rules and guidance on how to talk. There are no scripts; the references include adapters for Gooseworks and for local use.

It is MIT licensed and scores 84/100; skills.sh publishes no install count for it. Use it before the first Meta campaign for a brand, or whenever the brand's ad facts live only in someone's head.

A kickoff request.

```text
We want to run Meta ads for our dog-food subscription. Research the brand,
state your assumptions and ask only what you cannot infer. Write the brief.
```

### ad-creative: an AI ad generator for headlines and primary text

[ad-creative](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/) generates, iterates and scales ad creative for any paid platform: headlines, descriptions, primary text and full ad variations. Its triggers range from RSA headlines and Facebook ad copy to hook writing, creative roadmaps, UGC and motion video ad formats. Two rules stand out in its description: copy avoids AI tells like "it's not X, it's Y" reveals, and every test hypothesis must name the metric, the comparison and the expected direction.

The SKILL.md asks for platform, format, offer, audience and constraints first, then works in four modes: generate from scratch, iterate from performance data, scaled static batches grounded in real inputs, and a creative strategy loop. Platform specs cover Google responsive search ads, Meta and LinkedIn. It ships an HTML creative review template and references on hooks, awareness-level headlines and Meta creative formats. No scripts or credentials.

It is MIT licensed, scores 83/100 and has about 139,000 installs recorded by skills.sh. This is the AI ad generator of the stack. Use mode 2 once you have results; generating from scratch forever ignores what the data already told you.

A batch request.

```text
Write 15 Meta primary-text variants for our budgeting app, aimed at
freelancers. Group them by hook and give one falsifiable test hypothesis.
```

### ads: campaign strategy, targeting and bidding

[ads](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ads/) helps with paid campaigns on Google Ads, Meta, LinkedIn, Twitter/X and other platforms: campaign strategy, audience targeting, bidding and optimization. Its triggers include ROAS, CPA, negative keywords, Performance Max, search terms reports, wasted spend, ABM and "when should I kill an ad". It ends every recommendation with facts, hypotheses and missing data, and labels unavailable inputs MISSING instead of estimating them.

The SKILL.md starts with goals, offer, audience and current state, then covers reference routing, a platform selection guide, campaign structure (account organization, naming conventions, budget allocation), ad copy formulas and audience targeting. Its references include a Google Ads audit checklist, a Google Search playbook, a LinkedIn B2B playbook, conversion tracking and audit guardrails. No scripts or credentials.

It is MIT licensed, scores 83/100 and has about 87,000 installs recorded by skills.sh. The MISSING label is the reason I trust it: an ad plan that invents a conversion rate is worse than one that admits it does not know. It hands bulk creative to ad-creative and landing pages to other skills.

A planning request.

```text
We sell B2B payroll software at $400 a month. Should we start on LinkedIn or
Google Search? Propose a structure, budget split and negative keywords.
```

### google-ads-copy: AI Google Ads copy and RSA tests

[google-ads-copy](https://skills.suedeai.ai/directory/nowork-studio/notfair/google-ads-copy/) generates and A/B tests Google Ads copy: headlines, descriptions, ad variants and Responsive Search Ad components. It triggers on requests to write ads, improve CTR, run an ad variation experiment or improve click-through rate on existing ads.

Its files are a single SKILL.md, with no scripts, references or credentials, and the directory's summary shows no section headings. That makes it the quickest skill here to audit: one file.

It is MIT licensed and scores 76/100, a C grade and the lowest score in this stack; skills.sh publishes no install count for it. I keep it because it is narrow and does one Google Ads job. If you already run ad-creative, which covers Google responsive search ads in its platform specs, you can skip it. Reach for it when the whole job is search ad copy and a CTR test.

A search ad request.

```text
Write a Responsive Search Ad for "emergency plumber Denver": 15 headlines,
4 descriptions, and two variants to A/B test for click-through rate.
```

## How to use the stack together

1. Start a new brand with [**ad-management-intake**](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/ad-management-intake/). It writes `ads/brand.md` and a campaign brief, so every later step reads the same facts.
2. Plan the campaign with [**ads**](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ads/): platform, structure, budget allocation, targeting and bidding. Keep its MISSING labels visible until real numbers replace them.
3. Generate creative with [**ad-creative**](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/) against the brief. Ask for a falsifiable hypothesis with every batch.
4. For Google Search, write the responsive search ads with [**google-ads-copy**](https://skills.suedeai.ai/directory/nowork-studio/notfair/google-ads-copy/) and set up the CTR test. Keep the losing variant's numbers; they tell ad-creative what not to repeat.
5. Once the visual is approved, produce every placement with [**ad-resize**](https://skills.suedeai.ai/directory/bria-ai/bria-skill/ad-resize/). One finished ad becomes feed, story and banner sizes without a redesign.
6. After the campaign has data, diagnose Meta with [**meta-ads-analyzer**](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/meta-ads-analyzer/). Check Learning Phase status before judging any ad set.
7. Feed the results back to **ad-creative** in its iterate-from-performance mode. The next batch starts from what worked, not from a blank page.

## Install the stack

```bash
npx skills add https://github.com/Bria-AI/bria-skill/tree/dev/skills/ad-resize
npx skills add https://github.com/gooseworks-ai/goose-skills/tree/main/skills/ads/composites/meta-ads-analyzer
npx skills add https://github.com/gooseworks-ai/goose-skills/tree/main/skills/ads/composites/ad-management-intake
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/ad-creative
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/ads
npx skills add https://github.com/nowork-studio/NotFair/tree/main/skills/google-ads-copy
```

The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [ad-delayer](https://skills.suedeai.ai/directory/bria-ai/bria-skill/ad-delayer/) | [Bria-AI/bria-skill](https://github.com/Bria-AI/bria-skill) | 86/100 | The design file is lost and you need a flat ad split back into background, product, logo, headline, body and CTA layers. |
| [google-ads-api-quickstart](https://skills.suedeai.ai/directory/google/skills/#google-ads-api-quickstart) | [google/skills](https://github.com/google/skills) | 86/100 | You are connecting code to the Google Ads API and need credentials, a client library and a first "retrieve campaigns" script. |
| [answer-ads-questions](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/answer-ads-questions/) | [gooseworks-ai/goose-skills](https://github.com/gooseworks-ai/goose-skills) | 84/100 | You want quick answers on Meta spend and results, each number stamped with its data window and sync time. |
| [remix-graphic-ad-from-reference](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/remix-graphic-ad-from-reference/) | [gooseworks-ai/goose-skills](https://github.com/gooseworks-ai/goose-skills) | 83/100 | You have a reference static ad and want its layout remade for your product with GPT Image 2, a billed FAL generation. |
| [ad-campaign-analyzer](https://skills.suedeai.ai/directory/github/awesome-copilot/#ad-campaign-analyzer) | [github/awesome-copilot](https://github.com/github/awesome-copilot) | 82/100 | You have campaign performance data and need a cut, scale or test call. |
| [google-ads-landing](https://skills.suedeai.ai/directory/nowork-studio/notfair/google-ads-landing/) | [nowork-studio/NotFair](https://github.com/nowork-studio/NotFair) | 76/100 | An ad group has high CTR and low conversion, and the landing page is the suspect. |

Choose by the question you are asking. meta-ads-analyzer explains why a Meta campaign behaves the way it does; answer-ads-questions reports what it did. ad-resize changes the shape of a finished ad; ad-delayer takes one apart. For Google, google-ads-copy writes the ad and google-ads-landing checks where it sends people.

## Common mistakes

- Writing creative before the brief exists. ad-management-intake records brand facts and the campaign brief first, so copy does not contradict the offer.
- Letting an agent estimate missing numbers. ads labels unavailable inputs MISSING rather than inventing a conversion rate.
- Judging a Meta ad set during the Learning Phase. meta-ads-analyzer checks Learning Phase status before it diagnoses anything.
- Testing without a hypothesis. ad-creative requires a test to name the metric, the comparison and the expected direction.
- Cropping a square ad into a story. ad-resize redoes the layout for each shape instead of cropping or stretching.
- Regenerating from scratch every week. ad-creative's iterate mode starts from performance data.

## Licenses, costs and checks before you install

All six picks are MIT licensed, an open license. Confirm the license file in each repository anyway.

Costs and credentials, from the files: ad-resize reads `BRIA_API_KEY`, documents `BRIA_ACCESS_TOKEN` and `REFRESH_TOKEN`, calls the network and includes a billing check in its setup, so Bria is a paid dependency. The other five picks list no credentials, no outside hosts and no bundled scripts; they work from the data and context you give them. Your ad spend runs through your own Google, Meta or LinkedIn accounts either way.

The directory has not security scanned any listed skill; its [trust page](https://skills.suedeai.ai/directory/trust/) explains what is and is not checked. Read each SKILL.md before you enable it, and read ad-resize's client script before you hand it a key.

## Related topics and stacks

The [Advertising](https://skills.suedeai.ai/directory/topics/ads/) topic lists 59 skills, [Copywriting](https://skills.suedeai.ai/directory/topics/copywriting/) lists 13, [Image Editing](https://skills.suedeai.ai/directory/topics/image-editing/) lists 11, and [Social and Marketing Images](https://skills.suedeai.ai/directory/topics/social-media-graphics/) lists 8. The [Marketing and SEO](https://skills.suedeai.ai/directory/marketing-seo/) category holds the rest.

Ads send people somewhere. The [landing page stack](https://skills.suedeai.ai/directory/stacks/landing-page/) covers that page, the [copywriting stack](https://skills.suedeai.ai/directory/stacks/copywriting/) covers the words around the ad, and the [video and creative stack](https://skills.suedeai.ai/directory/stacks/video-and-creative/) covers images and video.

## FAQ

### What is the best AI ad generator for Claude Code?

ad-creative (83/100), with about 139,000 installs recorded by skills.sh. It generates and iterates headlines, descriptions, primary text and full ad variations for any paid platform, works from performance data once you have it, and requires a falsifiable hypothesis for every test. Pair it with ads (83/100) for strategy and ad-resize (86/100) for placement sizes.

### Can Claude Code run AI Facebook ads?

It can prepare, write and diagnose them; you launch them. ad-management-intake writes the brand facts and brief for a Meta campaign, ad-creative writes the Facebook and Instagram copy, ad-resize produces story and feed sizes, and meta-ads-analyzer (84/100) diagnoses performance using Learning Phase, Auction Overlap and Creative Fatigue. You still launch and fund the campaign in your Meta account.

### Can these skills write AI Google Ads copy?

Yes. google-ads-copy generates Responsive Search Ad headlines, descriptions and variants and sets up A/B tests for click-through rate. ad-creative also covers Google responsive search ads in its platform specs, and ads covers Google Ads strategy, negative keywords, Performance Max and search terms reports. For API access, google-ads-api-quickstart is the alternative.

### Which ad skill should I install first?

ads, if you have not decided where to spend. It plans platform, structure, budget and targeting, and labels missing data rather than guessing. If the plan exists and you need creative, start with ad-creative instead. For a brand new to Meta, run ad-management-intake before either.

### Do these skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folders work in Claude Code, Codex, Cursor and other agents that read a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Are these paid ads skills free?

The skills are: all six are MIT licensed. ad-resize calls Bria's Ad Resize service, reads a `BRIA_API_KEY` and checks billing status during setup, so expect that step to be billed. The other five list no paid service in their files. Your ad spend is separate and runs through your own ad accounts.

### How do I install ad skills in Claude Code?

Run the six `npx skills add` commands from the install section above, one per skill. The skills CLI installs for Claude Code, Codex, Cursor and other agents. Set a `BRIA_API_KEY` before using ad-resize, keep your ad exports ready for meta-ads-analyzer, and read each SKILL.md before the first run.
