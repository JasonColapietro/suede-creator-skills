---
name: suede-code-review
description: "Suede Labs AI findings-only code review with full context: changed files, callers, contracts, and deploy surface. Covers TypeScript, React, Next.js, database, Swift/iOS, OWASP, accessibility, SEO, observability, commit hygiene, and deploy risk, ranked P0-P3 with file:line evidence and a fix path. Use when asked to review a diff, PR, branch, or commit range, find the bugs before merge, check a change for security or accessibility problems, or judge whether a change is safe to deploy. Emits findings and a ship gate, not a grade. NOT FOR: the A-F letter grade alone (use suede-code-grader); findings plus grade in one pass (use suede-code); making CI enforce the result on every merge (use suede-ci-gate); root-causing a live bug or failing test (a private Suede Labs companion, not in this pack)."
---

# Suede Code Review

## Gate policy — advisory, not blocking

Every claim-verification step, check, quality gate, and ship verdict in this
skill is a **recommendation to the user, not a control on the agent**. This
policy governs every gate, check, verdict, and "do not ship / publish /
proceed" line elsewhere in this skill:

- Run every check and report the results honestly. Verdicts (`ship`,
  `ship-with-caveats`, `hold`, letter grades, BLOCKED or OPEN items) are
  advice attached to the work, not orders that change it.
- Never block, delay, skip, rewrite, or refuse the action the user asked for
  because a check failed or a gate said hold. Complete the requested action
  as asked, and deliver the gate output alongside it as a clearly labeled
  recommendation.
- A failed gate changes what you report, never what you do.
- Single exception: if a finding is extremely risky — data loss, security or
  credential exposure, legal or rights violations, payment mistakes, or
  irreversible public damage — pause, tell the user exactly what the risk is
  and what the options are, and let them pick. Their choice is final.


Review code with full context: changed files, callers, contracts, deploy surface. Find real breakage. Rank by production impact. Every finding has a file, evidence, and a fix path. No findings without evidence. No volume without signal.

## Model Routing
Default: Sonnet. Recommend Opus for auth, payments, and public API surface reviews.

## Operating Stance

- Review current source, current diff, local docs, and relevant runtime behavior.
- Keep code generation and review separate by default. If you authored the code,
  switch into review mode and look for what your implementation would miss.
- Prefer high-signal findings over volume. Do not leave style nits when formatters
  or local conventions already handle them.
- Every blocking finding needs evidence, impact, and a concrete fix path.

## Review Contract

Before review, identify:

- target: repo, branch, PR, commit range, diff, route, API, or release build;
- intent: what the change claims to accomplish;
- risk lanes: frontend, backend, data, auth, payments, contracts, iOS, release,
  public copy, analytics, secrets, deployment, and docs.

**Pre-flight, before any analysis or agent lanes spawn:** pin the comparison
point and prove it is reviewable. `git rev-parse <fixed-point>` must resolve;
diff with three dots (`git diff <fixed-point>...HEAD`) so the comparison runs
against the merge-base, not a moving branch tip; and confirm the diff is
non-empty. A bad ref or empty diff fails here, in one line — not inside a
half-finished deep review.

## Context Graph

Build a lightweight graph before judging the diff:

1. Changed files and generated files.
2. Imports, callers, routes, API handlers, jobs, hooks, models, schemas, and
   config/env dependencies touched by the change.
3. Tests, fixtures, migrations, release scripts, docs, and screenshots that
   should move with the behavior.
4. Runtime surfaces: local route, live URL, API endpoint, simulator flow,
   dashboard, App Store metadata, or deployment target.
5. Suede domain contracts: creator ownership, rights/provenance, registry-backed
   media, royalty routing, agent commerce, wallet/payment flows, and
   published-statement accuracy.

Flag beyond-the-diff risks when related files, defaults, docs, env, or deploy
requirements no longer agree.

## Run the Repo's Own Gates

Do not hand-review for what a tool already decides. Before manual analysis, run the
gates the repo already ships and fold the output into findings. Detect what exists
from `package.json` scripts, config files, and lockfiles — run only those. Never
introduce a tool the repo does not use, and never fabricate a result you did not run.

- **Type check:** the repo's `typecheck` script, or the type checker directly. An error
  on a changed line is at least P2; on a changed critical path, P1.
