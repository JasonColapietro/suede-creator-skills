# Directory publisher tools: design review and implementation scope

Reviewed against main `50c8fea` on October 19, 2026, with Chromium at 1440 × 1000 and 390 × 844. Impeccable is absent from the installed cloud and local skills; no Impeccable command was run. This review uses fresh browser captures and interaction checks.

## Four-step review

1. **Skill report — functional, with a provenance gap.** The original page already exposes the component points and correct /100 rubric. Its score section does not identify a portable report version, and a publisher must reconstruct the context for a fresh review. The new snapshot panel carries the date and methodology, explains the 99 cap beside the /100 score, links the report download and exact-skill review form, and identifies the largest unearned components. Suggestions exclude curated-list citations and ask authors to add only useful files and accurate declarations. [Before](2026-10-19-publisher-tools/report-before.png) · [After](2026-10-19-publisher-tools/report-after.png).

2. **Category — functional, with a comparison gap.** The existing task filter, table and recommendations work. A category now links directly into the existing search with that category selected, where visitors can choose up to five skills for a named task. The shortlist is carried in the URL and exports Markdown containing score, license, publisher, snapshot and report links. [Before](2026-10-19-publisher-tools/category-before.png) · [After](2026-10-19-publisher-tools/category-after.png) · [Mobile shortlist](2026-10-19-publisher-tools/shortlist-mobile.png).

3. **Featured projects — healthy.** Appie’s three accepted skills and CoalWash’s complete-plugin setup already provide useful task and installation context. Their content and selection rules stay intact. The existing directory palette, Fraunces face, real project content, and shield artwork are retained; the new report and shortlist controls reuse those styles. No generated graphics are added. [Before](2026-10-19-publisher-tools/featured-before.png) · [After](2026-10-19-publisher-tools/featured-after.png).

4. **Submission — functional, with an update-path gap.** The original form already supports listing, badge verification, help, corrections and removals. A new recheck choice carries the affected skill and prior snapshot from its listing. The submission page explains the changed-commit/PR evidence and the manual refresh process. Following a link opens a form; it does not submit a request automatically. [Before](2026-10-19-publisher-tools/submission-before.png) · [After](2026-10-19-publisher-tools/submission-after.png).

## Report contract

Every currently listed skill receives `report.json` alongside its existing badge files, including skills represented by repository-table anchors. It contains schema version 1, a SHA-256 report version, snapshot date/ID/dataset digest, source path/branch/revision status, methodology `graded-v2`, score/check/component evidence, license, existing badge links, and `security_scan_status: not_scanned`.

The current dataset does not retain source commit IDs. Those reports explicitly use `revision: null` and `not_recorded_in_snapshot`; no current upstream commit is substituted for historical evidence. The curator now keeps the parser’s recorded commit ID on future refreshes, and reports link to that pinned source when available. This change does not refresh the dataset.

Downloads preserve the report contents and version. Hosted report and badge URLs follow the latest directory build; no historical hosting or immutable badge archive is claimed. The 100-point rubric, published cap of 99, score algorithm, shield eligibility, README verification, accepted scopes, exclusions and editorial selection are unchanged.

## Verification and limits

`npm run test:directory` checks existing badge/discovery/editorial rules plus every portable report and the contextual review links. The added refresh test proves recorded revisions survive curation while legacy revisions remain absent. Both new report tests and the new revision test fail against unmodified main.

`npm run test:directory:browser` exercises shortlist add/remove/limit, URL restore and invalid-selection filtering, task Markdown escaping, downloaded JSON, exact review scope, keyboard search, no-JavaScript routes, failed-fetch recovery, four text-palette contrast checks, and horizontal overflow at both viewport sizes. It saves current screenshots; the PR workflow runs this check in its own job and retains screenshots for 14 days.

Screenshots do not establish full accessibility compliance. The browser run checks the named keyboard and contrast behaviors; it does not make a screen-reader conformance claim. No upstream skill is executed or security-scanned. No issue is submitted, merge performed, deployment made, or external outreach sent by this work.
