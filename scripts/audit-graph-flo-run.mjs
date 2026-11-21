import Ajv from 'ajv'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const ceilings = Object.freeze({ light: 55, standard: 110, deep: 200 })
const name = { enum: Object.keys(ceilings) }
const id = { type: 'string', minLength: 1 }
const nonNegative = { type: 'integer', minimum: 0, maximum: 200 }
const object = (properties, required = Object.keys(properties)) => ({
  type: 'object', properties, required,
})
const budget = {
  ...object({ name, projected: nonNegative, ceiling: nonNegative, used: nonNegative, remaining: nonNegative }),
  additionalProperties: false,
}
const nullable = schema => ({ anyOf: [schema, { type: 'null' }] })
const validate = new Ajv({ strict: true, allErrors: false }).compile(object({
  halted: { type: 'boolean' },
  reason: id,
  handoff: nullable({ type: 'string' }),
  agentBudget: name,
  selectedPlan: nullable({ type: 'object' }),
  gate: nullable(object({ passed: { const: false }, claimedPassed: { type: 'boolean' } }, ['passed'])),
  gatePassed: { enum: [false, null] },
  gateVerified: { const: false },
  shipVerdict: { enum: ['hold', 'unknown', 'n/a — not a deploying repo'] },
  graph: object({
    budget,
    winnerId: nullable(id),
    callLedger: {
      type: 'array', maxItems: 200,
      items: object({ id, phase: id, before: budget, after: budget, status: { enum: ['complete', 'empty', 'failed'] } }),
    },
    thoughts: {
      type: 'array', maxItems: 10000,
      items: object({ id, parentIds: { type: 'array', uniqueItems: true, items: id }, operation: id, status: id }),
    },
  }),
}, ['graph']))

/** The offline audit validates evidence consistency, never authenticates host execution. */
export function auditGraphFloRun(run) {
  if (!validate(run)) {
    const errors = (validate.errors || []).map(e => `${e.instancePath || '/'} ${e.message}`)
    return { ok: false, errors }
  }
  const errors = []
  const { graph } = run
  const envelope = ['agentBudget', 'selectedPlan', 'gate', 'gatePassed', 'gateVerified', 'shipVerdict']
  const omitted = envelope.filter(key => !Object.hasOwn(run, key))
  const isEarlyScoutHalt = omitted.length === envelope.length && run.halted === true &&
    run.reason === 'invalid scout worktree' && graph.winnerId === null &&
    graph.thoughts.length === 0
  if (omitted.length && !isEarlyScoutHalt) return { ok: false, errors: ['incomplete run evidence envelope'] }
  const agentBudget = run.agentBudget ?? graph.budget.name
  const cap = graph.budget.ceiling
  if (cap > ceilings[agentBudget]) errors.push('effective budget ceiling exceeds named tier')
  const budgetMatches = (snapshot, used) => snapshot.name === agentBudget &&
    snapshot.projected === cap && snapshot.ceiling === cap && snapshot.used === used &&
    used <= cap && snapshot.remaining === cap - used

  if (!budgetMatches(graph.budget, graph.callLedger.length)) errors.push('final budget does not match ledger')
  graph.callLedger.forEach((entry, i) => {
    if (entry.id !== `call-${i + 1}`) errors.push(`call ledger index ${i}: unexpected or duplicate ID`)
    if (!budgetMatches(entry.before, i) || !budgetMatches(entry.after, i + 1)) errors.push(`call ledger index ${i}: inconsistent budget`)
  })

  const nodes = new Map()
  const children = new Map()
  const indegree = new Map()
  const selected = []
  for (const t of graph.thoughts) {
    if (nodes.has(t.id)) errors.push('duplicate thought ID')
    nodes.set(t.id, t)
    children.set(t.id, [])
    indegree.set(t.id, 0)
    if (t.status === 'selected') selected.push(t)
  }
  for (const t of nodes.values()) {
    for (const parentId of t.parentIds) {
      if (!nodes.has(parentId)) {
        errors.push('dangling thought parent')
        continue
      }
      children.get(parentId).push(t.id)
      indegree.set(t.id, indegree.get(t.id) + 1)
    }
  }
  // Iterative topological walk to avoid stack exhaustion on long serialized lineages.
  const ready = [...indegree].filter(([, n]) => n === 0).map(([nodeId]) => nodeId)
  for (let cursor = 0; cursor < ready.length; cursor++) {
    for (const child of children.get(ready[cursor])) {
      const next = indegree.get(child) - 1
      indegree.set(child, next)
      if (next === 0) ready.push(child)
    }
  }
  if (ready.length !== nodes.size) errors.push('cyclic thought lineage')

  if (graph.winnerId === null) {
    if (selected.length || run.selectedPlan != null || run.gate != null || run.gatePassed != null) errors.push('selection or gate evidence without a winner')
  } else {
    const winner = nodes.get(graph.winnerId)
    if (selected.length !== 1 || selected[0] !== winner || winner?.operation !== 'Select' || winner.parentIds.length !== 1) errors.push('winner is not the unique selected thought with one parent')
    // A halt after Select can legitimately precede publication of selectedPlan.
    if (run.gate !== null && run.selectedPlan === null) errors.push('gate evidence without a selected plan')
  }
  if (run.halted !== true && (graph.winnerId === null || run.selectedPlan == null || run.gate == null || run.handoff == null)) {
    errors.push("completed run requires a winner, selected plan, Gate report and held handoff")
  }
  if (run.handoff != null) {
    const sections = [...run.handoff.matchAll(/^## Status[ \t]*\r?$/gm)]
    const body = sections.length === 1 ? run.handoff.slice(sections[0].index + sections[0][0].length)
      .split(/^## /m, 1)[0].trim() : null
    if (body !== 'held') errors.push('handoff must have exactly one held Status section')
    if (run.shipVerdict !== 'hold') errors.push('handoff requires hold verdict')
  }
  if (run.gate != null && run.gatePassed !== false) errors.push('unverified gate report must record gatePassed false')
  return { ok: errors.length === 0, errors }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length > 3) throw new Error('usage: node scripts/audit-graph-flo-run.mjs [file|-]')
    const input = process.argv[2]
    const result = auditGraphFloRun(JSON.parse(readFileSync(!input || input === '-' ? 0 : input, 'utf8')))
    process.stdout.write(JSON.stringify(result) + '\n')
    if (!result.ok) process.exitCode = 1
  } catch {
    process.stderr.write('Unable to read a single JSON run. Usage: node scripts/audit-graph-flo-run.mjs [file|-]\n')
    process.exitCode = 2
  }
}
