---
name: suede-agent-teams
description: "Suede Labs agent-team orchestrator: split complex work into coordinated lanes with explicit file ownership, WIP collision detection, quality gates, escalation thresholds, rollback plans, and handoffs that prove what shipped. Use when one shared change needs safe parallel ownership across builders and reviewers, when a lane map must be resolved before anyone opens a file, or when running a repeatable public-repository contribution program with issue scoring, atomic task leases, isolated worktrees, and explicit publication authority. NOT FOR: one repo change a bundled DAG can run end to end (use suede-ship); findings-only review of a diff (use suede-code-review) or an A-F ship grade (use suede-code-grader); CI, branch protection, or merge-gate wiring (use suede-ci-gate); branch and worktree setup on a stale mirror (a private Suede Labs companion, not in this pack)."
---

# Agent Team Orchestrator

## Model selection — Fable capped at 4 without asking

Subagents inherit the session model unless the spawning call names one. Nothing in
this skill picks a model, so every agent it fans out lands on whatever the session
happens to be set to. That is how a run sized against one allocation gets billed to
another without anyone choosing it.

**Up to 4 concurrent Fable subagents are allowed without an explicit Fable
instruction. Beyond that, Fable must be specified** — any roster past a scout, a
builder, and a handoff writer passes 4, so this skill's fan-out does not run on Fable
unless the user named Fable for this run. An inherited session model is not a
specification — "the session was already on it" is not the user asking. Absent an
explicit Fable instruction, do one of two things before launching: name a different
model on the agent calls, or state plainly that the run will bill to the Fable
allocation and get an answer. Silence is not consent to spend it.

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


The orchestrator assigns lanes, not conversations. Output is a delivery artifact, not a status update.

## Team Contract

Before spawning or simulating lanes, define:

- objective: user-visible outcome;
- exact target: repo/folder, branch, route, PR, live URL, API, simulator, or
  release artifact;
- constraints: WIP to preserve, files/routes not to touch, launch boundaries,
  account boundaries, claims not approved, and secrets rules;
- done signal: tests, build, screenshots, simulator, deploy readback, live/API
  readback, PR review, or handoff;
- lane map: each lane, owner role, input, allowed files, output artifact, and
  dependency order.

## Team Ledger

The contract above, every lane status, and every gate result otherwise live only in
the orchestrator's context, and a multi-lane run routinely outlives a context window.
Put them on disk. Default path: `.suede-team/<slug>/ledger.md` in the target repo,
holding the resolved lane map, each lane's current state from the Status Vocabulary,
and the evidence as it accumulates. Write it before the first builder opens a file and
update it at every gate; the evidence handoff reads from it rather than from memory.
If the user keeps durable repo-local state somewhere else, use their path and say
which one you used.

## WIP Collision Detection

Before opening any parallel lanes:

1. Run `git -C <repo> diff --name-only HEAD` and collect all dirty files.
2. Run `git -C <repo> status --short` and collect all untracked new files.
3. List every file each lane's scope would touch, based on the lane map.
4. Flag a collision if the same file path appears in two or more lane scopes OR in the dirty file list plus any lane scope.

Collision resolution rules:
- Same file, independent changes: sequence the lanes; the second lane rebases on the first lane's commit before opening.
- Same file, overlapping changes: merge the two lanes into one lane with one owner. Do not split responsibility for a single file across two concurrent builders.
- Dirty file in a lane scope: the orchestrator decides. Either stash and restore, or make that lane the only lane allowed to touch the file.

The orchestrator writes the resolved lane map to the team ledger (`.suede-team/<slug>/ledger.md`, see Team Ledger) before any builder starts. No builder opens a file not in its assigned lane map.

## Default Roster

Start with Scout + Builder + Handoff Writer. Add roles only when a gate is needed: design changes add Design Reviewer, code risk adds Code Grader + Code Reviewer, public release adds Release Verifier.

