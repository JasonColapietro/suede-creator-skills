# Chapter 11. The S-Tier Ladder

Most builders rate themselves by how much they produce. That is the wrong axis,
and it is why the ladder in this chapter will feel unflattering. The tiers here
are defined by what someone can prove about their output and by what keeps
working when they close the laptop. Volume does not appear anywhere.

The ladder is not a personality test. It is not about ambition, work ethic,
years of experience, or how much you care. Two builders with identical attitudes
land two tiers apart because one of them runs a test suite before saying "done"
and the other says "done" and waits to hear otherwise. The difference is
observable in a transcript. That is deliberate: every rung below is described by
behavior you can go check, in your own repo, this afternoon.

Agents make this ladder sharper than it used to be. When output was slow, tier
differences showed up as throughput and everyone could pretend the gap was time.
Now anyone can generate a thousand lines in four minutes, so throughput tells
you almost nothing. What survives as a signal is verification, scope control,
and whether the same problem has to be solved again next month.

## D: produces output

A D-tier builder ships text that looks like a solution. The agent wrote it, it
reads confidently, it went into the repo. Whether it works is an open question
that someone else usually answers.

Their week is a sequence of things that were "done" and then were not. Monday's
feature comes back Wednesday because it never handled the empty state. A
migration lands and a report breaks two days later, discovered by a user. Their
calendar fills with rework they do not label as rework, because each incident
feels like a fresh bug.

Their transcripts have a shape. Long agent responses, then "great, next," then a
new task. There is almost never a command output in the transcript. No `npm
test` block, no `curl` response, no screenshot, no diff read back. When
something fails, the next message is a paste of the error and the word "fix."
That loop can run five times on one bug without anyone stating what the bug
actually is.

The specific failure: they cannot tell working from broken without an external
signal. Not "they do not bother." They lack a mechanism. If nobody complains, it
worked. This means their confidence and their correctness are uncorrelated, and
the uncorrelation is invisible from the inside.

The move that promotes them is small and boring. Before you say a task is
finished, paste one piece of evidence into the thread: a test run, a request and
its response, a screenshot of the actual rendered page, a diff you read. One
artifact. Not a plan to add tests later. The rule is the one this book keeps
returning to: evidence or it did not ship. Applying it once per task,
mechanically, is the entire move.

## C: produces working output on familiar ground

C-tier is genuinely competent inside a known perimeter. They know their stack,
their repo, the three services they touch every day. Inside that box the work is
correct and they can tell you why.

Outside the box, everything resets. A new language, an unfamiliar deploy target,
a subsystem they inherited, and they are back to guessing. Not because they are
incapable, but because their method is recall, not investigation. When recall
returns nothing, there is no fallback procedure.

Their week is bimodal. Familiar tickets close fast and cleanly. Then one
unfamiliar item sits open for three days and closes with a change nobody can
fully explain. Someone asks why it works and the honest answer is "that
combination stopped the error."

The transcripts show it. On familiar work: short, precise instructions, good
results. On unfamiliar work: the prompts get longer and vaguer, the agent starts
proposing options, the builder picks one on vibes, it half works, and the next
twenty messages are variations of the same fix. There is no point where anyone
writes down what they believe is true and then checks it.

The specific failure: no transferable method for unknown territory. Familiar
competence is being mistaken for competence.

The move is to run one unfamiliar problem through an actual procedure instead of
intuition. `suede-debug` exists for exactly this, and the substance of it fits
in a sentence: state the hypothesis, name the observation that would disprove
it, run that observation, keep or discard. The point is not the skill file. The
point is that when you leave known ground you switch from recall to method, on
purpose, and you can feel the switch happen.

## B: produces working output reliably, and knows why it works

B-tier is where most strong builders live, including a lot of people who would
place themselves at the top of this ladder. Their code works. They can explain
the mechanism. They handle unfamiliar problems with real method. They are the
person a team escalates to.

