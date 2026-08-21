# Suede Ship Graph-of-Thoughts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `suede-ship`'s fixed single-plan DAG with a bounded Graph-of-Thoughts search that branches, scores, prunes, adversarially improves, aggregates, and selects a safe plan before any source mutation.

**Architecture:** Keep the workflow as one self-executing JavaScript file so its injected-global runner ABI remains intact. Adapt ETH Zurich's `Thought`, operation graph, readiness scheduler, `Generate`, `Score`, `KeepBestN`, `Improve`, and `Aggregate` concepts; add Suede `Refute`, deterministic plan validation, a total-call ledger, and winner-only mutation. Exercise the real workflow through its existing `AsyncFunction` harness rather than exposing test-only production APIs.

**Tech Stack:** Node.js 22, JavaScript workflow scripts, `node:test`, JSON schemas, Markdown/HTML skill catalog, repository validation scripts.

**Spec:** `docs/superpowers/specs/2026-08-21-suede-ship-graph-of-thoughts-design.md`

## Global Constraints

- Work only in the isolated task worktree on `codex/suede-ship-got-20260821`, based on `origin/main` at `b4d5970`.
- Preserve the dirty sibling worktree for the setup task without reading, resetting, deleting, or reusing it.
- Keep the workflow runner ABI: injected `args`, `agent`, `parallel`, `pipeline`, `phase`, `log`, `budget`, and `workflow` globals; no Python runtime and no new package dependency.
- Preserve the invocation arguments `repo`, `scope`, `deploys`, `liveUrl`, `agentBudget`, and `vault`.
- Search remains read-only; only the selected plan can reach Build or mutate source.
- Tracked secrets, target live-worktree conflicts, selected-plan file collisions, missing safe winner, and exhausted total-call budgets halt before the next mutation.
- Production access remains read-only; the workflow never deploys and never claims `deployed`, `verified live`, or `released`.
- Budget ceilings are exactly `light: 55`, `standard: 110`, and `deep: 200` agent calls.
- Adapted Graph-of-Thoughts code retains the ETH Zurich BSD terms and cites upstream commit `3d9d9dbd8937d47a4441f681b8b40e3c5b054f16`.
- Follow strict red-green-refactor: every new runtime behavior gets a failing test that is observed before implementation.

---

### Task 1: Graph generation, scoring, pruning, and immutable lineage

**Files:**
- Modify: `tests/test_ship_workflow_cost.mjs`
- Modify: `skills/suede-ship/workflows/suede-ship.js`

**Interfaces:**
- Consumes: the current workflow `AsyncFunction` harness and injected agent runtime.
- Produces: `result.graph.operations`, `result.graph.thoughts`, `result.graph.pruned`, `result.graph.winnerId`; internal `createThought`, `createOperation`, `addOperation`, `validateOperationGraph`, `executeOperationGraph`, and `rankThoughts` functions.

- [ ] **Step 1: Replace the single-plan fixture with candidate-aware responses**

Use literal plan and score fixtures keyed by operation labels. `runShip` passes
its options into `fixture`, and the agent recorder stores the complete options:

```js
const plan = (name, file, acceptance = 'node --test') => ({
  summary: name,
  coverage: ['change the thing'],
  lanes: [{ name, task: `implement ${name}`, files: [file], tier: 'integration', acceptance }],
})

const defaultNames = ['safe-a', 'safe-b', 'weak-c', 'weak-d', 'weak-e', 'weak-f', 'weak-g', 'weak-h']
const tieNames = ['coverage-wins', 'safety-wins', 'evidence-third', 'weak-d', 'weak-e']

case 'Generate': {
  const index = Number(label.split(':').at(-1))
  const name = (scoreMode === 'ties' ? tieNames : defaultNames)[index]
  return plan(name, `src/${name}.ts`)
}
case 'Score': {
  if (scoreMode === 'ties') {
    if (prompt.includes('coverage-wins')) return { coverage: 20, evidence: 14, feasibility: 16, safety: 15, efficiency: 15, total: 80, rationale: 'coverage tie break' }
    if (prompt.includes('safety-wins')) return { coverage: 19, evidence: 14, feasibility: 16, safety: 16, efficiency: 15, total: 80, rationale: 'safety tie break' }
    if (prompt.includes('evidence-third')) return { coverage: 19, evidence: 13, feasibility: 17, safety: 16, efficiency: 15, total: 80, rationale: 'evidence loses tie' }
  }
  const total = prompt.includes('safe-a') ? 88 : prompt.includes('safe-b') ? 82 : 40
  return { coverage: total === 40 ? 4 : 18, evidence: 18, feasibility: 18, safety: 18, efficiency: total === 40 ? 0 : total - 72, total, rationale: `literal score ${total}` }
}
```

