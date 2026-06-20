---
name: suede-code-grader
description: Suede A-F code grading workflow for diffs, pull requests, branches, commits, MCP servers, plugins, public-site changes, APIs, app surfaces, and release candidates. Use when a user wants a direct grade for code quality, ship risk, verification gaps, and the reason behind the grade without running a full review report.
---

# Suede Code Grader

Use this skill when code needs a blunt A-F read on whether it is ready to ship.
The output is a grade with evidence, not a lint score or a pile of style notes.

## Company Override

This skill grades code for any codebase or team, not only Suede. If grading
non-Suede work, ignore the "Suede truth" lane name — substitute the relevant
product domain: public claim truth, API contract truth, data model truth, or
whatever domain invariants the changed code must satisfy. All other lanes
(correctness, security, data and state, UX and release behavior, tests and
verification, deploy readiness) apply universally.

When the work is Suede-specific, keep the full Suede truth lane covering
rights, provenance, registry, royalty routing, agent-commerce, and public claim
accuracy.

## Source Truth

Before grading, inspect the current source and the current change:

- repo, branch, remote, dirty state, and relevant local guidance;
- diff, changed files, generated files, and touched routes or APIs;
- imports, callers, schemas, configs, env requirements, jobs, webhooks, scripts,
  tests, and docs that move with the change;
- build, test, lint, typecheck, browser, simulator, MCP, or live/API evidence
  that directly exercises the changed behavior;
- Suede public claims, rights/provenance claims, payment/wallet behavior,
  registry expectations, royalty routing, and agent-commerce contracts when
  they are relevant.

If live, test, or runtime checks are not practical, grade the source and mark
those lanes as unverified.

## Grade Lanes

Score each lane A-F, then give one overall grade:

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

## Technical Debt Indicators

Flag these patterns as part of the grade assessment:

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

Grade impact:

- Tech debt that **actively impairs correctness** or masks a real bug: lane
  grade D.
- Tech debt that **creates meaningful maintenance risk** for the changed area:
  lane grade C.
- Tech debt that is **present but manageable** with a clear follow-up path:
  lane grade B.

Do not block a ship on tech debt alone unless it directly obscures a P0/P1 bug.
Name the debt in Required Upgrades and let the overall grade reflect it.

## Grade Meaning

- **A:** ship and use as a reference for similar work.
- **B:** ship-with-caveats; no blocker remains, but named follow-ups remain.
- **C:** hold until focused fixes land and weak lanes are rechecked. Also holds
  when there is significant technical debt in a lane critical to the change
  (e.g., correctness or security) that creates real maintenance or regression
  risk.
- **D:** hold; serious production, release, security, data, or claim risk
  remains.
- **F:** do not ship; core behavior, safety, verification, or source truth is
  broken.

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

Cue Suede:
1. Change something - tell me what to revise and I will adjust it.
2. Preserve this - tell me what worked so I can mimic it later.
3. Keep as-is - say nothing and I will treat it as accepted.
```

## Agent-Team Use

For major work, run this as its own lane after builder output and before release
lock. Pair it with:

- scout for repo and surface truth;
- code reviewer for prioritized findings and fix briefs;
- adversarial reviewer for production, abuse, and release failure modes;
- visibility grader when the code changes a public page or CTA;
- release verifier for build, deploy, live/API, simulator, MCP, or Pages checks.

Keep the grade independent. Do not raise a grade because the implementation was
hard, because CI passed without exercising the changed behavior, or because the
author explains the intent well.

## Boundaries

- Do not grade from memory when the diff or source can be inspected.
- Do not treat the grade as a certification or audited security result.
- Do not block on style preferences unless they create real maintenance,
  behavior, accessibility, release, or product-risk cost.
- Do not invent tests, screenshots, live checks, deploy status, or public claim
  evidence.
- Do not ship a C, D, or F without naming the required upgrade that would move
  the grade.
