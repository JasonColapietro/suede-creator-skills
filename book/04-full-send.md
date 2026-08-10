# Chapter 4. Full Send

Type "full send, fix everything" into a capable agent with no policy behind it
and watch what happens. It spawns twelve subagents. Eight of them read the same
four files. Three write overlapping summaries of the same finding. One produces a
document titled "Comprehensive Analysis" that restates your request in
headings. Forty minutes later you get a wall of process narration, a list of
things that were considered, and no change on disk.

That is process theater, and it is the predictable response to maximum-effort
language, because "max effort" reads as an instruction about volume. The agent
has no way to distinguish between doing more work and looking like it did more
work, so it does the thing that is easier to demonstrate.

`suede-full-send` exists to convert that phrase into an outcome. It is worth
being precise about what it is: a policy router. Its own body says so directly.
It does not change model limits, expose hidden reasoning, create external
spending authority, or replace the selected controller's workflow. It never does
the work. It decides who does, under what constraints, and what counts as done.

## The house line, and what it does not mean

**"Never end your allocation above zero."**

The skill's instruction about its own catchphrase is to use it once, dryly, then
return to business. It is a joke about already-authorized host compute: you are
paying for the seat, the included capacity is there, so use it when using it buys
something.

It is not a token counter. An agent cannot see a hidden host meter and cannot
control one, and the description says so in the frontmatter so the router carries
the disclaimer even when the body never loads. It is not permission to pad
output. And "authorized host compute" specifically means the included in-session
model and agent capacity under the host's existing controls. It does not cover
separately billed APIs, credit purchases, quota increases, or cloud jobs. The
mission record sets `incremental_external_spend_cap=0` and keeps it at zero until
you name both a category and a maximum amount.

So the line means: do not leave useful parallel capacity idle out of politeness.
It does not mean: spend more.

## Bring the user a decision, not a workshop

The standard section opens with that sentence, and everything else in the skill
is downstream of it. Your attention is the scarce resource. Compute is not.

Which means the default is to decide. Routine, reversible, in-scope decisions get
executed, not returned to you as homework. The skill names four conditions that
justify interrupting you, and the discipline is that a question must meet one of
them:

1. the answer changes the desired outcome;
2. it grants new authority;
3. it crosses a serious risk boundary;
4. it chooses between materially different irreversible results.

"Should I name the variable `userId` or `accountId`" meets none of them. "Should
this migration drop the old column or leave it" meets the fourth. The test is
mechanical enough to apply while working, which is the point. Most agents ask too
much, not because they are cautious, but because asking is cheaper than deciding
and it looks like diligence.

The reporting rule follows the same logic. Report technical detail as
consequence, proof, and next move. Keep progress updates brief. Do not narrate
token use, lane chatter, or methodology unless asked. Nobody wants the diary.

## Freeze the mission before you mutate anything

This is the single highest-leverage habit in the book, and it takes about ninety
seconds.

Before any mutation, the controller writes a `FULL_SEND_MISSION` record. The full
schema is in `skills/suede-full-send/SKILL.md`; the fields that earn their place
are these:

- `objective`: one user-visible outcome. Not a task list.
- `targets`: exact repos, folders, routes, URLs, or accounts.
- `authorized_actions`: actions tied to those exact targets.
- `protected_wip`: dirty files, branches, and people not to disturb.
- `source_truth`: current files, live surfaces, or platform records.
- `done_signals`: commands, readbacks, URLs, or platform states.
- `risk_halts`: data loss, security, privacy, legal, payment, irreversible impact.

Every one of those is a failure you have already had. `protected_wip` is the
answer to an agent cutting a branch on top of another session's uncommitted work
on a shared machine. `source_truth` is the answer to an agent confidently editing
a local mirror that is forty commits behind origin. `done_signals` is the answer
to "I've completed the implementation" with no command output behind it.
`authorized_actions` is the answer to scope creep, which in an agent does not look
like ambition, it looks like helpfulness.

The word "everything" gets an explicit definition: every required surface for the
stated objective. Safe read-only discovery can add candidate surfaces to look at.
It does not silently expand mutation authority. And the escalation phrases are
bounded in the same way. "Full send," "fix everything," and "do not stop"
increase persistence and coverage. They do not authorize purchases, deletion,
publishing, third-party messages, credential handling, access changes, or
irreversible external actions that were not already in scope.

