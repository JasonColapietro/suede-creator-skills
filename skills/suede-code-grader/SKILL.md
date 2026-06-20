---
name: suede-code-grader
description: Get a blunt A-F ship verdict on any code change. 7 evidence-backed lanes, 10+ instant-F triggers, grade caps for auth and payment surfaces, and example situations for every grade level. Use when you need a direct grade, not a full review.
---

# Suede Code Grader

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
- public claims, rights/provenance claims, payment/wallet behavior, registry
  expectations, royalty routing, and agent-commerce contracts when relevant.

If live, test, or runtime checks are not practical, grade the source and mark those lanes as unverified.

## Instant-F Triggers

Check these before scoring any lane. Any single match is an automatic F — no other lanes matter until it is fixed.

**Secrets and credentials**
- Hardcoded API key, secret, token, or password in source (not .env, not config — in the actual committed file)
- Private key or certificate committed to repo
- OAuth client secret or signing secret in any non-secret-manager location

**Injection**
- SQL query built by string concatenation with user-controlled input (no parameterization, no ORM escaping)
- Shell command assembled from user input via exec/spawn/eval
- Template rendered with unescaped user input where XSS is reachable

**Auth bypass**
- Middleware that checks auth but has a code path that skips it (early return, exception swallowed, condition that always resolves to "authenticated")
- Role or permission check that can be bypassed by manipulating a request parameter
- JWT verified with `alg: none` accepted or with the secret hardcoded in source

**Payment and wallet**
- Payment handler that swallows errors silently (try/catch with empty catch, unhandled promise rejection)
- Webhook handler with no signature verification
- Amount or recipient derived from untrusted user input without server-side validation

**Data destruction**
- Migration with a DROP or destructive ALTER with no rollback and no tested restore
- Bulk delete or update with no WHERE clause or with user-controlled WHERE
- Cache invalidation that clears production data stores without a restore path

**Plaintext sensitive data**
- Password stored or logged in plaintext
- PII written to an unencrypted log or analytics pipeline
- SSN, payment card, or health data in a non-encrypted column or field

If any Instant-F pattern is present: stop, report it, mark the grade F, list the specific file and line, and do not grade remaining lanes. The grade cannot be raised by other lane performance.

## Grade Lanes

Score each lane A-F, then give one overall grade. When grading non-Suede work, substitute "domain truth" for "Suede truth" — use whatever domain invariants apply (API contract truth, public claim truth, data model truth).

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
- **D:** A serious defect exists that is likely to cause data loss, auth bypass, broken payments, or a user-visible production failure. Do not ship until the defect is fixed and verified. Example: missing auth check on a state-changing endpoint; migration with no tested rollback on a high-traffic table; payment flow that silently swallows errors.
- **F:** Do not ship. The change breaks core behavior, introduces an Instant-F pattern, or verification evidence is absent for a critical surface. Example: hardcoded API key in source, SQL injection via string concatenation, auth middleware that can be bypassed, or a payment handler with zero test coverage and no live readback.

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

Grade impact depends on where the debt lives, not just what it is:

- Debt in **auth, payment, or data migration paths**: one level stricter. A God object in a payment module is D (not C); a missing abstraction in a payment flow with 3+ duplicated branches is C (not B).
- Debt in **core business logic or high-traffic routes**: standard scale below.
- Debt in **utility helpers, scripts, or low-traffic internals**: flag it, record it as a Required Upgrade, but do not lower the overall grade unless it bleeds into a critical path.

Apply grade impact:

- Debt that actively impairs correctness or masks a real bug: D in that lane.
- Debt that creates meaningful maintenance risk in the changed area: C in that lane.
- Debt present but bounded with a named, tracked follow-up: B in that lane.

**Debt severity by location — concrete examples:**

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

To revise this grade: name what changed.
To bank a pattern: name what worked so it can be reused.
Silence = accepted.

## Boundaries

- Do not block on style preferences unless they create real maintenance, behavior, accessibility, release, or product-risk cost.
- Do not invent tests, screenshots, live checks, deploy status, or public claim evidence.
- Do not ship a C, D, or F without naming the required upgrade that would move the grade.
- Keep the grade independent. Do not raise a grade because the implementation was hard, because CI passed without exercising the changed behavior, or because the author explains the intent well.