Keep Scout, Research, Gaps, Build, Review, Gate, Release, and Handoff fixtures complete so tests exercise the real workflow boundary.

- [ ] **Step 2: Write failing behavioral tests for branching, scoring, pruning, and lineage**

Add tests whose hand-derived expectations prove the operation behavior:

```js
async function loadGraphCore () {
  const prefix = SOURCE.split('// ---------------------------------------------------------------- 0. scout')[0]
    .replace('export const meta', 'const meta')
  const load = new AsyncFunction('args', 'budget', `${prefix}\nreturn { createOperation, validateOperationGraph }`)
  return load({ repo: '/tmp/repo', scope: 'change the thing', agentBudget: 'standard' }, { total: null })
}

test('Graph of Thoughts generates independent plans and deterministically prunes to the configured beam', async () => {
  const { result } = await runShip({ agentBudget: 'standard', lanes: 1, findingsPerLens: 0 })
  assert.equal(result.graph.thoughts.filter(t => t.operation === 'Generate').length, 5)
  const pruned = result.graph.pruned.filter(t => t.operationId === 'keep-generated')
  assert.equal(pruned.length, 3)
  assert.ok(pruned.some(t => t.state.plan.summary === 'weak-c'))
  assert.equal(result.graph.operations.find(op => op.id === 'keep-generated').type, 'KeepBestN')
})

test('score ties resolve by coverage then safety then evidence then thought id', async () => {
  const { result } = await runShip({ scoreMode: 'ties', findingsPerLens: 0 })
  const kept = result.graph.thoughts.filter(t => t.operationId === 'keep-generated' && t.status === 'kept')
  assert.deepEqual(kept.map(t => t.state.plan.summary), ['coverage-wins', 'safety-wins'])
})

test('every derived thought keeps immutable parent lineage', async () => {
  const { result } = await runShip({ findingsPerLens: 0 })
  const generated = result.graph.thoughts.filter(t => t.operation === 'Generate')
  const scored = result.graph.thoughts.filter(t => t.operationId === 'score-generated')
  assert.ok(Object.isFrozen(generated[0]))
  assert.deepEqual(scored.map(t => t.parentIds.length), Array(scored.length).fill(1))
  assert.deepEqual(generated.map(t => t.score), Array(generated.length).fill(null))
})

test('operation graph validation rejects missing predecessors and cycles before execution', async () => {
  const { createOperation, validateOperationGraph } = await loadGraphCore()
  const missing = [createOperation({ id: 'a', type: 'Generate', predecessorIds: ['absent'], execute: async () => [] })]
  assert.throws(() => validateOperationGraph(missing), /unknown predecessor absent/)
  const cycle = [
    createOperation({ id: 'a', type: 'Generate', predecessorIds: ['b'], execute: async () => [] }),
    createOperation({ id: 'b', type: 'Score', predecessorIds: ['a'], execute: async () => [] }),
  ]
  assert.throws(() => validateOperationGraph(cycle), /cycle/)
})
```