Freezing the mission costs a minute and converts a vague instruction into
something you can hold the run accountable to afterward. Skip it and you have no
basis for saying whether the run succeeded, because you never wrote down what
success was.

## One controller, and lanes that actually differ

The skill selects exactly one controller. Broad work with multiple judgment,
implementation, or verification lanes goes to `suede-agent-teams`. High-volume
independent units that need worker briefs and review go to `suede-codex-fleet`.
One contained outcome with no useful split goes to the smallest relevant
specialist. If a batch is one lane inside a bigger release job, agent-teams stays
the controller and the fleet is subordinate. Never assign the same units to both.

The prohibition is blunt: do not run two controllers, two plans, or two progress
stores for one mission. Two plans is not redundancy. It is two sources of truth
about what is done, which is worse than one wrong one.

Within the chosen controller, the instruction is to fill every useful
non-colliding lane, then refill capacity while independent work remains. The
qualifier is doing the work. Each lane needs a bounded artifact that can change a
done signal, a decision, a risk, a surface map, or the critical path. If a lane
cannot change any of those, it is not a lane, it is a witness.

So the skill rejects duplicate prose, ceremonial votes, filler agents, and
semantically identical lanes, and states the principle in five words: negative
evidence is useful, more words are not. A lane that reports "checked the auth
flow against the OWASP list, found nothing" changed your risk picture. A second
lane summarizing the first one changed nothing and cost the same.

There is one more constraint that people trip over immediately after they
discover parallelism, and it is stated in the frontmatter so the router carries
it: explicit Full Send intent on atomic work selects one specialist and no
parallel lanes. Saying "full send" over a single-file fix does not buy you a
fleet. It buys you the right specialist and stronger reasoning on the calls that
matter. Parallelism is a property of the work, not of your enthusiasm. Work that
does not split does not split faster with more agents watching.

## Provisional until proved

Every worker result is provisional. The controller inspects the actual artifact,
diff, command output, or live behavior and marks it `accepted`, `rejected`, or
`fix brief`. A worker's final message never closes the mission, which is the
correct default given that a subagent reporting success is a claim, not evidence.

The proof standard is specific by surface. Changed code means inspecting the diff
and running the relevant build, test, lint, or focused behavior check. A skill or
plugin means validating manifests, discovery metadata, install paths, and a fresh
invocation. MCP means exercising JSON-RPC initialization plus the current tools,
resources, and prompts. A public page means the built or live URL at the relevant
desktop and mobile states. A deployment means the exact production domain and
route.

Then three verdicts, and they are allowed to be uncomfortable. `PROVED` means
direct evidence matches the done signal. `UNPROVED` means the signal is unchecked
or supported only indirectly. `BLOCKED` means access, authority, data, or
external state prevented the check. Missing proof narrows the final claim; it
does not erase separately completed work. That last clause matters, because
without it the incentive is to quietly claim the unproved thing rather than
publish a mixed result.

The run closes with a compact brief: outcome, decision, executed, proof,
adversarial reconciliation, unproved or blocked, source state, handoff, next
move, status. For one atomic job, at most three sentences. For broad work, at
most eight bullets. Explicitly no lane chatter, no token counts, no padded logs,
no diary of the process. If the run is blocked, you get only the blocker schema
plus whatever independent work actually finished, which is the version of bad
news you can act on.

## Effort is not the deliverable

Be honest about the failure mode this skill is fighting. Max-effort language is
an invitation to theater, and a substantial part of the skill's body is
suppression: no duplicate lanes, no ceremonial votes, no filler agents, no
narration, no hype, no costumed role-play. A router that only added capacity
would make the problem worse, because the thing that goes wrong at scale is not
insufficient work, it is work that is indistinguishable from work.

Effort is an input. You cannot spend it and you cannot ship it. What you can ship
is a changed surface with a command output behind it, or a named blocker with the
smallest external action that would clear it. Everything between those two
outcomes is cost.

C-tier answers "full send" with volume. S-tier answers it with a frozen mission,
one controller, lanes that could each change the verdict, and a three-sentence
brief that tells you what is true now.

### The move

Before any broad run, write the seven mission fields (objective, targets,
authorized actions, protected WIP, source truth, done signals, risk halts) in
plain text and paste them into the prompt. If you cannot fill in `done_signals`,
you are not ready to start.
