---
name: suede-graph-flo-xr
description: "Use when a consequential multi-file task needs serious compute and independent testing. Run competing design, adversarial review, and QA lanes against one implementation; use Light, Standard, or Deep and return reproducible evidence. Compare designs when there is more than one plausible fix; build only one in an isolated worktree. NOT FOR: bulk worker work, existing-diff review, CI setup, or copy-only work."
metadata:
  display-name: "Suede Graph Flo XR"
---

# Suede Graph Flo XR

**Throw compute at what could break. Prove what works.**

Use Graph Flo XR when a plausible patch is not enough. Compare designs, build
one, then put independent QA and adversarial reviewers on the actual result.
Spend the deepest pass trying to falsify the result, not polishing the plan.

## Choose a compute tier

| Option | Worker-call ceiling | Native verification before handoff |
| --- | ---: | --- |
| **Light** (`light`) | 55 | Baseline, focused regression, separate QA replay, final smoke check. |
| **Standard** (`standard`) | 110 | Light plus competing design proposals, independent integration/negative cases, adversarial review and a final rerun. |
| **Deep** (`deep`) | 200 | Standard plus distinct designs where viable, a separate adversarial lane, realistic fixtures, state/edge coverage, and independent reproduction of the critical path after the last change. |

These are ceilings, not quotas. Use the strongest authorized worker model on
high-judgment lanes when the host supports it. Use extra compute to reduce
distinct uncertainties, not to collect more opinions on the same test.
Keep the user's limits on spend, time and side effects. Never raise a tier
or start paid infrastructure on your own.

### Native compute-first run

Use this contract directly on hosts with native worker delegation. Do not say
the bundled Claude workflow executed when you used native workers.

1. **Set the acceptance contract.** Record the requested outcome, scope, protected
   paths, allowed side effects, exact baseline revision and starting diff, and
   observable success and failure conditions. Record and preserve pre-existing
   changes. Do not expand scope or weaken requirements to make a check pass.
   Run the smallest trustworthy baseline before editing. For a bug, capture the
   failure when reproducible. For a feature, record relevant passing invariants.
   Record a blocked baseline rather than manufacture one.
2. **QA reserve: 25%.** Round up a quarter of the effective cap (the lower of the
   tier ceiling and any user-set maximum). Before launching workers, price the
   required lanes, including retests. Reserve one call for final independent QA
   and enough calls for the other mandatory lanes, even if that exceeds 25%.
   Reserve execution time too. Design, implementation, and optional polish
   cannot borrow final QA capacity. Keep one shared ledger of every dispatch,
   including failed, cancelled, retried, and nested calls and follow-up turns.
   Reserve all calls atomically before dispatching a parallel batch. Prohibit unmetered
   subdelegation. If the required lanes do not fit, do not silently downgrade;
   report a partial run or a hold without exceeding the cap.
3. **Independent Design.** In Light use one design. In Standard and Deep, when
   choices exist, brief separate workers with the same
   task and evidence but no other proposal. Compare alternatives against the
   acceptance contract, side effects, migration impact, and testability. Keep
   only one writable implementation; design workers are read-only.
4. **Independent QA.** Before implementation, give QA a clean brief with the
   original acceptance contract but no solution or promised test result. Save
   QA's expected results and fixtures before sharing the implementation; the
   builder may not edit the oracle. Contract corrections require a recorded reason
   and a fresh QA baseline. Have QA execute against the candidate, not merely
   read build logs. The author cannot verify their own changes. Include one
   realistic end-to-end workflow where applicable.
5. **Adversarial review.** In Standard and Deep give another worker, when available, the candidate
   and the job of disproving it. Check relevant boundary inputs, state changes,
   retries, degraded dependencies, and contradictory assumptions. For UI, include
   mobile, keyboard navigation, and empty/error states where applicable. Use
   isolated fixtures and authorized resources; no offensive workflows, live
   load, production mutations, or outbound actions. If reviewers disagree, run
   their competing predictions against an independently derived oracle on the
   same candidate. Do not settle by vote; hold unresolved critical disagreements.
6. **Fix and retest.** Keep write ownership disjoint. Confirm each material
   failure, fix its cause, and add the smallest regression that fails on the
   old behavior. Rerun affected checks after every material change. A patched
   finding stays open until its regression passes on the candidate.
