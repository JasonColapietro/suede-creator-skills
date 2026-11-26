# Release checklist: Directory maker workspace

## Set up protected staging

Use an isolated database and a dedicated GitHub OAuth app for each environment. Do not share a database or OAuth client between staging, production or the sibling Skills site. As database owner, apply `deployment/migrations/20261123-maker-v2.sql`, then `deployment/migrations/20261124-maker-recovery.sql` and `deployment/migrations/20261126-maker-approved-listings.sql`. Do not expose the private schema.

| Directory setting | Staging value |
| --- | --- |
| `SUEDE_SITE` | `directory` |
| `MAKER_V2_ORIGIN` | The exact protected HTTPS origin, without a trailing slash |
| `MAKER_V2_DB_URL` | The designated Supabase HTTPS origin, without a path |
| `MAKER_V2_DB_SECRET_KEY` | The designated Supabase server key |
| `MAKER_V2_GITHUB_CLIENT_ID` | The dedicated app's client ID |
| `MAKER_V2_GITHUB_CLIENT_SECRET` | The matching server-side OAuth credential |
| `MAKER_V2_MODERATOR_IDS` | Verified numeric GitHub IDs, separated by commas |
| `MAKER_V2_ENABLED` | Set to `true` only after migrations and runtime configuration |
| `MAKER_V2_FEATURED_LINKS` | Set to `true` at build time only after testing claim access on featured projects, standalone skills and compact repository rows |
| `MAKER_V2_PUBLISH_PROFILES` | Unset until the publishing and removal drill passes |

Register `<MAKER_V2_ORIGIN>/api/maker/?action=callback` with the OAuth app. The sign-in must request no GitHub scopes. Make the protected callback reachable in an authenticated staging browser. Store secrets on the server only. Before public access, configure limits for auth and write requests, purge expired login and session rows, and keep OAuth callback parameters, cookies, tokens and secrets out of logs.

## Exercise the staging flow

- Use separate owner, outsider and moderator accounts. Check signed-out routing, the exact OAuth return listing, replay and expiry, logout and origin checks. Confirm the outsider cannot claim or read the owner's data, and the owner starts with empty fields next to the original listing.
- Submit a profile, verify that a stale tab cannot replace it, and approve only the current revision. A rejected or pending revision must not replace an earlier approval. Check that demo and post links are plain outbound links, not hosted previews. A maker may request removal of an approved profile, not an empty one.
- Ask for a re-review or improvement feedback. Confirm the moderator can find the request, reply and close that version. Makers see their latest request and reply for each kind, and must wait for a reply before replacing a pending one. No request, reply or decision goes into the public artifact. Suede's review, grade and rank are independent.
- For an organization, verify an exact listing, repository, account and organization match. Rehearse revocation and an explicitly reviewed transfer using fixture accounts. A moderator uses the successor's immutable GitHub account ID and an internal case reference. Never accept an uncertain or different repository as a transfer, let moderators review their own work, or hand prior private drafts to the successor. Keep the archived state private; set access and retention rules before launch.
- Compare the public artifact with the existing Directory: the maker block is distinct from Suede's review and links; no drafts or private fields appear, and catalog, canonical URLs and indexing behavior are unchanged. Do not send outreach before this passes with a verified live claim.

## Publish or remove maker details

Use one release owner. Do not allow parallel promotion of maker overlays. Prepare a fresh candidate:

```sh
MAKER_V2_EXPORT_APPROVED=true node scripts/export-maker-profiles.mjs > /tmp/maker-profiles.next.json
```

Review the diff, including intentional removals or an empty result, and put the reviewed file at `directory/maker-profiles.json` through the usual review process. Do not direct-push it or reuse stale output after an error. Just before building, and again just before promoting the same immutable artifact, run:

```sh
MAKER_V2_EXPORT_APPROVED=true node scripts/export-maker-profiles.mjs --verify-file directory/maker-profiles.json
```

Only an approved release with `MAKER_V2_PUBLISH_PROFILES=true` shows maker content. If a withdrawal, claim recovery or revocation lands before promotion, stop, export again and rebuild. Earlier static releases can still contain old maker content. Rehearse removal before enabling the flag: rebuild with the flag unset or switch to a verified release without the stale content, clear affected caches and verify the listing from a fresh session. Do not roll back to a release that still contains the withdrawn copy. This public removal does not change editorial content or depend on the claim link flag.

To stop new sign-ins and edits, unset `MAKER_V2_ENABLED` and build without `MAKER_V2_FEATURED_LINKS`. Turning off the API alone does not remove a published profile. Preserve private state during rollback.
