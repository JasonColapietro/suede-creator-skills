# Chapter 7. Grading Your Own Work

A findings list is easy to ignore. You ask an agent to review a diff, it comes
back with fourteen items ranked P0 through P3, you read the P0, decide it is
really more of a P2, and merge. Nothing in the output stopped you, because
nothing in the output was a decision. It was a menu.

A letter grade is harder to ignore. `suede-code-grader` ends with one character
and a gate that follows it mechanically: A maps to `ship`, B maps to
`ship-with-caveats`, and C, D, and F all map to `hold`. There is no arithmetic
left to do at the end and no room to negotiate with yourself about severity.
You either accept a C and hold, or you say out loud that you are shipping a C.

That is the whole trick. The grade does not add information the findings lacked.
It removes the option of reading the findings and doing nothing.

## Seven lanes, scored separately

The grader scores each of these A through F, then gives one overall:

1. **Correctness.** Intended behavior, edge cases, error paths, async behavior,
   routing, data flow, regression risk.
2. **Security and permissions.** Auth, secrets, payment, wallet, injection,
   path traversal, SSRF, permission and data exposure risks fail closed.
3. **Data and state.** Schemas, migrations, caches, jobs, queues, webhooks,
   retries, idempotency, state transitions.
4. **Suede truth.** Public copy, rights, provenance, royalty routing, licensing,
   product claims match the implementation. Grading work outside Suede, you
   substitute domain truth: API contract truth, published-statement accuracy,
   data model truth.
5. **UX and release behavior.** Loading, empty, error, and success states,
   mobile and native surfaces, metadata, routes.
6. **Tests and verification.** Changed behavior has meaningful tests, builds,
   screenshots, simulator runs, live readbacks, or named caveats.
7. **Deploy readiness.** Env vars, feature flags, configs, migrations, rollback
   notes, install paths, docs, release sequencing.

Separate lanes matter because a single number hides the shape of the risk. A
change can be flawless on correctness and blind on deploy readiness, and those
two failures need different responses from you. One needs a rewrite. The other
needs a paragraph in the PR body and an env var pushed to production before the
merge.

Notice what lane 6 does. "Tests and verification" is a graded lane, not a
footnote, which means an agent that wrote perfect code and verified none of it
cannot reach an A. Evidence or it did not ship, expressed as a score.

## The F you cannot argue with

Before any lane is scored, the grader runs a fixed list of instant-F triggers.
Six categories: secrets and credentials, injection, auth bypass, payment and
wallet, data destruction, plaintext sensitive data. Two concrete examples the
repo uses, because concrete is the point:

A hardcoded API key, secret, token, or password in committed source. Not in
`.env`, not in a config the deploy pipeline injects, but in the actual file that
went into git history. That is an F.

A role or permission check that can be bypassed by manipulating a request
parameter. Someone sends `?role=admin` and the middleware believes them. That is
an F.

The rule attached to those triggers is the part builders resist: **no other lane
can raise a locked F.** Not a beautiful migration plan, not full test coverage
everywhere else, not the fact that the key is for a staging account. The
instruction to the agent is explicit: stop, report the file and line, mark the
grade F, and do not grade the remaining lanes. Scoring the rest would imply
those scores could matter. They cannot.

This list lives in two places, `suede-code` Step 1 and `suede-code-grader`, and
both copies carry the same note: change both together. Duplicated rules drift.
Saying so in the file is cheaper than discovering the drift during a review that
mattered.

## Caps, so a happy path cannot buy an A

Some surfaces cannot earn a top grade on passing CI alone, because CI on those
surfaces usually exercises the path that was never in danger.

**Auth changes** (login, session, token validation, middleware, role
assignment). An A requires explicit coverage of the bypass or escalation path,
named: "tested with expired token returns 401", "role escalation attempt returns
403." A B requires the happy path tested plus named caveats about what is not.
Meet neither and the change caps at C no matter how the other six lanes scored.

**Payment and wallet flows** (checkout, subscription, refund, payout, transfer,
webhook). An A requires error paths tested (failed charge, declined card,
webhook replay), amount and recipient validated server-side, and no silent error
swallowing. Otherwise, cap at C.

