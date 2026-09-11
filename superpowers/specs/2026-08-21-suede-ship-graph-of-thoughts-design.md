# Suede Ship Graph-of-Thoughts Design

*Historical record: written 2026-08-21, when this skill was named `suede-ship`. It was renamed to `suede-graph-flo-xr` (Suede Graph Flo XR) on 2026-08-23; the names below are preserved as written.*

**Date:** 2026-08-21

**Status:** Approved

**Target:** `skills/suede-ship`

**Upstream:** ETH Zurich `spcl/graph-of-thoughts` at `3d9d9dbd8937d47a4441f681b8b40e3c5b054f16`

## Goal

Replace `suede-ship`'s fixed, single-plan orchestration DAG with a real
Graph-of-Thoughts search that generates competing execution plans, scores and
prunes them, subjects survivors to adversarial refutation, improves them, and
aggregates compatible strengths before any source file is changed.

The public skill name and its safety contract remain stable. The reasoning and
selection engine changes completely.

## Why Graph of Thoughts

Tree of Thoughts can explore and prune alternate branches, but every candidate
has one parent and the search cannot converge. Shipping plans routinely share
useful research, combine non-conflicting lanes from different proposals, and
need critics to feed revisions back into surviving candidates. Graph of
Thoughts supports those many-to-many relationships directly.

The implementation adapts the upstream operation model—`Generate`, `Score`,
`KeepBestN`, `Improve`, and `Aggregate`—to the existing JavaScript workflow
runtime. Suede adds `Refute`, deterministic safety validation, mutation
authority, evidence requirements, and release-state boundaries.

## Preserved Public Contract

- Invocation remains `$suede-ship` with absolute `repo`, `scope`, `deploys`, `liveUrl`,
  `agentBudget`, `vault`, and `agentNamespace` arguments.
- The workflow continues to use injected `agent`, `parallel`, `pipeline`,
  `phase`, `log`, `args`, `budget`, and `workflow` globals.
- `light`, `standard`, and `deep` remain the user-visible cost choices.
- A tracked secret, a live process holding the target worktree, or a lane
  ownership collision halts the run.
- Search and research are read-only. Only the selected thought or winner receives
  mutation authority.
- Production reads remain read-only. The workflow never deploys and cannot
  claim `deployed`, `verified live`, or `released`.
- The workflow returns a structured result and writes an evidence handoff to
  `.suede-ship/<runKey>/handoff.md` through the calling agent. `runKey` is the
  validated unique `ship-<UUID>` leaf of the workflow-created worktree; the
  Workflow VM does not expose the host run ID. If Scout returns an invalid path
  before that key can be validated, the caller reports the halt without
  writing a run-keyed handoff.
- The JavaScript runner is supported in Claude Code on macOS. It requires
  registered Suede Ship agent profiles and `sandbox-exec`. Scout's exact setup
  command probes `sandbox-exec` before fetch or worktree creation. If invoked
  and rejected, it exits before repo mutation. The structured Scout response is
  a model attestation, not a host receipt. Codex and generic skill-only installs
  receive the orchestration contract, not a claim that this Claude Workflow
  runner executed.

## Runtime Shape

The workflow remains one self-executing JavaScript file. The current workflow
runner evaluates that file with injected globals and does not establish a
portable relative-module contract. Keeping the engine in the entry file avoids
introducing a Python dependency or an unverified module loader. Pure helper
functions and operation constructors give the file internal boundaries and
allow the real workflow to be exercised through its existing test harness.

The entry file is organized in this order:

1. metadata, budgets, schemas, and immutable value helpers;
2. graph construction and validation;
3. operation execution and tracing;
4. Suede operation adapters and prompts;
5. scout and hard safety gates;
6. read-only thought search;
7. winner-only build, review, repair, gate, release check, and handoff.

