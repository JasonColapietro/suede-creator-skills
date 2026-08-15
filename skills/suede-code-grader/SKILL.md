---
name: suede-code-grader
description: "Suede Labs AI blunt A-F ship grade for a code change across correctness, security and permissions, data and state, domain truth, UX and release behavior, tests and verification, and deploy readiness, with Instant-F triggers and evidence-based grade caps on auth, payment, migration, and public-API surfaces. Use when asked to grade this, give it a letter, is this an A, how ready is this to ship, or should this merge — when the caller wants the verdict without a findings list. NOT FOR: findings, evidence, and fix briefs (use suede-code-review, or suede-code for findings plus grade); enforcing the verdict in CI (use suede-ci-gate); eval coverage for AI behavior (use suede-ai-eval)."
---

# Suede Code Grader

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


Blunt A-F read on whether code is ready to ship. The output is a grade with evidence, not a lint score or a pile of style notes.

## Source Truth

Read before grading. Do not grade from the PR description or commit message alone.

Inspect:

- repo, branch, remote, dirty state, and relevant local guidance;
- diff, changed files, generated files, and touched routes or APIs;
- imports, callers, schemas, configs, env requirements, jobs, webhooks, scripts,
  tests, and docs that move with the change;
- build, test, lint, typecheck, browser, simulator, MCP, or live/API evidence
  that directly exercises the changed behavior;
- published statements, rights/provenance claims, payment/wallet behavior, registry
  expectations, royalty routing, and agent-commerce contracts when relevant.

If live, test, or runtime checks are not practical, grade the source and mark those lanes as unverified.

**Gate evidence is a command, not an impression.** Run what the repo already ships and cite the command and its exit status: the typecheck, the configured linter on changed files, the test suite, and — for a release grade — the production build. For per-stack syntax (web/Node, MCP server, iOS/Swift, generic API), use the Gate Commands by Stack table in **suede-code-review** rather than inventing a command. Detect what exists and run only that; never introduce a tool the repo does not use, and never report a gate result you did not execute.

## Instant-F Triggers

Check these before scoring any lane. Any single match is an automatic F — no other lanes matter until it is fixed. This list mirrors suede-code's canonical Step 1 list — change both together.

**Secrets and credentials** — hardcoded API key/secret/token/password in committed source; private key or certificate committed; OAuth/signing secret outside a secret manager.
**Injection** — SQL built by string concatenation with user input; shell command from user input via exec/spawn/eval; template rendered with unescaped user input where XSS is reachable.
**Auth bypass** — auth middleware with a path that skips it (early return, swallowed exception, always-true condition); permission check bypassable via request param; JWT accepting `alg: none` or a hardcoded secret.
**Payment and wallet** — payment handler swallowing errors silently; webhook with no signature verification; amount or recipient from untrusted input without server-side validation.
**Data destruction** — migration with DROP/destructive ALTER, no rollback, no tested restore; bulk delete/update with no WHERE or user-controlled WHERE; cache invalidation that clears production stores with no restore path.
**Plaintext sensitive data** — password stored or logged in plaintext; PII to an unencrypted log/analytics pipeline; SSN/payment card/health data in a non-encrypted field.

If any Instant-F pattern is present: stop, report it, mark the grade F, list the specific file and line, and do not grade remaining lanes. The grade cannot be raised by other lane performance.

## Grade Lanes

Score each lane A-F, then give one overall grade. When grading non-Suede work, substitute "domain truth" for "Suede truth" — use whatever domain invariants apply (API contract truth, published-statement accuracy, data model truth).

- **Correctness:** intended behavior, edge cases, error paths, async behavior,
  routing, data flow, and regression risk.
- **Security and permissions:** auth, secrets, payment, wallet, injection, path,
  SSRF, permission, and data exposure risks fail closed.
- **Data and state:** schemas, migrations, caches, jobs, queues, webhooks,
  retries, idempotency, and state transitions stay consistent.
- **Suede truth:** public copy, rights, provenance, registry-backed media,
  royalty routing, licensing, agent-commerce, and product claims match the
  implementation.
- **UX and release behavior:** loading, empty, error, success, mobile/native,
  screenshot, metadata, route, and user-visible states hold together.
- **Tests and verification:** changed behavior has meaningful tests, builds,
  screenshots, simulator runs, MCP checks, live/API readbacks, or named caveats.
- **Deploy readiness:** env vars, feature flags, configs, migrations, rollback
  notes, install paths, docs, and release sequencing are clear.

## Grade Meaning

- **A:** All lanes pass. Behavior is verified at runtime. No known follow-ups. Example: new feature with unit + integration tests, live readback confirmed, env vars documented, rollback is trivial.
- **B:** No blockers. One or more lanes have named, bounded follow-ups that do not affect correctness or safety in the current release. Example: happy-path tested but edge-case coverage is thin; or migration is forward-only but rollback risk is low and documented.
- **C:** At least one lane has a real defect or unverified risk that could surface in production but is not immediately catastrophic. Hold until that lane is fixed and rechecked. Example: auth path not fully tested; or a data migration with no rollback plan on a low-traffic table; or a God object in a payment module that obscures correctness.
- **D:** A serious defect exists that is likely to cause data loss, auth bypass, broken payments, or a user-visible production failure. Recommend not shipping until the defect is fixed and verified, and because these are extreme-risk categories, pause and put the choice to the user before any ship step. Example: missing auth check on a state-changing endpoint; migration with no tested rollback on a high-traffic table; payment flow that silently swallows errors.
- **F:** Strongly recommend against shipping. The change breaks core behavior, introduces an Instant-F pattern, or verification evidence is absent for a critical surface. Example: hardcoded API key in source, SQL injection via string concatenation, auth middleware that can be bypassed, or a payment handler with zero test coverage and no live readback.

