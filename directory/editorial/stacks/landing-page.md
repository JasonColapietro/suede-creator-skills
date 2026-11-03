# What is the best agent skill stack for shipping a landing page?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 2, 2026.

**Short answer:** install [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) from agiwhitelist/auteur (89/100) to design and build the page, [analytics](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/analytics/) from coreyhaines31/marketingskills (88/100) to set up conversion tracking before launch, and [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) from pbakaus/impeccable (86/100) to fix hierarchy, typography and UX copy. Add seo for search demand and a content brief, ui-design for a defect audit, and data-scientist to check the A/B test once traffic arrives. A landing page is a measurement problem as much as a design problem, and this stack covers both ends.

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

## How to use it

1. Start with **seo** before you write a word. Research the search demand for the terms the page has to win and have it write a content brief, so the headline and the section order answer what people actually type.
2. Hand the brief to **auteur** and let it build the page as one design system, with its generated assets and, if you want a longer page, the cinematic scroll direction it supports. Keep the brief tight: one offer, one call to action, one audience.
3. Run **impeccable** over the result. Its playbooks cover hierarchy, typography, accessibility, responsive layouts, motion and UX copy, which is where most first drafts of a landing page fall down. Fix the hierarchy before you touch a color.
4. If the page is React, Next or Tailwind, have **ui-design** audit the visual and interaction defects and stress-test the components with worst-case data, such as a headline twice as long as the one you planned.
5. Before launch, use **analytics** to set up GA4, conversion and event tracking, UTM parameters for every campaign link, and the tag manager implementation. A page you cannot measure is not finished.
6. Once traffic arrives, give **data-scientist** the numbers. It covers dataset profiling and A/B test checks, so you can tell a real lift from noise before you declare a winner.

## Install the stack

```bash
npx skills add https://github.com/agiwhitelist/auteur
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/analytics
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/seo
npx skills add https://github.com/pbakaus/impeccable/tree/main/cursor-plugin/skills/impeccable
npx skills add https://github.com/tronghieu/agent-skills/tree/main/skills/data-scientist
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/ui-design
```

The [skills CLI](https://skills.sh/) works for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## What to check before you install

- Licenses: auteur, analytics, seo, data-scientist and ui-design are MIT, and impeccable is Apache-2.0. All permissive, but confirm the license file in each repository before you ship anything built from a skill's bundled assets.
- Services: analytics works on GA4 and tag manager, which means access to those properties and the right to change them.
- Read each SKILL.md before you enable it. The directory scores structure and evidence in a skill's files; it has not security scanned any skill.

## FAQ

### Do I need all six skills?

No. auteur, impeccable and analytics are the core: build, polish, measure. Add seo when the page has to rank as well as convert, ui-design when the stack is React or Next, and data-scientist when you are running a test and want the result checked rather than eyeballed.

### Do these skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Which one should I install first if I only install one?

auteur, because it produces the page and it is the highest-scoring pick here at 89/100. impeccable is the most installed of the six, with about 379,000 installs recorded by skills.sh, and it is the one I would add second: a built page with a weak hierarchy still loses the visitor. analytics, at about 88,000 installs, is the one to add before you buy traffic.
