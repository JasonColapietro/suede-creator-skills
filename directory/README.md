# Agent Skills Directory data

<a href="https://trendshift.io/repositories/82031?utm_source=trendshift-badge&amp;utm_medium=badge&amp;utm_campaign=badge-trendshift-82031" target="_blank" rel="noopener noreferrer"><img src="https://trendshift.io/api/badge/trendshift/repositories/82031/daily?language=Python" alt="JasonColapietro%2Fsuede-creator-skills | Trendshift" width="250" height="55"/></a>

Source data for [skills.suedeai.ai/directory/](https://skills.suedeai.ai/directory/), a curated index of published Agent Skills from independent publishers and the accepted Suede AI Skills distribution. Every page under `docs/directory/` is generated from the files here by `scripts/build-directory.mjs`; never edit that HTML by hand.

The [Suede Awesome Everything catalog](../awesome/README.md) is the GitHub Markdown view of the same accepted snapshot, with AI agent skills scored on the 0–99 quality scale. `scripts/build-awesome-directory.mjs` generates its category pages, publisher credits and featured-project guidance. See [its contribution guide](../awesome/CONTRIBUTING.md) for regeneration and freshness checks.

| File | What it holds | Who writes it |
| --- | --- | --- |
| `skills.json` | One record per listed skill: source repository, SKILL.md metadata, Suede Skill Check results, license, category, and whether it gets its own page | `scripts/directory/curate.py` |
| `labels.json` | The editorial layer: a category for every skill and a one-sentence summary, in the directory's own words, for skills with a page | Reviewed by hand or by an agent, keyed by skill id |
| `featured-projects.json` | Editorial project selections, accepted scopes, pinned intake reviews and project-specific setup for `/directory/featured/`; independent of catalog scores and README-badge verification | Reviewed by hand or by an agent |
| `categories.json` | The sixteen category directories: slug, title and intro copy | Hand-written |
| `task-pages.json` | The keyword map behind the task pages (`/for/<job>/`, "What are the best Claude Code skills for <job>?") and the "<skill> alternatives" pages. A job gets a page only when at least 5 listed skills match and at least 3 of them have full pages scoring 80 or more; Suede AI's own skills are never ranked (`scripts/directory/task-pages.mjs`) | Hand-written |
| `topics.json` | The taxonomy behind the topic pages (`/topics/<id>/`): groups, topics with keyword patterns, and the Futurepedia labels each one stands in for, which the parity audit reads. A topic gets a page when at least 3 listed skills match it (`scripts/directory/topics.mjs`) | Hand-written |
| `applications.json` | Sanitized public GitHub applications: source issue, requested repository/scope, submission date and issue state; public applicant handles, no private contacts | `npm run sync:applications` |
| `application-decisions.json` | Explicit links from an application issue to its reviewed feature/member entry or standalone review; independent of GitHub issue state | Reviewed by hand or by an agent |
| `inclusions.json` | Repositories (`owner/repo`) added from accepted listing requests, with optional per-repository skill-name allowlists; read on the next refresh even when no curated list cites them | Hand-written |
| `notes.json` | Publisher install routes for restricted-license skills, and required service setup for other skills, shown in the installation section with a link to the source | Hand-written |
| `exclusions.json` | Repositories (`owner/repo`) and skills (`owner/repo/skill-name`) kept out of the directory, each with a recorded reason: author removal requests, and skills whose text trips the pack's public-source guards (`npm run validate` names the file) | Hand-written |
| `listed-since.json` | Ledger of the snapshot date that first listed each skill, keyed by skill id. It feeds the "Listed since" row on skill pages and the `/new/` page | `scripts/build-directory.mjs`, which adds new skills at the snapshot date and drops skills that left the dataset |
| `installs.json` | Snapshot of install counts from skills.sh, keyed by `owner/repo/skill`: the all-time count and, where skills.sh publishes one, the weekly series, with the fetch date and source URL. It feeds the most-installed and rising boards, the Installs row on skill pages, the `installs` sort in search and the Top 100 install chart. Every surface that shows a count names skills.sh and the date | `scripts/directory/installs.mjs` |
| `kinds.json` | The non-skill kinds (`/plugins/`, `/grok/`, `/mcp-servers/`, `/rules/`): docs links, install commands, sections of entries with verified repositories, and an FAQ. Entries are listed, not graded | Hand-written |
| `editorial/stacks.json`, `editorial/stacks/*.md` | Jason's recommended stacks at `/stacks/`: one article per task. Each entry names the Suede AI skill that covers the task above the article; the article body recommends third-party skills only, and the build refuses a body that names Suede | Hand-written |

[DESIGN.md](DESIGN.md) describes the directory's own design system (palette, type, the generated focal graphics) and the font licenses.

Cost lanes (`/pricing/`) and capability flags (`/features/`) have no data file. `scripts/directory/facets.mjs` derives both from published fields in `skills.json`, so a reader can recompute them.

## Featured publication order

`/featured/` always renders newest first within its editorial-project and
Directory Member sections. Each entry's optional `published_at` is its first
publication on this page, in UTC (`YYYY-MM-DDTHH:mm:ssZ`). Preserve it when
editing an existing feature. Record a known publication timestamp for new
entries; leave it absent when unknown. Missing or invalid dates sort last,
with stable entry IDs breaking ties. No browser preference changes this order.

The initial dates below use the committer timestamps of the first commits on
`main` containing each entry in both the editorial metadata and generated
Featured page. They record repository publication, not an exact deployment time.
Builds do not consult Git or infer dates from reviews, upstream activity, file
mtimes, dataset refreshes or the metadata's shared `updated` field.

| Entry | First published (UTC) | Publication commit |
| --- | --- | --- |
| appie | `2026-10-18T04:48:30Z` | [`50c8fea`](https://github.com/JasonColapietro/suede-creator-skills/commit/50c8feaae917cfc2d6059e165eae05585acba159) |
| coalwash | `2026-10-18T04:48:30Z` | [`50c8fea`](https://github.com/JasonColapietro/suede-creator-skills/commit/50c8feaae917cfc2d6059e165eae05585acba159) |
| costory | `2026-10-19T20:40:16Z` | [`85d13cd`](https://github.com/JasonColapietro/suede-creator-skills/commit/85d13cd0ad11b8c479dcae8244479f66eaf62ca7) |
| extra-caffeine | `2026-10-23T18:49:23Z` | [`a05681c`](https://github.com/JasonColapietro/suede-creator-skills/commit/a05681c37bdf1194886138e183bc942ed79967fc) |
| opsibyte | `2026-10-24T04:35:14Z` | [`e36587d`](https://github.com/JasonColapietro/suede-creator-skills/commit/e36587d37b8d721b43ed17ded52f5a68f1d36bc2) |
| cisco-skill-scanner | `2026-10-25T21:52:58Z` | [`5f27789`](https://github.com/JasonColapietro/suede-creator-skills/commit/5f2778980c8ffeec7a0d1c40e2ea63109f313351) |
| geekflare | `2026-10-31T00:34:27Z` | [`145ef80`](https://github.com/JasonColapietro/suede-creator-skills/commit/145ef80eb5e2e776e6bc419dc6c4061bf85d38cf) |
| arcmira | `2026-10-27T23:06:04Z` | [`648e3eb`](https://github.com/JasonColapietro/suede-creator-skills/commit/648e3eb687838dc31d8ccd3185d781a22ac93b7f) |
| lava | `2026-10-28T19:55:57Z` | [`62fc1c1`](https://github.com/JasonColapietro/suede-creator-skills/commit/62fc1c178a8c750bbf627821e9587b8cd017476c) |

Entries added after this table record their feature date. The eight entries
featured on November 2, 2026 carry `2026-11-02T00:00:00Z` and order among
themselves by entry ID.

## Featured with scan and review pending

A project entry without `status` is a reviewed feature: it needs `repo`,
`commit`, `license` and a `review` record under `directory/reviews/`, and the
page prints its featured README badge snippet. An entry with
`"status": "pending"` is featured while its scan and review are pending. It
carries `capabilities` and either `repo` with a full `commit`, or an `https`
`site` for a hosted product with no public repository; `license` is optional.
It must not carry `review`, `skills`, `score`, `grade`, `verdict` or a badge.
The page and `awesome/featured.md` show the label "Scan & review pending"
where the review link and badge snippet would be, and no featured badge
snippet is generated for it. `scripts/directory/featured.mjs`
(`featuredProjects`) rejects any other status or field mix. When the review
lands, add the record, remove `status` and keep `published_at`.

## Getting the directory listed

[DISTRIBUTION.md](DISTRIBUTION.md) is the ledger of roundups, awesome lists, launch sites and press where the directory is or is not listed, with the route for each. [PUBLICITY.md](PUBLICITY.md) holds the ready-to-send copy for those submissions. Nothing in either file is sent without owner approval.

## Standalone site: suedeai.directory

`scripts/build-directory-site.mjs` turns the pages in `docs/directory/` into a
standalone site for https://suedeai.directory at `dist/suedeai-directory/`
(gitignored). Pages move from `skills.suedeai.ai/directory/<path>` to
`suedeai.directory/<path>`: canonical tags, JSON-LD, badges and the search index
point at the new host, links back to the Suede Creator Skills pack stay on
skills.suedeai.ai, and `docs/assets/` ships alongside. It also writes the site's
own robots.txt, sitemap.xml, llms.txt and 404 page. Nothing under `docs/` changes.

Both sites deploy from this repo on Vercel, one project each, through
`scripts/build-vercel.mjs` (`vercel.json`). Each project sets `SUEDE_SITE`:
`directory` builds suedeai.directory; `skills` builds skills.suedeai.ai from
`docs/` without `docs/directory/`, with links into the directory pointed at the
new host. On either host, `/directory/...` 301s to the same path on
suedeai.directory, so old listing links and README badges keep working.

```
npm run build:directory-site
```

## Commands

```
npm run build:directory          # rebuild docs/directory/ and the sitemap from the data here
node scripts/build-directory.mjs --check   # part of npm run validate
scripts/directory/refresh.sh     # re-read the source repositories, then rebuild
node scripts/directory/installs.mjs   # refresh installs.json from skills.sh (public endpoints, no key)
```

`refresh.sh` clones the curated lists and the repositories they cite, reads every SKILL.md, applies the [published method](https://skills.suedeai.ai/directory/methodology/) and rewrites `skills.json`. It reads files only and never executes anything from a clone. Skills that are new since the last refresh get a keyword category and no page of their own until `labels.json` gives them a category and a summary.

Pass an optional work directory to reuse downloads: `scripts/directory/refresh.sh /tmp/suede-directory`. Every run fetches the current default branch of both the curated lists and selected repositories before parsing. Reused repositories become detached snapshots; `suede.directoryDefaultBranch` in their local Git configuration records the branch used for source links and install commands. Cached repositories no longer selected are retained but excluded from parsing. A clone/fetch failure or a dirty checkout stops the refresh before it changes the published dataset; preserve or move local edits before retrying.

## Browse pages

The build writes these pages beside the category directories:

- `/topics/`: the groups and topics in `topics.json`. A topic gets its own page at `/topics/<id>/` when at least 3 listed skills match its patterns. A topic below that stays on the hub with its count and a listing request link.
- `/pricing/<lane>/`: one cost lane per skill, from its license and whether its files name a paid or account-based service: free and open source, free skill that needs a service, non-commercial license, restricted license.
- `/features/<flag>/`: capability flags such as official publisher, bundles scripts, uses an MCP server and no setup required. A skill can carry any number. Flags read from the install record cover skills with full pages only, and those pages say so.
- `/new/`: skills first listed within the last 30 days, from `listed-since.json`, and skills whose repository was updated in that window.
- `/top/`: two Top 100 lists in tabs. Most installed ranks listed skills by the skills.sh snapshot in `installs.json`, with an install chart of the top twenty; highest scores ranks the 100 highest-scoring listed skills. A rising pane shows the largest weekly gains where skills.sh publishes a series. Rankings exclude Suede AI's own skills, as the task pages do.
- `/trust/`: what the directory checks before listing a skill, what it does not (no malware scan, no runtime test), a matrix of every full-page skill by what its files touch, three documented registry attacks with sources, the scanners a reader can run, and a review checklist. No listing carries a security claim; the glance panel on every skill page says `Not scanned by the directory`.
- `/stacks/` and `/stacks/<id>/`: the recommended-stack articles from `editorial/stacks.json`.
- `/plugins/`, `/grok/`, `/mcp-servers/`, `/rules/`: the kinds in `kinds.json`.
- `/compare/`: up to three skills side by side (score, grade, checks, license, cost, installs, what the files touch), built in the browser from `search-index.json` and each skill's `report.json`; the chosen skills round-trip through `?a=&b=&c=`.
- `/publishers/`: every listed repository with its skill count, best score and install total.
- `/api/`: every file the directory publishes (`search-index.json`, `installs.json`, `kinds.json`, per-skill `report.json`, badges, feeds) with its shape and refresh cadence.
- `/saved/`: the reader's save list. It lives in the browser's local storage, needs no account, and never leaves the browser.
- `/feed.xml`: an RSS feed of new listings for readers who follow the directory.

When editing `topics.json`, run `node scripts/directory/topics-count.mjs`. It prints every topic's match count and whether it publishes. Give it a topic id to list that topic's matches with the reason each one matched, or `--unmatched` to list the skills no published topic claims.

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

Reviewed canonical distributions can also declare `skill_roots` in
`inclusions.json`, keyed by repository, with a list of exact relative folders.
Only those folders are parsed for that repository. This admits publisher
distributions such as OpenAI's `skills/.curated` and an approved `.claude/skills`
folder without admitting system skills, CLI mirrors or arbitrary hidden folders.
Missing roots or roots outside the checkout stop parsing. Fixture, internal and
template paths below a reviewed root still fail the listing rules. A named
allowlist or reviewed-root scope always omits whole-repository install commands.

## Quality scores and the two README badges

Accepted listing requests can record supplementary independent curated-list
citations in `inclusions.json` under `citations`, keyed by target repository.
Each receipt records the source repository, full commit, document path, exact
GitHub target and `verified_at` date. The direct link is verified against the
source's current default branch on every refresh; missing links or unavailable
sources stop publication. Curation requires receipts from the snapshot date,
deduplicates source repositories and publishes the evidence with the listing.
These citations share the existing rubric but do not expand the discovery pool.

`score_method: "graded-v2"` adds `score` (integer 0–99) to each record. The
score is computed only from published fields (the record, its repository's
`commit_date` and `lists` in `repos`, and the snapshot's `generated` date), so
`scripts/directory/grade.py` (`quality_score`) and
`scripts/directory/badges.mjs` (`qualityScore`) recompute the same value from
`skills.json`. All arithmetic is integer, with no rounding:

| Component | Points |
| --- | --- |
| Each of the seven graded checks after required frontmatter | 8 each, 56 total |
| Description length in code points | 5 for 150–600; 3 for 100–900; 1 for 50–1024; else 0 |
| Description states a boundary (`not for`, `do not use`, `use … instead`) | 4 |
| Description quotes an example phrase (3–60 characters in quotation marks) | 3 |
| Body depth by word count | 7 for 500–3,000; 4 for 250–4,500; 1 for 100 or more; else 0 |
| Bundles reference files | 3 |
| Bundles scripts | 2 |
| Recency: days from the repository's last commit to the snapshot date | 9 within 30; 6 within 90; 3 within 180; 1 within 365; else 0 |
| Adoption: number of curated lists citing the repository | 7 for four or more; 4 for three; 3 for two; 1 for one; else 0 |
| Declares `allowed-tools` | 2 |
| Declares `compatibility` | 2 |

The raw maximum is 100. The published score is `min(raw, 99)`: 100 is reserved,
because structural evidence cannot show that a skill is perfect. Missing check
evidence earns zero points for that check. A = 90–99, B = 80–89, C = 70–79,
D = 0–69. Failed frontmatter is F and ineligible regardless of numeric score.
Fetch failures are unscored (`None` in the grader), never a measured zero; the
refresh aborts before replacing the published snapshot. The score measures
structural evidence, not runtime performance. The replaced `seven-checks-v1`
method (`round(100 * passed / 7)`) could produce only eight values, and most
listed skills tied at 100; the graded components spread scores across the
range. At the current snapshot no listed skill scores above 95 and the median
is 80.

Listing eligibility does not depend on the numeric score. A skill is listed
when it passes required frontmatter and at least six of the seven graded
checks, passes the license check, and meets the existing license, policy,
language, duplication and editorial rules. That is the same set the previous
method listed at scores of 80 and above, so the method change delisted no
skill. Editorial full-page candidates still require all seven graded checks to
pass, independent of the score.

To re-apply the current method to the existing snapshot without re-fetching any
repository, run:

```
python3 scripts/directory/rescore.py
npm run build:directory
```

`rescore.py` recomputes `score` and `grade` from the saved records, sets
`score_method`, and rotates `snapshot_id`, so badge verification recorded
against the earlier bytes must be re-run.

`security_scan_status: "not_scanned"` is separate from quality. HOL/Cisco CI
scans Suede's repository only; it supplies no security result for external
listings. Introducing per-skill security results requires a reviewed evidence
pipeline. The builder rejects unsupported security status claims.

Every listed skill scoring 80–99 offers two linked quality shields: numeric and
letter grade. Both links point to its full skill page, or its repository-page
row when it has no full page. Authors may display either badge or both; one
valid linked badge is enough to request promotion verification.
`scripts/directory/badges.mjs` owns validation, URLs, snippets and SVG
generation. The supplied Suede S paths are preserved. Grade A and scores 90–99
are gold; B and 80–89 are cool metallic. Per-skill `badge.svg` and `score.svg`
URLs update on each build, including skills without a full HTML page, and stay
valid for every listed skill: a listed skill scoring below 80 receives the
general listing badge at those paths, and its page offers the route to improve
the score and request another review in place of badge snippets. Shared
score/grade previews also live under `docs/directory/badges/`.
Repository-level `badge.svg` remains the general listing badge, because a
repository can contain different grades. Do not average a repository's skills
into an invented grade.

## Limited-time featured placement

This offer is separate from `featured` in `skills.json`, which controls existing
editorial full pages and their cap/stickiness rules. Nothing receives a badge
partner placement merely by scoring 80–99 or receiving an editorial page.

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
code examples, comments, hidden images and links to other pages do not qualify.
At least one expected image URL (numeric or letter) must link to the skill's
exact Suede listing; displaying both also qualifies. The ledger stores the commit, README path, timestamp,
rendered-content hash, dataset SHA-256 and matched badge URLs, without copying
the README. The dataset hash is captured before fetching verification evidence.

A failed fetch or no valid badge replaces any prior verification with a non-active
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

## Scoped Suede AI Skills source intake

The accepted first-party distribution is
`JasonColapietro/suede-creator-skills`, rooted at `skills/` with an explicit
allowlist in `inclusions.json`. Retired pages, vendorable examples,
internal material and private repositories are outside that scope. The
Suede-AI fork is an older mirror; canonical source revisions come from the
JasonColapietro repository. Third-party adaptations keep their existing
copyright and license attribution in `NOTICE.md` and their traveling licenses.

For a source-improvement draft, use a separate **clean committed checkout** of
the proposed source revision. The command below reads source files without
executing them and invokes the existing parser, curator and graded-v2 rubric.
Parsing uses an archive of the committed tree; ignored local references,
scripts or assets cannot affect scores or installation facts.
Replace the revision and branch with the actual reviewed draft commit/ref:

```sh
python3 -I scripts/directory/first_party.py \
  --source /tmp/suede-reviewed-source \
  --revision FULL_COMMITTED_SOURCE_SHA \
  --source-branch improve/first-party-quality \
  --citations /tmp/suede-review/citation-readmes.json \
  --assessment-date YYYY-MM-DD \
  --receipt directory/intake/first-party-review.json
npm run build:directory
```

Citation input is a JSON array covering each indexed curated list once. Each
entry contains `repo`, the pinned `commit`, `path: "README.md"`, its Git `blob`
SHA and fetched UTF-8 `content`. Fetch those documents independently at the
pinned commits before intake; the script makes no network calls. It verifies
Git blob integrity and runs the normal link extractor on those documents.
Local blob validation does not prove upstream commit membership or perform a
new upstream fetch: receipts label these as caller-supplied pinned documents.
Retain the independent fetch provenance alongside the review.
Only actual indexed-list citations earn adoption points. Full third-party
README copies remain local intake inputs; the public receipt retains revisions,
document hashes and target links rather than copying their text.

A scoped review preserves the global external snapshot date and every external
skill record and repository metadata value. Its dated receipt identifies the
new first-party assessment, exact proposed source revision, complete tracked
skill-file and root-file inventory hashes, parser/curator/rubric hashes, citation evidence,
and matching before/after external-data digests. Source branch refs may change;
the recorded source SHA binds the draft review. The receipt explicitly marks
the revision as proposed, not deployed or merged. A new dataset snapshot ID
invalidates earlier badge-promotion verifications as usual.

The script rejects unavailable, dirty or mismatched source checkouts, an
unexpected origin, missing allowlist members, source symlinks, malformed
citation evidence and source changes during intake. Existing policy, license,
privacy and score checks still apply. Intake stops if an accepted package is
rejected; fix its source or report the rejection rather than changing scores,
exclusions or the rubric. Security status remains `not_scanned`: scoped quality
intake supplies no security-pass claim. Retain separate security evidence bound
to its own exact source revision.

Run the local intake regressions with:

```sh
python3 -m unittest discover -s tests -p test_first_party_directory.py -v
```

## Public direct-submission register

[Project applications](https://suedeai.directory/applications/) records public
maintainer-submitted listing requests and requests made on their behalf. It
covers public GitHub applications, including AI-assisted requests. It does not
publish private email or message submissions, contact details, private profile details, or issue bodies. A project discovered by curation is not an applicant.

Run `npm run sync:applications` before rebuilding to read every page of the
canonical public repository's issue tracker. The existing weekly refresh also
runs this command on its normal proposal branch. The importer accepts only
explicit listing requests with the maintainer confirmation (plus documented
historical forms), preserves selected skill names, and never runs submitted code.
Unknown scope stays unknown, never `all`. A malformed project URL remains a source-linked application awaiting clarification, so it cannot stop unrelated refresh work. A disappearing application stops the
sync for review rather than silently erasing history. After confirming a removal
or privacy request, remove the affected record and decision before resyncing.

Add an issue-number key in `application-decisions.json` after reviewing the
requested scope: `feature_id` links the exact accepted feature/member entry;
`review` can link a standalone review even without any placement. Copy the current application `scope_version` into each reviewed decision. A change to the project or requested scope invalidates the old association until reviewed again. A later request
for a different scope needs its own association. The page reads review status
from that association, placement from current editorial metadata, and scored
listing counts from exact names in the current catalog. A pending feature stays
review-pending, and open/closed issue state never determines a verdict. Repeat
issues remain traceable source records, not duplicate catalog listings.

After updating applications or decisions, run `npm run build:directory` and
`npm test`. The generated page is indexable, self-canonical and discoverable from
Submit, Featured and the directory sitemap.