7. **Fresh final rerun.** Finish QA, adversarial review, Slop Police and any fixes
   before freezing the candidate. Identify the baseline revision and hash the
   tracked and untracked candidate changes, including tests. Rerun the critical
   suite against that exact content in a clean isolated context. If it changes,
   invalidate any affected receipt and repeat the affected checks before a verdict.
   Missing required independent QA is a hold, including missing independent
   critical-path reproduction in Deep. Stop at the authorized cap without
   claiming a pass on incomplete work. Mark any other missing tier-mandatory
   lane incomplete, even if local functional checks passed.

Keep a compact evidence table: requirement, command or scenario, revision,
environment, fixture or seed, expected vs. actual, status, and artifact. Use
distinct statuses: planned, not run, failed, claimed, passed, independently
reproduced. A worker attestation without matching execution evidence stays
claimed and cannot satisfy a critical check.
For every critical pass, read the raw result tied to the candidate identity,
including execution status and expected versus actual behavior. A summary,
asserted run, or green exit code alone is not a receipt.
A flaky check is unresolved until reproduced or explained. Local and simulated
runs never establish production behavior.

Example: a weighted graph returns the right result on a cold cache but returns
that same stale result after a weight changes. Have QA compute the new expected
total independently and run the warm check on the same cache instance after the mutation and use a fresh cold instance as a control.
Repeated runs on unchanged input do not cover the failure.

## Slop Police: check the whole deliverable

Run one Slop Police pass on every native Graph Flo deliverable, even when no
copy changed. In Standard and Deep, assign an independent reviewer when
available and count that call against the selected tier and verification reserve.
In Light or when the reserve affords no independent call, do the pass directly
and label it self-review. Do not skip critical testing to fund an editorial pass.

Review the actual candidate and use only the checks that match the deliverable:

| Surface | What to flag |
| --- | --- |
| Copy | Filler, repeated hooks, empty promises, invented proof, unclear calls to action. |
| Design and UI | Generic choices that make the task harder, fake polish, low contrast, confusing hierarchy, or wrong mobile and empty states. Use a real render when possible. |
| Code and workflows | Unused dependencies, duplicates, speculative abstractions, dead paths, or complexity with no user-facing benefit. Point to a smaller change within scope. |
| Tests, reports and handoff | Tests that pass with broken behavior, cherry-picked screenshots, unsupported metrics, and conclusions that aren't backed by the recorded evidence. |

For each finding, give the exact location, observed symptom, why it matters,
and a concrete rewrite, deletion, simpler alternative, or missing check. Link
a matching source or artifact for material product claims; narrow or remove
unsupported claims. Mark applicable but unobserved surfaces not reviewed and
irrelevant surfaces not applicable; do not invent observations. Preserve the
author's voice, approved brand and SEO terms, verified claims, and intentional
design choices. A stylistic preference or a lint score alone is not a finding.

Send proven correctness, accessibility, or evidence defects to QA; use the existing
acceptance contract to decide whether they block. Taste and polish are advisory.
The owner of each edit applies accepted changes. Rerun any affected evidence
after a material edit, then recheck the final candidate. No new scope,
publication, or deployment authority.

Example: replace “Unlock seamless scheduling” with “See open times and book a
30-minute call” only when the linked page actually offers that. For a dashboard,
flag a beautiful chart only if it obscures the user's task or misstates the
data. For a test, demonstrate the check also passes on the broken version
before calling it ineffective.

## Intake and budget gate

Before launch, require all three inputs:

- **Repo**: an absolute repository path. Relative paths and `~` fail closed.
- **Scope**: the requested multi-file change, including any protected paths or
  constraints.
- **Budget**: a user-selected `light`, `standard`, or `deep`. If missing, show the three choices with their ceilings and ask for one; do not launch.

Pass known optional context: boolean `deploys`, public read-only `liveUrl`,
and the decision-context path `vault`. For the bundled Claude workflow, pass a chosen `workerModel` (`sonnet`,
`opus`, `haiku`, or `fable`) to every worker. Otherwise workers inherit the
session model; surface a costly inherited model before spending calls. Native
hosts use their own authorized model equivalents.