- **Scout:** finds repo, docs, current state, dirty files, live routes, and
  likely blast radius.
- **Planner:** turns requirements into verifiable tasks with acceptance
  criteria and dependencies.
- **Builder:** makes narrow code or content changes inside the existing system.
- **Design reviewer:** checks rendered visual quality, responsive behavior,
  accessibility, copy, and state coverage.
- **Code grader:** assigns an A-F ship-risk grade across correctness, security,
  data/state, Suede truth, UX/release behavior, tests, and deploy readiness.
- **Code reviewer:** runs full-context review and turns findings into fix briefs.
- **Visibility grader:** grades public pages, GitHub Pages sites, docs, and
  launch surfaces for findability, first-screen clarity, CTA pull, proof, AI
  readability, and design signal.
- **Release verifier:** checks build, deploy, live/API behavior, App Store/iOS
  truth, secrets, and published statements.
- **Handoff writer:** produces a signed delivery record. If the handoff omits any required field (see Handoff Quality Checklist), the work is not done; it is held.

For high-risk work, keep builder and reviewer separate.

## RFC Mode

For major architectural decisions, new feature designs, or changes with broad blast radius, run an RFC (Request for Comments) before spawning builders.

An RFC forces alignment on WHAT and WHY before committing to HOW.

RFC status vocabulary: `draft | accepted | superseded | withdrawn`.

Before authoring one, read
[`references/incident-and-rfc-templates.md`](references/incident-and-rfc-templates.md)
and fill every section it lists — problem statement, proposed solution, alternatives
considered, risks, success criteria, decision record.

Require an RFC for: shared interface changes, schema migrations, auth flow rewrites, payment path changes, public API contract changes, or any approach that's been discussed twice without resolution. No builder lane opens until RFC status is `accepted`.

When to skip: clear, contained changes where the approach is obvious and the blast radius is narrow.

## Feature Flag Strategy

Not every change should ship as a hard deploy. Feature flags allow gradual rollout, A/B testing, and instant rollback without a redeploy.

**When to flag:**
- New user-facing features in production traffic paths
- Changes to auth, payment, or data migration paths
- Any change that cannot be instantly rolled back by revert (e.g., a schema migration)
- A/B tests

Once a lane is flagged, read the lifecycle, the when-NOT-to-flag list, and the hygiene
rules in
the Feature Flag Strategy section of [`references/scenario-templates.md`](references/scenario-templates.md)
before the ramp starts. Every flag gets a removal date at creation; a stale flag is a
P3 code review finding.

## Rollback Decision Tree

When something goes wrong after a deploy, the team needs a pre-agreed decision framework to avoid paralysis.

```
Is there active data loss or corruption? → ROLLBACK IMMEDIATELY. Don't investigate first.
Is there a security exposure (PII, auth bypass, payment data)? → ROLLBACK IMMEDIATELY. Notify security.
Is a primary user path broken (login, checkout, core workflow)? → ROLLBACK unless fix is <15 minutes away.
Is performance degraded but functional? → Hold and investigate. Set a 30-minute timer.
Is it a cosmetic issue? → Hot-fix forward. No rollback.
```

After rollback:
1. Write an immediate summary: what rolled back, what was affected, who was notified.
2. Leave rollback notes in the PR and open a follow-up issue.
3. Run a lightweight post-mortem (see below) before re-shipping.

## Post-Mortem

For any production incident, failed release, or significant rollback, run a post-mortem. Keep it blameless: focus on systems, not individuals.

Severity: P0 (total outage) / P1 (primary path broken) / P2 (degraded) / P3 (cosmetic).

Post-mortems are required for P0 and P1 incidents. Optional but encouraged for P2. Skip for P3.
When one is required, write it from
[`references/incident-and-rfc-templates.md`](references/incident-and-rfc-templates.md)
and fill every section: timeline, impact, root cause, contributing factors, what went
well, and action items with owners and due dates.

## Phase Loop

