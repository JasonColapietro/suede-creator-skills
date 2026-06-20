---
name: suede-code-review
description: "Catches production regressions, security holes, and TS/React/Next.js-specific traps, ranked P0-P3 with one-line fixes. Full-context review: changed files, callers, contracts, deploy surface."
---

# Suede Code Review

Review code with full context: changed files, callers, contracts, deploy surface. Find real breakage. Rank by production impact. Every finding has a file, evidence, and a fix path. No findings without evidence. No volume without signal.

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
- risk lanes: frontend, backend, data, auth, payments, contracts, iOS, release,
  public copy, analytics, secrets, deployment, and docs.

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
- **`--standard`** (default, ~10 min): Per-file analysis: correctness on changed paths, language-specific traps (see checklists below), state handling, test coverage on changed behavior, call graph within changed files. Default for all PRs unless the user says otherwise.
- **`--deep`** (~25 min): Cross-file analysis including full import graph and
  call chain tracing. Finds semantic bugs that only appear when you follow data
  across module boundaries. Use for auth changes, payment flows, data
  migrations, and public API changes.

State depth level at the top of every review output.

## TypeScript Traps

Check these on every TypeScript file in the diff:

- **`any` vs `unknown`:** `any` disables type checking for everything downstream. If the type is truly unknown at the call site, use `unknown` and narrow with a type guard. Flag every `any` annotation that isn't in a third-party type shim.
- **Non-null assertions (`!`):** Each `foo!.bar` is a runtime crash waiting for the condition that makes `foo` null. Flag unless the null case is provably eliminated by a guard two lines above.
- **Missing discriminated unions:** When a function returns `{ type: 'a', ... } | { type: 'b', ... }`, the switch/if must be exhaustive. Missing `default: assertNever(x)` is a silent future bug.
- **Unsafe casts (`as Foo`):** A cast without a preceding type guard means "trust me." Flag every `as` that isn't a DOM cast (`as HTMLInputElement`) or a narrow type refinement proven by the preceding condition.
- **`Object.keys()` without `keyof typeof`:** `Object.keys(obj).forEach(k => obj[k])` fails type checking silently at runtime when keys are typed. Require `(Object.keys(obj) as Array<keyof typeof obj>)` or a typed `Object.entries()`.
- **`Promise` without `await` in an `async` function:** Returns the Promise object instead of the resolved value. Flag any `return someAsyncFn()` inside an `async` that should `return await someAsyncFn()`.

## React Traps

Check these on every React component or hook in the diff:

- **Missing `useEffect` dependency array:** `useEffect(fn)` (no array) runs on every render. `useEffect(fn, [])` runs once. `useEffect(fn, [dep])` runs when dep changes. Flag any effect where the deps array is absent or obviously incomplete (function references, object literals, values used inside the effect but not listed).
- **Stale closures:** An effect or callback captures a value at mount time and never re-captures it. Most common pattern: a `setInterval` inside `useEffect(fn, [])` that reads a stateful value. The fix is either adding the dep or using a ref.
- **Missing `key` props:** Any `.map()` returning JSX elements must have a stable, unique `key`. Using array index as key is a bug when the list can reorder or filter. Flag index-keyed lists where items have identity (id, slug, etc.).
- **Unnecessary re-renders:** Flag components that receive object or function props without `useMemo`/`useCallback` when those objects are created inline in the parent render. Flag components that could be wrapped in `React.memo` but aren't, when rendered in tight loops or high-frequency update paths.
- **Prop drilling past 2 levels:** If a prop is passed through 2+ components without being used at intermediate levels, flag as P3. The fix is context, Zustand, or component composition. Note which fits the existing pattern in this repo.
- **State mutation without setter:** `arr.push(item)` on state does not trigger a re-render. Flag any direct mutation of state variables.

## Next.js Traps

Check these on every Next.js file in the diff:

- **Server/client boundary:** Any file with `'use client'` cannot import server-only modules (DB clients, `fs`, `crypto`, server-side env vars). Any file without `'use client'` that uses `useState`, `useEffect`, browser globals (`window`, `document`), or event handlers is a runtime crash. Flag the mismatch, not just the symptom.
- **Missing `Suspense` boundary:** Async server components that fetch data and are rendered inside a client component tree need a `<Suspense fallback={...}>` wrapper. Missing boundaries cause the entire parent tree to suspend without a fallback.
- **Missing `error.tsx` / `loading.tsx`:** Any new route segment that fetches data or can throw should have both. Flag their absence as P2 when the route is user-facing.
- **Server-only secrets in client bundle:** `process.env.SECRET_KEY` in a `'use client'` file or in a prop passed from server to client component is exposed in the browser bundle. Only `NEXT_PUBLIC_*` vars are safe client-side. Flag any non-`NEXT_PUBLIC_` env var referenced in client code.
- **Unguarded `generateMetadata` / `getServerSideProps` fetches:** These run on every request. An uncached external fetch here is a latency and cost bomb. Flag missing `{ next: { revalidate: N } }` or `unstable_cache` wrapping.
- **`useRouter` from `next/router` in App Router:** App Router uses `next/navigation`. Importing from `next/router` in an App Router project silently fails or returns stale data. Flag the wrong import.

