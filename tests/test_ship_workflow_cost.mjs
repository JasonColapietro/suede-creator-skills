// The suede-ship DAG is fan-out billed to a model allocation, and its advertised cost
// ("roughly fifty agents") is a promise the script has to keep on a bad day, not only on
// an average one. Every stage but one has an agent count fixed by the graph. The refute
// stage does not: it spawns verifiers per REVIEW FINDING, so a change that reviews badly
// multiplies the whole run. This drives the real script with stubbed agents and counts
// the spawns under the worst input the schemas permit.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = readFileSync(path.join(ROOT, 'skills/suede-ship/workflows/suede-ship.js'), 'utf8')
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

// Worst case the schemas allow: the maximum lane count, both review lenses returning a
// full findings array, every finding distinct (so dedupe cannot help) and severity
// blocker (so nothing is filtered by severity and every survivor also wants a fix agent).
const LANES = 8
const FINDINGS_PER_LENS = 10

function runShip ({ agentBudget = 'standard', lanes = LANES, aggregateLanes, aggregateFiles, malformedAggregate = false, findingsPerLens = FINDINGS_PER_LENS, scoreMode, planMode, includeUnsafePlan = false, delayedBranch } = {}) {
  const calls = []
  const logs = []
  let findingSeq = 0

  const plan = (name, file, acceptance = 'node --test') => ({
    summary: name,
    coverage: ['change the thing'],
    lanes: [{ name, task: `implement ${name}`, files: [file], tier: 'integration', acceptance }],
  })
  const defaultNames = ['safe-a', 'safe-b', 'weak-c', 'weak-d', 'weak-e', 'weak-f', 'weak-g', 'weak-h']
  const tieNames = ['coverage-wins', 'safety-wins', 'evidence-third', 'weak-d', 'weak-e']

  const fixture = (opts, prompt = '') => {
    const label = opts.label || ''
    switch (opts.phase) {
      case 'Scout':
        return {
          worktreePath: '/tmp/repo.worktrees/ship-test',
          baseSha: 'deadbeef',
          dirtyFiles: [],
          candidateFiles: ['src/a.ts'],
          siblingClaims: [],
          hazards: [{ kind: 'secret', blocking: false, detail: 'no secrets found' }],
        }
      case 'Research':
        return { lens: label, facts: [], constraints: [], unread: [] }
      case 'Gaps':
        if (label.startsWith('gap:')) return { lens: label, facts: [], constraints: [], unread: [] }
        if (label === 'skeptic:constraints') return { audited: [] }
        return { gaps: [] }
      case 'Plan':
        if (label === 'redteam:plan') return { objections: [] }
        return {
          lanes: Array.from({ length: lanes }, (_, i) => ({
            name: `lane${i}`,
            task: 'do the thing',
            files: [`src/lane${i}.ts`],
            tier: 'integration',
            acceptance: 'npm test',
          })),
        }
      case 'Generate': {
        const index = Number(label.split(':').at(-1))
        const name = includeUnsafePlan && index === 0
          ? 'unsafe-plan'
          : (scoreMode === 'ties' ? tieNames : defaultNames)[index]
        const candidate = plan(name, `src/${name}.ts`)
        if (planMode === 'malformed') {
          const malformed = [
            () => { candidate.summary = '' },
            () => { candidate.coverage = [] },
            () => { candidate.coverage = [42] },
            () => { candidate.lanes[0].name = '' },
            () => { candidate.lanes[0].task = '' },
            () => { candidate.lanes[0].files = [42] },
            () => { candidate.lanes[0].tier = 'unsafe' },
            () => { candidate.lanes[0].acceptance = '' },
          ]
          malformed[index]()
        }
        return candidate
      }
      case 'Score': {
        if (scoreMode === 'mismatch') return { coverage: 16, evidence: 16, feasibility: 16, safety: 16, efficiency: 16, total: 90, rationale: 'invalid total' }
        if (scoreMode === 'ties') {
          if (prompt.includes('coverage-wins')) return { coverage: 20, evidence: 14, feasibility: 16, safety: 15, efficiency: 15, total: 80, rationale: 'coverage tie break' }
          if (prompt.includes('safety-wins')) return { coverage: 19, evidence: 14, feasibility: 16, safety: 16, efficiency: 15, total: 80, rationale: 'safety tie break' }
          if (prompt.includes('evidence-third')) return { coverage: 19, evidence: 13, feasibility: 17, safety: 16, efficiency: 15, total: 80, rationale: 'evidence loses tie' }
        }
        if (prompt.includes('unsafe-plan')) return { coverage: 20, evidence: 20, feasibility: 18, safety: 18, efficiency: 20, total: 96, rationale: 'unsafe scores high before adversarial review' }
        if (prompt.includes('aggregate-safe')) return { coverage: 20, evidence: 18, feasibility: 19, safety: 19, efficiency: 18, total: 94, rationale: 'aggregate covers both safe lanes' }
        if (prompt.includes('improved-safe-a') || prompt.includes('improved-safe-b')) return { coverage: 19, evidence: 18, feasibility: 18, safety: 18, efficiency: 17, total: 90, rationale: 'equal improved score' }
        if (prompt.includes('improved-safe')) return { coverage: 19, evidence: 18, feasibility: 18, safety: 18, efficiency: 17, total: 90, rationale: 'improvement addresses objections' }
        const total = prompt.includes('safe-a') ? 88 : prompt.includes('safe-b') ? 82 : 40
        return { coverage: total === 40 ? 4 : 18, evidence: 18, feasibility: 18, safety: 18, efficiency: total === 40 ? 0 : total - 72, total, rationale: `literal score ${total}` }
      }
      case 'RefutePlan':
        return prompt.includes('unsafe-plan')
          ? { defects: [{ kind: 'collision', lane: 'unsafe', blocking: true, claim: 'two lanes own src/shared.ts', evidence: 'plan lanes 0 and 1' }] }
          : { defects: [], notes: 'no reproducible blocker' }
      case 'Improve':
        if (delayedBranch) {
          const branch = prompt.includes('safe-a') ? 'safe-a' : 'safe-b'
          return plan(`improved-${branch}`, `src/improved-${branch}.ts`)
        }
        return plan('improved-safe', 'src/improved.ts')
      case 'Aggregate':
        return {
          summary: malformedAggregate ? '' : 'aggregate-safe', coverage: ['change the thing'],
          lanes: aggregateLanes
            ? Array.from({ length: aggregateLanes }, (_, i) => ({ name: `aggregate${i}`, task: `implement aggregate${i}`, files: [`src/aggregate${i}.ts`], tier: 'integration', acceptance: 'node --test' }))
            : aggregateFiles
              ? aggregateFiles.map((file, i) => ({ name: `aggregate${i}`, task: `implement aggregate${i}`, files: [file], tier: 'integration', acceptance: 'node --test' }))
            : [
                { name: 'a', task: 'implement a', files: ['src/a.ts'], tier: 'integration', acceptance: 'node --test' },
                { name: 'b', task: 'implement b', files: ['src/b.ts'], tier: 'integration', acceptance: 'node --test' },
              ],
        }
      case 'Build':
        return { state: 'done', changed: ['src/x.ts'], notes: '' }
      case 'Review':
        return {
          findings: Array.from({ length: findingsPerLens }, () => {
            const n = findingSeq++
            return {
              file: `src/finding${n}.ts`,
              line: n + 1,
              claim: `distinct defect ${n}`,
              failureScenario: 'concrete input triggers it',
              severity: 'blocker',
            }
          }),
        }
      case 'Refute':
        return { refuted: false, why: 'reproduced with a concrete input' }
      case 'Fix':
        return { state: 'done', changed: ['src/x.ts'], notes: '' }
      case 'Gate':
        return { passed: true, commands: ['npm test'], output: 'ok' }
      case 'Release':
        return { lens: label, risks: [], readback: 'not attempted' }
      default:
        return 'handoff record'
    }
  }

  const agent = async (prompt, opts = {}) => {
    calls.push({ prompt, ...opts })
    if (delayedBranch && ['RefutePlan', 'Improve', 'Score'].includes(opts.phase) &&
      prompt.includes(delayedBranch)) {
      await new Promise(resolve => setTimeout(resolve, 15))
    }
    return fixture(opts, prompt)
  }
  const parallel = (thunks) => Promise.all(thunks.map((t) => t()))
  const pipeline = async (items, ...stages) =>
    Promise.all(items.map(async (item, i) => {
      let value = item
      for (const stage of stages) value = await stage(value, item, i)
      return value
    }))

  const body = SOURCE.replace('export const meta', 'const meta')
  const run = new AsyncFunction(
    'agent', 'parallel', 'pipeline', 'phase', 'log', 'args', 'budget', 'workflow', body)

  return run(
    agent,
    parallel,
    pipeline,
    () => {},
    (m) => logs.push(m),
    { repo: '/tmp/repo', scope: 'change the thing', deploys: true, agentBudget },
    { total: null, spent: () => 0, remaining: () => Infinity },
    async () => {},
  ).then((result) => ({ result, calls, logs }))
}