`loadGraphCore` evaluates the real workflow prefix through the same
`AsyncFunction` mechanism as `runShip`, stopping at the Scout marker and
returning the named pure helpers. It does not copy their logic into the test.
Name the break each test catches: collapsed branching, unstable ranking,
predecessor mutation, missing dependency acceptance, or cyclic scheduling.

- [ ] **Step 3: Run the focused test and observe the expected red state**

Run:

```bash
node --test tests/test_ship_workflow_cost.mjs
```

Expected: failures because `result.graph` and the `Generate`/`Score`/`KeepBestN` operation phases do not exist.

- [ ] **Step 4: Implement the minimal operation graph and first search segment**

Port the upstream operation relationships and readiness scheduler into the workflow, with deterministic validation:

```js
const OPERATION_TYPES = Object.freeze({
  Generate: 'Generate', Score: 'Score', KeepBestN: 'KeepBestN',
  Refute: 'Refute', Improve: 'Improve', Aggregate: 'Aggregate', Select: 'Select',
})

const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

const createThought = ({ id, parentIds = [], operationId, operation, depth, state, score = null, status = 'active' }) =>
  Object.freeze({ id, parentIds: Object.freeze([...parentIds]), operationId, operation, depth,
    state: deepFreeze(structuredClone(state)), score: score && deepFreeze({ ...score }), status })

const createOperation = ({ id, type, predecessorIds = [], execute }) => ({
  id, type, predecessorIds: [...predecessorIds], successorIds: [], execute,
  executed: false, status: 'pending', thoughtIds: [],
})

const rankThoughts = thoughts => [...thoughts].sort((a, b) =>
  b.score.total - a.score.total || b.score.coverage - a.score.coverage ||
  b.score.safety - a.score.safety || b.score.evidence - a.score.evidence ||
  a.id.localeCompare(b.id))
```

Build and validate an operation graph with unique IDs, known predecessors, cycle detection, and deterministic ready-order execution. Implement `Generate`, `Score`, and `KeepBestN` so every transformation emits a new thought, all pruned thoughts remain in the trace, and malformed/unscored candidates cannot be retained.

- [ ] **Step 5: Run focused tests to green and refactor without changing behavior**

Run:

```bash
node --test tests/test_ship_workflow_cost.mjs
node --check skills/suede-ship/workflows/suede-ship.js
```

Expected: all Task 1 behavior tests pass and syntax check exits 0.

- [ ] **Step 6: Commit the independently working search core**

```bash
git add tests/test_ship_workflow_cost.mjs skills/suede-ship/workflows/suede-ship.js
git commit -m "feat: add suede ship thought graph core"
```

---

### Task 2: Adversarial refutation, improvement, aggregation, and winner-only mutation

**Files:**
- Modify: `tests/test_ship_workflow_cost.mjs`
- Modify: `skills/suede-ship/workflows/suede-ship.js`

**Interfaces:**
- Consumes: Task 1 operation graph and scored candidate thoughts.
- Produces: `Refute`, `Improve`, `Aggregate`, and `Select` operation traces; `result.selectedPlan`; build calls scoped exclusively to that plan.

- [ ] **Step 1: Add complete adversary, improvement, and aggregation fixtures**

Use schemas with literal observable state:

```js
case 'RefutePlan':
  return prompt.includes('unsafe-plan')
    ? { defects: [{ kind: 'collision', lane: 'unsafe', blocking: true, claim: 'two lanes own src/shared.ts', evidence: 'plan lanes 0 and 1' }] }
    : { defects: [], notes: 'no reproducible blocker' }
case 'Improve':
  return plan('improved-safe', 'src/improved.ts')
case 'Aggregate':
  return {
    summary: 'aggregate-safe', coverage: ['change the thing'],
    lanes: [
      { name: 'a', task: 'implement a', files: ['src/a.ts'], tier: 'integration', acceptance: 'node --test' },
      { name: 'b', task: 'implement b', files: ['src/b.ts'], tier: 'integration', acceptance: 'node --test' },
    ],
  }
```

- [ ] **Step 2: Write failing tests for refutation, convergence, and authority**

