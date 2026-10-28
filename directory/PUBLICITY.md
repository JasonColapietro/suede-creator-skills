# Directory publicity copy

Ready-to-send copy for getting the Agent Skills Directory (https://suedeai.directory) into roundups, awesome lists, launch sites and press. Targets and status are in [DISTRIBUTION.md](DISTRIBUTION.md). Nothing here is sent, posted or submitted without owner approval.

Facts used below come from the 2026-10-22 snapshot: 3,868 scored skills, 161 repositories, 16 categories, 1,765 skills at 80–99, scores 53–95 with a median of 79, 97.3% under an open license. The frontmatter percentages (about 14% declare `allowed-tools`, 14% declare `compatibility`, 13% state a boundary, 17% bundle scripts) are from the October 19, 2026 snapshot of 3,798 skills as published in the [AI-visibility guide](editorial/skill-ai-visibility.md); recompute them with the data report before quoting them to press. Where a count appears, the count-free variant beside it is the one to use after the next refresh if this file has not been updated. Author credit on everything public: Jason Colapietro, founder of Suede AI. The @johnnysuede handle is for X only.

## One-liners

Count-free (safe forever):

> Agent Skills Directory by Suede AI: Claude Code, Codex and OpenClaw skills scored 0–99 on a published rubric, with a "before you install" panel for every skill. https://suedeai.directory

Dated count:

> Agent Skills Directory by Suede AI: 3,868 agent skills from 161 repositories, each scored 0–99 on a published, recomputable rubric, with scripts, credentials and outside hosts listed before you install. https://suedeai.directory

Ten words, for form fields with a tight limit:

> Agent skills scored 0–99, with install evidence, before you install.

## Short description (about 100 words)

> The Agent Skills Directory scores every listed agent skill from 0 to 99 on a published rubric and shows the evidence behind the number. Each page lists what the skill bundles, what it would run, which credentials and outside hosts it touches, and whether it uses MCP, so you can judge it before it lands in Claude Code, Codex or OpenClaw. Listings credit the publisher, link to the source and name the license. Publishers can add a badge to their README, run a free AI-visibility check and request a featured placement. Built and maintained by Jason Colapietro at Suede AI. Free, no account.

## Long description (about 250 words)

> Most skill directories rank by install counts or star counts, which tell you what is popular, not what is well built. The Agent Skills Directory from Suede AI takes a different route: every listed skill gets a 0–99 score computed from a published rubric, and every component of that score is shown on the listing. The rubric reads the skill's structure, description clarity, instruction depth, bundled resources, maintenance signals, curated-list citations and declared tool and compatibility fields. Anyone can recompute a score from the saved evidence, and the method page documents every point.
>
> Each listing also answers the question people actually have before installing: what will this do to my machine? The "before you install" panel lists bundled scripts, required credentials, outside hosts the skill calls and any MCP use, read straight from the source. Scores measure structural quality, not safety, and the directory says so on every page.
>
> The directory covers skills for Claude Code, OpenAI Codex, OpenClaw and other agents that read the SKILL.md format, drawn from eight community-curated lists plus publisher requests. Listings credit the author, link to the source commit and name the license. Publishers get a badge for their README, a free Skill AI-visibility check that shows which rubric points are still open, and a featured placement offer for verified badges on skills scoring 80 or above. There are also guides on installing skills, skills versus MCP servers, and getting a skill cited by AI assistants.
>
> It is free, needs no account, and the data behind it is public on GitHub as a Markdown catalog. Built by Jason Colapietro, founder of Suede AI.

## Awesome-list entry line

For a "Directories", "Resources" or "Where to browse" section. Count-free so it never goes stale:

```markdown
- [Agent Skills Directory](https://suedeai.directory) - Skills for Claude Code, Codex and OpenClaw scored 0–99 on a published rubric, with scripts, credentials and outside hosts listed per skill before you install. Free, no account.
```

PR title: `Add Agent Skills Directory`. PR body, two lines:

> Adds the Agent Skills Directory (Suede AI) to the resources section. It scores skills on a published, recomputable rubric and lists install evidence per skill; this list is one of its eight sources and every listing links back to the source repository.

## Roundup author email (Tier 1)

Subject: `Add a scored skills directory to your "{post title}" roundup?`

> Hi {first name},
>
> Your post "{post title}" is the page I send people to when they ask where to find agent skills, so I would like to put a new option in front of you.
>
> I run the Agent Skills Directory at https://suedeai.directory. It lists {3,868 skills from 161 repositories | thousands of skills} for Claude Code, Codex and OpenClaw. Two things set it apart from the directories you already cover:
>
> 1. Every skill carries a 0–99 score from a published rubric, and every component of the score is shown on the listing. Method page: https://suedeai.directory/methodology/
> 2. Every listing has a "before you install" panel: bundled scripts, required credentials, outside hosts, MCP use, read from the source.
>
> Listings credit the publisher and link to the source commit and license. It is free and needs no account.
>
> If it fits your list, a one-line entry would be great; the one I would use is below. If you want data for the post, I have a full scored snapshot (median score 79, 97% open-licensed, only 14% of skills declare their tools) and can share a summary.
>
> - Agent Skills Directory (suedeai.directory): skills scored 0–99 on a published rubric, with install evidence per skill.
>
> Thanks for maintaining the list.
>
> Jason Colapietro
> Founder, Suede AI
> https://suedeai.ai

## Show HN

Title (under 80 characters):

> Show HN: A directory that scores 3,868 agent skills 0–99 and shows the evidence

Count-free alternative:

> Show HN: Agent skills directory with a published 0–99 rubric and install evidence

First comment (post it right after submitting):

> I built this because every skills directory I used ranked by installs or stars, and neither told me whether a SKILL.md was any good or what it would run on my machine.
>
> What it does: reads every skill from eight community awesome lists plus publisher requests, scores it 0–99 on a rubric that is fully published (structure, description clarity, instruction depth, bundled resources, maintenance, citations, declared tools and compatibility), and shows every component on the listing so you can recompute it. Each page also lists bundled scripts, credentials, outside hosts and MCP use before you install.
>
> Some numbers from the current snapshot: 3,868 skills from 161 repos, scores from 53 to 95, median 79. 97% are open-licensed. Only 14% declare allowed-tools and 14% declare compatibility, which is the single biggest reason scores are lower than they could be.
>
> Scores measure structural quality, not safety, and I say that on every page. Publishers can request corrections or removal through a GitHub issue form. The Markdown catalog and the data are on GitHub.
>
> Things I am unsure about and would like feedback on: whether the rubric weights are right, and whether a numeric score invites gaming. Happy to answer anything.

## Product Hunt

Name: `Agent Skills Directory`

Tagline (60 characters max): `Agent skills scored 0–99, with install evidence`

Description (260 characters max):

> Compare Claude Code, Codex and OpenClaw skills by a published 0–99 quality score instead of install counts. Every listing shows the scoring evidence plus scripts, credentials and outside hosts before you install. Free, no account, from Suede AI.

Topics: Developer Tools, Artificial Intelligence, Open Source, Productivity.

Maker's first comment:

> Hi Product Hunt. I am Jason, founder of Suede AI.
>
> Skill directories rank by installs or stars. That tells you what is popular, not what is well built or what it will run. The Agent Skills Directory scores every skill 0–99 on a rubric that is fully published, shows every point on the listing, and lists bundled scripts, credentials, outside hosts and MCP use before you install.
>
> Today it covers 3,868 skills from 161 repositories, with a free AI-visibility check for publishers and a badge they can put in their README. It is free and needs no account.
>
> Scores measure structural quality, not safety. I would love to hear which rubric points you think are weighted wrong.

## Reddit (r/ClaudeAI, r/ClaudeCode, r/codex)

Title:

> I scored 3,868 Claude Code / Codex skills 0–99 with a published rubric. Here is what the data shows and where to browse it.

Body:

> I got tired of picking skills by install count, so I built a directory that scores every SKILL.md on a rubric I publish in full: structure, description clarity, instruction depth, bundled resources, maintenance, citations, declared tools and compatibility. Every listing shows each component so you can check the number yourself.
>
> Some findings from the current snapshot (3,868 skills, 161 repos):
>
> - Scores run 53 to 95, median 79.
> - 97% are under an open license.
> - Only 14% declare `allowed-tools` and 14% declare `compatibility`. Those two fields are the cheapest points most skills leave on the table.
> - About 13% of descriptions state what the skill is NOT for, which is the thing that stops an agent from picking the wrong skill.
>
> Each listing also shows bundled scripts, credentials, outside hosts and MCP use before you install. Scores measure structure, not safety.
>
> Directory: https://suedeai.directory
> Method: https://suedeai.directory/methodology/
>
> If your skill is listed and the score looks wrong, there is a correction form linked on the page. Feedback on the rubric weights is welcome.

## Press pitch (Tier 5)

Subject: `Data: only 14% of AI agent skills declare what tools they use`

> Hi {first name},
>
> I am Jason Colapietro, founder of Suede AI and author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*. I also hold the VoicePrint patent.
>
> I scored 3,868 agent skills (the SKILL.md files that extend Claude Code, Codex and OpenClaw) from 161 repositories on a published rubric. The results say something about how fast this ecosystem is moving relative to how carefully it is being built:
>
> - Only 14% of skills declare which tools they are allowed to use, and 14% declare which agents they run on.
> - 17% bundle scripts; most listings do not say what those scripts touch.
> - Scores run from 53 to 95 out of 99, median 79, so the median skill leaves a fifth of the rubric open.
>
> The full report, with method and per-category breakdowns, is at {data report URL}. The directory itself is at https://suedeai.directory and shows the evidence for every score plus what each skill would run before you install it.
>
> If the "install before you look" problem in agent tooling is on your radar, I am glad to walk through the data or share the raw snapshot.
>
> Jason Colapietro
> Founder, Suede AI
> https://suedeai.ai/founder

## Social drafts for Buffer (approval required)

X, from @johnnysuede:

> Skill directories rank by installs. Installs tell you what's popular, not what's built well or what it runs on your machine.
>
> So I scored 3,868 agent skills 0–99 on a rubric I publish in full, with scripts, credentials and outside hosts listed per skill.
>
> Free, no account: suedeai.directory

X, data angle:

> Scored 3,868 Claude Code / Codex / OpenClaw skills on a published rubric.
>
> Median: 79/99
> Open-licensed: 97%
> Declare allowed-tools: 14%
> Declare compatibility: 14%
>
> The cheapest points in the ecosystem are two frontmatter fields almost nobody fills in.
>
> Browse by score: suedeai.directory

LinkedIn, from Jason Colapietro:

> Every agent skills directory I know of ranks by installs or GitHub stars. That is a popularity signal. It says nothing about whether a skill is well built or what it will run once it is on your machine.
>
> The Agent Skills Directory takes the other route. Each of 3,868 skills from 161 repositories gets a 0–99 score from a rubric that is published in full, and every component of that score is on the listing so you can check it. Each page also lists bundled scripts, required credentials, outside hosts and MCP use before you install.
>
> Three things the data shows: the median skill scores 79; 97% are open-licensed; only 14% declare which tools they may use. The cheapest quality points in the ecosystem are two frontmatter fields almost nobody fills in.
>
> It is free and needs no account. Publishers get a README badge, a free AI-visibility check, and a correction form on every listing.
>
> https://suedeai.directory

## Form-field blurbs (AlternativeTo, aiagentsdirectory.com, Peerlist, BetaList)

Category: Developer tools / AI agents / Directories. Pricing: Free. Platforms: Web.

Short (under 160 characters):

> Directory of agent skills for Claude Code, Codex and OpenClaw, each scored 0–99 on a published rubric with install evidence per skill. Free, no account.

AlternativeTo "alternative to": skills.sh, Skills Directory (skillsdirectory.com), SkillsMP, ClaudeSkills.info. Why it is an alternative, one line:

> Ranks by a published, recomputable quality score instead of install counts, and lists what each skill would run before you install.