const countPhase = (calls, phase) => calls.filter((c) => c.phase === phase).length

async function loadGraphCore () {
  const prefix = SOURCE.split('// ---------------------------------------------------------------- 0. scout')[0]
    .replace('export const meta', 'const meta')
  const load = new AsyncFunction('args', 'budget', `${prefix}\nreturn { createThought, createOperation, executeOperationGraph, rankThoughts, validateOperationGraph }`)
  return load({ repo: '/tmp/repo', scope: 'change the thing', agentBudget: 'standard' }, { total: null })
}

test('Graph of Thoughts generates independent plans and deterministically prunes to the configured beam', async () => {
  // Catches collapsed branching: one plan must not stand in for the candidate set.
  const { result } = await runShip({ agentBudget: 'standard', lanes: 1, findingsPerLens: 0 })
  assert.equal(result.graph.thoughts.filter(t => t.operation === 'Generate').length, 5)
  const pruned = result.graph.pruned.filter(t => t.operationId === 'keep-generated')
  assert.equal(pruned.length, 3)
  assert.ok(pruned.some(t => t.state.plan.summary === 'weak-c'))
  assert.equal(result.graph.operations.find(op => op.id === 'keep-generated').type, 'KeepBestN')
})

test('score ties resolve by coverage then safety then evidence then thought id', async () => {
  // Catches unstable ranking when equal totals have multiple plausible survivors.
  const { result } = await runShip({ scoreMode: 'ties', findingsPerLens: 0 })
  const kept = result.graph.thoughts.filter(t => t.operationId === 'keep-generated' && t.status === 'kept')
  assert.deepEqual(kept.map(t => t.state.plan.summary), ['coverage-wins', 'safety-wins'])
})