If repo or scope is missing, ask for it. Route a one-file edit to direct
implementation. State the chosen tier and maximum calls before launching. If the bundled Claude
runner cannot enforce a lower numeric cap, do not launch a tier above that cap.
If running an outer review as well, its calls plus the runner ceiling must fit.

## Runtime prerequisites

The bundled JavaScript workflow is a Claude Code workflow for macOS. It requires Git, Node.js,
`sandbox-exec`, and the six registered `suede-graph-flo-xr-*` agent profiles. Install the
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
Payload-carrying helper invocations are admitted by pinned prefixes (helper
path plus worktree, temp root, or base SHA) rather than exact strings; each
helper validates its remaining argv, and the diff attestations, not the clamp,
remain the check that what was applied matches the selected bundle.

The selected patch reaches the applier as bounded base64 chunks staged into the
run's private temp root, because the clamp verifier cannot parse a command
carrying a multi-kilobyte inline payload. Each append carries its offset and an
FNV-1a checksum, and `--apply` verifies total length and payload checksum before
decoding, so a mistyped chunk fails fast with a retry instruction instead of
producing a corrupt patch.

A skill-folder-only install, a generic skills-CLI install, and the Codex plugin do
not by themselves register or execute Claude Workflow agent profiles. On a native
worker host, use the compute-first contract above. The bundled Claude runtime
still uses its existing plan-search graph and call accounting; do not represent
the native QA reserve, separate lanes, or Slop Police as enforced by that script.
If reviewing a returned Claude deliverable, run Slop Police as a separate
read-only pass within the authorized budget; label it separately from the runner.
If no worker calls remain, use authorized local self-review or report not run.
Read existing artifacts; refer any new negative control to authorized isolated QA.
Do not bypass the runner sandbox or imply a proposed check ran. To enable it in
Claude Code after a manual single-skill copy, also copy the skill's bundled
`agents/suede-graph-flo-xr-*.md` files into `~/.claude/agents` and restart Claude Code.

The requested Scout setup command probes `/usr/bin/sandbox-exec` as its first
subprocess, before fetch or worktree creation. If that command is invoked and
the probe fails, Scout reports failure before its setup mutation. The returned
Scout evidence is still a model attestation, not a host execution receipt. Gate
also holds on any later reported sandbox rejection. Never retry an acceptance
command outside the sandbox to turn that hold into a pass.

## Run the bundled Claude graph search

Invoke:

