# Public Install Guidance

Read this file only when the user asks how to install, update, or subset the
Suede pack. It changes nothing about how work is routed or executed.

## Claude Code

Add the marketplace and install the pack:

```bash
/plugin marketplace add JasonColapietro/suede-creator-skills
/plugin install suede-skills@suede
```

`suede-skills` installs every skill. Smaller subsets:
`/plugin install suede-agent-workflows@suede` (orchestration, workflows,
evals) or `/plugin install suede-code@suede` (review, grade, ship-gate).

Prefer a clone? `install.sh` copies every skill into `~/.claude/skills/`:

```bash
git clone https://github.com/JasonColapietro/suede-creator-skills.git && bash suede-creator-skills/install.sh
```

## Codex

Install the umbrella skill alone:

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo JasonColapietro/suede-creator-skills \
  --path skills/suede-workflow-skills
```

That path is the umbrella-only configuration: the individual specialists are
absent, so the umbrella falls back to `references/condensed-workflows.md`.
Install the individual skills whenever direct triggering matters — pass any
number of `skills/<name>` paths after `--path`:

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo JasonColapietro/suede-creator-skills \
  --path skills/johnny-suede-write \
  skills/johnny-suede-design \
  skills/suede-code \
  skills/suede-code-review \
  skills/suede-code-grader \
  skills/suede-copy \
  skills/suede-deslop \
  skills/suede-design \
  skills/suede-agent-teams \
  skills/suede-ship \
  skills/suede-ship-copy \
  skills/suede-ai-eval \
  skills/suede-recommend-next-action \
  skills/suede-ci-gate \
  skills/suede-seo-audit \
  skills/suede-visibility-grader \
  skills/suede-site-alchemy \
  skills/suede-launch-packaging \
  skills/suede-mcp-qa \
  skills/site-to-ios-app \
  skills/android-app-factory
```

Growth, marketing, and creator
skills install the same way — substitute their directory names from
[the repository skill index](https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills),
which is the current source of truth for the full list.

Restart Codex after installing new skills.