test('score ranking isolates safety and thought-id tie breaks', async () => {
  // Catches a later comparator accidentally allowing evidence or insertion order to win.
  const { createThought, rankThoughts } = await loadGraphCore()
  const thought = (id, score) => createThought({ id, operationId: 'score', operation: 'Score', depth: 1, state: {}, score })
  const base = { total: 80, coverage: 18, feasibility: 16, rationale: 'literal' }
  const ranked = rankThoughts([
    thought('thought-z', { ...base, safety: 15, evidence: 15, efficiency: 16 }),
    thought('thought-a', { ...base, safety: 15, evidence: 15, efficiency: 16 }),
    thought('evidence-cannot-beat-safety', { ...base, safety: 14, evidence: 20, efficiency: 12 }),
    thought('safety-wins', { ...base, safety: 16, evidence: 0, efficiency: 14 }),
  ])
  assert.deepEqual(ranked.map(candidate => candidate.id), ['safety-wins', 'thought-a', 'thought-z', 'evidence-cannot-beat-safety'])
})

test('malformed plans and mismatched score totals never reach the beam', async () => {
  // Catches permissive local validation that lets schema-shaped garbage acquire authority.
  const malformed = await runShip({ agentBudget: 'deep', planMode: 'malformed', findingsPerLens: 0 })
  assert.equal(countPhase(malformed.calls, 'Score'), 0)
  assert.equal(malformed.result.graph.thoughts.filter(t => t.operationId === 'keep-generated' && t.status === 'kept').length, 0)

  const mismatched = await runShip({ scoreMode: 'mismatch', findingsPerLens: 0 })
  assert.equal(countPhase(mismatched.calls, 'Score'), 5)
  assert.equal(mismatched.result.graph.thoughts.filter(t => t.operationId === 'keep-generated' && t.status === 'kept').length, 0)
})

test('score agents receive read-only authority at the worktree boundary', async () => {
  // Catches a Score prompt or runtime option that could silently grant mutation authority.
  const { calls } = await runShip({ findingsPerLens: 0 })
  const score = calls.find(call => call.phase === 'Score')
  assert.equal(score.authority, 'read-only')
  assert.match(score.prompt, /Worktree: \/tmp\/repo\.worktrees\/ship-test \(read-only — do not edit source\)/)
})

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

