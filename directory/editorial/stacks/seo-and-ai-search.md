# Which agent skills help you rank in Google and get cited by AI?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) from mblode/agent-skills (87/100) audits and fixes technical SEO, researches search demand and measures SEO, AEO and GEO (generative engine optimization) performance, so it anchors the stack. Pair it with [nextjs-developer](https://skills.suedeai.ai/directory/jeffallan/claude-skills/nextjs-developer/) from jeffallan/claude-skills (84/100) for the metadata and server rendering that decide what a crawler sees, and [add-webmcp](https://skills.suedeai.ai/directory/browserbase/skills/add-webmcp/) from browserbase/skills (83/100) to expose first-party WebMCP tools that agents can find and call. [tool-design](https://skills.suedeai.ai/directory/muratcankoylan/agent-skills-for-context-engineering/tool-design/) covers how to describe those tools so an agent actually uses them.

## The stack

Four skills, in score order. This is a short stack on purpose: the measurement and the technical base come from skills, and the writing that earns a citation is still editorial work. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 87/100 | Audits and fixes technical SEO, researches search demand, creates content briefs, and measures SEO, AEO and GEO performance. |
| [tool-design](https://skills.suedeai.ai/directory/muratcankoylan/agent-skills-for-context-engineering/tool-design/) | [muratcankoylan/Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) | 86/100 | Guides the tool-interface layer of agent systems, including tool descriptions, schemas, response formats, error recovery messages and MCP server design. |
| [nextjs-developer](https://skills.suedeai.ai/directory/jeffallan/claude-skills/nextjs-developer/) | [jeffallan/claude-skills](https://github.com/jeffallan/claude-skills) | 84/100 | Guides building Next.js 14+ applications with App Router, server components and server actions, including route handlers, middleware, streaming SSR, metadata and Vercel deployment. |
| [add-webmcp](https://skills.suedeai.ai/directory/browserbase/skills/add-webmcp/) | [browserbase/skills](https://github.com/browserbase/skills) | 83/100 | Analyzes an existing web application for safe user-visible capabilities, implements first-party WebMCP tools, and validates discovery and invocation with Stagehand. |

## Who this stack is for

This stack is for the person who owns organic traffic and now has to answer two questions: whether the site ranks, and whether AI answers cite it. That might be a founder whose product never appears in AI answers, an SEO lead asked to report on AI search optimization for the first time, a developer running a Next.js marketing site, or a team that wants AI agents to use its website, not only read it.

It covers three layers. The first is measurement: what you rank for and whether AI answers cite you. The second is the technical base: server-rendered pages with correct metadata. The third is agent access: first-party tools an agent can discover and call. If you only need the first layer, [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) alone does the job.

It is not a content factory. None of these skills writes the article that earns the citation, and none of them claims to.

All four skills use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. A Claude Code SEO session and a Codex one can share the stack.

## The Suede AI skill built for this job

I built [suede-seo-audit](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-seo-audit) for exactly this job: a complete SEO audit that ends in exact fixes. It audits technical access, search intent, metadata, links, schema, generative search, copy, E-E-A-T and topic architecture, grades each of those lanes from A to F, and names the fix for every finding. It includes offline source-review tools as well, and the output is a scored report, not a loose list of observations.

Start with it when someone asks you to "audit this site for SEO," when you need to investigate a traffic or indexation problem, or when a client or a team needs a scored report. It owns the diagnosis, and that makes the stack below work harder. [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) gets a lane-by-lane list to measure against its SEO, AEO and GEO baseline. [nextjs-developer](https://skills.suedeai.ai/directory/jeffallan/claude-skills/nextjs-developer/) gets the metadata, schema and rendering fixes to implement. [add-webmcp](https://skills.suedeai.ai/directory/browserbase/skills/add-webmcp/) comes in once the technical base is clean, so the tools it exposes sit on pages a crawler can read. AI crawler and citation measurement and conversion-path changes go to other skills, so the audit stays on search.

It is Suede AI's skill, so it stays out of the ranking below. Run it before anything else:

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-seo-audit
```

## The skills, one by one

### seo: SEO, AEO and GEO measurement

[seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) from mblode/agent-skills audits and fixes technical SEO, researches search demand, creates content briefs, and measures SEO, AEO and GEO performance. GEO, generative engine optimization, is about being cited in AI answers, and it is the number most SEO tooling still does not report. The skill scores 87/100 (grade B), is MIT licensed, and has fewer than 1,000 installs recorded by skills.sh.

Its triggers read like the requests teams actually send: "audit SEO," "fix indexing," "improve AI visibility," "do AEO or GEO," "check keyword volume," "write an SEO brief" and "why did organic traffic drop." The description also draws its own boundaries. Mintlify Agent Score, AFDocs and Is Agentic reports go to a sibling skill, agent-ready. Article writing goes to ghostwriter, and visual redesign goes to ui-design.

The directory has no full page for seo yet, so its files are not summarized here. Before you trust a keyword-volume figure from it, read its SKILL.md for the data source it expects.

Use it first and last: first to record a baseline, last to measure what changed. Do not expect it to write the page; that is a separate skill by design.

Ask for the baseline in one go:

```text
Audit example.com for technical SEO and record a baseline: indexing issues, search demand for our top ten queries, and our current SEO, AEO and GEO performance. Save it as baseline.md.
```

### tool-design: tool descriptions an agent will actually call

[tool-design](https://skills.suedeai.ai/directory/muratcankoylan/agent-skills-for-context-engineering/tool-design/) guides the tool-interface layer of an agent system: tool descriptions agents can route on, schemas and response formats, naming conventions, actionable error recovery messages, MCP server design, tool-set consolidation, and when to add or remove a tool. It scores 86/100 (grade B), is MIT licensed, and has fewer than 1,000 installs recorded by skills.sh.

It belongs in an SEO stack because of what [add-webmcp](https://skills.suedeai.ai/directory/browserbase/skills/add-webmcp/) produces. Once your site exposes features as tools, the tool description does the job a meta description does for a search result: it is what an agent reads before deciding to call you. A vague one gets skipped.

The SKILL.md is thorough. Sections cover the tool-agent interface, the consolidation principle, architectural reduction, tool description engineering, response format optimization, error message design, the tool definition schema, MCP tool naming requirements, using agents to optimize tools, and testing tool design, ending with a tool selection framework. The files bundle 1 Python script, a description generator, plus references on architectural reduction and best practices. They list no outside hosts and read no environment variables.

Its scope is a single tool or a set of tools. Project shape and pipeline architecture go to project-development, and the sub-agent question goes to multi-agent-patterns.

Hand it the tools you already have:

```text
Review the five WebMCP tools in src/agent-tools. Rewrite each description so an agent can tell when to call it, tighten the schemas, and make every error message say how to recover.
```

### nextjs-developer: metadata and server rendering crawlers can read

[nextjs-developer](https://skills.suedeai.ai/directory/jeffallan/claude-skills/nextjs-developer/) guides building Next.js 14+ applications with App Router, server components and server actions. It covers route handlers, middleware, API routes, streaming SSR, generateMetadata for SEO, loading.tsx and error.tsx boundaries, and deployment to Vercel. It scores 84/100 (grade B), is MIT licensed, and has about 6,000 installs recorded by skills.sh, the most in this stack.

For search, the part that matters is what a crawler receives. A page that renders its content on the server, with correct titles and descriptions from generateMetadata, is a page that can be read in full. The SKILL.md includes a worked code example titled "generateMetadata for dynamic SEO," next to examples for a server component with data fetching and caching and a server action with form handling and revalidation.

The rest of the file is a core workflow, a reference guide, MUST DO and MUST NOT DO constraints, output templates and a knowledge reference. References cover the App Router, data fetching, deployment, server actions and server components. It bundles no scripts and lists no outside hosts.

Use it if your site runs on Next.js 14 or later. On another framework it has nothing to offer this stack, so skip it.

Point it at the routes that matter:

```text
Our /pricing and /docs routes render client-side and share one title tag. Move them to server components and write generateMetadata for each with unique titles, descriptions and canonical URLs.
```

### add-webmcp: first-party WebMCP tools agents can find and call

[add-webmcp](https://skills.suedeai.ai/directory/browserbase/skills/add-webmcp/) analyzes an existing web application, identifies safe user-visible capabilities across routes, forms, server actions, handlers and schemas, implements first-party WebMCP tools, and validates discovery and invocation with Stagehand. It is an official skill from browserbase/skills, scores 83/100 (grade B), is MIT licensed, and has fewer than 1,000 installs recorded by skills.sh.

The SKILL.md is a seven-step procedure: establish the application boundary, build a capability inventory, design the tool contract, integrate with the application, verify the implementation, adversarially verify that the tools actually worked, and report the result. Step six is the one I value most, because a tool that registers but fails on invocation is worse than no tool.

The files are the most active in this stack. They bundle 5 JavaScript scripts and 1 TypeScript script, including scan-codebase.mjs and validate-stagehand.mjs, they make network calls, and they read the BROWSERBASE_API_KEY environment variable. A quality rubric, an implementation and validation reference, and test fixtures with a sample Next app round it out.

Use it when you want to make a codebase agent-ready and add WebMCP directly to the app. Its description sends standalone injection scripts generated from a URL elsewhere.

Start with the inventory, not the code:

```text
Scan this app and build a capability inventory of user-visible actions an agent could take: search the catalog, check stock, start a quote. Propose WebMCP tool contracts before implementing any.
```

## How to use the stack together

1. Run [**seo**](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) first and record a baseline: a technical audit, the search demand for the queries you care about, and your SEO, AEO and GEO performance. AEO and GEO are the numbers most SEO tooling still does not report, so write them down before you change anything.
2. Fix the technical base with [**nextjs-developer**](https://skills.suedeai.ai/directory/jeffallan/claude-skills/nextjs-developer/) if you are on Next.js 14 or later. It covers App Router, server components, route handlers, middleware, streaming SSR and metadata. A page that renders its content on the server, with correct metadata, is a page a crawler can read in full.
3. Write for the answer, not the keyword, using the brief from **seo** as the outline. No skill in this stack writes the page for you. Put the direct answer in the first paragraph, use question headings, state specific facts with sources, and use one consistent name for your company and product everywhere.
4. Use [**add-webmcp**](https://skills.suedeai.ai/directory/browserbase/skills/add-webmcp/) to analyze the application for safe, user-visible capabilities, implement first-party WebMCP tools, and validate discovery and invocation with Stagehand. Ranking gets you read by a crawler; this gets you used by an agent.
5. Bring in [**tool-design**](https://skills.suedeai.ai/directory/muratcankoylan/agent-skills-for-context-engineering/tool-design/) when you write those tools. It covers tool descriptions, schemas, response formats and error recovery messages. A tool an agent cannot understand is a tool it will not call.
6. Re-run **seo** on a schedule and compare the AEO and GEO figures against the baseline from step 1. A change without a baseline is an anecdote.

## Install the stack

```bash
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/seo
npx skills add https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/main/skills/tool-design
npx skills add https://github.com/jeffallan/claude-skills/tree/main/skills/nextjs-developer
npx skills add https://github.com/browserbase/skills/tree/main/skills/add-webmcp
```

The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [schema](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#schema) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 90/100 | You need JSON-LD structured data for rich results: FAQ, product, review or breadcrumb schema. Add it next to [nextjs-developer](https://skills.suedeai.ai/directory/jeffallan/claude-skills/nextjs-developer/). |
| [seo-audit](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#seo-audit) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | The problem is diagnosis rather than measurement: lost rankings, Core Web Vitals, crawl errors, local SEO or a Google Business Profile. |
| [programmatic-seo](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#programmatic-seo) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | You plan many similar pages from templates and data, such as location, integration or comparison pages. |
| [competitors](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#competitors) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | The queries you need to win are "X vs Y" and "X alternative" searches, and you want comparison pages built or audited. |
| [directory-submissions](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#directory-submissions) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 83/100 | The site is new and needs backlinks and discovery from startup, SaaS, AI, MCP and review directories. |

seo-audit is the most installed of these, with about 244,000 installs recorded by skills.sh, and programmatic-seo has about 154,000. Install counts tell you what is popular, not what fits. My rule: keep [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) when you need a baseline you can measure against, and add seo-audit when you already know something is broken and need it found.

## Common mistakes

- Changing pages before recording a baseline. Run [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) first, or you will never know whether AEO and GEO moved.
- Shipping client-rendered content to crawlers. [nextjs-developer](https://skills.suedeai.ai/directory/jeffallan/claude-skills/nextjs-developer/) moves pages to server components with generateMetadata, so the crawler sees the whole page.
- One title tag across many routes. generateMetadata per route fixes it at the source.
- Exposing every button as an agent tool. [add-webmcp](https://skills.suedeai.ai/directory/browserbase/skills/add-webmcp/) starts from an application boundary and a capability inventory, which keeps the tool set to actions users can already see.
- Writing tool descriptions like internal notes. [tool-design](https://skills.suedeai.ai/directory/muratcankoylan/agent-skills-for-context-engineering/tool-design/) treats the description as the routing signal an agent depends on.
- Trusting a tool because it registered. add-webmcp adversarially verifies invocation before it reports the result.
- Expecting a skill to write the answer for you. The stack measures and builds the base; the page that gets cited is still editorial work.

## Licenses, costs and checks before you install

Licenses: [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo), [tool-design](https://skills.suedeai.ai/directory/muratcankoylan/agent-skills-for-context-engineering/tool-design/), [nextjs-developer](https://skills.suedeai.ai/directory/jeffallan/claude-skills/nextjs-developer/) and [add-webmcp](https://skills.suedeai.ai/directory/browserbase/skills/add-webmcp/) are all MIT. Confirm the license file in each repository anyway; a directory field is a record, not a legal review.

Services and credentials: add-webmcp is the only skill here whose files read a credential. Its scripts read BROWSERBASE_API_KEY and make network calls, and it validates with Stagehand, so expect to set that up. nextjs-developer mentions Vercel deployment, which only matters if that is where you host. tool-design's files list no outside hosts and no environment variables. seo's files are not summarized by the directory, so check its SKILL.md for any data source or API key it expects.

Checks: the directory scores structure and evidence in a skill's files, as its [methodology](https://skills.suedeai.ai/directory/methodology/) explains. It has not security scanned any listed skill, and a listing is not a safety guarantee; the [trust page](https://skills.suedeai.ai/directory/trust/) says what is checked. Read each SKILL.md before you enable it, and read what it sends to outside services with your credentials.

## Related topics and stacks

The [SEO](https://skills.suedeai.ai/directory/topics/seo/) topic lists 103 skills, and [AI Search Visibility](https://skills.suedeai.ai/directory/topics/ai-search-visibility/) lists 26. For the agent-access layer, see [MCP Servers](https://skills.suedeai.ai/directory/topics/mcp-servers/) (82) and [Browser Agents and Computer Use](https://skills.suedeai.ai/directory/topics/browser-agents/) (29), and for the technical base, [React and Next.js](https://skills.suedeai.ai/directory/topics/react-nextjs/) (30). The full [Marketing and SEO](https://skills.suedeai.ai/directory/marketing-seo/) category has the rest.

Pair this with the [landing page stack](https://skills.suedeai.ai/directory/stacks/landing-page/) when the page also has to convert, the [content and social stack](https://skills.suedeai.ai/directory/stacks/content-and-social/) for the writing this stack leaves to you, and the [agent-building stack](https://skills.suedeai.ai/directory/stacks/agent-building/) if your WebMCP tools grow into an MCP server.

## FAQ

### Which skill measures whether AI answers cite my pages?

Generative engine optimization (GEO) is the work of getting your pages cited in AI-generated answers rather than only ranked in search results. In this stack, [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) from mblode/agent-skills (87/100) measures SEO, AEO and GEO performance, so you can record a baseline and see whether changes move it. It measures; it does not write the cited page for you.

### What are the best AI SEO tools for Claude Code?

As agent skills, I would start with [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) (87/100) for audits, search demand and SEO, AEO and GEO measurement, then add [nextjs-developer](https://skills.suedeai.ai/directory/jeffallan/claude-skills/nextjs-developer/) (84/100) for server rendering and metadata on Next.js sites. [add-webmcp](https://skills.suedeai.ai/directory/browserbase/skills/add-webmcp/) (83/100) and [tool-design](https://skills.suedeai.ai/directory/muratcankoylan/agent-skills-for-context-engineering/tool-design/) (86/100) cover agent access. All four install into Claude Code with the skills CLI.

### Why is this stack so small?

Because four skills cover the measurable parts of the job and the rest is writing. The directory lists more SEO skills in its Marketing and SEO category, including audit, schema and content-brief skills, and I would add them once the baseline and the technical base are in place. Stacking ten SEO skills before you have a measurement is how a team ends up busy and unranked.

### Do these skills work in Codex and Cursor?

Yes. All four use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Does any of these skills guarantee a citation in an AI answer?

No, and none of them claims to. [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) measures AEO and GEO performance, so you can measure whether you are being cited. Whether you are cited depends on the page: a clean answer, specific facts, a consistent name, and a site that renders completely. Measure, fix, write, measure again.

### Which AI search optimization skill should I install first?

[seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo), because every other step is judged against the baseline it records. Add [nextjs-developer](https://skills.suedeai.ai/directory/jeffallan/claude-skills/nextjs-developer/) next if your site runs on Next.js 14 or later. Leave [add-webmcp](https://skills.suedeai.ai/directory/browserbase/skills/add-webmcp/) and [tool-design](https://skills.suedeai.ai/directory/muratcankoylan/agent-skills-for-context-engineering/tool-design/) until the pages themselves render cleanly, since agent tools on a broken site do not help anyone.

### Are these skills free?

All four are MIT licensed. The cost to plan for is in the services they touch: [add-webmcp](https://skills.suedeai.ai/directory/browserbase/skills/add-webmcp/) reads a BROWSERBASE_API_KEY and validates with Stagehand, and [nextjs-developer](https://skills.suedeai.ai/directory/jeffallan/claude-skills/nextjs-developer/) mentions Vercel deployment. The files of [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) are not summarized by the directory, so check its SKILL.md for any keyword data source or key it expects before you rely on it.
