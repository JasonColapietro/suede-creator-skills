# Agent Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Publish reviewable repository and hosted-agent profiles alongside the unchanged skill catalog.

**Architecture:** Keep agent data, evidence validation, rating computation and browser search separate from skills. Register agent pages/reports in the existing directory generator, then use its standalone-host rewriting and sitemap pipeline.

**Tech Stack:** Node 22 ESM, JSON, static HTML/CSS, browser JavaScript, existing node:test/Python/browser checks. No new production dependencies or hosted calls.

**Spec:** `docs/superpowers/specs/2026-10-27-agent-directory-design.md` (approved October 27).

## Global Constraints

- Keep `directory/skills.json`, `graded-v2`, skill scores, promotion records and security findings unchanged.
- Three independent evidence ratings /10; unknown means null, never zero. No overall score, performance claim or safety badge.
- Repository evidence pins the exact source commit. Hosted evidence preserves dated observations, not a claim to fingerprint the deployed service.
- One search result per edition; source availability and deployment are independent.
- Preserve draft holds #278, #281 and #288; new branch only. Signed draft PR, no merge/deployment.
- No agent execution, credentials, maintainer contact, paid APIs or new services.

## Review Focus

- A hosted edition with public source can carry both applicable ratings without treating source revision as deployed revision (Task 1).
- A changed or cross-edition receipt cannot award points to the wrong agent (Task 1).
- An unscored or stale edition remains discoverable without implying a failing runtime score (Tasks 1/3).
- Search query parameters and source strings cannot inject markup or an unsafe URL (Tasks 1/3).
- Generated agent files survive orphan cleanup and have valid standalone report hashes without changing skill reports (Task 3).

## Task 1: Evidence model, rubric and validation

**Files:** Create `scripts/directory/agents-model.mjs`, `directory/agents.schema.json`, `directory/agents/rubric-v1.json`, `tests/test_agents_model.mjs`.

**Interfaces:** `validateAgentCatalog(catalog, receipts, rubric)` returns validated products/editions with derived ratings; throws on invalid evidence. `loadAgentCatalog(root)` loads bounded local records and returns catalog, receipts, rubric, catalog digest and derived editions. `agentReport(model, product, baseUrl)` returns a versioned report with content hash. `freshness(assessedAt, now)` labels a dated review without modifying its score.

- [x] Write behavior tests using a complete synthetic repo/hosted/hybrid fixture: 8 supported checks plus 2 absent yields 8/10; one unknown yields null; not-applicable differs from unknown; forged hash/revision, reused cross-edition evidence, duplicate IDs, unsafe URLs and unsupported performance/security states reject.
- [x] Run `node --test tests/test_agents_model.mjs`; confirm the new contract fails before implementation.
- [x] Implement strict local validation, independent rating applicability, canonical receipt/report hashing, versioned rubric and machine-readable schema. Source-to-deployment equivalence stays explicitly unknown.
- [x] Run the model tests; expected all pass. Commit signed with focused tests and model.

## Task 2: Review and admit the initial catalog

**Files:** Create `directory/agents.json`, `directory/agents/evidence/*.json`, `directory/agents/README.md`, `.github/ISSUE_TEMPLATE/agent-listing.yml`; extend `tests/test_agents_model.mjs` with real-catalog invariants.

**Interfaces:** Catalog follows Task 1's schema. Each criterion has state, reason and evidence IDs; receipts bind product/edition, observation date, reviewer, URL/locator and source revision where applicable.

- [x] Add a test requiring a repository edition and hosted edition, valid reviewed source/terms, ten explicit checks per applicable rating plus null for not-applicable ratings, and runtime/security unknown defaults. Confirm it fails before the catalog exists.
- [x] Read pinned official goose/Cline source and Devin official documentation; retain concise paraphrased observations and digests. Score only checks supported by reviewed evidence; leave any unreviewed criterion unknown. Do not infer results from test/CI presence.
- [x] Add exact-scope add/recheck/correct/remove intake form and maintainers' refresh instructions. No automatic remote ingestion or execution.
- [x] Run model/catalog tests; expected all pass. Commit signed.

## Task 3: Agent pages, search and build integration

**Files:** Create `scripts/directory/agents-render.mjs`, `docs/assets/agents.js`, `docs/assets/agents.css`, `tests/test_agents_site.mjs`, `tests/test_agents_browser.mjs`; modify `scripts/build-directory.mjs`, `scripts/build-directory-site.mjs`, `package.json` and existing isolated build fixture tests where required.

**Interfaces:** `renderAgents(model, {page, crumbs, rel, url, setKeywords, pageDate})` returns a `Map` of generated paths/content. Existing generator registers it before orphan cleanup. Agent search index is edition-shaped and independent from `search-index.json` for skills.

