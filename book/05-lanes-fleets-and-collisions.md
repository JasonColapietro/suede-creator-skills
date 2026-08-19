# Chapter 5. Lanes, Fleets, and Collisions

Three agents, one repo, one afternoon. Agent A refactors the auth middleware.
Agent B is told to "clean up the route handlers," which happens to include the
file A is holding. Agent C runs a formatter across the tree. You come back to a
branch that compiles, passes nothing, and contains two half-applied versions of
the same idea. Nobody lied to you. Every agent did the work it was given.

That is the failure mode of parallel agent work, and it is not exotic. It is the
default outcome when the only coordination mechanism is that the tasks sounded
different when you wrote them.

## What actually breaks

Four things, and they are boring, which is why they keep happening.

**Two agents editing the same file.** The second write wins, or the merge
produces a file that satisfies neither intent. The tell in a plan is the phrase
"the lanes probably won't touch the same files." `suede-agent-teams` lists that
sentence in its Red Flags section, with the correct response: probably is not a
lane map.

**A stale mirror.** Your local `main` is four days behind `origin/main`. An
agent cuts a branch from it, builds cleanly against a version of the codebase
that no longer exists, and opens a PR full of conflicts against code it never
read. Nothing in the agent's transcript will reveal this. It fetched nothing, so
it saw nothing wrong.

**Someone's uncommitted WIP, destroyed.** A shared checkout usually has dirty
files in it. An agent that runs a checkout, a stash, a reset, or a formatter
across a dirty tree can remove work that exists nowhere else. This is the one
irreversible item on the list. `suede-agent-teams` puts collision detection
before any lane opens: run `git -C <repo> diff --name-only HEAD` for dirty
files, `git -C <repo> status --short` for untracked ones, then flag a collision
if any path appears in two lane scopes, or in the dirty list plus any lane
scope.

**Merged-looking branches that read as unmerged.** Squash merges rewrite
history. After a squash, `git log origin/main..HEAD` still shows your commits
ahead and `git diff` still shows changed files, because the content landed under
a different hash and `main` moved on. An agent doing cleanup by ancestry will
conclude the branch is unmerged and either keep a dead worktree forever or, worse,
"restore" work that is already live. `git cherry origin/main` answers the real
question: a leading `-` means an equivalent patch is upstream.

## The fix is ownership, not politeness

Coordination between agents does not work by asking them to be careful. It works
by making the collision impossible to express.

File ownership is the primitive. Every lane gets an explicit list of files it may
touch, written before any builder starts, and no builder opens a file outside its
list. When two lanes want the same file, `suede-agent-teams` gives you three
resolutions and no fourth: independent changes get sequenced, with the second
lane rebasing on the first lane's commit; overlapping changes get merged into one
lane with one owner; a dirty file in a lane scope goes to the orchestrator, who
either stashes and restores or makes that lane the only one allowed near it.

Notice what is missing. There is no "both lanes edit carefully" option. Splitting
responsibility for a single file across two concurrent builders is not a
coordination problem to solve, it is a thing you do not do.

Isolated worktrees make ownership physical rather than advisory. A worktree per
lane, cut from `origin/main` rather than from your local mirror, means an agent
cannot reach another lane's files even by accident, and cannot touch your dirty
main checkout at all. `suede-ship` treats a violation of this as a halt
condition: it stops on a lane collision or on a file held by a live sibling
worktree, and its own documentation says the fix is a re-plan, not a retry. An
orchestrator that retries a collision is just rolling the dice again.

The third mechanism matters when the work is a queue rather than a plan. In the
public contribution program that ships with `suede-agent-teams`, tasks come from
repository issues, and the duplicate-work gate is an atomic lease taken before
any worktree exists:

```bash
node skills/suede-agent-teams/scripts/contribution-ledger.mjs claim \
  --ledger <control-dir>/contributions.json \
  --id <task-id> --worker <lane-id> --lease-minutes 45
```

Leases expire and return to the queue, long work heartbeats, abandoned work gets
released. The ledger's lock has no force option. If a writer crashed, recovery
requires the exact recorded token, a locally verifiable dead process, and a
minimum stale age, because the alternative is two workers convinced they both own
issue 123. Hard-linked ledgers fail closed, for the same reason: two names for
one file can split an atomic rename into two divergent queues.

Then there is the part that decides whether any of this produced value. The
handoff will not close without evidence. The Handoff Quality Checklist requires
the exact repo and branch (not "the main app"), every file path changed (not
"various files"), every command run with its actual output or exit code,
observable verification such as a test output or curl response (not "it works"),
a status from the defined vocabulary, the single most important unresolved step,
and every caveat, none omitted to make the handoff look cleaner. A handoff
missing a field is not done. Its status is `held`.

That checklist is what converts a fan-out from a burst of activity into
something you can act on the next morning.

## The economics of a fleet

Lanes are about safety. Fleets are about money.

`suede-codex-fleet` splits a bulk job into independent worker-sized tasks, writes
one self-contained brief per task in `briefs/`, and spawns one `codex exec`
process per brief. Claude decomposes, briefs, reviews, and assembles. The workers
are OpenAI Codex CLI processes, billed to the user's ChatGPT subscription.
Claude's role is admiral only.

The skill is unusually blunt about the one substitution you must not make:
workers are `codex exec` processes, always, and you never swap in `Agent`,
`Task`, `Workflow`, or subagent fan-out on any model, not "just for this one
batch." The reasoning is arithmetic, not preference. Someone asking for a codex
fleet is deliberately routing volume off the Anthropic meter. Satisfying that
request with Claude models spends the exact budget the request existed to
protect. If the Codex CLI is missing, not logged in, or not on `PATH`, the skill
halts and asks, with an estimate of what a Claude fan-out would consume. It never
falls back silently, because a silent fallback is a spending decision made on
your behalf without telling you.

