---
name: suede-code
description: "Suede Labs AI combined code review and ship grade in one pass: findings with file:line evidence plus an A-F lane grade, Instant-F security triggers, OWASP checks, a deploy-safety gate, and fix briefs. Use when asked to review this, grade this, security-check this, is this safe to ship, or check this PR before merge — whenever the caller wants both what is wrong and whether it ships. Runs only when explicitly invoked; never auto-fires on a diff, save, or commit. NOT FOR: findings only with accessibility and SEO lanes (use suede-code-review); the letter grade alone (use suede-code-grader); making CI enforce the verdict on merge (use suede-ci-gate); LLM, RAG, or agent behavior coverage (use suede-ai-eval)."
---

# Suede Code

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


One pass for code: a deep, evidence-based review **and** a blunt A-F ship grade, together by default. Findings tell you what is wrong; the grade tells you whether it ships. Every finding has a file, evidence, and a fix path. No findings without evidence. No volume without signal.

**Runs only when asked.** This skill never auto-fires on a diff, a save, or a commit. Invoke it explicitly (review this, grade this, security-check this, is this safe to ship). Do not run it as a side effect of other work.

## Model Routing

Default: Sonnet. Recommend Opus for auth, payments, and public API surface reviews.

## Operating Stance

- Review current source, current diff, local docs, and relevant runtime behavior.
- Keep code generation and review separate. If you authored the code, switch into review mode and look for what your implementation would miss.
- Preserve user and other-agent WIP. Do not stage, revert, or rewrite unrelated files.
- Prefer high-signal findings over volume. Do not leave style nits when formatters or local conventions already handle them.
- Every blocking finding needs evidence, impact, and a concrete fix path.

## Review Contract

Before reviewing, identify:

- **target:** repo, branch, PR, commit range, diff, route, API, or release build;
- **intent:** what the change claims to accomplish;
- **risk lanes:** frontend, backend, data, auth, payments, contracts, iOS, release, public copy, analytics, secrets, deployment, docs.

## Context Graph

Build a lightweight graph before judging the diff:

1. Changed files and generated files.
2. Imports, callers, routes, API handlers, jobs, hooks, models, schemas, and config/env dependencies touched by the change.
3. Tests, fixtures, migrations, release scripts, docs, and screenshots that should move with the behavior.
4. Runtime surfaces: local route, live URL, API endpoint, simulator flow, dashboard, App Store metadata, or deployment target.
5. Domain contracts: creator ownership, rights/provenance, registry-backed media, royalty routing, agent commerce, wallet/payment flows, and published-statement accuracy.

Flag beyond-the-diff risks when related files, defaults, docs, env, or deploy requirements no longer agree.

## Run Gates and Honor Project Rules

Before manual analysis, run the gates the repo already ships and fold results in — typecheck, the configured linter on changed files, the test suite, the dependency auditor when deps changed, and a real secret scanner over the diff. Detect what exists; run only that; never fabricate a result you did not run, and note in Verification when a gate could not run. Then read the repo's own conventions — `CLAUDE.md`, `AGENTS.md`, linter/formatter config, nearest-ancestor rules — and treat them as binding: do not flag what a rule permits, do flag what it forbids, and do not re-raise a pattern the user already accepted.

## Review Modes

- **Fast diff review:** small change, narrow blast radius, focused findings.
- **Deep PR review:** multi-file behavior, public surface, data/auth/payment, release, or cross-repo risk.
- **Plan review:** implementation has not started; inspect scope, sequencing, acceptance criteria, test mapping, missing decisions.
- **Fix verification:** review after fixes; rescan changed files and confirm the original finding is gone.
- **Release review:** validate build, secrets, env, public copy, screenshots, metadata, deployment, and live/API readback.

### Depth Levels

Add a `--depth` modifier:

- **`--quick`** (~2 min): pattern scan — obvious bugs, hardcoded secrets, missing null checks, injection patterns, broken error handling. No cross-file analysis.
- **`--standard`** (default, ~10 min): per-file correctness on changed paths, language traps (below), state handling, test coverage on changed behavior, call graph within changed files.
- **`--deep`** (~25 min): cross-file analysis with full import graph and call-chain tracing — semantic bugs that only appear when you follow data across module boundaries. Use for auth, payments, migrations, and public API changes.

State the depth level at the top of every output.

---

## Step 1 — Instant-F Triggers (check before scoring anything)

Any single match is an automatic **F**. Stop, report the file and line, and do not grade the remaining lanes — the grade cannot be raised by other lanes. This list is the canonical copy; suede-code-grader carries the identical list — change both together.

**Secrets and credentials** — hardcoded API key/secret/token/password in committed source; private key or certificate committed; OAuth/signing secret outside a secret manager.
**Injection** — SQL built by string concatenation with user input; shell command from user input via exec/spawn/eval; template rendered with unescaped user input where XSS is reachable.
**Auth bypass** — auth middleware with a path that skips it (early return, swallowed exception, always-true condition); permission check bypassable via request param; JWT accepting `alg: none` or a hardcoded secret.
**Payment and wallet** — payment handler swallowing errors silently; webhook with no signature verification; amount or recipient from untrusted input without server-side validation.
**Data destruction** — migration with DROP/destructive ALTER, no rollback, no tested restore; bulk delete/update with no WHERE or user-controlled WHERE; cache invalidation that clears production stores with no restore path.
**Plaintext sensitive data** — password stored or logged in plaintext; PII to an unencrypted log/analytics pipeline; SSN/payment card/health data in a non-encrypted field.

## Step 2 — Language Traps

**TypeScript** — `any` where `unknown` + a guard belongs; non-null `!` without a proving guard; non-exhaustive discriminated unions (missing `assertNever`); unsafe `as` casts without a preceding guard; `Object.keys()` without `keyof typeof`; `return someAsyncFn()` that should `await`.

**React** — missing/incomplete `useEffect` deps; stale closures (e.g. `setInterval` in `useEffect(fn, [])` reading state); missing/`index`-as-`key` on `.map()` with identity items; inline object/function props without `useMemo`/`useCallback` in hot paths; prop drilling past 2 levels (P3); state mutation without a setter (`arr.push` on state).

**Next.js** — server/client boundary violations (`'use client'` importing server-only modules, or server files using browser globals); missing `Suspense` around async server components; missing `error.tsx`/`loading.tsx` on user-facing data routes (P2); non-`NEXT_PUBLIC_` secrets reachable in client bundle; uncached `generateMetadata`/`getServerSideProps` external fetches; `next/router` imported in App Router.

**Database (Drizzle/Prisma)** — N+1 queries in loops; missing index on filtered/sorted/join columns; multi-table writes without a transaction; missing unique constraints on logically-unique fields; unbounded selects with no `LIMIT` on growable tables.

**Performance** — new >20 KB minzipped imports (flag with size, prefer tree-shaken); render-blocking `<script>` without `async`/`defer`; non-critical routes not lazy-loaded (`next/dynamic`); raw `<img>` instead of `next/image` for non-SVG assets.

**Swift / iOS** — force `!`/`try!`/`as!` without a proving guard (P1 on runtime-throwing `try!`); escaping closures capturing `self` strongly (need `[weak self]`); UI/`@Published`/`@State` mutation off the main thread; actor reentrancy across suspension points; non-optional `Codable` fields the server may omit; `ForEach` over non-stable `id`; URLSession tasks/observers not cancelled.

**Whole-repo (`--deep`)** — past the changed-file import graph, sweep every caller of a changed symbol across the repo, check shared assumptions (config/defaults/env mirrored elsewhere), `git log -L`/`blame` the touched lines for reintroduced regressions, and confirm the change matches its sibling pattern. Name what you traced.

## Step 3 — OWASP Top 10 (auto-runs on auth/api/middleware/routes or crypto/session/payment imports)

