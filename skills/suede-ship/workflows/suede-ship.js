export const meta = {
  name: 'suede-ship',
  description: 'Canonical Suede DAG: scout -> lane plan -> collision gate -> build -> dual-lens review -> adversarial refute -> integration gate -> handoff',
  whenToUse: 'Any nontrivial change to a Suede repo that touches more than one file or surface. Pass args: { repo, scope, deploys? }',
  phases: [
    { title: 'Scout', detail: 'fetch origin, dirty files, worktree, Vercel api/ landmines — manifest only' },
    { title: 'Research', detail: 'multi-modal sweep: code path, contracts, history, prior decisions, external docs' },
    { title: 'Gaps', detail: 'completeness critic names what went unread, one bounded fill round' },
    { title: 'Plan', detail: 'lane map with explicit file ownership (high effort)' },
    { title: 'Build', detail: 'disjoint lanes, each pipelined straight into its own review' },
    { title: 'Refute', detail: 'adversarial verifiers, refute-by-default, majority kills' },
    { title: 'Gate', detail: 'barrier: typecheck + build + tests on the integrated worktree' },
    { title: 'Release', detail: 'adversarial release verification — config drift, public surface, irreversibility, live baseline' },
    { title: 'Handoff', detail: 'evidence record — changed files, commands, verification, caveats' },
  ],
}

// Workflow({ name: 'suede-ship', args: { repo: '~/code/my-app', scope: '...', deploys: true } })
// Falls back to: Workflow({ scriptPath: '~/.claude/workflows/suede-ship.js', args: {...} })

// args can arrive as an object or as a JSON-encoded string depending on how the
// caller serialized it. Accept both — a stringified arg blob is otherwise an
// instant, zero-agent failure that reads like a script bug.
let A = args
if (typeof A === 'string') {
  try { A = JSON.parse(A) } catch (e) { throw new Error(`args arrived as an unparseable string: ${A.slice(0, 200)}`) }
}
const REPO = (A && A.repo) || null
const SCOPE = (A && A.scope) || null
const DEPLOYS = !!(A && A.deploys)
// Total agent budget. The caller is required to ask the user which range they want
// before launching (see SKILL.md) — this default exists so a caller that forgets gets
// the middle range rather than the widest one.
const BUDGETS = {
  light:    { generatedPlans: 3, beamWidth: 1, improveRounds: 1, maxLanes: 3, refutePerLane: 2, fixCap: 4, gapFills: 2 },
  standard: { generatedPlans: 5, beamWidth: 2, improveRounds: 1, maxLanes: 5, refutePerLane: 4, fixCap: 8, gapFills: 4 },
  deep:     { generatedPlans: 8, beamWidth: 3, improveRounds: 2, maxLanes: 8, refutePerLane: 6, fixCap: 12, gapFills: 4 },
}
const BUDGET_NAME = BUDGETS[(A && A.agentBudget) || ''] ? A.agentBudget : 'standard'
const BUDGET = BUDGETS[BUDGET_NAME]
const LIVE = (A && A.liveUrl) || null
if (!REPO || !SCOPE) throw new Error(`Pass args: { repo: "~/code/<repo>", scope: "<what to change>" } — got ${JSON.stringify(A)}`)

// ---------------------------------------------------------------- schemas
// Scout returns a MANIFEST, never file contents. This is the single biggest
// cost lever: builders re-read what they need. Threading source through stage
// returns is what turns cache reads into 85% of the bill.
const SCOUT = {
  type: 'object',
  required: ['worktreePath', 'baseSha', 'dirtyFiles', 'candidateFiles', 'siblingClaims', 'hazards'],
  properties: {
    worktreePath: { type: 'string' },
    baseSha: { type: 'string' },
    dirtyFiles: { type: 'array', items: { type: 'string' } },
    // Files already in flight on OTHER branches of this repo. Lane-vs-lane collision
    // detection is blind to these — a sibling worktree editing the same file is a merge
    // conflict that surfaces days later, at integration, with no memory of why.
    siblingClaims: {
      type: 'array',
      maxItems: 20,
      items: {
        type: 'object',
        required: ['worktree', 'branch', 'files', 'liveProcess', 'likelyLanded'],
        properties: {
          worktree: { type: 'string' },
          branch: { type: 'string' },
          files: { type: 'array', items: { type: 'string' } },
          liveProcess: { type: 'boolean', description: 'any process cwd inside it right now — not just claude' },
          likelyLanded: { type: 'boolean', description: 'git cherry says an equivalent patch is already upstream (squash-merge)' },
        },
      },
    },
    candidateFiles: { type: 'array', items: { type: 'string' }, maxItems: 60 },
    hazards: {
      type: 'array',
      items: {
        type: 'object',
        required: ['kind', 'blocking', 'detail'],
        properties: {
          kind: { type: 'string', enum: ['stale-mirror', 'vercel-api-route', 'missing-ignore-command', 'live-worktree', 'secret', 'other'] },
          // `kind` is a TOPIC, not a verdict. All-clear reports are welcome and useful —
          // they must set blocking:false. Only an actually-present, actually-dangerous
          // condition sets blocking:true.
          blocking: { type: 'boolean', description: 'true ONLY if the dangerous condition is actually present right now. An all-clear report on this topic is blocking:false.' },
          detail: { type: 'string' },
        },
      },
    },
  },
}

// Research returns compressed, PROVENANCED facts — every claim carries a
// file:line or URL. Same cost discipline as the scout manifest: a lens that
// pastes source back is a lens that costs more than reading the file twice.
const RESEARCH = {
  type: 'object',
  required: ['lens', 'facts', 'constraints', 'unread'],
  properties: {
    lens: { type: 'string' },
    facts: {
      type: 'array',
      maxItems: 12,
      items: {
        type: 'object',
        required: ['claim', 'source'],
        properties: {
          claim: { type: 'string' },
          source: { type: 'string', description: 'file:line, commit sha, PR url, or doc url' },
        },
      },
    },
    constraints: {
      type: 'array',
      maxItems: 8,
      items: {
        type: 'object',
        required: ['rule', 'source', 'breakingItMeans'],
        properties: {
          rule: { type: 'string' },
          source: { type: 'string' },
          breakingItMeans: { type: 'string' },
        },
      },
    },
    unread: { type: 'array', items: { type: 'string' }, description: 'files/sources this lens knows exist but did not open' },
  },
}

const GAPS = {
  type: 'object',
  required: ['gaps'],
  properties: {
    gaps: {
      type: 'array',
      maxItems: 4,
      items: {
        type: 'object',
        required: ['missing', 'whyItMatters', 'howToClose'],
        properties: {
          missing: { type: 'string' },
          whyItMatters: { type: 'string' },
          howToClose: { type: 'string', description: 'the specific file, command, or search that closes it' },
        },
      },
    },
  },
}

const SKEPTIC = {
  type: 'object',
  required: ['audited'],
  properties: {
    audited: {
      type: 'array',
      items: {
        type: 'object',
        required: ['rule', 'verdict', 'why'],
        properties: {
          rule: { type: 'string' },
          verdict: { type: 'string', enum: ['holds', 'misread', 'unsourceable', 'stale'] },
          why: { type: 'string' },
        },
      },
    },
  },
}

const REDTEAM = {
  type: 'object',
  required: ['objections'],
  properties: {
    objections: {
      type: 'array',
      maxItems: 6,
      items: {
        type: 'object',
        required: ['lane', 'objection', 'severity'],
        properties: {
          lane: { type: 'string' },
          objection: { type: 'string' },
          severity: { type: 'string', enum: ['fatal', 'serious', 'noted'] },
        },
      },
    },
  },
}

const PLAN = {
  type: 'object',
  required: ['summary', 'coverage', 'lanes'],
  properties: {
    summary: { type: 'string' },
    coverage: { type: 'array', items: { type: 'string' } },
    lanes: {
      type: 'array',
      maxItems: 8,
      items: {
        type: 'object',
        required: ['name', 'task', 'files', 'tier', 'acceptance'],
        properties: {
          name: { type: 'string' },
          task: { type: 'string' },
          files: { type: 'array', items: { type: 'string' } },
          tier: { type: 'string', enum: ['mechanical', 'integration', 'judgment'] },
          acceptance: { type: 'string' },
        },
      },
    },
  },
}

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

