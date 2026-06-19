---
name: suede-code-review
description: Suede-owned full-context code review, PR review, pre-merge review, release gate, security sweep, architecture critique, cross-file regression hunt, and fix-brief workflow. Use for Suede changes that touch production behavior, auth, payments, rights/provenance, registry systems, royalty routing, agent commerce, App Store/iOS release paths, dashboards, APIs, public copy claims, shared components, or multi-repo contracts.
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
