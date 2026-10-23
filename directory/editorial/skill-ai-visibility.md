# How to Get Your Agent Skill Found in Search and Cited by AI Assistants

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed October 23, 2026. Figures come from the Agent Skills Directory snapshot of October 19, 2026.

**Short answer:** a skill gets found in two places. Agents pick it from its `description`, so write that line as a precise answer to "when should I use this?" with a boundary and an example phrase. People and AI assistants find it on the web, so give it a crawlable home (the README or a docs page) that answers the question in its first lines, get it listed in the directories and curated lists that search engines and models already read, and link those listings back to your repository with a badge. Then measure what changed.

## Why does discoverability matter for a skill?

There are thousands of public skills. The Agent Skills Directory alone lists 3,798 from 159 repositories after filtering. A skill nobody finds does not get installed, and a skill an agent never selects does not get used, however good its instructions are.

## What makes an agent choose your skill?

The description. Claude Code loads every installed skill's description at the start of a session and reads the body only when the description matches the task. Three things in that one line do most of the work:

1. **A trigger.** Say when to use the skill, in the words people actually type.
2. **A boundary.** Say when *not* to use it and which skill to use instead. In the directory snapshot, only 13.5% of listed skill descriptions do this.
3. **An example phrase.** Quote a request that should fire the skill. Only 25.2% of listed descriptions include one.

Both the boundary and the example earn points in the directory's [0–99 quality score](https://skills.suedeai.ai/directory/methodology/), because they make selection more reliable.

## What else raises a skill's quality score?

The directory publishes every component. The ones fully in a publisher's control:

- Pass the structural checks: frontmatter on line one, a lowercase hyphenated `name` that matches the folder, a 50 to 1,024 character description that says when to use it, a body of 500 lines or fewer, a declared license.
- Keep the body between 500 and 3,000 words, and move detail into reference files (47.1% of listed skills bundle references).
- Declare `allowed-tools` (14.7% do) and `compatibility` (13.9% do).
- Commit regularly. Full recency points go to repositories with a commit in the 30 days before the snapshot, and the credit steps down to zero after a year.

Skills scoring 80 to 99 get two README quality shields. Skills below 80 get a list of their largest open points on their listing page.

## How do search engines and AI assistants find skills?

Mostly through pages that already rank: GitHub repositories, curated "awesome" lists, skill directories and documentation sites. The Agent Skills Directory itself is built from eight curated lists plus accepted listing requests.

For Google, the rules are the same as for any page. Google Search Central says there are no additional requirements to appear in AI Overviews or AI Mode: the page must be indexed and eligible to show with a snippet, and no special schema.org markup is required. ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features))

What makes a page easy for a model to cite is the same thing that makes it easy for a person to skim: a direct answer at the top, question-shaped headings, specific facts, and the same product name everywhere.

## What should your skill's README include?

- One sentence at the top that says what the skill does and for whom.
- Copy-ready install commands for the agents you support.
- Two or three example prompts.
- What the skill reads, runs and sends: scripts, credentials, outside hosts.
- The license.
- Your directory badge, linked to your listing.

That last item closes a loop: your README links to an independent listing, the listing links back to your source, and both pages tell crawlers and models the same facts about the skill.

## How do I claim my listing and add the badge?

1. Find your skill in the [Agent Skills Directory](https://skills.suedeai.ai/directory/). If it is not there, [request a free listing](https://skills.suedeai.ai/directory/submit/).
2. Copy the badge snippet from your listing page. Every listed skill has one. Skills scoring 80 to 99 get a numeric and a letter quality shield.
3. Add it to your README. Each badge links to your listing.
4. Request badge verification. While the feature offer is open, eligible skills with a verified badge can receive a featured placement.

## Is there a quick way to check my skill's visibility?

Yes. The **Skill AI-visibility check** looks up your skill in the directory and shows its listing status, its score, the points it is missing, and a short checklist for the page where people will find it. It runs in your browser and sends nothing to Suede AI.

Run the [Skill AI-visibility check](https://skills.suedeai.ai/directory/check/).

## When should a team bring in help?

When the skill is part of a product, and the product needs to show up when buyers ask ChatGPT, Perplexity, Claude or Google for a recommendation. That goes past one README: it is your docs, your comparison pages, your entity consistency across the web, and measurement of which answers cite you.

Suede AI's [AEO, GEO and SEO team](https://suedeai.agency/?utm_source=skills.suedeai.ai&utm_medium=guide&utm_campaign=skill-ai-visibility&utm_content=help-section) does that work for companies. [Talk to Suede AI about AI visibility](https://suedeai.agency/?utm_source=skills.suedeai.ai&utm_medium=guide&utm_campaign=skill-ai-visibility&utm_content=help-section-cta).

## FAQ

### How do I get my skill listed in the Agent Skills Directory?

Submit the repository and the exact skills through the [listing form](https://skills.suedeai.ai/directory/submit/). A skill is listed when it passes required frontmatter, at least six of the seven graded checks and the license check, and meets the directory's license, policy, language and duplication rules.

### Does a higher score mean my skill ranks higher in Google?

No. The score measures structural evidence in the skill's files. It does show where a skill is likely to be skipped by an agent or a reader, and the fixes it suggests (clear description, boundary, example phrase) also make the skill easier to cite.

### Does llms.txt help AI assistants find my skill?

It can help agents and tools that read it find your documentation. Google states that no special file or markup is needed for its AI features. Treat llms.txt as a convenience for agent tooling, alongside a well-structured, indexable page.

### Why is my skill not on the directory?

The directory reads skills from its curated source lists and accepted listing requests. If your repository is in neither, request a listing. If your repository is listed but one skill is missing, that skill most likely missed a listing rule; the [methodology page](https://skills.suedeai.ai/directory/methodology/) lists every rule, and the listing form can request a fresh review.

### Can I remove my skill from the directory?

Yes. Use the same listing form to request a correction or removal.

## Quotable facts

- 13.5% of the 3,798 listed skills state when not to use them in their description (snapshot of October 19, 2026).
- 25.2% of listed skills quote an example trigger phrase in their description.
- 47.1% bundle reference files; 14.7% declare `allowed-tools`; 13.9% declare `compatibility`.
- The highest score in the snapshot is 95/100, and the median is 78.
- 125 listed skills earn an A grade (90–99).