Plugin installs resolve qualified agent names such as
`suede-skills:suede-ship-verifier`; the focused workflow plugin uses its own
namespace. Because the Workflow VM does not expose Node `process`, the full
and focused callers explicitly pass `agentNamespace: "suede-skills"` or
`agentNamespace: "suede-agent-workflows"`. The clone installer copies the same
definitions to `~/.claude/agents`, where callers pass an empty namespace string
to select their bare names. A missing or unknown namespace halts before the
first agent call. A manual single-skill Claude install must copy those profiles
too.

## Core Data Model

### Thought

Every operation emits new immutable thought records:

```js
{
  id: "thought-17",
  parentIds: ["thought-8", "thought-11"],
  operationId: "aggregate-plans",
  operation: "Aggregate",
  depth: 4,
  state: { plan, evidence, objections, ... },
  score: null | {
    total: 0,
    coverage: 0,
    evidence: 0,
    feasibility: 0,
    safety: 0,
    efficiency: 0,
    rationale: "..."
  },
  status: "active" | "kept" | "pruned" | "refuted" | "selected"
}
```

Operations clone state rather than mutate predecessor thoughts. `parentIds`
are one-to-many for generation and many-to-one for aggregation, preserving the
full lineage in the final trace.

### Operation

```js
{
  id: "score-generated-plans",
  type: "Score",
  predecessorIds: ["generate-plans"],
  config: { ... }
}
```

Operation IDs are unique. Every predecessor must exist. A deterministic
topological sort rejects cycles and unreachable operations before any agent is
spawned.

### Trace

Each operation records its input thought IDs, output thought IDs, agent calls,
pruning reason, and budget state. The result exposes:

- `graph.operations` in execution order;
- `graph.thoughts`, including pruned and refuted candidates;
- `graph.winnerId` and its complete lineage;
- `graph.budget` with projected, used, and remaining calls;
- `graph.dropped`, never silently discarded.

## Operations

### Generate

Generate independent candidate lane plans from the closed research set. One
agent response produces one plan so failures and provenance remain isolated.
Each plan must cover the full requested scope, own explicit files, name
acceptance commands, and cite evidence.

### Score

Score each candidate independently using the same five 0–20 dimensions:

- scope and contract coverage;
- evidence quality;
- implementation feasibility;
- safety and reversibility;
- efficiency within the selected budget.

The sum is 0–100. Invalid numeric values are rejected. Ties resolve
deterministically by coverage, then safety, then evidence, then thought ID.

### Refute

Two independent adversaries attack each retained candidate from different
lenses:

- contract adversary: missing requirements, unsupported assumptions, and
  evidence gaps;
- failure adversary: collision, rollback, security, test, and integration
  failure scenarios.

A candidate is hard-refuted only when both adversaries identify the same
concrete blocking defect. Disputed or non-blocking objections are preserved as
improvement input. Deterministic safety validators retain veto power regardless
of model votes.

### KeepBestN

Keep the highest-ranked candidates up to the configured beam width. Every
discarded candidate receives a structured pruning reason and remains in the
trace. An unscored candidate cannot pass this operation.

### Improve

Improve each survivor once per configured round using its score breakdown,
adversarial objections, and the original evidence set. An improved thought
points to the candidate it supersedes; it cannot erase prior lineage or claim
new evidence without a source.

### Aggregate

Combine the strongest compatible lanes from all final survivors. Aggregation
must preserve full scope coverage and reject overlapping file ownership before
the aggregate is accepted. The aggregate has every contributing survivor as a
parent. If no safe aggregate exists, select the highest-scoring complete
survivor rather than force a merge.

### Select

Run a final score and deterministic validation over aggregates and fallback
survivors. Exactly one complete, collision-free thought becomes `selected`.
If none qualifies, halt without mutation and return the graph trace.

## Concrete Search Topology

