import test from 'node:test'
import assert from 'node:assert/strict'
import { auditGraphFloRun } from '../scripts/audit-graph-flo-run.mjs'

const budget = used => ({ name: 'light', projected: 55, ceiling: 55, used, remaining: 55 - used })
const ledger = phases => phases.map((phase, i) => ({ id: 'call-' + (i + 1), phase, before: budget(i), after: budget(i + 1), status: 'complete' }))
const seed = () => ({
  agentBudget: 'light', selectedPlan: null, gate: null, gatePassed: null, gateVerified: false, halted: true,
  reason: 'invalid scout worktree', shipVerdict: 'unknown', handoff: null,
  graph: { budget: budget(2), callLedger: ledger(['Scout', 'ScoutVerify']), thoughts: [], winnerId: null },
})
const selected = () => {
  const v = seed()
  v.graph.callLedger = ledger(['Scout','ScoutVerify','Research','Gaps','Generate','Score','RefutePlan','Build','ApplyBuild','BuildVerify','Review','Gate','GateVerify'])
  v.graph.budget = budget(v.graph.callLedger.length)
  const plan = { summary: 'Change local examples', lanes: [{ name: 'examples', files: ['src/a.ts'], acceptance: 'node --test' }] }
  v.graph.thoughts = [{ id: 'draft', parentIds: [], operation: 'Generate', status: 'active' },
    { id: 'winner', parentIds: ['draft'], operation: 'Select', status: 'selected', state: { plan } }]
  v.graph.winnerId = 'winner'
  v.selectedPlan = structuredClone(plan)
  v.gate = { passed: false, claimedPassed: true, commands: ['node --test'], output: 'UNVERIFIED: agent report', verification: 'unverified-no-runner-execution-receipts' }
  v.gateAudit = { required: ['node --test'], reported: ['node --test'], missing: [], unexpected: [], commandsComplete: true, outputPresent: true, complete: true }
  v.gatePassed = false
  v.shipVerdict = 'hold'
  return v
}
const complete = () => {
  const v = selected()
  delete v.halted
  delete v.reason
  v.handoff = ['Target','Changed','Commands','Verification','Release Risk','Status','Caveats','Next'].map(h => '## ' + h + '\n\n' + (h === 'Status' ? 'held' : 'Sample evidence.') + '\n').join('\n')
  return v
}
const accepted = v => assert.deepEqual(auditGraphFloRun(v), { ok: true, errors: [] })
const rejected = v => assert.equal(auditGraphFloRun(v).ok, false)
test('accepts early halt, and accepts an advisory pass only as a hold', () => {
  for (const v of [seed(), complete(), { graph: { ...seed().graph, callLedger: ledger(['Scout']), budget: budget(1) }, halted: true, reason: 'invalid scout worktree', scout: { worktreePath: 'invalid' } }]) accepted(v)
})
test('rejects an incomplete early halt and preserves the actual reason', () => {
  const v = seed()
  delete v.reason
  rejected(v)
  rejected({ halted: true, reason: 'invalid scout worktree', graph: { ...seed().graph, callLedger: [], budget: budget(0) } })
})
test('rejects a pass claim without independently authenticated receipts', () => {
  for (const change of [
    v => { v.gatePassed = true }, v => { v.gateVerified = true },
    v => { v.gate.passed = true }, v => { v.shipVerdict = 'ship' },
  ]) {
    const v = complete()
    change(v)
    rejected(v)
  }
})
test('rejects structural drift and miscounted budgets', () => {
  const v = seed()
  v.graph.callLedger[0].after.remaining += 1
  assert.match(auditGraphFloRun(v).errors.join(' '), /budget/)
  v.graph.callLedger[0].status = 'done-ish'
  assert.match(auditGraphFloRun(v).errors.join(' '), /status/)
  rejected(null)
})
test('rejects duplicate, dangling and cyclic lineage and a bogus winner', () => {
  for (const change of [
    v => v.graph.thoughts.push(v.graph.thoughts[0]),
    v => v.graph.thoughts[0].parentIds.push('missing'),
    v => v.graph.thoughts[0].parentIds.push('winner'),
    v => { v.graph.winnerId = 'draft' },
    v => { v.selectedPlan.summary = 'Different plan' },
  ]) {
    const v = complete()
    change(v)
    rejected(v)
  }
})
test('allows lower effective ceilings, including zero, but never over tier', () => {
  for (const cap of [0, 5, 56]) {
    const v = seed()
    v.reason = 'agent budget exhausted'
    v.graph.callLedger = []
    v.graph.budget = { ...budget(0), projected: cap, ceiling: cap, remaining: cap }
    assert.equal(auditGraphFloRun(v).ok, cap <= 55)
  }
})
test('rejects duplicated, wrong or missing handoff sections', () => {
  for (const change of [
    h => h.replace('## Status\n\nheld', '## Status\n\ndeployed'),
    h => h + '\n## Status\n\nheld\n',
    () => '## Status\n\nheld\n',
  ]) { const v = complete(); v.handoff = change(v.handoff); rejected(v) }
})
test('completion requires a real winner, a consistent Gate report and ordered completed work', () => {
  for (const change of [
    v => { v.gate = { passed: false } },
    v => { v.gateAudit.complete = false },
    v => { v.gateAudit.reported = [] },
    v => { delete v.gateAudit },
    v => {
      v.gate.commands = v.gateAudit.required = v.gateAudit.reported = ['npm test']
    },
    v => {
      v.graph.callLedger.push({ ...ledger(['Release'])[0], id: 'call-14', before: budget(13), after: budget(14), status: 'empty' })
      v.graph.budget = budget(14)
    },
    v => { v.graph.callLedger.find(c => c.phase === 'Gate').status = 'empty' },
    v => { v.graph.callLedger.find(c => c.phase === 'ApplyBuild').phase = 'Research' },
    v => { v.graph.callLedger.find(c => c.phase === 'GateVerify').phase = 'Gate' },
    v => {
      v.graph.callLedger = ledger(['Scout'])
      v.graph.callLedger[0].status = 'failed'
      v.graph.budget = budget(1)
    },
    ...['selectedPlan','gate','handoff'].map(k => v => { v[k] = null }),
  ]) { const v = complete(); change(v); rejected(v) }
})
test('an incomplete command report is valid evidence only when explicitly marked invalid', () => {
  const v = complete()
  v.gate.commands = []
  v.gateAudit = { ...v.gateAudit, reported: [], missing: ['node --test'], commandsComplete: false, complete: false }
  rejected(v)
  v.gate.verification = 'invalid-command-report'
  accepted(v)
})
