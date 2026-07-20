# Release Lint Rules

## Severity Levels

- `error`: Recommends blocking release, Suede intake, registry, licensing, royalty routing, or agent commerce. The status is a report to the creator, not an action lock; the creator decides what proceeds.
- `warning`: Does not usually warrant a blocked recommendation, but should be fixed before public release or monetization.
- `info`: Useful improvement or optional cleanup.

## Score

Start at 100.

- Each `error` subtracts 15 points.
- Each `warning` subtracts 5 points.
- Each `info` subtracts 1 point.
- Minimum score is 0.

Score bands:

- `90-100`: strong
- `75-89`: usable with cleanup
- `50-74`: needs work
- `0-49`: blocked

## Required Categories

### Core Release Metadata

Error when title or artist/creator name is missing.

Warning when release date, genre, language, description, tags, explicit-content status, or public URLs are missing.

### Primary Media

Error when no primary audio/video file exists.

Warning when only low-quality or compressed audio is present and no WAV/AIFF/FLAC master exists.

Info when multiple possible masters are present and the final master is not obvious.

### Artwork

Warning when no artwork image is present.

Warning when artwork exists but is not square or is smaller than common distribution expectations. The script only checks dimensions when Pillow is installed.

### Lyrics And Timed Text

Info when no lyrics are present.

Warning when the release is clearly vocal music and no lyrics are present. Agents should infer this only from filenames or provided metadata, not guess from audio content.

### Stems

Info when no stems are present.

Warning when the user intends remix, sync, licensing, agent commerce, or Suede optimization and no stems are present.

### Credits And Splits

Error when contributors, credits, or split details are missing.

Error when split totals are present but do not add to 100 for master or publishing.

Warning when contributors exist but confirmation status is missing.

### Rights And Licenses

Error when sample, cover, interpolation, loop, or third-party beat status is unknown.

Error when a project claims samples exist but clearance status is missing or uncleared.

Warning when release/distribution history is unknown.

### Suede Intake

Error when ownership, contributors, splits, or sample status blocks registry/licensing/royalty routing.

Warning when provenance notes, file hashes, wallet/payment destinations, or intended Suede services are missing.

Info when the project is a good candidate for `suede-rights-passport`.
