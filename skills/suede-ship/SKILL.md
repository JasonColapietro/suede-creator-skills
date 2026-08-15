---
name: suede-ship
description: "Canonical Suede Labs shipping DAG for repo changes. Use for any nontrivial change to a Suede repo that touches more than one file or surface and deserves researched, adversarially reviewed, release-checked fan-out in one pass. Halts on a blocking hazard (a tracked secret, a live worktree) or a lane collision rather than plowing through. Reads production; never deploys. BUILT FOR TOKENMAXING AND BURNS HARD: 35 to 150 agents, all billed to the user's model allocation. Ask which agent range and which model before launching; up to 4 Fable subagents are allowed without asking, but every range here far exceeds 4, so never run the fan-out on Fable unless the user said Fable. NOT FOR: a one-file edit (just make it); high-volume well-specified work that splits into independent worker-sized tasks (use suede-codex-fleet, which bills to the OpenAI subscription); findings-only review with no code change (use suede-code-review); CI and branch-protection wiring (use suede-ci-gate)."
---

# Suede Ship

> **Designed for tokenmaxing; it burns hard.** The most expensive skill in the pack: 35
> agents at the narrowest range, about 150 at the widest, every one billed to the user's
> model allocation. "Ask for the agent budget" and "Model selection" below are not optional.

The canonical Suede DAG. One prompt in, one shipped change out, with about fifty
agents in between arranged as a graph rather than a chain.

Invoke the workflow bundled at `skills/suede-ship/workflows/suede-ship.js`. If
you keep a personal copy, `~/.claude/workflows/suede-ship.js` works the same way.

## Choose this or the fleet first

`suede-ship` is the surgical instrument and it is the expensive one:
35 to 150 agents depending on the range the user picks, research-heavy and
front-loaded, all of it billed to their model allocation.

