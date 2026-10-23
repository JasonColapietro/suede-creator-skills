# How to Install Agent Skills in Claude Code, Codex and Cursor

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed October 23, 2026, against the Claude Code and Codex documentation.

**Short answer:** an agent skill is a folder with a `SKILL.md` file. Put the folder where your agent looks and it loads. In Claude Code that is `~/.claude/skills/<skill-name>/` for every project or `.claude/skills/<skill-name>/` for one repository. In Codex it is `.agents/skills/` in the repository or `$HOME/.agents/skills/` for your user. To install from GitHub in one line for Claude Code, Codex, Cursor and other agents, run `npx skills add <skill-folder-url>`.

## What is an agent skill?

A skill is a set of instructions, plus optional reference files and scripts, that teaches an agent one job. The `SKILL.md` file opens with frontmatter that names the skill and describes when to use it. Claude Code and Codex both follow the [Agent Skills open standard](https://agentskills.io), so one folder can work in several agents.

Claude Code loads every skill's description at the start of a session so it knows what is available. The full instructions load only when the skill is used. That is why a precise description matters more than anything else in the file.

## How do I install a skill in Claude Code?

Copy the skill folder into one of these locations ([Claude Code docs](https://code.claude.com/docs/en/skills)):

| Scope | Path | Who gets it |
| --- | --- | --- |
| Personal | `~/.claude/skills/<skill-name>/SKILL.md` | You, in every project on this machine |
| Project | `.claude/skills/<skill-name>/SKILL.md` | Everyone who works in the repository, once you commit it |
| Plugin | `<plugin>/skills/<skill-name>/SKILL.md` | Anyone with the plugin enabled, as `/plugin-name:skill-name` |

Claude uses a skill when your request matches its description. You can also call it directly with `/skill-name`.

Every skill page in the [Agent Skills Directory](https://skills.suedeai.ai/directory/) includes a ready project-level copy command. For example:

```sh
tmp="$(mktemp -d)"
git clone --depth 1 https://github.com/AgriciDaniel/claude-seo.git "$tmp/repo"
mkdir -p .claude/skills
cp -R "$tmp/repo/"skills/seo-schema .claude/skills/
rm -rf "$tmp"
```

## How do I install a Claude Code plugin from a marketplace?

Plugins bundle skills with agents, hooks and MCP servers. Installing one takes two steps: add the marketplace, then install the plugin from it.

```text
/plugin marketplace add anthropics/claude-plugins-community
/plugin install <plugin-name>@claude-community
```

Claude Code adds the official Anthropic marketplace, `claude-plugins-official`, automatically the first time you start it interactively. Install from it with `/plugin install <name>@claude-plugins-official`. To install from your shell without the interactive panel, use `claude plugin install <name>@<marketplace>`. Run `/plugin` and open the **Discover** tab to browse. ([Claude Code docs: discover plugins](https://code.claude.com/docs/en/discover-plugins))

Anthropic's own warning is worth repeating: plugins and marketplaces can execute code on your machine with your user privileges, so install only from sources you trust.

## How do I install a skill in Codex?

Codex reads skills from these folders ([OpenAI Codex docs](https://developers.openai.com/codex/skills)):

- **Repository:** `.agents/skills` in the folder where you launch Codex, and in parent folders up to the repository root.
- **User:** `$HOME/.agents/skills`.
- **Admin:** `/etc/codex/skills`.

Codex also ships a skill installer. Call `$skill-installer` and name a curated skill, or ask it to fetch a skill from another repository. In the CLI or IDE extension, run `/skills` or type `$` to mention a skill by name. Codex requires `name` and `description` in the frontmatter.

## How do I install a skill with the skills CLI?

The skills CLI installs a skill folder from GitHub into the right place for the agent you choose. It supports Claude Code, Codex, Cursor, GitHub Copilot and many others.

```sh
npx skills add https://github.com/<owner>/<repo>/tree/main/skills/<skill-name>
```

It installs at project scope by default. Add `-g` for a user-level install and `-a` to pick the agent. The CLI sends anonymous install telemetry by default; set `DISABLE_TELEMETRY=1` to turn it off.

## How do I check a skill before I install it?

Read it. A skill is plain text plus whatever scripts it bundles, and an agent will follow those instructions with the permissions you give it. Before you install:

1. Open the `SKILL.md` and read what it tells the agent to do.
2. List the bundled scripts and what they run.
3. Look for environment variables, credentials and outside hosts the skill reads or calls.
4. Check the license.

Every full skill page in the directory has a **Before you install** panel that summarizes the scripts, credentials and network calls found in the skill's files, plus its license. The directory's security status for external skills is "not scanned", and the page says so, so the source review stays your call.

## Why isn't my skill loading?

Work through these in order:

- **The frontmatter is not on line one.** Claude Code reads frontmatter only when the opening `---` is the first line of the file.
- **The description does not match how you ask.** The agent decides from the description alone. Add the words you actually type, and a "NOT FOR" clause so it stops firing on near misses.
- **The folder is in the wrong place.** Personal skills go in `~/.claude/skills/`, project skills in `.claude/skills/`, Codex skills in `.agents/skills/`.
- **The name and folder disagree.** The directory's checks require the `name` field to match the folder name, and agents work best when they do.
- **A plugin was installed but not reloaded.** Run `/reload-plugins` in Claude Code.

## How do I roll skills out to a whole team?

Commit the skills to `.claude/skills/` (Claude Code) or `.agents/skills/` (Codex) in the shared repository, so everyone who clones it gets the same versions. For plugins, team admins can add a marketplace to the project's `.claude/settings.json` under `extraKnownMarketplaces`.

When a team needs several agents working together across business systems, with handoffs and approvals, that is the job [Suede AI Agent Studio](https://suedeai.app/?utm_source=skills.suedeai.ai&utm_medium=guide&utm_campaign=install-agent-skills&utm_content=team-section) is built for: multi-agent automation for businesses.

## FAQ

### Where are Claude Code skills stored?

Personal skills are in `~/.claude/skills/<skill-name>/SKILL.md`. Project skills are in `.claude/skills/<skill-name>/SKILL.md` inside the repository.

### Do Claude skills work in Codex and Cursor?

Usually, yes. Claude Code and Codex both follow the Agent Skills open standard, and the skills CLI installs the same folder for Cursor and other agents. Check the skill for tool names or paths specific to one agent.

### Is a skill the same as a plugin?

No. A skill is one folder of instructions. A Claude Code plugin is a package that can contain skills along with agents, hooks, MCP servers and language servers. See [Agent skills vs MCP servers vs plugins](https://skills.suedeai.ai/directory/guides/skills-vs-mcp-servers/).

### How do I update an installed skill?

Re-run the install command, or pull the latest copy into the same folder. For plugins, run `/plugin marketplace update <marketplace-name>` and reinstall.

### Where can I find skills to install?

The [Agent Skills Directory](https://skills.suedeai.ai/directory/) lists 3,798 skills from 159 GitHub repositories in 16 categories (snapshot of October 19, 2026), each with a 0–99 quality score, its license, and copy-ready install commands.

## Quotable facts

- Claude Code personal skills live in `~/.claude/skills/`; project skills live in `.claude/skills/`.
- Codex reads repository skills from `.agents/skills` and user skills from `$HOME/.agents/skills`.
- Claude Code adds the official `claude-plugins-official` marketplace automatically on first interactive start.
- Claude Code loads skill descriptions at session start and the full skill body only when the skill is used.
