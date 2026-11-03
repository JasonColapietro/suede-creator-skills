# Which agent skills make the best AI copywriting tool for Claude Code?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** for AI copywriting inside your coding agent, install [copywriting](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copywriting) from coreyhaines31/marketingskills (86/100) to write page copy whose claims you can support, and [copy-editing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copy-editing) from the same repository (88/100) to tighten what you already have and strip AI tells. Add [ad-creative](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/) (83/100) when the copy is paid ads. The rest are situational: google-ads-copy for Responsive Search Ads, ogilvy-copywriting for a classic advertising review, and the infrasity copywriting skill as a second drafter.

## The stack

Six skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [copy-editing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copy-editing) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | Edits, reviews and refreshes existing marketing copy, removing AI tells and making point edits when only one line needs fixing. |
| [copywriting](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copywriting) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 86/100 | Writes, rewrites and improves marketing copy for any page, with supportable claims and no AI tells. |
| [ad-creative](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 83/100 | Generates, iterates and scales ad creative, including headlines, descriptions, primary text and full ad variations, for any paid advertising platform. |
| [copywriting](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/#copywriting) | [infrasity-labs/dev-gtm-claude-skills](https://github.com/infrasity-labs/dev-gtm-claude-skills) | 80/100 | Writes, rewrites and improves marketing copy for homepages, landing, pricing, feature, about and product pages. |
| [google-ads-copy](https://skills.suedeai.ai/directory/nowork-studio/notfair/google-ads-copy/) | [nowork-studio/NotFair](https://github.com/nowork-studio/NotFair) | 76/100 | Generates and A/B tests Google Ads copy, including headlines, descriptions, ad variants and Responsive Search Ad components, to improve click-through rate. |
| [ogilvy-copywriting](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/#ogilvy-copywriting) | [infrasity-labs/dev-gtm-claude-skills](https://github.com/infrasity-labs/dev-gtm-claude-skills) | 74/100 | Applies David Ogilvy's advertising principles when writing or reviewing headlines, product descriptions, landing pages, ads and emails. |

## Who this stack is for

This stack is for people who write words that have to sell: a founder writing a homepage, a product marketer rewriting a pricing page, a growth lead who needs fifty ad variations by Friday, an agency writer who wants a fast first draft and a stricter editor. It also suits developers who end up writing their own landing page copy and want the agent to do it with some discipline.

The stack splits the job three ways. Writing new page copy goes to [copywriting](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copywriting). Improving copy that already exists goes to [copy-editing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copy-editing). Paid ads go to [ad-creative](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/) and [google-ads-copy](https://skills.suedeai.ai/directory/nowork-studio/notfair/google-ads-copy/). [ogilvy-copywriting](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/#ogilvy-copywriting) and the second [copywriting](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/#copywriting) skill are there for review and comparison.

If you searched for an AI copywriting tool, the difference here is the rules built into the descriptions: claims must be supportable, AI tells are banned by name, and a one-line fix stays a one-line fix. Those rules are what I want from Claude copywriting.

All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md.

## The Suede AI skill built for this job

I built [suede-copy](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-copy) for exactly this job: writing, sharpening and retuning conversion copy, public explainers and agent-facing docs across surfaces. It is the skill to call when someone says "rewrite this landing page." It applies voice rules, copy frameworks, labeled variants, answer-first SEO and AEO, evidence boundaries and a 70-point ship score, so you choose between labeled drafts and every claim stays inside the evidence.

Start with it when the copy has to convert and be found at once: a landing page, a pricing page, a product explainer, a docs page an agent will read. It owns voice, evidence and the ship score, and that makes the stack below work harder. [copy-editing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copy-editing) gets a draft that already respects evidence boundaries, so its pass is about tightening. [ad-creative](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/) gets labeled variants to turn into ads, and [ogilvy-copywriting](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/#ogilvy-copywriting) gets a finished page to review. A standalone anti-slop pass, high-stakes research orchestration, visual design and scored SEO audits go to other skills.

It is Suede AI's skill, so it stays out of the ranking below. Install it first:

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-copy
```

## The skills, one by one

### copy-editing: tightening copy you already have

[copy-editing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copy-editing) edits, reviews and improves existing marketing copy and refreshes outdated content. It is the top-scoring pick at 88/100 (grade B), MIT licensed, with about 154,000 installs recorded by skills.sh.

Its triggers are the phrases people type when a draft is close but not right: "proofread," "polish this," "copy sweep," "tighten this up," "too wordy," "sharpen the messaging," "this content is outdated" and "content audit." It also answers "this sounds like AI," "AI slop" and "make it sound human."

Two rules in its description make it more than a proofreader. Every edit removes AI tells by name: "it's not X, it's Y" reveals, "no X, no Y, no Z" lists, and sentences that trail into extra comma clauses. And a request to fix one line gets a point edit that changes only that line, which matters when the rest of the page is already approved.

The directory has no full page for copy-editing yet, so its files are not summarized here. Read the SKILL.md in the repository before you run a full content audit with it.

Use it whenever copy exists. If you are starting from a blank page, its description sends you to [copywriting](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copywriting) instead.

Ask for a sweep with limits:

```text
Run a copy sweep on this pricing page. Cut it by 20 percent, remove any AI tells, and do not touch the plan names or the prices.
```

### copywriting: page copy with supportable claims

[copywriting](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copywriting) from coreyhaines31/marketingskills writes, rewrites and improves marketing copy for homepages, landing pages, pricing pages, feature pages, about pages and product pages. It scores 86/100 (grade B), is MIT licensed, and is the most installed skill in this stack, with about 242,000 installs recorded by skills.sh.

It covers the pieces of a page that carry the most weight: headlines, CTA copy, the value proposition, taglines and hero section copy. Its description adds three rules I would want from any human copywriter. Drafts never use the AI tells listed above. Claims must be supportable, and a declined claim names the evidence it would need. And it diagnoses the input first, as a blank brief, a real voice or a point edit, then changes only what that input calls for.

The routing is clear too. Email copy goes to a sibling emails skill, popup copy to popups, editing existing copy to [copy-editing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copy-editing), and the offer underneath the copy (bonuses, guarantees, value framing) to offers.

The directory has no full page for this skill yet, so its files are not summarized here.

Use it for new pages and full rewrites. For a tweak to an approved page, copy-editing is the better tool.

Give it the brief and the proof:

```text
Write hero, features and CTA copy for our bookkeeping app's homepage. Audience: solo agency owners. Proof we have: 4.8 rating, SOC 2 report. Decline any claim we cannot back.
```

### ad-creative: ad copy at volume, grounded in data

[ad-creative](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/) generates, iterates and scales ad creative: headlines, descriptions, primary text and full ad variations for any paid advertising platform. It scores 83/100 (grade B), is MIT licensed, and has about 139,000 installs recorded by skills.sh.

The SKILL.md starts with five things to establish before writing: platform and format, product and offer, audience and intent, performance data when iterating, and constraints. It then works in four modes: generate from scratch, iterate from performance data, scaled static batches that stay grounded in inputs, and a creative strategy loop. Platform specs cover Google Ads Responsive Search Ads, Meta ads and LinkedIn ads. References include a hook system, awareness-level headlines, Meta creative formats and motion video ads, and an HTML template for a creative review page. It bundles no scripts and lists no outside hosts.

One rule stands out: test hypotheses must be falsifiable, naming the metric, the comparison and the expected direction. That turns "let's test some headlines" into a test you can lose.

Use it for any paid channel. Campaign strategy and targeting go to a sibling ads skill, and landing page copy goes back to [copywriting](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copywriting).

Iterate from what already ran:

```text
Here are last month's Meta ads with CTR and CPA. Keep the two best hooks, write eight new variations of primary text, and state a falsifiable hypothesis for each test.
```

### copywriting from infrasity-labs: a second drafter

[copywriting](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/#copywriting) from infrasity-labs/dev-gtm-claude-skills writes, rewrites and improves marketing copy for homepages, landing pages, pricing pages, feature pages, about pages and product pages. It scores 80/100 (grade B), is MIT licensed, and has fewer than 1,000 installs recorded by skills.sh.

Its triggers overlap with the coreyhaines31 skill of the same name, with a few of its own: "subheadline," "above the fold" and "make this more compelling." It applies whenever someone works on website text that needs to persuade or convert, and it routes email copy elsewhere.

The difference is in what the description promises. The coreyhaines31 version spells out banned AI tells, a supportable-claims rule and an input diagnosis; this one does not mention them. That is why I use it as a second drafter: run it for a variant written from different instructions, then let [copy-editing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copy-editing) hold both drafts to one standard.

The directory has no full page for this skill yet, so its files are not summarized here. Read its SKILL.md before you rely on it.

Install the two side by side only if you will compare drafts. Two skills with the same name and similar triggers can both match one request, so be explicit about which one you want.

Name the skill when you ask:

```text
Using the infrasity-labs copywriting skill, write an alternative above-the-fold section for this landing page: headline, subheadline and one CTA. Keep it under 40 words.
```

### google-ads-copy: Responsive Search Ad components

[google-ads-copy](https://skills.suedeai.ai/directory/nowork-studio/notfair/google-ads-copy/) from nowork-studio/NotFair generates and A/B tests Google Ads copy: headlines, descriptions, ad variants and Responsive Search Ad (RSA) components, with the goal of a better click-through rate. It scores 76/100 (grade C) and is MIT licensed. It has no install count on skills.sh.

Its triggers are narrow and specific: "ad copy," "write ads," "RSA," "responsive search ad," "improve CTR," "ad A/B test," "ad variants" and "ad variation experiment," plus any request to improve click-through rate on existing ads. Its files are a single SKILL.md, with no bundled scripts, no environment variables and no outside hosts.

I include it because Google search ads are their own discipline. [ad-creative](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/) covers RSAs among many platforms; google-ads-copy does nothing else, which makes it a good second opinion on a search campaign where every headline slot counts.

Use it for Google search campaigns, especially when the existing ads have a CTR problem and you want variants built as a test rather than a pile of headlines. For Meta, LinkedIn or video, stay with ad-creative.

Give it the current ads and the metric:

```text
Our RSA for "invoice software" has a 2.1 percent CTR. Write 15 new headlines and 4 descriptions, group them into two variants, and tell me what each variant tests.
```

### ogilvy-copywriting: a classic advertising review

[ogilvy-copywriting](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/#ogilvy-copywriting) applies David Ogilvy's advertising principles when writing or reviewing copy, headlines, product descriptions, landing pages, ads, emails or any persuasive text. It scores 74/100 (grade C), is MIT licensed, and has fewer than 1,000 installs recorded by skills.sh.

Its description names its sources: *How to Create Advertising That Sells* (1972) and *Ogilvy on Advertising*. It covers positioning, headlines, promises, brand voice, long-form copy and visual logic, and it states its goal plainly: copy that sells, not copy that wins awards.

I use it as a reviewer rather than a writer. Hand it a finished page and ask whether the headline carries a promise, whether the positioning is clear, and whether the long-form sections earn their length. A review against a fixed, named set of principles catches different problems than a general edit.

The directory has no full page for this skill yet, so its files are not summarized here.

Use it on headlines, product descriptions and long-form sales pages. It adds less on short UI copy, where [copy-editing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copy-editing) is the better fit.

Ask for a review, not a rewrite:

```text
Review this landing page against Ogilvy's principles. Does the headline make a specific promise? Is the positioning clear in the first screen? List the three changes that matter most.
```

## How to use the stack together

1. Start with [**copywriting**](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copywriting) from coreyhaines31 for any new page. Give it the audience, the offer and the proof you have, and let it diagnose the brief before it writes.
2. Draft an alternative with [**copywriting**](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/#copywriting) from infrasity-labs only if you want two versions to compare. Name the skill in the prompt so the agent uses the right one.
3. Review the stronger draft with [**ogilvy-copywriting**](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/#ogilvy-copywriting). Check the headline's promise and the positioning before anyone edits sentences.
4. Run [**copy-editing**](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copy-editing) over the result. Tighten, remove AI tells, and use point edits once the page is approved.
5. Turn the approved message into paid ads with [**ad-creative**](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/). Pick the platform and format first, and write a falsifiable hypothesis for every test.
6. For Google search campaigns, write the RSA headlines and descriptions with [**google-ads-copy**](https://skills.suedeai.ai/directory/nowork-studio/notfair/google-ads-copy/) and A/B test the variants against CTR.
7. When results come in, go back to **ad-creative** in its iterate-from-performance-data mode, and feed the winning message back to **copy-editing** for the landing page.

## Install the stack

```bash
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/copy-editing
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/copywriting
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/ad-creative
npx skills add https://github.com/infrasity-labs/dev-gtm-claude-skills/tree/main/marketing-skills/copywriting
npx skills add https://github.com/nowork-studio/NotFair/tree/main/skills/google-ads-copy
npx skills add https://github.com/infrasity-labs/dev-gtm-claude-skills/tree/main/writing-skills/ogilvy-copywriting
```

The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [line-editing](https://skills.suedeai.ai/directory/danjdewhurst/story-skills/line-editing/) | [danjdewhurst/story-skills](https://github.com/danjdewhurst/story-skills) | 90/100 | The text is long-form prose rather than marketing copy, and you want a line edit, copyedit, read-aloud pass and proof pass that preserve the author's voice. |
| [ghostwriter](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 87/100 | The copy has to sound like a specific person or company: it builds a voice profile from samples and strips machine tells. |
| [marketing-psychology](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#marketing-psychology) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 87/100 | You want the reasoning behind the copy: anchoring, social proof, scarcity, loss aversion and framing. |
| [avoid-ai-writing-router](https://skills.suedeai.ai/directory/conorbronsdon/avoid-ai-writing/avoid-ai-writing-router/) | [conorbronsdon/avoid-ai-writing](https://github.com/conorbronsdon/avoid-ai-writing) | 85/100 | You need an AI-writing audit plus rewrite with voice preservation and false-positive interpretation, routed in stages. |
| [linkedin-humanizer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/#linkedin-humanizer) | [sergebulaev/linkedin-skills](https://github.com/sergebulaev/linkedin-skills) | 85/100 | The copy is a LinkedIn post or comment and you want AI tells removed, with an audit mode before posting. |

How I choose: the picks write and edit copy that sells, and the alternatives handle voice problems around it. If the issue is "this does not sound like us," use ghostwriter. If it is "this sounds like a machine," start with [copy-editing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copy-editing).

## Common mistakes

- Rewriting a page when one line is wrong. [copy-editing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copy-editing) makes a point edit that changes only that line.
- Publishing claims you cannot prove. [copywriting](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copywriting) from coreyhaines31 declines unsupported claims and names the evidence each one would need.
- Shipping AI tells. Both coreyhaines31 skills ban "it's not X, it's Y" reveals and "no X, no Y, no Z" lists by name.
- Testing ads without a hypothesis. [ad-creative](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/) requires the metric, the comparison and the expected direction.
- Writing one ad for every platform. ad-creative carries platform specs for Google, Meta and LinkedIn, and [google-ads-copy](https://skills.suedeai.ai/directory/nowork-studio/notfair/google-ads-copy/) works on RSA components alone.
- Editing sentences before checking the promise. [ogilvy-copywriting](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/#ogilvy-copywriting) reviews positioning and headlines first.

## Licenses, costs and checks before you install

Licenses: all six picks are MIT: [copy-editing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copy-editing), both [copywriting](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copywriting) skills, [ad-creative](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/), [google-ads-copy](https://skills.suedeai.ai/directory/nowork-studio/notfair/google-ads-copy/) and [ogilvy-copywriting](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/#ogilvy-copywriting). Confirm the license file in each repository anyway.

Services and credentials: none of the summarized files touch a paid service. ad-creative bundles no scripts and lists no outside hosts, and google-ads-copy is a single SKILL.md with no scripts, environment variables or hosts. The directory has not summarized the files of copy-editing, either copywriting skill or ogilvy-copywriting, so read those SKILL.md files yourself.

The directory has not security scanned any listed skill, as the [trust page](https://skills.suedeai.ai/directory/trust/) explains, and its [methodology](https://skills.suedeai.ai/directory/methodology/) describes what a score measures. Read each SKILL.md before you enable it.

## Related topics and stacks

The [Copywriting](https://skills.suedeai.ai/directory/topics/copywriting/) topic lists 13 skills, [Advertising](https://skills.suedeai.ai/directory/topics/ads/) lists 59, [Product Descriptions](https://skills.suedeai.ai/directory/topics/product-descriptions/) 10, [AI Detection and Humanizing](https://skills.suedeai.ai/directory/topics/ai-humanizer/) 21 and [Grammar and Proofreading](https://skills.suedeai.ai/directory/topics/grammar-checker/) 6. The [Writing and Editing](https://skills.suedeai.ai/directory/writing-content/) category has the rest.

Pair this stack with the [landing page stack](https://skills.suedeai.ai/directory/stacks/landing-page/) for the page the copy lives on, the [paid ads stack](https://skills.suedeai.ai/directory/stacks/paid-ads/) for campaign strategy and targeting, and the [email stack](https://skills.suedeai.ai/directory/stacks/email/) for lifecycle and transactional email.

## FAQ

### What is the best AI copywriting tool for Claude Code?

As agent skills, [copywriting](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copywriting) from coreyhaines31/marketingskills (86/100) for new page copy and [copy-editing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copy-editing) from the same repository (88/100) for improving existing copy. Both ban common AI tells by name, and copywriting declines claims you cannot support. Add [ad-creative](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/) (83/100) for paid ads.

### Which copywriting skill should I install first?

[copy-editing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copy-editing), if you already have copy, which most teams do. It is the highest-scoring pick at 88/100, with about 154,000 installs recorded by skills.sh, and it handles everything from a full content audit to a one-line point edit. Install [copywriting](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copywriting) next when you need a new page written from a brief.

### How do I make AI copywriting sound human?

Use skills that name the tells. [copy-editing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copy-editing) removes "it's not X, it's Y" reveals, "no X, no Y, no Z" lists and sentences that trail into extra comma clauses in every edit, and [copywriting](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#copywriting) never uses them in drafts. For copy that must sound like one specific person, [ghostwriter](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/) builds a voice profile from samples.

### Do these copywriting skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Are these copywriting skills free?

All six are MIT licensed. Of the files the directory summarized, [ad-creative](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/ad-creative/) and [google-ads-copy](https://skills.suedeai.ai/directory/nowork-studio/notfair/google-ads-copy/) bundle no scripts and call no outside hosts, so they need no paid service of their own. The ads you write with them still cost money on the ad platforms. Read the SKILL.md of each skill whose files are not summarized before you install it.

### How do I install the copywriting stack in Claude Code?

Run the six `npx skills add` commands in the install section above, one per skill. The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents. Because two skills share the name copywriting, name the publisher in your prompt when you want a specific one.
