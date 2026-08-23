// The Suede Graph Flo XR graph is fan-out billed to a model allocation, and each agent
// budget it advertises ("light", "standard", "deep") is a promise the script has to keep
// on a bad day, not only on an average one. Two things can break that promise: a stage
// whose agent count scales with model output rather than with the graph, and a retry path
// that spends beyond what the budget reserved. This drives the real script with stubbed
// agents under the worst input the schemas permit and counts the spawns.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = readFileSync(
  path.join(ROOT, 'skills/suede-graph-flo-xr/workflows/suede-graph-flo-xr.js'), 'utf8')
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

// Each range's documented ceiling, from BUDGETS in the workflow. These are the numbers the
// operator is quoted before launch, so they are the numbers under test.
const CEILINGS = { light: 55, standard: 110, deep: 200 }
// maxLanes per range, from BUDGETS. A plan over its range's cap is rejected outright,
// so worst case is the biggest plan the range actually accepts.
const MAX_LANES = { light: 3, standard: 5, deep: 8 }

const REPO = '/tmp/graph-flo-cost-repo'
const RUN_KEY = 'ship-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
const WORKTREE = `${REPO}.worktrees/${RUN_KEY}`
const BASE_SHA = 'a'.repeat(40)
const SCOPE = 'Reconcile the docs\nRefresh the verification date'

// Worst case the schemas allow: the maximum lane count for the range, both review lenses
// returning a full findings array, every finding distinct (so dedupe cannot help) and
// severity blocker (so nothing is filtered and every survivor also wants a fix agent).
const FINDINGS_PER_LENS = 10

function runGraph ({ agentBudget = 'deep', lanes = 8, findingsPerLens = FINDINGS_PER_LENS, scoreScript } = {}) {
  const calls = []
  const logs = []
  let findingSeq = 0

  const plan = () => ({
    summary: 'reconcile the docs',
    coverage: ['index.md'],
    lanes: Array.from({ length: lanes }, (_, i) => ({
      name: `lane${i}`, files: [`src/lane${i}.ts`], tier: 'integration', acceptance: 'npm test',
    })),
    // Every lane needs a canonical scope mapping or planEligibility rejects the plan, and
    // every checklist item needs a lane. One item may own several lanes.
    scopeMap: [
      ...Array.from({ length: lanes }, (_, i) => (
        { item: 'Reconcile the docs', lane: `lane${i}`, acceptance: 'npm test', source: 'user scope' })),
      { item: 'Refresh the verification date', lane: 'lane0', acceptance: 'npm test', source: 'user scope' },
    ],
    externalActions: [],
  })
  const score = () => ({
    coverage: 17, evidence: 17, feasibility: 17, safety: 17, efficiency: 17,
    total: 85, rationale: 'verified against the worktree files',
  })

  const fixture = (opts) => {
    const label = opts.label || ''
    switch (opts.phase) {
      case 'Scout':
        return {
          worktreePath: WORKTREE, tempRoot: `/private/tmp/${RUN_KEY}`, baseSha: BASE_SHA,
          dirtyFiles: [],
          // Every planned lane file has to appear here or planEligibility rejects the plan
          // for claiming a path Scout never saw.
          candidateFiles: Array.from({ length: lanes }, (_, i) => `${WORKTREE}/src/lane${i}.ts`),
          siblingClaims: [],
          liveCwds: [], manifestOverflow: false,
          hazards: [{ kind: 'secret', blocking: false, detail: 'no secrets found' }],
        }
      case 'ScoutVerify':
        return {
          repoRoot: REPO, worktreePath: WORKTREE, commonDir: `${REPO}/.git`, registered: true,
          commonDirMatches: true, headSha: BASE_SHA, headMatchesOriginMain: true, clean: true,
          realPathWithinAllowedFamily: true, unsafeCandidateFiles: [],
        }
      case 'Research':
        return { lens: label, facts: [], constraints: [], unread: [] }
      case 'Gaps':
        if (label.startsWith('gap:')) return { lens: label, facts: [], constraints: [], unread: [] }
        if (label === 'skeptic:constraints') return { audited: [] }
        return { gaps: [] }
      case 'Generate': case 'Improve': case 'Aggregate':
        return plan()
      case 'Score':
        return scoreScript ? scoreScript(label) : score()
      case 'RefutePlan':
        return { defects: [], notes: 'no defect reproduced' }
      case 'Build': case 'Fix':
        return { state: 'done', changed: ['src/lane0.ts'], patches: [], notes: '' }
      case 'Review':
        return {
          findings: Array.from({ length: findingsPerLens }, () => {
            const n = findingSeq++
            return {
              file: 'src/lane0.ts', line: n + 1, claim: `distinct defect ${n}`,
              failureScenario: 'concrete input triggers it', severity: 'blocker',
            }
          }),
        }
      case 'Refute':
        return { refuted: false, why: 'reproduced with a concrete input' }
      case 'Gate':
        return { passed: true, commands: [], output: 'ok' }
      case 'Release':
        return { lens: label, risks: [], readback: 'not attempted' }
      default:
        return 'handoff record'
    }
  }

  const agent = async (prompt, opts = {}) => {
    calls.push({ phase: opts.phase, label: opts.label })
    return fixture(opts)
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
    agent, parallel, pipeline, () => {}, (m) => logs.push(m),
    { repo: REPO, scope: SCOPE, deploys: false, agentBudget,
      agentNamespace: '', helperDir: '/tmp/graph-flo-helpers' },
    { total: null, spent: () => 0, remaining: () => Infinity },
    async () => {},
  ).then((result) => ({ result, calls, logs }))
}

