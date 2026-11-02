# What is the best agent skill stack for content and social posts?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 2, 2026.

**Short answer:** [ghostwriter](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/) from mblode/agent-skills (87/100) drafts, rewrites and critiques posts, messages and docs in your voice with the machine tells stripped, and [line-editing](https://skills.suedeai.ai/directory/danjdewhurst/story-skills/line-editing/) from danjdewhurst/story-skills (90/100) polishes the result at the sentence level. [linkedin-profile-optimizer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-profile-optimizer/) from sergebulaev/linkedin-skills (94/100) is the highest-scoring skill in the set and fixes the profile every post points back to. Add contagious for the angle, seo-plan for the plan, and co-marketing for distribution partners.

## The stack

Six skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [linkedin-profile-optimizer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-profile-optimizer/) | [sergebulaev/linkedin-skills](https://github.com/sergebulaev/linkedin-skills) | 94/100 | Audits and rewrites a LinkedIn profile end-to-end, covering headline, About section, Featured, banner, photo, Experience metrics, skills, custom URL and recommendations. |
| [co-marketing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/co-marketing/) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 90/100 | Finds co-marketing partners, plans joint campaigns and brainstorms partnership opportunities, including partner marketing, integration marketing and cross-promotion. |
| [line-editing](https://skills.suedeai.ai/directory/danjdewhurst/story-skills/line-editing/) | [danjdewhurst/story-skills](https://github.com/danjdewhurst/story-skills) | 90/100 | Edits and polishes prose at the line level, covering copyediting, proofreading, tightening sentences, and grammar and punctuation checks. |
| [ghostwriter](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 87/100 | Writes, rewrites and critiques messages, posts, tickets, PRDs and docs in the user's or company's voice, with machine tells stripped. |
| [seo-plan](https://skills.suedeai.ai/directory/agricidaniel/claude-seo/seo-plan/) | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | 83/100 | Builds strategic SEO plans for new or existing websites, with industry templates, competitive analysis, content strategy and an implementation roadmap. |
| [contagious](https://skills.suedeai.ai/directory/wondelai/skills/contagious/) | [wondelai/skills](https://github.com/wondelai/skills) | 81/100 | Engineers word-of-mouth and virality using the STEPPS framework of Social Currency, Triggers, Emotion, Public, Practical Value and Stories. |

## How to use it

1. Plan with **seo-plan**. It builds a strategic SEO plan with industry templates, competitive analysis, a content strategy and an implementation roadmap. Decide the topics for the quarter before you write a line, or the posts will chase whatever happened that morning.
2. Shape each piece with **contagious**. It works through the STEPPS framework: Social Currency, Triggers, Emotion, Public, Practical Value and Stories. Pick one or two per post. A post that tries all six has no point.
3. Draft with **ghostwriter**. It writes, rewrites and critiques in your voice or the company's, with machine tells stripped. Ask it to critique your own draft before you ask it to write one; the critique is often the more useful output. Give it your best three posts as the voice sample, not your last three.
4. Polish with **line-editing**: copyediting, proofreading, tightening sentences, and grammar and punctuation checks. This is the pass that separates a post that reads like a person from one that reads like a template.
5. Fix the destination with **linkedin-profile-optimizer**. Every post sends people to a profile, and it audits and rewrites the whole thing: headline, About, Featured, banner, photo, Experience metrics, skills, custom URL and recommendations.
6. Find reach with **co-marketing**. It finds partners, plans joint campaigns and brainstorms cross-promotion and integration marketing, which is the distribution most solo content plans forget.

## Install the stack

```bash
npx skills add https://github.com/sergebulaev/linkedin-skills/tree/main/skills/linkedin-profile-optimizer
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/co-marketing
npx skills add https://github.com/danjdewhurst/story-skills/tree/main/skills/line-editing
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/ghostwriter
npx skills add https://github.com/AgriciDaniel/claude-seo/tree/main/skills/seo-plan
npx skills add https://github.com/wondelai/skills/tree/main/contagious
```

The [skills CLI](https://skills.sh/) works for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## What to check before you install

- Licenses: all six are MIT. Confirm the license file in each repository anyway; a directory field is a record, not a legal review.
- Services: none of the six summaries names an outside API. The LinkedIn changes are ones you apply yourself in your own account. The voice skills work on what you give them, so keep real samples of your writing on hand.
- Read each SKILL.md before you enable it. The directory has not security scanned any skill, and a writing skill is still instructions you are handing to an agent with access to your files.

## FAQ

### Will the posts sound like AI wrote them?

ghostwriter's summary says it strips machine tells, and line-editing tightens what remains. Neither replaces reading the post aloud before it goes out. If a sentence is one you would not say to a customer across a table, cut it. The machine tells are the easy part; the hard part is having something to say.

### Do these skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Do any of these skills publish the posts?

No. None of the six summaries mentions scheduling or posting; they produce text. Publish through whatever tool you already use, and keep the drafts in your repository so you have a record of what went out and what it did. co-marketing, with about 84,000 installs recorded by skills.sh, is the most installed skill here, which says something about where the hard part of content really is: not the writing, the reach.
