# Which agent skills should you stack to build agents and MCP servers?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** To build an MCP server, start with [mcp-builder](https://skills.suedeai.ai/directory/anthropics/skills/mcp-builder/) from anthropics/skills (89/100), with about 136,000 installs recorded by skills.sh: it guides a server in Python with FastMCP or TypeScript with the MCP SDK, from research to evaluations. For the agent itself, add [prompt-optimizer](https://skills.suedeai.ai/directory/getsentry/skills/prompt-optimizer/) from getsentry/skills (81/100) for agent and system prompts and their evals, and [context-optimization](https://skills.suedeai.ai/directory/muratcankoylan/agent-skills-for-context-engineering/context-optimization/) (86/100) to keep the context budget under control. For multi-agent work, slicing-code-context, grok-build and executing-plans cover delegation, and aws-agentic-ai covers deployment on Bedrock AgentCore.

## The stack

Seven skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [mcp-builder](https://skills.suedeai.ai/directory/anthropics/skills/mcp-builder/) | [anthropics/skills](https://github.com/anthropics/skills) | 89/100 | Guides building MCP servers that let LLMs use external services through tools, in Python with FastMCP or TypeScript with the MCP SDK. |
| [slicing-code-context](https://skills.suedeai.ai/directory/trailofbits/skills/slicing-code-context/) | [trailofbits/skills](https://github.com/trailofbits/skills) | 89/100 | Selects bounded, graph-informed source slices with Trailmark and delegates focused code analysis or patch-proposal work to a smaller subagent. |
| [grok-build](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/grok-build/) | [sanjay3290/ai-skills](https://github.com/sanjay3290/ai-skills) | 87/100 | Delegates well-specified implementation tasks to xAI's Grok Build CLI running headlessly while the assistant writes task specs, reviews every diff and owns the result. |
| [context-optimization](https://skills.suedeai.ai/directory/muratcankoylan/agent-skills-for-context-engineering/context-optimization/) | [muratcankoylan/Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) | 86/100 | Improves context efficiency through context budgeting, observation masking, KV-cache strategy, partitioning and token-cost reduction. |
| [executing-plans](https://skills.suedeai.ai/directory/obra/superpowers/executing-plans/) | [obra/superpowers](https://github.com/obra/superpowers) | 83/100 | Guides executing an implementation plan inline in the current session as the implementer, when inline execution is chosen or no subagent tool is available. |
| [aws-agentic-ai](https://skills.suedeai.ai/directory/zxkane/aws-skills/aws-agentic-ai/) | [zxkane/aws-skills](https://github.com/zxkane/aws-skills) | 83/100 | Guides deploying and managing AI agents on AWS Bedrock AgentCore, including MCP tool integration and governance workflows. |
| [prompt-optimizer](https://skills.suedeai.ai/directory/getsentry/skills/prompt-optimizer/) | [getsentry/skills](https://github.com/getsentry/skills) | 81/100 | Creates and refines agent, system and developer prompts and templates, ports prompts between OpenAI, Claude and Gemini, and builds prompt evals. |

## Who this stack is for

This stack is for people who build AI agents, not only use them. The common case is a developer who wants Claude Code to reach an internal API or database, which means an MCP server. Next is the team turning a prototype into an agent that holds up: a prompt contract, evals and a context budget that survives a long session.

It also fits engineers running multi-agent setups, where one model plans and others implement, and who need the delegated work kept small and reviewed. Platform teams deploying agents on AWS get a deployment skill for Bedrock AgentCore.

You do not need all seven on day one: mcp-builder and prompt-optimizer cover a single agent with tools, and the rest join as sessions grow, agents multiply or you deploy to AWS.

All seven use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md.

## The Suede AI skill built for this job

I built [suede-agent-teams](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-agent-teams) for exactly this job: splitting one shared change across several agents without them stepping on each other. Ask it to "split this work across agents" and it runs the change in lanes with exclusive file ownership, collision checks, worktrees, rollback plans and evidence handoffs. It also runs bounded contribution programs. It is my company's skill, so it stays out of this page's ranking.

The value is in the decisions it makes before any agent writes a line: which lane owns which files, where lanes overlap, how each lane rolls back and what evidence it hands back. Those decisions sink a multi-agent build when nobody owns them.

Start with it the moment a build needs a second agent. It owns the lane plan and handoffs, and the picks below work inside each lane: slicing-code-context hands a subagent a bounded slice, grok-build runs well-specified tasks headlessly, executing-plans covers a lane you run inline, and context-optimization keeps each lane inside its budget. Its description sends diff review, CI wiring and skill selection elsewhere, so it stays on coordination.

Put it in before the second agent starts:

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-agent-teams
```

## The skills, one by one

### mcp-builder: MCP servers in Python or TypeScript

[mcp-builder](https://skills.suedeai.ai/directory/anthropics/skills/mcp-builder/) from anthropics/skills (89/100, grade B) is a guide for creating high-quality MCP (Model Context Protocol) servers that let LLMs reach external services through well-designed tools. It covers Python with FastMCP and Node or TypeScript with the MCP SDK. The directory marks anthropics/skills as an official publisher repository.

Its SKILL.md runs a four-phase workflow: deep research and planning, implementation, review and test, and creating evaluations. A documentation library tells the agent what to load when, from core MCP docs first to the evaluation guide in phase 4. References cover MCP best practices and Python and Node server patterns.

It bundles two Python scripts, connections.py and evaluation.py, with an example evaluation file. It makes network calls and uses MCP, and it reads no environment variables.

Reach for it whenever an agent needs a system it cannot otherwise reach. Skip it when files and a shell will do. It is Apache-2.0 licensed, with about 136,000 installs recorded by skills.sh, about 4,000 of them in the last week.

A prompt that fits it:

```text
Build a TypeScript MCP server for our ticketing API with search_tickets and create_ticket tools, then write ten evaluation questions for it.
```

### slicing-code-context: bounded context for subagents

[slicing-code-context](https://skills.suedeai.ai/directory/trailofbits/skills/slicing-code-context/) from trailofbits/skills (89/100, grade B) selects bounded, graph-informed source slices with Trailmark and delegates focused code analysis or patch-proposal work to a smaller subagent. It is built for offloading function, class, caller, callee, call-path, entrypoint or line-focused tasks to constrained or locally hosted models without exposing the full repository. The directory marks trailofbits/skills as an official publisher repository.

The SKILL.md opens with when to use it, when not to, and rationalizations to reject. The workflow has five steps: define the worker task and anchors, build the packet, delegate without leaking context, validate the response, and permit one focused expansion. Error handling and worked examples follow.

It bundles two Python scripts, a packet builder and its test, with a pyproject file and lock file. It reads no environment variables, makes no network calls and uses no MCP.

Use it when a smaller or local model should see a slice, not the codebase. Its license is CC-BY-SA-4.0, a share-alike license, and it has about 1,000 installs recorded by skills.sh.

A prompt that fits it:

```text
Slice the call path from handleWebhook to persistEvent and send only that packet to the local model for a patch proposal on the retry bug.
```

### grok-build: delegate implementation to Grok Build

[grok-build](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/grok-build/) from sanjay3290/ai-skills (87/100, grade B) delegates well-specified implementation tasks to xAI's Grok Build CLI running headlessly. Your assistant stays in charge: it plans, writes the task specs, reviews every diff and owns the result. It executes a Markdown implementation plan task by task, or ad hoc tasks with an inline spec.

The SKILL.md starts with when to delegate and when to keep work with the orchestrator, then a one-time session preflight and a sequential per-task loop as the default. A task spec template and a section on Markdown plans follow. Parallel dispatch is an opt-in exception, and failure handling and model notes close it.

The skill bundles no scripts, reads no environment variables and uses no MCP, but it depends on the Grok Build CLI to do anything.

Use it when a second model should do implementation while your main agent keeps the review. It is Apache-2.0 licensed, with fewer than 100 installs recorded by skills.sh.

A prompt that fits it:

```text
Use grok to execute docs/plans/rate-limiter.md task by task. Write a spec for each task and review each diff before the next dispatch.
```

### context-optimization: the context budget

[context-optimization](https://skills.suedeai.ai/directory/muratcankoylan/agent-skills-for-context-engineering/context-optimization/) from muratcankoylan/Agent-Skills-for-Context-Engineering (86/100, grade B) improves context efficiency: context budgeting, observation masking, prefix or KV-cache strategy, partitioning, token-cost reduction and retrieval scoping. The aim is to extend effective context capacity without lowering answer quality.

The SKILL.md covers when to activate it and the core concepts, then detailed topics: compaction strategies, observation masking, KV-cache optimization, context partitioning and budget management. Practical guidance adds an optimization decision framework and performance targets, followed by examples, guidelines, gotchas and integration notes.

It bundles one Python script, compaction.py, plus a reference on optimization techniques. It reads no environment variables, makes no network calls and uses no MCP.

Reach for it before you add a second agent or a long-running loop, because context problems multiply with every agent. If token costs surprise you, this is the first skill I would read. It is MIT licensed, with fewer than 1,000 installs recorded by skills.sh.

A prompt that fits it:

```text
Our research agent hits the context limit after 12 tool calls. Propose a budget, mask stale observations and restructure the prompt prefix for cache reuse.
```

### executing-plans: inline execution without subagents

[executing-plans](https://skills.suedeai.ai/directory/obra/superpowers/executing-plans/) from obra/superpowers (83/100, grade B) is for executing an implementation plan in the current session, as the implementer yourself. It applies when your human partner chose inline execution or when no subagent tool is available.

The SKILL.md walks through when to use it, the process and setup, then a task loop: take the task, work the steps, meet the completion contract and complete the task. A final review, a finish step, common rationalizations and an example workflow close it. The directory found no environment variables, outside hosts or MCP in its files.

It is the plain fallback in this stack. When grok-build or a subagent is not an option, executing-plans keeps the same discipline: one task at a time, with a contract for what done means. It executes a plan; it does not write one.

With about 250,000 installs recorded by skills.sh, about 6,000 of them in the last week, it is the most installed pick here. It is MIT licensed.

A prompt that fits it:

```text
Execute docs/plans/mcp-auth.md inline. Work one task at a time, meet the completion contract for each, and run the final review before you finish.
```

### aws-agentic-ai: deploy on Bedrock AgentCore

[aws-agentic-ai](https://skills.suedeai.ai/directory/zxkane/aws-skills/aws-agentic-ai/) from zxkane/aws-skills (83/100, grade B) covers deploying and managing AI agents on AWS Bedrock AgentCore. It spans Gateway, Runtime, Memory, Identity, Code Interpreter, Browser, Observability, Agent Registry and Evaluations, with MCP tool integration, credential management, agent discovery and governance workflows.

The SKILL.md opens with an AWS documentation requirement and a services list, then common workflows: deploying a gateway target, managing credentials, discovering agents and tools in the registry, evaluating agent quality and monitoring agents. Deep-dive references cover advanced runtime and OAuth topics and runnable script templates, and cross-service guides cover credentials, persistence, registry integration and security resource policies.

It is the heaviest pick in its files: five Python and two shell scripts, including a runtime Dockerfile template and A2A and AG-UI server templates. It makes network calls and uses MCP, naming the acdocs and aws-mcp tools. It reads no environment variables.

Install it only if you deploy on AWS. It is MIT licensed, with fewer than 1,000 installs recorded by skills.sh.

A prompt that fits it:

```text
Deploy our Python agent to AgentCore Runtime, register its MCP tools behind a Gateway target, and set up an evaluation for answer quality.
```

### prompt-optimizer: prompts and prompt evals

[prompt-optimizer](https://skills.suedeai.ai/directory/getsentry/skills/prompt-optimizer/) from getsentry/skills (81/100, grade B) creates, optimizes and iteratively refines agent prompts, system prompts, developer prompts and reusable prompt templates. It also ports prompts between OpenAI, Claude and Gemini and builds prompt evals. The directory marks getsentry/skills as an official publisher repository.

The SKILL.md is a six-step process: capture the contract, inventory external context, choose a model strategy, shape the prompt, optimize, and return a package. It opens with "load only what you need" and closes with failure modes. References cover core patterns, a meta-optimization loop, model-family notes and transformed examples, with a spec and a sources file alongside.

It bundles no scripts, reads no environment variables, makes no network calls and uses no MCP.

It has the lowest score in the stack and I still put it first in the workflow, because an agent without a written contract and an eval is a demo. It is Apache-2.0 licensed, with about 2,000 installs recorded by skills.sh.

A prompt that fits it:

```text
Rewrite this support agent's system prompt for Claude. Capture the contract first, then build five eval cases that would catch a regression.
```

## How to use the stack together

1. Write the contract, prompt and eval first with **prompt-optimizer**. Every later change gets measured against those eval cases.
2. Give the agent access with **mcp-builder**. Check whether a server already exists, then run all four phases through to evaluations.
3. Budget the context with **context-optimization** before you add a second agent. Two agents double a context problem.
4. Delegate code analysis with **slicing-code-context** when a smaller or local model should see a bounded slice, not the repository.
5. Send well-specified implementation to **grok-build**. Your main agent writes the specs and reviews every diff.
6. Run the plan with **executing-plans** when you are the implementer and no subagent tool is available. One task at a time, with the completion contract.
7. On AWS, deploy with **aws-agentic-ai**: Runtime for the agent, a Gateway target for tools, Evaluations for quality.
8. After every prompt or tool change, rerun the **prompt-optimizer** eval cases and the **mcp-builder** evaluations.

## Install the stack

```bash
npx skills add https://github.com/anthropics/skills/tree/main/skills/mcp-builder
npx skills add https://github.com/trailofbits/skills/tree/main/plugins/trailmark/skills/slicing-code-context
npx skills add https://github.com/sanjay3290/ai-skills/tree/main/skills/grok-build
npx skills add https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/main/skills/context-optimization
npx skills add https://github.com/obra/superpowers/tree/main/skills/executing-plans
npx skills add https://github.com/zxkane/aws-skills/tree/main/plugins/aws-agentic-ai/skills/aws-agentic-ai
npx skills add https://github.com/getsentry/skills/tree/main/skills/prompt-optimizer
```

The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [chat-history](https://skills.suedeai.ai/directory/mblode/agent-skills/chat-history/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 91/100 | The agent needs past decisions recovered from local Claude Code, Codex, Grok or Cursor history. |
| [deep-reader](https://skills.suedeai.ai/directory/tronghieu/agent-skills/deep-reader/) | [tronghieu/agent-skills](https://github.com/tronghieu/agent-skills) | 90/100 | The agent must read a book or paper of roughly 50+ pages without loading it all into context. |
| [api-gateway-mcp-server](https://skills.suedeai.ai/directory/google/skills/#api-gateway-mcp-server) | [google/skills](https://github.com/google/skills) | 89/100 | Your REST APIs sit behind Google Cloud API Gateway and should become MCP tools without a new server. |
| [java-mcp-server-generator](https://skills.suedeai.ai/directory/github/awesome-copilot/#java-mcp-server-generator) | [github/awesome-copilot](https://github.com/github/awesome-copilot) | 89/100 | The server must be Java or Spring Boot, with the MCP Java SDK 2.x and JUnit tests. |
| [agents-get-started](https://skills.suedeai.ai/directory/aws/agent-toolkit-for-aws/#agents-get-started) | [aws/agent-toolkit-for-aws](https://github.com/aws/agent-toolkit-for-aws) | 87/100 | You are starting a new AgentCore project and need framework selection, scaffolding and a first deploy. |

mcp-builder stays the default for Python and TypeScript servers; the Google and Java skills replace it only when the platform or language is fixed. agents-get-started comes before aws-agentic-ai, not instead of it: one scaffolds an AgentCore project, the other deploys and manages agents. chat-history and deep-reader extend context-optimization with memory and long-document reading.

## Common mistakes

- Shipping an MCP server with no evaluations. mcp-builder's fourth phase creates them.
- Tuning a prompt before writing down what it must do. prompt-optimizer captures the contract first and returns eval cases with the prompt.
- Handing a subagent the whole repository. slicing-code-context builds a bounded packet and permits one focused expansion.
- Delegating in parallel by default. grok-build keeps a sequential per-task loop and treats parallel dispatch as an opt-in exception.
- Letting the delegate own the result. In grok-build the main assistant reviews every diff and owns what merges.
- Adding agents before budgeting context. context-optimization covers masking, compaction and partitioning before they become a rewrite.

## Licenses, costs and checks before you install

All seven licenses are open. context-optimization, executing-plans and aws-agentic-ai are MIT; mcp-builder, grok-build and prompt-optimizer are Apache-2.0; slicing-code-context is CC-BY-SA-4.0, a share-alike license.

None of the seven reads an environment variable, per the directory's read of their files. aws-agentic-ai bundles seven scripts, makes network calls, uses MCP tools and works against your AWS account, so read its credential guidance closely. mcp-builder bundles two Python scripts, makes network calls and uses MCP. grok-build needs xAI's Grok Build CLI.

The directory has not security scanned any listed skill. The [trust page](https://skills.suedeai.ai/directory/trust/) explains what it checks and what it does not. Read each SKILL.md and every bundled script before you enable a skill, and read twice any skill that delegates work to another agent.

## Related topics and stacks

The [MCP Servers](https://skills.suedeai.ai/directory/topics/mcp-servers/) topic lists 82 skills, [AI Agent Builders](https://skills.suedeai.ai/directory/topics/ai-agent-builders/) lists 56, [Subagents and Multi-Agent Orchestration](https://skills.suedeai.ai/directory/topics/subagents/) lists 40, [Context Engineering and Agent Memory](https://skills.suedeai.ai/directory/topics/context-memory/) lists 31 and [Prompt Engineering](https://skills.suedeai.ai/directory/topics/prompt-engineering/) lists 28. The [AI Agents and LLM Engineering](https://skills.suedeai.ai/directory/ai-agents-llm/) category holds the rest.

Agents that write code need the [code review stack](https://skills.suedeai.ai/directory/stacks/code-review/) and the [testing and CI stack](https://skills.suedeai.ai/directory/stacks/testing-and-ci/). To document an MCP server, see the [technical docs stack](https://skills.suedeai.ai/directory/stacks/technical-docs/).

## FAQ

### What is the best skill for building an MCP server?

mcp-builder from anthropics/skills, at 89/100 with about 136,000 installs recorded by skills.sh. It guides an MCP server in Python with FastMCP or TypeScript with the MCP SDK through four phases: research and planning, implementation, review and test, and evaluations. For Java, java-mcp-server-generator is the alternative.

### How do I build an MCP server with Claude Code?

Install mcp-builder with the skills CLI command in the install block above, then ask Claude Code for the server in plain language: the service, the language and the tools you want. Let it run all four phases, including evaluations.

### Do these skills work with the Claude Agent SDK?

None of the seven names the Claude Agent SDK in its description, so none is an SDK tutorial. They cover the work around any agent you build: the MCP servers it calls (mcp-builder), its prompts and evals (prompt-optimizer), its context budget (context-optimization), delegation (slicing-code-context, grok-build, executing-plans) and deployment on AWS (aws-agentic-ai).

### Which skills do I need to build an AI agent?

Start with prompt-optimizer (81/100) for the contract, prompt and evals. Add mcp-builder (89/100) only when the agent needs a system it cannot otherwise reach: a skill adds method, an MCP server adds access, and files and a shell often do the job. Add context-optimization (86/100) once sessions get long, the delegation skills when a second agent joins, and aws-agentic-ai only on Bedrock AgentCore.

### How do I stop a multi-agent setup from eating the context budget?

Three of the picks exist for that: context-optimization budgets and masks, slicing-code-context hands a subagent a bounded slice, and grok-build moves implementation out of the main session. Measure token cost before and after each; the skills describe what they do, not what they save.

### Do these skills work in Codex and Cursor?

Yes. All seven use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.
