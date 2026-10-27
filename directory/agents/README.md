# Agent evidence intake

This catalog is independent of `skills.json` and `graded-v2`. Admit runnable named editions, not frameworks or broad brand claims. Source availability and deployment are separate fields; a hosted edition with public source can have both applicable evidence ratings. A pinned source revision never proves deployed-service or package equivalence.

For each add/recheck/correct/remove request:

1. Confirm the official product, publisher, edition and access URL. Record license terms for public source and service terms for hosted editions. Do not run agents, obtain credentials, spend API credit or contact maintainers as part of intake.
2. Inspect public files at an exact upstream commit. Verify the Git blob SHA from the retrieved UTF-8 bytes and retain its SHA-256, URL and locator in an edition-specific receipt. Hosted pages use dated, concise paraphrased observations. Their content digest and revision stay null because the receipt does not preserve the full changing page or identify the deployed service.
3. Evaluate each applicable rubric check. `supported` earns one point and `absent` earns zero only after inspecting the stated scope. `unknown` means not reviewed or inconclusive: the entire rating stays null with coverage shown. Never replace missing evidence with a zero. Reasons and receipt IDs are required. Complete /10 ratings measure evidence coverage, not quality of execution or policy strength.
4. Run `node --test tests/test_agents_model.mjs tests/test_agents_site.mjs`, then the normal build/test pipeline. The generator reads local receipts only; it never fetches an agent URL or runs source code. Keep skill scores, security findings and existing review holds intact.
5. Review the generated HTML and `report.json` before a signed change is accepted. Rehash changed receipts using `recordDigest` from `agents-model.mjs`. Recompute scores through validation rather than editing scores manually. Each snapshot gets a new identifier. Git history retains previous accepted snapshots.

Refresh manually when requested or when evidence is over 30 days old. Date the actual review, never merely the build. A failed fetch does not erase the last accepted observation, fabricate a new review date, or discard findings. Record failure in the review request; the published dated snapshot becomes stale. To remove an edition, remove its catalog record and unreferenced receipts in the same reviewed change.

Performance remains `not_tested`; security remains `not_assessed`. An empty findings list means no findings recorded by this intake, not a clean bill of health. Future runtime or security assessment requires a separate, approved method with reproducible conditions. Publisher warnings and any known findings must remain visible regardless of documentation score.

The initial October 27 intake is intentionally partial. It does not infer missing CLI-specific dependencies or release history from adjacent monorepo packages, nor infer service behavior from marketing claims.

## Ungraded discovery

`ungraded.json` is an independent product catalog for discovery at `/agents/ungraded/`.
It has no evidence checklists, grades, performance results, safety certifications or
verification badges. `ungraded.schema.json` describes its structural contract;
`agents-ungraded.mjs` also checks public links, dates and cross-catalog duplicates.

Each entry has `id`, `name`, a factual `summary`, task slugs, a `deployments` array,
`sourceAvailability`, an `officialUrl`, nullable `repositoryUrl`, `sourceUrls` and
`observedAt`. `public-source` only means a public repository was identified. It
makes no open-source-license claim. Local application access does not imply local
model inference. A source-check date is not an assessment or endorsement.

Admission requires a runnable agent product or named usable agent feature. Do not
list a framework, model, MCP server, skill pack, duplicate edition, retired alias
or benchmark-only implementation as another product. Read the official sources,
retain their URLs and check date, and keep summaries within what those sources
support. Never run an agent during listing intake. Promotion into assessed
profiles must remove the duplicate ungraded entry in the same change.

The 2026-10-27 discovery intake contains 82 entries from 42 hosted-product and 41
public-repository research records. UI-TARS Desktop and Agent TARS are grouped as
one repository family. Factory Droid includes local/cloud access and Qodo Git
includes self-hosted/cloud access after checking their official product pages.
The catalog links 119 official source URLs across 16 task categories. No listing
was added solely to reach a count. Live source pages can change; these discovery
records are not pinned source inspections or runtime reports.