Cite the category in the finding. A01 Broken Access Control (authz at every data access, no horizontal escalation) · A02 Cryptographic Failures (encryption in transit/at rest, no MD5/SHA-1/DES, secrets in env) · A03 Injection (parameterize, escape output) · A04 Insecure Design (assume unauthenticated attacker, designed-in rate limits) · A05 Misconfiguration (changed defaults, safe errors, debug off) · A06 Vulnerable Components (current deps, no CVEs) · A07 Auth Failures (MFA, brute-force protection, session invalidation) · A08 Integrity Failures (protected CI/CD, verified checksums, validated deserialization) · A09 Logging/Monitoring Failures (auth/access/validation failures logged and tamper-protected) · A10 SSRF (URL allowlist, no internal fetches).

## Step 4 — Grade (A-F, runs by default)

Score each lane A-F, then one overall. For non-Suede work, substitute "domain truth" for "Suede truth."

- **Correctness** — behavior, edge cases, error paths, async, routing, data flow, regression risk.
- **Security and permissions** — auth, secrets, payment, wallet, injection, path, SSRF, permission, data exposure fail closed.
- **Data and state** — schemas, migrations, caches, jobs, queues, webhooks, retries, idempotency, state transitions stay consistent.
- **Suede truth** — public copy, rights, provenance, registry-backed media, royalty routing, licensing, agent-commerce, product claims match the implementation.
- **UX and release behavior** — loading, empty, error, success, mobile/native, screenshot, metadata, route states hold together.
- **Tests and verification** — changed behavior has meaningful tests, builds, screenshots, simulator runs, live/API readbacks, or named caveats.
- **Deploy readiness** — env vars, flags, configs, migrations, rollback notes, install paths, docs, release sequencing are clear.

**Grade meaning:** **A** all lanes pass, runtime-verified, no follow-ups. **B** no blockers, named bounded follow-ups. **C** a real defect or unverified risk that could surface in production — recommend hold until fixed. **D** a serious defect likely to cause data loss, auth bypass, broken payments, or user-visible failure — recommend against shipping and, because these are extreme-risk categories, pause and put the ship choice to the user. **F** breaks core behavior, hits an Instant-F, or critical-surface evidence is absent.

**Recommended gate follows the grade, mechanically:** A → `ship`; B → `ship-with-caveats`; C, D, F → `hold`. A Deploy Safety finding (Step 5) also moves the recommended gate to `hold` regardless of grade. The gate is a recommendation the user acts on, not a lock on the agent.

**Grade caps by surface** (state explicitly when they apply):
- **Auth** (login, session, token, middleware, roles) — A needs the bypass/escalation path tested, not just happy path; B needs happy-path + named caveats; else cap **C**.
- **Payment/wallet** (checkout, subscription, refund, payout, transfer, webhook) — A needs error paths tested (failed charge, declined, replay) + server-side amount/recipient validation + no silent swallowing; B needs happy-path + documented error-path risk; else cap **C**.
- **Data migrations** — A needs a documented rollback + restore tested against prod-like data (or justified waiver); B needs a rollback plan, restore untested; no rollback plan caps at **D**.
- **Public API changes** — A needs verified backward-compat or a versioned migration path; breaking with no path caps at **C**.

**Tech debt** — grade impact depends on location, not just pattern. Debt in auth/payment/migration paths is one level stricter (a God object in a payment module is D, not C). Debt in core/high-traffic is standard. Debt in utilities/scripts is flagged as a Required Upgrade but does not lower the overall grade unless it bleeds into a critical path. Do not block a ship on tech debt alone unless it directly obscures a P0/P1 bug. For a named maintainability catalog, load the twelve-smell Design Smell Baseline reference bundled with suede-code-review — same binding rules: repo overrides, judgment-call severity, skip what tooling enforces.

## Step 5 — Deploy Safety Gate (runs at the end, every time)