## Grade Caps by Surface Type

Certain surfaces cannot receive A or B without specific evidence beyond passing CI.

**Auth changes** (login, session, token validation, middleware, role assignment, permission checks)
- A requires: explicit test coverage for the bypass/escalation path, not just the happy path. Named evidence (e.g., "tested with expired token returns 401", "role escalation attempt returns 403").
- B requires: happy-path tested plus named caveats on what is not tested.
- If neither condition is met: cap at C regardless of other lane performance.

**Payment and wallet flows** (checkout, subscription, refund, payout, wallet transfer, webhook)
- A requires: error path tested (failed charge, declined card, webhook replay), amount/recipient validated server-side, and no silent error swallowing.
- B requires: happy-path tested, error paths documented as follow-ups with named risk.
- If neither: cap at C.

**Data migrations** (schema changes, backfills, column drops, index changes on production tables)
- A requires: rollback plan documented, restore tested against a copy of production data (or explicitly waived with justification for low-risk/reversible migrations).
- B requires: rollback plan exists but restore is untested.
- If no rollback plan exists: cap at D.

**Public-facing API changes** (new endpoints, breaking changes, removed fields, changed auth)
- A requires: backward compatibility verified or explicit version bump with documented migration path.
- If breaking change with no migration path: cap at C minimum.

State these caps explicitly in the output when they apply.

## Technical Debt Indicators

Flag these patterns as part of the grade assessment:

- **Magic numbers/strings**: constants with no name or explanation that appear in logic.
- **God objects/functions**: a single function or class doing 5+ unrelated things.
- **Deep coupling**: code that reaches across 3+ abstraction layers to access internals.
- **Missing abstraction**: the same 20-line block duplicated in 3+ places.
- **Leaky abstraction**: a module that requires callers to know its internal implementation details to use it correctly.
- **Implicit state**: program behavior depends on hidden global or module-level state.
- **Dead code**: functions, branches, or imports that can never be reached.

**Grade impact depends on where the debt lives, not just what it is:**

| Pattern | Location | Grade Impact |
|---|---|---|
| God object (5+ unrelated concerns) | Payment module | D in Correctness |
| God object | Utility helper | B in Correctness |
| Missing abstraction (3+ duplicated blocks) | Auth flow | C in Security |
| Missing abstraction | UI component | B in Correctness |
| Deep coupling (3+ layer reach) | Data migration | C in Data and state |
| Implicit global state | API route handler | C in Correctness |
| Dead code | Any | Flag only; no grade impact unless it shadows live code |
| Magic numbers in payment amounts | Payment flow | C in Correctness |
| Magic numbers in UI spacing | UI component | No grade impact; flag as P3 |

Do not block a ship on tech debt alone unless it directly obscures a P0/P1 bug. Name the debt in Required Upgrades and let the overall grade reflect it.

## Red Flags — Stop

- "CI passed, round up" — CI that never exercised the changed behavior raises nothing.
- "The work was clearly hard" — effort never moves a grade; evidence does.
- "It's just a refactor" — Instant-F triggers run on every grade, every time.
- "Happy path works, call it an A" — the grade caps exist because happy paths are never where the risk lives.
- "The PR description is clear enough" — grade the diff and its evidence, or mark the lane unverified.

## Output Format

```text
Simple explanation:
Plain-language summary of the grade and the one biggest reason.

Usual breakdown:
Target:
Change reviewed:
Runtime surfaces:

Grades:
Correctness: A-F
Security and permissions: A-F
Data and state: A-F
Suede truth: A-F
UX and release behavior: A-F
Tests and verification: A-F
Deploy readiness: A-F
Overall: A-F
Grade cap applied: [surface type] — [what evidence would lift the cap] | none

Why:
Evidence-backed explanation of why the overall grade landed there.

Required upgrades:
1. Highest-impact fix.
2. Second fix.
3. Third fix.

Verification:
Checked:
Not checked:
Ship gate: ship | ship-with-caveats | hold
```

Ship gate follows the overall grade, mechanically: A → `ship`; B → `ship-with-caveats`; C, D, F → `hold`.

To revise this grade: name what changed.
To bank a pattern: name what worked so it can be reused.
Silence = accepted.

## Boundaries

- Do not block on style preferences unless they create real maintenance, behavior, accessibility, release, or product-risk cost.
- Do not invent tests, screenshots, live checks, deploy status, or evidence for published statements.
- Never report a C, D, or F without naming the required upgrade that would move the grade.
- Keep the grade independent. Do not raise a grade because the implementation was hard, because CI passed without exercising the changed behavior, or because the author explains the intent well.

## Worked Example

One change graded end to end, showing how lanes combine into the overall letter, is
in `references/worked-example.md`. Read it when a grade feels borderline and you
need to see the lane arithmetic on a real case.

## Routing

- Findings and fix briefs behind the grade → **suede-code** (combined) or **suede-code-review** (findings only, plus Accessibility/SEO lanes)
- Grade is C or below and the repo has no merge gate → **suede-ci-gate**
- The change ships AI behavior with no eval coverage → **suede-ai-eval**
- The change touches an MCP server, its catalog, or its tool/resource/prompt definitions → **suede-mcp-qa** for the live protocol suite before the grade counts as verified