```js
test('two matching adversaries hard-refute a candidate so it cannot win', async () => {
  const { result } = await runShip({ includeUnsafePlan: true, findingsPerLens: 0 })
  const unsafe = result.graph.thoughts.find(t => t.state.plan?.summary === 'unsafe-plan' && t.status === 'refuted')
  assert.ok(unsafe)
  assert.notEqual(result.graph.winnerId, unsafe.id)
})

test('Improve preserves its predecessor and Aggregate records every contributing parent', async () => {
  const { result } = await runShip({ findingsPerLens: 0 })
  const improved = result.graph.thoughts.find(t => t.operation === 'Improve')
  const aggregate = result.graph.thoughts.find(t => t.operation === 'Aggregate')
  assert.equal(improved.parentIds.length, 1)
  assert.equal(aggregate.parentIds.length, 2)
  assert.ok(aggregate.parentIds.every(id => result.graph.thoughts.some(t => t.id === id)))
})

test('only lanes from the selected thought receive mutation authority', async () => {
  const { result, calls } = await runShip({ findingsPerLens: 0 })
  const built = calls.filter(c => c.phase === 'Build').map(c => c.label)
  assert.deepEqual(built, result.selectedPlan.lanes.map(lane => `build:${lane.name}`))
  assert.ok(calls.filter(c => ['Generate', 'Score', 'RefutePlan', 'Improve', 'Aggregate'].includes(c.phase))
    .every(c => c.authority === 'read-only'))
  assert.ok(calls.filter(c => c.phase === 'Build').every(c => c.authority === 'write-selected-plan'))
})
```

- [ ] **Step 3: Run the new tests and observe the expected red state**

Run:

```bash
node --test --test-name-pattern='refute|Improve|Aggregate|mutation authority' tests/test_ship_workflow_cost.mjs
```

Expected: failures because the current graph stops after pruning and still builds the old single plan.

- [ ] **Step 4: Implement the remaining thought operations**

Add schemas:

```js
const PLAN_SCORE = {
  type: 'object', required: ['coverage', 'evidence', 'feasibility', 'safety', 'efficiency', 'total', 'rationale'],
  properties: Object.fromEntries(['coverage', 'evidence', 'feasibility', 'safety', 'efficiency', 'total']
    .map(key => [key, { type: 'number', minimum: 0, maximum: key === 'total' ? 100 : 20 }]).concat([
      ['rationale', { type: 'string' }],
    ])),
}

const PLAN_REFUTATION = {
  type: 'object', required: ['defects', 'notes'], properties: {
    defects: { type: 'array', maxItems: 6, items: { type: 'object',
      required: ['kind', 'lane', 'blocking', 'claim', 'evidence'], properties: {
        kind: { type: 'string', enum: ['missing-scope', 'constraint-break', 'collision', 'unverifiable', 'rollback', 'security', 'test-gap', 'integration-order', 'other'] },
        lane: { type: 'string' }, blocking: { type: 'boolean' }, claim: { type: 'string' }, evidence: { type: 'string' },
      } } }, notes: { type: 'string' },
  },
}
```

Run two distinct adversary prompts per kept candidate. Pass `authority: 'read-only'` on every Generate, Score, RefutePlan, Improve, and Aggregate call, and `authority: 'write-selected-plan'` only on Build. Hard-refute only when both adversaries return a blocking defect with the same normalized `kind` and `lane`; carry all other objections into `Improve`. For every configured round, improve and rescore each survivor before `KeepBestN`. Aggregate only two or more survivors, validate file ownership deterministically, then select the highest complete valid thought. Fall back to the best complete survivor if aggregation is malformed or colliding. If no valid thought exists, return `halted: true` before Build.

- [ ] **Step 5: Run the focused suite to green**

```bash
node --test tests/test_ship_workflow_cost.mjs
node --check skills/suede-ship/workflows/suede-ship.js
```

Expected: all graph and existing workflow behaviors pass.

- [ ] **Step 6: Commit the adversarial convergence path**

