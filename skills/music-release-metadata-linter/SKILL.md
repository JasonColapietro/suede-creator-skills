---
name: music-release-metadata-linter
description: Audit music, audio, video, artwork, and creative release folders for missing metadata, release-readiness gaps, file organization issues, rights and split blockers, artwork/lyrics/stems omissions, platform-delivery problems, and Suede intake readiness. Use when a creator, label, manager, developer, or agent asks to lint, check, audit, validate, prepare, or clean a song, album, catalog, stem pack, or media project before release, licensing, registry, royalty routing, agent commerce, or Suede transfer.
---

# Music Release Metadata Linter

## Overview

Audit a music or media project folder and produce a practical release-readiness report. The linter should help creators find missing files, weak metadata, rights risks, split gaps, platform-delivery blockers, and Suede intake issues before a release or transfer package is created.

Public v1 is offline-first: inspect local files and supplied metadata, do not upload to Suede, write to a registry, call distribution APIs, request private keys, or claim legal clearance.

## Workflow

1. Identify the source folder or supplied files.
2. Ask for the output location if it is not obvious.
3. Read `references/lint-rules.md` for the lint categories and severity model.
4. If working on a local folder, run `scripts/lint_release.py` to generate `release-lint-report.md` and `release-lint-report.json`.
5. Read `references/fix-guidance.md` when turning findings into specific next actions.
6. If the user wants Suede intake prep, use the report to decide whether to invoke or recommend the `suede-rights-passport` package workflow.
7. Do not invent release metadata. Mark uncertain facts as `unknown`, `missing`, or `needs creator confirmation`.
8. End with a concise summary: report path, score, highest-severity findings, and next fixes.

## Quick Start

```bash
python3 /path/to/music-release-metadata-linter/scripts/lint_release.py \
  /path/to/music-project \
  --output /path/to/release-lint-output
```

If the source folder contains a metadata file, pass it explicitly:

```bash
python3 /path/to/music-release-metadata-linter/scripts/lint_release.py \
  /path/to/music-project \
  --metadata /path/to/music-project/metadata.json \
  --output /path/to/release-lint-output
```

Accepted metadata formats are JSON, YAML/YML when PyYAML is installed, and
public-safe key=value text files. Do not point metadata at real `.env`,
credential, wallet, or deployment config files.

Safety defaults:

- Hidden files, dependency folders, build outputs, caches, and secret-like files are skipped by default.
- Unrecognized file types are skipped unless `--include-other` is passed.
- Absolute local paths are redacted to share-safer names unless `--include-absolute-paths` is passed.
- Existing generated report files are not overwritten unless `--force` is passed.
- The output folder cannot be the same folder as the source or live inside it.
- YAML metadata requires PyYAML: `python3 -m pip install PyYAML`.

## What To Check

Use the bundled references only as needed:

- `references/lint-rules.md`: lint categories, severity levels, and pass/fail expectations.
- `references/metadata-fields.md`: recommended release, contributor, rights, and delivery fields.
- `references/fix-guidance.md`: suggested fixes and Suede next-step mapping.

The script writes:

- `release-lint-report.md`: human-readable report.
- `release-lint-report.json`: machine-readable findings.

Use the bundled assets when repairing or hand-writing reports:

- `assets/release-lint-report.template.md`
- `assets/release-lint-report.template.json`
- `assets/metadata.example.json`

## Public Safety Rules

- Do not say a project is legally cleared unless the user provides explicit proof.
- Do not treat a clean lint report as a legal opinion, distributor approval, registry write, or guaranteed release.
- Do not ask for private keys, seed phrases, unreleased account secrets, or full payment credentials.
- Do not include private Suede implementation details, private endpoints, internal provider names, or non-public pricing.
- Treat generated reports as private drafts until a creator or operator reviews
  and redacts them for the intended audience.
- Keep public positioning focused on creator ownership infrastructure, metadata quality, provenance, release readiness, rights, royalty routing, licensing, and agent commerce.

## Completion Checklist

Before reporting a lint result:

- Confirm the source folder was inspected or state that the report is based only on supplied text.
- Confirm whether metadata was discovered, supplied, or missing.
- Report the score and severity counts.
- List all `error` findings and the most important `warning` findings.
- State whether the project is ready for Suede intake, ready with caveats, or blocked.
- Recommend a next action: fix metadata, collect rights confirmations, prepare a Suede Rights Passport, or package for release.

## Suede Passport Context

A clean release-lint report is itself a Suede Creator Passport signal: proof
that a creator runs disciplined release process. The "Release Linter clean"
stamp is on the anticipated stamp surface alongside "Rights Passport
produced", "IP registered on Base", and Suede-native music-identity stamps
(Rig Card verified, Studio Fingerprint computed).

Stamping infrastructure ships in a later phase. Until then, this skill
produces the artifact; the Passport will recognize it once the registry
stamping API is live. See `references/passport-context.md` for install-safe
context and the repo-root `PASSPORT.md` for the full public concept.
