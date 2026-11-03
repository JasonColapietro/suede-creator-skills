# What is the best agent skill stack for shipping a landing page?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** for an AI landing page builder inside your coding agent, install [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) from agiwhitelist/auteur (89/100) to design and build the page, [analytics](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/analytics/) from coreyhaines31/marketingskills (88/100) to set up conversion tracking before launch, and [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) from pbakaus/impeccable (86/100) to fix hierarchy, typography and UX copy. Add [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) for search demand and a content brief, [ui-design](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-design/) for a defect audit, and [data-scientist](https://skills.suedeai.ai/directory/tronghieu/agent-skills/data-scientist/) to check the A/B test once traffic arrives. A landing page is a measurement problem as much as a design problem, and this stack covers both ends.

## The stack

Six skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) | [agiwhitelist/auteur](https://github.com/agiwhitelist/auteur) | 89/100 | Designs and builds complete web experiences, including landing pages and cinematic scroll-directed sites, as one consistent design system with generated assets. |
| [analytics](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/analytics/) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | Sets up, improves and audits analytics tracking, including GA4, conversion and event tracking, UTM parameters and tag manager implementation. |
| [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 87/100 | Audits and fixes technical SEO, researches search demand, creates content briefs, and measures SEO, AEO and GEO performance. |
| [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | 86/100 | Guides frontend and native interface design through focused playbooks for hierarchy, typography, accessibility, responsive layouts, motion and UX copy. |
| [data-scientist](https://skills.suedeai.ai/directory/tronghieu/agent-skills/data-scientist/) | [tronghieu/agent-skills](https://github.com/tronghieu/agent-skills) | 86/100 | Turns business questions into data analysis, validated models and decision-ready reports, including dataset profiling, A/B test checks and predictive modeling. |
| [ui-design](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-design/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 84/100 | Designs and builds React, Next and Tailwind UI, audits visual and interaction defects, and stress-tests components with worst-case data. |

## Who this stack is for

This stack is for anyone who has to put one page live and then prove it works: a founder launching a product, a marketer with a campaign date, a developer handed a brief and a deadline, a product team adding a pricing page. The job is the same each time. Build the page, measure it, fix it, and read the results honestly.

If you searched for an AI landing page generator, this is the agent-skill version of one. [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) produces the page, and the other five make it findable, polished and measurable. When someone else already built the page, start with [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) instead. For backend-only work, look elsewhere.

All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. A Claude Code landing page session and a Cursor one can run the same stack.

## The Suede AI skill built for this job

I built [suede-site-alchemy](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-site-alchemy) for exactly this job: turning landing, launch, campaign and product pages into measured conversion paths. It works through the funnel stage, friction, the hero, proof, calls to action, pricing and mobile QA, then sets up pre-registered experiments so the rules of the test are fixed before the first visitor arrives. It implements and verifies its changes within scope, so the output is a changed page, not a list of suggestions.

Start with it when a page already gets traffic and does not convert: the "fix this page that gets no signups" request, or more demos and sales from the visitors you already have. It owns the diagnosis and the conversion path, and that makes the stack below work harder. [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) and [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) get a specific list of what to build and fix, [analytics](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/analytics/) gets the events the experiments depend on, and [data-scientist](https://skills.suedeai.ai/directory/tronghieu/agent-skills/data-scientist/) gets a pre-registered test to read. SEO scores, AI citations and copy-only work go to other skills, so it stays on conversion.

It is Suede AI's skill, so it stays out of the ranking below. Install it first:

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-site-alchemy
```

## The skills, one by one

### auteur: the AI landing page builder in the stack

[auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) designs and builds complete web experiences from scratch: product and marketing pages, cinematic scroll-directed sites where the page is directed like a film, and multi-screen products built as one design system. For a landing page, the hero, sections, components and states come out in one style instead of a patchwork. It is the top-scoring pick at 89/100 (grade B), MIT licensed, with fewer than 1,000 installs recorded by skills.sh.

Its SKILL.md asks for a commit-sheet before any code, then sets out phases at a glance, banned patterns to rewrite rather than tweak, and a section titled "Verification is part of the build." The description says it gates every ship with an executable anti-slop linter and a screenshot verification loop, and generates its own assets through local CLIs: images, video frames, depth maps and 3D.

The files include 9 JavaScript scripts and reach four outside hosts: api.iconify.design, api.polyhaven.com, www.awwwards.com and www.pinterest.com. Read the SKILL.md's "Network access" section before the first run.

Reach for auteur when the page starts blank. Skip it for polishing a UI someone else built and for backend-only work, both of which its description excludes.

A first prompt can stay short:

```text
Build a landing page for our invoicing app. One audience (freelance designers), one offer (a free 30-day trial), one call to action. Fill in the commit-sheet before writing any code.
```

### analytics: conversion tracking before launch

[analytics](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/analytics/) sets up, improves and audits analytics tracking: GA4, conversion and event tracking, UTM parameters and tag manager implementation, with Mixpanel and Segment named among its triggers. It scores 88/100 (grade B), is MIT licensed, and has about 88,000 installs recorded by skills.sh.

The SKILL.md opens with an initial assessment and seven core principles, including "Track for Decisions, Not Data," "Compute, Don't Eyeball" and "Match Observation Windows." A tracking plan framework, an object-action event naming convention and a list of essential events follow. Reference files cover an event library, GA4 implementation and GTM implementation. It bundles no scripts, and its files list no outside hosts.

One line in its description deserves a place above your desk: rate metrics divide matching closed windows, never full-period spend by partial-period results. Follow it and your launch-week conversion rate stays honest.

Use it before you buy a single click. It hands attribution models to the [attribution](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/attribution/) skill and test measurement to [ab-testing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ab-testing/), so it stays focused on whether events fire and are named well.

Ask it for the plan before the code:

```text
Write a tracking plan for this landing page: GA4 events for hero CTA clicks, form starts and form submits, object-action event names, and UTM rules for our three launch channels.
```

### seo: search demand and the content brief

[seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) from mblode/agent-skills audits and fixes technical SEO, researches search demand, creates content briefs, and measures SEO, AEO and GEO performance. It scores 87/100 (grade B), is MIT licensed, and has fewer than 1,000 installs recorded by skills.sh.

The directory has no full page for this skill yet, so its files are not summarized here. Read its SKILL.md in the repository before you rely on it for keyword data, because that is where any data source it expects will be named.

On a landing page, I run it before a single headline is written. Research the demand for the terms the page has to win, then have it write a brief: the questions people type and the order they need answers in. The brief becomes the section order. Its description routes article writing to a sibling skill, ghostwriter, and visual redesign to [ui-design](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-design/), so it stays on research, audits and measurement.

Skip it for a page that will only ever receive paid traffic. Use it for any page you want to rank or be cited in AI answers.

Start with the brief:

```text
Research search demand for "invoicing app for freelancers" and close variants, then write a content brief for a landing page: target query, questions to answer, section order and title options.
```

### impeccable: hierarchy, typography and UX copy

[impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) guides frontend and native interface design through focused playbooks for hierarchy, typography, accessibility, responsive layouts, motion and UX copy. It scores 86/100 (grade B), is Apache-2.0 licensed, and is the most installed skill in this stack by a wide margin, with about 379,000 installs recorded by skills.sh.

The SKILL.md itself is short: Setup, How to design, Modes and Commands. The depth sits in reference playbooks with names like adapt, animate, audit, bolder, clarify, colorize, component-review and craft-floor, plus native variants for iOS and Android. It bundles 5 JavaScript scripts, and the directory's file summary flags network calls without naming an outside host.

Its description covers designing, critiquing, auditing, polishing, simplifying and hardening an interface, and capturing a design system in DESIGN.md and tokens. It can make a bland page bolder or a loud one quieter. I run it after [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) as a second pair of eyes with a different playbook.

Use it whenever a page exists, whoever built it. Do not use it for backend-only or non-UI tasks.

Point it at the weakest part of the page:

```text
Audit this landing page for hierarchy and typography. The hero headline and the pricing table compete for attention. Fix the hierarchy first, then tighten the CTA copy.
```

### data-scientist: reading the A/B test

[data-scientist](https://skills.suedeai.ai/directory/tronghieu/agent-skills/data-scientist/) acts as an end-to-end data scientist: it turns business questions into analysis, validated models and decision-ready reports. For a landing page, the part that matters is testing whether a difference is real: A/B tests, "is this significant?" and "how many samples do I need?". It scores 86/100 (grade B), is MIT licensed, and has fewer than 1,000 installs recorded by skills.sh.

The SKILL.md runs through non-negotiables, four framing questions, flow routing, a review gate, workspace rules, bundled scripts and a reference map. It bundles 3 Python scripts, its files list no outside hosts or network calls, and its checklists cover analysis review, data quality and leakage. It reads CSV, Parquet and Excel files, and it triggers in any language, with Vietnamese and Chinese READMEs alongside the main one.

Use it once real traffic exists. A test called on a few dozen visits is a guess. If you need to design the test rather than read it, [ab-testing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ab-testing/) in the alternatives below is the closer fit.

Give it the export and the question:

```text
Here is a CSV export of our two landing page variants: visits, form starts and signups per day. Is variant B's lift significant, and if not, how many more visitors do we need?
```

### ui-design: defect audit and worst-case stress tests

[ui-design](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-design/) designs and builds React, Next and Tailwind UI, audits visual and interaction defects, and stress-tests components with worst-case data. It scores 84/100 (grade B), is MIT licensed, and has about 1,000 installs recorded by skills.sh.

The SKILL.md is built around modes. Direction mode picks a track and loads marketing references for conversion pages only. Extract, Build, Audit (with a defined deslop scope) and Break follow, then a quality bar and a verify step. Files include direction/cro.md, direction/marketing-ui.md and add-dark-mode.md. It bundles no scripts and lists no outside hosts.

Its trigger phrases include "build a landing page" and "remove UI slop," so on a React or Next codebase it can serve as the builder too. In this stack I use it for Audit and Break after [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) and [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/). Break mode is the one most teams skip: it shows what happens when the headline is twice as long as planned, the testimonial has no photo, or the price has six digits.

Run it against the real component, not a screenshot:

```text
Break the pricing section of this Next.js landing page. Show me the worst case for long plan names, missing logos, and prices with six digits, then fix what breaks.
```

## How to use the stack together

1. Start with [**seo**](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) before you write a word. Research the search demand for the terms the page has to win and have it write a content brief, so the headline and the section order answer what people actually type.
2. Hand the brief to [**auteur**](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) and let it build the page as one design system with its generated assets. Keep the brief tight: one offer, one call to action, one audience.
3. Run [**impeccable**](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) over the result. Hierarchy, typography and UX copy are where most first drafts of a landing page fall down. Fix the hierarchy before you touch a color.
4. If the page is React, Next or Tailwind, have [**ui-design**](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-design/) audit the visual and interaction defects and stress-test the components with worst-case data.
5. Before launch, use [**analytics**](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/analytics/) to set up GA4 events, UTM parameters for every campaign link and the tag manager. A page you cannot measure is not finished.
6. Once traffic arrives, give [**data-scientist**](https://skills.suedeai.ai/directory/tronghieu/agent-skills/data-scientist/) the numbers. It covers dataset profiling and A/B test checks, so you can tell a real lift from noise before you declare a winner.
7. A few weeks after launch, run **seo** again to measure SEO, AEO and GEO performance against the brief. Send whatever underperforms back to **impeccable**.

## Install the stack

```bash
npx skills add https://github.com/agiwhitelist/auteur
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/analytics
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/seo
npx skills add https://github.com/pbakaus/impeccable/tree/main/cursor-plugin/skills/impeccable
npx skills add https://github.com/tronghieu/agent-skills/tree/main/skills/data-scientist
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/ui-design
```

The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [cro](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#cro) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | The page already exists and the problem is conversion, not craft: low conversion rates, pricing pages, lead capture and contact forms. |
| [ab-testing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ab-testing/) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | You need to design the test, not read it: a hypothesis, sample size, and primary, secondary and guardrail metrics. |
| [paywalls](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#paywalls) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | The "landing page" is really an in-app upgrade screen, upsell modal or feature gate for users who have already seen value. |
| [google-analytics-data-api-basics](https://skills.suedeai.ai/directory/google/skills/#google-analytics-data-api-basics) | [google/skills](https://github.com/google/skills) | 87/100 | You want GA reports pulled through the Analytics Data API; it does not install front-end tracking. |
| [attribution](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/attribution/) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 83/100 | Your ad platforms and GA disagree about what drove the signup, or conversions happen on a third-party booking domain. |

My rule: keep the pick when the job is building, and reach for the alternative when the job is diagnosing. cro asks why a live page is not converting; ab-testing designs a test before a visitor arrives.

## Common mistakes

- Writing the headline before researching demand. Run [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) first so the page answers the query people type.
- Launching without events. [analytics](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/analytics/) belongs before launch, not after the first ad invoice.
- Calling a test after a weekend. [data-scientist](https://skills.suedeai.ai/directory/tronghieu/agent-skills/data-scientist/) checks significance and sample size, so a lucky Saturday does not become the new control.
- Fixing colors before hierarchy. [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) playbooks start from hierarchy and typography, which is where a confused visitor leaves.
- Testing only with the copy you planned. The Break mode in [ui-design](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-design/) feeds the page worst-case data before a real customer does.

## Licenses, costs and checks before you install

Licenses: [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/), [analytics](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/analytics/), [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo), [data-scientist](https://skills.suedeai.ai/directory/tronghieu/agent-skills/data-scientist/) and [ui-design](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-design/) are MIT, and [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) is Apache-2.0. All six are open, but confirm each repository's license file before you ship work built from bundled assets.

Services: analytics works on GA4 and tag manager, so it needs access to those properties. auteur's files reach api.iconify.design, api.polyhaven.com, www.awwwards.com and www.pinterest.com, and impeccable's file summary flags network calls. None of the files the directory summarized read an environment variable. seo's files are not summarized, so check its SKILL.md for any data source it expects.

The directory scores structure and evidence in a skill's files, as its [methodology](https://skills.suedeai.ai/directory/methodology/) explains. It has not security scanned any listed skill, as the [trust page](https://skills.suedeai.ai/directory/trust/) explains. Read each SKILL.md and its bundled scripts before you enable it.

## Related topics and stacks

For more options, browse the [Landing Pages and Conversion](https://skills.suedeai.ai/directory/topics/landing-pages/) topic (18 listed skills), [Marketing Analytics](https://skills.suedeai.ai/directory/topics/marketing-analytics/) (19), [Website Builders](https://skills.suedeai.ai/directory/topics/website-builders/) (3), [SEO](https://skills.suedeai.ai/directory/topics/seo/) (103) and [React and Next.js](https://skills.suedeai.ai/directory/topics/react-nextjs/) (30), or the whole [Frontend and Design](https://skills.suedeai.ai/directory/frontend-design/) category.

Three stacks pair well with this one. The [SEO and AI search stack](https://skills.suedeai.ai/directory/stacks/seo-and-ai-search/) goes deeper on ranking and citations, the [UI design stack](https://skills.suedeai.ai/directory/stacks/ui-design/) covers the rest of the product, and the [copywriting stack](https://skills.suedeai.ai/directory/stacks/copywriting/) handles the words on the page.

## FAQ

### What is the best AI landing page builder skill for Claude Code?

[auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) from agiwhitelist/auteur, at 89/100 the highest-scoring pick in this stack. It builds the page from scratch as one design system and gates every ship with an anti-slop linter and a screenshot verification loop. Pair it with [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) for polish and [analytics](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/analytics/) for tracking, because a builder alone does not tell you whether the page converts.

### Do I need all six skills?

No. [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/), [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) and [analytics](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/analytics/) are the core: build, polish, measure. Add [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) when the page has to rank as well as convert, [ui-design](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-design/) when the stack is React or Next, and [data-scientist](https://skills.suedeai.ai/directory/tronghieu/agent-skills/data-scientist/) when you are running a test and want the result checked rather than eyeballed.

### Do these skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them.

### Which one should I install first if I only install one?

[auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/), because it produces the page and is the highest-scoring pick here at 89/100. [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/), the most installed of the six with about 379,000 installs recorded by skills.sh, comes second: a built page with a weak hierarchy still loses the visitor. Add [analytics](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/analytics/), at about 88,000 installs, before you buy traffic.

### Is an AI landing page generator enough on its own?

Not for a page that has to earn money. A generator gives you a page; it does not tell you whether visitors convert or whether a variant really won. That is why this stack pairs [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) with [analytics](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/analytics/) for GA4 and event tracking and [data-scientist](https://skills.suedeai.ai/directory/tronghieu/agent-skills/data-scientist/) for A/B test checks.

### Are these landing page skills free?

All six are published under open licenses: five MIT and [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) Apache-2.0. The services some of them touch are a separate matter: [analytics](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/analytics/) needs access to your GA4 and tag manager properties, and the files of [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) call outside hosts such as api.iconify.design and api.polyhaven.com. Check each SKILL.md before you run it on client work.

### How do I install the landing page stack in Claude Code?

Run the six `npx skills add` commands from the install section above, one per skill. The [skills CLI](https://skills.sh/) installs into Claude Code, Codex, Cursor and other agents, and each skill's directory page lists copy-by-hand routes if you would rather not run npx.
