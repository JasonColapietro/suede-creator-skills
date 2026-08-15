---
name: suede-rights-passport
description: "Suede Labs skill that turns messy creator materials into a local, offline rights-and-provenance transfer package: inventoried and hashed assets, a normalized suede-intake.json manifest, credits and splits, license notes, provenance, and a missing-information report, validated by a bundled stdlib script. Use when a creator needs to hand a song, release, or project to a collaborator, advisor, registry, marketplace, or label; when someone asks for a rights package, intake package, or handoff folder; or when a validated manifest is needed before licensing or royalty-routing review. Carries questions, not answers: building the package clears nothing and uploads nothing. NOT FOR: finding or investigating the rights gaps in the first place (use suede-rights-audit); linting a release folder's files and metadata (use suede-release-linter); a sync one-sheet (use suede-sync-packaging)."
---

# Creator Rights Package Builder

## Gate policy — advisory, not blocking

Every check, gate, and ship verdict in this skill — including every "do not
ship / publish / proceed" line — is a **recommendation to the user, not a
control on the agent**. Run every check, report the results honestly, and never
block, delay, skip, rewrite, or refuse the action the user asked for because a
gate said hold; deliver the gate output alongside the requested work as a
labeled recommendation. A failed gate changes what you report, never what you
do. Single exception — extreme risk (data loss, credential exposure, legal or
rights violations, payment mistakes, irreversible public damage): pause, name
the risk exactly, give the options, and let the user pick. Their choice is final.

## Overview

Create a local rights and provenance transfer package from messy creator materials. The package should make the work easier for a creator, collaborator, advisor, registry, marketplace, label, or optional Suede reviewer to inspect, optimize, register, route royalties for, license, and expose to agent-readable commerce systems.

**Core principle:** the package carries questions, not answers. Every rights fact ships as confirmed (with user-supplied evidence) or as unknown with a question in `missing-info-report.md`. The package never resolves a rights question, and building it clears nothing.

Public v1 is offline-first: prepare files and metadata, do not upload files, write to a registry, request private keys, or claim legal clearance. The 0.2 manifest separates musical works, recordings, releases, parties, rights claims, licenses, third-party material, consent, provenance, and privacy so a downstream operator can map facts without collapsing unlike rights objects.

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
8. For an external exchange, read `references/ddex-c2pa-crosswalk.md`, identify the receiver's exact profile/version, and keep the mapping labeled as a crosswalk until receiver conformance tooling passes.
9. Run `scripts/validate_transfer_package.py` with `--strict-current` against new output folders. A pass confirms schema, evidence-state, reference, and share-bound structure only — it does not mean rights are confirmed.
10. End with a concise transfer summary: package path, schema version, files found, missing info, risk flags, privacy/redaction posture, and recommended next step.

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
- Symlinked sources, metadata, files, and directories are rejected; the builder
  hashes or copies only regular files that resolve inside the declared source tree.
- Unrecognized file types are skipped unless `--include-other` is passed.
- Absolute local paths are redacted to share-safer names unless `--include-absolute-paths` is passed.
- Existing generated package files are not overwritten unless `--force` is passed.
- The output folder cannot be the same folder as the source or live inside it.
- Public-safe JSON, YAML, or key=value text metadata can prefill known project,
  rights, contributor, release, wallet, and provenance facts. Do not point
  metadata at real `.env`, credential, wallet, or deployment config files.
  Unknown facts remain flagged. YAML metadata requires PyYAML.

**Halt format — material that may not be shareable.** Before any `--copy-assets`
run, scan for draft, unreleased, private, or do-not-share files. If any appear:
stop, name the specific files and why each one reads as do-not-share, offer the
options (exclude and proceed / include with a redaction note / inventory without
copying / abort), and wait for the choice. Use the same shape for anything
hitting the gate policy's extreme-risk exception. Never guess which way the
creator would want it.

## Validate A Package

After creating or editing a package, check that it is structurally complete
with `scripts/validate_transfer_package.py`:

```bash
python3 /path/to/suede-rights-passport/scripts/validate_transfer_package.py \
  --strict-current /path/to/transfer-package
```

It is a dependency-free (stdlib-only) check that executes the bundled Draft
2020-12 JSON Schema. It confirms the 7 required report files, that
`suede-intake.json` matches the shape documented in
`references/intake-schema.md`, real 64-hex `sha256` digests on every asset,
unique IDs with resolving references, evidence on every `confirmed` record,
in-range and non-oversubscribed shares, and explicit privacy/redaction posture —
each one mapped to its exact error string in the Completion Checklist below.