test('aggregate collision validation canonicalizes aliases and rejects repo escapes before Build', async () => {
  const cases = [
    { label: 'relative dot alias', files: ['src/shared.ts', 'src/./shared.ts'] },
    { label: 'absolute repeated-separator alias', files: ['src/shared.ts', '/tmp/repo.worktrees/ship-test/src//shared.ts'] },
    { label: 'repo escape', files: ['src/a.ts', '../outside.ts'] },
  ]
  for (const scenario of cases) {
    const { result, calls } = await runShip({ aggregateFiles: scenario.files, findingsPerLens: 0 })
    const aggregate = result.graph.thoughts.find(thought => thought.operation === 'Aggregate')
    assert.equal(aggregate.status, 'pruned', `${scenario.label} must invalidate the aggregate`)
    assert.ok(aggregate.state.aggregationCollisions.length > 0, `${scenario.label} must record why it was rejected`)
    assert.equal(result.selectedPlan.summary, 'improved-safe', `${scenario.label} must fall back to a safe survivor`)
    assert.deepEqual(calls.filter(call => call.phase === 'Build').map(call => call.label), ['build:improved-safe'])
  }
})

test('delayed equal-score responses preserve thought IDs and select the same branch', async () => {
  const runDelayed = async (delayedBranch) => {
    const { result } = await runShip({ delayedBranch, malformedAggregate: true, findingsPerLens: 0 })
    const trace = result.graph.thoughts
      .filter(thought => thought.operation === 'Refute' || thought.operation === 'Improve' || thought.operationId === 'score-improved-1')
      .map(thought => ({ operationId: thought.operationId, summary: thought.state.plan.summary, id: thought.id }))
      .sort((a, b) => a.operationId.localeCompare(b.operationId) || a.summary.localeCompare(b.summary))
    return { selected: result.selectedPlan.summary, trace }
  }

  const safeASlow = await runDelayed('safe-a')
  const safeBSlow = await runDelayed('safe-b')
  assert.equal(safeASlow.selected, 'improved-safe-a')
  assert.equal(safeBSlow.selected, 'improved-safe-a')
  assert.deepEqual(safeASlow.trace, safeBSlow.trace)
})

test('every derived thought keeps immutable parent lineage', async () => {
  // Catches predecessor mutation, which would erase the audit trail before selection.
  const { result } = await runShip({ findingsPerLens: 0 })
  const { createThought } = await loadGraphCore()
  const generated = result.graph.thoughts.filter(t => t.operation === 'Generate')
  const scored = result.graph.thoughts.filter(t => t.operationId === 'score-generated')
  assert.ok(Object.isFrozen(generated[0]))
  assert.ok(Object.isFrozen(generated[0].state))
  assert.ok(Object.isFrozen(generated[0].state.plan))
  assert.ok(Object.isFrozen(generated[0].state.plan.lanes[0]))
  assert.ok(Object.isFrozen(generated[0].parentIds))
  assert.deepEqual(scored.map(t => t.parentIds.length), Array(scored.length).fill(1))
  assert.deepEqual(generated.map(t => t.score), Array(generated.length).fill(null))
  assert.ok(Object.isFrozen(scored[0].score))

  const callerState = { plan: { lanes: [{ files: ['src/original.ts'] }] } }
  const callerParents = ['parent-original']
  const callerScore = { coverage: 16, evidence: 16, feasibility: 16, safety: 16, efficiency: 16, total: 80, rationale: 'original' }
  const copied = createThought({ id: 'copied', parentIds: callerParents, operationId: 'Score', operation: 'Score', depth: 1, state: callerState, score: callerScore })
  callerState.plan.lanes[0].files[0] = 'src/mutated.ts'
  callerParents[0] = 'parent-mutated'
  callerScore.total = 0
  assert.equal(copied.state.plan.lanes[0].files[0], 'src/original.ts')
  assert.deepEqual(copied.parentIds, ['parent-original'])
  assert.equal(copied.score.total, 80)
})

test('operation graph validation rejects duplicate IDs, missing predecessors, and cycles before execution', async () => {
  // Catches duplicate-ID acceptance, missing dependency acceptance, and cyclic scheduling.
  const { createOperation, validateOperationGraph } = await loadGraphCore()
  const duplicate = [
    createOperation({ id: 'a', type: 'Generate', execute: async () => [] }),
    createOperation({ id: 'a', type: 'Score', execute: async () => [] }),
  ]
  assert.throws(() => validateOperationGraph(duplicate), /duplicate operation a/)
  const missing = [createOperation({ id: 'a', type: 'Generate', predecessorIds: ['absent'], execute: async () => [] })]
  assert.throws(() => validateOperationGraph(missing), /unknown predecessor absent/)
  const cycle = [
    createOperation({ id: 'a', type: 'Generate', predecessorIds: ['b'], execute: async () => [] }),
    createOperation({ id: 'b', type: 'Score', predecessorIds: ['a'], execute: async () => [] }),
  ]
  assert.throws(() => validateOperationGraph(cycle), /cycle/)
})

