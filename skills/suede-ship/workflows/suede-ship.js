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
  required: ['lanes'],
  properties: {
    lanes: {
      type: 'array',
      maxItems: 8,
      items: {
        type: 'object',
        required: ['name', 'task', 'files', 'tier'],
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
  ? (await parallel(critic.gaps.map(g => () => agent(
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
let plan = await agent(
  `Worktree: ${scout.worktreePath}
Scope: ${SCOPE}
Candidate files: ${scout.candidateFiles.join(', ')}
PROTECTED (dirty WIP — no lane may own these): ${scout.dirtyFiles.join(', ') || 'none'}
CONTESTED — already in flight on other unlanded branches of this repo. Touching one of
these is a merge conflict that surfaces later, at integration. Route around them where the
scope allows; where it genuinely does not, say so explicitly in that lane's acceptance
criterion so it is a decision on the record rather than a surprise:
${contested.size ? [...contested.entries()].map(([f, c]) => `  ${f} <- ${c.map(x => x.branch + (x.live ? ' [LIVE]' : '')).join(', ')}`).join('\n') : '  none'}
Advisory hazards: ${JSON.stringify(scout.hazards)}

RESEARCH — sourced facts from five independent lenses plus gap fills:
${JSON.stringify(research)}

CONSTRAINTS the plan must not break (each says what breaking it means):
${JSON.stringify(constraints)}

Sources still unread — if any is central to a lane you write, that lane is underspecified:
${JSON.stringify(stillUnread)}

You are the PLANNER. Produce a lane map, not a narrative.

Plan against the research, not against the file list. A lane that violates a listed
constraint is wrong even if it satisfies the scope — if the scope genuinely requires
breaking one, say so in that lane's acceptance criterion so it surfaces at review
instead of at deploy. Where history shows this was already tried and reverted, do not
repeat the reverted approach without naming why it will work this time.

Hard rules:
- Every file belongs to exactly ONE lane. Overlap is a planning bug, not a runtime problem.
- If two lanes genuinely need the same file, MERGE them into one lane. Do not split a file's ownership.
- No lane may list a protected dirty file.
- Each lane gets an observable acceptance criterion (a command, a route, a rendered state) — never "looks right".
- Tier each lane honestly: mechanical (complete spec, no judgment), integration (multi-file, pattern-match the codebase), judgment (design/security/data-shape calls).
- Prefer 2-5 lanes. Eight is the ceiling and it is rarely right.

Read the candidate files before deciding ownership.`,
  { schema: PLAN, phase: 'Plan', effort: 'high' }
)

// SKEPTIC #2 — red-team the lane map BEFORE any builder opens a file. This is the
// cheapest adversary in the DAG: two agents here can void thirty downstream. Two
// distinct hostile lenses, because "this approach is wrong" and "this decomposition
// is wrong" are different failures and one reviewer reliably finds only one of them.
const redTeams = (await parallel([
  `You are attacking the APPROACH. Assume this plan ships and causes an incident — write the
incident. Does it break a constraint that survived the audit? Does history show this exact
approach was tried and reverted? Does it touch auth, payment, schema, or a public route
without saying so? Is there a materially simpler decomposition that makes half these lanes
unnecessary? "fatal" means: if a builder starts on this, the work is wasted.`,
  `You are attacking the DECOMPOSITION. Is a lane's acceptance criterion actually observable,
or does it bottom out in "looks right"? Is a lane tiered too low for the judgment it needs?
Do two lanes have a hidden ordering dependency that the disjoint-file check cannot see —
one writes a type, contract, or migration the other reads? Is any lane so large it will
return "blocked" halfway? A hidden ordering dependency is "fatal", not "noted".`,
].map(lens => () => agent(
  `Worktree: ${scout.worktreePath} (read-only)
Scope: ${SCOPE}
Proposed lane map: ${JSON.stringify(plan.lanes)}
Audited constraints the plan is bound by: ${JSON.stringify(constraints)}
Files in flight on other unlanded branches of this repo: ${contested.size ? [...contested.entries()].map(([f, c]) => `${f} <- ${c.map(x => x.branch + (x.live ? ' [LIVE]' : '')).join(', ')}`).join(' | ') : 'none'}
Research facts: ${JSON.stringify(research.flatMap(r => r.facts))}

${lens}

Open the files before objecting — an objection you cannot ground in the actual code is
noise, and noise here costs a full replan. If the plan is sound, return an empty array;
you are not required to find something.`,
  { label: 'redteam:plan', phase: 'Plan', schema: REDTEAM, effort: 'high' }
)))).filter(Boolean)

let objections = redTeams.flatMap(r => r.objections)
const fatal = objections.filter(o => o.severity === 'fatal')
const serious = objections.filter(o => o.severity === 'serious')

// Exactly one revision round. Past that we proceed and carry the objections into the
// handoff as caveats — a plan/critique loop with no bound never converges.
if (fatal.length || serious.length >= 2) {
  log(`red team: ${fatal.length} fatal, ${serious.length} serious — one revision round`)
  const revised = await agent(
    `Your lane map was red-teamed and did not survive. Revise it.

Original lane map: ${JSON.stringify(plan.lanes)}
Objections: ${JSON.stringify([...fatal, ...serious])}
Audited constraints: ${JSON.stringify(constraints)}
PROTECTED dirty WIP (no lane may own): ${scout.dirtyFiles.join(', ') || 'none'}

Address every fatal objection. You may merge lanes, re-tier them, re-sequence into fewer
lanes, or narrow the scope of one — but do not answer an objection by deleting the work it
applies to. If an objection is simply wrong, keep your approach and say why in that lane's
acceptance criterion so it surfaces at review. Same hard rules as before: one owner per
file, no protected file, observable acceptance.`,
    { schema: PLAN, phase: 'Plan', effort: 'high' }
  )
  if (revised) plan = revised
  objections = objections.map(o => ({ ...o, status: 'sent to revision' }))
} else if (objections.length) {
  log(`red team: ${objections.length} noted objection(s), proceeding — carried to handoff`)
}

// Collision detection is a PURE FUNCTION. Never spend an agent arbitrating
// file ownership — a deterministic check cannot hallucinate consensus.
// Normalize before comparing. Agents return a mix of absolute and repo-relative paths,
// and a raw === between "/Users/…/my-app/.artifacts/" and ".artifacts/audit.md" silently
// never matches — the check reports clean while the collision is real.
const rel = p => String(p)
  .split(scout.worktreePath).join('')
  .split(REPO).join('')
  .replace(/^\.\//, '')
  .replace(/^\/+/, '')
  .replace(/\/+$/, '')
// Directory claims cover their contents: ".artifacts/" claims ".artifacts/audit.md".
const overlaps = (a, b) => a === b || a.startsWith(b + '/') || b.startsWith(a + '/')

const dirty = scout.dirtyFiles.map(rel)
const contestedRel = [...contested.entries()].map(([f, c]) => ({ file: rel(f), claims: c }))

const owner = new Map()
const collisions = []
const crossWorktree = []
for (const lane of plan.lanes) {
  for (const raw of lane.files) {
    const f = rel(raw)
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

// ------------------------------------------------- 2-3. build -> review -> refute
// Pipelined, NOT barriered. Lane A's findings are being refuted while lane B is
// still writing code. Wall-clock is the slowest single chain, not the sum of
// slowest-per-stage.
const EFFORT = { mechanical: 'low', integration: 'medium', judgment: 'high' }

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
    { label: `build:${lane.name}`, phase: 'Build', schema: BUILD, effort: EFFORT[lane.tier] }
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

  // adversarial refute — default to refuted, majority kills
  async (reviewed) => {
    if (!reviewed.findings.length) return { ...reviewed, confirmed: [] }
    const judged = await parallel(reviewed.findings.map(f => () =>
      parallel([0, 1, 2].map(i => () => agent(
        `Worktree: ${scout.worktreePath}
Claim: "${f.claim}" in ${f.file}${f.line ? `:${f.line}` : ''}
Alleged failure: ${f.failureScenario}

You are verifier #${i + 1}. Your job is to REFUTE this. Open the file and the code
around it. Construct the concrete input or state that triggers the failure. If you
cannot construct one, or the guard already exists upstream, it is refuted.
Default to refuted:true when uncertain. A plausible-sounding finding that cannot be
reproduced is worse than no finding.`,
        { label: `refute:${f.file}`, phase: 'Refute', schema: VERDICT, effort: 'medium' }
      ))).then(vs => {
        const votes = vs.filter(Boolean)
        const survives = votes.filter(v => !v.refuted).length >= 2
        return survives ? { ...f, evidence: votes.find(v => !v.refuted).why } : null
      })
    ))
    return { ...reviewed, confirmed: judged.filter(Boolean) }
  }
)

const lanes = laneResults.filter(Boolean)
const stalled = lanes.filter(l => l.built && l.built.state !== 'done' && l.built.state !== 'done-with-concerns')
const confirmed = lanes.flatMap(l => l.confirmed || [])
const blockers = confirmed.filter(f => f.severity === 'blocker')
log(`${lanes.length} lanes · ${stalled.length} stalled · ${confirmed.length} confirmed findings (${blockers.length} blockers)`)

// ---------------------------------------------------------------- 4. fix
// Only blockers. Majors and minors ride out as documented caveats — a review
// that fixes everything it finds never converges.
if (blockers.length) {
  phase('Fix')
  await parallel(blockers.map(f => () => agent(
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
Gate: ${JSON.stringify(gate)}
Release verification (${shipVerdict}): ${JSON.stringify(release)}
Plan objections raised by red team: ${JSON.stringify(objections)}
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
  gatePassed: gate && gate.passed,
  shipVerdict,
  release,
  hazards: scout.hazards,
  handoff,
}