Grade each pass/conditional/block: **breaking changes** (block if a contract changes with no migration), **rollback safety** (block if `git revert` can't undo it — migrations, charges, sent email, deletes), **blast radius** (state ~0% / ~partial / ~100%), **environment readiness** (block if a required env var isn't in prod yet), **dependency changes** (block on CVE or unpinned prod dep), **data mutations** (block on irreversible writes with no tested restore), **security delta** (block if new attack surface without mitigation), **automation coverage** (block if `.github/workflows/` or equivalent CI does not cover the changed surface, or required checks are not enforced on `main`, in a production-connected repo).

## Step 6 — Commit Dirt Score (runs at the end, every time)

Scan every added (`+`) line of the raw diff for content that must never reach git history, across seven dimensions: **secrets and credentials** (`sk_`, `pk_`, `ghp_`, `xoxb-`, `AKIA`, `-----BEGIN`, `password=`, `secret=`, `token=`, long hex/base64 next to a key-like name) · **debug artifacts** (`console.log`, `debugger`, `binding.pry`, `byebug`, `var_dump(`, `TODO: remove`, `FIXME: before merge`, commented-out real logic) · **conflict markers** (`<<<<<<<`, `=======`, `>>>>>>>`, `|||||||` in a `+` line means the file was never fully resolved) · **accidentally staged files** (`node_modules/`, `.next/`, `dist/`, `build/`, `__pycache__/`, `.DS_Store`, `*.log`, stray lockfiles) · **WIP breadcrumbs** (`[WIP]`, `DO NOT MERGE`, `TEMP:`, `lorem ipsum`/`asdf` in production-facing strings) · **oversized or binary blobs** (files >500 KB, fonts, compiled binaries, media outside a designated assets dir) · **exposed internal references** (internal IPs or hostnames, staging URLs in non-config files, personal email addresses in source).

Rate each dimension `clean | suspicious | dirty` and emit an overall rating: **CLEAN** = no hits; **SUSPICIOUS** = a low-confidence hit that could be a fixture or a doc sample — name it and let the reviewer confirm; **DIRTY** = a high-confidence hit that must be removed before merge, reported as a P0 finding. A `DIRTY` overall rating moves the recommended gate to `hold`, exactly as a Deploy Safety block does.

## Finding Format

Lead with findings, ordered by severity. Group repeated patterns once.

```
[P0] path/to/file.ts:142
Issue: JWT secret falls back to empty string; any token is valid when SECRET is unset.
Fix: process.env.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET required') })()
Verify: set JWT_SECRET="" and curl /api/me — expect 401, currently 200.
OWASP: A02 Cryptographic Failures
Confidence: high
```
P2/P3 get one line each. **Severity:** P0 data loss/security/payment/broken release/unsafe public behavior · P1 likely prod regression, auth bug, broken primary path, false published statement, missing deploy requirement · P2 meaningful edge-case failure, incomplete state, test gap on changed behavior · P3 low-risk improvement, clarity, cleanup. If it can't be tied to a file/route/command/state/behavior, mark it an open question.

## Fix Mode (only on `--fix` or explicit request)

Auto-apply local P2/P3 fixes (single file, no contract change), each as its own commit with the finding ID. Present P0/P1 as confirmed fix briefs before applying — never auto-apply to auth, payment, or data-migration code without explicit confirmation. Re-run the relevant mode on changed files after fixing; cap at 3 cycles, then escalate as a design issue.

## Suede-Specific Checks

Auth/session behavior across app, API, native shells, and server · creator rights/provenance/registry/licensing/royalty/agent-commerce claims match implemented behavior · payment/wallet/x402/checkout/credit flows fail closed · public pages invent no metrics, pricing, partners, testimonials, or release promises · Vercel/account/deploy assumptions match local guidance before prod claims · App Store/iOS screenshots, metadata, privacy answers, and build behavior match the app · migrations, env, flags, cron/jobs, queues, webhooks, secrets are documented and deployable · multi-surface contracts don't drift across web, backend, mobile, sites, docs.

## Intent, Scope, and Precision