They are also the bottleneck for everything they touch, and this is the part
that stings, because it does not feel like a deficiency. It feels like being
important.

Their week is full. Their own tasks, plus reviewing everyone else's, plus the
three questions per day that only they can answer because the answer lives in
their head. They work late not on the hard part but on the accumulated small
parts. When they take a week off, throughput does not drop by one person's
worth. It drops by more, and things wait.

Their transcripts are good. Clear briefs, real constraints, evidence checked.
And every single one starts from scratch. The same twelve lines of context about
how this repo handles auth get retyped, in slightly different words, in forty
different sessions. The same review checklist gets described from memory each
time and is slightly different each time. They have a method and it lives
nowhere but in them.

The specific failure: everything they know is stored in a person rather than in
an artifact. That is not a knowledge problem, it is a distribution problem, and
it caps them permanently, because a person does not scale and does not run in
parallel.

The move: take the thing you explained three times this month and write it down
where the agent will load it. A `CLAUDE.md` entry, a skill file, a checked-in
checklist. One artifact per repeated explanation. The test of whether you did it
right is that the next time the situation comes up, you do not have to be
present.

## A: produces verified output, with evidence, on unfamiliar ground

A-tier is the first rung where the builder's own claims can be trusted without a
second opinion. They work in unfamiliar territory with method, they produce
output that runs, and they attach the proof before anyone asks for it.

The distinguishing behavior is self-review that is actually adversarial. Not
rereading their work approvingly. Deliberately looking for the thing that would
embarrass them, with the same rigor they would apply to a stranger's pull
request. An A-tier builder is the one who says "this passes CI but CI never
exercised the changed path, so treat the test lane as unverified." Nobody made
them say that.

Their week has fewer surprises than a B-tier week, and the surprises that do
arrive are new rather than repeats. Their reviews come back with small notes
because the large notes were already found and fixed. When they report a status,
the status holds. That last property is worth more than it sounds like: an
organization can plan against an A-tier builder's word.

Their transcripts show separation between building and checking. There is a
point in the session where the tone changes and the builder starts trying to
break their own work: running the error path, hitting the endpoint with a bad
token, checking the mobile viewport, reading the migration for the rollback
story. `suede-code-grader` encodes the standard they are holding themselves to,
and its red flags read like a list of A-tier temptations resisted. "CI passed,
round up." "The work was clearly hard." "It's just a refactor." "Happy path
works, call it an A." Effort never moves a grade; evidence does.

The specific failure that holds them at A: every unit of verified output still
requires them to be in the loop for it. They have made themselves reliable and
they have made themselves necessary. The A-tier ceiling is a throughput ceiling
wearing a quality costume.

The move: pick the check you perform most often by hand and make it run without
you. The review pass becomes a required CI check. The deploy verification
becomes a script with a readback. The context you re-explain becomes a skill
description precise enough that the agent loads it unprompted. One check, moved
out of your hands, permanently.

## S: builds systems that produce verified output without them

S-tier is defined by a property of their absence. When they are not in the
session, the work still comes out verified. Not because the agent is smarter,
but because the standard lives in files the agent loads.

Their week looks strange from outside. Fewer tasks appear on their name. More of
their hours go into things with no user-visible output that week: a skill
description rewritten so it routes correctly, a grade cap added for payment
surfaces, a handoff template that will not close without evidence, a CI gate
that turns a soft opinion into a merge blocker. Then a task they never touched
ships correctly and the reason is traceable to one of those files.

Their transcripts have a distinctive fingerprint: short prompts and long,
correct outputs. A B-tier builder writes 400 words of context per session. An
S-tier builder writes 30, because the other 370 are already loaded from a skill
body that the description routed to. Progressive disclosure is doing the work.
The prompt is small because the system is large.

The second half of the definition is the harder half, and it is where most
people who reach for S-tier fall over: knowing which problems deserve a system
and which deserve to be done once and forgotten. A system has a cost. It has to
be written, maintained, and kept honest as the repo drifts underneath it. A
skill that encodes a stale convention is worse than no skill, because the agent
will follow it confidently.

