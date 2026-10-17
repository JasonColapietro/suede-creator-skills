# Agent Skills Directory data

Source data for [skills.suedeai.ai/directory/](https://skills.suedeai.ai/directory/), a curated index of other people's open-source Agent Skills. Every page under `docs/directory/` is generated from the files here by `scripts/build-directory.mjs`; never edit that HTML by hand.

| File | What it holds | Who writes it |
| --- | --- | --- |
| `skills.json` | One record per listed skill: source repository, SKILL.md metadata, Suede Skill Check results, license, category, and whether it gets its own page | `scripts/directory/curate.py` |
| `labels.json` | The editorial layer: a category for every skill and a one-sentence summary, in the directory's own words, for skills with a page | Reviewed by hand or by an agent, keyed by skill id |
| `categories.json` | The sixteen category directories: slug, title and intro copy | Hand-written |
| `inclusions.json` | Repositories (`owner/repo`) added from accepted listing requests, with optional per-repository skill-name allowlists; read on the next refresh even when no curated list cites them | Hand-written |
| `notes.json` | Install routes a publisher documents for a skill whose license restricts copying, shown on that skill's page with a link to the source | Hand-written |
| `exclusions.json` | Repositories (`owner/repo`) and skills (`owner/repo/skill-name`) kept out of the directory, each with a recorded reason: author removal requests, and skills whose text trips the pack's public-source guards (`npm run validate` names the file) | Hand-written |

## Commands

```
npm run build:directory          # rebuild docs/directory/ and the sitemap from the data here
node scripts/build-directory.mjs --check   # part of npm run validate
scripts/directory/refresh.sh     # re-read the source repositories, then rebuild
```

`refresh.sh` clones the curated lists and the repositories they cite, reads every SKILL.md, applies the [published method](https://skills.suedeai.ai/directory/methodology/) and rewrites `skills.json`. It reads files only and never executes anything from a clone. Skills that are new since the last refresh get a keyword category and no page of their own until `labels.json` gives them a category and a summary.

Pass an optional work directory to reuse downloads: `scripts/directory/refresh.sh /tmp/suede-directory`. Every run fetches the current default branch of both the curated lists and selected repositories before parsing. Reused repositories become detached snapshots; `suede.directoryDefaultBranch` in their local Git configuration records the branch used for source links and install commands. Cached repositories no longer selected are retained but excluded from parsing. A clone/fetch failure or a dirty checkout stops the refresh before it changes the published dataset; preserve or move local edits before retrying.

## Listing requests

Authors add, correct or remove listings through the `Directory listing request` issue form (`.github/ISSUE_TEMPLATE/directory-listing.yml`). An accepted addition is a line in `inclusions.json` followed by `refresh.sh`. A removal is an entry in `exclusions.json` followed by `refresh.sh`, or by re-running `curate.py` on the last parsed snapshot.

When a request names only selected skills, also add a `skills` map to
`inclusions.json`, keyed by `owner/repo`, whose value is the accepted SKILL.md
names. Curation applies that allowlist even when another indexed source cites
the repository; new or unrequested skills remain outside the listing until
reviewed. Repositories without an allowlist keep the existing listing rules.
The repository page omits its whole-repository install command when it would
also install skills outside the accepted scope. Skill-specific install routes
are unchanged.

## Quality scores and the two README badges

`score_method: "seven-checks-v1"` adds `score` (integer 0–100) to each record.
The score is `round(100 * passed / 7)`, using the seven checks after required
frontmatter. Missing check evidence earns zero points for that check, with a
fixed denominator. The eight possible scores are 0, 14, 29, 43, 57, 71, 86 and
100. A = 90–100, B = 80–89, C = 70–79, D = 0–69. Failed frontmatter is F and
ineligible regardless of numeric score. Fetch failures are unscored (`None` in
the grader), never a measured zero; the refresh aborts before replacing the
published snapshot. Existing license, policy, language, duplication and
editorial page gates remain in force. The score measures structural evidence,
not runtime performance.

`security_scan_status: "not_scanned"` is separate from quality. HOL/Cisco CI
scans Suede's repository only; it supplies no security result for external
listings. Introducing per-skill security results requires a reviewed evidence
pipeline. The builder rejects unsupported security status claims.

Every qualifying skill offers two linked shields: numeric and letter grade.
Both links point to its full skill page, or its repository-page row when it has
no full page. `scripts/directory/badges.mjs` owns validation, URLs, snippets and
SVG generation. The supplied Suede S paths are preserved. Grade A and scores
90–100 are gold; B and 80–89 are cool metallic. Per-skill `badge.svg` and `score.svg` URLs update on each build, including
skills without a full HTML page; existing `badge.svg` URLs remain valid. Shared
score/grade previews also live under `docs/directory/badges/`. Repository-level `badge.svg` remains
the general listing badge, because a repository can contain different grades.
Do not average a repository's skills into an invented grade.

## Limited-time featured placement

This offer is separate from `featured` in `skills.json`, which controls existing
editorial full pages and their cap/stickiness rules. Nothing receives a badge
partner placement merely by scoring 80–100 or receiving an editorial page.

`promotion.json` is the admin control and verification ledger:

- `enabled` switches the offer and placements on or off.
- `ends_at` is an optional UTC timestamp such as `YYYY-MM-DDTHH:mm:ssZ`. `null`
  means Suede has not announced an end date; no expiry is invented. Set a real
  admin-approved date when available, or disable the offer. Rebuild and deploy
  after a configuration change. Placements also hide in the browser at the end.
- `verifications` starts empty. No external publisher has been verified by this
  change, and no promotional placement is active.

After a maintainer requests verification, run:

```sh
python3 scripts/directory/verify_badges.py owner/repository/skill-slug --readme README.md
npm run build:directory
```

The verifier uses the already configured `gh` CLI for read-only requests. It
fetches only that accepted repository's metadata, current default-branch commit,
and rendered README at that commit. GitHub renders Markdown and HTML embeds;
code examples, comments, hidden images, duplicate numeric badges and links to
other pages do not qualify. Both expected image URLs must link to the skill's
exact Suede listing. The ledger stores the commit, README path, timestamp,
rendered-content hash, dataset SHA-256 and matched badge URLs, without copying
the README. The dataset hash is captured before fetching verification evidence.

A failed fetch or missing badge replaces any prior verification with a non-active
status. The builder independently validates eligibility, score, target, badge
URLs, evidence fields and the admin window before rendering a placement.
Verification must match the exact saved dataset bytes. Every curation refresh
rotates `snapshot_id`, including unchanged data refreshed on the same day, so
old verification cannot activate promotion. Ordinary builds keep the snapshot
stable. Legacy records without a matching `dataset_sha256` fail closed;
re-run the verifier after refresh and after a README change. Verification is a
recorded snapshot, not continuous monitoring. Review ledger changes before
publishing. Never hand-mark an unverified publisher as verified.

Authors below 80 are invited to request help through the listing form, improve
the failed checks, and request another review.
