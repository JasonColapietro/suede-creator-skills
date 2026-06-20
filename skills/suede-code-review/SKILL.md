---
name: suede-code-review
description: "Full-context code review for any codebase or PR — behavior bugs, regressions, security, tests, release gaps, and fix briefs with P0/P1/P2/P3 severity ranking. Especially thorough on auth, payments, public claims, shared components, and multi-surface contracts."
---

# Suede Code Review

Use this skill to review Suede code like a production reviewer with full
context, not a diff-only lint pass. The goal is to catch real breakage, rank it
by impact, and turn findings into fixable work.

## Operating Stance

- Review current source, current diff, local docs, and relevant runtime behavior.
- Keep code generation and review separate by default. If you authored the code,
  switch into review mode and look for what your implementation would miss.
- Preserve user and other-agent WIP. Do not stage, revert, or rewrite unrelated
  files.
- Prefer high-signal findings over volume. Do not leave style nits when formatters
  or local conventions already handle them.
- Every blocking finding needs evidence, impact, and a concrete fix path.

## Review Contract

Before review, identify:

- target: repo, branch, PR, commit range, diff, route, API, or release build;
- intent: what the change claims to accomplish;
- source truth: task docs, local agent guidance, product docs, linked issue, or
  user instruction;
- risk lanes: frontend, backend, data, auth, payments, contracts, iOS, release,
  public copy, analytics, secrets, deployment, and docs;
- done signal: findings report, inline comments, fix briefs, test commands,
  screenshots, live/API readback, or merge recommendation.

Use this output status:

- `hold`: a blocker or high-risk unknown remains.
- `ship-with-caveats`: no blocker remains, but named non-critical caveats exist.
- `ship`: no known blocker remains and required verification passed.

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
   media, royalty routing, agent commerce, wallet/payment flows, and public
   claim truth.

Flag beyond-the-diff risks when related files, defaults, docs, env, or deploy
requirements no longer agree.

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
- **`--standard`** (default, ~10 min): Per-file analysis with language-specific
  checks. Correctness, security, state handling, test coverage on changed
  behavior. Call graph within changed files. Use for most PRs.
- **`--deep`** (~25 min): Cross-file analysis including full import graph and
  call chain tracing. Finds semantic bugs that only appear when you follow data
  across module boundaries. Use for auth changes, payment flows, data
  migrations, and public API changes.

State depth level at the top of every review output.

## Agent Team Review

For major changes, run the review as separate lanes:

- **Change mapper:** summarizes what changed and which systems are touched.
- **Runtime critic:** hunts execution failures, state drift, race conditions,
  error paths, and deploy prerequisites.
- **Security critic:** reviews auth, secrets, permissions, injection, SSRF,
  payment safety, wallet flows, and data exposure.
- **Product critic:** checks feature truth, Suede positioning, user-visible
  behavior, empty/error states, and release claims.
- **Test critic:** maps claims to tests, screenshots, simulator runs, builds,
  and live/API checks.

Collect consensus first. Keep divergent concerns when they are plausible and
impactful. If high-severity concerns persist after a fix cycle, keep status at
`hold` and name the smallest next check or patch.

## Suede A-F Code Grade

For important code, MCP, plugin, public-site, or release-bound changes, include
an A-F code grade after findings. The grade is not a lint score. It is a ship
risk summary tied to evidence.

Grade each lane:

- **Correctness:** the changed behavior works for the intended path and likely
  edge cases.
- **Security and permissions:** auth, secrets, payment, wallet, injection, path,
  and data exposure risks fail closed.
- **Data and state:** schemas, migrations, caches, jobs, webhooks, retries, and
  state transitions stay consistent.
- **Suede truth:** rights, provenance, registry, royalty, agent-commerce, public
  copy, and product claims match implemented behavior.
- **UX and release behavior:** user-visible states, mobile/native shells,
  metadata, screenshots, links, and public routes hold together.
- **Tests and verification:** changed behavior has meaningful tests, builds,
  screenshots, simulator runs, live/API readbacks, or documented caveats.
- **Deploy readiness:** env vars, feature flags, configs, docs, install paths,
  and rollback expectations are clear.

Grade meaning:

- **A:** ship and use as a reference for similar work.
- **B:** ship-with-caveats; no blocker, but named follow-ups remain.
- **C:** hold until focused fixes land and the weak lanes are rechecked.
- **D:** hold; serious production, release, security, or claim risk remains.
- **F:** do not ship; core behavior, safety, or source truth is broken.

