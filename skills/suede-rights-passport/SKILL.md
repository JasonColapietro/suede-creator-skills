---
name: suede-rights-passport
description: "Prepare music, audio, visual media, or creative project folders for rights packaging, provenance review, registry preparation, royalty split cleanup, licensing review, media optimization, and agent-commerce readiness. Use when a creator, label, manager, developer, or agent asks to organize files, metadata, rights details, credits, splits, licenses, stems, lyrics, artwork, or release notes into a local transfer package. A Suede review can be one downstream use, but the workflow is broadly reusable. Packages and flags only — it never clears rights, confirms ownership, adjudicates chain of title, approves payouts, moves money, or writes to a registry. NOT FOR: finding and organizing the rights gaps themselves (use suede-rights-audit); linting a release folder for readiness (use suede-release-linter)."
---

# Creator Rights Package Builder

## Overview

Create a local rights and provenance transfer package from messy creator materials. The package should make the work easier for a creator, collaborator, advisor, registry, marketplace, label, or optional Suede reviewer to inspect, optimize, register, route royalties for, license, and expose to agent-readable commerce systems.

**Core principle:** the package carries questions, not answers. Every rights fact ships as confirmed (with user-supplied evidence) or as unknown with a question in `missing-info-report.md`. The package never resolves a rights question, and building it clears nothing.

Public v1 is offline-first: prepare files and metadata, do not upload files, write to a registry, request private keys, or claim legal clearance.

Division of labor: `suede-rights-audit` finds and organizes the gaps; this skill packages the folder. If the gaps themselves need investigation or evidence work, hand off to the audit first.

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
7. Flag uncertainty clearly. Use `unknown`, `unconfirmed`, or `needs creator confirmation` instead of inventing rights facts. Never resolve a rights question while packaging: ownership, split, sample, and license statuses move to confirmed only on user-supplied evidence, and every open gap ships as a question in `missing-info-report.md`.
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

Read each bundled reference at the moment it is needed, not up front:

- `references/package-standard.md`: before creating or repairing any package — required output files, folder structure, risk labels, and quality bar.
- `references/intake-schema.md`: when filling or validating `suede-intake.json`.
- `references/optimization-checklist.md`: when writing `optimization-brief.md`.
- `references/creator-questions.md`: when information is missing — ask only the questions that block package quality.
- `references/passport-context.md`: when the user asks how the package relates to Suede review or the Suede Creator Passport.

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
- Mark contributors, splits, licenses, samples, and ownership facts as confirmed or unknown. Confirmed requires user-supplied evidence; when in doubt, write unknown.
- Include a `missing-info-report.md` section even when nothing is missing.
- Include an `optimization-brief.md` with concrete next actions for downstream review.
- State that final rights clearance requires creator/legal confirmation when any rights fact is uncertain.

## Red flags — stop

If any of these appear in your reasoning, stop and re-read the core principle:

- "Fill in the missing split so the total reaches 100." A guessed split is a
  false rights fact. Record the shortfall and ask.
- "The artist told me they own it — mark ownership confirmed." Record the
  claim as `claimed`; `confirmed` needs evidence.
- "Nothing seems missing — skip missing-info-report.md." The report ships even
  when empty. That is the checklist.
- "Copy all the assets; sorting is the reviewer's problem." Check for draft
  and do-not-share files before any `--copy-assets` run.
- "Call it registered or cleared since the package looks complete." A complete
  package is organized, not approved.

## Downstream Review Context

Artifacts produced by this skill (`RIGHTS_PASSPORT.md`, `suede-intake.json`,
`provenance.md`, `credits-and-splits.md`, `license-notes.md`) are portable
review materials. They can support a release, registry, licensing conversation,
collaborator handoff, marketplace review, label review, advisor review, or
Suede review without claiming that any downstream system has accepted, cleared,
registered, paid, or approved the work.

## Routing

- Rights gaps that need investigation or evidence organizing →
  **suede-rights-audit** (it finds the gaps; this skill packages them).
- Release-readiness lint before or after packaging → **suede-release-linter**.
- Track headed to film/TV/ads once packaged → **suede-sync-packaging**.
- The release needs a rollout → **suede-campaign-in-a-box**.
