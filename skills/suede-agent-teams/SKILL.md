---
name: suede-agent-teams
description: Suede-owned agent team orchestration for major planning, implementation, review, design QA, release, and recovery work. Use when a Suede task is large, risky, cross-surface, multi-repo, release-bound, design-heavy, or benefits from parallel lanes with clear ownership and review gates.
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
- **Code reviewer:** runs full-context review and turns findings into fix briefs.
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
Target:
Changed:
Verification:
Caveats:
Status:
Next:
```