The specific failure at S: systematizing the wrong things. Building a framework
for a problem that occurred twice and will not occur again. Writing a
generalized abstraction after seeing one instance. Producing tooling that has to
be maintained forever to serve a case that lasted a quarter. This failure feels
exactly like good engineering while you are doing it, which is why it is
dangerous.

The heuristic that keeps it honest is frequency times consequence. If a task
recurs often and being wrong about it is expensive, it deserves a system. If it
recurs often and being wrong is cheap, it deserves a checklist. If it happened
once, do it and move on. The instant-F list in `suede-code-grader` is a good
example of the first category: hardcoded secrets and auth bypasses are both
recurrent and catastrophic, so they get an unconditional mechanical rule that no
other lane can override. UI spacing magic numbers appear in the same skill and
are explicitly given no grade impact. Same author, same file, two different
judgments about what deserves machinery.

The move at S is not "build more systems." It is to look at your last five
systems and ask which one you would delete. Then delete it.

## Place yourself honestly

Five questions. Answer them about the last two weeks, not about your intentions.

1. In your last five completed tasks, did every one of them include a command output, URL, screenshot, or diff you actually read before you called it done?
2. When you last worked in an unfamiliar area, did you write down a hypothesis and the observation that would disprove it, or did you try things until the error stopped?
3. Is there anything you explained more than twice this month that is still not written down where an agent would load it?
4. If you took two weeks off, name the specific thing that would break. Can you point at the file that would prevent it?
5. Of the systems you built in the last quarter, which one has been used by someone other than you, on a task you did not supervise?

Read the answers this way. Any "no" on question one holds you at D regardless of
everything else. A "tried things until it stopped" on question two holds you at
C. A "yes" on question three holds you at B, no matter how good your
verification is. If question four has no file, you are A at best. Question five
is the only one that distinguishes S from a very organized A, and if the honest
answer is "nobody, yet," you are A. That is not an insult. A is a good place to
be and most people reading this are not there.

Most readers will place themselves one rung high, and the correction is usually
question three. Knowing something and having written it down feel similar from
the inside and are not remotely the same.

## The trap at the top

S-tier is not about producing more. It is about where the marginal hour goes.

A B-tier builder with a free hour does another task. An S-tier builder with a
free hour improves the thing that does the tasks. Both hours feel productive.
Only one of them changes next month's capacity, and only one of them is a bet,
because the systematizing hour pays nothing today and might pay nothing ever.

That is the honest cost. Every hour spent on the system is an hour of visible
output not produced, and there is no guarantee of a return. A skill that nobody
invokes is worse than nothing: it is maintenance debt with a helpful name. The
`suede-recommend-next-action` scoring rubric names this directly, and it is
worth borrowing outside the skill. Leverage scores two points only when the work
"fits one focused session and prevents rework or creates a reusable result," and
zero when it is "unscoped, multi-day, or low-payoff." Both halves matter.
Reusable is not enough if it does not fit in a session, and bounded is not
enough if nothing reuses it.

The failure mode at the top of this ladder is not laziness. It is a builder who
has learned that systems are the answer and stops asking whether this particular
problem is a system-shaped problem. They end up maintaining an estate of
machinery that serves a workload that moved on. From inside, that feels like
S-tier. From outside, it looks like someone very busy with their own tools.

The tier that actually matters is not a rank. It is a question you can ask about
any hour you just spent: if this exact situation shows up again in six weeks,
will it cost the same, or less? D through B pay full price every time and get
faster at paying it. A pays full price but never pays twice for the same
mistake. S has arranged for someone else to not pay at all, and can tell you
which bills were worth arranging and which ones they should have just paid.

### The move

At the end of this week, find the one thing you did more than twice and would do
again, and spend an hour turning it into a file the agent loads instead of a
paragraph you retype. Then check next week whether anything actually loaded it.