- **Lint:** the repo's configured linter on changed files only. Report violations the
  change introduces; ignore pre-existing noise outside the diff.
- **Tests:** run the suite, or the changed-file subset. A failing test on changed
  behavior is P1; a test that silently stopped running is P2.
- **Dependency CVEs:** the repo's dependency auditor — the package manager's audit
  command, or a vulnerability scanner — when dependencies changed. A known-exploitable
  CVE reachable in a production path is P0/P1.
- **Secret scan:** a real entropy-based secret scanner over the diff when the repo
  provides one — it catches keys the Commit Dirt Score patterns miss. A verified live
  secret is P0.
- **Build:** for release reviews, the production build must pass. A broken build is P0.

### Gate Commands by Stack

The categories above are universal; the actual command differs by surface. Use this as
a reference, not a checklist — detect which of these apply to the target repo, run only
what exists, and never fabricate a result you did not run.

| Stack | Type check | Lint | Test | Other |
|---|---|---|---|---|
| Web / Node (TS/JS) | `npx tsc --noEmit` | `npm run lint` | `npm run test` | `npm audit` for dependency CVEs |
| MCP server (Node) | `node --check <server>.mjs` | repo's configured linter, if any | `npm run test:mcp` when provided | Run a complete session in one process: valid `initialize`, `notifications/initialized`, then list/call/read/get requests; use $suede-mcp-qa when available |
| iOS / Swift (Xcode) | — (compiler check is the build) | SwiftLint, if configured | XCTest target, if present | `xcodebuild -project X.xcodeproj -scheme X -destination 'platform=iOS Simulator,name=iPhone 16' build` |
| API / backend (generic) | language's own type/compile step, if any | repo's configured linter | contract or schema test — e.g. OpenAPI/schema validation against the live route, or the repo's own contract-test suite | — |

Cite the command, its exit status, and the file:line it implicates. If a gate cannot
run (no script, missing deps, sandboxed), say so in Verification — never report a gate
as passed that you did not execute.

## Project Rules and Learnings

A review that fights the house style produces noise, not signal. Honor what the repo
already encodes.

- **Read the rules first:** before judging, read `CLAUDE.md`, `AGENTS.md`,
  `CONTRIBUTING.md`, `.editorconfig`, formatter/linter config, and any review-config
  file at the repo root or in the changed directories. A documented convention is
  binding — do not flag what a rule permits; do flag what it forbids.
- **Most-specific rule wins:** a rule in a subdirectory config or a nearest-ancestor
  `AGENTS.md` overrides a repo-root rule for files under that path.
- **Record learnings:** when the user dismisses a finding as a false positive or a
  deliberate house pattern, capture it in one line — pattern, why it is allowed, path
  scope — and do not re-raise that pattern this review or in later ones. Repeat nitpicks
  erode trust faster than a missed P3.

## Review Modes

- **Fast diff review:** small change, narrow blast radius, focused findings.
- **Deep PR review:** multi-file behavior, public surface, data/auth/payment,
  release, or cross-repo risk.
- **Plan review:** implementation has not started; inspect scope, sequencing,
  acceptance criteria, test mapping, and missing decisions.
- **Fix verification:** review after fixes; rescan changed files and confirm the
  original finding is gone.
- **Release review:** validate build, secrets, env, public copy, screenshots,
  metadata, deployment, and live/API readback.

### Review Depth Levels

Add a `--depth` modifier to any review:

- **`--quick`** (~2 min): Pattern-based scan. Flag obvious bugs, hardcoded
  secrets, missing null checks, SQL/command injection patterns, broken error
  handling. No cross-file analysis. Use for PRs with narrow blast radius.
- **`--standard`** (default, ~10 min): Per-file analysis: correctness on changed paths, language-specific traps (see checklists below), state handling, test coverage on changed behavior, call graph within changed files. Default for all PRs unless the user says otherwise.
- **`--deep`** (~25 min): Cross-file analysis including full import graph and
  call chain tracing. Finds semantic bugs that only appear when you follow data
  across module boundaries. Use for auth changes, payment flows, data
  migrations, and public API changes.

State depth level at the top of every review output.

## Web Stack Traps

