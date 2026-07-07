---
name: suede-rights-passport
description: "Package creative project folders into rights-ready handoffs: files, metadata, credits, splits, licenses, stems, lyrics, artwork, and notes."
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
8. Run `scripts/validate_transfer_package.py` against the output folder to confirm the package is structurally complete before handoff. A pass confirms shape and completeness only — it does not mean rights are confirmed.
9. End with a concise transfer summary: package path, files found, missing info, risk flags, and recommended next step.

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

## Validate A Package

After creating or editing a package, check that it is structurally complete
with `scripts/validate_transfer_package.py`:

```bash
python3 /path/to/suede-rights-passport/scripts/validate_transfer_package.py \
  /path/to/transfer-package
```

It is a thin, dependency-free (stdlib-only) check that confirms:

- All 7 required report files are present (`RIGHTS_PASSPORT.md`,
  `suede-intake.json`, `provenance.md`, `credits-and-splits.md`,
  `license-notes.md`, `optimization-brief.md`, `missing-info-report.md`).
- `suede-intake.json` is valid JSON and matches the top-level and nested
  shape documented in `references/intake-schema.md`.
- Every entry in `assets[]` has a `sha256` field that looks like a real
  64-character hex digest.

It exits non-zero with a specific error list on failure (missing file,
invalid JSON, missing schema field, missing/malformed hash) and prints a
short pass summary — including a risk-flag count — on success. Run
`--help` for usage, or `--quiet` to suppress the success summary.

**Structural validity is not a rights clearance.** This validator checks
that a package is *shaped correctly and complete*, not that the rights
facts inside it are confirmed. A package documenting a project with real
open questions (unconfirmed ownership, unconfirmed splits, an uncleared
sample) still passes validation as long as every required file exists and
`suede-intake.json` is well-formed — the `risk_flags[]` and
`missing_information[]` arrays are exactly where that uncertainty is
supposed to live. Structural validity and rights confirmation are two
independent checks; do not treat a validator PASS as a rights clearance,
and do not expect the validator to fail a package just because it is
risk-flagged.

Two reference example packages under `scripts/fixtures/` show both ends of
that range, generated end-to-end by `create_transfer_package.py` against
synthetic (non-real) creator projects:

- `scripts/fixtures/sample-complete-package/`: confirmed ownership,
  confirmed contributors with matching split percentages, no samples.
  Zero risk flags, zero open missing-information items, validates cleanly.
- `scripts/fixtures/sample-blocked-package/`: disputed ownership,
  unconfirmed contributors/splits, an uncleared sample. Three high-severity
  and one medium-severity risk flag, four open missing-information items —
  still structurally valid, but clearly not ready for registry, licensing,
  or royalty routing.

Both fixtures validate with `validate_transfer_package.py`; only their risk
posture differs.

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
- Run `scripts/validate_transfer_package.py` against the output folder and report the result. If it fails, fix the structural gap it names before calling the package ready — a validator failure means a required file is missing or `suede-intake.json` is malformed, not that a rights fact is unresolved.

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