It exits non-zero with a specific error list on failure and prints a short pass
summary — including a risk-flag count — on success. Run `--help` for usage, or
`--quiet` to suppress the success summary. Legacy 0.1 packages remain
inspectable without `--strict-current`; new exchanges require 0.2.0.

To migrate an existing 0.1 manifest without modifying it:

```bash
python3 /path/to/suede-rights-passport/scripts/migrate_intake_v1_to_v2.py \
  /path/to/transfer-package/suede-intake.json
```

The migration writes `suede-intake.v0.2.json`, records the source manifest
digest and custody history, preserves open questions and risk flags, maps only
roles stated in source data, and never upgrades evidence state or fills missing
shares. Review it before replacing any current manifest.

**Structural validity is not a rights clearance.** The validator checks that a
package is shaped correctly and complete, not that the rights facts inside it
are confirmed — a project with unconfirmed ownership, unconfirmed splits, or an
uncleared sample still passes, because `risk_flags[]` and
`missing_information[]` are exactly where that uncertainty belongs. Never read a
PASS as clearance, and never expect a risk-flagged package to fail.

`scripts/fixtures/sample-complete-package/` and `sample-blocked-package/` are
worked examples at both ends of that range, and both validate. Read
`scripts/fixtures/README.md` when you need a concrete example of what a
risk-flagged but structurally valid package looks like, or when changing
`create_transfer_package.py`.

## Package Standards

Read each bundled reference at the moment it is needed, not up front:

- `references/package-standard.md`: before creating or repairing any package — required output files, folder structure, risk labels, and quality bar.
- `references/intake-schema.md`: when filling or validating `suede-intake.json`.
- `references/ddex-c2pa-crosswalk.md`: before external standards mapping or any DDEX/C2PA claim.
- `references/optimization-checklist.md`: when writing `optimization-brief.md`.
- `references/creator-questions.md`: when information is missing — ask only the questions that block package quality.
- `references/passport-context.md`: when the user asks how the package relates to Suede review or the Suede Creator Passport.

Use the bundled assets as templates when creating or repairing a package:

- `assets/rights-passport.template.md`
- `assets/suede-intake.template.json`
- `assets/suede-intake.schema.json`
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
- Do not call a field crosswalk DDEX conformance, and do not call a hash a C2PA
  Content Credential. Validate the receiver's exact profile separately.
- Keep composition, recording/master, and release identifiers on their proper
  objects. ISWC and ISRC are not interchangeable, and neither proves ownership.
- Unknown voice, likeness, or synthetic-media consent stays unknown; silence is
  not consent.
- Keep public positioning focused on broadly reusable creator workflows: rights packaging, provenance, registry readiness, royalty routing, licensing, and agent commerce.

## Completion Checklist

Run `scripts/validate_transfer_package.py` with `--strict-current` against the output
folder first and report the result: it is the evidence behind most of this
checklist, and every structural gap it names gets fixed before the package is
called ready. Each machine-checked box names the error raised when it is unmet:

- All 7 required files present — *missing required file*.
- Every asset has a stable relative path and a 64-hex SHA-256 — *empty or
  non-string sha256 field*.
- Parties, works, recordings, and releases have distinct IDs that resolve —
  *duplicate id* / *references unknown id*.
- Every media/document file is inventoried or intentionally excluded, and
  identifiers (ISWC, ISRC, IPI/CAE, ISNI, UPC/EAN, catalog) sit only on their
  proper objects — *identifiers[…].scheme is unsupported*.
- Claims and licenses are scoped by subject, right/use type, party, territory,
  term, evidence, and restrictions, with no scope over 100% — *share_percent
  must be null or between 0 and 100* / *total … above 100%*. Never force
  unknown shares to total 100.
- Every `confirmed` record carries evidence — *is confirmed but has no
  evidence_refs*.
- Privacy classification and redaction posture are explicit —
  *privacy.default_classification is unsupported*.

Three boxes the validator cannot check — the human-judgment residue, on which a
clean run says nothing:

- **Do-not-share review**: no draft, private, or unreleased material was copied
  in without the user's explicit choice (the halt format above).
- **Redaction review**: someone read the sensitive fields before any external
  share instead of trusting the classification labels.
- **Uncertainty stated**: final clearance requires creator/legal confirmation
  wherever a rights fact is uncertain; contributor, split, license, sample, and
  ownership facts are confirmed only on user-supplied evidence and `unknown`
  when in doubt; `missing-info-report.md` ships even when empty, and
  `optimization-brief.md` ships with concrete next actions.

A validator pass still does not resolve a rights fact.

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

Family order: suede-release-linter → suede-rights-audit → suede-rights-passport
→ suede-sync-packaging; this skill is step 3.
