# Which agent skills turn Claude Code into an AI presentation maker?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** for an AI presentation maker inside your coding agent, install [slidewright](https://skills.suedeai.ai/directory/tronghieu/agent-skills/slidewright/) from tronghieu/agent-skills (90/100) to build presentation websites for a room, with phone remote control and PDF export, and [pptx](https://skills.suedeai.ai/directory/anthropics/skills/pptx/) from anthropics/skills (87/100) when the deliverable must be an editable PowerPoint file with speaker notes. Add [presentation-creator](https://skills.suedeai.ai/directory/mblode/agent-skills/#presentation-creator) from mblode/agent-skills (87/100) to write the story spine first. Bring in the getsentry presentation-creator for data-heavy decks, superdesign to compare visual directions, and google-slides when the deck lives in Google Slides.

## The stack

Six skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [slidewright](https://skills.suedeai.ai/directory/tronghieu/agent-skills/slidewright/) | [tronghieu/agent-skills](https://github.com/tronghieu/agent-skills) | 90/100 | Builds interactive presentation websites for slide decks projected to a room, including slide editing, deck restyling, phone remote control and PDF export. |
| [pptx](https://skills.suedeai.ai/directory/anthropics/skills/pptx/) | [anthropics/skills](https://github.com/anthropics/skills) | 87/100 | Creates, reads, edits and combines PowerPoint decks and templates, including speaker notes, comments and layouts, for any task involving a .pptx or .potx file. |
| [presentation-creator](https://skills.suedeai.ai/directory/mblode/agent-skills/#presentation-creator) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 87/100 | Builds decks with a story spine, house visual system, setting-specific density and speaker notes, defaulting to Marp. |
| [presentation-creator](https://skills.suedeai.ai/directory/getsentry/skills/presentation-creator/) | [getsentry/skills](https://github.com/getsentry/skills) | 84/100 | Creates data-driven presentation slides with React, Vite and Recharts in Sentry branding, with charts, animations and single-file HTML output. |
| [superdesign](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/) | [superdesigndev/superdesign-skill](https://github.com/superdesigndev/superdesign-skill) | 83/100 | Designs or redesigns frontend UI, presentations and graphics on the Superdesign canvas using a choice of AI models, comparing results and exploring visual variants. |
| [google-slides](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/google-slides/) | [sanjay3290/ai-skills](https://github.com/sanjay3290/ai-skills) | 80/100 | Reads and writes Google Slides presentations, including getting text, finding and creating presentations, adding slides and replacing text, with standalone OAuth authentication. |

## Who this stack is for

This stack is for anyone who builds decks often enough to want the agent doing the slide work: a founder rewriting a pitch deck, an engineer giving a conference talk, an analyst presenting quarterly numbers, a sales lead who needs one deck in PowerPoint and Google Slides.

The first decision is the output format, and the stack covers each one. [slidewright](https://skills.suedeai.ai/directory/tronghieu/agent-skills/slidewright/) makes a presentation website for a projected talk. [pptx](https://skills.suedeai.ai/directory/anthropics/skills/pptx/) makes and edits .pptx files people can open and change. [google-slides](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/google-slides/) writes into Google Slides. The two presentation-creator skills ([mblode](https://skills.suedeai.ai/directory/mblode/agent-skills/#presentation-creator) and [getsentry](https://skills.suedeai.ai/directory/getsentry/skills/presentation-creator/)) and [superdesign](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/) work upstream of that choice: story, data and look.

If you came looking for an AI slide generator that takes a document and returns slides, presentation-creator from mblode is the closest match, since "turn this doc into slides" is one of its triggers. If you came looking for Claude PowerPoint support, pptx is the skill that handles the file.

All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md.

## The Suede AI skill built for this job

I built [suede-sales-enablement](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-sales-enablement) for exactly this job when the deck has to sell: rep-ready pitch decks backed by a claim-source table. Next to the deck it produces the rest of the kit a sales conversation needs: one-pagers, objection libraries, demo scripts, battle cards, proposals, buyer cards and ROI models. It distinguishes sourced proof from modeled value, so a modeled ROI figure is labeled as modeled and never passed off as proof.

Start with it when the presentation is a pitch or a sales deck, or when someone asks you to "build a competitive battle card" or refresh sales collateral. It owns the content and the proof, and that makes the stack below work harder. [presentation-creator](https://skills.suedeai.ai/directory/mblode/agent-skills/#presentation-creator) from mblode gets claims that are already sourced to arrange into a story spine. [pptx](https://skills.suedeai.ai/directory/anthropics/skills/pptx/) and [slidewright](https://skills.suedeai.ai/directory/tronghieu/agent-skills/slidewright/) get finished slide content to lay out instead of a blank brief. [google-slides](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/google-slides/) gets text to place into the team's shared deck. Pricing strategy, offer design, public comparison pages and outreach go to other skills, and unsupported proof is out of scope.

It is Suede AI's skill, so it stays out of the ranking below. Install it first:

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-sales-enablement
```

## The skills, one by one

### slidewright: presentation websites for a projected talk

[slidewright](https://skills.suedeai.ai/directory/tronghieu/agent-skills/slidewright/) builds interactive presentation websites: slide decks projected to a room and controlled by one presenter. It also adds and edits slides, restyles a deck, scaffolds a new presentation project, reuses your setup in another repo, adds phone control through a QR code, and exports to PDF. It is the top-scoring pick at 90/100 (grade A), MIT licensed, with fewer than 1,000 installs recorded by skills.sh.

It supports two tracks: a zero-build single HTML file, or a Vite plus React project. The SKILL.md opens with "First, the mental model (read before writing any code)," then covers workflow, choosing a track, scaffolding and the files in the skill. References cover deck types, the design system, PDF export and each track.

The files bundle 4 Shell scripts, 1 JavaScript script and 1 Python script, read a SLIDEWRIGHT_TOKEN environment variable, and reach fonts.googleapis.com and cdn.tailwindcss.com. Read how the token is used before the first run.

Use it for talks, workshops and anything shown on a projector. Its description rules out printable documents, normal web apps and dashboards meant for individual users.

A talk prompt can be this short:

```text
I'm giving a 20-minute talk on our migration to Postgres next week. Build a single-file HTML deck with 12 slides, phone remote control, and a PDF export for attendees.
```

### pptx: editable PowerPoint files from Claude

[pptx](https://skills.suedeai.ai/directory/anthropics/skills/pptx/) is the official PowerPoint skill in anthropics/skills, and the one to install when you want Claude to produce PowerPoint files. It creates, reads, edits and combines decks and templates, handles speaker notes, comments and layouts, and triggers whenever a .pptx or .potx file is involved, even when you only need the text out of one. It scores 87/100 (grade B) and is the most installed skill here, with about 247,000 installs recorded by skills.sh. Its license is Proprietary, the only non-open license among the picks.

The SKILL.md is practical. It has sections on its scripts, on gotchas when creating with pptxgenjs, and on editing existing decks and templates. A design section covers color palettes, typography, spacing and common mistakes to avoid, and a required QA section splits into content QA, file QA and visual QA.

The files bundle 15 Python scripts, including add_slide.py, clean.py and helpers for charts, slides and themes, plus the Office Open XML schema files. They list no outside hosts and read no environment variables.

Use it whenever the deliverable is a file someone will open in PowerPoint. Do not use it for a projected web deck; [slidewright](https://skills.suedeai.ai/directory/tronghieu/agent-skills/slidewright/) fits that better.

Ask for the file and the checks together:

```text
Turn this outline into a 10-slide .pptx using our template.potx. Put the talking points in speaker notes, then run the content, file and visual QA before you hand it back.
```

### presentation-creator from mblode: the story spine and speaker notes

[presentation-creator](https://skills.suedeai.ai/directory/mblode/agent-skills/#presentation-creator) from mblode/agent-skills builds decks with a story spine, a house visual system, setting-specific density and speaker notes. Its triggers are the requests people make most: "create a presentation," "write a pitch deck" and "turn this doc into slides." It scores 87/100 (grade B), is MIT licensed, and has about 1,000 installs recorded by skills.sh.

Two details matter. It defaults to Marp, and its description says it uses an available presentation tool when you need editable PowerPoint. In this stack, that means it pairs with [pptx](https://skills.suedeai.ai/directory/anthropics/skills/pptx/): presentation-creator decides what the deck says and in what order, and pptx produces the file. Setting-specific density is the other: a deck read alone on a laptop and one spoken over in a room are different jobs.

The directory has no full page for this skill yet, so its files are not summarized here. Read its SKILL.md in the repository before you rely on the house visual system.

Use it first, before any layout work. Skip it when the story is already written and the job is only formatting.

Give it the source and the setting:

```text
Turn this 6-page product memo into a pitch deck for a 15-minute investor meeting. Build the story spine first, keep slides sparse, and put the detail in speaker notes.
```

### presentation-creator from getsentry: data decks with charts

[presentation-creator](https://skills.suedeai.ai/directory/getsentry/skills/presentation-creator/) from getsentry/skills creates data-driven presentation slides with React, Vite and Recharts in Sentry branding. It scaffolds a complete slide-based app with charts, animations and single-file HTML output. It is an official skill from getsentry/skills, scores 84/100 (grade B), is Apache-2.0 licensed, and has about 3,000 installs recorded by skills.sh.

The SKILL.md is a six-step build. Step 1 gathers requirements and includes a data assessment marked critical. Step 2 scaffolds the project (index.html, package.json, vite.config.js, main.jsx), step 3 builds the slide system and navigation, and step 4 creates charts, only when data exists. Step 5 applies the Sentry design system, and step 6 gives common slide patterns, including title, problem and data comparison slides. It bundles no scripts and lists no outside hosts.

That "only when data exists" rule is why I include it. It keeps the agent from inventing a chart to fill a slide.

Use it for metrics reviews, incident retrospectives and any talk built on numbers. The design system and logo files are Sentry's, so plan to restyle for your own brand.

Hand it real data:

```text
Build a data presentation from this CSV of weekly signups and churn for Q3. Assess the data first, chart only what the data supports, and output a single HTML file.
```

### superdesign: comparing visual directions

[superdesign](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/) designs or redesigns frontend UI, presentations and graphics on the Superdesign canvas with a choice of leading AI models. It compares design results across models, explores visual variants, sets or extracts a design system, and can generate supporting image or video assets. It scores 83/100 (grade B), is MIT licensed, and has about 12,000 installs recorded by skills.sh.

Its SKILL.md is short: what to do when a command fails, command examples, and browser choice. The depth is in reference files, including one for presentations, one for graphics, one for components and one for asset generation. It bundles no scripts and runs commands through npx.

For decks, superdesign is the exploration step. Before you commit a talk to one look, compare a few directions side by side and pick one. It also covers posters and marketing graphics, which helps when the talk needs a matching poster.

Use it when the look is undecided. Skip it when you already have a template, since [pptx](https://skills.suedeai.ai/directory/anthropics/skills/pptx/) and [slidewright](https://skills.suedeai.ai/directory/tronghieu/agent-skills/slidewright/) work from what you give them.

Ask for options, not a final:

```text
Explore three visual directions for a 12-slide product launch deck: title slide, a feature slide and a pricing slide in each. Compare them side by side.
```

### google-slides: reading and writing Google Slides

[google-slides](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/google-slides/) reads and writes Google Slides presentations. It gets text, finds presentations, creates them, adds slides, replaces text and manages slide content, with standalone OAuth authentication for full read and write access. It scores 80/100 (grade B), is Apache-2.0 licensed, and has fewer than 1,000 installs recorded by skills.sh.

The SKILL.md covers first-time setup, read commands, write commands, slide layouts, the presentation ID format, output formats for get-text, find and get-metadata, and token management. The files bundle 2 Python scripts (auth.py and slides.py), make network calls to www.googleapis.com, slides.googleapis.com, accounts.google.com and google-workspace-extension.geminicli.com, and the directory's file summary flags MCP content.

Use it when the team's decks live in Google Slides and someone has to keep them current: replacing last quarter's numbers, adding a slide, pulling the text out of a deck for a summary. Its description calls it a lightweight integration, so expect content operations, not design work. For a new visual direction, go to [superdesign](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/); for an editable file outside Google, use [pptx](https://skills.suedeai.ai/directory/anthropics/skills/pptx/). Read the token management section before you connect a work account.

Point it at a real deck:

```text
Find the "Q3 Board Update" presentation, replace every "Q2" with "Q3", add a slide after slide 4 titled "Hiring plan", and give me the text of the final deck.
```

## How to use the stack together

1. Write the story first with [**presentation-creator**](https://skills.suedeai.ai/directory/mblode/agent-skills/#presentation-creator) from mblode. Give it the source document and the setting, and let it build the story spine, the density and the speaker notes before anyone thinks about colors.
2. If the deck rests on numbers, run [**presentation-creator**](https://skills.suedeai.ai/directory/getsentry/skills/presentation-creator/) from getsentry. Its data assessment comes first, and it charts only what the data supports.
3. Explore the look with [**superdesign**](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/) when there is no template yet. Compare a few directions side by side and pick one before building.
4. For a projected talk, build it with [**slidewright**](https://skills.suedeai.ai/directory/tronghieu/agent-skills/slidewright/). Pick the single HTML file track for speed or Vite plus React for a bigger deck, and add the phone remote.
5. When someone needs an editable file, produce it with [**pptx**](https://skills.suedeai.ai/directory/anthropics/skills/pptx/) and run its required QA: content, file and visual. Keep the speaker notes from step 1 in the notes field.
6. If the team works in Google Slides, use [**google-slides**](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/google-slides/) to create the presentation, add slides and replace text in the shared deck.
7. Finish with a PDF from **slidewright** as the leave-behind, so people who missed the talk get the same slides.

## Install the stack

```bash
npx skills add https://github.com/tronghieu/agent-skills/tree/main/skills/slidewright
npx skills add https://github.com/anthropics/skills/tree/main/skills/pptx
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/presentation-creator
npx skills add https://github.com/getsentry/skills/tree/main/skills/presentation-creator
npx skills add https://github.com/superdesigndev/superdesign-skill/tree/main/skills/superdesign
npx skills add https://github.com/sanjay3290/ai-skills/tree/main/skills/google-slides
```

The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [docx](https://skills.suedeai.ai/directory/anthropics/skills/docx/) | [anthropics/skills](https://github.com/anthropics/skills) | 91/100 | The deliverable is a Word report or memo rather than slides. Like [pptx](https://skills.suedeai.ai/directory/anthropics/skills/pptx/), its license is Proprietary. |
| [scientific-slides](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#scientific-slides) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 81/100 | The talk is a research presentation, seminar or thesis defense, with timing guidance and PowerPoint or LaTeX Beamer output. |
| [publish-to-pages](https://skills.suedeai.ai/directory/github/awesome-copilot/#publish-to-pages) | [github/awesome-copilot](https://github.com/github/awesome-copilot) | 79/100 | You need a live link: it converts PPTX, PDF, HTML or Google Slides to a GitHub Pages URL. |
| [presenting-conference-talks](https://skills.suedeai.ai/directory/orchestra-research/ai-research-skills/#presenting-conference-talks) | [Orchestra-Research/AI-Research-SKILLs](https://github.com/Orchestra-Research/AI-Research-SKILLs) | 77/100 | You have a compiled ML or systems paper and want Beamer PDF and editable PPTX slides with a talk script. |
| [utility-slideshow-creator](https://skills.suedeai.ai/directory/product-on-purpose/pm-skills/#utility-slideshow-creator) | [product-on-purpose/pm-skills](https://github.com/product-on-purpose/pm-skills) | 75/100 | You want decks generated from a JSON specification with 18 slide types and calibrated character limits. |

How I choose: keep the picks for general business decks, and swap in an alternative when the setting is specialized. Academic talks go to scientific-slides or presenting-conference-talks, and sharing a live link goes to publish-to-pages.

## Common mistakes

- Designing before the story exists. [presentation-creator](https://skills.suedeai.ai/directory/mblode/agent-skills/#presentation-creator) from mblode builds the story spine first, so slides follow an argument rather than a template.
- Choosing the wrong output format. A projected talk belongs in [slidewright](https://skills.suedeai.ai/directory/tronghieu/agent-skills/slidewright/); a file the client will edit belongs in [pptx](https://skills.suedeai.ai/directory/anthropics/skills/pptx/).
- Charts without data. The getsentry presentation-creator only creates charts when data exists.
- Shipping a .pptx nobody opened. pptx makes QA required: content, file and visual.
- Cramming the whole script onto the slides. Put the detail in speaker notes, which both pptx and presentation-creator support.
- Rebuilding a shared deck by hand every quarter. [google-slides](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/google-slides/) replaces text and adds slides in place.

## Licenses, costs and checks before you install

Licenses: [pptx](https://skills.suedeai.ai/directory/anthropics/skills/pptx/) is Proprietary, so read its LICENSE.txt before you redistribute anything built with it. [slidewright](https://skills.suedeai.ai/directory/tronghieu/agent-skills/slidewright/), [presentation-creator](https://skills.suedeai.ai/directory/mblode/agent-skills/#presentation-creator) from mblode and [superdesign](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/) are MIT. The getsentry [presentation-creator](https://skills.suedeai.ai/directory/getsentry/skills/presentation-creator/) and [google-slides](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/google-slides/) are Apache-2.0.

Services and credentials: google-slides authenticates with Google through OAuth and calls Google's APIs, so it gets read and write access to your presentations. slidewright reads a SLIDEWRIGHT_TOKEN environment variable and loads fonts.googleapis.com and cdn.tailwindcss.com. superdesign works on the Superdesign canvas and runs npx commands. pptx and the getsentry presentation-creator list no outside hosts. The mblode presentation-creator's files are not summarized by the directory.

The directory has not security scanned any listed skill, as the [trust page](https://skills.suedeai.ai/directory/trust/) explains. Read each SKILL.md and its bundled scripts before you enable it, and grant OAuth access to Google only after you know what it covers.

## Related topics and stacks

The [Presentations](https://skills.suedeai.ai/directory/topics/presentations/) topic lists 18 skills, and the [Documents and Office Files](https://skills.suedeai.ai/directory/documents-office/) category holds the rest of the office-file skills, including [docx](https://skills.suedeai.ai/directory/anthropics/skills/docx/).

Three stacks pair well with this one. The [documents and data stack](https://skills.suedeai.ai/directory/stacks/documents-and-data/) covers the reports a deck usually summarizes, the [infographics and diagrams stack](https://skills.suedeai.ai/directory/stacks/infographics-and-diagrams/) makes the visuals that go on the slides, and the [research stack](https://skills.suedeai.ai/directory/stacks/research/) gathers the facts behind them.

## FAQ

### What is the best AI presentation maker for Claude Code?

For a projected talk, [slidewright](https://skills.suedeai.ai/directory/tronghieu/agent-skills/slidewright/) from tronghieu/agent-skills, the highest-scoring pick at 90/100. It builds a presentation website with phone remote control and PDF export. For an editable PowerPoint file, [pptx](https://skills.suedeai.ai/directory/anthropics/skills/pptx/) from anthropics/skills (87/100). I would write the story first with [presentation-creator](https://skills.suedeai.ai/directory/mblode/agent-skills/#presentation-creator) from mblode, then build in whichever format the audience needs.

### Can Claude make an editable PowerPoint file?

Yes, with the [pptx](https://skills.suedeai.ai/directory/anthropics/skills/pptx/) skill from anthropics/skills. It creates, reads, edits and combines .pptx decks and .potx templates, handles speaker notes, comments and layouts, and runs a required QA pass on content, file and visuals. It has about 247,000 installs recorded by skills.sh. Its license is Proprietary, so read LICENSE.txt before you redistribute work built with it.

### Which AI slide generator skill should I install first?

[presentation-creator](https://skills.suedeai.ai/directory/mblode/agent-skills/#presentation-creator) from mblode/agent-skills (87/100), if you start from a document. "Turn this doc into slides" is one of its triggers, and it builds a story spine, speaker notes and density suited to the setting. It defaults to Marp, so add [pptx](https://skills.suedeai.ai/directory/anthropics/skills/pptx/) when you need an editable PowerPoint file, or [slidewright](https://skills.suedeai.ai/directory/tronghieu/agent-skills/slidewright/) for a projected talk.

### Do these presentation skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Are these presentation skills free?

Five use open licenses: [slidewright](https://skills.suedeai.ai/directory/tronghieu/agent-skills/slidewright/), [superdesign](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/) and the mblode [presentation-creator](https://skills.suedeai.ai/directory/mblode/agent-skills/#presentation-creator) are MIT, and [google-slides](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/google-slides/) and the getsentry [presentation-creator](https://skills.suedeai.ai/directory/getsentry/skills/presentation-creator/) are Apache-2.0. [pptx](https://skills.suedeai.ai/directory/anthropics/skills/pptx/) is Proprietary. Beyond licenses, google-slides needs Google OAuth access, slidewright reads a SLIDEWRIGHT_TOKEN, and superdesign works on the Superdesign canvas, so check each SKILL.md for what those require.

### Can these skills edit Google Slides?

Yes. [google-slides](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/google-slides/) from sanjay3290/ai-skills (80/100) finds and creates presentations, adds slides, replaces text and pulls the text out of a deck, using standalone OAuth for read and write access. It is a lightweight integration for content changes, so pair it with [presentation-creator](https://skills.suedeai.ai/directory/mblode/agent-skills/#presentation-creator) from mblode when the deck needs a new story.
