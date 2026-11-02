# Which agent skills help you rank in Google and get cited by AI?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 2, 2026.

**Short answer:** [seo-dataforseo](https://skills.suedeai.ai/directory/agricidaniel/claude-seo/seo-dataforseo/) from AgriciDaniel/claude-seo (88/100) is the one skill here that pulls live search data, including AI visibility tracking, so it anchors the stack. Pair it with [nextjs-developer](https://skills.suedeai.ai/directory/jeffallan/claude-skills/nextjs-developer/) from jeffallan/claude-skills (84/100) for the metadata and server rendering that decide what a crawler sees, and [add-webmcp](https://skills.suedeai.ai/directory/browserbase/skills/add-webmcp/) from browserbase/skills (83/100) to expose first-party WebMCP tools that agents can find and call. tool-design covers how to describe those tools so an agent actually uses them.

## The stack

Four skills, in score order. This is a short stack on purpose: the measurement and the technical base come from skills, and the writing that earns a citation is still editorial work. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [seo-dataforseo](https://skills.suedeai.ai/directory/agricidaniel/claude-seo/seo-dataforseo/) | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | 88/100 | Pulls live SEO data through the DataForSEO server, including SERP analysis, keyword research, backlink profiles, on-page and competitor analysis, and AI visibility tracking. |
| [tool-design](https://skills.suedeai.ai/directory/muratcankoylan/agent-skills-for-context-engineering/tool-design/) | [muratcankoylan/Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) | 86/100 | Guides the tool-interface layer of agent systems, including tool descriptions, schemas, response formats, error recovery messages and MCP server design. |
| [nextjs-developer](https://skills.suedeai.ai/directory/jeffallan/claude-skills/nextjs-developer/) | [jeffallan/claude-skills](https://github.com/jeffallan/claude-skills) | 84/100 | Guides building Next.js 14+ applications with App Router, server components and server actions, including route handlers, middleware, streaming SSR, metadata and Vercel deployment. |
| [add-webmcp](https://skills.suedeai.ai/directory/browserbase/skills/add-webmcp/) | [browserbase/skills](https://github.com/browserbase/skills) | 83/100 | Analyzes an existing web application for safe user-visible capabilities, implements first-party WebMCP tools, and validates discovery and invocation with Stagehand. |

## How to use it

1. Run **seo-dataforseo** first and record a baseline: the SERP for the queries you care about, keyword research, your backlink profile, and the on-page and competitor analysis. Its AI visibility tracking is the number most SEO tooling still does not report, so write it down before you change anything.
2. Fix the technical base with **nextjs-developer** if you are on Next.js 14 or later. It covers App Router, server components, route handlers, middleware, streaming SSR and metadata. A page that renders its content on the server, with correct metadata, is a page a crawler can read in full.
3. Write for the answer, not the keyword. No skill in this stack does this for you. Put the direct answer in the first paragraph, use question headings, state specific facts with sources, and use one consistent name for your company and product everywhere it appears. That is my reading of what gets lifted into an AI answer, and it is also plain good writing.
4. Use **add-webmcp** to analyze the application for safe, user-visible capabilities, implement first-party WebMCP tools, and validate discovery and invocation with Stagehand. Ranking gets you read by a crawler; this gets you used by an agent.
5. Bring in **tool-design** when you write those tools. It covers tool descriptions, schemas, response formats and error recovery messages. A tool an agent cannot understand is a tool it will not call.
6. Re-run seo-dataforseo on a schedule and compare the AI visibility figures against the baseline from step 1. A change without a baseline is an anecdote.

## Install the stack

```bash
npx skills add https://github.com/AgriciDaniel/claude-seo/tree/main/skills/seo-dataforseo
npx skills add https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/main/skills/tool-design
npx skills add https://github.com/jeffallan/claude-skills/tree/main/skills/nextjs-developer
npx skills add https://github.com/browserbase/skills/tree/main/skills/add-webmcp
```

The [skills CLI](https://skills.sh/) works for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## What to check before you install

- Licenses: all four are MIT. Confirm the license file in each repository anyway; a directory field is a record, not a legal review.
- Services: seo-dataforseo needs a DataForSEO account and its server, and it sends your queries there. add-webmcp validates with Stagehand, so expect to set that up. nextjs-developer mentions Vercel deployment, which only matters if that is where you host.
- Read each SKILL.md before you enable it, and read what it sends to outside services with your credentials. The directory has not security scanned any skill.

## FAQ

### Why is this stack so small?

Because four skills cover the measurable parts of the job and the rest is writing. The directory lists more SEO skills in its Marketing and SEO category, including audit, schema and content-brief skills, and I would add them once the baseline and the technical base are in place. Stacking ten SEO skills before you have a measurement is how a team ends up busy and unranked.

### Do these skills work in Codex and Cursor?

Yes. All four use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Does any of these skills guarantee a citation in an AI answer?

No, and none of them claims to. seo-dataforseo tracks AI visibility, so you can measure whether you are being cited. Whether you are cited depends on the page: a clean answer, specific facts, a consistent name, and a site that renders completely. Measure, fix, write, measure again.