Confirm the diff delivers what it claims — map each acceptance criterion to code or a test; unbacked claims are a P1 truth gap — and flag scope creep (unrelated refactors, bundled dep bumps, formatting sweeps that bury the change); recommend splitting an over-large PR. Before emitting, self-check: every finding has a file:line + fix, nothing duplicates a gate's job, low-confidence style notes collapse into one "nitpicks" line, and anything that would not move the ship decision is cut.

**Confidence labels are observable, not vibes:** `high` = reproduced, traced across the call graph, or tied to a named failing input or command; `medium` = read from the code, not executed; `low` = the pattern looks wrong but no input, call path, or runtime state proves it. State the label on every P0/P1 finding; a low-confidence security suspicion is still reportable with its label attached, but a low-confidence *style* observation belongs in the nitpicks line.

## Red Flags — Stop

Catch yourself thinking any of these and re-run the gate you were about to skip:

- "CI is green, so it's fine" — CI that never exercised the changed behavior is not evidence.
- "The diff is small" — small diffs touch auth and payments too; Instant-F triggers run every time.
- "I wrote this, I know it works" — switch into review mode and hunt what your implementation would miss.
- "The author explains the intent well" — intent is not a test, a readback, or a screenshot.
- "It was hard work, round up to B" — effort never moves a grade; evidence does.
- "Skip the deploy gate, it's just a copy change" — Step 5 runs at the end, every time.

## Output Shape

Lead with a **Simple explanation (plain, for a 10-year-old)** — one plain-English paragraph a 10-year-old follows: did it pass, and the single biggest reason. Then:

```text
Findings           (by severity, with evidence + fix)
Code Grade         (7 lanes A-F + overall, grade cap if any, why, required upgrades)
Deploy Safety      (the 8 dimensions + verdict)
Commit Dirt        (7 dimensions + CLEAN | SUSPICIOUS | DIRTY)
Open Questions
Verification       (checked / not checked)
SHIP GATE: hold | ship-with-caveats | ship — [one sentence naming the blocker or caveat]
```

For no findings, say so clearly and name any residual risk or unrun checks. Do not invent tests, screenshots, live checks, or deploy status. To revise a grade, name what changed; to bank a pattern, name what worked; silence = accepted.

## Worked Example

A complete pass on one change — findings, lane scores, grade, and deploy gate — is in
`references/worked-example.md`. Read it when you are calibrating a grade and want
to see how the lanes resolve on a real diff, not on every run.

## --threat-verify Mode

Checks that mitigations declared in a threat model (an ADR threat table, a PLAN.md risk section, or free-form "Threat: X / Mitigation: Y" pairs) are actually implemented, classifying each as CLOSED / OPEN / UNREGISTERED into a THREAT-REVIEW.md table. It does not hunt new vulnerabilities — that is the OWASP lane's job. The full procedure and output shape are in `references/threat-verify.md`: read it when the caller passes `--threat-verify` or asks you to verify threat mitigations or check threat-model compliance, and not on an ordinary review.

## Boundaries

- Preserve user and other-agent WIP. Do not stage, revert, or rewrite unrelated files.
- Do not invent tests, screenshots, live checks, deploy status, or gate results you did not run.
- Never auto-apply a fix to auth, payment, or data-migration code without explicit user confirmation; P0/P1 fixes are presented as briefs first.
- Do not block on style preferences that a formatter, the type checker, or a documented project rule already governs, and do not raise a grade for effort or for CI that never exercised the changed behavior.

## Routing

- Findings-only, with Accessibility and SEO lanes → **suede-code-review**
- The letter grade alone, no findings → **suede-code-grader**
- Verdict delivered; make CI enforce it on every merge → **suede-ci-gate**
- The diff ships AI behavior with no eval coverage → **suede-ai-eval**
- Fixes span multiple coordinated lanes → **suede-agent-teams**
- Completion-claim law for saying a fix is done, live, merged, or ready →
  private Suede Labs companion, not in this pack: suede-verification-law