```text
Scout (hard gate)
  -> parallel research lenses
  -> completeness critic + bounded evidence fills
  -> Generate candidate plans
  -> Score candidates
  -> KeepBestN
  -> parallel Refute pairs
  -> Improve survivors
  -> Score improved candidates
  -> KeepBestN
  -> Aggregate compatible candidates
  -> final Score + deterministic Select
  -> winner-only Build lanes
  -> Review -> Refute findings -> bounded Fix
  -> Gate -> read-only Release check -> Handoff
```

Research is shared by every candidate. The graph therefore branches after the
evidence set closes and converges before code mutation.

## Budgets

The cost choice controls graph breadth rather than merely lane count:

| Budget | Generated plans | Beam width | Improve rounds | Max lanes | Refute findings/lane | Total agent ceiling |
|---|---:|---:|---:|---:|---:|---:|
| `light` | 3 | 1 | 1 | 3 | 2 | 55 |
| `standard` | 5 | 2 | 1 | 5 | 4 | 110 |
| `deep` | 8 | 3 | 2 | 8 | 6 | 200 |

Before launching, the skill reports the selected range and projected calls.
Every agent spawn goes through one budget ledger. Exhaustion halts before the
next call and returns the trace; it never silently drops scope or findings.

## Safety and Authority

The Scout phase runs before graph search and remains authoritative. Before the
search, an independent read-only verifier must confirm the reported path is a
clean registered worktree at `origin/main`, shares the repo's Git common
directory, is one direct child of `${REPO}.worktrees`, and contains no symlink,
directory, out-of-worktree candidate path, or case/Unicode-normalized path
alias. Claude-managed nested worktrees are not accepted. Scout parses NUL-delimited Git
porcelain, exact `lsof -Fn` CWD fields, and fails closed when a safety manifest
would truncate. It retains dirty or live sibling claims even when committed
history is cherry-landed. Candidate thoughts cannot weaken
or reinterpret those facts or hazards. A plan is ineligible when:

- it owns a dirty user file without an isolated base;
- it overlaps another lane's files;
- it overlaps a live sibling worktree claim;
- it requests a protected, generated, directory-like, or non-Scout candidate
  path;
- it changes deploys, credentials, production data, or external state without
  explicit authority;
- it omits a requested scope item or acceptance command.

Local research, planning, scoring, review, and handoff agents use a fixed profile
with no Bash, write, web, task, skill, or MCP tools. Public web research and
release agents have web tools but no local-file or shell tools. Build and Fix
agents have read tools only and return unified diffs for their selected files.
One Bash-only applier receives a single exact Node command that validates and
applies the accepted patch bundle. Patch validation rejects symlinks, gitlinks,
binary patches, renames, copies, and file-type transitions. Every Apply and its
independent Bash-only verifier are budget-reserved together; the verifier runs
immediately after mutation and before any reader receives the worktree.

Gate is macOS-only. Every acceptance command is wrapped in `sandbox-exec` with
network denied. It changes into the attested worktree and permits reads only
from that worktree, its `.git` common directory derived inside the exact clamped
Gate wrapper, runtime/system roots, and a private per-run temp root. The
model-reported common directory cannot widen the sandbox. Writes are limited to generated-artifact
roots and that private temp root. The command allowlist covers bounded local
validation for Node, Python, Go, Rust, Make, Swift Package Manager, Xcode
simulator builds whose derived data stays under the private temp root, and
offline Gradle checks. A selected file below a nested module's `src` tree may
add only that module's `build` directory, after symlink and realpath validation,
to the write roots. The workflow reserves Gate and its post-Gate
audit together. The latest immediate post-Apply and post-Gate attestations compare the exact
changed-path set and a SHA-256 digest over the binary Git diff plus every
reported file's mode, size, and bytes, including untracked additions, so a
validation script cannot silently rewrite selected source without forcing a
hold.

Applying a bounded blocker repair does not establish that the original failure
scenario is gone. Those findings remain in
`fixedBlockersPendingVerification`; they force an advisory `hold` until an
independent follow-up performs targeted semantic verification.

