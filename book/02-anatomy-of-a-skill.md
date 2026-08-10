# Chapter 2. Anatomy of a Skill

Open `skills/suede-code-grader/SKILL.md` and read it top to bottom. It takes
about six minutes. At the end of those six minutes you will know exactly what
the agent will do to your diff, which parts it will refuse to do, and what the
output will look like before you run it once.

That property is the point of the format. A skill is a document you can audit
before you trust it. This chapter takes one apart.

## The frontmatter is two fields

Every `SKILL.md` in this repo opens the same way:

```yaml
---
name: suede-code-grader
description: "Give a blunt A-F ship grade for a code change across correctness, security, data, UX, verification, and deploy readiness. Use for a grade, not a findings review."
---
```

Across all 71 skills, the frontmatter carries `name` 71 times and `description`
71 times. Thirty-eight of them add a `metadata` block with a version string, a
convention inherited from the marketing skills adapted from Corey Haines's
`marketingskills` under MIT. Nothing else appears. The schema is small on
purpose, because everything the frontmatter does happens before the body is
read.

`name` matches the folder and is the handle. It is what you type when you invoke
the skill directly, and what other skills reference when they route work
elsewhere. Keep it stable. A rename breaks every routing line in every other
skill that points at it, and those lines are plain text, so nothing will tell
you.

## The description carries the routing burden

The description is the only part of a skill that stays in the agent's context
when the skill is not running. In this repo the 71 bodies total 1,079,688 bytes;
the 71 descriptions together are 28,469. The agent holds the small number and
reaches for the large one only when a description matches.

That makes the description a router, not a summary. It has to answer two
questions well enough that an agent mid-task can decide in one pass: what does
this produce, and when should it fire.

Look at what `suede-code-grader` does with 187 characters. "Give a blunt A-F
ship grade for a code change" states the artifact. The lane list names the
surfaces it covers. Then the last sentence does the real work: "Use for a grade,
not a findings review." That sentence exists because `suede-code-review` lives
next door and produces something different, and without it an agent would pick
between them by coin flip.

`suede-deslop` handles the same problem at more length:

```text
description: "Strip AI writing patterns from prose before anything goes public.
Em dashes, filler openers, manufactured enthusiasm, false agency, passive voice,
formulaic structures, all of it. Use when copy, a README, an email, a social
post, or a doc is about to ship, after a long AI-assisted writing session, or
when text sounds fine but feels generated. NOT FOR: writing new copy (use
suede-copy); changing or certifying facts, which must be checked against primary
evidence before publication."
```

Three parts. What it does, the trigger conditions in the vocabulary a user
actually types ("sounds fine but feels generated"), and then the boundary.

## The `NOT FOR:` convention

Forty-eight of the 71 descriptions in this repo end with a `NOT FOR:` clause,
and it is the highest-leverage sentence in the file.

A description that only says what a skill does will fire on adjacent work,
because the agent has no signal that a better match exists. `NOT FOR:` supplies
the signal, and it does so by naming the alternative rather than just declining.
`suede-recommend-next-action` closes with "NOT FOR: executing the recommended
action without the user's separate authorization, or coordinating a multi-lane
build across specialists (use suede-agent-teams)." `suede-pricing` closes with
"NOT FOR: in-product upgrade screens (use suede-paywalls), offer bonuses and
guarantees (use suede-offers), or executing billing changes."

Two different jobs are happening in those clauses. One is routing, sending the
task to a named sibling. The other is scope refusal: "executing billing changes"
has no sibling to route to, because the skill produces a decision brief and
deliberately stops short of touching the billing system. Both belong in the
description, because both change whether the body should load at all.

The practical test when you write one: name the skill a confused agent would
otherwise pick, and name the action a confused user would otherwise assume is
included.

## The advisory-gate policy

Before any of `suede-code-grader`'s grading logic appears, the body opens with a
policy block. It is worth reading in full, because it is the most consequential
design decision in the pack:

```text
## Gate policy — advisory, not blocking

Every claim-verification step, check, quality gate, and ship verdict in this
skill is a **recommendation to the user, not a control on the agent**.

- Run every check and report the results honestly. Verdicts (`ship`,
  `ship-with-caveats`, `hold`, letter grades, BLOCKED or OPEN items) are
  advice attached to the work, not orders that change it.
- Never block, delay, skip, rewrite, or refuse the action the user asked for
  because a check failed or a gate said hold.
- A failed gate changes what you report, never what you do.
- Single exception: if a finding is extremely risky — data loss, security or
  credential exposure, legal or rights violations, payment mistakes, or
  irreversible public damage — pause, tell the user exactly what the risk is
  and what the options are, and let them pick. Their choice is final.
```

Consider what happens without it. A skill full of gates and hold verdicts, read
by an agent that takes written instructions seriously, produces an agent that
refuses. You ask it to push and it tells you the ship gate says hold. You are
now arguing with a document you installed to help you, and the practical
response is to uninstall it.

The policy separates two things that look similar and are not. The grade is
information about the work. The decision is yours. A grader that reports F and
then does what you asked is useful every single time. A grader that reports F
and blocks you is useful right up until the first time it is wrong, which is the
last time you run it.

The single exception is drawn narrowly and around irreversibility, not around
severity of opinion. Credential exposure and data loss get a pause and a
question. A C in the UX lane does not.