test('operation scheduling is ready-order deterministic and does not mutate caller predecessors', async () => {
  // Catches nondeterministic sibling execution and aliases into caller-owned predecessor arrays.
  const { createOperation, executeOperationGraph } = await loadGraphCore()
  const predecessorIds = ['a']
  const ran = []
  const dependent = createOperation({ id: 'm', type: 'Score', predecessorIds, execute: async () => { ran.push('m'); return [] } })
  predecessorIds.push('unexpected')
  assert.deepEqual(dependent.predecessorIds, ['a'])

  const operations = [
    createOperation({ id: 'z', type: 'Generate', execute: async () => { ran.push('z'); return [] } }),
    createOperation({ id: 'a', type: 'Generate', execute: async () => { ran.push('a'); return [] } }),
    dependent,
  ]
  await executeOperationGraph(operations, { thoughts: [] })
  assert.deepEqual(ran, ['a', 'm', 'z'])
})

test('refutation fan-out stays bounded when every review lens returns a full findings array', async () => {
  const { calls } = await runShip()
  const refute = countPhase(calls, 'Refute')
  // Two verifiers per finding, at most four findings per lane reach one at all.
  const ceiling = LANES * 4 * 2
  assert.ok(
    refute <= ceiling,
    `refute spawned ${refute} agents; the per-lane cap puts the ceiling at ${ceiling}. ` +
    'Uncapped, this stage is 3 verifiers x every finding x every lane.')
})

test('the fix stage does not scale with however many blockers survived', async () => {
  const { calls } = await runShip()
  assert.ok(
    countPhase(calls, 'Fix') <= 8,
    `fix spawned ${countPhase(calls, 'Fix')} agents; the cap is 8.`)
})

test('a worst-case run stays within the cost the skill advertises', async () => {
  const { calls } = await runShip()
  // This deliberately exceeds the standard lane allocation, so it includes the bounded
  // read-only candidate search plus the legacy over-budget warning path.
  assert.ok(
    calls.length <= 130,
    `the DAG spawned ${calls.length} agents on worst-case input; the interim ceiling is 130.`)
})

test('each agent-budget range holds its documented ceiling', async () => {
  // The user picks one of these three before launch, so each has to mean something.
  // Worst-case input: 8 lanes, both review lenses at maxItems, every finding a blocker.
  // Each range caps the lane count it asks the planner for, so the ceiling is measured
  // against a plan that respects it — worst-case findings, blockers throughout.
  const ranges = [
    { range: 'light', lanes: 3, ceiling: 55 },
    { range: 'standard', lanes: 5, ceiling: 95 },
    { range: 'deep', lanes: 8, ceiling: 175 },
  ]
  const counts = {}
  for (const { range, lanes, ceiling } of ranges) {
    const { calls } = await runShip({ agentBudget: range, lanes })
    counts[range] = calls.length
    assert.ok(
      calls.length <= ceiling,
      `${range} spawned ${calls.length} agents; its documented ceiling is ${ceiling}.`)
  }
  // The ranges must actually separate — three names for one cost is a lie.
  assert.ok(
    counts.deep > counts.standard && counts.standard > counts.light,
    `ranges must be distinct, got ${JSON.stringify(counts)}`)
})

test('a plan that exceeds its range says so out loud instead of dropping a lane', async () => {
  // Lanes are deliberately not truncated to fit the budget: dropping one drops scope the
  // user asked for. The guarantee is that going over is announced with a new projection.
  const { logs, result } = await runShip({ agentBudget: 'standard', aggregateLanes: 8 })
  assert.ok(
    logs.some((l) => l.startsWith('OVER BUDGET')),
    'an over-budget plan must log OVER BUDGET with a revised projection')
  assert.equal(result.lanes.length, 8, 'every planned lane must still be built')
})

test('everything dropped before refutation is reported, never silently discarded', async () => {
  const { result, logs } = await runShip()
  assert.ok(
    logs.some((l) => /carried unverified|per-lane cap/.test(l)),
    'the run log must name the findings that no verifier ever saw')
  assert.ok(
    Array.isArray(result.unverifiedFindings) && result.unverifiedFindings.length > 0,
    'unverified findings must ride out in the result for the handoff to carry as caveats')
})