- [x] Write integration tests proving agent routes exist, score scope is explicit, reports verify, schema/links/canonicals/sitemap work, unscored editions render, malicious text is escaped, and skill data/report invariants survive. Confirm missing generated routes fail.
- [x] Implement static hub/profile/methodology/submission output and edition search with task/deployment/source/evidence filters, cohort-specific rating sorts, stable URL state, empty/error/no-JS states and mobile styles. Add a Skills/Agents switch while retaining skill navigation and shortlist behavior.
- [x] Integrate output registration, reserved `agents` route, optional agent catalog support for legacy fixtures, standalone llms description and report-schema discrimination. Regenerate through `npm run build:directory`; never hand-edit generated HTML.
- [x] Run `node --test tests/test_agents_model.mjs tests/test_agents_site.mjs` and `npm run test:directory`. Expected all pass, plus existing skill JSON/report hashes remain unchanged.
- [x] Run browser checks using the authorized browser/runtime: search/filter/URL restoration, mixed editions, mobile overflow, keyboard, no-JS and failure fallback; retain desktop/mobile screenshots and preview.
- [x] Commit signed generated output and integration.

## Task 4: Whole-branch verification, review and draft PR

**Files:** Record validation and review in the plan/progress artifacts and PR body; fixes only where findings require them.

- [ ] Run `npm test`, generated freshness, relevant browser checks and `git diff --check`; retain real outputs and distinguish baseline/environment failures.
- [ ] Obtain independent whole-branch review against this spec, including source evidence, schema validation, rating integrity, unsafe text and existing holds. Reproduce substantive findings with failing tests, fix and rerun affected tests/full suite when warranted.
- [ ] Build standalone preview, inspect actual rendered hub and profile desktop/mobile, and provide screenshots/preview URL.
- [ ] Push signed feature commits and open a draft PR. Verify GitHub signature status is `verified=true` and retain draft/unmerged state. Report exact blockers instead of claiming unavailable checks passed.

## Task 5: Ungraded discovery catalog (user expansion, 2026-10-27 05:34 UTC)

**Goal:** Add a large, source-backed searchable list of actual agents to PR #289 without granting evidence ratings, verification badges or security claims.

**Files:** Create `directory/agents/ungraded.json`, `directory/agents/ungraded.schema.json`, `scripts/directory/agents-ungraded.mjs` and `tests/test_agents_ungraded.mjs`; extend the agent renderer, enhancement script, styles, submission and browser/site tests.

**Interfaces:** `validateUngradedCatalog(catalog, assessedProducts)` validates one record per product with official URL, optional repository, task tags, deployment options, source availability, dated source URLs and no rating fields. `loadUngradedCatalog(root, assessedProducts)` returns the local catalog. The renderer adds `/agents/ungraded/` and a downloadable ungraded index; assessed search remains independent.

- [x] Write failing tests for unsafe links, duplicates within/across catalogs, invented assessment fields, future/missing source dates, escaped static cards and discovery metadata.
- [x] Implement strict catalog validation and a compact static listing with progressive search, task/deployment/source filters, stable URL state, accurate live counts and no-JS fallback. No numeric rankings or verification/security badges.
- [x] Integrate verified public-source research, deduplicate actual products and exclude frameworks, models, MCP servers and skill packs. Retain only descriptions supported by cited official sources.
- [ ] Regenerate, run model/site/directory/browser checks and inspect desktop/mobile preview. Obtain independent review of the expansion, commit signed, push to the same draft PR and verify signature/CI status. Preserve all existing skills, scores and holds; no merge or deploy.

### Verification checkpoint for Task 5

- Catalog/model checks: 6 passed; invalid fields, URL credentials, duplicates,
  deployment options and missing/future source facts were exercised red/green.
- Existing skills plus agent browser checks passed, including populated ungraded
  search, URL restoration, all documented deployment modes, keyboard, mobile,
  no-JS and script-failure fallback. Desktop/mobile screenshots inspected.
- Independent expansion review accepted after Factory/Qodo deployment corrections
  and collection classification in the SEO suite. All 119 source URLs trace to
  research records; all 82 dates are visible outside disclosures.
- Directory suite: 94/95 passed; standalone-report copying hit ENOSPC. The exact
  failed test passed when rerun serially after removing the failed generated build.
  Generated-file freshness passed; protected skill/assessed data are unchanged.
- Fresh full npm test passed validation and entered the keyword suite, then exited
  7 without a final summary during local disk exhaustion. Do not call that a pass.
  Original PR CI at 76521b3 passed; the expansion needs its own new-commit CI.