## The body: procedure, not topics

Everything after the policy is the procedure. The section order is doing work.

**Source Truth** comes first, and it is four words of instruction followed by a
list: "Read before grading. Do not grade from the PR description or commit
message alone." Then the specific inspection list, including "build, test, lint,
typecheck, browser, simulator, MCP, or live/API evidence that directly exercises
the changed behavior." The section ends by handling the case where that evidence
is unavailable: grade the source and mark those lanes unverified. The skill
never leaves the agent to improvise a fallback.

**Instant-F triggers** run before any lane is scored. Six categories, each with
concrete patterns: a hardcoded secret in a committed file, SQL built by string
concatenation with user input, auth middleware with a code path that skips it, a
webhook handler with no signature verification, a migration with a DROP and no
tested restore, PII written to an unencrypted log. Any single match ends the
grade at F, names the file and line, and stops. The ordering matters because a
grader that scores seven lanes first will average a catastrophe into a C.

**Grade lanes and grade meaning** define seven scores and then define what each
letter means with a worked example attached. A is not "good." A is "all lanes
pass, behavior is verified at runtime, no known follow-ups."

**Grade caps by surface type** is where the skill stops being a rubric and
becomes a specialist. Auth changes cannot receive an A without explicit test
coverage for the bypass path, with named evidence such as "tested with expired
token returns 401." If that is missing and the happy-path caveats are missing
too, the instruction is unambiguous: "If neither condition is met: cap at C
regardless of other lane performance." Data migrations with no rollback plan cap
at D.

**Technical debt indicators** carries a table that grades the same pattern
differently by location, which is the kind of judgment most rubrics flatten:

| Pattern | Location | Grade Impact |
|---|---|---|
| God object (5+ unrelated concerns) | Payment module | D in Correctness |
| God object | Utility helper | B in Correctness |

The **Red Flags** section lists the rationalizations that inflate grades, in the
agent's own voice: "CI passed, round up." "The work was clearly hard." "It's
just a refactor."

**Output Format** fixes the artifact: a plain-language summary, the target, the
seven lane grades, the overall, the cap applied, the evidence, three required
upgrades, and a verification block split into Checked and Not checked. The last
line resolves mechanically. A becomes `ship`, B becomes `ship-with-caveats`, C
and below become `hold`.

**Boundaries** closes the loopholes, including one rule that prevents the most
annoying possible failure: "Never report a C, D, or F without naming the
required upgrade that would move the grade."

Then a worked example, which is unusual and worth copying. The skill grades a
real file from its own repo, `mcp/suede-skills-mcp.mjs`, 715 lines, spawned as a
process and driven with real JSON-RPC requests over stdin. It lands on an
overall A with a B in Suede truth over an unbounded string echo, and it closes
by naming its own standard: every claim ties to a line number or a command
actually run, "not an invented test result or a guessed line number."

## What lives beside the SKILL.md

A skill folder can carry more than one file, and three subfolder conventions
appear in this repo. `suede-agent-teams` uses all three.

`references/` holds material too long to keep in the body. `suede-deslop` keeps
its 25-row table in `SKILL.md` and pushes the full sweep, forty-plus more
phrases, to `references/kill-list.md`, loaded only when the text is going to
press. `suede-agent-teams` keeps its 327-line public-contribution program the
same way. This is progressive disclosure applied one level down.

`scripts/` holds executable work. `suede-agent-teams/scripts/contribution-ledger.mjs`
is 1,286 lines of real code, because atomic issue leases are a thing a program
should do deterministically rather than a thing an agent should be trusted to
simulate.

`agents/` holds a small interface manifest so the skill presents correctly
outside Claude Code:

```yaml
interface:
  display_name: "Suede Deslop — AI Pattern Removal"
  short_description: "Strip AI writing tells before prose ships"
  default_prompt: "Use $suede-deslop to clean [text]. Run the merged kill list, ..."
policy:
  allow_implicit_invocation: true
```

## Topics versus procedure

Most written guidance tells an agent what to think about. "Consider security
implications. Check for edge cases. Make sure tests are adequate." An agent
handed that produces a review that mentions security, edge cases, and tests, and
none of those mentions are grounded in anything.

The dissection above never does that. Every section either names a specific
pattern to look for, defines what evidence satisfies a claim, or fixes the shape
of the output. Instant-F names the exact injection pattern. Grade caps name the
exact sentence that lifts the cap. Output Format leaves no room to write a
paragraph of impressions instead of seven letters and a gate.

A defined output artifact is the load-bearing part. Once the skill has to fill
in `Checked:` and `Not checked:`, the agent cannot quietly skip a step, because
the skipped step has to be written down in the second field.

## The standard

Here is the test to hold your own skills to. Hand the `SKILL.md` and the target
to a competent stranger with no context about you, your repo, or your habits.
They should be able to run it and produce the same artifact you would.

If they would need to ask you a question first, that question is a missing
section. If they would produce a different shape of output, the output format is
underspecified. If they would reach a different verdict on the same evidence,
the rubric is doing less than it appears to.

That standard is harsh, and it is also the whole reason the format works. A
skill that passes it is a specialist you can hire an infinite number of times.

### The move

Take your best skill, delete every sentence that tells the agent what to
consider, and check whether an output artifact is still defined at the end. If
not, write the output block first and rebuild the body around it.