TypeScript, React, accessibility, Next.js, SEO, database, and performance trap
catalogs are in `references/traps-web.md`. Load it when the diff touches any of
those stacks, and read only the sections that match — a Swift-only change needs
none of it.

## Agent Team Review (--deep only)

For `--deep` reviews on auth changes, payment flows, data migrations, or public API changes, run as separate lanes:

- **Change mapper:** summarizes what changed and which systems are touched.
- **Runtime critic:** hunts execution failures, state drift, race conditions, error paths, and deploy prerequisites.
- **Security critic:** reviews auth, secrets, permissions, injection, SSRF, payment safety, wallet flows, and data exposure.
- **Product critic:** checks feature truth, Suede positioning, user-visible behavior, empty/error states, and release claims.
- **Test critic:** maps claims to tests, screenshots, simulator runs, builds, and live/API checks.

Collect consensus first. If high-severity concerns persist after a fix cycle, keep status at `hold` and name the smallest next check or patch.

## Whole-Repo and History Pass (--deep)

The changed-file import graph is the floor. The bugs that ship hide outside the diff. On `--deep`, widen past the immediate callers:

- **Reverse-dependency sweep:** find every caller of a changed function, type, route, or constant across the whole repo (search the symbol repo-wide, not just the changed file's imports). A signature, return-shape, or nullability change is safe only if every call site agrees — name the sites you checked.
- **Shared-assumption check:** for a changed schema, env var, default, or invariant, find the other places that assume the old value — config read in two services, a default mirrored in a client, a magic value duplicated in a test. These drift silently.
- **History of the touched lines:** `git log -L` or `git blame` the changed region. If this area was fixed before, a change that reintroduces the old shape is a regression — cite the prior commit. If it churns repeatedly, flag it as fragile.
- **Sibling-pattern consistency:** find the nearest existing analog — the other route handlers, the other migrations — and confirm the change follows the established pattern. A lone handler that skips the shared auth wrapper the other four use is P1 even if it "works."

State what you traced. A whole-repo claim with no symbols named is not evidence.

## Observability Delta

Check on any new route handler, API endpoint, background job, cron, queue consumer, or service function:

- **Swallowed errors:** `try/catch` blocks that catch without logging or Sentry capture. Flag `catch (e) {}` and `catch (e) { console.error(e) }` — a caught error that only `console.error`s is invisible in production. Require `Sentry.captureException(e)` or equivalent on unexpected errors.
- **Dark code paths:** new route handlers, API functions, or jobs with no log line at entry and no log on failure. If the path produces no signal, the first indication of failure will be a user report.
- **Missing error boundaries:** new React subtrees not wrapped in an error boundary; new server functions that don't surface errors to the monitoring layer.
- **Uninstrumented slow paths:** new DB queries, external API calls, AI model calls, or file I/O with no timing log or trace span. These are the paths that will page oncall first.
- **Orphaned analytics events:** feature flags or analytics events that were fired in the old code and are no longer fired after the change. A metric drop in the dashboard will look like a product regression.
- **Silent background jobs:** cron or queue consumer that completes without logging item count processed, duration, or failure reason. Silent jobs are unmonitorable until they stop running entirely.

## Deploy Safety Gate

Run this automatically at the end of every review. No exceptions. It answers one question: **is this safe to deploy right now?**

Grade each dimension. Each is pass / conditional / block:

- **Breaking changes**: Does this change any public API signature, database schema, config key, or interface contract without a versioned migration or backward-compatible fallback? Recommend blocking if yes without migration path.
- **Rollback safety**: Can a `git revert` fully undo this? Red flags: schema migrations, irreversible external API calls (email sent, payment charged, data permanently deleted), S3/storage mutations, message queue publishes. Recommend blocking if rollback requires manual data repair.
- **Blast radius**: What fraction of users or requests does this code path serve? State it: `~0%` (new feature, flagged), `~partial` (specific flow), `~100%` (shared middleware, auth, DB query in hot path). Higher blast radius requires more evidence before deploy.
- **Environment readiness**: Are all required env vars, secrets, feature flags, and config values already deployed to production? Recommend blocking if a required env var doesn't exist in production yet.
- **Dependency changes**: Are new or updated packages pinned to an exact version, from a trusted source, and CVE-free? Recommend blocking if a new dependency has a known CVE or is unpinned in a production context.
- **Data mutations**: Does this write, update, or delete production data in a way that can't be undone by revert alone? Recommend blocking if yes without a tested restore path.
- **Security delta**: Does this change improve, hold neutral, or worsen the security posture? Recommend blocking if it introduces new attack surface without mitigation.
- **Automation coverage**: Does `.github/workflows/` (or equivalent CI) exist and cover the changed surface (build, types, tests)? Are required status checks enforced on `main`? Recommend blocking if the changed surface has no automated gate and the repo is production-connected.

Output block — required at the end of every review:

```text
DEPLOY SAFETY
Breaking changes: pass | conditional | block — [evidence]
Rollback safety: pass | conditional | block — [evidence or red flag]
Blast radius: ~X% — [which path or user segment]
Environment readiness: pass | conditional | block — [missing vars if any]
Dependency changes: pass | conditional | block — [new deps and CVE status]
Data mutations: pass | conditional | block — [irreversible operations if any]
Security delta: improved | neutral | block — [surface changed]
Verdict: SAFE TO DEPLOY | DEPLOY WITH CONDITIONS | DO NOT DEPLOY
Conditions (if any):
```

This skill emits no letter grade. When the caller wants lane grades too, run $suede-code (findings + grade) or $suede-code-grader (grade only) — those two carry the canonical Instant-F trigger list, grade caps, and A-F scale. Instant-F patterns found here (hardcoded secrets, injection, auth bypass, unverified payment webhooks, destructive migrations with no rollback, plaintext sensitive data) are P0 findings and set the Ship Gate to `hold`.

## Commit Dirt Score

Run automatically on every review. Scan the raw diff for content that should never reach git history. No exception for "it's just a branch" — dirty commits propagate.

**Execute it, do not eyeball it.** This skill's `scripts/commit-dirt-scan.sh` carries the literal pattern set: run it with the target repo as the working directory (`bash <skill-dir>/scripts/commit-dirt-scan.sh main...HEAD`, or pipe a diff to it with `-`). It and prints a verdict per category. It is read-only and always exits 0 — confirm each hit against the diff before reporting it. When the script cannot run, check every added (`+`) line by hand for the same seven categories: secrets and credentials · debug artifacts · conflict markers · accidentally staged build output · WIP breadcrumbs · oversized or binary blobs · exposed internal references.

**Score:**

```
COMMIT DIRT SCORE
Secrets / credentials:   clean | suspicious | dirty — [pattern found or "none"]
Debug artifacts:         clean | suspicious | dirty — [symbol or line or "none"]
Conflict markers:        clean | dirty — ["none" or file:line]
Accidentally staged:     clean | dirty — [path or "none"]
WIP breadcrumbs:         clean | suspicious | dirty — [marker or "none"]
Oversized / binary:      clean | dirty — [file and size or "none"]
Exposed internals:       clean | suspicious | dirty — [pattern or "none"]
Overall dirt rating:     CLEAN | SUSPICIOUS | DIRTY
```

- **CLEAN**: no hits across all dimensions.
- **SUSPICIOUS**: low-confidence hit that could be a false positive (e.g. a test fixture, a sample value in docs). Call it out; let the reviewer confirm.
- **DIRTY**: high-confidence hit that must be removed before merge. Escalate as P0 in the Findings section.

A `DIRTY` overall rating automatically sets the Ship Gate to `hold`.

## Finding Format

Lead with findings, ordered by severity. Group repeated patterns once: "This pattern appears in 4 files: [list]. Fix described once below." **The structural problem is the review:** when a design or structural defect is present, report it first and alone — hold the line-level findings inside the code that defect governs, name them as deferred until the structure is settled, and do not enumerate them. A broken design buried under twelve P2 nits reads as twelve small problems.

**P0 / P1**: use the full block:

```
[P0] path/to/file.ts:142
Issue: JWT secret falls back to empty string; any token is valid when SECRET is unset.
Fix: `process.env.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET required') })()`
Verify: set JWT_SECRET="" and curl /api/me — expect 401, currently 200.
OWASP: A02 Cryptographic Failures
Confidence: high
```

**P2 / P3**: one line each:

```
[P2] components/Feed.tsx:88 — missing key prop on .map() return; use item.id not index. TS will catch post-fix.
[P3] utils/format.ts:12 — magic number 86400; extract as SECONDS_PER_DAY.
```

Severity:

- **P0:** data loss, security exposure, payment loss, broken release, or public behavior that should not ship — extreme-risk findings that also warrant a pause-and-ask to the user before any ship step.
- **P1:** likely production regression, auth/permission bug, broken primary path, false published statement, or missing critical deploy requirement.
- **P2:** meaningful edge-case failure, incomplete state handling, test gap on changed behavior, or maintainability issue with real cost.
- **P3:** low-risk improvement, clarity issue, local cleanup, or follow-up.

If the issue cannot be tied to a file, route, command, state, or user-visible behavior, mark it as an open question instead.

## Fix Briefs

When asked to fix, convert each accepted finding into an agent-ready brief:

- failing behavior and evidence;
- exact files or areas to inspect first;
- expected change;
- acceptance criteria;
- verification command or browser/simulator path;
- caveats and WIP to preserve.

Fix one risk cluster at a time. After fixing, rerun the relevant review mode and
do not close the finding until evidence confirms it.

### Fix Mode

When the user asks to apply fixes (`--fix` flag or equivalent instruction):

1. Auto-apply P2/P3 fixes that are local (single file, no behavior contract change). Stage each fix as its own commit with the finding ID in the message.
2. Present P0 and P1 findings as confirmed fix briefs before applying. Do not
   auto-apply to production-critical, auth, payment, or data-migration code
   without explicit user confirmation.
3. After applying fixes, re-run the relevant review mode on only the changed
   files. Mark original findings as resolved or escalated.
4. Cap the iteration loop at 3 cycles. If the same finding persists after 3 fix
   attempts, escalate as a design issue requiring human decision.

## Current OWASP Security Baselines

The per-category security baselines are in `references/owasp-baselines.md`. Load it
when the diff touches auth, sessions, crypto, payments, file upload, or any
request-handling boundary.

## Suede-Specific Checks

Always check these when relevant:

- auth/session behavior between app, API routes, native shells, and server code;
- creator rights, provenance, registry, licensing, royalty, and agent-commerce
  claims match implemented behavior;
- payment, wallet, x402, checkout, and credit flows fail closed;
- public pages do not invent metrics, pricing, partner claims, testimonials, or
  release promises;
- Vercel/account/deploy assumptions match local guidance before production
  claims;
- App Store/iOS screenshots, metadata, privacy answers, and build behavior match
  the actual app;
- migrations, env vars, feature flags, cron/jobs, queues, webhooks, and secrets
  are documented and deployable;
- multi-repo or multi-surface contracts do not drift across web, backend,
  mobile, public sites, and docs.

## Swift / iOS Traps

The Swift and SwiftUI trap catalog and the native contract-drift checks are in
`references/traps-swift-ios.md`. Load it when the diff touches Swift, SwiftUI, or
an API contract an iOS client consumes.

## Technical Debt

Flag tech debt patterns as P3, group by file, don't block ship. Do not block a ship on P3 tech debt unless it directly obscures a P0/P1 bug. File as follow-up.

### Design Smell Baseline (--standard and --deep)

Beyond what the repo documents, the review carries a fixed twelve-smell
maintainability baseline (Fowler, _Refactoring_ ch. 3) in
`references/smell-baseline.md`. Load it on `--standard` and `--deep` reviews and
match it against the diff only. Its binding rules travel with it: a documented
repo rule overrides the baseline, every smell finding is a labeled judgment
call ("possible Feature Envy", P3 by default, confidence `medium` at best), and
anything tooling already enforces is skipped. Smell findings feed this
Technical Debt lane — they never outrank correctness findings and never move
the Ship Gate on their own.

## Intent Compliance and Scope

Code that works but does not do what it claimed is still a defect.

- **Find the spec first.** Look for the originating spec in this order: issue
  or ticket references in the commit messages and PR body (`#123`,
  `Closes #45`); a path the caller passed; a spec file under `docs/`, `specs/`,
  or a scratch directory matching the branch or feature name. If none exists,
  say "no spec available" in the output and review intent from the PR
  description alone — never invent requirements to review against.