The Phase Loop is the Continuous Team Loop run at minimal scale. Use it when a full 10-gate roster is overkill but you still need scout, plan, build, verify, and ship stages.

For high-risk changes, consult the Rollback Decision Tree before shipping. For gradual rollouts, use the Feature Flag Strategy. For shared interface changes, require RFC Mode before the plan stage opens.

## Public Contribution Program

When the objective is recurring work across owned or external public
repositories, read
[`references/public-contribution-program.md`](references/public-contribution-program.md)
completely before opening lanes. Use its deterministic ledger to score tasks,
lease each repo/issue pair to one worker, and prevent duplicate work. Start in
`local_only` authority with publication disabled. Keep external targets at a
reviewed contribution packet unless the user separately approves a draft PR.

The outward artifact gate applies to branch names, commit messages, and PR
copy. Use conventional project language and omit voluntary tool-origin
branding or trailers. Never forge authorship or deny tool use; an upstream
disclosure requirement overrides neutral packaging and moves the lane to owner
review.

## Model Tiering

Assign the least capable model that can still do the role correctly. Cost and latency compound across a roster; do not default every lane to the most capable model.

- **Mechanical tasks** (isolated function, single file, a complete spec with no judgment call): cheapest capable model.
- **Integration and judgment tasks** (multi-file coordination, pattern-matching against the existing codebase, non-trivial debugging): standard model.
- **Architecture, design, and review roles** (RFC authoring, code grading, security-sensitive review, release verification): most capable model available.

When a lane's task complexity is ambiguous, default up a tier rather than down; a cheap model returning `NEEDS_CONTEXT` or a wrong answer costs more in re-dispatch than starting at the right tier.

## Builder Dispatch Protocol

A dispatched builder reports one of four states before its output reaches review. Handle each before the lane proceeds to the next roster stage:

- **Done**: proceed to the next stage in the roster.
- **Done with concerns**: the builder finished but flagged a doubt. Read the concern. If it touches correctness or scope, resolve it before review; if it is a pure observation, note it in the handoff and proceed.
- **Needs context**: the builder is missing information the lane map should have supplied. Provide it and re-dispatch the same builder; do not silently guess on its behalf.
- **Blocked**: the builder cannot proceed. Diagnose why before re-dispatching: a context gap gets more context, a reasoning gap gets a more capable model, an oversized task gets split into smaller lanes, and a wrong plan escalates to the human (see Escalation Protocol). Never re-dispatch the same builder unchanged and hope for a different result.

A builder that asks a clarifying question mid-task gets an answer before it continues; do not let it guess past an open question to hit a deadline.

## Continuous Team Loop

Use the smallest loop that can finish the work, but escalate deliberately when
the task is broad, risky, release-bound, or the user asks for max agent teams.

Choose the loop:

- **Sequential:** default for normal scoped work.
- **Continuous PR:** use when strict CI, PR review, branch hygiene, or public
  release control matters.
- **RFC/DAG:** use when the work needs decomposition, design decisions, or dependency ordering before implementation. Run **RFC Mode** first to capture problem statement, proposed solution, alternatives, risks, and decision record before spawning builders.
- **Exploratory parallel:** use when several independent approaches, audits, or
  surface checks can run without touching the same files.
- **Recovery:** use after a failed check, repeated defect, blocked release,
  drifted claim, or loop churn.

For max-agent work, escalate through this roster only as needed:

```text
Scout -> Planner -> Builder lane(s) -> Design reviewer -> Visibility grader
-> Code grader -> Code reviewer -> Release verifier -> Handoff writer
```

Wrap the roster with these gates:

1. **Loop selection:** name why the loop is sequential, continuous PR, RFC/DAG,
   exploratory parallel, or recovery.
2. **Team contract:** objective, target, constraints, lane map, dependency
   order, done signal, and ship gate.
3. **Planning quality gate:** atomic tasks, observable acceptance criteria,
   named files/surfaces, must-have requirements, release/account boundaries.
