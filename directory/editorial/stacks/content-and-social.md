# What is the best agent skill stack for content and social posts?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** For AI content creation, [ghostwriter](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/) from mblode/agent-skills (87/100) drafts, rewrites and critiques posts, messages and docs in your voice with the machine tells stripped, and [line-editing](https://skills.suedeai.ai/directory/danjdewhurst/story-skills/line-editing/) from danjdewhurst/story-skills (90/100) polishes the result at the sentence level. [linkedin-profile-optimizer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-profile-optimizer/) from sergebulaev/linkedin-skills (94/100) is the highest-scoring skill in the set and fixes the profile every post points back to. Add contagious for the angle, content-strategy for the plan, and co-marketing for distribution partners.

## The stack

Six skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [linkedin-profile-optimizer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-profile-optimizer/) | [sergebulaev/linkedin-skills](https://github.com/sergebulaev/linkedin-skills) | 94/100 | Audits and rewrites a LinkedIn profile end-to-end, covering headline, About section, Featured, banner, photo, Experience metrics, skills, custom URL and recommendations. |
| [co-marketing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/co-marketing/) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 90/100 | Finds co-marketing partners, plans joint campaigns and brainstorms partnership opportunities, including partner marketing, integration marketing and cross-promotion. |
| [line-editing](https://skills.suedeai.ai/directory/danjdewhurst/story-skills/line-editing/) | [danjdewhurst/story-skills](https://github.com/danjdewhurst/story-skills) | 90/100 | Edits and polishes prose at the line level, covering copyediting, proofreading, tightening sentences, grammar and punctuation checks, and dialogue punctuation. |
| [content-strategy](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#content-strategy) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | Plans a content strategy: what to create, which topics to cover, topic clusters, content pillars and an editorial calendar. |
| [ghostwriter](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 87/100 | Writes, rewrites and critiques messages, posts, tickets, PRDs and docs in the user's or company's voice, with machine tells stripped. |
| [contagious](https://skills.suedeai.ai/directory/wondelai/skills/contagious/) | [wondelai/skills](https://github.com/wondelai/skills) | 81/100 | Engineers word-of-mouth and virality using the STEPPS framework of Social Currency, Triggers, Emotion, Public, Practical Value and Stories. |

## Who this stack is for

This stack is for people whose job includes being visible. A founder who posts on LinkedIn three times a week and runs out of things to say by Thursday. A content marketer who owns the blog, the newsletter and the company feed. A developer advocate who writes docs by day and posts by night. A consultant whose profile is the storefront.

It treats AI content creation as a pipeline, not a prompt: plan the topics, find the angle, draft in your voice, edit the sentences, fix the profile the posts point to, and find partners who will share the work. Each step has one skill, so you can swap a step without rebuilding the rest.

All six use the [Agent Skills](https://agentskills.io/) format, so they run in Claude Code, Codex, Cursor and any agent that reads a SKILL.md. None of them posts for you. If you want an AI social media content generator that also schedules, look at the alternatives below.

## The Suede AI skill built for this job

I built [suede-copy](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-copy) for exactly this job: writing the copy that sells and explains, then making it hold up on every surface it ships to. Ask it to "rewrite this landing page" and it rewrites it. Point it at conversion copy, a public explainer or an agent-facing doc and it writes, sharpens or retunes it. It applies a defined voice and copy frameworks, returns labeled variants so you choose between options instead of rewriting one, writes answer-first for SEO and AEO, holds evidence boundaries so no claim outruns its proof, and scores every piece against a 70-point ship score before it goes out.

Start with it for anything that sells or explains. suede-copy sets the voice and the claims, and the stack below carries them into the feed. [content-strategy](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#content-strategy) picks the topics and suede-copy writes the pillar pieces they point to. [ghostwriter](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/) adapts that copy into posts in your own voice, [contagious](https://skills.suedeai.ai/directory/wondelai/skills/contagious/) sharpens the angle, and [line-editing](https://skills.suedeai.ai/directory/danjdewhurst/story-skills/line-editing/) does the final sentence pass. The evidence boundaries matter most on social, where a confident claim travels fastest.

It is Suede AI's skill, so it stays out of the ranking on this page. It keeps to its lane: no visual design and no scored SEO audits. Install it before the rest of the stack:

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-copy
```

## The skills, one by one

### linkedin-profile-optimizer: the page every post sends people to

[linkedin-profile-optimizer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-profile-optimizer/) audits and rewrites a LinkedIn profile end to end: headline, a seven-step About section, Featured, banner, photo, Experience metrics, Skills, custom URL and recommendations. It responds to "review my profile", "rewrite my headline" or "fix my About", and it turns a resume-style profile into one written for the people reading it.

The SKILL.md is structured like an audit: when to use it, input, output, steps, a nine-component scorecard, key benchmarks drawn from co.actor research, and hard rules. Reference files hold About section templates, banner and photo specs, Experience and Skills rules, a Featured section playbook and headline formulas. There are no bundled scripts; its files document an APIFY_TOKEN variable.

I put it in a content stack because every good post sends a reader to your profile, and a weak profile wastes the click. Do it once, early, then revisit quarterly. It is not for writing feed content; its own description points to a sibling post-writing skill for that. It is MIT licensed with about 100 installs recorded by skills.sh.

A prompt that gives it the inputs it needs:

```text
Audit my LinkedIn profile against the nine-component scorecard. Here are my headline, About, and Experience entries. Rewrite the headline three ways and the About in full.
```

### co-marketing: distribution through partners

[co-marketing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/co-marketing/) finds co-marketing partners, plans joint campaigns and brainstorms partnership opportunities: partner marketing, integration marketing, cross-promotion and co-branding. Its description sends customer referral programs and launch partnerships to sibling skills, which keeps it focused.

The SKILL.md opens with a partner identification framework (audience overlap analysis, partner scoring criteria, where to find partners), then partnership types and campaign types: content partnerships, webinars and events, product and integration marketing, and community and social. The brainstorming section works from shared audience moments, combined value propositions and the unique assets each partner brings. There are no bundled scripts, and it ships an evals file.

This is the distribution most solo content plans forget. Writing more posts reaches the same followers; a partner's newsletter, webinar or integration page reaches new ones. Use it once a quarter to line up two or three joint pieces, and let the partner scoring criteria, not friendship, decide who makes the list. It is MIT licensed with about 84,000 installs recorded by skills.sh.

A prompt that starts with audience overlap:

```text
We sell invoicing software to freelance designers. Find five co-marketing partners with audience overlap, score them, and propose one joint content piece for the top two.
```

### line-editing: the sentence-level pass

[line-editing](https://skills.suedeai.ai/directory/danjdewhurst/story-skills/line-editing/) edits and polishes prose at the line level: copyediting, proofreading, tightening sentences, grammar and punctuation checks, and dialogue punctuation. It preserves the author's voice, and it runs a read-aloud pass, which is the single best test for a social post.

It comes from a fiction-writing repository, and the SKILL.md shows it: a seven-step workflow (scope and permission, line edit, differentiate character voices, copyedit, read-aloud pass, proof pass, close the pass), with checklists for line edits and copyedits, an edit-note format and a read-aloud guide. There are no bundled scripts. The character-voice step will not matter for a LinkedIn post; the rest transfers directly.

Use it last, on a finished draft, and ask it to report edits as notes first so you can reject the ones that flatten your voice. Its scope-and-permission step exists for exactly that: you decide how heavy the edit is before it starts. Skip it for first drafts; polishing a draft you will rewrite wastes the pass. It is MIT licensed with about 300 installs recorded by skills.sh.

A prompt that limits the scope:

```text
Line edit this newsletter draft. Tighten sentences and fix punctuation, keep my voice, and run a read-aloud pass. Return edit notes before changing the text.
```

### content-strategy: deciding what to make

[content-strategy](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#content-strategy) plans a content strategy: what to create, which topics to cover, topic clusters, content pillars, a content roadmap and an editorial calendar. Its description is honest about the problem it solves, down to the trigger phrase "I don't know what to write", and it is clear about what it leaves to other skills: individual pieces go to a copywriting skill, SEO audits to an SEO skill, and social-specific content to a social skill.

The directory has no full page for it yet, so its files are not summarized here; read its SKILL.md in the repository before you rely on it.

I start every quarter with it. Decide the pillars and the clusters before you write a line, or the posts will chase whatever happened that morning. A good plan also makes the other skills better: [contagious](https://skills.suedeai.ai/directory/wondelai/skills/contagious/) gets a topic to find an angle for, and [ghostwriter](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/) gets a brief instead of a blank page. It is MIT licensed with about 169,000 installs recorded by skills.sh, the most in this stack.

A prompt that asks for a plan you can execute:

```text
We are a two-person B2B analytics startup. Build a content strategy for next quarter: three pillars, a topic cluster for each, and a 12-week editorial calendar split between blog and LinkedIn.
```

### ghostwriter: drafts in your voice

[ghostwriter](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/) writes, rewrites and critiques messages, posts, review comments, tickets, PRDs, design docs, talk scripts, READMEs and copy as you or your company, in a private profile's voice with machine tells stripped. It answers "write this in my voice", "make this sound less like AI" and "critique my draft".

The SKILL.md covers what done looks like, the default behavior, voice, making a profile from samples, modes, checks before returning, surfaces and gotchas. References cover copy, docs, READMEs and strategy, and its evals include sample voice profiles. There are no bundled scripts.

Build the voice profile first, from your best three posts rather than your last three. Then ask it to critique your own draft before you ask it to write one; the critique is often the more useful output. It also covers the surfaces around a post, such as the Slack reply or the README a launch points to, so one voice profile serves all of them. It is MIT licensed with about 200 installs recorded by skills.sh.

A prompt that starts with the profile:

```text
Make a voice profile from these five posts I wrote. Then critique the attached draft against it and rewrite only the paragraphs that sound least like me.
```

### contagious: the angle that gets shared

[contagious](https://skills.suedeai.ai/directory/wondelai/skills/contagious/) engineers word of mouth and virality with the STEPPS framework: Social Currency, Triggers, Emotion, Public, Practical Value and Stories. It responds to "go viral", "shareable content", "why people share" and "nobody is sharing it", and it covers environmental triggers and high-arousal emotional content.

The SKILL.md opens with a core principle and a scoring method, walks each STEPPS element, then applies them to product launches, content strategy and feature design, with a common mistakes section and a quick diagnostic. Reference files cover each element plus case studies and viral content patterns. There are no bundled scripts.

Pick one or two STEPPS elements per post. A post that tries all six has no point. Run the quick diagnostic on a draft that is not landing before you rewrite it, and use the Practical Value element for B2B posts, where useful beats clever. Do not use it to manufacture outrage; high-arousal emotion cuts both ways. It is MIT licensed with about 5,000 installs recorded by skills.sh.

A prompt that asks for a diagnosis:

```text
This post about our pricing change got no shares. Run the quick diagnostic, score it on STEPPS, and suggest two angles built on Practical Value and Social Currency.
```

## How to use the stack together

1. Plan the quarter with [**content-strategy**](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#content-strategy): pillars, clusters and an editorial calendar. Every later step works from this plan.
2. Find each post's angle with [**contagious**](https://skills.suedeai.ai/directory/wondelai/skills/contagious/). Pick one or two STEPPS elements and name them in the brief.
3. Draft with [**ghostwriter**](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/) from a voice profile built on your best posts. Ask for a critique of your own draft first.
4. Polish with [**line-editing**](https://skills.suedeai.ai/directory/danjdewhurst/story-skills/line-editing/). The read-aloud pass separates a post that reads like a person from one that reads like a template.
5. Fix the destination with [**linkedin-profile-optimizer**](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-profile-optimizer/). Do this once before the first post goes out, then revisit quarterly.
6. Find reach with [**co-marketing**](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/co-marketing/). Line up partners for two or three joint pieces a quarter.
7. Publish through whatever tool you already use, and keep the drafts in your repository. A record of what went out makes next quarter's plan better.

## Install the stack

```bash
npx skills add https://github.com/sergebulaev/linkedin-skills/tree/main/skills/linkedin-profile-optimizer
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/co-marketing
npx skills add https://github.com/danjdewhurst/story-skills/tree/main/skills/line-editing
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/content-strategy
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/ghostwriter
npx skills add https://github.com/wondelai/skills/tree/main/contagious
```

The [skills CLI](https://skills.sh/) installs each skill for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [linkedin-employee-advocacy](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-employee-advocacy/) | [sergebulaev/linkedin-skills](https://github.com/sergebulaev/linkedin-skills) | 94/100 | A whole team should post, not one person: it covers a 14-day launch playbook, brand governance, cadence benchmarks and ROI. |
| [linkedin-post-writer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-post-writer/) | [sergebulaev/linkedin-skills](https://github.com/sergebulaev/linkedin-skills) | 91/100 | You want a LinkedIn-specific drafter with 20 hook formulas, picked by engagement goal, that schedules via Publora on approval. |
| [linkedin-interviewer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-interviewer/) | [sergebulaev/linkedin-skills](https://github.com/sergebulaev/linkedin-skills) | 91/100 | The drafts have nothing concrete in them: it interviews you to build a Story Bank of roles, numbers and turning points. |
| [linkedin-comment-drafter](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-comment-drafter/) | [sergebulaev/linkedin-skills](https://github.com/sergebulaev/linkedin-skills) | 91/100 | Your reach comes from commenting: it drafts one to three comment variants on a post from its URL. |
| [linkedin-repurposer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-repurposer/) | [sergebulaev/linkedin-skills](https://github.com/sergebulaev/linkedin-skills) | 88/100 | You already have a tweet, thread, video, blog or newsletter and want it rebuilt as a native LinkedIn post. |

The sergebulaev/linkedin-skills set is the deep end for one platform. [ghostwriter](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/) writes for any surface, from Slack replies to READMEs; [linkedin-post-writer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-post-writer/) writes only LinkedIn posts but knows the format. If LinkedIn is most of your distribution, add the specialist and keep ghostwriter for everything else.

## Common mistakes

- Writing before planning. [content-strategy](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#content-strategy) sets the topics so the posts stop chasing the news.
- Using every persuasion lever at once. [contagious](https://skills.suedeai.ai/directory/wondelai/skills/contagious/) works best with one or two STEPPS elements per post.
- Training the voice on recent posts instead of good ones. Feed [ghostwriter](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/) your best three.
- Skipping the read-aloud pass. [line-editing](https://skills.suedeai.ai/directory/danjdewhurst/story-skills/line-editing/) runs one; it catches what reads like a template.
- Driving traffic to a weak profile. [linkedin-profile-optimizer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-profile-optimizer/) fixes the page before the posts send people there.
- Posting only to your own followers. [co-marketing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/co-marketing/) finds partners with audiences you do not have.

## Licenses, costs and checks before you install

All six picks are MIT licensed, and none is proprietary. Confirm the license file in each repository anyway; a directory field is a record, not a legal review.

The costs are low. Five of the picks bundle no scripts, read no environment variables and make no network calls, according to the directory's read of their files. [linkedin-profile-optimizer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-profile-optimizer/) documents an APIFY_TOKEN variable, so check what it wants that for before you set one. [content-strategy](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#content-strategy) has no full directory page, so its files are not summarized. The LinkedIn changes are ones you apply yourself in your own account.

The directory has not security scanned any listed skill; [read how it handles trust](https://skills.suedeai.ai/directory/trust/). Read each SKILL.md before you enable it. A writing skill is still instructions handed to an agent with access to your files.

## Related topics and stacks

The picks span several directory topics: [Social Media](https://skills.suedeai.ai/directory/topics/social-media/) (40 listed skills), [Content Marketing](https://skills.suedeai.ai/directory/topics/content-marketing/) (24), [Blog Writing](https://skills.suedeai.ai/directory/topics/blog-writing/) (34), [General Writing](https://skills.suedeai.ai/directory/topics/general-writing/) (12) and [Grammar and Proofreading](https://skills.suedeai.ai/directory/topics/grammar-checker/) (6), mostly in the [Marketing and SEO](https://skills.suedeai.ai/directory/marketing-seo/) category.

Three stacks pair well with this one: the [copywriting stack](https://skills.suedeai.ai/directory/stacks/copywriting/) for pages and offers, the [SEO and AI search stack](https://skills.suedeai.ai/directory/stacks/seo-and-ai-search/) for getting the long-form pieces found, and the [video and creative stack](https://skills.suedeai.ai/directory/stacks/video-and-creative/) for the images and clips your posts carry.

## FAQ

### What is the best AI content creation stack for Claude Code?

I would run [content-strategy](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#content-strategy) (88/100) to plan, [contagious](https://skills.suedeai.ai/directory/wondelai/skills/contagious/) (81/100) for the angle, [ghostwriter](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/) (87/100) to draft in your voice, and [line-editing](https://skills.suedeai.ai/directory/danjdewhurst/story-skills/line-editing/) (90/100) to polish. Add [linkedin-profile-optimizer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-profile-optimizer/) (94/100) for the profile and [co-marketing](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/co-marketing/) (90/100) for partner distribution. All six are MIT licensed Agent Skills that run in Claude Code.

### Is there an AI LinkedIn post generator skill?

Yes. [linkedin-post-writer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-post-writer/) from sergebulaev/linkedin-skills (91/100) drafts a new LinkedIn post using one of 20 hook formulas and an angle library, picked by engagement goal: comments, reposts, likes or saves. It runs a humanizer pass and schedules through Publora once you approve. For general writing in your own voice across surfaces, [ghostwriter](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/) (87/100) is the broader choice.

### Will the posts sound like AI wrote them?

[ghostwriter](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/)'s summary says it strips machine tells, and [line-editing](https://skills.suedeai.ai/directory/danjdewhurst/story-skills/line-editing/) tightens what remains. Neither replaces reading the post aloud before it goes out. If a sentence is one you would not say to a customer across a table, cut it. The machine tells are the easy part; the hard part is having something to say.

### Do these skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Do any of these skills publish the posts?

None of the six picks publishes; they produce text. Several alternatives do: [linkedin-post-writer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-post-writer/) schedules through Publora on approval, and [linkedin-comment-drafter](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-comment-drafter/) and [linkedin-repurposer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-repurposer/) publish through it on approval. [content-strategy](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#content-strategy), with about 169,000 installs recorded by skills.sh, is the most installed pick, and co-marketing follows at about 84,000. The hard part of content is deciding what to say and getting it seen.

### Are these content and social skills free?

Yes, as software: all six picks are MIT licensed, so you can install, use and modify them at no cost. Five bundle no scripts and read no environment variables, according to the directory's read of their files. [linkedin-profile-optimizer](https://skills.suedeai.ai/directory/sergebulaev/linkedin-skills/linkedin-profile-optimizer/) documents an APIFY_TOKEN variable, and content-strategy's files have not been summarized.
