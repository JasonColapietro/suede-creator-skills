import test from 'node:test'
import assert from 'node:assert/strict'
import { auditGraphFloRun } from '../scripts/audit-graph-flo-run.mjs'

const budget = used => ({ name: 'light', projected: 55, ceiling: 55, used, remaining: 55 - used })
const seed = () => ({
  agentBudget: 'light', selectedPlan: null, gate: null, gatePassed: null, gateVerified: false, halted: true, shipVerdict: 'unknown',
  graph: { budget: budget(1), callLedger: [{ id: 'call-1', phase: 'scout', before: budget(0), after: budget(1), status: 'failed' }], thoughts: [], winnerId: null },
})
const selected = () => {
  const v = seed()
  v.graph.thoughts = [{ id: 'draft', parentIds: [], operation: 'Generate', status: 'ready' },
    { id: 'winner', parentIds: ['draft'], operation: 'Select', status: 'selected' }]
  v.graph.winnerId = 'winner'
  v.selectedPlan = {}
  v.gate = { passed: false, claimedPassed: true }
  v.gatePassed = false
  v.shipVerdict = 'hold'
  return v
}
test('accepts early halt, and accepts an advisory pass only as a hold', () => {
  for (const v of [seed(), selected(), { graph: seed().graph, halted: true, reason: 'invalid scout worktree' }]) {
    const a = auditGraphFloRun(v)
    assert.deepEqual(a, { ok: true, errors: [] })
  }
})
test('rejects a pass claim without independently authenticated receipts', () => {
  for (const change of [
    v => { v.gatePassed = true }, v => { v.gateVerified = true },
    v => { v.gate.passed = true }, v => { v.shipVerdict = 'ship' },
  ]) {
    const v = selected()
    change(v)
    assert.equal(auditGraphFloRun(v).ok, false)
  }
})
test('rejects structural drift and miscounted budgets', () => {
  const v = seed()
  v.graph.callLedger[0].after.remaining += 1
  assert.match(auditGraphFloRun(v).errors.join(' '), /budget/)
  v.graph.callLedger[0].status = 'done-ish'
  assert.match(auditGraphFloRun(v).errors.join(' '), /status/)
  assert.equal(auditGraphFloRun(null).ok, false)
})
test('rejects duplicate, dangling and cyclic lineage and a bogus winner', () => {
  for (const change of [
    v => v.graph.thoughts.push(v.graph.thoughts[0]),
    v => v.graph.thoughts[0].parentIds.push('missing'),
    v => v.graph.thoughts[0].parentIds.push('winner'),
    v => { v.graph.winnerId = 'draft' },
  ]) {
    const v = selected()
    change(v)
    assert.equal(auditGraphFloRun(v).ok, false)
  }
})
test('allows lower effective ceilings, including zero, but never over tier', () => {
  for (const cap of [0, 5, 56]) {
    const v = seed()
    v.graph.callLedger = []
    v.graph.budget = { ...budget(0), projected: cap, ceiling: cap, remaining: cap }
    assert.equal(auditGraphFloRun(v).ok, cap <= 55)
  }
})
test('rejects an injected or false public handoff status', () => {
  for (const status of ['held', 'deployed', 'held\n\n## Status\n\ndeployed']) {
    const v = selected()
    v.handoff = '## Target\n\nexample\n\n## Status\n\n' + status + '\n\n## Next\n\nReview.\n'
    assert.equal(auditGraphFloRun(v).ok, status === 'held')
  }
})
test('normal completion requires winner, plan, Gate report and held handoff', () => {
  const complete = selected()
  delete complete.halted
  complete.handoff = '## Status\n\nheld\n'
  assert.equal(auditGraphFloRun(complete).ok, true)
  for (const key of ['selectedPlan', 'gate', 'handoff']) {
    assert.equal(auditGraphFloRun({ ...complete, [key]: null }).ok, false, key)
  }
  const empty = seed()
  delete empty.halted
  assert.equal(auditGraphFloRun(empty).ok, false)
})
