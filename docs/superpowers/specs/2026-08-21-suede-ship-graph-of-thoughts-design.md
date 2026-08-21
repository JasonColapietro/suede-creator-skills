# Suede Ship Graph-of-Thoughts Design

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

- Invocation remains `$suede-ship` with `repo`, `scope`, `deploys`, `liveUrl`,
  `agentBudget`, and `vault` arguments.
- The workflow continues to use injected `agent`, `parallel`, `pipeline`,
  `phase`, `log`, `args`, `budget`, and `workflow` globals.
- `light`, `standard`, and `deep` remain the user-visible cost choices.
- A tracked secret, a live process holding the target worktree, or a lane
  ownership collision halts the run.
- Search and research are read-only. Only the selected aggregate receives
  mutation authority.
- Production reads remain read-only. The workflow never deploys and cannot
  claim `deployed`, `verified live`, or `released`.
- The workflow returns a structured result and writes an evidence handoff to
  `.suede-ship/<runId>/handoff.md` through the calling agent.

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
| `standard` | 5 | 2 | 1 | 5 | 4 | 95 |
| `deep` | 8 | 3 | 2 | 8 | 6 | 175 |

Before launching, the skill reports the selected range and projected calls.
Every agent spawn goes through one budget ledger. Exhaustion halts before the
next call and returns the trace; it never silently drops scope or findings.

## Safety and Authority

The Scout phase runs before graph search and remains authoritative. Candidate
thoughts cannot weaken or reinterpret its hazards. A plan is ineligible when:

- it owns a dirty user file without an isolated base;
- it overlaps another lane's files;
- it overlaps a live sibling worktree claim;
- it changes deploys, credentials, production data, or external state without
  explicit authority;
- it omits a requested scope item or acceptance command.

Build agents receive only the selected plan and their disjoint lane. Search
agents receive no mutation instruction.

## Failure Handling

- Malformed agent output is one failed thought or score, not a graph crash.
- A failed operation is recorded with its inputs and error.
- Independent ready operations still execute when one sibling fails.
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
- No rewrite of `suede-ship-copy`; only its cross-reference may change.
- No code mutation across competing candidate branches.