## Database Traps (Drizzle / Prisma)

Check these on any file that touches DB queries:

- **N+1 queries:** A loop that issues a query per iteration. The fix is a single query with `WHERE id IN (...)` or a join. Flag any `.map()` or `for` loop that calls `db.query()`, `prisma.find*()`, or `db.select()` inside the body.
- **Missing index on filtered/sorted columns:** Any `WHERE`, `ORDER BY`, `GROUP BY`, or join condition on a column that isn't indexed is a full-table scan. Flag new query predicates on columns with no corresponding index in the migration/schema.
- **Multi-table writes without transactions:** Two or more `INSERT`/`UPDATE`/`DELETE` calls that must succeed or fail together. Flag any multi-table write that isn't wrapped in `db.transaction()` / `prisma.$transaction()`.
- **Missing unique constraints:** Fields that are logically unique (user email, slug, external ID) but lack a `UNIQUE` constraint are race-condition bugs at scale. Flag schema definitions where uniqueness is enforced in application code but not the DB.
- **Unbounded queries:** `db.select().from(table)` with no `LIMIT` on a user-facing route is a DoS vector and a cost spike. Flag selects with no limit when the table can grow.

## Performance Flags

- **Large dependency import:** Any new `import` of a package not already in the bundle. If the package's minzipped size is >20 KB, flag as P3 with the size estimate. Prefer tree-shaken imports (`import { X } from 'pkg'` not `import pkg from 'pkg'`).
- **Render-blocking scripts:** `<script src="...">` without `async` or `defer` in HTML head blocks page paint. Flag in any HTML template or `_document.tsx`.
- **Missing lazy loading for non-critical routes:** Any page-level component imported with a static `import` at the top of `_app.tsx` or a layout file when it could be `next/dynamic` with `ssr: false`. Flag routes not in the critical path (settings pages, dashboards, modals).
- **Images without `next/image`:** `<img src="...">` bypasses Next.js image optimization. Flag raw `<img>` tags in Next.js files pointing to non-SVG assets.

## Agent Team Review (--deep only)

For `--deep` reviews on auth changes, payment flows, data migrations, or public API changes, run as separate lanes:

- **Change mapper:** summarizes what changed and which systems are touched.
- **Runtime critic:** hunts execution failures, state drift, race conditions, error paths, and deploy prerequisites.
- **Security critic:** reviews auth, secrets, permissions, injection, SSRF, payment safety, wallet flows, and data exposure.
- **Product critic:** checks feature truth, Suede positioning, user-visible behavior, empty/error states, and release claims.
- **Test critic:** maps claims to tests, screenshots, simulator runs, builds, and live/API checks.

Collect consensus first. If high-severity concerns persist after a fix cycle, keep status at `hold` and name the smallest next check or patch.

## A-F Code Grade

For important code, MCP, plugin, public-site, or release-bound changes, include an A-F grade after findings. Use the $suede-code-grader rubric — 7 lanes (Correctness, Security, Data/State, Suede Truth, UX/Release, Tests, Deploy Readiness) with the same A-F meaning and Instant-F triggers defined there.

Grade output block:

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

Lead with findings, ordered by severity. Group repeated patterns once: "This pattern appears in 4 files: [list]. Fix described once below."

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

- **P0:** data loss, security exposure, payment loss, broken release, or public behavior that must not ship.
- **P1:** likely production regression, auth/permission bug, broken primary path, false public claim, or missing critical deploy requirement.
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

## OWASP Top 10 Security Checklist (2021)

OWASP check runs automatically on any file in: `auth/`, `api/`, `middleware/`, `routes/`, `pages/api/`, or any file importing a crypto, session, or payment module. Cite the OWASP category in the finding.

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

## Technical Debt

Flag tech debt patterns as P3, group by file, don't block ship. Do not block a ship on P3 tech debt unless it directly obscures a P0/P1 bug. File as follow-up.

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

The ship gate is always the last line of a review output:

```
SHIP GATE: hold | ship-with-caveats | ship
Reason: [one sentence, naming the blocking finding ID or named caveat]
```

- `hold`: a blocker or high-risk unknown remains.
- `ship-with-caveats`: no blocker remains, but named non-critical caveats exist.
- `ship`: no known blocker remains and required verification passed.
