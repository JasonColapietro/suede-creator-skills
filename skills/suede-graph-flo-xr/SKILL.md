---
name: suede-graph-flo-xr
description: "Suede AI Thought Graph shipping search for one multi-file repository change. Use when asked \"compare implementation plans before building\". It searches, scores, prunes and refutes plans, selects one winner, then builds in an isolated worktree with a sandboxed gate and handoff, halting on hazards, collisions or an exhausted budget. Runs on Claude Code for macOS; on other hosts it is a contract only. NOT FOR: bulk, cross-repo, or non-macOS builder lanes (use suede-agent-teams), existing-diff review (use suede-code), CI wiring (use suede-ci-gate), or copy-only work (use suede-ship-copy)."
metadata:
  display-name: "Suede AI Graph Flo XR Skills"
---

# Suede AI Graph Flo XR Skills

Use the bundled `workflows/suede-graph-flo-xr.js` workflow to search competing plans for
one multi-file repository change. It makes an evidence-backed selection before
any implementation lane mutates the worktree.

## Compatibility

Bundled execution requires Claude Code Workflow on macOS, sandbox-exec, Node.js, Git and the six registered agent profiles. Other hosts can read the orchestration contract but must route the change to `suede-agent-teams` (one builder lane) or direct implementation for a contained change, rather than claim Workflow execution.

## Intake and budget gate

Before launch, require all three inputs:

- **Repo**: an absolute repository path. Relative paths and `~` fail closed.
- **Scope**: the requested multi-file change, including any protected paths or
  constraints.
- **Budget**: `light`, `standard`, or `deep`.

Also detect and pass optional context when available: `deploys` (whether the
repo has a deploy surface), `liveUrl` (the read-only production surface), and
`vault` (the external decision/handoff context path). Their absence does not
block a non-deploying repository, but do not silently discard known values.

When the user names a model for the workers (`workerModel`: `sonnet`, `opus`,
`haiku`, or `fable`), pass it: every worker call then runs on that model while
orchestration stays on the session model. Omitted, workers inherit the session
model silently; if the session sits on an expensive model and the user did not
choose it for workers, say so before launch instead of letting the default
decide. A run can spend up to 200 worker calls, so an unchosen inherited model
is a cost decision nobody made.

If repo or scope is missing, halt. Report the missing input in one line, offer
to provide the repo path, describe the desired change, or route a one-file edit
to direct implementation, then wait for the user's choice.

State the selected range and projected worst-case calls before launching:
`light` projects and permits **55**, `standard` projects and permits **110**, and
`deep` projects and permits **200** total agent calls. Do not infer a budget from
scope or silently raise a ceiling. If the user has not chosen one, ask and wait.

## Runtime prerequisites

The bundled JavaScript workflow is a Claude Code workflow for macOS. It requires
`sandbox-exec` and the six registered `suede-graph-flo-xr-*` agent profiles. Install the
full `suede-skills` plugin, the `suede-agent-workflows` plugin, or use this
repository's `install.sh`, which copies the profiles into `~/.claude/agents`.

Claude Workflow exposes no Node `process` global, so the workflow cannot infer
its package namespace. The calling skill must derive it from how this skill was
invoked and pass it on every launch. When the invoked name carries a plugin
prefix, `agentNamespace` is that prefix verbatim: `suede-skills` from the full
plugin, `suede-agent-workflows` from the focused orchestration plugin. A bare
invoked name with no prefix, installed by `install.sh` or copied by hand, takes
the empty string. This is runtime context, not a user choice. A missing or
unknown value fails before the first agent call.

The workflow also cannot locate its own bundled helper scripts. Pass `helperDir`:
the absolute path of the invoked skill's `workflows/helpers` directory (for this
install, `<skill base directory>/workflows/helpers`). The clamped Bash commands
run these `.cjs` helpers: the per-spawn clamp cannot verify a rule that is
multi-line or longer than roughly 400 characters, so inline `node -e` payloads
are not usable. A missing or whitespace-containing path fails before the first
agent call; a missing helper file surfaces as the Scout setup failure.

A skill-folder-only install, a generic skills-CLI install, and the Codex plugin do
not by themselves register or execute Claude Workflow agent profiles. In those
environments, treat this file as the orchestration contract and route the change
to `suede-agent-teams` or direct implementation; do not claim the bundled workflow ran. To enable it in
Claude Code after a manual single-skill copy, also copy the skill's bundled
`agents/suede-graph-flo-xr-*.md` files into `~/.claude/agents` and restart Claude Code.

## Run the graph search