The middle range — `standard`, around fifty to eighty — is what the rest of this
document means by a typical run, and the user chooses it before launch (see "Ask
for the agent budget" below). Verification and fix caps are per-range, they
announce themselves in the run log when they bite, and anything they skip rides
to the handoff as a named unverified caveat rather than being silently dropped.

Every one of those agents inherits the session model (see "Model selection" below).

If the job is actually high-volume, well-specified, and splits into independent
worker-sized tasks (content batches, test generation, bulk refactors), say so and
offer **suede-codex-fleet** instead — it runs on the OpenAI subscription and costs
nothing against the Claude limit. Brute force beats surgery when the work is
genuinely parallel and shallow.

## Parse the invocation

The argument is free-form. Extract:

- **repo** — required. An absolute path. Resolve a bare name against `~/code/<name>`.
  If no repo is named and the cwd is inside a git repo, use that repo's root.
- **scope** — required. What to change, in the user's own words, kept verbatim
  where possible. Do not compress it into a slogan; the planner decomposes it
  into lanes and the detail is what makes lanes separable.
- **deploys** — true if the repo has a `vercel.json`, a platform project link, or
  a known live URL. Check rather than assume.
- **liveUrl** — the production URL if you know it or can read it from
  `vercel.json`, `package.json`, or the README. Optional; the release verifier
  discovers it otherwise.
- **agentBudget** — `light`, `standard`, or `deep`. Required, and you must ask
  rather than pick it (see below). Omitting it defaults to `standard`.
- **vault** — optional absolute path to an external decision store (a synced
  notes vault, an ADR archive, a handoff directory). Omitted by default. When
  present, the prior-decisions lens reads it as context, never as source truth.

If **scope** is missing, ask for it. Do not invent a change to a production
repo. This workflow writes code.

## Ask for the agent budget before launching

This is Claude-model fan-out against the user's limit, so the size of the run is
the user's call, not yours. **Ask which of these three ranges they want and wait
for an answer before the `Workflow` call.** Do not pick one for them, and do not
infer one from how big the scope sounds.

| Range | Lanes | Total agents | What it buys |
|---|---|---|---|
| `light` | up to 3 | **35–45** | Two verifiers on at most 2 findings per lane. A focused change you mostly trust. |
| `standard` | up to 5 | **50–80** | The documented default. Verification depth that catches real defects without a long tail. |
| `deep` | up to 8 | **70–150** | Up to 6 findings per lane verified, 12 fixes. Auth, payment, schema, or anything you cannot easily revert. |

Those numbers are measured, not estimated — `tests/test_ship_workflow_cost.mjs`
executes the DAG against stubbed agents and counts the spawns at each range.

State the range and its ceiling in one line when you launch, plus which model the
agents will run on, so the spend is a decision rather than a surprise.

Two things the budget deliberately does **not** do. It never drops a lane: an
over-budget plan logs `OVER BUDGET` with a revised projection and builds every
lane anyway, because silently shipping less than the user asked for is worse than
costing more than planned. And it never hides what it skipped — capped
verification rides to the handoff as named unverified caveats.

## Model selection — Fable capped at 4 without asking

Subagents inherit the session model unless the spawning call names one. Nothing in
this skill picks a model, so every agent it fans out lands on whatever the session
happens to be set to. That is how a run sized against one allocation gets billed to
another without anyone choosing it.

**Up to 4 concurrent Fable subagents are allowed without an explicit Fable
instruction. Beyond that, Fable must be specified** — and every range this skill
offers (35 at the narrowest) is far beyond 4, so its fan-out never runs on Fable
unless the user named Fable for this run. An inherited session model is not a
specification — "the session was already on it" is not the user asking. Absent an
explicit Fable instruction, do one of two things before launching: name a different
model on the agent calls, or state plainly that the run will bill to the Fable
allocation and get an answer. Silence is not consent to spend it.

## Launch

```
Workflow({
  scriptPath: "skills/suede-ship/workflows/suede-ship.js",
  args: { repo, scope, deploys, liveUrl, vault, agentBudget }
})
```

Pass `args` as a real object. If the harness stringifies it the script recovers,
but an object is correct.

## The graph

Nine phases, parallel wherever the edges are not real:

1. **Scout** — fetch origin, dirty files, worktrees, deploy-time landmines. Manifest only.
2. **Research** — multi-modal sweep. Each lens searches a different way and is blind
   to the others, because one angle never finds everything. Every claim carries a
   `file:line`, sha, PR, or doc url.
3. **Gaps** — a completeness critic names what went unread, then one bounded fill round.
4. **Plan** — the lane map, with explicit file ownership. High effort by design.
5. **Build** — disjoint lanes, each pipelined straight into its own review.
6. **Refute** — two adversarial verifiers per finding, refute-by-default, and both
   must fail to refute for it to survive. Deduped and capped per
   lane at `standard`, blockers first; minors skip this stage and ride out as caveats.
7. **Gate** — a real barrier: typecheck, build, and tests on the integrated worktree.
8. **Release** — adversarial release verification: config drift, public surface,
   irreversibility, live baseline.
9. **Handoff** — the evidence record: changed files, commands run, verification, caveats.
   The workflow returns it; you write it to disk (see "When it returns").

## While it runs

Do not predict results or narrate progress you cannot see. The workflow returns a
notification when it completes; `/workflows` shows live progress.

## When it returns

First, write the returned `handoff` markdown to `.suede-ship/<runId>/handoff.md` at the
repo root — never inside a path a lane owns, which collides on the next run. A run this
size outlives context windows, and a record that lives only in a message is one
compaction from gone. Then report the path and the verdict fields, not the contents.

Report faithfully, including the failure shapes:

- `halted: true, reason: "blocking hazard at scout"` — a real secret in a tracked
  file, or a live process holding a worktree this run would touch. Name the hazard,
  then stop and offer: rotate or remove the tracked secret and re-run, exclude the held
  path from scope, or wait out the live worktree's process. Wait for the user's pick.
- `halted: true, reason: "lane collision"` — the lane map claimed a protected dirty
  file, gave one file two owners, or hit a file held by a **live** sibling worktree.
  Report the collisions. The fix is a re-plan, not a retry: stop and offer to merge the
  double-owned lanes, stash or exempt the protected WIP, or narrow the scope, then
  re-launch with `resumeFromRunId` so completed phases replay from cache. Wait for the
  choice; never relaunch cold, which pays for every completed phase twice.
- Completed — lead with `shipVerdict` and `gatePassed`, then confirmed findings, then
  `crossWorktree` overlap (files this work will need rebasing against other branches),
  then `droppedConstraints` (what the skeptic rejected) and `unread`.

Naming what went unread is most of the honesty.

## Verdict is advisory

The `shipVerdict` changes what you report, never what you do. The single exception
is live production exposure the verifier observed independent of this change, such
as a real secret or an unauthenticated `200` that should not exist. That goes to the
user immediately.

**Do not claim `deployed`, `verified live`, or `released`.** This workflow only reads
production. Those states require a deploy that has not happened.

## Iterating

Edit the script and re-invoke with the same `scriptPath`. Add
`resumeFromRunId: "<run id>"` to replay unchanged agents from cache. Changing an
agent's prompt or schema re-runs that agent and everything downstream of it.

## Routing

- High-volume, well-specified work that splits into independent worker-sized tasks →
  **suede-codex-fleet**, which bills to the OpenAI subscription, not the Claude limit.
- Manual, ongoing, cross-repo, or public-repository-contribution orchestration →
  **suede-agent-teams**. Precedence: one repo, one change, a bundled DAG that runs it
  end to end stays here; a single lane inside an agent-teams program that needs the
  full research-and-refute treatment comes back here for that lane.
- Findings on a diff with no code change → **suede-code-review**; an A-F ship verdict →
  **suede-code-grader**. Merge gate or branch protection → **suede-ci-gate**.
- Copy rather than code → **suede-ship-copy**, the same graph with message ownership as its collision rule.