The runner contract is not stronger than the host API. `bashCommandClamp`
restricts Bash when invoked, but Claude Workflow does not provide a trusted
required-tool-call receipt. Structured apply and verification results are model
attestations, not cryptographic proof that the command ran. A Gate agent may
report that every restricted command passed, but the workflow records that only
as `claimedPassed`, forces `passed:false` and `gateVerified:false`, and requires
the handoff status to remain `held` until a trusted outer runner supplies
immutable execution receipts. The `authority`,
`allowedRepo`, `allowedFiles`, and `allowedCommands` options are evidence labels,
not filesystem controls, and local read tools are not path-sandboxed. The design
therefore claims capability separation and fail-closed validation, not
host-certified execution.

Lane plans do not contain a free-form task or executable command field. Build
requirements are derived from the exact user-scope items in `scopeMap`; the only
agent-proposed command is one exact form from the local validation allowlist,
with no arbitrary path or flag suffix. This prevents
an otherwise safe candidate from smuggling a new external side effect into Build.

## Failure Handling

- Malformed agent output is one failed thought or score, not a graph crash.
- A failed operation is recorded with its inputs and error.
- Independent ready operations still execute when one sibling fails.
- A read-only search fan-out reserves its whole call cost before starting; a
  post-build fan-out that encounters a budget or agent failure returns every
  fulfilled sibling result before halting.
- A dependent operation with no valid inputs is skipped and traced.
- Cycle, duplicate-ID, missing-predecessor, and budget errors halt before
  mutation.
- No safe winner means `HALT`, with candidate and objection evidence attached.

## Compatibility and Routing

The skill remains for nontrivial, multi-file repository changes. It is not for
findings-only review, CI/branch-protection wiring, bulk independent generation,
or copy-only work. Trigger metadata changes from a generic “shipping DAG” to
“Graph-of-Thoughts shipping search” while retaining enough routing language to
avoid collisions with neighboring skills.

## Licensing

The JavaScript operation model is an adaptation of ETH Zurich's Graph of
Thoughts implementation. The repository will:

- add `licenses/graph-of-thoughts-BSD.txt` with the complete upstream license;
- retain the upstream copyright and adaptation notice in the workflow;
- add a Graph of Thoughts section to `NOTICE.md`;
- revise the repository-wide “everything else” statement so the adapted
  component is not represented as solely Suede/MIT;
- cite the AAAI 2024 paper named in the upstream license.

Suede's `Refute`, safety policy, scoring rubric, mutation boundary, prompts,
and shipping topology remain Suede-owned additions.

## Verification

Behavioral tests drive the real workflow with deterministic agent fixtures.
They must prove:

- multiple candidates are generated and independently scored;
- score ties prune deterministically;
- refuted candidates cannot win;
- improvement preserves lineage;
- aggregation records multiple parents and rejects file collisions;
- graph budget exhaustion stops before an extra spawn;
- malformed outputs and empty branches remain visible in the trace;
- only the selected plan reaches Build;
- every agent call resolves to a registered fixed tool profile;
- plugin, focused-plugin, and clone installs resolve the correct qualified or
  bare agent names;
- patch application is clamped and pre/post-Gate diff digests match;
- the Gate plus post-Gate verifier reserve as one safety batch;
- existing secret, live-worktree, production-read, and no-deploy boundaries
  remain enforced;
- every budget stays under its advertised ceiling;
- the final handoff names the winner, lineage, scores, refutations, pruned
  candidates, unverified findings, gates, and release caveats.

The complete pack, trigger routing, MCP retrieval, generated book/docs, license
notices, and installer smoke test must also pass.

## Non-goals

- No Python runtime or external Graph-of-Thoughts package dependency.
- No learned topology optimizer.
- No production deployment, merge, push, or public release.
- No portable Linux/Windows Gate sandbox and no claim that Codex executes the
  Claude Workflow runner.
- No rewrite of `suede-ship-copy`; only its cross-reference may change.
- No code mutation across competing candidate branches.
