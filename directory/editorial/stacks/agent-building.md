# Which agent skills should you stack to build agents and MCP servers?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 2, 2026.

**Short answer:** [mcp-builder](https://skills.suedeai.ai/directory/anthropics/skills/mcp-builder/) from anthropics/skills (89/100), with about 136,000 installs recorded by skills.sh, guides MCP servers in Python with FastMCP or TypeScript with the MCP SDK. [prompt-optimizer](https://skills.suedeai.ai/directory/getsentry/skills/prompt-optimizer/) from getsentry/skills (81/100) writes the agent, system and developer prompts and the evals, and [context-optimization](https://skills.suedeai.ai/directory/muratcankoylan/agent-skills-for-context-engineering/context-optimization/) from muratcankoylan/Agent-Skills-for-Context-Engineering (86/100) keeps the context budget under control. For multi-agent work, slicing-code-context, grok-build and executing-plans cover delegation, and aws-agentic-ai covers deployment on Bedrock AgentCore.

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

## How to use it

1. Write the prompt and the eval first with **prompt-optimizer**. It creates and refines agent, system and developer prompts and reusable templates, ports prompts between OpenAI, Claude and Gemini, and builds prompt evals. An agent without an eval is a demo.
2. Give the agent access with **mcp-builder**. It guides an MCP server in Python with FastMCP or TypeScript with the MCP SDK. Check the [reference servers](https://github.com/modelcontextprotocol/servers) before you write one; a tool that already exists is a tool you do not maintain. The [Claude Code MCP docs](https://code.claude.com/docs/en/mcp) cover wiring it in.
3. Budget the context with **context-optimization**: context budgeting, observation masking, KV-cache strategy, partitioning and token-cost reduction. Do this before you add a second agent, because two agents double a context problem.
4. Run the plan with **executing-plans** when you are the implementer and no subagent tool is available. It executes an implementation plan inline in the current session.
5. Delegate, but keep the review. **slicing-code-context** selects bounded, graph-informed source slices with Trailmark and hands focused analysis or patch-proposal work to a smaller subagent, which sees a slice, not the repository. **grok-build** sends well-specified implementation to the Grok Build CLI running headlessly while the assistant writes the spec, reviews every diff and owns the result.
6. Deploy with **aws-agentic-ai** if you are on AWS. It covers Bedrock AgentCore Gateway, Runtime, Memory, Identity, Observability, Evaluations, MCP tool integration and governance workflows.

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

The [skills CLI](https://skills.sh/) works for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## What to check before you install

- Licenses: context-optimization, executing-plans and aws-agentic-ai are MIT; mcp-builder, grok-build and prompt-optimizer are Apache-2.0; slicing-code-context is CC-BY-SA-4.0, a share-alike license.
- Services: grok-build needs xAI's Grok Build CLI, aws-agentic-ai needs an AWS account with Bedrock AgentCore, and slicing-code-context uses Trailmark. prompt-optimizer ports prompts between OpenAI, Claude and Gemini, so expect keys for whichever you test against.
- Read each SKILL.md before you enable it. The directory has not security scanned any skill, and a skill that delegates work to another agent deserves a slower read than most.

## FAQ

### Do I need an MCP server for every tool?

No. A skill adds method and an MCP server adds access. If the agent can do the job with files and a shell, a skill is enough. Build a server when the job needs a system the agent cannot otherwise reach, and start from the reference servers before writing your own.

### Do these skills work in Codex and Cursor?

Yes. All seven use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### How do I stop a multi-agent setup from eating the context budget?

Three of the picks exist for that: context-optimization budgets and masks, slicing-code-context hands a subagent a bounded slice, and grok-build moves implementation out of the main session entirely. Measure the token cost before and after each one; the summaries describe what the skills do, not what they will save you. executing-plans, at about 250,000 installs recorded by skills.sh, is the most installed pick here.