4. **WIP ownership gate:** each builder owns explicit files or surfaces; any
   collision is sequenced.
5. **Execute wave:** parallel lanes only when outputs do not collide.
6. **Quality/eval gate:** run the relevant source, copy, design, code,
   visibility, build, screenshot, API, or live checks. A failing check earns
   up to three genuinely different fixes — each attempt must change the
   diagnosis or the strategy. Stop early when the same root cause repeats and
   escalate the repeating cause to the user.
7. **Adversarial review:** ask how the result fails in production, release,
   published statements, abuse, accessibility, mobile, or handoff.
8. **Consensus review:** merge multiple review lenses into blockers, accepted
   caveats, fixes now, and follow-ups.
9. **Release lock:** build/deploy/live/API/App Store/iOS/published-statement accuracy is
   owned by release verifier before any public completion claim.
10. **Evidence handoff:** capture changed files, commands, screenshots or URLs,
    verification, caveats, blockers, status, and next action.

Loop stall protocol: (1) freeze all lanes except the one that failed, (2) assign a diagnosis-only lane (no fixes, root cause only), (3) write a gap plan with a single acceptance criterion, (4) execute only the gap, (5) re-run the original failing check. Do not widen until that check passes.

## Inter-Lane Communication

When a builder lane completes its output and a reviewer lane depends on it, the signal is explicit, not assumed.

The completing lane writes a Lane Ready notice:

```
Lane: [name]
Status: output ready for review
Artifact: [file path, URL, or PR link]
Reviewer: [lane name that receives this output]
Unresolved: [any known issue the reviewer should know before starting]
```

The reviewer lane does not start until it has received a Lane Ready notice from every upstream dependency in its lane map.

The orchestrator routes Lane Ready notices. In a sequential thread, the orchestrator posts the Lane Ready notice on behalf of each completing lane before invoking the next.

Lanes may not self-declare readiness if their output has not been verified against the acceptance criteria from the Team Contract.

## Planning Quality Gate

A plan is not ready until:

- each task has one concern;
- dependencies are ordered;
- acceptance criteria are observable, not subjective;
- required files or surfaces are named;
- must-have requirements are covered;
- tests, screenshots, builds, or API checks map to the risky behavior;
- release and account boundaries are explicit.

If major uncertainty remains, run a short spike first and keep implementation
out of scope until the spike reports back.

## Review Convergence

For important merges, run at least two independent review lenses:

- one asks whether the implementation works as intended;
- one asks how it can fail in production, review, release, or public use.

Merge the findings into:

- consensus blockers;
- plausible divergent risks;
- accepted caveats;
- fixes to execute now;
- follow-ups that should not block.

Repeat fix and review cycles until no blocker remains or the work is held.

## Status Vocabulary

Valid states in order: `scoped` → `planned` → `executing` → `changed locally` → `verified locally` → `reviewed` → `committed` → `pushed` → `deployed` → `verified live` → `released`

Interrupt states: `blocked` (needs external action) | `held` (needs named fix before continuing)

Do not skip. `changed locally` is not `verified locally`. `deployed` is not `verified live`. Do not mark `released` until the done signal from the Team Contract passes.

## Scenario Templates

Six pre-built configurations exist for common high-risk deployments: (a) Auth Rewrite,
(b) Payment Integration, (c) Public Launch Review, (d) Data Migration, (e) Performance
Audit, (f) Recovery / Incident Response. When the objective matches one, read
[`references/scenario-templates.md`](references/scenario-templates.md) completely
before opening lanes and adjust only the named target — each template carries its own
roster, lane map, RFC and flag requirements, grader tolerances, and done signal.

## Escalation Protocol

Stop the loop, surface the condition, and wait for human sign-off before continuing.