const countPhase = (calls, phase) => calls.filter((c) => c.phase === phase).length

test('each agent budget holds the ceiling it is quoted at', async () => {
  // The operator picks one of these three before launch, so each has to mean something.
  const counts = {}
  for (const [range, ceiling] of Object.entries(CEILINGS)) {
    const { calls, result } = await runGraph({ agentBudget: range, lanes: MAX_LANES[range] })
    counts[range] = calls.length
    assert.ok(calls.length <= ceiling,
      `${range} spawned ${calls.length} agents; its quoted ceiling is ${ceiling}.`)
    assert.equal(result.graph.budget.ceiling, ceiling,
      `${range} must enforce the ceiling it advertises`)
  }
  assert.ok(counts.deep > counts.standard && counts.standard > counts.light,
    `ranges must actually separate, got ${JSON.stringify(counts)}`)
})

test('a worst-case run finishes the search instead of dying of budget exhaustion', async () => {
  // The failure this guards is subtler than going over the ceiling — callAgent throws at
  // the ceiling, so "over" is impossible. The real risk is a fan-out big enough that the
  // run halts on AGENT_BUDGET_EXHAUSTED before it ever picks a plan.
  for (const range of Object.keys(CEILINGS)) {
    const { result } = await runGraph({ agentBudget: range, lanes: MAX_LANES[range] })
    assert.notEqual(result.reason, 'agent budget exhausted',
      `${range} ran out of agents mid-run with ${JSON.stringify(result.graph.budget)}`)
    const select = result.graph.operations.find((o) => o.id === 'select-plan')
    assert.equal(select.outputThoughtIds.length, 1,
      `${range} must reach a selected plan on healthy input`)
  }
})

test('the plan search does not scale with however many findings a review returns', async () => {
  // Review findings are model output. If a search stage keyed off them the whole graph
  // would multiply on a change that reviews badly.
  const few = await runGraph({ findingsPerLens: 0 })
  const many = await runGraph({ findingsPerLens: FINDINGS_PER_LENS })
  const searchPhases = ['Generate', 'Score', 'RefutePlan', 'Improve', 'Aggregate']
  for (const phase of searchPhases) {
    assert.equal(countPhase(few.calls, phase), countPhase(many.calls, phase),
      `${phase} changed with the findings count; the search must be fixed by the graph`)
  }
})

test('Score retries cannot spend a run past its ceiling', async () => {
  // Retries added for transport deaths are extra agent calls on top of the reserved batch.
  // Bounded three ways — attempts, a run-wide cap, and a reserved floor — so a total
  // scoring outage still cannot exhaust the budget or exceed the ceiling.
  for (const [range, ceiling] of Object.entries(CEILINGS)) {
    const { calls, result } = await runGraph({ agentBudget: range, lanes: MAX_LANES[range], scoreScript: () => null })
    assert.ok(calls.length <= ceiling,
      `${range} spawned ${calls.length} agents while every score died; ceiling is ${ceiling}.`)
    assert.ok(result.graph.scoreRetries.used <= result.graph.scoreRetries.cap,
      `${range} exceeded its run-wide retry cap`)
    assert.notEqual(result.reason, 'agent budget exhausted',
      `${range} burned its budget on retries instead of halting on the evidence`)
  }
})
