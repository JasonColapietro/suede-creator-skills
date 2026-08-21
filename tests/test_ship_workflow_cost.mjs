// Suede Ship's Graph-of-Thoughts search is fan-out billed to a model allocation. Its
// exact 55/110/200 call ceilings are hard contracts, including adversarial review and
// bounded repair. This drives the real script with deterministic agents and checks the
// search, mutation, failure, and budget boundaries at the workflow ABI.
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

function runShip ({ agentBudget = 'standard', scope = 'change the thing', lanes = LANES, aggregateLanes, aggregateFiles, aggregateCollision = false, malformedAggregate = false, malformedPlans = false, malformedPlanIndex, rejectEveryPlan = false, findingsPerLens = FINDINGS_PER_LENS, scoreMode, planMode, eligibilityMode, includeUnsafePlan = false, refuteMode, delayedBranch, delayPhase, blockingHazard, selectedPlanCollision = false, buildChangedPath, reviewFindingPath, fixChangedPath, forceAgentCeiling, agentErrorPhase, agentErrorLabel } = {}) {
  const calls = []
  const completedCalls = []
  const logs = []
  let findingSeq = 0
  let agentErrorFired = false

  const checklist = scope.split(/\r?\n/).map(item => item.replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/, '').trim()).filter(Boolean)
  const completePlan = (candidate) => {
    if (eligibilityMode === 'over-range') {
      candidate.lanes = Array.from({ length: agentBudget === 'light' ? 4 : agentBudget === 'deep' ? 9 : 6 }, (_, index) => ({
        name: `over-range-${index}`,
        task: `implement over-range-${index}`,
        files: [`src/over-range-${index}.ts`],
        tier: 'integration',
        acceptance: 'node --test',
      }))
    }
    candidate.scopeMap = checklist.map(item => ({ item, lane: candidate.lanes[0].name, acceptance: candidate.lanes[0].acceptance, source: 'user scope' }))
    candidate.externalActions = []
    if (eligibilityMode === 'incomplete-scope') candidate.scopeMap.pop()
    if (eligibilityMode === 'unknown-source' && candidate.scopeMap[0]) candidate.scopeMap[0].source = 'invented source'
    if (eligibilityMode === 'external-action') candidate.externalActions = ['deploy production']
    if (eligibilityMode === 'prohibited-command') candidate.lanes[0].acceptance = 'git push origin main'
    return candidate
  }
  const plan = (name, file, acceptance = 'node --test') => completePlan({
    summary: name,
    coverage: checklist,
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
          dirtyFiles: selectedPlanCollision ? ['src'] : [],
          candidateFiles: ['src/a.ts'],
          siblingClaims: [],
          hazards: blockingHazard
            ? [{ kind: blockingHazard, blocking: true, detail: `tracked ${blockingHazard}` }]
            : [{ kind: 'secret', blocking: false, detail: 'no secrets found' }],
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
        if (malformedPlans || index === malformedPlanIndex) candidate.summary = ''
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
        if (scoreMode === 'below-minimum') return { coverage: 8, evidence: 8, feasibility: 8, safety: 8, efficiency: 8, total: 40, rationale: 'valid but deterministically ineligible' }
        if (scoreMode === 'ties') {
          if (prompt.includes('coverage-wins')) return { coverage: 20, evidence: 14, feasibility: 16, safety: 15, efficiency: 15, total: 80, rationale: 'coverage tie break' }
          if (prompt.includes('safety-wins')) return { coverage: 19, evidence: 14, feasibility: 16, safety: 16, efficiency: 15, total: 80, rationale: 'safety tie break' }
          if (prompt.includes('evidence-third')) return { coverage: 19, evidence: 13, feasibility: 17, safety: 16, efficiency: 15, total: 80, rationale: 'evidence loses tie' }
        }
        if (prompt.includes('unsafe-plan')) return { coverage: 20, evidence: 20, feasibility: 18, safety: 18, efficiency: 20, total: 96, rationale: 'unsafe scores high before adversarial review' }
        if (prompt.includes('aggregate-safe')) return { coverage: 20, evidence: 18, feasibility: 19, safety: 19, efficiency: 18, total: 94, rationale: 'aggregate covers both safe lanes' }
        if (prompt.includes('improved-safe-a') || prompt.includes('improved-safe-b')) return { coverage: 19, evidence: 18, feasibility: 18, safety: 18, efficiency: 17, total: 90, rationale: 'equal improved score' }
        if (prompt.includes('improved-safe')) return { coverage: 19, evidence: 18, feasibility: 18, safety: 18, efficiency: 17, total: 90, rationale: 'improvement addresses objections' }
        if (scoreMode === 'all-valid') return { coverage: 8, evidence: 8, feasibility: 8, safety: 8, efficiency: 8, total: 40, rationale: 'valid low score' }
        const total = prompt.includes('safe-a') ? 88 : prompt.includes('safe-b') ? 82 : 40
        return { coverage: total === 40 ? 4 : 18, evidence: 18, feasibility: 18, safety: 18, efficiency: total === 40 ? 0 : total - 72, total, rationale: `literal score ${total}` }
      }
      case 'RefutePlan':
        if (refuteMode === 'malformed') return { defects: [], notes: null }
        if (refuteMode === 'one-adversary' && label.endsWith(':1')) return { defects: [], notes: 'no matching blocker' }
        if (refuteMode === 'nonblocking') return { defects: [{ kind: 'collision', lane: 'unsafe', blocking: false, claim: 'two lanes own src/shared.ts', evidence: 'plan lanes 0 and 1' }], notes: 'not blocking' }
        if (refuteMode === 'different-claim') return { defects: [{ kind: 'collision', lane: 'unsafe', blocking: true, claim: label.endsWith(':0') ? 'lane owns src/a.ts twice' : 'lane owns src/b.ts twice', evidence: 'different plan rows' }], notes: 'distinct concrete defect' }
        if (refuteMode === 'different-lane') return { defects: [{ kind: 'collision', lane: label.endsWith(':0') ? 'unsafe' : 'other', blocking: true, claim: 'two lanes own src/shared.ts', evidence: 'plan lanes 0 and 1' }], notes: 'different target' }
        return rejectEveryPlan || prompt.includes('unsafe-plan')
          ? { defects: [{ kind: 'collision', lane: 'unsafe', blocking: true, claim: 'two lanes own src/shared.ts', evidence: 'plan lanes 0 and 1' }], notes: 'same concrete blocker' }
          : { defects: [], notes: 'no reproducible blocker' }
      case 'Improve':
        if (delayedBranch) {
          const branch = prompt.includes('safe-a') ? 'safe-a' : 'safe-b'
          return plan(`improved-${branch}`, `src/improved-${branch}.ts`)
        }
        return plan('improved-safe', 'src/improved.ts')
      case 'Aggregate':
        return completePlan({
          summary: malformedAggregate ? '' : 'aggregate-safe', coverage: checklist,
          lanes: aggregateCollision
            ? [
                { name: 'aggregate-a', task: 'implement aggregate a', files: ['src/shared.ts'], tier: 'integration', acceptance: 'node --test' },
                { name: 'aggregate-b', task: 'implement aggregate b', files: ['src/shared.ts'], tier: 'integration', acceptance: 'node --test' },
              ]
            : aggregateLanes
            ? Array.from({ length: aggregateLanes }, (_, i) => ({ name: `aggregate${i}`, task: `implement aggregate${i}`, files: [`src/aggregate${i}.ts`], tier: 'integration', acceptance: 'node --test' }))
            : aggregateFiles
              ? aggregateFiles.map((file, i) => ({ name: `aggregate${i}`, task: `implement aggregate${i}`, files: [file], tier: 'integration', acceptance: 'node --test' }))
            : [
                { name: 'a', task: 'implement a', files: ['src/a.ts'], tier: 'integration', acceptance: 'node --test' },
                { name: 'b', task: 'implement b', files: ['src/b.ts'], tier: 'integration', acceptance: 'node --test' },
              ],
        })
      case 'Build':
        return { state: 'done', changed: [buildChangedPath || opts.allowedFiles?.[0] || 'src/x.ts'], notes: '' }
      case 'Review':
        return {
          findings: Array.from({ length: findingsPerLens }, () => {
            const n = findingSeq++
            return {
              file: reviewFindingPath || opts.allowedFiles?.[0] || `src/finding${n}.ts`,
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
        return { state: 'done', changed: [fixChangedPath || opts.allowedFiles?.[0] || 'src/x.ts'], notes: '' }
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
    if (!agentErrorFired && opts.phase === agentErrorPhase && (!agentErrorLabel || opts.label === agentErrorLabel)) {
      agentErrorFired = true
      throw new Error(`programming error at ${agentErrorPhase}`)
    }
    if (delayPhase === opts.phase) await new Promise(resolve => setTimeout(resolve, 20))
    if (delayedBranch && ['RefutePlan', 'Improve', 'Score'].includes(opts.phase) &&
      prompt.includes(delayedBranch)) {
      await new Promise(resolve => setTimeout(resolve, 15))
    }
    const value = fixture(opts, prompt)
    completedCalls.push({ prompt, ...opts })
    return value
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
    { repo: '/tmp/repo', scope, deploys: true, agentBudget },
    { total: forceAgentCeiling ?? null, spent: () => 0, remaining: () => Infinity },
    async () => {},
  ).then((result) => ({ result, calls, completedCalls, logs }))
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

test('Build and Fix enforce canonical selected-file allowlists before later mutation stages', async () => {
  // Catches a builder or fixer reporting writes outside the exact selected lane.
  const buildEscape = await runShip({ findingsPerLens: 0, buildChangedPath: 'src/outside.ts' })
  assert.equal(buildEscape.result.halted, true)
  assert.equal(buildEscape.result.reason, 'mutation boundary violation')
  assert.equal(buildEscape.calls.some(call => ['Review', 'Fix', 'Gate', 'Release', 'Handoff'].includes(call.phase)), false)
  assert.ok(buildEscape.result.graph.dropped.some(item => item.reason === 'Build changed path outside selected lane'))

  const fixEscape = await runShip({ findingsPerLens: 1, fixChangedPath: 'src/outside.ts' })
  assert.equal(fixEscape.result.halted, true)
  assert.equal(fixEscape.result.reason, 'mutation boundary violation')
  assert.equal(fixEscape.calls.some(call => call.phase === 'Gate'), false)
  assert.ok(fixEscape.result.graph.dropped.some(item => item.reason === 'Fix changed path outside selected lane'))
})

test('review findings outside selected ownership never reach Fix and remain unauthorized evidence', async () => {
  // Catches reviewer-controlled file paths widening the mutation boundary.
  const { result, calls } = await runShip({ findingsPerLens: 1, reviewFindingPath: 'src/outside.ts' })
  assert.equal(calls.some(call => call.phase === 'Fix'), false)
  assert.ok(result.unverifiedFindings.some(finding => finding.file === 'src/outside.ts' && finding.unauthorized === true))
})

test('every mutating agent receives the canonical lane allowlist as a runner boundary', async () => {
  // Catches prompt-only authority that the host runner cannot enforce.
  const { calls } = await runShip({ findingsPerLens: 1 })
  const mutating = calls.filter(call => call.phase === 'Build' || call.phase === 'Fix')
  assert.ok(mutating.length > 0)
  assert.ok(mutating.every(call => Array.isArray(call.allowedFiles) && call.allowedFiles.length > 0))
  assert.ok(mutating.every(call => call.allowedFiles.every(file => !file.startsWith('/') && !file.includes('..'))))
  assert.ok(mutating.every(call => call.prompt.includes(`ALLOWED FILES: ${call.allowedFiles.join(', ')}`)))
})

test('deterministic plan eligibility rejects unsafe or incomplete winners before Build', async () => {
  // Catches a structurally shaped plan acquiring mutation authority without full scope and safety evidence.
  const cases = [
    { eligibilityMode: 'over-range', reason: 'lane count exceeds standard maximum 5' },
    { scoreMode: 'below-minimum', reason: 'score below deterministic eligibility minimum' },
    { eligibilityMode: 'incomplete-scope', scope: '- change api\n- change docs', reason: 'scope checklist is incomplete' },
    { eligibilityMode: 'unknown-source', reason: 'scope mapping cites an unknown source' },
    { eligibilityMode: 'external-action', reason: 'plan requests external actions' },
    { eligibilityMode: 'prohibited-command', reason: 'plan contains a prohibited external command' },
  ]
  for (const scenario of cases) {
    const { result, calls } = await runShip({ ...scenario, findingsPerLens: 0 })
    assert.equal(result.halted, true, scenario.reason)
    assert.equal(result.reason, 'no safe graph winner', scenario.reason)
    assert.equal(calls.some(call => call.phase === 'Build'), false, scenario.reason)
    assert.ok(result.graph.dropped.some(item => String(item.reason).includes(scenario.reason)), scenario.reason)
  }
})

test('a valid multi-item scope maps every item to a lane acceptance command and known source', async () => {
  // Catches line/bullet collapse in the deterministic checklist.
  const { result } = await runShip({ scope: '- change api\n2. change docs', findingsPerLens: 0 })
  assert.deepEqual(result.selectedPlan.scopeMap.map(item => item.item), ['change api', 'change docs'])
  assert.ok(result.selectedPlan.scopeMap.every(item => item.lane && item.acceptance === 'node --test' && item.source === 'user scope'))
})

test('Refute requires two valid responses with the same concrete blocking defect', async () => {
  // Catches broad kind/lane consensus and malformed response acceptance.
  for (const refuteMode of ['one-adversary', 'nonblocking', 'different-claim', 'different-lane']) {
    const { result } = await runShip({ includeUnsafePlan: true, refuteMode, malformedAggregate: true, findingsPerLens: 0 })
    const unsafe = result.graph.thoughts.find(thought => thought.operation === 'Refute' && thought.state.plan?.summary === 'unsafe-plan')
    assert.notEqual(unsafe.status, 'refuted', refuteMode)
  }
  const malformed = await runShip({ includeUnsafePlan: true, refuteMode: 'malformed', malformedAggregate: true, findingsPerLens: 0 })
  assert.ok(malformed.result.graph.dropped.some(item => item.reason === 'malformed plan refutation'))
  const unsafe = malformed.result.graph.thoughts.find(thought => thought.operation === 'Refute' && thought.state.plan?.summary === 'unsafe-plan')
  assert.notEqual(unsafe.status, 'refuted')
})

test('candidate-local agent failures are dropped while healthy graph siblings still select a winner', async () => {
  // Catches Promise.all aborting the complete search for one bad candidate response.
  for (const agentErrorPhase of ['Generate', 'Score', 'RefutePlan', 'Improve']) {
    const { result } = await runShip({ agentErrorPhase, findingsPerLens: 0 })
    assert.ok(result.selectedPlan, agentErrorPhase)
    assert.ok(result.graph.dropped.some(item => item.reason === 'candidate agent failure' && item.operation === agentErrorPhase), agentErrorPhase)
  }
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

test('operation scheduling rejects disconnected roots and marks input-starved dependents skipped', async () => {
  // Catches disconnected search islands and dependents running without any viable input.
  const { createOperation, executeOperationGraph } = await loadGraphCore()
  const disconnected = [
    createOperation({ id: 'a', type: 'Generate', execute: async () => [] }),
    createOperation({ id: 'z', type: 'Generate', execute: async () => [] }),
  ]
  await assert.rejects(executeOperationGraph(disconnected, { thoughts: [], operations: [], dropped: [], callLedger: [] }), /exactly one root/)

  let dependentRan = false
  const operations = [
    createOperation({ id: 'a', type: 'Generate', execute: async () => [] }),
    createOperation({ id: 'm', type: 'Score', predecessorIds: ['a'], execute: async () => { dependentRan = true; return [] } }),
  ]
  const traceGraph = { thoughts: [], operations: [], dropped: [], callLedger: [] }
  await executeOperationGraph(operations, traceGraph)
  assert.equal(dependentRan, false)
  assert.equal(traceGraph.operations.find(operation => operation.id === 'm').status, 'skipped')
  assert.equal(traceGraph.operations.find(operation => operation.id === 'm').reason.kind, 'input-starved')
})

test('returned operation trace is serializable and carries inputs, outputs, calls, budgets, and structured reasons', async () => {
  // Catches executable functions or missing provenance escaping into handoff evidence.
  const { result } = await runShip({ findingsPerLens: 0 })
  assert.doesNotThrow(() => JSON.stringify(result.graph.operations))
  assert.ok(result.graph.operations.every(operation => !('execute' in operation)))
  assert.ok(result.graph.operations.every(operation => Array.isArray(operation.inputThoughtIds) && Array.isArray(operation.outputThoughtIds)))
  assert.ok(result.graph.operations.every(operation => Array.isArray(operation.callIds)))
  assert.ok(result.graph.operations.every(operation => operation.budgetBefore && operation.budgetAfter && operation.reason?.kind))
  assert.ok(result.graph.callLedger.every(call => call.id && call.before && call.after))
  assert.equal(result.graph.topology.validatedBeforeCall, true)
  assert.deepEqual(result.graph.topology.operationIds, result.graph.operations.map(operation => operation.id))
})

test('every KeepBestN rejection records an explicit pruning reason in every round', async () => {
  // Catches drift between the initial and improved beam implementations.
  const { result } = await runShip({ agentBudget: 'deep', scoreMode: 'all-valid', findingsPerLens: 0 })
  const pruned = result.graph.thoughts.filter(thought => thought.operation === 'KeepBestN' && thought.status === 'pruned')
  assert.ok(pruned.length > 0)
  assert.ok(pruned.every(thought => typeof thought.state.pruning === 'string' && thought.state.pruning.length > 0))
})

test('the total-call ledger halts before spawning call ceiling plus one', async () => {
  const { result, calls } = await runShip({ agentBudget: 'light', forceAgentCeiling: 4 })
  assert.equal(calls.length, 4)
  assert.equal(result.halted, true)
  assert.equal(result.reason, 'agent budget exhausted')
  assert.deepEqual(result.graph.budget, { name: 'light', ceiling: 4, used: 4, remaining: 0 })
})

test('injected budget totals reject invalid values and clamp only above the public range', async () => {
  // Catches fractional overrun, negative remaining evidence, and public-ceiling bypass.
  for (const forceAgentCeiling of [-1, 1.5]) {
    await assert.rejects(runShip({ forceAgentCeiling }), /budget\.total must be a nonnegative integer/)
  }
  const zero = await runShip({ agentBudget: 'light', forceAgentCeiling: 0 })
  assert.equal(zero.calls.length, 0)
  assert.deepEqual(zero.result.graph.budget, { name: 'light', ceiling: 0, used: 0, remaining: 0 })
  const exact = await runShip({ agentBudget: 'light', forceAgentCeiling: 4 })
  assert.equal(exact.calls.length, 4)
  const clamped = await runShip({ agentBudget: 'light', forceAgentCeiling: 999 })
  assert.equal(clamped.result.graph.budget.ceiling, 55)
  assert.ok(clamped.calls.length <= 55)
})

test('mutating batches reserve their full cost before any Build or Fix call starts', async () => {
  // Catches partial mutating batches that return halted while sibling writers continue.
  const buildBaseline = await runShip({ findingsPerLens: 0 })
  const firstBuild = buildBaseline.calls.findIndex(call => call.phase === 'Build')
  const buildCount = countPhase(buildBaseline.calls, 'Build')
  const buildBoundary = await runShip({ findingsPerLens: 0, forceAgentCeiling: firstBuild + buildCount - 1 })
  assert.equal(countPhase(buildBoundary.calls, 'Build'), 0)
  assert.equal(buildBoundary.result.reason, 'agent budget exhausted')

  const fixBaseline = await runShip({ findingsPerLens: 1 })
  const firstFix = fixBaseline.calls.findIndex(call => call.phase === 'Fix')
  const fixCount = countPhase(fixBaseline.calls, 'Fix')
  assert.ok(firstFix > 0 && fixCount > 0)
  const fixBoundary = await runShip({ findingsPerLens: 1, forceAgentCeiling: firstFix + fixCount - 1 })
  assert.equal(countPhase(fixBoundary.calls, 'Fix'), 0)
  assert.equal(fixBoundary.result.reason, 'agent budget exhausted')
})

test('started read-only fan-outs settle before budget exhaustion returns', async () => {
  // Catches Promise.all returning while an already-started read-only agent is still active.
  const { result, calls, completedCalls } = await runShip({ agentBudget: 'light', forceAgentCeiling: 2, delayPhase: 'Research' })
  assert.equal(result.reason, 'agent budget exhausted')
  assert.equal(countPhase(calls, 'Research'), 1)
  assert.equal(countPhase(completedCalls, 'Research'), 1)
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

test('handoff receives complete search evidence and its final budget snapshot', async () => {
  const { result, calls } = await runShip({
    agentBudget: 'deep',
    malformedPlanIndex: 7,
    includeUnsafePlan: true,
    scoreMode: 'all-valid',
    aggregateCollision: true,
    findingsPerLens: 0,
  })
  const handoffCall = calls.find(c => c.phase === 'Handoff')
  for (const marker of ['Winning thought', 'Lineage', 'Scores', 'Pruned candidates', 'Dropped candidates', 'Refuted candidates', 'All graph objections', 'Plan refutations', 'Agent budget']) {
    assert.match(handoffCall.prompt, new RegExp(marker))
  }
  for (const evidence of ['malformed generated plan', 'aggregate file collision', 'unsafe-plan', 'two lanes own src/shared.ts']) {
    assert.match(handoffCall.prompt, new RegExp(evidence))
  }
  const handoffBudget = JSON.parse(handoffCall.prompt.match(/^Agent budget: (.+)$/m)[1])
  assert.deepEqual(handoffBudget, result.graph.budget)
})

test('late budget exhaustion preserves accumulated evidence at Gate, Release, and Handoff', async () => {
  const cases = [
    { phase: 'Gate', ceiling: 33, gate: null, releaseCount: 0 },
    { phase: 'Release', ceiling: 34, gate: { passed: true, commands: ['npm test'], output: 'ok' }, releaseCount: 0 },
    { phase: 'Handoff', ceiling: 38, gate: { passed: true, commands: ['npm test'], output: 'ok' }, releaseCount: 4 },
  ]
  for (const scenario of cases) {
    const { result, calls } = await runShip({ findingsPerLens: 0, forceAgentCeiling: scenario.ceiling })
    assert.equal(calls.length, scenario.ceiling)
    assert.equal(result.halted, true)
    assert.equal(result.reason, 'agent budget exhausted')
    assert.equal(result.graph.dropped.at(-1).operation, scenario.phase)
    assert.equal(result.selectedPlan.summary, 'aggregate-safe')
    assert.deepEqual(result.lanes, ['a', 'b'])
    assert.deepEqual(result.confirmedFindings, [])
    assert.deepEqual(result.unverifiedFindings, [])
    assert.deepEqual(result.gate, scenario.gate)
    assert.equal(result.release.length, scenario.releaseCount)
  }
})

test('the budget boundary rethrows non-budget programming errors', async () => {
  await assert.rejects(
    runShip({ agentErrorPhase: 'Research' }),
    /programming error at Research/)
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
  const { calls } = await runShip({ lanes: 5, aggregateLanes: 5 })
  assert.ok(
    calls.length <= 110,
    `the Graph-of-Thoughts workflow spawned ${calls.length} agents; the standard ceiling is 110.`)
})

test('each agent-budget range holds its documented ceiling', async () => {
  // The user picks one of these three before launch, so each has to mean something.
  // Worst-case input: 8 lanes, both review lenses at maxItems, every finding a blocker.
  // Each range caps the lane count it asks the planner for, so the ceiling is measured
  // against a plan that respects it — worst-case findings, blockers throughout.
  const ranges = [
    { range: 'light', lanes: 3, ceiling: 55 },
    { range: 'standard', lanes: 5, ceiling: 110 },
    { range: 'deep', lanes: 8, ceiling: 200 },
  ]
  const counts = {}
  for (const { range, lanes, ceiling } of ranges) {
    const { calls } = await runShip({ agentBudget: range, lanes, aggregateLanes: lanes })
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

test('an over-range plan halts before starting any Build lane', async () => {
  const { result, calls } = await runShip({ agentBudget: 'standard', eligibilityMode: 'over-range' })
  assert.equal(countPhase(calls, 'Build'), 0)
  assert.equal(result.halted, true)
  assert.equal(result.reason, 'no safe graph winner')
  assert.ok(result.graph.dropped.some(item => String(item.reason).includes('lane count exceeds standard maximum 5')))
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