```bash
git add tests/test_ship_workflow_cost.mjs skills/suede-ship/workflows/suede-ship.js
git commit -m "feat: select plans through adversarial graph search"
```

---

### Task 3: Total-call budgets, failure trace, safety regression coverage, and handoff evidence

**Files:**
- Modify: `tests/test_ship_workflow_cost.mjs`
- Modify: `skills/suede-ship/workflows/suede-ship.js`

**Interfaces:**
- Consumes: selected thought and existing Scout/Build/Review/Gate/Release flow.
- Produces: `result.graph.budget`, `result.graph.dropped`, explicit budget halt results, and graph evidence in the Handoff prompt.

- [ ] **Step 1: Write failing budget and safety tests**

```js
test('the total-call ledger halts before spawning call ceiling plus one', async () => {
  const { result, calls } = await runShip({ agentBudget: 'light', forceAgentCeiling: 4 })
  assert.equal(calls.length, 4)
  assert.equal(result.halted, true)
  assert.equal(result.reason, 'agent budget exhausted')
  assert.deepEqual(result.graph.budget, { name: 'light', ceiling: 4, used: 4, remaining: 0 })
})

test('a tracked secret halts before Generate and Build', async () => {
  const { result, calls } = await runShip({ blockingHazard: 'secret' })
  assert.equal(result.reason, 'blocking hazard at scout')
  assert.equal(calls.some(c => c.phase === 'Generate' || c.phase === 'Build'), false)
})

test('a colliding aggregate falls back to a safe survivor and records the rejection', async () => {
  const { result } = await runShip({ aggregateCollision: true, findingsPerLens: 0 })
  assert.equal(result.selectedPlan.summary, 'improved-safe')
  assert.ok(result.graph.dropped.some(item => item.reason === 'aggregate file collision'))
})

test('malformed candidates stay visible and no safe winner halts before Build', async () => {
  const { result, calls } = await runShip({ malformedPlans: true, rejectEveryPlan: true })
  assert.equal(result.halted, true)
  assert.equal(result.reason, 'no safe graph winner')
  assert.ok(result.graph.dropped.some(item => item.reason === 'malformed generated plan'))
  assert.equal(calls.some(c => c.phase === 'Build'), false)
})

test('a live target worktree and a selected-plan collision both halt before Build', async () => {
  for (const options of [{ blockingHazard: 'live-worktree' }, { selectedPlanCollision: true }]) {
    const { result, calls } = await runShip(options)
    assert.equal(result.halted, true)
    assert.equal(calls.some(c => c.phase === 'Build'), false)
  }
})

test('release verification receives read-only authority and never a deployment authority', async () => {
  const { calls } = await runShip({ deploys: true, findingsPerLens: 0 })
  const releaseCalls = calls.filter(c => c.phase === 'Release')
  assert.equal(releaseCalls.length, 4)
  assert.ok(releaseCalls.every(c => c.authority === 'read-only-production'))
  assert.equal(calls.some(c => c.authority === 'deploy'), false)
})

test('handoff receives the winner lineage, scores, pruned candidates, and objections', async () => {
  const { calls } = await runShip({ findingsPerLens: 0 })
  const handoffCall = calls.find(c => c.phase === 'Handoff')
  for (const marker of ['Winning thought', 'Lineage', 'Scores', 'Pruned candidates', 'Plan refutations', 'Agent budget']) {
    assert.match(handoffCall.prompt, new RegExp(marker))
  }
})
```

Update the harness to record `prompt` and allow a test-only ceiling through the injected `budget.total` fixture instead of adding a production-only argument.

- [ ] **Step 2: Run and observe the expected failures**

```bash
node --test --test-name-pattern='ledger|secret|colliding aggregate|handoff receives' tests/test_ship_workflow_cost.mjs
```

Expected: missing graph budget/dropped fields and unguarded agent calls fail the tests.

- [ ] **Step 3: Route every agent spawn through one ledger and preserve failures**

