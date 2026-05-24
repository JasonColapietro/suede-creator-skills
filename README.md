# Suede Creator Skills

Public agent skills for preparing creative work for ownership, provenance,
release readiness, royalty routing, licensing, and agent commerce.

Suede is creator ownership infrastructure: tools and workflows that help music
and media become organized, attributable, rights-aware, registry-ready, and
usable by humans and agents. This repository publishes two offline-first skills
that help creators and agents clean up a project before deeper Suede
optimization.

## Public Page

The GitHub Pages landing page is in `docs/index.html`. Once this repo exists
under `jasoncolapietro` and Pages is enabled from `/docs` on `main`, it will be
available at:

```text
https://jasoncolapietro.github.io/suede-creator-skills/
```

## The Skills

### Suede Rights Passport

`skills/suede-rights-passport`

Turn a messy creator folder into a Suede-ready transfer package.

It inventories media, documents, lyrics, artwork, stems, credits, splits,
licenses, provenance notes, and missing rights information. The output is a
structured package Suede can review before registry setup, royalty routing,
licensing, media optimization, or agent-commerce packaging.

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

`skills/music-release-metadata-linter`

Audit a song, album, catalog, stem pack, or media folder before release or Suede
intake.

It checks for missing title, artist, metadata, final masters, artwork, lyrics,
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

## How They Work Together

Use the linter first when you want a fast audit. It tells you what is missing,
what is risky, and whether the project is blocked.

Use the Rights Passport when you are ready to organize the project for Suede
intake. It creates the transfer package Suede can use for optimization,
provenance review, registry readiness, licensing, and royalty routing.

```text
creator folder
  -> release metadata lint
  -> fixes and confirmations
  -> Suede Rights Passport package
  -> Suede review and optimization
```

## Public Safety

These skills are offline-first. They do not upload files, write to a registry,
call private Suede services, request secrets, or claim legal clearance.

A clean report or completed transfer package is not a legal opinion. It means
the project is better organized for creator confirmation, Suede review, and
next-step optimization.

## What Suede Cares About

Suede public copy should stay focused on:

- creator ownership infrastructure
- programmable IP
- provenance
- registry-backed media
- royalty routing
- licensing readiness
- rights-aware media workflows
- agent commerce

Suede is not just an AI music app. These skills are small public pieces of the
larger ownership and commerce layer for creative work.

## Repo Layout

```text
skills/
  suede-rights-passport/
  music-release-metadata-linter/
docs/
  index.html
```

## Install As Local Codex Skills

Copy either skill folder into your Codex skills directory:

```bash
mkdir -p ~/.codex/skills
cp -R skills/suede-rights-passport ~/.codex/skills/
cp -R skills/music-release-metadata-linter ~/.codex/skills/
```

## Status

Both skills have been validated locally with the Codex skill validator. The
scripts are dependency-light Python and run with the standard library. Optional
enhancements use installed packages when available, such as Pillow for artwork
dimension checks or PyYAML for YAML metadata parsing.
