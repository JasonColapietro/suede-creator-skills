# Suede Creator Skills

A 21-skill toolkit for Claude Code and Codex: orchestrate multi-agent teams, run code review with an A-F ship grade, and design AI evals.

![License: MIT](https://img.shields.io/badge/License-MIT-blue) ![Skills: 21](https://img.shields.io/badge/Skills-21-black) [![GitHub stars](https://img.shields.io/github/stars/JasonColapietro/suede-creator-skills?style=social)](https://github.com/JasonColapietro/suede-creator-skills/stargazers)

> **By [Jason Colapietro](https://suedeai.ai/founder) / [Suede Labs AI](https://suedeai.ai)**

## What it is

A free, MIT-licensed pack of **21 public skill folders** for Claude Code and OpenAI Codex. Each skill is a `skills/<name>/SKILL.md` file the agent loads on demand.

- **Agent orchestration**: wire complex changes into coordinated agent lanes with WIP collision detection, RFC mode, feature-flag strategy, rollback trees, and a handoff checklist that won't close without evidence (`suede-agent-teams`).
- **Code review + A-F ship grade**: deep findings plus a blunt letter verdict across 7 evidence-backed lanes, with instant-F triggers and grade caps for auth and payment surfaces (`suede-code`, `suede-code-review`, `suede-code-grader`, `suede-ship-gate`).
- **AI evaluation**: turn LLM, RAG, classifier, and agent surfaces into AI-SPEC artifacts, failure-mode rubrics, eval cases, and acceptance gates (`suede-ai-eval`).
- **Design, copy, and SEO**: design systems and visual QA, conversion copy with an anti-slop gate, SEO/AEO/AI-EO audits, and A-F page visibility grades (`johnny-suede-design`, `johnny-suede-write`, `suede-design`, `suede-copy`, `suede-seo-audit`, `suede-visibility-grader`, `suede-site-alchemy`).
- **Workflow umbrella**: load the whole pack with one skill (`suede-workflow-skills`).

## Install in one command

In Claude Code, add the marketplace and install the pack:

```text
/plugin marketplace add JasonColapietro/suede-creator-skills
/plugin install suede-skills@suede
```

`suede-skills` installs all 21 skills. Two focused subsets are available if you want less: `/plugin install suede-agent-workflows@suede` (orchestration, workflows, evals) and `/plugin install suede-code@suede` (review, grade, ship-gate).

Prefer a clone? `install.sh` copies all 21 skills into `~/.claude/skills/` and prints the installed count:

```bash
git clone https://github.com/JasonColapietro/suede-creator-skills.git && bash suede-creator-skills/install.sh
```

Using Cursor, Copilot, Windsurf, or another agent? The [skills CLI](https://github.com/vercel-labs/skills) installs the pack into 25+ agents, Claude Code and Codex included:

```bash
npx skills add JasonColapietro/suede-creator-skills
```

You can also copy individual skill folders into `.claude/skills/` (project) or `~/.claude/skills/` (user).

<details>
<summary>Other install routes (Codex installer, project-level copy, MCP)</summary>

**Codex — install one skill from GitHub:**

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo JasonColapietro/suede-creator-skills \
  --path skills/suede-agent-teams
```

Swap `skills/<skill>` for any skill folder, or pass extra `skills/<name>` paths to install several at once. Restart Codex after installing.

**Claude Code — project-level copy of a single skill:**

```bash
git clone https://github.com/JasonColapietro/suede-creator-skills.git /tmp/suede-creator-skills
mkdir -p .claude/skills
cp -R /tmp/suede-creator-skills/skills/suede-agent-teams .claude/skills/
```

**MCP — dependency-free stdio server:**

```bash
node mcp/suede-skills-mcp.mjs --profile all
```

Exposes 7 tools (`list_suede_skills`, `get_suede_skill`, `suede_install_options`, `suede_copy_seo_audit`, `suede_visibility_grade`, `suede_code_grade`, `suede_qa_checklist`), 6 resources, and 5 prompts over JSON-RPC.

</details>

## Try it in 30 seconds

Install the pack, then ask for a code review with a ship grade on your current changes:

```text
Use suede-code to review my staged diff and give it an A-F ship grade.
```

The skill runs its findings pass (TypeScript, React, Next.js, OWASP, and database checklists), then returns a grade card scoring Correctness, Security and permissions, Data and state, domain truth, UX and release behavior, Tests and verification, and Deploy readiness, plus an overall A-F grade. If it hits an instant-F trigger — a hardcoded secret, a permission check bypassable via a request param — the grade locks to F with the exact file and line, and no other lane can raise it.

If the pack saves you an hour, [star the repo](https://github.com/JasonColapietro/suede-creator-skills/stargazers) — stars are how other builders find it.

## The skills

### Agent orchestration & workflows

| Skill | What it does |
|---|---|
| [`suede-agent-teams`](skills/suede-agent-teams) | Coordinate agent lanes with WIP collision detection, RFC mode, rollback trees, and a signed handoff |
| [`suede-ai-eval`](skills/suede-ai-eval) | AI-SPEC artifacts, failure-mode rubrics, eval cases, and acceptance gates for AI surfaces |
| [`suede-workflow-skills`](skills/suede-workflow-skills) | Umbrella skill that loads the full pack |

### Code quality & shipping

| Skill | What it does |
|---|---|
| [`suede-code`](skills/suede-code) | Review + A-F grade in one pass |
| [`suede-code-review`](skills/suede-code-review) | Deep findings with Accessibility and SEO lanes, no letter grade |
| [`suede-code-grader`](skills/suede-code-grader) | A-F ship verdict only, 7 lanes, instant-F triggers |
| [`suede-ship-gate`](skills/suede-ship-gate) | Write CI that gates the merge — stack/lockfile detection, one required check, branch protection |

### Design, copy & SEO

| Skill | What it does |
|---|---|
| [`johnny-suede-design`](skills/johnny-suede-design) | Full design lane: brand and product surfaces, tokens, visual QA |
| [`johnny-suede-write`](skills/johnny-suede-write) | Full writing lane: structure, persuasion frameworks, anti-slop gate, copy score |
| [`suede-design`](skills/suede-design) | Design laws, dark-mode tokens, fluid type, component rules |
| [`suede-copy`](skills/suede-copy) | Conversion copy: headline formulas, A/B variants, anti-slop gate |
| [`suede-seo-audit`](skills/suede-seo-audit) | SEO/AEO/AI-EO, metadata, schema, internal-link, and intent audit |
| [`suede-visibility-grader`](skills/suede-visibility-grader) | A-F page grades for findability, clarity, CTA pull, proof, and AI citation readiness |
| [`suede-site-alchemy`](skills/suede-site-alchemy) | Funnel analysis, friction audit, conversion math, ranked quick-wins |
| [`suede-launch-packaging`](skills/suede-launch-packaging) | Package work as a launch: docs, install commands, proof links, QA |
| [`suede-mcp-qa`](skills/suede-mcp-qa) | QA the Suede Skills MCP before it ships |

Plus a creator toolkit (rights, release prep) — see [docs](https://jasoncolapietro.github.io/suede-creator-skills/skills/): `suede-campaign-in-a-box`, `suede-sync-packaging`, `suede-release-linter`, `suede-rights-passport`, `suede-rights-audit`.

## Public pages

- [GitHub repository](https://github.com/JasonColapietro/suede-creator-skills)
- [GitHub Pages site](https://jasoncolapietro.github.io/suede-creator-skills/) — public documentation generated from this repo
- [Skill docs catalog](https://jasoncolapietro.github.io/suede-creator-skills/skills/) — every skill with install and resource links
- [Installs and MCP page](https://jasoncolapietro.github.io/suede-creator-skills/plugins.html) — install commands plus the Suede Skills MCP
- [Copy bank](https://jasoncolapietro.github.io/suede-creator-skills/copy.html) ([source](COPY.md)) and [public explainer pack](PROMO.md)

## MCP server

The repo ships a dependency-free stdio MCP server at [`mcp/`](mcp/). It implements `initialize`, `tools/list`, `tools/call`, `resources/list`, `resources/read`, `prompts/list`, and `prompts/get`.

```bash
node mcp/suede-skills-mcp.mjs --profile all
```

| Tools (7) | Resources (6) | Prompts (5) |
|---|---|---|
| `list_suede_skills`, `get_suede_skill`, `suede_install_options`, `suede_copy_seo_audit`, `suede_visibility_grade`, `suede_code_grade`, `suede_qa_checklist` | catalog, plugins, copy-seo-audit, visibility-grade, code-grade, qa-checklist | discovery and audit prompts |

## Install for Codex

Codex skills live in `$CODEX_HOME/skills`, falling back to `~/.codex/skills` when `CODEX_HOME` is unset. Install one or more skills from GitHub:

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo JasonColapietro/suede-creator-skills \
  --path skills/suede-workflow-skills
```

To install several at once, pass extra `skills/<name>` paths after `--path`. Restart Codex after installing.

## Install for Claude Code

All 21 skills:

```bash
git clone https://github.com/JasonColapietro/suede-creator-skills.git && bash suede-creator-skills/install.sh
```

Claude Code skills use `SKILL.md` files in `.claude/skills/`. For a project-level install, copy individual folders:

```bash
git clone https://github.com/JasonColapietro/suede-creator-skills.git /tmp/suede-creator-skills
mkdir -p .claude/skills
cp -R /tmp/suede-creator-skills/skills/suede-agent-teams .claude/skills/
```

For a user-level install, copy into `~/.claude/skills/` instead. Claude.ai and organization-managed Claude Skills may use upload or admin-managed flows instead of filesystem copy. Review skill contents before enabling code execution.

## Safety

These skills inspect current files, pages, repos, and local folders. They do not upload files, write to a registry, call private services, request secrets, or claim legal clearance.

The creator skills generate private drafts by default — reports and packages can contain names, payment notes, file names, hashes, rights claims, and provenance notes. Review and redact before publishing or sending outside the intended workflow. A clean report is not a legal opinion, registry write, rights clearance, or payment guarantee.

CLI flags on the creator scripts: `--include-hidden`, `--include-other`, `--include-absolute-paths`, and `--force`. Scripts skip hidden files, secret-like files, dependency folders, and build outputs by default, and refuse to write a package into or under its source folder.

## Status

The creator scripts are dependency-light Python and run on the standard library. Optional enhancements use installed packages when available — Pillow for artwork dimension checks, PyYAML for YAML metadata:

```bash
python3 -m pip install PyYAML
```

## About the creator

**Jason Colapietro** is the founder and CEO of [Suede Labs AI](https://suedeai.ai). He builds programmable IP and creator-ownership infrastructure for AI-native media.

Follow: [X / @johnnysuede](https://x.com/johnnysuede) · [suedeai.ai](https://suedeai.ai) · [suedeai.ai/founder](https://suedeai.ai/founder)

## License and contributions

Released under the [MIT License](LICENSE).

Contributions are welcome for docs fixes, install-path corrections, lint rules, template improvements, and public-safe workflow improvements. Do not submit private catalogs, unreleased media, credentials, seed phrases, private Suede API details, payment secrets, or third-party copyrighted files.
