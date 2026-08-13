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

function runShip () {
  const calls = []
  const logs = []
  let findingSeq = 0

  const fixture = (opts) => {
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
          lanes: Array.from({ length: LANES }, (_, i) => ({
            name: `lane${i}`,
            task: 'do the thing',
            files: [`src/lane${i}.ts`],
            tier: 'integration',
            acceptance: 'npm test',
          })),
        }
      case 'Build':
        return { state: 'done', changed: ['src/x.ts'], notes: '' }
      case 'Review':
        return {
          findings: Array.from({ length: FINDINGS_PER_LENS }, () => {
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
    agent,
    parallel,
    pipeline,
    () => {},
    (m) => logs.push(m),
    { repo: '/tmp/repo', scope: 'change the thing', deploys: true },
    { total: null, spent: () => 0, remaining: () => Infinity },
    async () => {},
  ).then((result) => ({ result, calls, logs }))
}

const countPhase = (calls, phase) => calls.filter((c) => c.phase === phase).length

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
  // The doc promises ~50 for a typical run and names ~115 as the ceiling. Worst case is
  // 8 lanes with both lenses at maxItems — the shape that used to reach several hundred.
  assert.ok(
    calls.length <= 120,
    `the DAG spawned ${calls.length} agents on worst-case input; the documented ceiling is ~115.`)
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