```js
Workflow({
  scriptPath: "skills/suede-graph-flo-xr/workflows/suede-graph-flo-xr.js",
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
clean, registered origin/main worktree at one direct `${REPO}.worktrees/ship-*`
child with the same Git common directory and non-symlink candidate files whose
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
contract context, so a name another lane pins is imported, not guessed. On a halt, name the
blocker in one line and offer 2–4 applicable
resolutions (for example: narrow scope, exempt protected WIP, resolve the
collision, choose a higher budget, or provide missing context), and wait. Do
not relaunch or mutate while halted.

### Reading a search halt

An empty search used to report `no safe graph winner` however it ended, so an
infrastructure flake and a genuine evidence conflict printed the same line. The
halt output now names which happened, and `haltDetail` carries the counts behind it:

| Reason | What it means |
|---|---|
| `every candidate lost its score to an agent failure` | No thought in the run was ever scored. Infrastructure, not evidence: offer an authorized rerun. |
| `no candidate reached Select` | The search emptied upstream for some other reason; read `graph.dropped`. |
| `every finalist lost its score before Select` | Finalists existed and were pruned as unscored. |
| `every finalist was pruned before Select` | Finalists were pruned for a non-score reason. |
| `every finalist carries a degraded or missing score` | Finalists reached Select without a valid score. |
| `every finalist failed deterministic plan eligibility` | Real rejection. `haltDetail.eligibilityRejections` lists every reason. |
| `no safe graph winner` | None of the above fits: read the graph. |

`haltDetail.infrastructureDegraded` is independent of the reason: both can be
true at once. Read the reason for what stopped Select and that flag for what
degraded the pool feeding it.

Score calls are read-only and idempotent, so a transport-level death is retried:
twice per call, capped run-wide at 5% of the agent ceiling, and refused entirely
once the remaining budget falls to the reserved floor (20% of the ceiling). A
malformed score is never retried: the schema is enforced at the tool layer, so
an invalid score is a judgment to keep, not a connection to redial. Every
attempt and every refused retry lands in `graph.scoreRetries`, and
`scoreReliability` rides out in the result on every run, halted or not: a flake
that costs two finalists still degrades a run that goes on to ship.

Claude's registered agent profiles enforce tool separation: local readers have
no shell, write, or web tools; public-web readers have no local-file or shell
tools; patch authors have no mutation tools; and appliers/verifiers have only
Bash plus structured output. Patch authors return unified diffs, one clamped
applier applies them, and a separately budget-reserved clamped verifier compares
the exact path set and diff digest immediately after every Build or Fix Apply,
before any reader or Gate call. Patch validation rejects symlinks, gitlinks,
binary patches, renames, copies, and file-type transitions before Apply. Gate
runs only allowlisted local validation
commands under macOS `sandbox-exec`, with no network, host reads limited to
runtime/system roots, the worktree, its `.git` common directory derived again
inside the exact Gate clamp, and the run's private temp root. The model-reported
common directory is never interpolated into sandbox permissions. Writes are limited to known generated artifacts
and that private temp root. The allowlist includes bounded project-local checks
for Node, Python, Go, Rust, Make, Swift Package Manager, Xcode simulator builds
with derived data under the private temp root, and offline Gradle validation.
Nested module `build` roots are derived only from selected files under that
module's `src` tree and are rejected if a symlink or realpath can escape the
worktree. A second diff attestation runs after Gate and hashes
the binary Git diff plus every reported file's mode, size, and bytes, including
untracked additions.

Gate removes credential-like and interpreter-injection environment variables,
then redirects home, temporary, and cache paths before an acceptance command
starts. If a check depends on removed credentials, report it as unverified;
never rerun it outside the sandbox merely to obtain a pass.

A transport failure with no required Research, Gaps, Review, Gate, or Release
report halts instead of counting as clean evidence. An explicit empty findings
array from a responding reviewer is a valid report.

A successfully applied blocker patch is not treated as semantically cleared.
The original blocker remains in `fixedBlockersPendingVerification`. The Gate
attempt records its exact command set and reported output, but it cannot prove
those commands ran because the Workflow API exposes no trusted required-tool
execution receipt. The workflow therefore sets `claimedPassed` from the agent
report, forces `passed:false`, sets `gateVerified:false`, and keeps the verdict
and handoff status at `hold`. Only a trusted outer runner with immutable
execution receipts can promote that evidence.

These controls have a precise trust boundary. `bashCommandClamp` constrains a
Bash command when an agent invokes it; Claude Workflow does not provide a
required-tool-call receipt, so a structured verifier response remains a model
attestation rather than cryptographic proof that Bash ran. Likewise,
`authority`, `allowedRepo`, `allowedFiles`, and `allowedCommands` are audit
metadata, not filesystem permissions. Local reader tools are separated from web
tools but are not path-sandboxed by the Workflow API. Report these facts in any
security-sensitive handoff and do not describe the result as host-certified.

Production inspection is read-only. This skill never deploys, publishes,
releases, pushes, merges, changes credentials, deletes or reverts protected
work, or claims live verification. It does not choose the user's budget or
decide that missing scope can be skipped. Its ship verdict is evidence for the
user, not authority to perform an external action.

## Handoff and completion

For a native run, report the final revision or diff, changed files, test
evidence, and unresolved findings. No Claude run key is required or invented.

For the bundled Claude workflow, read its returned `runKey`, the validated unique `ship-<UUID>` leaf
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

- High-volume, well-specified, independent worker tasks → a separate private
  worker-fleet pass.
- Review or grade an existing diff → `suede-code`.
- CI, required checks, or branch-protection wiring → `suede-ci-gate`.
- Copy-only search and publication readiness → `suede-ship-copy`.
- From `suede-code`, `suede-ci-gate`, or `suede-ship-copy`: route a
  multi-file change that needs competing designs and independent verification back to `suede-graph-flo-xr`.

## Worked contract

[Worked contract](references/usage-contract.md) gives a bounded input, expected output and failure check for this workflow.
