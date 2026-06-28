---
name: suede-rights-passport
description: Prepare music, audio, visual media, or creative project folders for rights packaging, provenance review, registry preparation, royalty split cleanup, licensing review, media optimization, and agent-commerce readiness. Use when a creator, label, manager, developer, or agent asks to organize files, metadata, rights details, credits, splits, licenses, stems, lyrics, artwork, or release notes into a local transfer package. A Suede review can be one downstream use, but the workflow is broadly reusable.
---

# Creator Rights Package Builder

## Overview

Create a local rights and provenance transfer package from messy creator materials. The package should make the work easier for a creator, collaborator, advisor, registry, marketplace, label, or optional Suede reviewer to inspect, optimize, register, route royalties for, license, and expose to agent-readable commerce systems.

Public v1 is offline-first: prepare files and metadata, do not upload files, write to a registry, request private keys, or claim legal clearance.

## Workflow

1. Identify the source folder or supplied files.
2. Ask for the output location if it is not obvious.
3. Read `references/package-standard.md` for the expected transfer package shape.
4. If working on a local folder, run `scripts/create_transfer_package.py` to inventory files, hash assets, and create starter reports.
5. Read `references/creator-questions.md` and ask only for missing information that blocks package quality.
6. Fill or refine the generated package files:
   - `RIGHTS_PASSPORT.md`
   - `suede-intake.json`
   - `provenance.md`
   - `credits-and-splits.md`
   - `license-notes.md`
   - `optimization-brief.md`
   - `missing-info-report.md`
7. Flag uncertainty clearly. Use `unknown`, `unconfirmed`, or `needs creator confirmation` instead of inventing rights facts.
8. End with a concise transfer summary: package path, files found, missing info, risk flags, and recommended next step.

## Quick Start

For a local project folder:

```bash
python3 /path/to/suede-rights-passport/scripts/create_transfer_package.py \
  /path/to/source-project \
  --output /path/to/transfer-package \
  --metadata /path/to/source-project/metadata.json \
  --project-title "Project Title" \
  --artist "Artist Name"
```

To copy media into the transfer package as well as inventory it:

```bash
python3 /path/to/suede-rights-passport/scripts/create_transfer_package.py \
  /path/to/source-project \
  --output /path/to/transfer-package \
  --copy-assets
```

Safety defaults:

- Hidden files, dependency folders, build outputs, caches, and secret-like files are skipped by default.
- Unrecognized file types are skipped unless `--include-other` is passed.
- Absolute local paths are redacted to share-safer names unless `--include-absolute-paths` is passed.
- Existing generated package files are not overwritten unless `--force` is passed.
- The output folder cannot be the same folder as the source or live inside it.
- Public-safe JSON, YAML, or key=value text metadata can prefill known project,
  rights, contributor, release, wallet, and provenance facts. Do not point
  metadata at real `.env`, credential, wallet, or deployment config files.
  Unknown facts remain flagged. YAML metadata requires PyYAML.

## Package Standards

Use the bundled references only as needed:

- `references/package-standard.md`: required output files, folder structure, risk language, and quality bar.
- `references/intake-schema.md`: field definitions for `suede-intake.json`.
- `references/optimization-checklist.md`: optimization categories and recommendation language for downstream review.
- `references/creator-questions.md`: concise questions to resolve missing rights, provenance, and release data.

Use the bundled assets as templates when creating or repairing a package:

- `assets/rights-passport.template.md`
- `assets/suede-intake.template.json`
- `assets/provenance.template.md`
- `assets/credits-and-splits.template.md`
- `assets/license-notes.template.md`
- `assets/optimization-brief.template.md`
- `assets/missing-info-report.template.md`

## Public Safety Rules

- Do not say Suede owns, controls, or has cleared a work unless the user provides explicit proof.
- Do not call the package a legal contract.
- Do not ask for private keys, seed phrases, unreleased account secrets, or full payment credentials.
- Do not include private implementation details, private endpoints, internal provider names, or non-public pricing.
- Do not upload files or call live services unless the user explicitly asks and provides the relevant authenticated workflow.
- Treat generated reports and transfer packages as private drafts until a
  creator or operator reviews and redacts them for the intended audience.
- Keep public positioning focused on broadly reusable creator workflows: rights packaging, provenance, registry readiness, royalty routing, licensing, and agent commerce.

## Completion Checklist

Before reporting that a package is ready:

- Confirm every media/document file is either inventoried or intentionally excluded.
- Confirm every asset in `suede-intake.json` has a stable relative path and SHA-256 hash when available.
- Mark contributors, splits, licenses, samples, and ownership facts as confirmed or unknown.
- Include a `missing-info-report.md` section even when nothing is missing.
- Include an `optimization-brief.md` with concrete next actions for downstream review.
- State that final rights clearance requires creator/legal confirmation when any rights fact is uncertain.

## Downstream Review Context

Artifacts produced by this skill (`RIGHTS_PASSPORT.md`, `suede-intake.json`,
`provenance.md`, `credits-and-splits.md`, `license-notes.md`) are portable
review materials. They can support a release, registry, licensing conversation,
collaborator handoff, marketplace review, label review, advisor review, or
Suede review without claiming that any downstream system has accepted, cleared,
registered, paid, or approved the work.