**Data migrations** carry the harshest cap. A documented rollback plan with an
untested restore gets you a B. No rollback plan at all caps the change at D,
which routes to `hold` and, because data loss is one of the extreme-risk
categories, puts the ship choice explicitly to you rather than letting anything
proceed quietly.

**Public API changes** that break a contract with no migration path cap at C.

The caps exist for one reason, stated bluntly in the skill's red-flag list:
"Happy path works, call it an A" is wrong because happy paths are never where the
risk lives.

## Grade the diff, not the story about the diff

The Source Truth section reads like a list of places to look, and it is, but the
operative sentence is the first one: do not grade from the PR description or
commit message alone. A PR description is a claim about a diff, written by the
person or agent least able to see what the diff missed.

So the grader reads the repo, branch, remote, and dirty state; the diff, changed
files, generated files, and touched routes; the imports, callers, schemas,
configs, env requirements, jobs, webhooks, scripts, tests, and docs that move
with the change; and whatever build, test, lint, typecheck, browser, simulator,
or live evidence directly exercises the changed behavior. When live or runtime
checks are not practical, it grades the source and marks those lanes unverified.
Unverified is a real result. Assumed-passing is not.

The red flags that precede a fake grade are worth memorizing, because you will
think all of them at some point:

- "CI passed, round up." CI that never exercised the changed behavior raises
  nothing.
- "The work was clearly hard." Effort never moves a grade. Evidence does.
- "It's just a refactor." Instant-F triggers run on every grade, every time.
- "The PR description is clear enough." Grade the diff and its evidence, or mark
  the lane unverified.

## The gate is advice, and that is deliberate

Every one of these skills opens with the same policy block: the checks, the
verdicts, the letter grades are recommendations to the user, not controls on the
agent. A failed gate changes what the agent reports, never what it does. If you
ask for a merge and the grade comes back C, you get the merge and the C, clearly
labeled, side by side.

This looks like a weakness until you have used a tool that had it the other way.
An agent that refuses your instruction because its own quality check disagreed
has quietly promoted itself from advisor to gatekeeper, and the first thing you
learn is how to phrase requests that dodge it. Then the gate is worth nothing,
because it only ever fires on the honest path.

There is one exception, and it is narrow: extreme risk. Data loss, credential
exposure, legal or rights violations, payment mistakes, irreversible public
damage. On those the agent pauses, names the risk and the options, and hands the
choice back. Your choice is final. The pause exists so that the decision is
conscious, not so that it is blocked.

If you want a gate that actually blocks, that is a different skill and a
different layer. `suede-ci-gate` writes the workflow and hands you the branch
protection settings, and it makes the same distinction explicitly: it generates,
it does not enforce. Real blocking belongs to CI and to GitHub, not to an agent
in your terminal. The grader tells you the truth. Branch protection makes the
truth binding.

## Predict the grade before you run it

Here is the part that turns a tool into a skill.

Run the grader on your own work before anyone else does. That is the beginner
version, and it is already better than most practice, because the cheapest
review is the one that happens before a human's attention is spent. Ship a C
knowingly if you want, but ship it knowing.

The advanced version: before you run it, write down the grade you expect. All
seven lanes, plus the overall, plus which cap you think applies. Then run it and
compare.

The gap between your prediction and the output is the only real measurement of
your judgment. When you guess A and the grader returns C because tests and
verification was thin, you learned something durable about your own blind spot.
When you guess C and it returns C for exactly the reason you named, you did not
need the grader for that change, which is its own useful result.

Track this for a month and the prediction converges. That convergence is the
skill. The grader stops being an oracle you consult and starts being a check on
a judgment you already have, which is the difference between an A-tier builder
who produces verified output and an S-tier builder whose verification runs
mostly in their own head, with the tool confirming rather than discovering.

A builder who cannot predict their own grade is outsourcing taste. A builder who
predicts it correctly, and runs the grader anyway because prediction is not
evidence, has the thing worth having.

### The move

Before you run the grader on your next change, write your predicted overall
grade and the one lane you think will be weakest in a scratch file. Run it, and
keep a running log of where your prediction missed.
