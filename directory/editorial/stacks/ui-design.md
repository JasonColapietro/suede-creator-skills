# Which agent skills should you stack to design a polished UI?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** For Claude Code design work, [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) from pbakaus/impeccable (86/100) is the backbone, with playbooks for hierarchy, typography, accessibility, responsive layouts, motion and UX copy, and about 379,000 installs recorded by skills.sh. [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) from agiwhitelist/auteur (89/100) builds the whole experience as one design system, and [ui-animation](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/) from mblode/agent-skills (86/100) handles motion. Add anydesign to pull a token system out of a reference, superdesign to compare AI UI design variants, and web-artifacts-builder when the target is a claude.ai artifact.

## The stack

Six skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) | [agiwhitelist/auteur](https://github.com/agiwhitelist/auteur) | 89/100 | Designs and builds complete web experiences, including landing pages, cinematic scroll-directed sites and multi-screen products, as one consistent design system with generated assets. |
| [web-artifacts-builder](https://skills.suedeai.ai/directory/anthropics/skills/web-artifacts-builder/) | [anthropics/skills](https://github.com/anthropics/skills) | 87/100 | Builds multi-component claude.ai HTML artifacts with React, Tailwind CSS and shadcn/ui, for artifacts that need state management, routing or shadcn/ui components. |
| [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | 86/100 | Guides frontend and native interface design through focused playbooks for hierarchy, typography, accessibility, responsive layouts, motion and UX copy. |
| [ui-animation](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 86/100 | Builds, reviews and measures UI motion, including springs, gestures, scroll effects, curve fitting from recordings and sparse interface sound. |
| [anydesign](https://skills.suedeai.ai/directory/avelikiy/great-cto/anydesign/) | [avelikiy/great_cto](https://github.com/avelikiy/great_cto) | 84/100 | Analyzes images, websites and Figma files to extract their design and generate a design.md with a token system, component inventory and reconstruction notes. |
| [superdesign](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/) | [superdesigndev/superdesign-skill](https://github.com/superdesigndev/superdesign-skill) | 83/100 | Designs or redesigns frontend UI, presentations and graphics on the Superdesign canvas using a choice of AI models, comparing results and exploring visual variants. |

## Who this stack is for

This stack is for people who have to ship an interface that looks considered rather than assembled. A founder building a first product without a designer. A frontend engineer handed a Figma link and a deadline. A design lead who wants an agent to audit a flow before review. A marketer who needs a product page that does not look like a template.

It also fits teams that want an existing product UI fixed, not rebuilt. That is exactly where [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) earns its place.

All six skills use the [Agent Skills](https://agentskills.io/) format, so the same folders work in Claude Code, Codex, Cursor and any agent that reads a SKILL.md. The focus is web first: [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/), [superdesign](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/) and [web-artifacts-builder](https://skills.suedeai.ai/directory/anthropics/skills/web-artifacts-builder/) build for the browser, while impeccable also covers native iOS and Android screens. If you only write backend code, skip the stack; auteur and impeccable both say they are not for backend-only work.

## The Suede AI skill built for this job

I built [suede-design](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-design) for exactly this job: taking an interface from a diff or a rough flow to something I would sign. Hand it a UI diff and it reviews it. Hand it a flow and it runs a whole-flow review. Ask it to design and it sets the hierarchy, tokens, color, type, accessibility and the design system they belong to. It restyles dashboards, and it verifies the visual build before anything ships.

Start with it. suede-design makes the hierarchy and token decisions first, and the third-party stack below executes against them. The design.md from [anydesign](https://skills.suedeai.ai/directory/avelikiy/great-cto/anydesign/) becomes an input it reviews, not a spec you trust blind. Variants from [superdesign](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/) get judged against one set of tokens. [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) builds to a system already decided, and [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) polishes screens whose structure has passed review. At the end, suede-design verifies the visual build, so the skill that set the rules checks the pixels.

It is Suede AI's skill, so it stays out of the ranking on this page. It keeps to its lane: no sales copy, funnel architecture or general code and security review.

Install it before the rest of the stack:

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-design
```

## The skills, one by one

### auteur: building a whole site or product as one system

[auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) designs and builds complete web experiences from scratch: product and marketing pages, cinematic scroll-directed sites where the page is directed like a film, and multi-screen products (app, dashboard, admin, settings, onboarding, docs site) built as one design system, with every component, state and route in one style. That last part is the reason to use it. Screen twelve looks like screen one because the system came first.

Its SKILL.md reads like a production manual: non-negotiables, a banned list, critical numbers, routing, a commit-sheet to fill in before any code, phases, and a section titled "Verification is part of the build". It gates every ship with an executable anti-slop linter and a screenshot verification loop. It bundles nine JavaScript scripts, generates its own assets through local CLIs (images, video frames, depth maps, 3D), and its files reach api.iconify.design, www.pinterest.com, www.awwwards.com and api.polyhaven.com.

Reach for it when you start fresh, not to polish a UI someone else built. It is MIT licensed, with about 200 installs recorded by skills.sh.

A prompt that fits its brief:

```text
Design and build a five-screen onboarding flow for a budgeting app as one design system. Fill in the commit-sheet first, then build, then run the screenshot verification loop.
```

### web-artifacts-builder: multi-component claude.ai artifacts

[web-artifacts-builder](https://skills.suedeai.ai/directory/anthropics/skills/web-artifacts-builder/) comes from anthropics/skills, which the directory marks as an official publisher. It is a suite of tools for elaborate, multi-component claude.ai HTML artifacts built with React, Tailwind CSS and shadcn/ui. The description draws the line clearly: use it for artifacts that need state management, routing or shadcn/ui components, not for simple single-file HTML or JSX.

The SKILL.md walks a five-step quick start: initialize the project, develop the artifact, bundle it to a single HTML file, share it, and optionally test or visualize it. Two shell scripts, init-artifact.sh and bundle-artifact.sh, do the mechanical work, and a tarball of shadcn components ships with them. The directory's read found no outside hosts and no environment variables.

I use it when the deliverable is an interactive prototype someone will open inside claude.ai: a calculator, a settings panel with real state, a multi-view dashboard mockup. For a production site it is the wrong tool, because the output is one bundled HTML file by design. It is Apache-2.0 licensed with about 115,000 installs recorded by skills.sh.

A prompt that uses its state and routing:

```text
Build a claude.ai artifact: a three-tab pricing calculator with shared state, shadcn/ui components and a summary view. Bundle it to a single HTML file.
```

### impeccable: auditing and polishing an interface

[impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) is the skill I would install first. It designs, redesigns, critiques, audits, polishes, simplifies, hardens and animates frontend interfaces: websites, landing pages, dashboards, product UI, forms, settings, onboarding, empty states, and native iOS or Android screens. It handles hierarchy, layout, typography, color, motion, UX copy, accessibility, responsive behavior and edge cases, and it can capture a design system as a DESIGN.md with tokens.

The SKILL.md is short (Setup, How to design, Modes, Commands) because the depth sits in reference files, one per job: adapt, animate, audit, bolder, clarify, colorize, component review and craft floor, plus native variants and an Android reference. It bundles five JavaScript scripts, and the directory's read flags network calls in them without naming an outside host.

Use it one playbook at a time: hierarchy, then typography, then accessibility and responsive layouts, then UX copy. Most polish problems are hierarchy problems wearing a color. It also handles the two notes every reviewer gives, making bland UI bolder and loud UI quieter. It is Apache-2.0 licensed, with about 379,000 installs recorded by skills.sh.

A prompt that starts the audit in the right place:

```text
Audit the settings page in app/settings for hierarchy only. List the five worst problems in order, then fix the first two.
```

### ui-animation: motion that earns its place

[ui-animation](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/) builds, reviews and measures UI motion: springs, gestures, scroll effects, curve fitting from recordings, and sparse interface sound. It answers requests like "add animation", "match this easing", "reverse engineer this motion" and "add a click sound", and it can hunt for animation opportunities you missed.

Its SKILL.md is unusually complete for a motion skill: core rules, motion design principles, what to animate, easing defaults, transition decision rules, spatial and sequencing, accessibility, performance, anti-patterns, and separate discovery and reverse-engineer workflows. Reference files cover choreography, clip-path techniques, curve fitting and debugging symptoms. It bundles three Python scripts and ships evals, and the directory's read found no network calls.

Add it last. Motion layered on a weak hierarchy just moves the weakness around. The reverse-engineer workflow is the part I value most: give it a recording of an interaction you like and it fits the curve, so you match the feel instead of guessing at easing values. It is MIT licensed with about 11,000 installs recorded by skills.sh.

A prompt for the reverse-engineer workflow:

```text
Here is a screen recording of a drawer opening in an app I like. Fit the easing curve and apply the same motion to our sidebar, with a reduced-motion fallback.
```

### anydesign: turning a reference into a spec

[anydesign](https://skills.suedeai.ai/directory/avelikiy/great-cto/anydesign/) analyzes images, websites and Figma files to extract their design, then writes a design.md with a token system, a component inventory and reconstruction notes. It responds to requests like "extract the design system from X" or "what palette does this site use", and its element mode handles single pieces, such as one navbar, with a focused element.md.

The SKILL.md enforces a five-step workflow: identify the source and objective, capture the material, run a layered analysis, generate design.md, then deliver. Seven Python scripts sit behind it, including capture_site.py, extract_colors.py, check_contrast.py and export_for_claude_design.py. The one outside host in its files is fonts.googleapis.com.

Start here when someone hands you a mood board and says "like this". A design.md with tokens is something an agent can build against; a screenshot is not. Be deliberate about the source: extracting tokens to learn from a site is analysis, shipping a copy of it is something else. It is MIT licensed with about 30 installs recorded by skills.sh, so read the SKILL.md before you trust it with client work.

A prompt with a clear objective:

```text
Analyze these three screenshots of our old marketing site and generate a design.md with color and type tokens, a component inventory and contrast checks.
```

### superdesign: comparing variants before you commit

[superdesign](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/) designs or redesigns frontend UI, presentations and graphics on the Superdesign canvas with a choice of leading AI models. Its description covers pages, features, flows and brand-new products, reproducing existing UI, comparing results across models, exploring visual variants, setting or extracting a design system, and posters and marketing graphics. It can also generate supporting image or video assets when a design needs them.

The files are light. There are no bundled scripts; the skill runs its commands through npx, and its SKILL.md covers command examples, what to do when a command fails, and browser choice. The depth sits in references for websites, components, graphics, presentations and asset generation.

This is the AI UI design step I would not skip on a new product. Three directions side by side cost minutes; changing direction after the build costs the build. Use it to choose, then build the winner properly. It is MIT licensed with about 12,000 installs recorded by skills.sh.

A prompt that asks for a comparison, not one answer:

```text
Design three directions for the pricing page on the canvas using different models. Keep the copy fixed, vary layout and type, then summarize the trade-offs.
```

## How to use the stack together

1. Start from a reference with [**anydesign**](https://skills.suedeai.ai/directory/avelikiy/great-cto/anydesign/). It turns images, websites or Figma files into a design.md with tokens and a component inventory. Now you have a spec instead of a mood board.
2. Explore with [**superdesign**](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/). Compare directions across AI models before you commit, because changing direction later costs the whole build.
3. Build with [**auteur**](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/). Fill in its commit-sheet, then let it produce the pages or product as one design system with generated assets.
4. If the deliverable is a claude.ai artifact, swap step 3 for [**web-artifacts-builder**](https://skills.suedeai.ai/directory/anthropics/skills/web-artifacts-builder/). It builds with React, Tailwind CSS and shadcn/ui and bundles to one HTML file.
5. Audit with [**impeccable**](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/), one playbook at a time: hierarchy, typography, accessibility and responsive layouts, then UX copy. Audit the built screens, not the mockups.
6. Add motion last with [**ui-animation**](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/). It also reviews and measures motion, so use it to remove animation as often as to add it.
7. Finish with **impeccable** again. A last accessibility and responsive pass catches what the motion and asset steps broke.

## Install the stack

```bash
npx skills add https://github.com/agiwhitelist/auteur
npx skills add https://github.com/anthropics/skills/tree/main/skills/web-artifacts-builder
npx skills add https://github.com/pbakaus/impeccable/tree/main/cursor-plugin/skills/impeccable
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/ui-animation
npx skills add https://github.com/avelikiy/great_cto/tree/main/skills/anydesign
npx skills add https://github.com/superdesigndev/superdesign-skill/tree/main/skills/superdesign
```

The [skills CLI](https://skills.sh/) installs each skill for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [ui-design](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-design/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 84/100 | Your app is React, Next and Tailwind and you want direction, extract, build, audit and break modes in one skill. |
| [typography-audit](https://skills.suedeai.ai/directory/mblode/agent-skills/#typography-audit) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 84/100 | Type is the problem: it audits font loading, type scales, measure, spacing and OpenType with 78 scoped rules. |
| [ui-ux-pro-max](https://skills.suedeai.ai/directory/nextlevelbuilder/ui-ux-pro-max-skill/#ui-ux-pro-max) | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 83/100 | You want searchable local design data: its description lists 192 product palettes, 74 font pairings and 119 UX guidelines. |
| [design-system](https://skills.suedeai.ai/directory/nextlevelbuilder/ui-ux-pro-max-skill/#design-system) | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 83/100 | You need token architecture spelled out: primitive, semantic and component layers and CSS variables. |
| [ux-heuristics](https://skills.suedeai.ai/directory/wondelai/skills/#ux-heuristics) | [wondelai/skills](https://github.com/wondelai/skills) | 83/100 | The complaint is usability, not looks: it applies Nielsen's 10 heuristics, Krug's laws and severity ratings. |

The main trade is breadth against discipline. [ui-ux-pro-max](https://skills.suedeai.ai/directory/nextlevelbuilder/ui-ux-pro-max-skill/#ui-ux-pro-max) has about 429,000 installs recorded by skills.sh, more than [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/), and works as a lookup of styles and palettes; impeccable scores higher (86/100 against 83/100) and works as a sequence of audits. I keep impeccable as the backbone. [ui-design](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-design/) is the cleanest swap for [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) on a React codebase.

## Common mistakes

- Building before choosing a direction. [superdesign](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/) makes the comparison cheap, so do it first.
- Fixing color when the problem is hierarchy. Run the hierarchy playbook in [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) before anything cosmetic.
- Treating a screenshot as a spec. [anydesign](https://skills.suedeai.ai/directory/avelikiy/great-cto/anydesign/) turns it into tokens and a component inventory an agent can build against.
- Animating to hide a weak layout. The anti-patterns and transition rules in [ui-animation](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/) exist to stop this.
- Skipping reduced motion and contrast. ui-animation has an accessibility section and anydesign bundles a contrast checker.
- Using [web-artifacts-builder](https://skills.suedeai.ai/directory/anthropics/skills/web-artifacts-builder/) for a production site. It bundles one HTML file for claude.ai; treat it as a prototype tool.
- Shipping without looking at the render. [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) builds a screenshot verification loop into every ship: check the pixels, not the diff.

## Licenses, costs and checks before you install

Every license here is open. [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/), [ui-animation](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/), [anydesign](https://skills.suedeai.ai/directory/avelikiy/great-cto/anydesign/) and [superdesign](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/) are MIT; [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) and [web-artifacts-builder](https://skills.suedeai.ai/directory/anthropics/skills/web-artifacts-builder/) are Apache-2.0. None is proprietary.

None of the six reads an environment variable, according to the directory's read of their files, so there are no API keys to set. The network is another matter: auteur's files reach api.iconify.design, www.pinterest.com, www.awwwards.com and api.polyhaven.com, anydesign's reach fonts.googleapis.com, and impeccable's scripts make network calls without a named host. superdesign runs through npx on the Superdesign canvas, so check what that canvas asks of you.

The directory has not security scanned any listed skill; [read how it handles trust](https://skills.suedeai.ai/directory/trust/). Read each SKILL.md before you enable it, and read the bundled scripts in the five skills that ship code.

## Related topics and stacks

The picks sit in a handful of directory topics: [UI and UX Design](https://skills.suedeai.ai/directory/topics/ui-ux-design/) (24 listed skills), [Design Systems and Tokens](https://skills.suedeai.ai/directory/topics/design-systems/) (20), [Color and Typography](https://skills.suedeai.ai/directory/topics/color-typography/) (14), [Figma and Design Tools](https://skills.suedeai.ai/directory/topics/figma/) (14) and [React and Next.js](https://skills.suedeai.ai/directory/topics/react-nextjs/) (30). All of them belong to the [Frontend and Design](https://skills.suedeai.ai/directory/frontend-design/) category.

Next door, the [landing page stack](https://skills.suedeai.ai/directory/stacks/landing-page/) covers conversion on a page this stack designs, the [motion graphics stack](https://skills.suedeai.ai/directory/stacks/motion-graphics/) goes past UI motion into animated video, and the [presentations stack](https://skills.suedeai.ai/directory/stacks/presentations/) applies the same discipline to slides.

## FAQ

### What is the best Claude Code design skill for UI work?

[impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) from pbakaus/impeccable (86/100) is the one I would install first for Claude Code design work. It covers hierarchy, typography, color, layout, accessibility, responsive behavior, motion and UX copy through focused playbooks, on the web and on native iOS or Android screens. Pair it with [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) (89/100) when you are building from nothing rather than fixing an interface that already exists.

### Is impeccable alone enough?

For an interface that already exists, often yes: [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) is a set of playbooks for fixing what is there, and at about 379,000 installs recorded by skills.sh it is the most installed skill in this stack by a wide margin. Run its playbooks in order. For a new product you still need something to build with, which is where auteur or [web-artifacts-builder](https://skills.suedeai.ai/directory/anthropics/skills/web-artifacts-builder/) come in.

### Can an AI UI generator build the whole interface from one prompt?

[auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) comes closest. It designs and builds complete web experiences, including multi-screen products, as one design system, and it gates every ship with an anti-slop linter and a screenshot verification loop. [superdesign](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/) generates and compares variants across AI models. Neither replaces review. Run an impeccable audit on whatever an AI UI generator produces, because a fast first draft is still a first draft.

### Do these skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Does this stack cover mobile?

Partly. [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/)'s playbooks cover frontend and native interface design, according to its summary, and [anydesign](https://skills.suedeai.ai/directory/avelikiy/great-cto/anydesign/) will extract a token system from any screenshot you give it. auteur, superdesign and web-artifacts-builder are web-first. If the product is a native app, start with those two and pick a framework-specific skill from the directory for the build.

### Are these AI UI design skills free?

The skills are open source: four are MIT licensed and two are Apache-2.0, and none reads an API key from the environment, per the directory's read of their files. The services around them are another matter. [superdesign](https://skills.suedeai.ai/directory/superdesigndev/superdesign-skill/superdesign/) works on the Superdesign canvas with a choice of AI models, and [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) reaches outside hosts such as api.iconify.design and api.polyhaven.com. Check those terms before you depend on them.
