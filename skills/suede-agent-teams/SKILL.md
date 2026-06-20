---
name: suede-agent-teams
description: Suede-owned agent team orchestration for scout, safe parallel build, continuous max-agent loops, adversarial review, consensus review, design visibility review, A-F code grading, WIP protection, release lock, recovery, and evidence handoff loops. Use when a Suede task is large, risky, cross-surface, multi-repo, release-bound, design-heavy, or benefits from coordinated lanes with clear ownership, loop control, and review gates.
---

# Suede Agent Teams

Use this skill to split important Suede work into clear agent lanes without
losing control of scope, WIP, or release truth. The output is a coordinated
delivery path, not a meeting transcript.

## When To Use

Use agent teams for:

- multi-file or multi-repo Suede changes;
- launch pages, app shells, dashboards, and reusable design systems;
- auth, payments, rights/provenance, registry, royalty, wallet, and agent
  commerce work;
- App Store, iOS, deployment, or public-release gates;
- confusing failures where diagnosis, implementation, and verification should
  stay separate;
- continuous loops that need quality gates, evals, recovery controls, and
  evidence handoff;
- review convergence before a high-risk merge.

Do not use a team for a narrow copy edit, one-file fix, or simple command.

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

Use parallel lanes only when write surfaces do not collide. If two lanes need
the same files, sequence them.

## Default Roster

Choose the smallest useful roster.

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
  truth, secrets, and public claims.
- **Handoff writer:** records target, files changed, commands, verification,
  caveats, blockers, and exact next action.

For small work, one agent can wear several roles. For high-risk work, keep
builder and reviewer separate.

## Phase Loop

Run the loop at the smallest scale that fits:

1. **Discuss:** capture decisions, unresolved assumptions, bans, and scope.
2. **Plan:** decompose into atomic tasks with file targets, dependencies, and
   verifiable acceptance criteria.
3. **Execute:** work in lanes, wave by wave, with one outcome per lane.
4. **Verify:** walk every user-observable deliverable and record pass/fail
   evidence.
5. **Review:** run design and code review gates when the risk warrants it.
6. **Ship:** commit, push, deploy, release, or hand off only after the done
   signal is satisfied or the caveat is explicitly named.

If verification fails, diagnose the root cause, create a gap plan, execute only
the gap, and re-run the failing checks.

## Continuous Team Loop

Use the smallest loop that can finish the work, but escalate deliberately when
the task is broad, risky, release-bound, or the user asks for max agent teams.

Choose the loop:

- **Sequential:** default for normal scoped work.
- **Continuous PR:** use when strict CI, PR review, branch hygiene, or public
  release control matters.
- **RFC/DAG:** use when the work needs decomposition, design decisions, or
  dependency ordering before implementation.
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
   visibility, build, screenshot, API, or live checks.
7. **Adversarial review:** ask how the result fails in production, release,
   public claims, abuse, accessibility, mobile, or handoff.
8. **Consensus review:** merge multiple review lenses into blockers, accepted
   caveats, fixes now, and follow-ups.
9. **Release lock:** build/deploy/live/API/App Store/iOS/public-claim truth is
   owned by release verifier before any public completion claim.
10. **Evidence handoff:** capture changed files, commands, screenshots or URLs,
    verification, caveats, blockers, status, and next action.

If the loop stalls, freeze broad work. Isolate the failing unit, reduce the
scope, replay with explicit acceptance criteria, and rerun only the failed
check before widening again.

For copy, design, visibility, Suedify, launch, or public docs work, include the
shared gate at `../suede-workflow-skills/references/no-missed-quality-gates.md`.

## Grouping Loops

Pick the loop that matches the risk. Keep ownership explicit and keep parallel
lanes away from the same files.

- **Linear delivery loop:** scout, plan, build, verify, review, ship. Use for
  normal multi-file work where sequencing matters more than speed.
- **Parallel surface loop:** scout once, then split copy, design, code, SEO, and
  release lanes only when their write surfaces do not collide.
- **Scout and constraints loop:** one lane maps repo state, docs, WIP, owners,
  live routes, risky files, and no-touch boundaries before any builder edits.
- **Adversarial review loop:** builder delivers, then at least one reviewer tries
  to break the work from production, user, release, public-claim, and abuse
  angles before fixes are accepted.
- **Consensus review loop:** two reviewers inspect the same result from
  different lenses, then merge findings into blockers, accepted caveats, and
  fixes to run now.
- **Design and visibility loop:** design reviewer checks the rendered page while
  visibility grader scores findability, first-screen clarity, CTA pull, proof,
  AI readability, and design signal.
- **Code grade loop:** code grader assigns an A-F grade across correctness,
  security, data/state, public-claim truth, tests, and deploy readiness, then
  code reviewer converts weak lanes into fix briefs when fixes are needed.
- **WIP protection loop:** builder lanes claim allowed files up front, reviewers
  flag collisions, and the orchestrator sequences any lane that needs the same
  file.
- **Release lock loop:** release verifier owns build, deploy, live/API readback,
  public copy truth, and handoff before any public completion claim.
- **Recovery loop:** when a check fails, stop broad work, isolate the failing
  unit, assign diagnosis, patch only the gap, and rerun the failed check.
- **Evidence handoff loop:** final lane gathers screenshots, commands, URLs,
  test results, caveats, and next action so the next agent does not restart.

For large Suede work, run scout first, build in parallel only where safe, then
converge through adversarial review, code grade, visibility grade, release
lock, recovery if needed, and evidence handoff.

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

Use these states consistently:

- scoped
- planned
- executing
- changed locally
- verified locally
- reviewed
- committed
- pushed
- deployed
- verified live
- released
- blocked

Do not mark `done` until the done signal from the team contract is checked.

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
