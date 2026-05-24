# Suede Creator Skills

![Suede Creator Skills preview](docs/assets/og-image.png)

**Suede Creator Skills** is a public skill pack for AI coding agents and
creator workflows. It helps music, audio, video, and media projects become
release-ready, rights-aware, provenance-ready, and easier to prepare for Suede
optimization.

The public page presents the workflow as a Suede Creator Passport: website
visits, app opens, Discord joins, X follows, Telegram visits, GitHub installs,
Codex and Claude installs, release linting, transfer packaging, Suede Holder
context, and Suede signing workflows become stampable participation signals.

Suede is creator ownership infrastructure for programmable IP, registry-backed
media, royalty routing, licensing readiness, and agent commerce. These skills
are offline-first and public-safe: they inspect and organize local project
folders, but they do not upload files, write to a registry, call private Suede
services, request secrets, or claim legal clearance.

## Public Page

GitHub Pages site:

```text
https://jasoncolapietro.github.io/suede-creator-skills/
```

Repository:

```text
https://github.com/jasoncolapietro/suede-creator-skills
```

## Skills Included

### Suede Rights Passport

![Suede Rights Passport preview](docs/assets/rights-passport-preview.png)

Folder: `skills/suede-rights-passport`

Turn a messy creator folder into a Suede-ready transfer package. The skill
inventories media, documents, lyrics, artwork, stems, credits, splits, licenses,
provenance notes, missing rights information, and optimization blockers.

Outputs include:

- `RIGHTS_PASSPORT.md`
- `suede-intake.json`
- `provenance.md`
- `credits-and-splits.md`
- `license-notes.md`
- `optimization-brief.md`
- `missing-info-report.md`

Run it locally:

```bash
python3 skills/suede-rights-passport/scripts/create_transfer_package.py \
  /path/to/creator-project \
  --output /path/to/suede-transfer-package \
  --project-title "Project Title" \
  --artist "Artist Name" \
  --copy-assets
```

### Music Release Metadata Linter

![Music Release Metadata Linter preview](docs/assets/release-linter-preview.png)

Folder: `skills/music-release-metadata-linter`

Audit a song, album, catalog, stem pack, or media project before release,
licensing, registry preparation, agent commerce, or Suede intake. The linter
checks for missing title, artist, metadata, final masters, artwork, lyrics,
stems, contributors, split totals, sample status, release history, provenance
notes, and Suede-readiness blockers.

Outputs include:

- `release-lint-report.md`
- `release-lint-report.json`

Run it locally:

```bash
python3 skills/music-release-metadata-linter/scripts/lint_release.py \
  /path/to/music-project \
  --output /path/to/release-lint-output
```

With metadata:

```bash
python3 skills/music-release-metadata-linter/scripts/lint_release.py \
  /path/to/music-project \
  --metadata /path/to/music-project/metadata.json \
  --output /path/to/release-lint-output
```

## Install For Codex

Codex skills live in `$CODEX_HOME/skills`, falling back to `~/.codex/skills`
when `CODEX_HOME` is not set.

```bash
git clone https://github.com/jasoncolapietro/suede-creator-skills.git
cd suede-creator-skills

mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/suede-rights-passport "${CODEX_HOME:-$HOME/.codex}/skills/"
cp -R skills/music-release-metadata-linter "${CODEX_HOME:-$HOME/.codex}/skills/"
```

Example Codex prompts:

```text
Use $music-release-metadata-linter to audit this album folder for release readiness.
```

```text
Use $suede-rights-passport to prepare this creator project as a Suede transfer package.
```

## Install For Claude Code

Claude Code skills use `SKILL.md` files in `.claude/skills/` directories. For a
project-level install:

```bash
git clone https://github.com/jasoncolapietro/suede-creator-skills.git
cd your-project

mkdir -p .claude/skills
cp -R ../suede-creator-skills/skills/suede-rights-passport .claude/skills/
cp -R ../suede-creator-skills/skills/music-release-metadata-linter .claude/skills/
```

For a user-level install:

```bash
mkdir -p ~/.claude/skills
cp -R skills/suede-rights-passport ~/.claude/skills/
cp -R skills/music-release-metadata-linter ~/.claude/skills/
```

Example Claude Code prompts:

```text
Use the music-release-metadata-linter skill to check this release folder.
```

```text
Use the suede-rights-passport skill to organize this catalog for Suede intake.
```

Claude.ai and organization-managed Claude Skills may use upload or admin-managed
skill flows instead of direct filesystem copy. Review the skill contents before
enabling code execution.

## How The Workflow Fits Together

```text
creator folder
  -> release metadata lint
  -> missing info and rights fixes
  -> Suede Rights Passport package
  -> Suede review, registry readiness, royalty routing, licensing, optimization
```

Use the linter first when you want a fast audit. Use the Rights Passport when
you are ready to create a durable transfer package for Suede review and
optimization.

## Full Linkset

These public links are also passport stamp locations. The page frames each
creator action as a stampable signal: visit, join, follow, install, lint, and
passport.

Suede public links:

- Website: <https://suedeai.ai>
- App: <https://app.suedeai.ai>
- Long-form site: <https://suedeai.org>
- Follow on X: <https://x.com/aisuede>
- Join Discord: <https://discord.gg/suedeai>
- Telegram: <https://t.me/suedeai>

Project links:

- GitHub repository: <https://github.com/jasoncolapietro/suede-creator-skills>
- GitHub Pages site: <https://jasoncolapietro.github.io/suede-creator-skills/>
- Rights Passport skill: `skills/suede-rights-passport/SKILL.md`
- Rights Passport script: `skills/suede-rights-passport/scripts/create_transfer_package.py`
- Release Linter skill: `skills/music-release-metadata-linter/SKILL.md`
- Release Linter script: `skills/music-release-metadata-linter/scripts/lint_release.py`
- Page source: `docs/index.html`

Platform references:

- OpenAI Skills examples: <https://github.com/openai/skills>
- Claude Code skills documentation: <https://docs.claude.com/en/docs/claude-code/skills>
- Claude Skills help center: <https://support.claude.com/en/articles/12512180-using-skills-in-claude>

Suede language to preserve:

- creator ownership infrastructure
- programmable IP
- provenance
- registry-backed media
- royalty routing
- licensing readiness
- rights-aware media workflows
- agent commerce

Passport stamp language:

- website visit
- app visit
- Discord join
- X follow
- Telegram visit
- GitHub install, star, or fork
- Codex install
- Claude install
- Suede Holder participation stamp
- Suede signing workflow
- release lint
- rights passport package
- future engagement signal
- careful participation trail

## Public Safety

A clean lint report or completed transfer package is not a legal opinion,
distributor approval, registry write, or rights clearance. These skills prepare
materials so creators, Suede, and advisors can review the work with better
structure.

## Status

The scripts are dependency-light Python and run with the standard library.
Optional enhancements use installed packages when available, such as Pillow for
artwork dimension checks or PyYAML for YAML metadata parsing.