There is a measured number attached. On 2026-07-27 a Claude-model fleet ran in
place of an explicitly requested codex fleet: 3,258 turns, roughly 1.29 billion
tokens, about $1,843 of API-equivalent spend, 23% of one weekly allocation, for
work that should have cost nothing on that account.

The interesting detail is where the tokens went. Ninety-seven percent of that
1.29 billion were cache reads, from workers each hauling around 500k tokens of
context per turn. That is the shape of long fan-out cost. It is not the tokens
the workers write. It is the same context, dragged through every turn, multiplied
by workers, multiplied by turns. A worker with a fat context is not slightly more
expensive than a lean one. It is a multiplier applied to the entire run.

Which gives you the operating rule: keep per-worker context small. A Codex worker
never sees the Claude conversation anyway, so each brief is self-contained by
construction, and self-contained turns out to mean minimal. Job, input file
paths, exact deliverable, acceptance criteria the worker can mechanically
self-check, and the exact output path in `out/`. The shared voice, hard bans, and
output conventions live once in the workspace `AGENTS.md`, which Codex auto-loads,
so briefs stay short. That file is described in the skill as the highest-leverage
file in the system, and the reason is that it is the one piece of context you pay
for once instead of per worker.

## When not to fan out

Fan-out has a fixed cost you pay before any work happens: decomposition, briefs,
lane maps, collision detection, and a review pass over every output. That
overhead is worth it only under specific conditions.

Do not fan out judgment-dense work. The core principle in `suede-codex-fleet` is
that Claude tokens buy judgment and Codex tokens buy volume. Clear spec plus high
volume goes to the fleet. Fuzzy spec, or expensive-if-wrong, stays with the model
doing the thinking. Ten landing page headlines where the whole difficulty is
taste is not a fleet job, it is one writer with context.

Do not fan out one complex change across coupled files. If the files move
together, they cannot be disjoint lanes, and forcing a split produces exactly the
collision the lane map was supposed to prevent. That is the boundary between the
two skills: `suede-agent-teams` coordinates multiple lanes on one complex change
with gates and handoffs; the fleet exists for genuinely independent units.
Anything with a shared manifest, a generated index, or a lockfile keeps one owner
regardless of how many workers are running.

Do not fan out under a handful of items. Three briefs, three spawns, and three
review passes cost more of your attention than doing three things in sequence.
The overhead is real and it is front-loaded.

And do not fan out to feel productive. Twelve workers running is not twelve units
of progress, it is twelve outputs you now have to read.

## The actual test

Here is the question that separates a fleet from a token bonfire. For each
worker's output, can the reviewer state, in advance, the criterion that decides
whether it passes?

If yes, review is mechanical and the fan-out scales. The brief template forces
this: acceptance criteria are numbered and mechanically checkable, limits, bans,
required elements. The worker self-checks and reports pass or fail per criterion,
and the skill is explicit that worker self-checks are evidence, not verdicts. A
Claude review gate reads every file in `out/` regardless. Failing one or two
criteria earns a one-line delta via `codex exec resume <session-id>`, not a
regeneration, because regenerating throws away everything that was already right.
Failing three or more, or violating an `AGENTS.md` hard ban, earns a respawn with
the delta appended.

If no, if you cannot say what "good" looks like before the output arrives, you
have not decomposed a job. You have distributed a vague feeling to twelve
processes and committed yourself to reading whatever comes back. The volume will
be impressive. The reviewer will be you, at midnight, deciding whether things
look about right.

Acceptance criteria are not paperwork. They are the only thing standing between a
fleet and a very expensive way to generate material nobody will check.

## The stack, formally

The six skills this chapter and the last keep circling — `suede-full-send`,
`suede-ship`, `suede-agent-teams`, `suede-codex-fleet`, `suede-workflow-skills`,
`suede-recommend-next-action` — ship as a named group: the Agentic Adderall
Stack, sold with a straight face at `/cracked.html` on the docs site. The label
is a joke. The contract underneath is not, and it is worth stating precisely
because it demonstrates the pack's own discipline applied to itself.

In the catalog, a stack is a cross-cutting overlay, not a seventh specialty.
The six specialties remain a strict partition — every skill carries exactly one,
and the validator fails the build if the per-specialty counts stop summing to
the pack size. A `stacks` entry references members by name across that
partition, and it is held to the same drift rules as every count surface: each
member must resolve to a real catalog skill, the claimed count must equal the
membership, and the page selling the stack must list exactly its members, row
for row, or CI goes red. The MCP server scopes the stack per profile, so a
narrowed profile only advertises the members it can actually serve. Nothing
about the branding is load-bearing; everything about the membership is checked.

The two "formulations" are execution modes with different scheduling semantics.
Instant release is one continuous pass: a single controller decomposes the
outcome, fans every disjoint lane out at once, and the run has no intervals
because nothing ever waits on a timer — work is event-driven off lane
completion, adversarial refutation runs inside the pass rather than as a
follow-up session, and the close is an evidence gate, not a summary. Its cost
model is the one this chapter already priced: subagents inherit the session
model unless told otherwise, `suede-ship` states its own 35-to-150-agent range
on the label, and the fleet skill exists precisely so volume can leave the
Anthropic meter. Extended release is the other scheduling regime: between
passes, `suede-recommend-next-action` scores candidate moves on goal fit,
unblocking, evidence, urgency, and leverage, and emits the winner as a runnable
prompt, so the idle state between runs is a queued next action instead of a
blank prompt box.

### The move

Before spawning any parallel work, write the lane map and the per-lane acceptance
criterion first, and if you cannot write the criterion for a lane, do that lane
yourself instead of dispatching it.
