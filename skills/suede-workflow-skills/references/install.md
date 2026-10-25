# Public Install Guidance

Read this file only when the user asks how to install, update, or subset the
Suede pack. It changes nothing about how work is routed or executed.

## Claude Code

Add the marketplace and install the pack inside a session:

```text
/plugin marketplace add JasonColapietro/suede-creator-skills
/plugin install suede-skills@suede
```

`/plugin install` opens the plugin's details so the user can review it and
pick a scope (user, project, or local). On Claude Code v2.1.275 or later one
command does both steps:

```text
/plugin install suede-skills --marketplace JasonColapietro/suede-creator-skills
```

`suede-skills` installs every skill. Smaller subsets from the same `suede`
marketplace:

- `/plugin install suede-marketing@suede` (marketing and growth skills)
- `/plugin install suede-agent-workflows@suede` (orchestration, workflows,
  evals)
- `/plugin install suede-code@suede` (review, grade, ship-gate)

Plugin skills are namespaced, so this skill runs as
`/suede-skills:suede-workflow-skills` (or under the subset's name).

From a shell or setup script, without opening a session:

```bash
claude plugin marketplace add JasonColapietro/suede-creator-skills
claude plugin install suede-skills@suede --scope project
```

`--scope project` writes the entry to the committed `.claude/settings.json`.
Each collaborator still runs the install command once on their machine.
Omit `--scope` for user scope. Pin a tag or branch by adding `#ref` to the
marketplace source, for example `JasonColapietro/suede-creator-skills#main`.

**Updating.** Auto-update is off by default for third-party marketplaces
like this one. Update with the **Update marketplace** action on the
**Marketplaces** tab in `/plugin`, or `claude plugin update suede-skills@suede`
from the shell.
The user can turn on auto-update for the marketplace on that same tab. Run
`/reload-plugins` to load an update in an open session.

**Cloud sessions** (claude.ai/code and cloud scheduled tasks) do not load
plugins installed on the user's machine. Commit the skills into the repo's
`.claude/skills/` instead (see the skills CLI below).

Prefer a clone? `install.sh` copies every skill into `~/.claude/skills/`:

```bash
git clone https://github.com/JasonColapietro/suede-creator-skills.git && bash suede-creator-skills/install.sh
```

Source: https://code.claude.com/docs/en/discover-plugins

## Codex

Add the Codex-native marketplace (`.agents/plugins/marketplace.json`,
registered as `suede-codex`):

```bash
codex plugin marketplace add JasonColapietro/suede-creator-skills --ref main
```

Then install the `suede-skills` plugin from the `suede-codex` marketplace in
the Plugins Directory. The `codex plugin` command also installs, lists, and
removes plugins from configured marketplaces; run `codex plugin --help` for
the exact verb in the installed version. Refresh later with
`codex plugin marketplace upgrade suede-codex`.

Install single skills instead with the built-in installer, by asking Codex:

```text
$skill-installer install skills/suede-workflow-skills from github.com/JasonColapietro/suede-creator-skills
```

That path is the umbrella-only configuration: the specialists are absent, so
the umbrella falls back to `references/condensed-workflows.md`. Install the
specialists whenever direct triggering matters, with more `skills/<name>`
paths in the same request or with the skills CLI below. The
[repository skill index](https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills)
is the source of truth for skill names.

Codex reads user skills from `~/.agents/skills` and repo skills from
`.agents/skills`, and picks up skill changes automatically. Restart Codex if
a new skill does not appear, or after editing `~/.codex/config.toml`.

Sources: https://developers.openai.com/codex/plugins/build and
https://developers.openai.com/codex/skills

## Any agent: skills CLI

The [skills CLI](https://github.com/vercel-labs/skills) installs into Claude
Code, Codex, Cursor, and other agents. It installs into the current project
by default; `-g` installs for the user across projects.

```bash
npx skills add JasonColapietro/suede-creator-skills
npx skills add JasonColapietro/suede-creator-skills --skill suede-workflow-skills -a codex
npx skills add JasonColapietro/suede-creator-skills --skill suede-workflow-skills -a claude-code
```

`-a codex` writes to `.agents/skills/` and `-a claude-code` to
`.claude/skills/`. Keep them current with `npx skills update`.

## Hermes Agent

This repo is a Hermes skills tap:

```bash
hermes skills tap add JasonColapietro/suede-creator-skills
hermes skills install JasonColapietro/suede-creator-skills/skills/suede-workflow-skills
```

Skills land in `~/.hermes/skills/`. `hermes skills update` pulls upstream
changes. Hermes carries the skills only, so this umbrella runs there in
umbrella-only mode unless the specialists are installed too.

Source: https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