| Condition | Threshold | Action |
|---|---|---|
| Repeated fix cycles | > 3 fix-rerun cycles on the same failing check | Stop. Write a diagnosis summary. Ask: is the acceptance criterion correct, or is the fix strategy wrong? |
| Security finding of unknown severity | Any finding touching auth, session, PII, payment data, or access control that cannot be confidently classified as low risk | Stop. Do not attempt a fix. Surface the exact finding and uncertain blast radius. Human decides next step. |
| Production incident with data exposure | Any indication of PII, payment data, or auth token exposure in production logs, error reports, or user reports | Stop all lanes. Trigger rollback decision tree. Notify human immediately. Do not investigate further before rollback. |
| Cost spike | > 20 tool calls without a verified output, or estimated API/infra cost > $50 in a single loop | Stop. Summarize progress and remaining scope. Ask human to authorize continuation. |
| Contradictory constraints | Two constraints in the Team Contract are mutually exclusive | Stop planning. Surface the conflict with a specific example. Do not proceed until human resolves. |

No agent may override an escalation threshold by re-scoping the task or declaring the condition resolved without human confirmation.

## Red Flags — Stop

- "The lanes probably won't touch the same files" — probably is not a lane map. Run WIP collision detection first.
- "The approach is obvious, skip the RFC" — if it has been discussed twice without resolution, it is not obvious.
- "Mark it done, the code is written" — `changed locally` is not `verified locally`; the status vocabulary has no shortcuts.
- "Leave that caveat out so the handoff looks clean" — a handoff missing a field is status `held`, not done.
- "One more fix cycle will crack it" — past 3 cycles on the same failing check, stop and run the loop stall protocol.
- "The builder can review its own lane" — for high-risk work, builder and reviewer stay separate.

## Handoff Quality Checklist

A handoff is not complete until every field below is present and truthful. The handoff writer signs off by confirming each item.

Required fields:
- [ ] Target: exact repo, branch, route, or URL (not "the main app")
- [ ] Changed: every file path that was modified, created, or deleted (not "various files")
- [ ] Commands: every bash command run, in order, with the actual output or exit code
- [ ] Verification: observable evidence (screenshot URL, test output, curl response, build log), not "it works"
- [ ] Status: one of the vocabulary states, not "done" unless the done signal from the Team Contract is satisfied
- [ ] Next: the single most important unresolved step (not "see above")
- [ ] Caveats: every known limitation, assumption, or deferred item; none omitted to make the handoff look cleaner

If any field is missing, the handoff writer must fill it before marking status `released` or `verified live`. A handoff with a missing field is status `held`.

## Output Shape

For a team plan:

```text
Objective:
Target:
Constraints:
Lane Map:
Dependency Order:
Done Signal:
Ship Gate:
```

For execution updates:

```text
Lane:
Status:
Evidence:
Next:
Risk:
```

For final handoff:

```text
Simple explanation:
Usual breakdown:
Target:
Changed:
Verification:
Caveats:
Status:
Next:
Cue Suede:
```

## Routing

- The work is one repo's change and a bundled DAG can run it end to end →
  **suede-ship**. Precedence: one repo, one change, research-through-release in a
  single scripted run goes there; orchestration that is manual, ongoing, cross-repo,
  or a public-contribution program stays here. A single lane inside a program here
  that needs the full research-and-refute treatment can be handed to **suede-ship**
  for that lane alone.
- A recurring owned/public-repository contribution program needs issue leases,
  isolated worktrees, review, and an authority-gated packet → read
  `references/public-contribution-program.md` and keep this skill as controller
- A code lane needs review or a ship grade → **suede-code** (combined), **suede-code-review** (findings only), or **suede-code-grader** (grade only)
- The repo's merge gate is weak or missing → **suede-ci-gate**
- The work needs branch ownership, stale-mirror worktree setup, finish options, or cleanup discipline → **suede-git-hygiene** (private Suede Labs companion, not in this pack)
- A lane ships AI behavior → **suede-ai-eval** before that lane's quality gate closes
- The public launch lane needs a page verdict → **suede-visibility-grader**, then **suede-launch-packaging**
