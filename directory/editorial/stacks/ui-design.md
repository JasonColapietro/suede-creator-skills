# Which agent skills should you stack to design a polished UI?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 2, 2026.

**Short answer:** [impeccable](https://skills.suedeai.ai/directory/pbakaus/impeccable/impeccable/) from pbakaus/impeccable (86/100) is the backbone, with playbooks for hierarchy, typography, accessibility, responsive layouts, motion and UX copy, and about 379,000 installs recorded by skills.sh. [auteur](https://skills.suedeai.ai/directory/agiwhitelist/auteur/auteur/) from agiwhitelist/auteur (89/100) builds the whole experience as one design system, and [ui-animation](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/) from mblode/agent-skills (86/100) handles motion. Add anydesign to pull a token system out of a reference, superdesign to compare variants, and web-artifacts-builder when the target is a claude.ai artifact.

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

## How to use it

1. Start from a reference with **anydesign**. Give it images, websites or Figma files and it extracts the design into a design.md with a token system, a component inventory and reconstruction notes. Now you have a spec instead of a mood board.
2. Explore with **superdesign**. It designs or redesigns the UI on the Superdesign canvas with a choice of AI models, so you can compare results and look at visual variants before you commit to one direction. Pick the direction before you build; changing it later costs the whole build.
3. Build with **auteur**. It produces landing pages, cinematic scroll-directed sites or multi-screen products as one consistent design system with generated assets, which is what keeps screen twelve looking like screen one.
4. Audit with **impeccable**, one playbook at a time: hierarchy first, then typography, then accessibility and responsive layouts, then UX copy. Most polish problems are hierarchy problems wearing a color.
5. Add motion last with **ui-animation**: springs, gestures, scroll effects, curve fitting from recordings, and sparse interface sound. It also reviews and measures motion, so use it to remove animation as often as to add it.
6. If the deliverable is a claude.ai artifact, **web-artifacts-builder** builds multi-component HTML artifacts with React, Tailwind CSS and shadcn/ui, for the cases that need state management, routing or shadcn/ui components.

## Install the stack

```bash
npx skills add https://github.com/agiwhitelist/auteur
npx skills add https://github.com/anthropics/skills/tree/main/skills/web-artifacts-builder
npx skills add https://github.com/pbakaus/impeccable/tree/main/cursor-plugin/skills/impeccable
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/ui-animation
npx skills add https://github.com/avelikiy/great_cto/tree/main/skills/anydesign
npx skills add https://github.com/superdesigndev/superdesign-skill/tree/main/skills/superdesign
```

The [skills CLI](https://skills.sh/) works for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## What to check before you install

- Licenses: auteur, ui-animation, anydesign and superdesign are MIT; impeccable and web-artifacts-builder are Apache-2.0. Confirm the license file in each repository before you ship generated assets.
- Services: superdesign works on the Superdesign canvas with a choice of AI models, so expect accounts and model access. anydesign reads Figma files when you point it at them, which means Figma access for that input. web-artifacts-builder targets claude.ai artifacts specifically.
- Read each SKILL.md before you enable it. The directory has not security scanned any skill, and a design skill that generates assets is still instructions and code running in your project.

## FAQ

### Is impeccable alone enough?

For an interface that already exists, often yes: it is a set of playbooks for fixing what is there, and at about 379,000 installs recorded by skills.sh it is the most installed skill in this stack by a wide margin. Run its playbooks in order and you will fix most of what a visitor notices first. For a new product you still need something to build with, which is where auteur or web-artifacts-builder come in.

### Do these skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Does this stack cover mobile?

Partly. impeccable's playbooks cover frontend and native interface design, according to its summary, and anydesign will extract a token system from any screenshot you give it. auteur, superdesign and web-artifacts-builder are web-first. If the product is a native app, start with those two and pick a framework-specific skill from the directory for the build.
