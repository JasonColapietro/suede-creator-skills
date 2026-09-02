// Same contract as tests/test_ship_workflow_cost.mjs, for the copy DAG: the three agent
// ranges the user picks from before launch have to mean something, and sections must
// never be cut to fit one — they are the deliverable. Drives the real script with
// stubbed agents and counts spawns.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = readFileSync(
  path.join(ROOT, 'skills/suede-ship-copy/workflows/suede-ship-copy.js'), 'utf8')
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

function runShipCopy ({ agentBudget = 'standard', sections = 6, findingsPerLens = 12,
  workflowArgs = {}, finalText = 't', deslopScore = 0, draftText } = {}) {
  const calls = []
  const logs = []
  let seq = 0

  const fixture = (opts) => {
    const label = opts.label || ''
    switch (opts.phase) {
      case 'Intake':
        return {
          outDir: '/tmp/out',
          slug: 'piece',
          sources: [{ ref: 'https://example.test', kind: 'url', whatItProves: 'p' }],
          userClaims: [{ claim: 'a claim the requester supplied', whereStated: 'brief' }],
          publishedBaseline: { exists: false, capturedHow: 'n/a' },
          voiceRefs: [],
          protectedVerbatim: [],
          surfaceLaw: { fields: [{ field: 'title', limit: 60, unit: 'chars' }] },
          hazards: [],
        }
      case 'Research':
        return { lens: label, facts: [{ claim: `agent fact ${seq++}`, source: 'f.ts:1' }], constraints: [], unread: [] }
      case 'Gaps':
        if (label.startsWith('gap:')) return { lens: label, facts: [], constraints: [], unread: [] }
        if (label === 'audit:claims') return { audited: [{ claim: 'agent fact 0', verdict: 'holds', why: 'w' }] }
        return { gaps: Array.from({ length: 4 }, (_, i) => ({ missing: `m${i}`, whyItMatters: 'w', howToClose: 'h' })) }
      case 'Angles':
        return {
          posture: label, headline: 'h', promise: 'p', why: 'w', claimsUsed: [],
          competitorCanSayThis: false, killerObjection: 'k', objectionAnswer: 'a',
        }
      case 'Outline':
        if (label === 'redteam:outline') return { objections: [] }
        return {
          angle: { headline: 'h', promise: 'p', why: 'w' },
          sections: Array.from({ length: sections }, (_, i) => ({
            name: `sec${i}`, job: 'j', ownsMessage: `m${i}`, cites: [],
            wordBudget: 50, acceptance: 'a', tier: 'craft',
            mustSayVerbatim: i === 0 ? (workflowArgs.mustSay || []) : [],
          })),
        }
      case 'Draft':
        return { state: 'done', text: draftText || `body ${seq++}`, claimsUsed: [], placeholders: [] }
      case 'Assemble':
        return { text: 'assembled draft', wordCount: 200, notes: '' }
      case 'Review':
        return {
          findings: Array.from({ length: findingsPerLens }, () => {
            const i = seq++
            return { quote: `zz${i}`, claim: `c${i}`, whyItFails: 'x', severity: 'blocker' }
          }),
        }
      case 'Refute':
        return { refuted: false, why: 'reproduced' }
      case 'Polish':
        if (label === 'deslop') return { text: finalText, total: deslopScore, verdict: 'clean', removed: [] }
        if (label === 'graphic-spec') return { visuals: [], suedeMark: { needed: false, approvedAssetPresent: false } }
        if (label === 'channel-package') return { fields: [], headlineVariants: [], cta: 'c' }
        return { text: 'revised', wordCount: 200, notes: '' }
      case 'Gate':
        return { publishReady: false, blockers: [], checks: [], verdict: 'hold' }
      default:
        return 'handoff record'
    }
  }

  const agent = async (prompt, opts = {}) => {
    calls.push({ phase: opts.phase, label: opts.label, prompt })
    return fixture(opts)
  }
  const parallel = (thunks) => Promise.all(thunks.map((t) => t()))
  const pipeline = async (items, ...stages) =>
    Promise.all(items.map(async (item, i) => {
      let value = item
      for (const stage of stages) value = await stage(value, item, i)
      return value
    }))

  const run = new AsyncFunction(
    'agent', 'parallel', 'pipeline', 'phase', 'log', 'args', 'budget', 'workflow',
    SOURCE.replace('export const meta', 'const meta'))

  return run(
    agent, parallel, pipeline, () => {}, (m) => logs.push(m),
    { piece: 'write the page', surface: 'landing page', agentBudget, ...workflowArgs },
    { total: null, spent: () => 0, remaining: () => Infinity },
    async () => {},
  ).then((result) => ({ result, calls, logs }))
}