- **Claim vs diff:** restate what the change says it does — PR title, description, linked issue, commit subject — and confirm the diff delivers it. Map every acceptance criterion to a code path or a test. Claimed behavior with no corresponding change is a P1 truth gap.
- **Scope creep:** flag changes that do more than they claim — an unrelated refactor riding inside a bugfix, a dependency bump bundled with a feature, a formatting sweep that buries the real diff. Name the unrelated clusters and recommend splitting.
- **Review-effort signal:** state diff size (files / net lines) and an effort read — trivial / moderate / heavy / too-large-to-review-safely. A single PR mixing auth, payments, and a migration should be split before it is safe to judge.

## Change Walkthrough (multi-file PRs)

For a PR summary or any review spanning four or more files, lead with a walkthrough so the reader sees the shape before the findings:

- **Per-file table:** file → one-line what-changed → risk lane. Collapse generated or trivial files into one row.
- **Flow diagram when warranted:** emit a mermaid `sequenceDiagram` (request → handler → service → data) or `flowchart` when the change moves data across three or more boundaries or alters an async, auth, or payment path. Skip it for a localized edit — a diagram of a one-file change is noise.

The walkthrough orients; it never replaces findings, and stays above the Findings block.

## Precision Pass (before output)

False positives are why reviewers get muted. Self-check the draft findings before emitting:

- **Evidence test:** every finding ties to a file:line, a reproduction or trace, and a concrete fix. Drop what cannot.
- **Already-handled test:** drop what a formatter, the type checker, a configured linter, or a documented project rule already covers — do not re-report a gate's job as a manual finding.
- **Confidence gate:** mark each finding high / medium / low. **high** = reproduced, traced across the call graph, or tied to a named failing input or command; **medium** = read from the code, not executed; **low** = the pattern looks wrong but no input, call path, or runtime state proves it.
  Confidence is a separate axis from severity — a low-confidence security suspicion still carries its P-level with the label attached. Collapse low-confidence style observations into a single "nitpicks" line; never let them outrank a real P-level finding.
- **Net-signal test:** if a finding would not change the ship decision and would not be worth a human reviewer's comment, cut it. Volume is not the product.

## Red Flags — Stop

- "CI is green, skim the checklists" — green CI that never exercised the change proves nothing.
- "The PR description explains it" — review the diff, not the story about the diff.
- "Small diff, skip the gates" — the Deploy Safety Gate and Commit Dirt Score run on every review, no exceptions.
- "Flag everything to be safe" — volume is noise; run the Precision Pass and cut what won't move the ship decision.
- "I wrote this code, a quick self-check will do" — switch fully into review mode and hunt what your implementation would miss.