const BUILD = {
  type: 'object',
  required: ['state', 'changed', 'notes'],
  properties: {
    state: { type: 'string', enum: ['done', 'done-with-concerns', 'needs-context', 'blocked'] },
    changed: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
}

const FINDINGS = {
  type: 'object',
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      maxItems: 10,
      items: {
        type: 'object',
        required: ['file', 'claim', 'failureScenario', 'severity'],
        properties: {
          file: { type: 'string' },
          line: { type: 'number' },
          claim: { type: 'string' },
          failureScenario: { type: 'string' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
        },
      },
    },
  },
}

const VERDICT = {
  type: 'object',
  required: ['refuted', 'why'],
  properties: { refuted: { type: 'boolean' }, why: { type: 'string' } },
}

const GATE = {
  type: 'object',
  required: ['passed', 'commands', 'output'],
  properties: {
    passed: { type: 'boolean' },
    commands: { type: 'array', items: { type: 'string' } },
    output: { type: 'string' },
  },
}

const RELEASE = {
  type: 'object',
  required: ['lens', 'risks', 'readback'],
  properties: {
    lens: { type: 'string' },
    risks: {
      type: 'array',
      maxItems: 8,
      items: {
        type: 'object',
        required: ['risk', 'evidence', 'severity', 'reversible'],
        properties: {
          risk: { type: 'string' },
          evidence: { type: 'string', description: 'command output, file:line, url + status code — not an assertion' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          reversible: { type: 'string', enum: ['revert', 'flag-off', 'manual-undo', 'irreversible'] },
          mitigation: { type: 'string' },
        },
      },
    },
    readback: { type: 'string', description: 'what was actually observed against production right now; "not attempted" if no live surface' },
  },
}

// ------------------------------------------------------- graph-of-thoughts
// Adapted from the Graph of Thoughts operation model (ETH Zurich, BSD-3-Clause).
// The workflow runner evaluates this file with injected globals, so keeping the graph
// engine here preserves its single-file ABI while still giving the operations pure seams.
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

const addOperation = (operations, operation) => {
  if (operations.some(candidate => candidate.id === operation.id)) {
    throw new Error(`duplicate operation ${operation.id}`)
  }
  operations.push(operation)
  return operation
}

const validateOperationGraph = operations => {
  const byId = new Map()
  for (const operation of operations) {
    if (!operation || !operation.id) throw new Error('operation requires an id')
    if (byId.has(operation.id)) throw new Error(`duplicate operation ${operation.id}`)
    byId.set(operation.id, operation)
    operation.successorIds = []
  }
  for (const operation of operations) {
    for (const predecessorId of operation.predecessorIds) {
      const predecessor = byId.get(predecessorId)
      if (!predecessor) throw new Error(`unknown predecessor ${predecessorId}`)
      predecessor.successorIds.push(operation.id)
    }
  }

  const pending = new Map([...byId].map(([id, operation]) => [id, operation.predecessorIds.length]))
  const ready = [...pending].filter(([, count]) => count === 0).map(([id]) => id).sort()
  const ordered = []
  while (ready.length) {
    const id = ready.shift()
    const operation = byId.get(id)
    ordered.push(operation)
    for (const successorId of [...operation.successorIds].sort()) {
      const remaining = pending.get(successorId) - 1
      pending.set(successorId, remaining)
      if (remaining === 0) {
        ready.push(successorId)
        ready.sort()
      }
    }
  }
  if (ordered.length !== operations.length) throw new Error('operation graph contains a cycle')
  return ordered
}

const executeOperationGraph = async (operations, graph) => {
  const ordered = validateOperationGraph(operations)
  const byId = new Map(ordered.map(operation => [operation.id, operation]))
  for (const operation of ordered) {
    const inputThoughts = operation.predecessorIds.flatMap(predecessorId =>
      byId.get(predecessorId).thoughtIds.map(thoughtId => graph.thoughts.find(thought => thought.id === thoughtId)).filter(Boolean))
    operation.status = 'running'
    try {
      const outputThoughts = await operation.execute({ graph, operation, inputThoughts })
      const thoughts = Array.isArray(outputThoughts) ? outputThoughts : []
      operation.thoughtIds = thoughts.map(thought => thought.id)
      graph.thoughts.push(...thoughts)
      operation.executed = true
      operation.status = 'complete'
    } catch (error) {
      operation.status = 'failed'
      operation.error = error.message
      throw error
    }
  }
  return ordered
}

const rankThoughts = thoughts => [...thoughts].sort((a, b) =>
  b.score.total - a.score.total || b.score.coverage - a.score.coverage ||
  b.score.safety - a.score.safety || b.score.evidence - a.score.evidence ||
  a.id.localeCompare(b.id))

// Selection is deliberately absent from the first graph segment. Task 2 adds the
// adversarial search and Select operation; until then no candidate receives authority.
const graph = { operations: [], thoughts: [], pruned: [], winnerId: null }

// ---------------------------------------------------------------- 0. scout
phase('Scout')
const scout = await agent(
  `Repo: ${REPO}. Planned scope: ${SCOPE}

You are the SCOUT. Read-only reconnaissance plus ONE setup action. Do not edit source.

1. This machine is a stale mirror. Run: git -C ${REPO} fetch origin && git -C ${REPO} status --short --branch
2. Record every dirty and untracked file (these are protected WIP — never in a lane scope).
3. Check for live processes holding an existing worktree: lsof -d cwd 2>/dev/null | grep worktrees
   Any hit is a hazard "live-worktree" — do NOT reuse or remove that path.
4. Worktree for this run. FIRST run \`git -C ${REPO} worktree list\` and look for an existing
   worktree whose path contains "/ship-" — if one exists and no live process holds it, REUSE
   it and report its path; do not create a second. Otherwise create one, cut from origin/main
   (never local main):
   git -C ${REPO} worktree add ../$(basename ${REPO}).worktrees/ship-<short-slug> origin/main
   Copy any untracked env files the app needs (.env.local etc) into it.
5. Hazard sweep, report only, no fixes:
   - bare api/ directory: every .js/.ts there is a PUBLIC serverless route. Flag test/fixture/scratch files as "vercel-api-route".
   - vercel.json missing the preview-killing ignoreCommand -> "missing-ignore-command".
   - any secret literal in files you touched -> "secret".

   CRITICAL — \`kind\` is the TOPIC you looked at; \`blocking\` is the verdict. Set
   blocking:true ONLY when the dangerous condition is actually present and would make it
   unsafe to proceed RIGHT NOW. Report all-clears with blocking:false — they are valuable
   and will not stop the run. Specifically:
   - "no secrets found" -> kind:"secret", blocking:FALSE
   - "vercel.json already has the ignoreCommand" -> kind:"missing-ignore-command", blocking:FALSE
   - a live process in ANOTHER repo's worktree -> blocking:FALSE (irrelevant to this run;
     note it so nobody touches it). blocking:true for kind "live-worktree" ONLY if a live
     process holds a worktree of ${REPO} that this run would reuse or remove.
   - a real secret literal committed in a TRACKED file -> blocking:TRUE. A gitignored
     .env file is not a blocking secret; note it blocking:FALSE and warn builders off it.
6. SIBLING CLAIMS — what other branches of this repo already have in flight. Worktrees live
   in TWO families and an audit that globs only the first silently misses ~25% of them:
     ls -d $(dirname ${REPO})/$(basename ${REPO}).worktrees/*/ ${REPO}/.claude/worktrees/*/ 2>/dev/null
   Cross-check against \`git -C ${REPO} worktree list\`. For each sibling (skip THIS run's
   worktree), report:
     - branch: git -C <wt> rev-parse --abbrev-ref HEAD
     - files: git -C <wt> diff --name-only origin/main...HEAD  PLUS  git -C <wt> status --porcelain
       (committed-but-unmerged work AND uncommitted work both count as claimed)
     - likelyLanded: run \`git -C <wt> cherry origin/main\`. A leading "-" means an equivalent
       patch is ALREADY upstream, i.e. squash-merged. Ancestry alone lies here: git log will
       show commits ahead and git diff will show changed files even when the content already
       landed, because main moved on. Set likelyLanded:true for those; their file claims are dead.
     - liveProcess: lsof -d cwd 2>/dev/null | grep "<wt path>" — ANY process, not just claude.
       A worktree held by a bare \`gh\` or \`node\` and no claude process at all is still live.
   Paths only. Do not read the siblings' file contents.
7. List at most 60 candidate files the scope plausibly touches, by PATH ONLY.

Return the manifest. Do NOT paste file contents into your answer — builders read their own files.`,
  { schema: SCOUT, phase: 'Scout', effort: 'low' }
)

if (!scout) throw new Error('Scout failed — cannot establish a safe base. Stop.')
// Halt on the VERDICT, never on the topic label. Keying this on `kind` alone made a
// clean scout report — "no secrets found", "no live process" — read as a hazard and
// stop the run. An all-clear filed under a scary-sounding kind is still an all-clear.
const blockingHazards = scout.hazards.filter(h =>
  h.blocking === true && (h.kind === 'secret' || h.kind === 'live-worktree'))
if (blockingHazards.length) {
  log(`HALT: ${blockingHazards.map(h => `${h.kind}: ${h.detail}`).join(' | ')}`)
  return { halted: true, reason: 'blocking hazard at scout', scout }
}
const advisories = scout.hazards.filter(h => !h.blocking)
log(`worktree ${scout.worktreePath} @ ${scout.baseSha} · ${scout.dirtyFiles.length} dirty · ${blockingHazards.length} blocking · ${advisories.length} advisory`)

// Cross-worktree claim index. Squash-merged branches are dropped: git cherry already
// told us their patches are upstream, and treating landed work as contested is how a
// stale worktree gets to veto a lane forever.
const liveClaims = (scout.siblingClaims || []).filter(s => !s.likelyLanded)
const contested = new Map()
for (const s of liveClaims) {
  for (const f of s.files) {
    if (!contested.has(f)) contested.set(f, [])
    contested.get(f).push({ branch: s.branch, worktree: s.worktree, live: s.liveProcess })
  }
}
if (contested.size) log(`${contested.size} file(s) claimed by ${liveClaims.length} unlanded sibling branch(es): ${liveClaims.map(s => `${s.branch}${s.liveProcess ? ' [LIVE]' : ''}`).join(', ')}`)

// ------------------------------------------------------------- 1. research
// Multi-modal sweep. Each lens searches a DIFFERENT way and is blind to the
// others — one angle never finds everything. This is a genuine barrier: the
// planner needs every lens at once to write a lane map, and the gap critic
// needs the full `unread` union to know what was skipped.
phase('Research')
// Optional external decision store (a synced notes vault, an ADR archive, a
// handoff directory). Absent by default: pass args.vault to switch the lens on.
const VAULT = (A && A.vault) || null
const BASE = `Worktree: ${scout.worktreePath} (read-only — this is research, change nothing)
Scope under consideration: ${SCOPE}
Candidate files: ${scout.candidateFiles.join(', ')}

Return compressed, provenanced facts. EVERY claim carries a file:line, commit sha, PR
url, or doc url — a claim you cannot source is a guess and does not belong in the map.
Do not paste source back; the planner re-reads what it needs. List in "unread" anything
you know exists and deliberately did not open.`

const LENSES = [
  {
    key: 'code-path',
    effort: 'medium',
    prompt: `Lens: CODE PATH. Trace the actual runtime path the scope would change — entry point
through to side effect (render, response, write). Name the functions in order, where state
enters, where it is mutated, and every caller that would feel a signature change. Facts are
"X calls Y which does Z", sourced to lines. Constraints are the behaviors callers depend on.`,
  },
  {
    key: 'contracts',
    effort: 'medium',
    prompt: `Lens: CONTRACTS AND INVARIANTS. Find what PINS this code: exported types, zod/schema
definitions, DB schema and migrations, API request/response shapes, env var reads, feature
flags, and the assertions in existing tests. A test that asserts current behavior IS a
constraint — record what breaking it would mean. Prefer the schema and the test over prose.`,
  },
  {
    key: 'history',
    effort: 'low',
    prompt: `Lens: HISTORY. Run git log --oneline -30 and git log -p --follow on the two or three
most central candidate files. Answer: why does this look the way it does? Find prior attempts
at this same change, reverts, fix-forward commits, and commit messages that explain a
non-obvious choice. A constraint here is "this was tried in <sha> and reverted because …".
Check merged PRs with gh pr list --state merged --limit 20 if the repo has a remote.`,
  },
  {
    key: 'decisions',
    effort: 'low',
    prompt: `Lens: PRIOR DECISIONS. Read what has already been settled, so this run does not
re-litigate it. In order: the repo's CLAUDE.md and AGENTS.md, any docs/ or ADR directory${VAULT ? `,
then the external decision vault at "${VAULT}". There, ls then read any decisions,
handoffs, and project directories it holds` : ''}.
Treat anything outside the repo as CONTEXT, not source truth: current repo files and live
services override any older handoff, and say so explicitly when they conflict. Facts are
"decided <what> on <date>, source <path>". Constraints are standing rules this scope touches.`,
  },
  {
    key: 'external',
    effort: 'low',
    prompt: `Lens: EXTERNAL SURFACE. Only if the scope touches a third-party library, framework,
API, or model: read the installed version from package.json and lockfile, then check the
actual current docs (WebSearch / WebFetch, and ToolSearch for any MCP that covers the vendor)
for the API shape, deprecations, and breaking changes between the installed version and the
one the docs describe. Anything about Claude or Anthropic models: read the claude-api skill
rather than answering from memory. IF THE SCOPE TOUCHES NO EXTERNAL DEPENDENCY, return empty
arrays immediately and stop — do not invent work.`,
  },
]

const sweep = (await parallel(LENSES.map(l => () => agent(
  `${BASE}\n\n${l.prompt}`,
  { label: `research:${l.key}`, phase: 'Research', schema: RESEARCH, effort: l.effort }
)))).filter(Boolean)

// -------------------------------------------------------------- 2. gap fill
// What a sweep misses is invisible to the sweep. One critic, one bounded round.
phase('Gaps')
const critic = await agent(
  `Scope: ${SCOPE}
Research so far: ${JSON.stringify(sweep)}
Everything the lenses flagged as unread: ${JSON.stringify([...new Set(sweep.flatMap(r => r.unread))])}

You are the COMPLETENESS CRITIC. You do not add findings — you name what is MISSING.
Ask: which modality was not run? Which claim rests on one source? Which named file was
listed as unread but is central to the scope? Where do two lenses contradict each other?
Return at most 4 gaps, each with the specific file, command, or search that closes it.
An unresolved contradiction between two lenses is always a gap. If coverage is genuinely
sufficient, return an empty array — padding this list costs a round of agents.`,
  { schema: GAPS, phase: 'Gaps', effort: 'high' }
)

const gapFills = critic && critic.gaps.length
  ? (await parallel(critic.gaps.slice(0, BUDGET.gapFills).map(g => () => agent(
      `${BASE}\n\nLens: GAP FILL. Close exactly this gap and nothing else.
Missing: ${g.missing}
Why it matters: ${g.whyItMatters}
How to close it: ${g.howToClose}`,
      { label: `gap:${g.missing.slice(0, 30)}`, phase: 'Gaps', schema: RESEARCH, effort: 'medium' }
    )))).filter(Boolean)
  : []

const research = [...sweep, ...gapFills]
const claimed = research.flatMap(r => r.constraints)
const stillUnread = [...new Set(research.flatMap(r => r.unread))]

// SKEPTIC #1 — provenance audit on constraints only (not every fact; constraints
// are what the planner is actually bound by). A hallucinated constraint is the
// most expensive error in this DAG: it survives every downstream gate, because
// every downstream gate is checking conformance to it.
const audit = claimed.length
  ? await agent(
      `Worktree: ${scout.worktreePath} (read-only)

These constraints were asserted by research agents and the planner is about to be bound
by them. Audit each one against its cited source. OPEN THE SOURCE — do not reason about
whether the claim sounds plausible.

${JSON.stringify(claimed)}

Verdicts:
- holds: the source says this, and it still applies to the current code
- misread: the source exists but does not support the claim as stated
- unsourceable: the cited file/line/url does not exist or does not contain this
- stale: it was true when written but current repo state or a live service contradicts it
  (vault handoffs and old ADRs are especially prone to this — current code wins)

Be adversarial. You are looking for constraints that will wrongly narrow the plan.
An over-broad constraint invented from a real file is still a misread.`,
      { schema: SKEPTIC, phase: 'Gaps', label: 'skeptic:constraints', effort: 'high' }
    )
  : null

const rejected = audit ? audit.audited.filter(a => a.verdict !== 'holds') : []
const rejectedRules = new Set(rejected.map(a => a.rule))
const constraints = claimed.filter(c => !rejectedRules.has(c.rule))
if (rejected.length) log(`skeptic dropped ${rejected.length} constraint(s): ${rejected.map(a => `${a.verdict} — ${a.rule}`).join(' | ')}`)
log(`research: ${research.length} lenses · ${research.flatMap(r => r.facts).length} sourced facts · ${constraints.length}/${claimed.length} constraints survived audit · ${critic ? critic.gaps.length : 0} gaps filled · ${stillUnread.length} still unread`)

// ---------------------------------------------------------------- 3. plan
phase('Plan')
let thoughtSequence = 0
const nextThoughtId = () => `thought-${++thoughtSequence}`
const PLAN_TIERS = new Set(['mechanical', 'integration', 'judgment'])
const SCORE_DIMENSIONS = ['coverage', 'evidence', 'feasibility', 'safety', 'efficiency']
const SCORE_TOTAL_TOLERANCE = 1e-9
const nonEmptyString = value => typeof value === 'string' && value.trim().length > 0
const nonEmptyStringArray = value => Array.isArray(value) && value.length > 0 && value.every(nonEmptyString)
const validPlan = plan => plan && nonEmptyString(plan.summary) && nonEmptyStringArray(plan.coverage) &&
  Array.isArray(plan.lanes) && plan.lanes.length > 0 && plan.lanes.every(lane => lane &&
    nonEmptyString(lane.name) && nonEmptyString(lane.task) && nonEmptyStringArray(lane.files) &&
    PLAN_TIERS.has(lane.tier) && nonEmptyString(lane.acceptance))
const validScore = score => score && SCORE_DIMENSIONS
  .every(key => Number.isFinite(score[key]) && score[key] >= 0 && score[key] <= 20) &&
  Number.isFinite(score.total) && score.total >= 0 && score.total <= 100 &&
  Math.abs(score.total - SCORE_DIMENSIONS.reduce((sum, key) => sum + score[key], 0)) <= SCORE_TOTAL_TOLERANCE &&
  nonEmptyString(score.rationale)
const canonicalRoot = root => String(root).replace(/\/+$/, '').replace(/\/+/g, '/')
const pathRoots = [canonicalRoot(scout.worktreePath), canonicalRoot(REPO)]
const rel = raw => {
  if (typeof raw !== 'string' || !raw.trim()) return null
  let value = raw.trim().replace(/\/+/g, '/')
  const wasAbsolute = value.startsWith('/')
  let rooted = false
  for (const root of pathRoots) {
    if (value === root) return null
    if (value.startsWith(root + '/')) {
      value = value.slice(root.length + 1)
      rooted = true
      break
    }
  }
  if (wasAbsolute && !rooted) return null

  const segments = []
  for (const segment of value.split('/')) {
    if (!segment || segment === '.') continue
    if (segment === '..') {
      if (!segments.length) return null
      segments.pop()
    } else {
      segments.push(segment)
    }
  }
  return segments.length ? segments.join('/') : null
}
const overlaps = (a, b) => Boolean(a && b) && (a === b || a.startsWith(b + '/') || b.startsWith(a + '/'))
const planFileCollisions = plan => {
  if (!validPlan(plan)) return ['malformed plan']
  const owners = new Map()
  const collisions = []
  for (const lane of plan.lanes) {
    for (const raw of lane.files) {
      const file = rel(raw)
      if (!file) {
        collisions.push(`${String(raw)}: empty, absolute-outside-repo, or repo-escaping path`)
        continue
      }
      const prior = [...owners.keys()].find(owned => overlaps(file, owned))
      if (prior) collisions.push(`${file}: owned by both ${owners.get(prior)} and ${lane.name}`)
      else owners.set(file, lane.name)
    }
  }
  return collisions
}
const normalizeDefectPart = value => String(value).trim().toLowerCase().replace(/\s+/g, ' ')
const normalizedDefectKey = defect => `${normalizeDefectPart(defect && defect.kind)}:${normalizeDefectPart(defect && defect.lane)}`
const scorePlan = (plan, label) => agent(
  `Worktree: ${scout.worktreePath} (read-only — do not edit source)
You are a SCORER. Do not edit source, run mutation commands, or make external changes.

Score this candidate plan against scope coverage, evidence quality, implementation feasibility,
safety and reversibility, and efficiency. Return five 0-20 dimensions, total 0-100, and rationale.
Scope: ${SCOPE}
Candidate: ${JSON.stringify(plan)}`,
  { label, phase: 'Score', schema: PLAN_SCORE, effort: 'medium', authority: 'read-only' }
)

addOperation(graph.operations, createOperation({
  id: 'generate-plans',
  type: OPERATION_TYPES.Generate,
  execute: async () => parallel(Array.from({ length: BUDGET.generatedPlans }, (_, index) => {
    const thoughtId = nextThoughtId()
    return async () => {
      const candidate = await agent(
        `Worktree: ${scout.worktreePath} (read-only — do not edit source)
Scope: ${SCOPE}
Candidate ${index + 1} of ${BUDGET.generatedPlans}. Produce an independent complete lane plan.
Candidate files: ${scout.candidateFiles.join(', ')}
Research: ${JSON.stringify(research)}
Constraints: ${JSON.stringify(constraints)}
Unread sources: ${JSON.stringify(stillUnread)}

Return a plan with a summary, explicit disjoint lane ownership, and observable acceptance commands.`,
        { label: `Generate:${index}`, phase: 'Generate', schema: PLAN, effort: 'high', authority: 'read-only' }
      )
      return createThought({
        id: thoughtId, parentIds: [], operationId: 'generate-plans', operation: OPERATION_TYPES.Generate,
        depth: 0, state: { plan: candidate }, status: 'active',
      })
    }
  })),
}))

addOperation(graph.operations, createOperation({
  id: 'score-generated',
  type: OPERATION_TYPES.Score,
  predecessorIds: ['generate-plans'],
  execute: async ({ inputThoughts }) => parallel(inputThoughts.map(thought => {
    const thoughtId = nextThoughtId()
    return async () => {
      const score = validPlan(thought.state.plan)
        ? await agent(
            `Worktree: ${scout.worktreePath} (read-only — do not edit source)
You are a SCORER. Do not edit source, run mutation commands, or make external changes.

Score this candidate plan against scope coverage, evidence quality, implementation feasibility,
safety and reversibility, and efficiency. Return five 0-20 dimensions, total 0-100, and rationale.
Scope: ${SCOPE}
Candidate: ${JSON.stringify(thought.state.plan)}`,
            { label: `Score:${thought.id}`, phase: 'Score', schema: PLAN_SCORE, effort: 'medium', authority: 'read-only' }
          )
        : null
      const scored = validScore(score) ? score : null
      return createThought({
        id: thoughtId, parentIds: [thought.id], operationId: 'score-generated', operation: OPERATION_TYPES.Score,
        depth: thought.depth + 1, state: thought.state, score: scored,
        status: scored ? 'active' : 'pruned',
      })
    }
  })),
}))

addOperation(graph.operations, createOperation({
  id: 'keep-generated',
  type: OPERATION_TYPES.KeepBestN,
  predecessorIds: ['score-generated'],
  execute: async ({ inputThoughts }) => {
    const eligible = inputThoughts.filter(thought =>
      thought.status === 'active' && validPlan(thought.state.plan) && validScore(thought.score))
    const keptIds = new Set(rankThoughts(eligible).slice(0, BUDGET.beamWidth).map(thought => thought.id))
    const outputs = inputThoughts.map(thought => {
      const kept = keptIds.has(thought.id)
      const reason = kept ? 'ranked within configured beam' : validScore(thought.score)
        ? `ranked outside configured beam of ${BUDGET.beamWidth}`
        : 'candidate has no valid score'
      return createThought({
        id: nextThoughtId(), parentIds: [thought.id], operationId: 'keep-generated', operation: OPERATION_TYPES.KeepBestN,
        depth: thought.depth + 1, state: { ...thought.state, pruning: reason }, score: thought.score,
        status: kept ? 'kept' : 'pruned',
      })
    })
    graph.pruned.push(...outputs.filter(thought => thought.status === 'pruned'))
    return outputs
  },
}))

addOperation(graph.operations, createOperation({
  id: 'refute-plans',
  type: OPERATION_TYPES.Refute,
  predecessorIds: ['keep-generated'],
  execute: async ({ inputThoughts }) => parallel(inputThoughts
    .filter(thought => thought.status === 'kept')
    .map(thought => {
      const thoughtId = nextThoughtId()
      return async () => {
        const lenses = [
          'CONTRACT ADVERSARY: find missing scope, unsupported assumptions, constraint breaks, and unverifiable evidence.',
          'FAILURE ADVERSARY: find concrete collision, rollback, security, test-gap, and integration-order failures.',
        ]
        const refutations = await parallel(lenses.map((lens, index) => () => agent(
          `Worktree: ${scout.worktreePath} (read-only — do not edit source)
Scope: ${SCOPE}
Candidate plan: ${JSON.stringify(thought.state.plan)}
Candidate score: ${JSON.stringify(thought.score)}

${lens}

Return only reproducible defects. A blocking defect must name its normalized kind and lane,
the concrete claim, and evidence that another reader can verify. Empty defects are valid.`,
          { label: `RefutePlan:${thought.id}:${index}`, phase: 'RefutePlan', schema: PLAN_REFUTATION, effort: 'high', authority: 'read-only' }
        )))
        const blocking = refutations.map(result => (result && Array.isArray(result.defects) ? result.defects : [])
          .filter(defect => defect && defect.blocking))
        const matchingBlocker = blocking.length === 2 && blocking[0]
          .find(defect => blocking[1].some(other => normalizedDefectKey(other) === normalizedDefectKey(defect)))
        return createThought({
          id: thoughtId, parentIds: [thought.id], operationId: 'refute-plans', operation: OPERATION_TYPES.Refute,
          depth: thought.depth + 1,
          state: { ...thought.state, refutations, objections: refutations.flatMap(result => result && Array.isArray(result.defects) ? result.defects : []) },
          score: thought.score, status: matchingBlocker ? 'refuted' : 'active',
        })
      }
    })),
}))

let survivorOperationId = 'refute-plans'
for (let round = 1; round <= BUDGET.improveRounds; round += 1) {
  const improveId = `improve-round-${round}`
  const scoreId = `score-improved-${round}`
  const keepId = `keep-improved-${round}`

  addOperation(graph.operations, createOperation({
    id: improveId,
    type: OPERATION_TYPES.Improve,
    predecessorIds: [survivorOperationId],
    execute: async ({ inputThoughts }) => parallel(inputThoughts
      .filter(thought => thought.status === 'active' || thought.status === 'kept')
      .map(thought => {
        const thoughtId = nextThoughtId()
        return async () => {
          const improvedPlan = await agent(
            `Worktree: ${scout.worktreePath} (read-only — do not edit source)
Scope: ${SCOPE}
Improvement round: ${round} of ${BUDGET.improveRounds}
Current plan: ${JSON.stringify(thought.state.plan)}
Current score: ${JSON.stringify(thought.score)}
Adversarial objections: ${JSON.stringify(thought.state.objections || [])}
Research: ${JSON.stringify(research)}
Constraints: ${JSON.stringify(constraints)}

Improve the complete plan without editing source. Preserve supported evidence, address every
reproducible objection, keep file ownership disjoint, and return observable acceptance commands.`,
            { label: `Improve:${round}:${thought.id}`, phase: 'Improve', schema: PLAN, effort: 'high', authority: 'read-only' }
          )
          return createThought({
            id: thoughtId, parentIds: [thought.id], operationId: improveId, operation: OPERATION_TYPES.Improve,
            depth: thought.depth + 1, state: { ...thought.state, plan: improvedPlan }, score: null,
            status: validPlan(improvedPlan) ? 'active' : 'pruned',
          })
        }
      })),
  }))

  addOperation(graph.operations, createOperation({
    id: scoreId,
    type: OPERATION_TYPES.Score,
    predecessorIds: [improveId],
    execute: async ({ inputThoughts }) => parallel(inputThoughts.map(thought => {
      const thoughtId = nextThoughtId()
      return async () => {
        const score = thought.status === 'active' && validPlan(thought.state.plan)
          ? await scorePlan(thought.state.plan, `Score:${thought.id}`)
          : null
        const scored = validScore(score) ? score : null
        return createThought({
          id: thoughtId, parentIds: [thought.id], operationId: scoreId, operation: OPERATION_TYPES.Score,
          depth: thought.depth + 1, state: thought.state, score: scored,
          status: scored ? 'active' : 'pruned',
        })
      }
    })),
  }))

  addOperation(graph.operations, createOperation({
    id: keepId,
    type: OPERATION_TYPES.KeepBestN,
    predecessorIds: [scoreId],
    execute: async ({ inputThoughts }) => {
      const eligible = inputThoughts.filter(thought => thought.status === 'active' && validPlan(thought.state.plan) && validScore(thought.score))
      const keptIds = new Set(rankThoughts(eligible).slice(0, BUDGET.beamWidth).map(thought => thought.id))
      const outputs = inputThoughts.map(thought => {
        const kept = keptIds.has(thought.id)
        const output = createThought({
          id: nextThoughtId(), parentIds: [thought.id], operationId: keepId, operation: OPERATION_TYPES.KeepBestN,
          depth: thought.depth + 1, state: thought.state, score: thought.score,
          status: kept ? 'kept' : 'pruned',
        })
        if (!kept) graph.pruned.push(output)
        return output
      })
      return outputs
    },
  }))
  survivorOperationId = keepId
}

addOperation(graph.operations, createOperation({
  id: 'aggregate-plans',
  type: OPERATION_TYPES.Aggregate,
  predecessorIds: [survivorOperationId],
  execute: async ({ inputThoughts }) => {
    const survivors = rankThoughts(inputThoughts.filter(thought =>
      thought.status === 'kept' && validPlan(thought.state.plan) && validScore(thought.score)))
    if (survivors.length < 2) return []
    const thoughtId = nextThoughtId()
    const aggregatePlan = await agent(
      `Worktree: ${scout.worktreePath} (read-only — do not edit source)
Scope: ${SCOPE}
Surviving plans: ${JSON.stringify(survivors.map(thought => ({ id: thought.id, plan: thought.state.plan, score: thought.score })))}

Aggregate the strongest compatible lanes into one complete plan. Preserve full scope coverage,
give every file exactly one owner, and keep every acceptance command observable. Do not edit source.`,
      { label: 'Aggregate:survivors', phase: 'Aggregate', schema: PLAN, effort: 'high', authority: 'read-only' }
    )
    const collisions = planFileCollisions(aggregatePlan)
    const aggregate = createThought({
      id: thoughtId, parentIds: survivors.map(thought => thought.id), operationId: 'aggregate-plans', operation: OPERATION_TYPES.Aggregate,
      depth: Math.max(...survivors.map(thought => thought.depth)) + 1,
      state: {
        plan: aggregatePlan,
        contributingThoughtIds: survivors.map(thought => thought.id),
        objections: survivors.flatMap(thought => thought.state.objections || []),
        aggregationCollisions: collisions,
      },
      score: null, status: validPlan(aggregatePlan) && collisions.length === 0 ? 'active' : 'pruned',
    })
    if (aggregate.status === 'pruned') graph.pruned.push(aggregate)
    return [aggregate]
  },
}))

addOperation(graph.operations, createOperation({
  id: 'score-aggregate',
  type: OPERATION_TYPES.Score,
  predecessorIds: ['aggregate-plans'],
  execute: async ({ inputThoughts }) => parallel(inputThoughts
    .filter(thought => thought.status === 'active')
    .map(thought => {
      const thoughtId = nextThoughtId()
      return async () => {
        const score = await scorePlan(thought.state.plan, `Score:${thought.id}`)
        const scored = validScore(score) ? score : null
        return createThought({
          id: thoughtId, parentIds: [thought.id], operationId: 'score-aggregate', operation: OPERATION_TYPES.Score,
          depth: thought.depth + 1, state: thought.state, score: scored,
          status: scored ? 'active' : 'pruned',
        })
      }
    })),
}))

addOperation(graph.operations, createOperation({
  id: 'select-plan',
  type: OPERATION_TYPES.Select,
  predecessorIds: [survivorOperationId, 'score-aggregate'],
  execute: async ({ inputThoughts }) => {
    const aggregates = inputThoughts.filter(thought => thought.operationId === 'score-aggregate' &&
      thought.status === 'active' && validPlan(thought.state.plan) && validScore(thought.score) && planFileCollisions(thought.state.plan).length === 0)
    const survivors = inputThoughts.filter(thought => thought.operationId === survivorOperationId &&
      thought.status === 'kept' && validPlan(thought.state.plan) && validScore(thought.score) && planFileCollisions(thought.state.plan).length === 0)
    const winner = rankThoughts([...aggregates, ...survivors])[0]
    if (!winner) return []
    const selected = createThought({
      id: nextThoughtId(), parentIds: [winner.id], operationId: 'select-plan', operation: OPERATION_TYPES.Select,
      depth: winner.depth + 1, state: winner.state, score: winner.score, status: 'selected',
    })
    graph.winnerId = selected.id
    return [selected]
  },
}))

await executeOperationGraph(graph.operations, graph)

const selectedThought = graph.thoughts.find(thought => thought.id === graph.winnerId && thought.status === 'selected')
if (!selectedThought || !validPlan(selectedThought.state.plan) || !validScore(selectedThought.score)) {
  return { halted: true, reason: 'no safe graph winner', graph }
}
const plan = selectedThought.state.plan
const selectedPlan = plan
const objections = selectedThought.state.objections || []

// Collision detection is a PURE FUNCTION. Never spend an agent arbitrating
// file ownership — a deterministic check cannot hallucinate consensus.
// Normalize before comparing. Agents return a mix of absolute and repo-relative paths,
// and a raw === between "/Users/…/my-app/.artifacts/" and ".artifacts/audit.md" silently
// never matches — the check reports clean while the collision is real.
const dirty = scout.dirtyFiles.map(rel).filter(Boolean)
const contestedRel = [...contested.entries()]
  .map(([f, c]) => ({ file: rel(f), claims: c }))
  .filter(entry => entry.file)

const owner = new Map()
const collisions = []
const crossWorktree = []
for (const lane of plan.lanes) {
  for (const raw of lane.files) {
    const f = rel(raw)
    if (!f) {
      collisions.push(`${String(raw)}: empty, absolute-outside-repo, or repo-escaping path claimed by ${lane.name}`)
      continue
    }
    const hitDirty = dirty.find(d => overlaps(f, d))
    const hitOwner = [...owner.keys()].find(o => overlaps(f, o))
    if (hitDirty) collisions.push(`${f}: protected WIP (${hitDirty}) claimed by ${lane.name}`)
    else if (hitOwner) collisions.push(`${f}: owned by both ${owner.get(hitOwner)} and ${lane.name}`)
    else owner.set(f, lane.name)

    // Cross-worktree is a separate axis — a file can be uniquely owned within this run
    // and still be in flight on another branch. Check it regardless of the above.
    for (const c of contestedRel) {
      if (overlaps(f, c.file)) crossWorktree.push({ file: f, lane: lane.name, claims: c.claims })
    }
  }
}

// A live sibling worktree is a halt: another process is editing that file RIGHT NOW, and
// whichever of us commits second loses. An idle unlanded branch is a merge cost, not a
// correctness risk — that rides forward as a caveat rather than stopping the run.
const liveConflicts = crossWorktree.filter(x => x.claims.some(c => c.live))
if (liveConflicts.length) {
  for (const x of liveConflicts) collisions.push(`${x.file}: lane ${x.lane} vs LIVE worktree ${x.claims.filter(c => c.live).map(c => c.branch).join(', ')}`)
}
if (collisions.length) {
  log(`HALT: lane map has ${collisions.length} collision(s) — ${collisions.join(' | ')}`)
  return { halted: true, reason: 'lane collision', collisions, plan, crossWorktree }
}
if (crossWorktree.length) {
  log(`WARN: ${crossWorktree.length} lane file(s) also in flight on idle sibling branches — merge cost, carried to handoff: ${crossWorktree.map(x => `${x.file} (${x.claims.map(c => c.branch).join('/')})`).join(', ')}`)
}
log(`${plan.lanes.length} disjoint lanes over ${owner.size} files: ${plan.lanes.map(l => `${l.name}[${l.tier}]`).join(', ')}`)
// Lanes are not truncated to fit the budget — dropping a lane drops scope the user asked
// for, silently, which is a worse failure than costing more than planned. Verification
// depth IS capped, because everything it skips is reported rather than lost. So an
// over-budget plan says so out loud and keeps going.
if (plan.lanes.length > BUDGET.maxLanes) {
  log(`OVER BUDGET: the ${BUDGET_NAME} range allows ${BUDGET.maxLanes} lanes and the plan needs ${plan.lanes.length}. Lanes are not dropped — scope survives, cost rises. Projected ceiling is now about ${22 + plan.lanes.length * (3 + BUDGET.refutePerLane * 2) + BUDGET.fixCap} agents.`)
}

// ------------------------------------------------- 2-3. build -> review -> refute
// Pipelined, NOT barriered. Lane A's findings are being refuted while lane B is
// still writing code. Wall-clock is the slowest single chain, not the sum of
// slowest-per-stage.
const EFFORT = { mechanical: 'low', integration: 'medium', judgment: 'high' }

// The refute stage is the only place in this DAG whose agent count is decided by what
// the reviewers happened to say rather than by the shape of the graph, so it is the only
// place that can silently multiply the run's cost. Two review lenses at maxItems 10 is up
// to 20 findings for ONE lane; at three verifiers each that was 60 agents for that lane
// alone, against a run that advertises about fifty in total. These two ceilings make the
// worst case finite and knowable. Both are logged when they bite — never a silent cap.
const REFUTE_CAP_PER_LANE = BUDGET.refutePerLane
const FIX_CAP = BUDGET.fixCap

const laneResults = await pipeline(
  plan.lanes,

  // build
  lane => agent(
    `Worktree: ${scout.worktreePath} (already created — work here, never in ${REPO})
Lane: ${lane.name}
Task: ${lane.task}
Acceptance: ${lane.acceptance || 'stated in task'}
YOU OWN EXACTLY THESE FILES: ${lane.files.join(', ')}

Open no file outside your ownership list. If the task cannot be done without touching
another lane's file, return state "blocked" with that file named — do not reach across.
If you are missing information the lane map should have given you, return "needs-context"
rather than guessing. Match surrounding code idiom; no opportunistic refactors.`,
    { label: `build:${lane.name}`, phase: 'Build', schema: BUILD, effort: EFFORT[lane.tier], authority: 'write-selected-plan' }
  ),

  // dual-lens review — one asks "does it work", one asks "how does it fail in prod"
  async (built, lane) => {
    if (!built || built.state === 'blocked' || built.state === 'needs-context') {
      return { lane, built, findings: [] }
    }
    const lenses = [
      'CORRECTNESS: does this do what the lane task specified? Trace the actual code path. Off-by-one, null path, wrong branch, broken contract with callers.',
      'PRODUCTION: how does this fail once deployed? Auth/session, secrets in logs, unhandled reject, N+1, hydration mismatch, mobile viewport, race on concurrent request, public route that should not be public.',
    ]
    const reviews = await parallel(lenses.map(lens => () => agent(
      `Worktree: ${scout.worktreePath}
Review ONLY these files: ${(built.changed || lane.files).join(', ')}
Builder notes: ${built.notes}

Lens — ${lens}

Report only defects you can point at a specific line for. No style preferences,
no "consider extracting". If the code is clean, return an empty findings array.`,
      { label: `review:${lane.name}`, phase: 'Review', schema: FINDINGS, effort: 'medium' }
    )))
    const findings = reviews.filter(Boolean).flatMap(r => r.findings)
    return { lane, built, findings }
  },

  // adversarial refute — default to refuted, unanimity kills
  // Three deterministic filters run BEFORE any verifier is spawned, because a finding
  // that cannot change what this run does is not worth a single agent, let alone three:
  //   dedupe    — the two lenses reliably report the same defect from different angles
  //   minors    — nothing downstream acts on one; only blockers reach the fix stage, and
  //               majors and minors both ride to the handoff as caveats either way
  //   the cap   — a hard per-lane ceiling, blockers ahead of majors in the queue
  // Everything filtered out is carried as `unverified` and reported, not discarded.
  async (reviewed) => {
    if (!reviewed.findings.length) return { ...reviewed, confirmed: [], unverified: [] }

    const key = f => `${rel(f.file)}:${f.line || ''}:${String(f.claim).slice(0, 60).toLowerCase()}`
    const seen = new Set()
    const deduped = reviewed.findings.filter(f => seen.has(key(f)) ? false : seen.add(key(f)))

    const minors = deduped.filter(f => f.severity === 'minor')
    const ranked = deduped
      .filter(f => f.severity !== 'minor')
      .sort((a, b) => (a.severity === 'blocker' ? 0 : 1) - (b.severity === 'blocker' ? 0 : 1))
    const refuting = ranked.slice(0, REFUTE_CAP_PER_LANE)
    const overflow = ranked.slice(REFUTE_CAP_PER_LANE)

    const dupes = reviewed.findings.length - deduped.length
    if (dupes || minors.length || overflow.length) {
      log(`${reviewed.lane.name}: ${reviewed.findings.length} findings -> ${refuting.length} sent to verifiers`
        + `${dupes ? ` · ${dupes} duplicate` : ''}`
        + `${minors.length ? ` · ${minors.length} minor carried unverified` : ''}`
        + `${overflow.length ? ` · ${overflow.length} past the ${REFUTE_CAP_PER_LANE}-per-lane cap, carried unverified` : ''}`)
    }

    const judged = await parallel(refuting.map(f => () =>
      parallel([0, 1].map(i => () => agent(
        `Worktree: ${scout.worktreePath}
Claim: "${f.claim}" in ${f.file}${f.line ? `:${f.line}` : ''}
Alleged failure: ${f.failureScenario}

You are verifier #${i + 1} of 2. Your job is to REFUTE this. Open the file and the code
around it. Construct the concrete input or state that triggers the failure. If you
cannot construct one, or the guard already exists upstream, it is refuted.
Default to refuted:true when uncertain. A plausible-sounding finding that cannot be
reproduced is worse than no finding.`,
        { label: `refute:${f.file}`, phase: 'Refute', schema: VERDICT, effort: 'medium' }
      ))).then(vs => {
        const votes = vs.filter(Boolean)
        // Unanimity of two, not majority of three: both verifiers must fail to refute.
        // Strictly harder to survive than the old 2-of-3 and a third cheaper, which is
        // the direction this stage already leans — an unreproducible finding buys a
        // wasted fix agent and a rewrite of a line that was fine.
        const survives = votes.length === 2 && votes.every(v => !v.refuted)
        return survives ? { ...f, evidence: votes[0].why } : null
      })
    ))
    return { ...reviewed, confirmed: judged.filter(Boolean), unverified: [...minors, ...overflow] }
  }
)

const lanes = laneResults.filter(Boolean)
const stalled = lanes.filter(l => l.built && l.built.state !== 'done' && l.built.state !== 'done-with-concerns')
const confirmed = lanes.flatMap(l => l.confirmed || [])
const unverified = lanes.flatMap(l => l.unverified || [])
const blockers = confirmed.filter(f => f.severity === 'blocker')
log(`${lanes.length} lanes · ${stalled.length} stalled · ${confirmed.length} confirmed findings (${blockers.length} blockers) · ${unverified.length} carried unverified`)

// ---------------------------------------------------------------- 4. fix
// Only blockers. Majors and minors ride out as documented caveats — a review
// that fixes everything it finds never converges.
if (blockers.length) {
  phase('Fix')
  // One agent per blocker, but bounded. Blockers past the cap ride to the handoff as
  // named, unfixed caveats — the same treatment majors already get. A fix stage that
  // scales with however many blockers a review found is the second way this run can
  // outrun its advertised cost.
  const fixing = blockers.slice(0, FIX_CAP)
  if (blockers.length > FIX_CAP) {
    log(`${blockers.length} confirmed blockers, fixing the first ${FIX_CAP}; the remaining ${blockers.length - FIX_CAP} go to the handoff unfixed: ${blockers.slice(FIX_CAP).map(f => `${f.file} — ${f.claim}`).join(' | ')}`)
  }
  await parallel(fixing.map(f => () => agent(
    `Worktree: ${scout.worktreePath}
Confirmed blocker in ${f.file}${f.line ? `:${f.line}` : ''}: ${f.claim}
Reproduction: ${f.failureScenario}
Verifier evidence: ${f.evidence}

Fix exactly this. Minimum viable diff. Do not refactor around it, do not fix
adjacent things you notice. Return the changed file paths.`,
    { label: `fix:${f.file}`, phase: 'Fix', schema: BUILD, effort: 'medium' }
  )))
}

// ---------------------------------------------------------------- 5. gate
// A genuine barrier: the integration check needs every lane's edits present.
phase('Gate')
const gate = await agent(
  `Worktree: ${scout.worktreePath}

You are the RELEASE VERIFIER. Run the real checks and report actual output.
Detect the stack, then run what exists — typically: npx tsc --noEmit, npm run lint,
npm run build, npm run test (vitest run — never node:test in a vitest repo).
${DEPLOYS ? `This repo deploys. Also confirm vercel.json carries the preview-killing ignoreCommand, and that no file under a bare api/ directory is an unintended public route.` : ''}

Report exit codes and the real failure text. Do not claim a check passed that you
did not run, and do not describe a failure as "minor" — quote it.`,
  { schema: GATE, phase: 'Gate', effort: 'medium' }
)

// -------------------------------------------------------------- 6. release
// SKEPTIC #4 — adversarial against the SHIPPED state, not the source. The Gate
// proves the code builds; nothing yet proves it survives contact with production.
// Runs even when the Gate failed: a red build does not make a migration reversible,
// and the config/surface/irreversibility analysis is diff-based either way.
let release = []
let shipVerdict = DEPLOYS ? 'unknown' : 'n/a — not a deploying repo'

if (DEPLOYS) {
  phase('Release')
  const RELEASE_BASE = `Worktree: ${scout.worktreePath}
Repo: ${REPO}${LIVE ? `\nLive surface: ${LIVE}` : '\nLive surface: not supplied — discover it from vercel.json, package.json, README, or the Vercel project link, and say so if you cannot.'}
Scope shipped: ${SCOPE}
Local gate: ${gate ? (gate.passed ? 'PASSED' : 'FAILED — ' + gate.output.slice(0, 400)) : 'did not run'}
Changed files: ${lanes.flatMap(l => (l.built && l.built.changed) || []).join(', ')}

READ-ONLY AGAINST PRODUCTION. You may run \`vercel env ls\`, \`vercel project ls\`,
\`curl\`, \`dig\`, and \`gh\` reads. You may NOT deploy, promote, alias, add or modify an
env var, run a migration, or write to any live service. If answering needs a mutation,
report it as unverifiable instead of performing it.

Every risk carries EVIDENCE — a command with its output, a file:line, or a URL with its
status code. "Probably fine" and "should work" are not evidence and do not belong in the
output. Rate reversibility honestly: revert / flag-off / manual-undo / irreversible.`

  release = (await parallel([
    {
      key: 'config-drift',
      prompt: `Lens: CONFIG DRIFT — what passes locally and dies in production.
Diff the runtime environment, not the code. Every env var the changed files newly read:
does it exist in the production environment (\`vercel env ls production\`)? Compare against
.env.local — a var present locally and absent in prod is a blocker, not a minor. Check
vercel.json for the preview-killing ignoreCommand, the Root Directory the project actually
builds from, Node version pinning, and any build/install command override. Check whether
the changed files assume a filesystem, a long-running process, or a native module that a
serverless function does not have.`,
    },
    {
      key: 'public-surface',
      prompt: `Lens: PUBLIC SURFACE — what is now reachable by strangers.
Enumerate every route this diff adds or changes. For a bare api/ directory, treat EVERY
.js/.ts file as a live unauthenticated URL — including tests, fixtures, scratch handlers,
and .bak files — and verify against production rather than the file tree:
curl -s -o /dev/null -w '%{http_code}' https://<domain>/api/<basename> for each. Anything
that is not a real endpoint must 404; a 200 is a blocker. Then check auth guards, CORS,
rate limiting, and whether any changed response body now leaks internal state, stack traces,
env values, or user data. Re-scan the diff for secret literals.`,
    },
    {
      key: 'irreversibility',
      prompt: `Lens: IRREVERSIBILITY — assume this must be undone in ten minutes at 2am.
What in this diff cannot be undone by \`git revert\` + redeploy? Schema migrations and data
backfills, external side effects already fired (emails, webhooks registered, payment or
payout calls, third-party records created), CDN or ISR cache poisoning, anything writing to
a shared queue or bucket. For each: name the concrete undo procedure, or say plainly that
there is none. Then answer the flag question — does this touch auth, payment, a data
migration, or a primary user path such that it should ship behind a flag defaulted off and
ramped, rather than as a hard deploy? An irreversible change with no written undo is a
blocker regardless of how clean the code is.`,
    },
    {
      key: 'live-baseline',
      prompt: `Lens: LIVE BASELINE — capture the before, so after is checkable.
Read production AS IT IS RIGHT NOW for every surface this change touches: status code, key
response headers, cache headers, and whether the route currently exists at all. Confirm DNS
resolves and SSL is valid on the live domain. Check the current production deployment's
state and age (\`vercel list\`, or gh for the last merged commit). Record enough concrete
before-state that someone can diff it post-deploy and know whether this change did what it
claimed. Where a claim in the scope is user-visible or public-facing, quote the exact
current published text so a drifted claim is detectable. Readback is the deliverable here
even when you find zero risks.`,
    },
  ].map(l => () => agent(
    `${RELEASE_BASE}\n\n${l.prompt}`,
    { label: `release:${l.key}`, phase: 'Release', schema: RELEASE, effort: 'high' }
  )))).filter(Boolean)

  // Verdict is computed, not argued. Advisory only — it changes what gets reported,
  // never what the run does, and this run does not deploy in any case.
  const risks = release.flatMap(r => r.risks)
  const relBlockers = risks.filter(r => r.severity === 'blocker')
  const unrecoverable = risks.filter(r => r.reversible === 'irreversible' && r.severity !== 'minor')
  shipVerdict = (relBlockers.length || unrecoverable.length)
    ? 'hold'
    : risks.some(r => r.severity === 'major') ? 'ship-with-caveats' : 'ship'
  log(`release: ${risks.length} risks · ${relBlockers.length} blockers · ${unrecoverable.length} irreversible · verdict ${shipVerdict.toUpperCase()} (advisory)`)

  // The one case that stops for a human rather than reporting: live exposure that is
  // already real, right now, independent of whether this change ships.
  const liveExposure = risks.filter(r =>
    r.severity === 'blocker' && /secret|credential|token|unauthenticated|publicly reachable|200/i.test(r.evidence))
  if (liveExposure.length) {
    log(`ATTENTION — production exposure observed independent of this change: ${liveExposure.map(r => r.risk).join(' | ')}`)
  }
}

// ---------------------------------------------------------------- 7. handoff
phase('Handoff')
const handoff = await agent(
  `Write the delivery record for this run. Facts only — every field below is required,
and a missing field means status "held", not "done".

Target: ${REPO} · worktree ${scout.worktreePath} · base ${scout.baseSha}
Scope: ${SCOPE}
Lanes: ${JSON.stringify(plan.lanes.map(l => ({ name: l.name, tier: l.tier, files: l.files })))}
Stalled lanes: ${JSON.stringify(stalled.map(l => ({ lane: l.lane.name, state: l.built && l.built.state, notes: l.built && l.built.notes })))}
Confirmed findings: ${JSON.stringify(confirmed)}
Findings that were NEVER VERIFIED — minors, and anything past the per-lane refutation cap.
No verifier was spent on these, so each is a reviewer's unchallenged assertion rather than
a confirmed defect. Say exactly that under Caveats; do not present them as findings and do
not quietly drop them either: ${JSON.stringify(unverified)}
Blockers confirmed but left unfixed (past the fix cap): ${JSON.stringify(blockers.slice(FIX_CAP))}
Gate: ${JSON.stringify(gate)}
Release verification (${shipVerdict}): ${JSON.stringify(release)}
Plan refutations and objections from graph search: ${JSON.stringify(objections)}
Cross-worktree overlap — these lane files are ALSO in flight on other unlanded branches,
so this work will need a rebase or a merge resolution against them. Name each one and the
branch it collides with under Caveats; this is the caveat most likely to be discovered by
someone else, days later, as a conflict with no explanation: ${JSON.stringify(crossWorktree)}
Constraints dropped by the skeptic (research asserted these; audit rejected them): ${JSON.stringify(rejected)}
Sources never read: ${JSON.stringify(stillUnread)}
Advisory hazards from scout (NOT fixed by this run): ${JSON.stringify(scout.hazards)}

Produce markdown with exactly these headings: Target, Changed, Commands,
Verification, Release Risk, Status, Caveats, Next.

Under Release Risk: the advisory verdict, every blocker and irreversible risk with its
evidence, the written undo procedure for anything not revert-able, and the live baseline
readback. If this is not a deploying repo, write "n/a" and move on. The verdict is advice
attached to the work — it does not change what was done, and nothing here was blocked by it.

Status must be one of: changed locally | verified locally | reviewed | committed |
pushed | deployed | verified live | held | blocked. "changed locally" is not
"verified locally". THIS RUN DOES NOT DEPLOY — never write "deployed", "verified live",
or "released" on the strength of the release verifier, which only read production. Those
states require an actual deploy that has not happened here.
List every unfixed major/minor finding under Caveats. Omitting a caveat to make the
handoff look clean is the failure mode this section exists to prevent.`,
  { phase: 'Handoff', effort: 'low' }
)

return {
  agentBudget: BUDGET_NAME,
  graph,
  selectedPlan,
  worktree: scout.worktreePath,
  baseSha: scout.baseSha,
  lanes: plan.lanes.map(l => l.name),
  stalled: stalled.map(l => l.lane.name),
  constraints,
  crossWorktree,
  siblingBranches: liveClaims.map(s => ({ branch: s.branch, live: s.liveProcess, files: s.files.length })),
  droppedConstraints: rejected,
  planObjections: objections,
  unread: stillUnread,
  confirmedFindings: confirmed,
  unverifiedFindings: unverified,
  unfixedBlockers: blockers.slice(FIX_CAP),
  gatePassed: gate && gate.passed,
  shipVerdict,
  release,
  hazards: scout.hazards,
  handoff,
}