Use one wrapper for Scout through Handoff:

```js
const ceiling = Number.isFinite(budget && budget.total) ? Math.min(BUDGET.totalAgentCeiling, budget.total) : BUDGET.totalAgentCeiling
let agentCalls = 0
const callAgent = async (prompt, options = {}) => {
  if (agentCalls >= ceiling) throw Object.assign(new Error('agent budget exhausted'), { code: 'AGENT_BUDGET_EXHAUSTED' })
  agentCalls += 1
  return agent(prompt, options)
}
const budgetSnapshot = () => ({ name: BUDGET_NAME, ceiling, used: agentCalls, remaining: ceiling - agentCalls })
```

Catch only `AGENT_BUDGET_EXHAUSTED` at the outer workflow boundary, record the current operation and inputs in `graph.dropped`, and return a halt result. Do not catch programming errors. Treat null or schema-invalid candidate responses as dropped thoughts with an explicit reason. Pass `authority: 'read-only-production'` on every Release call and no deployment authority anywhere. Include complete search evidence in the handoff prompt and returned result.

- [ ] **Step 4: Recalculate and test the documented worst cases**

Keep literal ceilings and assert both boundedness and separation:

```js
const ranges = [
  { range: 'light', lanes: 3, ceiling: 55 },
  { range: 'standard', lanes: 5, ceiling: 110 },
  { range: 'deep', lanes: 8, ceiling: 200 },
]
```

Run:

```bash
npm run test:ship-cost
```

Expected: all ship and ship-copy cost tests pass; no stale `~115` comment remains.

- [ ] **Step 5: Commit the bounded safety and evidence contract**

```bash
git add tests/test_ship_workflow_cost.mjs skills/suede-ship/workflows/suede-ship.js
git commit -m "test: enforce graph search safety and budgets"
```

---

### Task 4: Skill contract, trigger routing, catalog metadata, and upstream licensing

**Files:**
- Modify: `skills/suede-ship/SKILL.md`
- Modify: `skills/suede-ship/agents/openai.yaml`
- Modify: `mcp/catalog.json`
- Modify: `tests/fixtures/trigger-routing.json`
- Modify: `NOTICE.md`
- Create: `licenses/graph-of-thoughts-BSD.txt`
- Modify: `COPY.md`

**Interfaces:**
- Consumes: the runtime operation names, budgets, result contract, and boundaries from Tasks 1–3.
- Produces: precise activation/routing instructions, updated UI prompt, catalog parity, pressure prompts, and compliant attribution.

- [ ] **Step 1: Add routing pressure cases before changing metadata**

Add cases that distinguish graph search from nearby skills:

```json
{
  "id": "suede-ship-graph-positive",
  "mode": "positive",
  "prompt": "Search several implementation plans, score and prune them, have adversarial agents attack the survivors, aggregate the best lanes, then build and gate the winner.",
  "expected": "suede-ship"
},
{
  "id": "suede-ship-findings-negative",
  "mode": "negative",
  "prompt": "Review this existing diff and report findings, but do not change code.",
  "expected": "suede-code-review",
  "forbidden": ["suede-ship"]
}
```

Run `npm run test:triggers` and observe failure because current metadata lacks the Graph-of-Thoughts routing signal.

- [ ] **Step 2: Rewrite the skill as the executable graph-search contract**

Keep frontmatter trigger-only and move operation details into the body. The description must contain `Graph-of-Thoughts shipping search`, the multi-file repo trigger, and explicit `NOT FOR:` neighbors. The body must:

- ask for missing repo/scope and the `light|standard|deep` budget;
- state exact ceilings `55|110|200` before launch;
- route to `workflows/suede-ship.js`;
- describe Generate, Score, KeepBestN, Refute, Improve, Aggregate, Select, and winner-only mutation;
- preserve halt and deployment boundaries;
- require writing `.suede-ship/${runId}/handoff.md`, where `runId` is the workflow's returned identifier;
- route bulk work to `suede-codex-fleet`, findings-only review to `suede-code-review`, CI wiring to `suede-ci-gate`, and copy to `suede-ship-copy`.

