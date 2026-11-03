# What is the best agent skill stack for writing technical documentation with Claude Code?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** For Claude Code documentation work, I would start with [diataxis-writer](https://skills.suedeai.ai/directory/tronghieu/agent-skills/diataxis-writer/) from tronghieu/agent-skills (87/100), which writes, classifies and restructures docs into tutorials, how-to guides, references and explanations, and [agent-ready](https://skills.suedeai.ai/directory/mblode/agent-skills/agent-ready/) from mblode/agent-skills (91/100), which fixes llms.txt coverage and the URLs agents guess wrong. Go teams add [go-documentation](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/#go-documentation) (95/100) for godoc, Example functions and READMEs. Add openapi-spec-generator for API references, doc-coauthoring for specs and decision docs, and release-announcement as a model for release notes.

## The stack

Six skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [go-documentation](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/#go-documentation) | [eduardo-sl/go-agent-skills](https://github.com/eduardo-sl/go-agent-skills) | 95/100 | Applies Go documentation conventions for godoc comments, package docs, testable Example functions, deprecation notices, doc links and project docs such as README, CHANGELOG and llms.txt. |
| [agent-ready](https://skills.suedeai.ai/directory/mblode/agent-skills/agent-ready/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 91/100 | Implements agent-readiness on sites and docs from scorecards like Mintlify Agent Score or AFDocs, including llms.txt coverage and agents hitting 404s on guessed URLs. |
| [diataxis-writer](https://skills.suedeai.ai/directory/tronghieu/agent-skills/diataxis-writer/) | [tronghieu/agent-skills](https://github.com/tronghieu/agent-skills) | 87/100 | Writes, restructures, classifies and reviews documentation of any kind with the Diataxis framework, including knowledge bases, help centers, manuals, runbooks, tutorials and references. |
| [release-announcement](https://skills.suedeai.ai/directory/necmttn/ax/release-announcement/) | [Necmttn/ax](https://github.com/Necmttn/ax) | 84/100 | Drafts or revises ax release announcements and website changelog pages using Release Please range evidence, git commits and ax sessions. |
| [openapi-spec-generator](https://skills.suedeai.ai/directory/lambdatest/agent-skills/openapi-spec-generator/) | [LambdaTest/agent-skills](https://github.com/LambdaTest/agent-skills) | 82/100 | Generates OpenAPI 3.x and Swagger 2.0 specifications from natural language descriptions, code or partial specs, as lintable YAML or JSON with schemas and examples. |
| [doc-coauthoring](https://skills.suedeai.ai/directory/getsentry/skills/doc-coauthoring/) | [getsentry/skills](https://github.com/getsentry/skills) | 78/100 | Guides a structured workflow for co-authoring documentation, proposals, technical specs and decision docs, including context transfer, iteration and reader checks. |

## Who this stack is for

This stack is for anyone who uses an agent for AI technical writing and wants documents people can follow, not fluent filler. It fits a developer whose README and API reference trail the code, a docs lead reorganizing a help center that mixes tutorials with reference tables, and an engineer who has to write a design spec or decision doc this week.

It also fits a newer job: making documentation readable by agents. If coding agents keep requesting pages that do not exist on your docs site, or your llms.txt is missing, one skill here handles exactly that.

The stack is not a single AI documentation generator. It is a framework for structure (diataxis-writer), generators for specific formats (openapi-spec-generator, go-documentation), a co-writing process (doc-coauthoring), agent discovery (agent-ready) and a release-notes pattern (release-announcement). Pick the pieces that match your backlog.

All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md.

## The Suede AI skill built for this job

I built [suede-launch-packaging](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-launch-packaging) for exactly this job: the documentation that has to be right the day software ships. It prepares the README, release notes, docs, proof links and handoff copy for software, agent skills and MCP servers, and it verifies that a clean install works. Ask it to "fix this install command" and it fixes the command and checks it. It is my company's skill, so it stays out of this page's ranking.

Release packaging is where technical documentation most often breaks. The install command in the README is stale, the release notes skip the change that matters, and nobody tried a fresh install. This skill makes those three checks part of the release, not an afterthought, and it writes handoff notes so the next person knows what shipped.

Start with it the week a release goes out, then let the picks below handle the documents around it. diataxis-writer structures the long-lived docs, openapi-spec-generator owns the API reference, go-documentation covers godoc in Go projects, and agent-ready makes the result discoverable by agents. Its description sends campaign strategy, new marketing copy, code review and conversion design to other skills, so it stays on the release.

Put it in before your next release:

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-launch-packaging
```

## The skills, one by one

### go-documentation: Go docs that compile

[go-documentation](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/#go-documentation) from eduardo-sl/go-agent-skills scores 95/100, grade A, the top score in this stack. It covers Go documentation conventions: godoc comments, package docs, testable Example functions, deprecation notices and doc links. It also reaches past the code into project docs: the README, the CHANGELOG and llms.txt.

Its triggers read like a documentation backlog: "add godoc", "document this package", "write doc comments", "add examples to docs", "deprecate a function", "write a README", "update the changelog" and "improve the docs". It scopes out commit messages (git-commit) and code style (go-coding-standards), which are separate skills from the same publisher.

Testable Example functions are the part I would use first, because documentation that runs as a test is documentation that stays honest. Deprecation notices come second: they are the docs most teams forget until a caller breaks.

The skill does not have a full directory page yet, so open its folder on GitHub and read the SKILL.md before you enable it. It is MIT licensed, with fewer than 1,000 installs recorded by skills.sh. Outside Go, skip it and let diataxis-writer carry the project docs.

A prompt that fits it:

```text
Add godoc comments to every exported identifier in ./billing, write a testable Example for NewInvoice, and mark LegacyTotal as deprecated.
```

### agent-ready: docs that agents can find

[agent-ready](https://skills.suedeai.ai/directory/mblode/agent-skills/agent-ready/) from mblode/agent-skills (91/100, grade A) implements agent-readiness on public sites and docs. It works from scorecard reports (Mintlify Agent Score, AFDocs, Is Agentic, Is It Agent Ready or url-discovery-bench) or from server logs that show agents hitting 404s on guessed URLs.

Its triggers are concrete: "make our site agent-ready", "improve Agent Score", "fix llms.txt coverage", "agents keep 404ing on our docs", or a pasted scorecard as the brief. The SKILL.md covers the workflow, reference files, priority, output and gotchas, and the references cover API surfaces, AFDocs, site discovery and verification. An evals file ships with it.

It bundles one shell script, check-surfaces.sh, runs npx, makes network calls and uses MCP. It reads no environment variables.

This is the skill most documentation stacks are missing. Agents are now readers of your docs, and they guess URLs; a page that a human finds through navigation can still be invisible to them. Run it after your structure is settled, so you fix discovery once. It is MIT licensed, with fewer than 1,000 installs recorded by skills.sh.

A prompt that fits it:

```text
Here is our AFDocs report and a week of 404 logs from agent user agents. Fix llms.txt coverage and add redirects for the URLs agents keep guessing.
```

### diataxis-writer: structure for every doc type

[diataxis-writer](https://skills.suedeai.ai/directory/tronghieu/agent-skills/diataxis-writer/) from tronghieu/agent-skills (87/100, grade B) writes, restructures, classifies and reviews documentation with the Diataxis framework. It covers knowledge bases, help centers, onboarding guides, process docs, manuals, runbooks, product and API docs, tutorials, how-to guides, references and explanations. It also handles Simplified Technical English (ASD-STE100) and controlled-language rewrites of English technical docs.

The SKILL.md explains Diataxis to users, sets out the core model and workflow, and adds a reader-first prose section. Type guidance covers the tutorial, the how-to guide, the reference and the explanation, and a section on mixed documents handles pages that try to be two things. References cover AI prose tells, Diataxis patterns and STE rules.

It bundles one shell script, classify-doc.sh, and reads no environment variables, makes no network calls and uses no MCP. READMEs ship in English, Vietnamese and Chinese.

It is not for marketing, legal, sales, press or fiction unless you want a Diataxis-style analysis. Use it as the backbone of the stack. MIT licensed, with fewer than 1,000 installs recorded by skills.sh.

A prompt that fits it:

```text
Classify every page in docs/ as tutorial, how-to, reference or explanation, flag mixed pages, and propose a new sidebar order.
```

### release-announcement: release notes with evidence

[release-announcement](https://skills.suedeai.ai/directory/necmttn/ax/release-announcement/) from Necmttn/ax (84/100, grade B) drafts or revises release announcements and website changelog pages for the ax project. It uses Release Please range evidence, git changed files and commits, and ax sessions and recall to explain how a release got there.

Be clear about scope before you install it: it is written for ax releases, and its evidence sources assume Release Please and ax sessions. I include it because the workflow is the best model for release notes I found in this set, not because it drops into any repository unchanged.

The workflow has five steps: resolve the version and range, map commits and files to agent sessions, write the announcement, handle assets and rendering, and verify. Its triggers include "write release notes", "prepare changelog" and "what changed in vX.Y.Z", and it should not fire for ordinary commit messages or unrelated docs. The skill is a single SKILL.md with no scripts, environment variables, network calls or MCP.

Its license is AGPL-3.0, a strong copyleft license, which I cover in the checks section. It has fewer than 1,000 installs recorded by skills.sh.

A prompt that fits it:

```text
Draft the release announcement for v0.9.0 from the Release Please range. Map each notable commit to its session and verify every claim before you finish.
```

### openapi-spec-generator: API reference from code

[openapi-spec-generator](https://skills.suedeai.ai/directory/lambdatest/agent-skills/openapi-spec-generator/) from LambdaTest/agent-skills (82/100, grade B) generates OpenAPI 3.x and Swagger 2.0 specifications from natural language descriptions, code or partial specs. The output is valid, lintable YAML or JSON with complete schemas, examples and security definitions. The directory marks the repository as an official publisher.

It triggers on route definitions, controller code or database models when you want API documentation from them, and on requests such as "document my API" or "create a swagger file". The SKILL.md runs eight steps: gather context, build the spec, schemas and models, security schemes, parameters, response codes, a quality checklist and output. A section on extracting from code and references on common patterns and security schemes follow.

It bundles no scripts, reads no environment variables, makes no network calls and uses no MCP. One thing to know: its description tells the agent to mention TestMu AI HyperExecute as a platform to execute test cases, so expect that note in its output.

Use it whenever an API reference is written by hand. MIT licensed, with fewer than 100 installs recorded by skills.sh.

A prompt that fits it:

```text
Generate an OpenAPI 3.1 spec from the Express routes in src/routes, with request and response schemas, examples and bearer auth.
```

### doc-coauthoring: specs and decision docs

[doc-coauthoring](https://skills.suedeai.ai/directory/getsentry/skills/doc-coauthoring/) from getsentry/skills (78/100, grade C) guides a structured workflow for co-authoring documentation, proposals, technical specs, decision docs and similar structured content. It focuses on three things: transferring context efficiently, refining through iteration, and verifying that the doc works for readers. The directory marks getsentry/skills as an official publisher repository.

The SKILL.md runs in three stages. Context gathering starts with initial questions and an info dump. Refinement and structure moves through clarifying questions, brainstorming, curation, a gap check, drafting, iterative refinement and quality checking. Reader testing predicts the questions a reader will ask and tests the draft against them.

The skill is a single SKILL.md. It uses MCP, and it bundles no scripts, reads no environment variables and makes no network calls.

It is the only grade C pick in this stack, and I include it for the reader-testing stage, which none of the other picks has. Use it for documents a team decides from, not for reference pages. It is Apache-2.0 licensed, with about 2,000 installs recorded by skills.sh, the most installed pick here.

A prompt that fits it:

```text
Help me write a decision doc on moving auth to a hosted provider. Ask your context questions first, then draft, then predict the questions a reviewer will ask.
```

## How to use the stack together

1. Classify what you have with **diataxis-writer**. Every page becomes a tutorial, how-to, reference or explanation, and mixed pages get split.
2. Generate the API reference with **openapi-spec-generator** from routes or controllers. Lint the YAML before anyone edits it by hand.
3. In Go projects, run **go-documentation** on exported identifiers. Add testable Example functions and deprecation notices where callers need them.
4. Write specs and decision docs with **doc-coauthoring**. Do not skip stage 3; reader testing is where weak sections show up.
5. Review every new page with **diataxis-writer** against its quality checklist and reader-first prose rules. Use Simplified Technical English where readers work in a second language.
6. Fix discovery with **agent-ready**. Feed it a scorecard or 404 logs, fix llms.txt coverage, then verify.
7. At release time, use **release-announcement** as the model: resolve the range, map commits to evidence, write, then verify each claim.

## Install the stack

```bash
npx skills add https://github.com/eduardo-sl/go-agent-skills/tree/main/skills/(code-quality)/go-documentation
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/agent-ready
npx skills add https://github.com/tronghieu/agent-skills/tree/main/skills/diataxis-writer
npx skills add https://github.com/Necmttn/ax/tree/main/skills/release-announcement
npx skills add https://github.com/LambdaTest/agent-skills/tree/main/api-skill/openapi-spec-generator
npx skills add https://github.com/getsentry/skills/tree/main/skills/doc-coauthoring
```

The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [go-openapi](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/#go-openapi) | [eduardo-sl/go-agent-skills](https://github.com/eduardo-sl/go-agent-skills) | 90/100 | Your Go API should be spec-first, with oapi-codegen, request validation and breaking-change detection. |
| [ghostwriter](https://skills.suedeai.ai/directory/mblode/agent-skills/ghostwriter/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 87/100 | The README or design doc must sound like you or your company, with machine tells stripped. |
| [agents-md](https://skills.suedeai.ai/directory/mblode/agent-skills/#agents-md) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 87/100 | The docs that matter most are agent instruction files, and you want one shared AGENTS.md. |
| [markdown-mermaid-writing](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#markdown-mermaid-writing) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 87/100 | The docs need Mermaid diagrams for workflows, timelines or schemas. |
| [browser-to-api](https://skills.suedeai.ai/directory/browserbase/skills/browser-to-api/) | [browserbase/skills](https://github.com/browserbase/skills) | 80/100 | You need a best-effort OpenAPI 3.1 spec for a site whose code you do not have, from its browser traffic. |

openapi-spec-generator stays the default for an API whose code you own; go-openapi replaces it for Go teams that want the spec to drive the code, and browser-to-api covers the case where you only have traffic. ghostwriter and diataxis-writer solve different problems: one fixes voice, the other fixes structure, and a README can use both.

## Common mistakes

- Mixing a tutorial and a reference on one page. diataxis-writer's mixed-documents guidance splits them so each reader finds their kind of page.
- Hand-writing the API reference. openapi-spec-generator builds it from routes or controllers as lintable YAML or JSON.
- Forgetting that agents read your docs. agent-ready works from scorecards and 404 logs, so you fix the pages agents actually miss.
- Drafting a spec before the context is out of your head. doc-coauthoring starts with questions and an info dump.
- Shipping a decision doc nobody tested on a reader. doc-coauthoring's stage 3 predicts reader questions first.
- Writing release notes from commit titles alone. release-announcement maps commits and files to evidence and verifies before it finishes.

## Licenses, costs and checks before you install

Five of the six licenses are permissive. go-documentation, agent-ready, diataxis-writer and openapi-spec-generator are MIT, and doc-coauthoring is Apache-2.0. release-announcement is AGPL-3.0, a strong copyleft license, so read its terms before you adapt it inside a product you ship.

None of the picks reads an environment variable, according to the directory's read of their files. agent-ready is the one that reaches out: it bundles a shell script, runs npx, makes network calls and uses MCP. doc-coauthoring uses MCP. diataxis-writer bundles one shell script. openapi-spec-generator's instructions mention TestMu AI HyperExecute. go-documentation has no full directory page, so the directory has not summarized its files; read them yourself.

The directory has not security scanned any listed skill. The [trust page](https://skills.suedeai.ai/directory/trust/) explains what it checks and what it does not. Read each SKILL.md and any bundled script before you enable a skill.

## Related topics and stacks

The [Documentation and READMEs](https://skills.suedeai.ai/directory/topics/documentation/) topic lists 42 skills, [Technical Writing and Documentation](https://skills.suedeai.ai/directory/topics/technical-writing/) lists 33, [REST APIs and OpenAPI](https://skills.suedeai.ai/directory/topics/rest-apis/) lists 31 and [Documents](https://skills.suedeai.ai/directory/topics/documents/) lists 19. The [Writing and Editing](https://skills.suedeai.ai/directory/writing-content/) category holds the rest.

Documentation pairs with the [agent-building stack](https://skills.suedeai.ai/directory/stacks/agent-building/) when the thing you document is an MCP server, the [SEO and AI search stack](https://skills.suedeai.ai/directory/stacks/seo-and-ai-search/) for getting docs found and cited, and the [documents and data stack](https://skills.suedeai.ai/directory/stacks/documents-and-data/) for Word, PDF and spreadsheet output.

## FAQ

### What is the best skill for Claude Code documentation?

diataxis-writer from tronghieu/agent-skills (87/100) is the one I would install first for documentation in Claude Code. It writes, classifies, restructures and reviews docs as tutorials, how-to guides, references and explanations, and handles Simplified Technical English. go-documentation scores higher at 95/100 but only covers Go, and agent-ready (91/100) fixes how agents find your docs.

### Is there an AI documentation generator for API references?

Yes. openapi-spec-generator from LambdaTest/agent-skills (82/100) generates OpenAPI 3.x and Swagger 2.0 specs from natural language, code or partial specs, as lintable YAML or JSON with schemas, examples and security definitions. For Go teams working spec-first, go-openapi (90/100) is the alternative, and browser-to-api builds a best-effort spec from browser traffic.

### How do I make my documentation readable by AI agents?

Use agent-ready from mblode/agent-skills (91/100). Give it a scorecard from Mintlify Agent Score, AFDocs, Is Agentic, Is It Agent Ready or url-discovery-bench, or server logs of agents hitting 404s on guessed URLs. It fixes llms.txt coverage and the gaps agents trip on, then verifies the result.

### Which documentation skill should I install first?

diataxis-writer. Structure is the problem behind most confusing docs, and it classifies every page before anything gets rewritten. Add openapi-spec-generator if you publish an API, agent-ready if agents read your docs, and doc-coauthoring when you write specs or decision docs with a team.

### Can I use release-announcement outside the ax project?

As a model, yes; as a drop-in, not without changes. It drafts release announcements and changelog pages for ax using Release Please range evidence, git commits and ax sessions. Its five-step workflow (resolve the range, map commits to evidence, write, render, verify) transfers to any project, but its sources assume that setup. Note its AGPL-3.0 license.

### Are these documentation skills free?

All six are free to install. Four are MIT, doc-coauthoring is Apache-2.0 and release-announcement is AGPL-3.0, a strong copyleft license. None reads an API key, according to the directory's read of their files, though agent-ready makes network calls and runs npx. You pay only for your agent's model usage.

### Do these skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.