Invoke `workflows/suede-graph-flo-xr.js` from this skill's own directory, as an
absolute path resolved from this SKILL.md's location (an installed copy has no
repo-root `skills/` folder):

```js
Workflow({
  scriptPath: "<this skill directory>/workflows/suede-graph-flo-xr.js", // absolute path
  args: { repo, scope, agentBudget, agentNamespace, helperDir, workerModel, deploys, liveUrl, vault }
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

## Boundaries

The workflow halts before the next agent call or entire mutating batch when its
budget is exhausted; it does not undo mutations that completed earlier. It
halts before any mutation unless an independent read-only verifier confirms a
clean, registered worktree of the origin default branch (origin/HEAD, else
origin/main) at one direct `${REPO}.worktrees/ship-*` child with the same Git common directory and non-symlink candidate files whose
realpaths remain inside it. Case-folded or Unicode-normalized path aliases fail
closed before graph search. It also halts for
a tracked secret, a live target worktree, a protected-WIP collision, a duplicate
file owner, an overflowed safety manifest, or no selectable plan. Scout parses
NUL-delimited Git porcelain so both sides of renames remain protected, parses
`lsof -Fn` CWD fields with path-component boundaries, and never discards fresh
dirty or live claims merely because committed history was cherry-landed. A
selected Build or Fix result that is blocked, missing context, fails, or reports
no changed path also halts before the next verification stage; a result that is
done with stated concerns proceeds, and its concerns travel into the review
stage and the handoff. Patch authors receive the whole scope checklist as
contract context, so a name another lane pins is imported, not guessed. On a
halt, name the blocker in one line and offer 2 to 4 applicable resolutions
(for example: narrow scope, exempt protected WIP, resolve the collision,
choose a higher budget, or provide missing context), and wait. Do not relaunch
or mutate while halted.

Gate removes credential-like and interpreter-injection environment variables,
then redirects home, temporary, and cache paths before an acceptance command
starts. If a check depends on removed credentials, report it as unverified;
never rerun it outside the sandbox merely to obtain a pass. Gate sets `CI=1`
so test runners skip watch mode, and kills a command that runs past 15 minutes
(exit 124, reported as a hold). Never retry a sandbox rejection or timeout
outside the sandbox to turn the hold into a pass.

On a halt, read `references/runtime-and-trust-boundary.md` for the halt-reason
table and score-retry budget; for a security-sensitive handoff, quote its
trust-boundary section. In short: Gate results stay `hold` with
`gateVerified:false` because Workflow returns no execution receipt, clamps and
`allowed*` fields are audit metadata rather than filesystem permissions, and the
result is never host-certified.

Production inspection is read-only. This skill never deploys, publishes,
releases, pushes, merges, changes credentials, deletes or reverts protected
work, or claims live verification. It does not choose the user's budget or
decide that missing scope can be skipped. Its ship verdict is evidence for the
user, not authority to perform an external action.

## Handoff and completion

Read the workflow's returned `runKey`, the validated unique `ship-<UUID>` leaf
from its isolated worktree. On a completed run, use the returned handoff
markdown. On a post-Scout halt, write a factual halt handoff from the structured
result and graph trace without spending another agent call; include any Build
or Fix lanes that completed before the halt. If Scout returns an invalid path
before `runKey` validation, report the halt without writing a run-keyed
handoff. Otherwise, save it to
`.suede-graph-flo-xr/${runKey}/handoff.md` at the target repo root, then verify it exists:

```bash
test -f ".suede-graph-flo-xr/${runKey}/handoff.md"
```

Report that path, the selected plan if any, gate result, changed files, commands
run, and explicit caveats. A completed local graph does not prove a deployment.

## License file

Part of `workflows/suede-graph-flo-xr.js` is distributed under BSD-3-Clause
terms carried in `LICENSE.graph-of-thoughts-BSD.txt`. Keep that file with every
source or binary redistribution of the workflow.

## Routing

- Bulk independent tasks, cross-repo or ongoing orchestration, or any host
  without macOS `sandbox-exec` → `suede-agent-teams`.
- The change ships LLM or agent behavior → `suede-ai-eval` for the acceptance
  cases.
- Review or grade an existing diff → `suede-code`.
- CI, required checks, or branch-protection wiring → `suede-ci-gate`.
- Copy-only search and publication readiness → `suede-ship-copy`.
- From `suede-code`, `suede-ci-gate`, or `suede-ship-copy`: route a
  multi-file implementation-plan search with one
  selected mutating winner back to `suede-graph-flo-xr`.

## Worked contract

[Worked contract](references/usage-contract.md) gives a bounded input, expected output and failure check for this workflow.