Update `agents/openai.yaml` and the `mcp/catalog.json` description/default prompt with the same contract and no stale “roughly fifty” claim.

- [ ] **Step 3: Add the upstream license and notice verbatim**

Copy `/tmp/graph-of-thoughts.G3zsbq/LICENSE` byte-for-byte into `licenses/graph-of-thoughts-BSD.txt` using `apply_patch`. Add a `Graph of Thoughts — ETH Zurich` section to `NOTICE.md` naming the upstream repository, pinned commit, adapted operation files, BSD license path, and AAAI 2024 paper. Change the final notice sentence to exclude all listed third-party adaptations from the repository-wide Suede/MIT statement.

Add this header at the top of the adapted workflow:

```js
// Operation graph and thought-state model adapted from Graph of Thoughts.
// Copyright (c) 2023 ETH Zurich. All rights reserved.
// BSD terms: licenses/graph-of-thoughts-BSD.txt
// Suede Refute, safety, authority, scoring, and shipping topology are original additions.
```

- [ ] **Step 4: Run routing and skill-estate validation**

```bash
npm run test:triggers
node scripts/validate-skill-pack.mjs --strict
python3 ~/.agents/skills/suede-skill-forge/scripts/lint_skill_estate.py skills/suede-ship
git diff --check
```

Expected: trigger cases route correctly, strict validation exits 0, the skill linter reports no blockers, and diff check is empty.

- [ ] **Step 5: Commit the public skill and license contract**

```bash
git add skills/suede-ship mcp/catalog.json tests/fixtures/trigger-routing.json NOTICE.md licenses/graph-of-thoughts-BSD.txt COPY.md
git commit -m "docs: redefine suede ship as graph search"
```

---

### Task 5: Public documentation, book source, and pack version

**Files:**
- Modify: `README.md`
- Modify: `book/03-the-description-contract.md`
- Modify: `book/05-lanes-fleets-and-collisions.md`
- Modify: `book/06-evidence-or-it-didnt-ship.md`
- Modify: `book/A1-skill-index.md`
- Modify: `docs/skills/suede-ship.html`
- Modify: `docs/skills/suede-ship-copy.html`
- Modify: `docs/skills/index.html`
- Modify: `docs/llms.txt`
- Modify: `docs/cracked.html`
- Modify: `docs/index.html`
- Modify: `docs/blog/progressive-disclosure-ship-dag-and-mcp.html`
- Modify: `VERSION`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `mcp/catalog.json`
- Modify: `.claude-plugin/plugin.json`
- Modify: `.codex-plugin/plugin.json`
- Modify: `CITATION.cff`
- Regenerate: `book/BOOK.md`
- Regenerate: `docs/book/*.html`
- Regenerate: `docs/book/s-tier.pdf`
- Regenerate: `docs/sitemap.xml`

**Interfaces:**
- Consumes: finalized skill name, budgets, topology, attribution, and routing contract.
- Produces: public docs that describe the actual graph search and synchronized version `0.15.0`.

- [ ] **Step 1: Replace current-architecture claims without rewriting history**

Every current description must say that `suede-ship` searches multiple plans and mutates only the winner. Replace old fixed-DAG and “roughly fifty agents” claims with the exact range:

```text
Graph-of-Thoughts shipping search: generate competing plans, score and prune them,
adversarially refute and improve survivors, aggregate compatible lanes, then build,
review, and gate only the selected plan. Light/standard/deep are capped at 55/110/200 calls.
```

Leave historical changelog entries about the earlier DAG intact. Add a new 2026-08-21 changelog entry for the replacement.

- [ ] **Step 2: Update the public skill page and related cross-references**

Revise metadata, JSON-LD description, terminal demo, architecture bullets, prompt example, cost disclosure, and no-deploy boundary in `docs/skills/suede-ship.html`. In `docs/skills/suede-ship-copy.html`, change only current cross-references that incorrectly call it “the same graph”; do not redesign the copy skill.