Output:

```text
Code grade:
Correctness: A-F
Security and permissions: A-F
Data and state: A-F
Suede truth: A-F
UX and release behavior: A-F
Tests and verification: A-F
Deploy readiness: A-F
Overall: A-F
Why:
Required upgrades:
```

## Finding Format

Lead with findings, ordered by severity.

```text
P0/P1/P2/P3 - Title
File/route:
Evidence:
Impact:
Fix:
Verification:
Confidence:
```

Severity:

- **P0:** data loss, security exposure, payment loss, broken release, or public
  behavior that must not ship.
- **P1:** likely production regression, auth/permission bug, broken primary
  path, false public claim, or missing critical deploy requirement.
- **P2:** meaningful edge-case failure, incomplete state handling, test gap on
  changed behavior, or maintainability issue with real cost.
- **P3:** low-risk improvement, clarity issue, local cleanup, or follow-up.

Avoid vague findings. If the issue cannot be tied to a file, route, command,
state, or user-visible behavior, mark it as an open question instead.

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

1. Apply P2 and P3 findings automatically where the fix is unambiguous and
   narrow.
2. Present P0 and P1 findings as confirmed fix briefs before applying — do not
   auto-apply to production-critical, auth, payment, or data-migration code
   without explicit user confirmation.
3. After applying fixes, re-run the relevant review mode on only the changed
   files. Mark original findings as resolved or escalated.
4. Cap the iteration loop at 3 cycles. If the same finding persists after 3 fix
   attempts, escalate as a design issue requiring human decision.

## OWASP Top 10 Security Checklist (2021)

For any code touching auth, API, data input, or public-facing routes, check
these:

- **A01 Broken Access Control**: Are authorization checks present at every data
  access? Are admin routes protected? Does the code prevent horizontal privilege
  escalation (user A accessing user B's data)?
- **A02 Cryptographic Failures**: Is sensitive data encrypted at rest and in
  transit? Are deprecated algorithms (MD5, SHA-1, DES) used? Are secrets in
  environment variables, not source?
- **A03 Injection**: Is all user input parameterized before reaching SQL, shell
  commands, LDAP, XML, or template engines? Is output escaped before rendering
  in HTML?
- **A04 Insecure Design**: Does the architecture assume the attacker is
  unauthenticated? Are rate limits designed in, not bolted on?
- **A05 Security Misconfiguration**: Are defaults changed? Is directory listing
  disabled? Are error messages safe (no stack traces to users)? Is debug mode
  off in production?
- **A06 Vulnerable Components**: Are dependencies current? Are known CVEs
  present? Are unused packages removed?
- **A07 Identification and Authentication Failures**: Is MFA available for
  sensitive actions? Are brute-force protections present? Are sessions
  invalidated on logout?
- **A08 Software and Data Integrity Failures**: Are CI/CD pipelines protected?
  Are package checksums verified? Are deserialized inputs validated?
- **A09 Security Logging and Monitoring Failures**: Are auth failures, access
  control failures, and input validation failures logged? Are logs protected
  from tampering?
- **A10 SSRF**: Are URL inputs validated against an allowlist? Can the server be
  tricked into fetching internal network resources?

For each relevant finding, cite the OWASP category.

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

## Technical Debt Indicators

Flag (as P3 unless they introduce active risk) these patterns:

- **Magic numbers/strings**: constants with no name or explanation that appear
  in logic.
- **God objects/functions**: a single function or class doing 5+ unrelated
  things.
- **Deep coupling**: code that reaches across 3+ abstraction layers to access
  internals.
- **Missing abstraction**: the same 20-line block duplicated in 3+ places.
- **Leaky abstraction**: a module that requires callers to know its internal
  implementation details to use it correctly.
- **Implicit state**: program behavior depends on hidden global or module-level
  state.
- **Dead code**: functions, branches, or imports that can never be reached.

Do not block a ship on P3 tech debt unless it directly obscures a P0/P1 bug.
File it as follow-up.

## Noise Rules

- Do not repeat the same issue across many files; group it once with examples.
- Do not comment on formatting already enforced by tools.
- Do not block on personal taste.
- Do not ask for tests that do not match the risk.
- Do not approve a change because CI passed if the changed behavior was not
  exercised.

## Output Shape

For a review:

```text
Findings
Code Grade
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

Keep the final recommendation blunt: `ship`, `ship-with-caveats`, or `hold`.
