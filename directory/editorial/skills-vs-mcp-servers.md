# Agent Skills vs MCP Servers vs Plugins: Which One Do You Need?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed October 23, 2026.

**Short answer:** a skill teaches an agent *how* to do a job. An MCP server gives an agent *access* to a system it cannot reach on its own, through tools it can call. A Claude Code plugin is the package that ships either or both, along with hooks, subagents and language servers. Use a skill for know-how, an MCP server for live data and actions, and a plugin when you want people to install the whole setup with one command.

## What is the difference between a skill and an MCP server?

A skill is a folder of text. Its `SKILL.md` holds instructions, and it can bundle reference files and scripts. Nothing runs until the agent decides the skill fits the task and reads it.

An MCP server is a running program. It speaks the Model Context Protocol and exposes tools (actions the agent can call), resources (data it can read) and prompts. It usually holds credentials for an outside service, such as a billing API or a database.

| | Agent skill | MCP server | Claude Code plugin |
| --- | --- | --- | --- |
| What it is | Instructions plus optional files | A program exposing tools and data | A package of components |
| What it adds | Method and judgment for one job | Access to an outside system | Skills, subagents, hooks, MCP and LSP servers together |
| Runs code? | Only scripts the skill tells the agent to run | Yes, as a process or hosted service | Yes, if it includes hooks or servers |
| Credentials | Usually none | Usually yes | Whatever its components need |
| Context cost | Description at session start; body only when used | Tool definitions, unless deferred by tool search | Sum of its parts; Claude Code shows an estimate before install |
| Portable across agents | Yes, through the Agent Skills open standard | Yes, through the MCP protocol | Claude Code plugin format |
| Install | Copy the folder or `npx skills add` | Add the server to your agent's MCP config | `/plugin install name@marketplace` |

## When should you use a skill?

Use a skill when the agent already has the access it needs and is missing the method. Examples: how your team writes release notes, the order of checks in an SEO audit, the rules for your brand voice, or a review checklist. A good skill turns a vague request into the same reliable procedure every time.

Skills are cheap to keep around. Claude Code loads only each skill's description at the start of a session and reads the full body when the skill is used, so a large library costs little until it is needed.

## When should you use an MCP server?

Use an MCP server when the job needs data or actions the agent cannot reach with files and a shell: your CRM, your cloud bill, a search API, a ticketing system. The server handles authentication and exposes a defined set of tools, so the agent works through an interface you control.

## Why do the best setups combine both?

Access without method produces confident guesses. Method without access produces plans nobody can run. The strongest projects in the [Agent Skills Directory](https://skills.suedeai.ai/directory/) pair the two:

- **Costory** pairs a hosted MCP server with four FinOps skills. The server reaches workspace cost data; the skills tell the agent how to investigate a cost change, explore BigQuery spend and allocate shared costs. ([Featured project](https://skills.suedeai.ai/directory/featured/#costory))
- **Appie** pairs a hosted MCP service with three skills for writing articles, building a chatbot and shortening links. ([Featured project](https://skills.suedeai.ai/directory/featured/#appie))

## When do you need a plugin?

When you want someone to install a working setup in one step. A plugin can bring skills, subagents, hooks and MCP servers together, pinned to one version. **CoalWash**, a featured Claude Code plugin, shows why the full package matters: its skills depend on SessionStart, Stop, PreToolUse and PostToolUse hooks and an engine that only the complete plugin installs. ([Featured project](https://skills.suedeai.ai/directory/featured/#coalwash))

Hooks run automatically at points in a session, so read what a plugin registers before you install it. Anthropic's documentation says plugins can execute code on your machine with your user privileges.

## Which is safer, a skill or an MCP server?

Neither is safe by default. A skill with no scripts is the easiest to review, because it is plain text you can read in a minute. A skill that bundles scripts, or tells the agent to download and run something, needs the same review as any code. An MCP server holds credentials and can act on outside systems, so check what tools it exposes and what scopes its keys have.

Every full skill page in the directory lists the scripts, credentials and network calls found in the skill's files, so you can see what a skill touches before you install it.

## How does this fit a business workflow?

A single agent with a few skills and one MCP server covers a lot of individual work. Business processes usually span several systems and several roles: intake, research, drafting, approval, delivery. That calls for multiple agents with clear handoffs.

[Suede AI Agent Studio](https://suedeai.app/?utm_source=skills.suedeai.ai&utm_medium=guide&utm_campaign=skills-vs-mcp&utm_content=business-section) builds that kind of multi-agent automation for businesses. If your team has outgrown one assistant with a stack of skills, [see how Agent Studio works](https://suedeai.app/?utm_source=skills.suedeai.ai&utm_medium=guide&utm_campaign=skills-vs-mcp&utm_content=business-section-cta).

## FAQ

### Can a skill call an MCP server?

Yes. A skill can tell the agent which MCP tools to use and in what order. That is how Costory's and Appie's skills work with their hosted servers.

### Do skills replace MCP?

No. They solve different problems. A skill supplies the procedure; an MCP server supplies the connection. Many workflows need both.

### Are skills only for Claude?

No. Claude Code and Codex both follow the Agent Skills open standard, and the skills CLI installs skills for Cursor, GitHub Copilot and other agents.

### What does a skill cost in context?

Only its description, until it is used. Claude Code loads skill descriptions at session start and the full instructions on demand.

### Where can I find skills and MCP-backed skills?

The [Agent Skills Directory](https://skills.suedeai.ai/directory/) lists 3,798 skills from 159 repositories (snapshot of October 19, 2026). Full skill pages flag when a skill uses an MCP server.

## Quotable facts

- A skill adds method; an MCP server adds access; a plugin packages both for one-step install.
- Claude Code loads a skill's description at session start and its full body only when the skill is used.
- Claude Code plugins can bundle skills, subagents, hooks, MCP servers and LSP servers.
- Skills follow the Agent Skills open standard, so the same folder can work in Claude Code and Codex.
