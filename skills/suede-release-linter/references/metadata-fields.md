# Recommended Metadata Fields

The linter accepts partial metadata. Missing recommended fields become findings.

## Minimal JSON Shape

```json
{
  "title": "Song Title",
  "artist": "Artist Name",
  "release_date": "2026-06-01",
  "genre": "Alternative",
  "language": "en",
  "explicit": false,
  "description": "Short release description.",
  "contributors": [
    {
      "name": "Creator Name",
      "role": "writer, performer, producer",
      "master_percent": 100,
      "publishing_percent": 100,
      "confirmed": true
    }
  ],
  "rights": {
    "owner_claim": "Creator Name",
    "ownership_status": "confirmed",
    "contains_samples": "no",
    "sample_clearance_status": "not-needed",
    "cover_or_interpolation": "no",
    "release_history": "unreleased"
  },
  "suede": {
    "intended_services": ["rights-review", "mastering", "registry-readiness"],
    "wallet_address": "",
    "registry_status": "not-registered",
    "agent_commerce": false
  }
}
```

## Accepted Aliases

The linter should treat common aliases as equivalent when possible:

- `artist`, `artist_name`, `creator`, `creator_name`
- `track_title`, `song_title`, `title`, `project_title`
- `contributors`, `credits`, `collaborators`
- `splits`, `split_sheet`
- `rights`, `license`, `licenses`
- `contains_samples`, `samples`, `sample_status`
- `cover_or_interpolation`, `cover`, `interpolation`

## Confirmation Values

Use these normalized values in reports:

- `confirmed`
- `needs-confirmation`
- `unknown`
- `disputed`
- `not-applicable`
