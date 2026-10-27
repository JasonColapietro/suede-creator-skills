# Arcmira six-skill pinned review

Report version 1.0 · 2026-10-27 UTC · review only.

**Outcome:** All six files satisfy the unchanged directory parser/curator’s minimum structural rule. Their quality scores range from 67 to 77 and agree in Python and JavaScript. The local Cisco scan completed for all six, retaining one informational missing-frontmatter-license finding per skill. The unchanged security evaluator returns **findings require review**, not a clean pass. Manual review found authorization/privacy, paid-read, and example-correctness issues. No admission, certification, score edit, public PR, deployment, contact, or other external write occurred.

## Scope and provenance

- Submission: [suede-creator-skills issue #291](https://github.com/JasonColapietro/suede-creator-skills/issues/291).
- Upstream pin: `arcmira/mcp@557fc76b697a2eaf1fee3bbfae90f25181ae2e93`; source commit timestamp `2026-10-22T18:17:18-07:00`.
- Only `plugins/arcmira/skills/{arcmira,company-watch,compare-shows,find-quotes,person-research,sponsor-research}/SKILL.md` were scanned. Git tree enumeration confirms each folder contains that one regular file and no scripts, links, submodules, or hidden helpers.
- License scope: `plugins/arcmira/LICENSE`, Apache-2.0, Git blob `1f25d649de0c60c6002b5c39c812a000f6a44e38`. The separate root `LICENSE` is proprietary; this report does not extend plugin eligibility to the repository or service.
- README, root license, `.claude-plugin/plugin.json` (plugin 0.10.7), and `.mcp.json` were read only as context. The configured dependency is remote `https://mcp.arcmira.com/mcp`; README lines 60–76 describe OAuth or an account API key. No Arcmira service, API, CLI, setup prompt, generated program, submitted script, or live account was invoked.
- Trusted directory tooling: `JasonColapietro/suede-creator-skills@310520c242df79615b6837b59c85a11a392f6ff3`. Original `AGENTS.md` was read. No extra local `.agents/skills` instructions were present. Original checkout remains clean.
- Parser uses a local review-copy inclusions file with six exact roots and a six-name allowlist; curator writes only `results/LOCAL-review-catalog.json`. No adoption citations were supplied or invented. Date fixed at `2026-10-27`. Original exclusion/privacy/policy/scoring logic is unchanged.

## Per-skill outcomes

| Skill | graded-v2 score / 100 | Grade | Checks | Local security | Manual findings |
|---|---:|:---:|:---:|---|---|
| arcmira | 77 | C | 8/8 | 1 INFO; findings require review | M01, M02, M03 |
| company-watch | 69 | D | 7/8 | 1 INFO; findings require review | M01, M03, M09, M10 |
| compare-shows | 67 | D | 7/8 | 1 INFO; findings require review | M01, M03, M06, M07, M10 |
| find-quotes | 69 | D | 7/8 | 1 INFO; findings require review | M01, M02, M03, M08, M10 |
| person-research | 69 | D | 7/8 | 1 INFO; findings require review | M01, M02, M03, M10 |
| sponsor-research | 67 | D | 7/8 | 1 INFO; findings require review | M01, M03, M04, M05, M10 |

The graded-v2 scale is capped at 99. `arcmira` passes all eight checks. The other five fail only `description_trigger` because their frontmatter descriptions lack a phrase matched by the unchanged `WHEN_RE`; use-case sections in the body do not satisfy this check. Frontmatter plus six of the seven graded checks meets the curator’s minimum structural rule. This local rule result is not admission or security approval. A score of 80 or more would not be security approval either.

Point components are retained in `results/javascript-scores.json`; Python values are in `results/python-scores.json`. The main skill earns structure 56, description length 5, depth 7, recency 9. Task skills earn structure 48, depth 7, recency 9, and description length 5 (company-watch, find-quotes, person-research) or 3 (compare, sponsor). Boundary examples, reference/script folders, verified adoption, allowed tools and compatibility earn zero because the corresponding evidence is absent. No score or source content was edited.

**Parser dependency caveat:** all six raw records show `network=false`, empty `api_hosts`/`env_docs`, and only the main skill has `mcp=true`. These are static heuristics over local code and recognized text patterns. Five task files plainly depend on `arcmira_execute_read` even though that spelling does not match the parser’s MCP pattern. These fields do not establish that the skills work offline or without credentials. Smallest source improvement: truthful compatibility/tool metadata; the parser rules were not weakened.

## Local scanner evidence

- Cisco AI Skill Scanner **2.3.1**, unchanged trusted adapter version **2**, strict preset **1.0**, CEL shadow. Release source reference in the existing review: `c615acb70994cdf3f4ba54d955fef2e92ac84437`.
- Adapter/lock/evaluator pinned to Suede commit `fe5dc1757cd6c8ff63aee853564249c00151778d`, as referenced by the existing `directory/reviews/2026-10-25-cisco-skill-scanner.md`. Lock SHA256 `f7e58c92968673145d6f6f36f3d685c28e836851f5766dd349c3ff8a5b655769`; all **93** exact wheels passed hash-required download and offline installation. Includes `litellm==1.89.7` and `certifi==2026.10.19`; reported hijacked LiteLLM 1.107.0 was not installed.
- Base image `python:3.12-slim-bookworm@sha256:57d96f71de145a98e7ceca18ee4ade77bba4103a33a72dfaea026b23625c6bf0`; actual scan image `sha256:c8fb00f2d5861ba88295397e9324f7a8b84eaee01d9efac46d023b887a76bf70`.
- Five analyzers executed: `static_analyzer`, `bytecode`, `pipeline`, `correlation`, `behavioral_analyzer`. No analyzer failures, skipped files, incomplete coverage, or suppressed findings. Coverage was one exact `SKILL.md` per target; every recorded SHA256 was matched back to the pinned content manifest after scanning. Markdown-only coverage does not prove remote-service behavior or JavaScript runtime correctness.
- Containers used `--network=none`, read-only root and source, UID/GID 65534, zero capabilities, no-new-privileges, resource limits, and a bounded writable report mount. The worker verifies isolation before opening targets. No hosted/paid analyzers, alignment verification, credentials, repository policy exceptions, or remote certifications were used.
- Separate inert controls: clean control passed with zero findings; attack control failed with **2 CRITICAL, 1 HIGH, 2 MEDIUM, 1 INFO**. The attack fixture was never executed. Built-in scanner deduplication is preserved in its raw records, not overridden.
- Each skill retained `MANIFEST_MISSING_LICENSE` at INFO severity. The scanner gives `file_path=SKILL.md` and `line_number=null`; manual location is frontmatter lines **1–4**. This concerns absent frontmatter metadata, not absence of a plugin license. Smallest fix: add `license: Apache-2.0` to each frontmatter block, preserving the existing plugin license. The finding was not suppressed or reclassified.
- Dependency `PyparsingDeprecationWarning` diagnostics are retained. The already-reviewed adapter marks these deprecations nonblocking; this review did not change that rule. Other warning/error categories remain blocking.

Raw records: `results/security/batch-1/{0,1,2}.json` = arcmira/company-watch/compare-shows; `batch-2/{0,1,2}.json` = find-quotes/person-research/sponsor-research. `results/security-summary.json` is the unchanged evaluator’s derived status. Raw control records and runtime commands/image IDs are in the same tree.

**HOL provenance correction:** the directory workflow comments say plugin-scanner 3.0.30 and its separate constraint file pins Cisco 2.0.13. Independently fetched Git objects for the actual action commit `7711de3234c244b562519720ef749f4b432b69be` (v1.2.795) instead contain `scanner-version.txt=3.51.0`, wheel SHA256 `3468d19afcb95dc384e033665c71d19808b8aed7f32b4b2e2a07820f365ab1a5`, `cisco-version.txt=2.0.12`, and an opt-in `install_cisco` default of false. This mismatch was verified with both the connector and Git, and preserved in `evidence/hol-git-*` plus connector responses. No HOL action/scanner or CI submission was run. Legacy directory-repository HOL/Cisco CI says nothing about whether these six external files were scanned. A future HOL-equivalence run needs the intended bundle/dependency profile reconciled first; this review does not silently substitute one.

## Manual findings and smallest proposed fixes

These observations are separate from scanner output and do not alter numerical scores. MEDIUM denotes a concrete behavior/correctness gap or a stated hardening opportunity; M03 is explicitly defense in depth with no demonstrated exploit. None is evidence of malicious authorship. All fixes are proposals only.

### M01 · MEDIUM · authorization/privacy

Locations: [arcmira/SKILL.md:76](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/arcmira/SKILL.md#L76), [company-watch/SKILL.md:149](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/company-watch/SKILL.md#L149), [compare-shows/SKILL.md:84](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/compare-shows/SKILL.md#L84), [find-quotes/SKILL.md:84](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/find-quotes/SKILL.md#L84), [person-research/SKILL.md:94](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/person-research/SKILL.md#L94), [sponsor-research/SKILL.md:106](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/sponsor-research/SKILL.md#L106), [README.md:112-116](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/README.md#L112).

Every skill instructs the agent to send arcmira_feedback when something is wrong, slow, or missing. This creates a vendor-side record containing a note; the skills do not require user authorization or minimization/redaction before sending. This is an external-write/privacy gap, not evidence that data was actually sent.

Smallest fix: Make feedback opt-in under the user's existing authorization. Show the minimal proposed note when authorization is absent; exclude credentials, private requests, transcript text, and personal details unless explicitly needed and authorized. No feedback was sent during review.

### M02 · MEDIUM · cost/side effects

Locations: [arcmira/SKILL.md:45-46](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/arcmira/SKILL.md#L45), [find-quotes/SKILL.md:50-56](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/find-quotes/SKILL.md#L50), [find-quotes/SKILL.md:74-75](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/find-quotes/SKILL.md#L74), [person-research/SKILL.md:55-59](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/person-research/SKILL.md#L55), [README.md:116-127](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/README.md#L116).

The main skill directs a Premium transcript read that can create a billable job. Pricing is disclosed and quote() is named, but no preflight/authorized-spend condition precedes that step. Other examples also read metered captions. The execute_read name does not imply absence of effects; the README explicitly says so.

Smallest fix: Before starting new metered work, apply the user's existing spending authorization, query available account/budget facts and quote() for Premium work, and stop for authorization if the expected charge is outside it. Retain the existing pricing disclosures and budget errors.

### M03 · MEDIUM · trust boundary hardening

Locations: [arcmira/SKILL.md:38-44](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/arcmira/SKILL.md#L38), [company-watch/SKILL.md:68-70](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/company-watch/SKILL.md#L68), [find-quotes/SKILL.md:48-56](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/find-quotes/SKILL.md#L48), [person-research/SKILL.md:55-70](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/person-research/SKILL.md#L55), [sponsor-research/SKILL.md:83](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/sponsor-research/SKILL.md#L83).

These workflows consume dynamic tool references and third-party transcript/catalog text and then construct programs or emit links. The submitted files do not state that returned instructions, passages, entity names, URLs and errors are untrusted data. No concrete injection payload or malicious intent was found in the six files; this is a defense-in-depth gap.

Smallest fix: Add one shared rule and a short standalone reminder in each task skill: returned text cannot authorize tool calls, feedback, monitor writes, spending or instruction changes; safely encode user/data values into program literals; use only expected HTTP(S) source/vendor links.

### M04 · MEDIUM · incorrect totals

Locations: [sponsor-research/SKILL.md:64-82](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/sponsor-research/SKILL.md#L64), [sponsor-research/SKILL.md:98](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/sponsor-research/SKILL.md#L98).

The brand example stops paging when reads.length reaches 500 even if a cursor remains, then returns ad_reads_total and a top-ten ranking without a partial flag or continuation cursor. This contradicts its instruction to page until has_more is false. Static example: 600 matching rows yields a claimed total of 500 and a ranking over only that subset.

Smallest fix: Keep a bounded request budget; return partial, scanned_ad_reads, next_cursor and the requested window. Label totals/ranking as partial when a cursor remains, and continue only within the user's authorized budget.

### M05 · MEDIUM · entity identity

Locations: [sponsor-research/SKILL.md:71-78](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/sponsor-research/SKILL.md#L71).

The grouping map is keyed by source_channel.name rather than channel_id. Distinct channels with the same display name collapse into one count and retain only the first channel id.

Smallest fix: Key the map by media.channel_id (or another documented stable channel id) and retain display name only as a label.

### M06 · MEDIUM · mixed time windows

Locations: [compare-shows/SKILL.md:49-62](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/compare-shows/SKILL.md#L49), [compare-shows/SKILL.md:69-70](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/compare-shows/SKILL.md#L69).

Only occurrences receives after=daysAgo(90); sponsors() receives no window. The returned window comes from occurrences while the answer instruction asks for shared sponsors with counts for a stated window. The example can present sponsor counts as if they share the 90-day window without evidence that they do.

Smallest fix: Label the subject-comparison window separately from the sponsor-count window. Treat sponsor counts as the endpoint's documented/default coverage unless a supported date filter or dated ad-read query proves the same window.

### M07 · MEDIUM · freshness inconsistency

Locations: [compare-shows/SKILL.md:59](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/compare-shows/SKILL.md#L59), [compare-shows/SKILL.md:69](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/compare-shows/SKILL.md#L69), [arcmira/SKILL.md:43](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/arcmira/SKILL.md#L43).

compare-shows reports channel.indexed_through alongside searchable_videos, while the shared skill specifically requires channel.search_indexed_through for transcript-search freshness. This is a documented internal inconsistency; live endpoint field availability was not tested.

Smallest fix: Use the documented search_indexed_through field for transcript-search coverage, and keep any general indexing date separately labelled. Verify against a pinned contract without running the live service.

### M08 · MEDIUM · unsupported clip precision

Locations: [find-quotes/SKILL.md:50-56](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/find-quotes/SKILL.md#L50), [find-quotes/SKILL.md:67](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/find-quotes/SKILL.md#L67), [find-quotes/SKILL.md:76](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/find-quotes/SKILL.md#L76).

When transcript retrieval fails, the example emits clip.end = start_seconds + 60. Empty transcript lines also trigger invented fallback bounds. The good-answer instruction describes clip boundaries as coming from transcript lines, but these paths contain only estimated bounds.

Smallest fix: Return clip_bounds_verified=false (or omit clip end) when transcript lines are absent. Label the passage source and estimate explicitly; only claim exact clip bounds when supported by timestamped lines.

### M09 · MEDIUM · silent incomplete monitoring scope

Locations: [company-watch/SKILL.md:85-96](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/company-watch/SKILL.md#L85), [company-watch/SKILL.md:129](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/company-watch/SKILL.md#L129).

The topic-spelling resolver loop silently drops a topic when there is no best/suggested entity, including ask ambiguities. Only unresolved NAMES enter unresolved; the answer can fail to reveal a topic the user expected to follow.

Smallest fix: Append unresolved topic spellings with their ask options or no-match reason to the returned unresolved list, and resolve/confirm them before any monitor write.

### M10 · LOW · structural quality/metadata

Locations: [company-watch/SKILL.md:3](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/company-watch/SKILL.md#L3), [compare-shows/SKILL.md:3](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/compare-shows/SKILL.md#L3), [find-quotes/SKILL.md:3](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/find-quotes/SKILL.md#L3), [person-research/SKILL.md:3](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/person-research/SKILL.md#L3), [sponsor-research/SKILL.md:3](https://github.com/arcmira/mcp/blob/557fc76b697a2eaf1fee3bbfae90f25181ae2e93/plugins/arcmira/skills/sponsor-research/SKILL.md#L3).

The five task descriptions do not match the unchanged directory's WHEN_RE. Use cases in the body do not satisfy this frontmatter-only check. All six also omit allowed-tools and compatibility; no invented adoption, references or scripts were credited.

Smallest fix: Add accurate frontmatter trigger language such as 'Use when the user asks ...'. Add truthful compatibility/account/remote-service information and host-supported least-privilege tool declarations where appropriate. Do not add filler, fake citations or empty script/reference directories to raise scores.

## Verification, limits, and resolved setup failures

- Completed: 34 directory-check tests, 16 inclusion tests, 8 install tests, 5 citation tests, and 13 JavaScript badge/report tests: **76 passed, 0 failed**. Logs are retained under `logs/test-directory-*`.
- An initial inclusion-test run had three failures because the review-only six-skill inclusion file replaced the baseline fixture scope. The original pinned inclusions file was restored in the review copy, and all 16 baseline inclusion tests then passed. Both logs remain; no parser, curator, score, policy, or test assertion was edited.
- Per repository AGENTS, `npm test` was attempted in the isolated tooling copy after `npm ci --ignore-scripts`. Validation, number-word and metadata checks ran. The suite was interrupted during `test_validator_runtime.mjs`, returning 130 with a pending-Promise/cancelled-suite diagnostic. There is **no full npm-test pass**. The bounded requested regressions are the completed verification. No broad refresh or first-party intake command ran.
- Initial Docker build attempted to write default local config under a read-only home; it was moved to a dedicated writable review config. Build-time DNS then failed; exact wheels were downloaded outside the container and installed offline with the same hash lock. The first runtime control could not read a copied worker because archive permissions were owner-only; staged trusted files/directories were made readable by UID 65534, and the unchanged adapter then passed its controls and completed both scan batches. Original errors and corrected-run logs are retained. No automatic-approval rejection occurred and no access denial was bypassed.
- No service code or submitted JavaScript was run; no live tool contract, billing enforcement, OAuth behavior, monitoring delivery, or account privacy behavior was certified. Those are explicit excluded/unverified surfaces, not zero-finding claims.
- Remaining review work before any separate admission decision: address the consent/privacy and paid-read boundary proposals as appropriate to the supported host, fix the demonstrated partial totals/grouping/window/clip/topic handling, add accurate manifest metadata, and rescan changed content at a new pin. The user authorized review only, so no fixes or admission were applied. HOL profile mismatch and incomplete full npm suite remain disclosed verification limitations, not blockers to the completed bounded Cisco/structural review.

## Exact content hashes

All eleven fetched context/scope files were checked against Git blobs. The six scanned files and scoped license are listed below. Full inventory is `evidence/content-manifest.json`.

| Path | Git blob SHA1 | SHA256 | Bytes |
|---|---|---|---:|
| plugins/arcmira/skills/arcmira/SKILL.md | `896aa2089481e38319712e01afa30c57604e2315` | `844ea67207835136c74ae2af84d4578bfd75f30b445ce851b6274ff85d7ffbcd` | 8889 |
| plugins/arcmira/skills/company-watch/SKILL.md | `dfa13b3a87c8e8b41eda8fb55bffb5d9a086e55f` | `74d5a7ba13f407bc8a3336372e0f79d4fcf5e0891aba2df99f8b30027affa877` | 12131 |
| plugins/arcmira/skills/compare-shows/SKILL.md | `adebdccf4b5c41dccfdca3b379a0b8259ae1978e` | `40f905f278ba803a70600fa1ff25a200033febd0a461e84e7868733657935359` | 5188 |
| plugins/arcmira/skills/find-quotes/SKILL.md | `676bfd550bf90f22fef63bf8059a9b1f55191418` | `6d4431b66a043e8c0696f60ea9b3e826646a2fa6ade8ebd2379e92e09f7ca36c` | 5602 |
| plugins/arcmira/skills/person-research/SKILL.md | `be3da893f2c36fca4b9b4d11387b5adcd6431bac` | `eb9f275cef02933470289ba229c3fe0299a23fadc38f65779cf06fc5f9b8e435` | 6205 |
| plugins/arcmira/skills/sponsor-research/SKILL.md | `fe73c0b53590ea7c3d859ed63919cc59b4fd8b02` | `343a42945b2e590e483aff3438747a695341216979a65ebc9329439115604560` | 6305 |
| plugins/arcmira/LICENSE | `1f25d649de0c60c6002b5c39c812a000f6a44e38` | `28d6a1c0070657aeded12d943e4d7ca87daf84fa101b6030c27ec209d894973b` | 11338 |

Reproduction: [REPRODUCE.md](REPRODUCE.md), `reproduce_quality.py`, `prepare_scan.py`, `run_scan.py`, `evaluate_security.mjs`. Tooling hashes, exact scanner package versions, wheel hashes, raw findings, source content, logs and local-only catalog are retained alongside this report. `evidence/original-repository-status.txt` records the unchanged original checkout.