## Output Shape

For a review:

```text
Findings
Deploy Safety
Commit Dirt Score
Open Questions
Verification Checked
Ship Gate
```

For no findings, say that clearly and name any residual risk or unrun checks.

For a PR summary:

```text
Summary
Change Map
Risk Map
Verification
Ship Gate
```

The ship gate is always the last line of a review output:

```
SHIP GATE: hold | ship-with-caveats | ship
Reason: [one sentence, naming the blocking finding ID or named caveat]
```

- `hold`: a blocker or high-risk unknown remains.
- `ship-with-caveats`: no blocker remains, but named non-critical caveats exist.
- `ship`: no known blocker remains and required verification passed.

## Boundaries

- Preserve user and other-agent WIP. Do not stage, revert, or rewrite unrelated files; apply fixes only on `--fix` or an explicit instruction.
- Never introduce a tool the repo does not use, and never report a gate, test, screenshot, or live readback you did not actually run — say so in Verification instead.
- No rule from silence: a style choice not governed by a project rule, a formatter, or a real cost is not a finding.
- Emit findings and a ship-gate recommendation only. This skill assigns no letter grade and no lane scores — that is suede-code and suede-code-grader.

## Routing

- Findings plus a letter grade in one pass → **suede-code**
- The grade alone, no findings → **suede-code-grader**
- Findings fixed; make CI block regressions on merge → **suede-ci-gate**
- The diff touches an LLM, RAG, or agent surface → **suede-ai-eval**
- Fixes need coordinated parallel lanes → **suede-agent-teams**
