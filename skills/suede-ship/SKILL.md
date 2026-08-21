---
name: suede-ship
description: "Suede Labs Graph-of-Thoughts shipping search for a multi-file repo change. Use when competing implementation plans need one evidence-gated selection before any build. NOT FOR: bulk independent work (use suede-codex-fleet); findings-only diff review (use suede-code-review); CI or branch-protection wiring (use suede-ci-gate); copy-only shipping (use suede-ship-copy)."
---

# Suede Ship

Use the bundled `workflows/suede-ship.js` workflow to search competing plans for
one multi-file repository change. It makes an evidence-backed selection before
any implementation lane mutates the worktree.

## Intake and budget gate

Before launch, require all three inputs:

- **Repo** — an absolute repository path or a resolvable repo name.
- **Scope** — the requested multi-file change, including any protected paths or
  constraints.
- **Budget** — `light`, `standard`, or `deep`.

Also detect and pass optional context when available: `deploys` (whether the
repo has a deploy surface), `liveUrl` (the read-only production surface), and
`vault` (the external decision/handoff context path). Their absence does not
block a non-deploying repository, but do not silently discard known values.

If repo or scope is missing, halt. Report the missing input in one line, offer
to provide the repo path, describe the desired change, or route a one-file edit
to direct implementation, then wait for the user's choice.

State the selected ceiling before launching: `light` permits **55**, `standard`
permits **110**, and `deep` permits **200** total agent calls. Do not infer a
budget from scope or silently raise a ceiling. If the user has not chosen one,
ask and wait.

## Run the graph search

Invoke:

```js
Workflow({
  scriptPath: "skills/suede-ship/workflows/suede-ship.js",
  args: { repo, scope, agentBudget, deploys, liveUrl, vault }
})
```

The workflow executes these operations in dependency order:

1. **Generate** independent implementation plans from the scout and research
   evidence.
2. **Score** each plan for coverage, evidence, feasibility, safety, and
   efficiency.
3. **KeepBestN** deterministically prunes the scored beam.
4. **Refute** attacks the surviving plans with evidence-backed objections.
5. **Improve** repairs plans whose refutations are not fatal.
6. **Aggregate** combines compatible surviving lanes without merging conflicting
   file ownership.
7. **Select** chooses one deterministic winner.

Only the plan selected by **Select** may mutate files. Rejected, pruned, and
unselected thoughts remain evidence only; never build them speculatively.

## Halt and production boundaries

The workflow halts before the next agent call or entire mutating batch when its
budget is exhausted; it does not undo mutations that completed earlier. It
halts before any mutation for a tracked secret, a live target worktree, a
protected-WIP collision, a duplicate file owner, or no selectable plan. On a halt, name the blocker in one line, offer
2–4 applicable resolutions (for example: narrow scope, exempt protected WIP,
resolve the collision, choose a higher budget, or provide missing context), and
wait. Do not relaunch or mutate while halted.

Production inspection is read-only. This skill never deploys, publishes,
releases, changes credentials, or claims live verification. Its ship verdict
is evidence for the user, not authority to perform an external action.

## Handoff and completion

Read the workflow's returned `runId` and handoff. Write the handoff markdown to
`.suede-ship/${runId}/handoff.md` at the target repo root, then report that
path, the selected plan, gate result, changed files, commands run, and explicit
caveats. A completed local graph does not prove a deployment.

## Routing

- High-volume, well-specified, independent worker tasks → `suede-codex-fleet`.
- Findings-only review of an existing diff → `suede-code-review`.
- CI, required checks, or branch-protection wiring → `suede-ci-gate`.
- Copy-only search and publication readiness → `suede-ship-copy`.
- From `suede-codex-fleet`, `suede-code-review`, `suede-ci-gate`, or
  `suede-ship-copy`: route a multi-file implementation-plan search with one
  selected mutating winner back to `suede-ship`.
