# Suede Intake Manifest Schema

`suede-intake.json` is the agent-readable center of the transfer package. Keep it valid JSON.

## Top-Level Fields

```json
{
  "schema_version": "0.1.0",
  "package_type": "suede-transfer-package",
  "generated_at": "ISO-8601 timestamp",
  "project": {},
  "creator": {},
  "assets": [],
  "rights": {},
  "provenance": {},
  "optimization": {},
  "missing_information": [],
  "risk_flags": []
}
```

## `project`

- `title`: Work or project title.
- `artist_name`: Public artist or creator name.
- `work_type`: `song`, `album`, `stem-pack`, `visual`, `video`, `catalog`, `unknown`, or another short value.
- `description`: Short description for Suede operators.
- `release_status`: `unreleased`, `released`, `scheduled`, `partial`, or `unknown`.
- `public_urls`: Links supplied by the creator.

## `creator`

- `name`: Creator or submitting party.
- `email`: Optional contact.
- `wallet_address`: Optional public wallet address.
- `organization`: Optional label, company, collective, or manager.
- `confirmation_status`: `confirmed`, `needs-confirmation`, or `unknown`.

## `assets[]`

Each asset should include:

- `id`: Stable slug such as `asset-001`.
- `relative_path`: Path relative to the transfer package or source root.
- `original_path`: Original path if available.
- `category`: `audio`, `stem`, `lyrics`, `artwork`, `document`, `video`, `metadata`, or `other`.
- `role`: More specific role, such as `master`, `instrumental`, `vocals`, `cover-art`, `split-sheet`, or `unknown`.
- `mime_guess`: Best-effort media type.
- `size_bytes`: File size.
- `sha256`: SHA-256 content hash.
- `notes`: Short notes.

## `rights`

- `owner_claim`: Human-readable owner claim from the submitter.
- `ownership_status`: `confirmed`, `claimed`, `disputed`, `partial`, or `unknown`.
- `contributors_confirmed`: Boolean.
- `splits_confirmed`: Boolean.
- `contains_samples`: `yes`, `no`, or `unknown`.
- `sample_clearance_status`: `cleared`, `not-needed`, `uncleared`, or `unknown`.
- `cover_or_interpolation`: `yes`, `no`, or `unknown`.
- `license_restrictions`: Array of restrictions.

## `provenance`

- `source_root`: Original folder if known.
- `creation_notes`: Notes from the creator.
- `chain_of_custody`: Array of events.
- `registry_status`: `not-registered`, `ready-for-review`, `registered`, or `unknown`.

## `optimization`

- `requested_services`: Array of requested Suede optimization services.
- `recommended_services`: Array created by the agent.
- `priority`: `low`, `normal`, `high`, or `urgent`.
- `notes`: Short operator-facing note.

## `missing_information[]`

Each item:

- `field`: Missing field or topic.
- `question`: Question to ask the creator.
- `blocks`: Array of blocked next steps, such as `registry`, `licensing`, `royalty-routing`, or `agent-commerce`.
- `severity`: `low`, `medium`, or `high`.

## `risk_flags[]`

Each item:

- `label`: Short label.
- `severity`: `low`, `medium`, `high`, or `unknown`.
- `detail`: Factual explanation.
- `recommended_action`: Next action before Suede proceeds.