test('Slop Stop accepts house-style dashes without adding agents or changing the score gate', async () => {
  const base = { findingsPerLens: 0, finalText: 'Keep it dry — quietly useful.', deslopScore: 42 }
  const standard = await runShipCopy(base)
  const custom = await runShipCopy({ ...base, workflowArgs: {
    houseStyle: { guidance: 'Dry humor; keep deliberate fragments.', emDashes: 'allow' },
  } })
  assert.equal(standard.result.copyVerdict, 'hold')
  assert.equal(custom.result.copyVerdict, 'ship')
  assert.equal(custom.result.mechanical.emDashes, 1)
  assert.equal(custom.result.mechanical.emDashViolations, 0)
  assert.equal(custom.calls.length, standard.calls.length)
  assert.match(custom.calls.find(c => c.label === 'deslop').prompt, /suede-deslop\/SKILL\.md/)
  assert.match(custom.calls.find(c => c.label === 'deslop').prompt, /Dry humor/)
})

test('protected source punctuation survives the default Slop Stop policy', async () => {
  const quote = '"Carefully — not quickly."'
  const { result } = await runShipCopy({ findingsPerLens: 0, deslopScore: 42,
    finalText: quote, workflowArgs: { mustSay: [quote] },
  })
  assert.equal(result.copyVerdict, 'ship')
  assert.deepEqual(result.mechanical.missingProtectedStrings, [])
  assert.equal(result.mechanical.emDashViolations, 0)
})

test('missing protected wording is still a hold when the house permits dashes', async () => {
  const { result } = await runShipCopy({ findingsPerLens: 0, deslopScore: 42,
    finalText: 'Changed the quotation.', workflowArgs: {
      mustSay: ['"Carefully — not quickly."'], houseStyle: { emDashes: 'allow' },
    },
  })
  assert.equal(result.copyVerdict, 'hold')
  assert.deepEqual(result.mechanical.missingProtectedStrings, ['"Carefully — not quickly."'])
})

test('Slop Stop score remains advisory below 35', async () => {
  const { result } = await runShipCopy({ findingsPerLens: 0, deslopScore: 22,
    finalText: 'Plain copy.',
  })
  assert.equal(result.copyVerdict, 'ship-with-caveats')
})

test('house-style overrides cannot hide an unresolved or vanished author placeholder', async () => {
  for (const finalText of ['Results: [AUTHOR: supply time].', 'Results arrived instantly.']) {
    const { result } = await runShipCopy({ findingsPerLens: 0, deslopScore: 42,
      draftText: 'Results: [AUTHOR: supply time].', finalText,
      workflowArgs: { houseStyle: { emDashes: 'allow' } },
    })
    assert.equal(result.copyVerdict, 'hold')
    assert.ok(result.mechanical.openPlaceholders || result.mechanical.vanishedPlaceholders)
  }
})

test('unsupported house-style values fail before spending agents', async () => {
  for (const houseStyle of ['allow', [], { emDashes: 'sometimes' }, { guidance: 5 }]) {
    await assert.rejects(runShipCopy({ workflowArgs: { houseStyle } }), /houseStyle must be/)
  }
})

test('review and cleanup share Slop Stop while findings-only review stays read-only', async () => {
  const { calls } = await runShipCopy({ findingsPerLens: 0 })
  const review = calls.find(c => c.label === 'review:slop').prompt
  const cleanup = calls.find(c => c.label === 'deslop').prompt
  assert.match(review, /suede-deslop\/SKILL\.md/)
  assert.match(review, /leave the draft unchanged/)
  assert.match(cleanup, /suede-deslop\/references\/kill-list\.md/)
  assert.match(cleanup, /qualifiers/)
  assert.match(cleanup, /stillGenerating/)
})

test('each agent-budget range holds its documented ceiling and the ranges separate', async () => {
  const ceilings = { light: 36, standard: 45, deep: 50 }
  const counts = {}
  for (const [range, ceiling] of Object.entries(ceilings)) {
    const { calls } = await runShipCopy({ agentBudget: range })
    counts[range] = calls.length
    assert.ok(
      calls.length <= ceiling,
      `${range} spawned ${calls.length} agents; its documented ceiling is ${ceiling}.`)
  }
  assert.ok(
    counts.deep > counts.light,
    `ranges must be distinct, got ${JSON.stringify(counts)}`)
})

test('sections are never cut to fit a range — they are the deliverable', async () => {
  for (const range of ['light', 'standard', 'deep']) {
    const { calls } = await runShipCopy({ agentBudget: range, sections: 8 })
    assert.equal(
      calls.filter((c) => c.phase === 'Draft').length, 8,
      `${range} must draft every planned section`)
  }
})

test('a flood of review findings cannot multiply the run', async () => {
  // Four review lenses at a dozen findings each is 48 findings. Uncapped at two
  // verifiers apiece that is 96 agents on top of everything else.
  const { calls } = await runShipCopy({ agentBudget: 'deep', findingsPerLens: 12 })
  const refute = calls.filter((c) => c.phase === 'Refute').length
  assert.ok(refute <= 12, `refute spawned ${refute} agents; deep allows 6 findings x 2 verifiers.`)
})
