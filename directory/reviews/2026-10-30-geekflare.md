# Geekflare: scoped listing and editorial feature

Accepted scope: the single `geekflare` skill at `skills/geekflare`, requested by scorpiock in [issue #307](https://github.com/JasonColapietro/suede-creator-skills/issues/307). The reviewed source is [`geekflare/geekflare-skills@b2429403c4b7e4f8f2a55773b161ef19643cd12b`](https://github.com/geekflare/geekflare-skills/tree/b2429403c4b7e4f8f2a55773b161ef19643cd12b). Its default branch was verified as `main` at that revision on October 30, 2026. This review does not admit future skills, the separate npm package, or the hosted service implementation.

## Quality and existing listing policy

The unchanged Python and JavaScript `graded-v2` implementations both calculate **80/99 (B)**: 56 structure, 5 description length, 7 depth, 3 references and 9 recency points. All eight checks pass. No matching citation was found in the eight tracked-list README documents, so adoption contributes zero points. The root [MIT license](https://github.com/geekflare/geekflare-skills/blob/b2429403c4b7e4f8f2a55773b161ef19643cd12b/LICENSE) applies; the skill frontmatter omits a license field.

The submitted skill text passes the existing curator. Geekflare is separately reviewed under the existing own-service vendor exception for scraping and access-workaround rules, alongside Apify, Browserbase and Firecrawl. The social-account and personal-data rules still apply. Adding this exact repository to the reviewed vendor set changes neither the rules nor the grader. The accepted name and source-root allowlists keep the install scoped to this one skill.

The editorial feature is independent of quality scoring and README-badge verification. The existing Grade B and score-80 SVGs represent structural quality only; the numeric template convention displays `80 / 100` although the scoring rubric caps at 99. The editorial badge links to the feature. None is a security certification, and no verified README-promotion record is created.

## Setup and service disclosures

The skill uses a Geekflare account and `GEEKFLARE_API_KEY`. Queries, URLs and options are sent to Geekflare; requests use account credits and the source documents a free tier. The skill instructs agents to use public pages, avoid bypassing access controls, and limit port diagnostics to owned or authorized targets.

The hosted MCP connection puts the API key in the URL path. Keep connection URLs out of logs, screenshots and shared text. The optional local MCP setup invokes `npx -y @geekflare/mcp` without a pinned package version; that separate runtime was not installed or reviewed. No source scripts, install hooks or submitted commands were executed. No service API was called, account created, key used or credit spent.

The [official website](https://geekflare.com/) advertises CAPTCHA solving and anti-bot handling in its scraping service, which is broader than the submission's statement that it does not bypass those protections. The [REST endpoint documentation](https://docs.geekflare.com/endpoint/webscraping) defaults `stealth`, `proxyMode` and `renderJS` to `false`; `proxyMode: auto` retries blocked requests through proxies, and `proxyCountry` independently enables proxy routing. CAPTCHA fallback behavior is unspecified. These are service disclosures under the reviewed own-service policy, not evidence that the skill source is malware or a guarantee about runtime behavior. This review does not establish a runtime route that disables every hosted capability.

## Local source scan

Cisco AI Skill Scanner **2.3.1**, unchanged adapter **2**, and the strict evaluator came from Suede integration `fe5dc1757cd6c8ff63aee853564249c00151778d`. The scanner ran as UID/GID 65534 in a network-disabled container with a read-only root and source mount, all capabilities dropped, no new privileges and resource limits. The image used 93 hash-verified wheels and an offline dependency build. Hosted analyzers and behavioral alignment verification were disabled.

All five configured analyzers ran: static, bytecode, pipeline, correlation and behavioral. Coverage is complete for the exact two-file skill scope. The retained finding is **INFO `MANIFEST_MISSING_LICENSE`**; the separate root MIT license is present. There were no failed analyzers or skipped files in that scope. The unchanged evaluator reports `findings`, not a clean pass. Dependency deprecation diagnostics remain in the raw output.

The supplemental eight-file packaging scan retained every original blob's bytes, with the two skill paths relocated for scanner input as recorded in `scanner-path-mapping.json`. It is not an exact-tree scan. `.gitignore` has an `extensionless_source_coverage` gap, so the strict evaluator reports `error / incomplete_file_coverage`. That result is retained without suppression. The clean and inert exfiltration self-tests produced the expected `passed` and `failed` outcomes; no fixture code was executed. Four evaluator and seven adapter tests passed.

Manual inspection found no clear malicious instruction in the pinned public source. That observation and the static scan do not establish safety of the hosted service, npm runtime, future source or returned content. The current catalog schema still emits `security_scan_status: not_scanned`; the separately linked source evidence above is the record of this local review, and that catalog placeholder must not be interpreted as safe.

## Evidence and scoped ingestion

- [Quality and exact point components](2026-10-30-geekflare/quality.json), [raw parser output](2026-10-30-geekflare/raw-parser.json), [curated row](2026-10-30-geekflare/curated.json) and [curation log](2026-10-30-geekflare/curation.log).
- [Source inventory and hashes](2026-10-30-geekflare/content-manifest.json), [citation review](2026-10-30-geekflare/citation-review.json), [tooling versions and hashes](2026-10-30-geekflare/tooling.json), and [runtime isolation](2026-10-30-geekflare/runtime-isolation.json).
- [Raw skill scan](2026-10-30-geekflare/security-skill.json), [supplemental packaging scan](2026-10-30-geekflare/security-packaging.json), [strict evaluator and self-tests](2026-10-30-geekflare/security-summary.json), and [service evidence](2026-10-30-geekflare/service-evidence.json).
- [Scoped ingestion receipt](2026-10-30-geekflare/scoped-ingestion.json), [evidence checksums](2026-10-30-geekflare/SHA256.json) and [reproduction notes](2026-10-30-geekflare/REPRODUCE.md).

This addition preserves all 3,868 existing skill records, 161 repository records and 64 first-party names. Existing assessments keep their snapshot date; Geekflare carries its October 30 assessment date. Generated artifacts use the existing builders. Publication and publisher contact are separate actions.