- [ ] **Step 3: Bump every pack version to `0.15.0`**

Use literal `0.15.0` in every listed version surface. Update lockfile root/package records together. Set `CITATION.cff`'s version and release date to `2026-08-21`.

- [ ] **Step 4: Regenerate derived book and sitemap artifacts**

```bash
npm run build:book
node scripts/generate-sitemap.mjs
npm run validate
```

Expected: generated artifacts match their sources and validation exits 0.

- [ ] **Step 5: Commit synchronized public surfaces**

```bash
git add README.md book docs VERSION package.json package-lock.json mcp/catalog.json .claude-plugin/plugin.json .codex-plugin/plugin.json CITATION.cff
git commit -m "docs: publish suede ship graph search contract"
```

---

### Task 6: Full verification and durable handoff

**Files:**
- Create: `<memory-vault>/05_handoffs/2026-08-21-codex-suede-ship-graph-of-thoughts.md`

**Interfaces:**
- Consumes: the complete branch diff.
- Produces: fresh verification evidence and the required Drive continuity record.

- [ ] **Step 1: Install dependencies without lifecycle scripts**

```bash
npm ci --ignore-scripts
```

Expected: exit 0 with the lockfile unchanged.

- [ ] **Step 2: Run focused workflow, routing, MCP, and syntax checks**

```bash
node --check skills/suede-ship/workflows/suede-ship.js
npm run test:ship-cost
npm run test:triggers
npm run test:mcp
```

Expected: every command exits 0 with zero test failures.

- [ ] **Step 3: Run the entire repository gate**

```bash
npm run validate
npm test
npm run ci
git diff --check origin/main...HEAD
```

Expected: all commands exit 0. If one fails, record the exact failure and repair it through a new failing regression test when the failure is behavioral.

- [ ] **Step 4: Smoke-test generic installation in an isolated home**

```bash
sandbox_root="$(mktemp -d /tmp/suede-skills-install.XXXXXX)"
env HOME="$sandbox_root" bash install.sh
test -f "$sandbox_root/.claude/skills/suede-ship/SKILL.md"
test -f "$sandbox_root/.claude/skills/suede-ship/workflows/suede-ship.js"
```

Expected: installer exits 0 and both files exist in the temporary home.

- [ ] **Step 5: Audit the final diff and requirements**

```bash
git status --short --branch
git diff --stat origin/main...HEAD
git diff --name-status origin/main...HEAD
git log --oneline --decorate origin/main..HEAD
```

Check every design-spec verification bullet against a test result or diff location. Confirm no unrelated user work entered the branch and no push, PR, deploy, or live mutation occurred.

- [ ] **Step 6: Write the Drive handoff with `apply_patch`**

The handoff must record:

```markdown
# Suede Ship Graph-of-Thoughts Rewrite

- Target: repository root
- Worktree: isolated task worktree
- Branch: codex/suede-ship-got-20260821
- Remote: https://github.com/JasonColapietro/suede-creator-skills.git
- Base: origin/main at b4d5970
- Files changed: summarize every path printed by `git diff --name-status origin/main...HEAD`, grouped by runtime, tests, skill contract, licensing, and public docs
- Commands run: list every command from Steps 1 through 5 exactly as executed
- Verification: record each command's exit status and the test pass/fail counts printed by Node
- Status: committed locally; not pushed, merged, deployed, or live-verified
- Caveats: list each remaining evidence-backed caveat; write `none` only when the final audit found none
- Next: review the local branch and explicitly authorize push/PR if desired
```

- [ ] **Step 7: Commit the handoff only if the vault is part of a Git repository**

Run:

```bash
git -C "<memory-vault>" rev-parse --is-inside-work-tree
```

If true, commit only the new handoff file using the vault's current branch conventions. If false, leave the handoff as a Drive file and report that state.
