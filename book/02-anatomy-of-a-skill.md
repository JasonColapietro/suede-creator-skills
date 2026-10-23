# Chapter 2. Anatomy of a Skill

Open `skills/suede-code/SKILL.md` and read it top to bottom. It takes
about ten minutes. At the end of those six minutes you will know exactly what
the agent will do to your diff, which parts it will refuse to do, and what the
output will look like before you run it once.

That property is the point of the format. A skill is a document you can audit
before you trust it. This chapter takes one apart.

## The frontmatter is two fields

Every `SKILL.md` in this repo opens the same way:

```yaml
---
name: suede-code
description: "Suede AI code review and A-F ship grade for a diff, PR, branch, or commit range: findings ranked P0-P3 with file:line evidence and a fix path, an A-F grade across seven lanes with Instant-F security triggers and surface grade caps, OWASP 2025 checks, a deploy-safety gate, a commit-dirt scan, and fix briefs. Three modes: full review and grade in one pass (default), findings only with no grade, and grade only with no findings list. Use when asked to review this, grade this, find the bugs before merge, security-check this, is this safe to ship, give it a letter, or should this merge. Runs only when explicitly invoked; never auto-fires on a diff, save, or commit. NOT FOR: making CI enforce the verdict on every merge (use suede-ci-gate); LLM, RAG, or agent behavior coverage (use suede-ai-eval); searching competing plans and building a multi-file change (use suede-graph-flo-xr); fixes that need coordinated parallel lanes (use suede-agent-teams)."
---
```

Across all 63 skills, the frontmatter carries `name` 63 times and `description`
63 times. Forty-three of them add a `metadata` block with a version string, a
convention the marketing and growth skills brought with them. Nothing else appears. The schema is small on
purpose, because everything the frontmatter does happens before the body is
read.

`name` matches the folder and is the handle. It is what you type when you invoke
the skill directly, and what other skills reference when they route work
elsewhere. Keep it stable. A rename breaks every routing line in every other
skill that points at it, and those lines are plain text, so nothing will tell
you.

## The description carries the routing burden

The description is the only part of a skill that stays in the agent's context
when the skill is not running. In this repo the 63 files total 915,176 bytes;
the 63 descriptions together are 49,381. The agent holds the small number and
reaches for the large one only when a description matches.

That makes the description a router, not a summary. It has to answer two
questions well enough that an agent mid-task can decide in one pass: what does
this produce, and when should it fire.

Look at what `suede-code` does with 953 characters. "Suede AI code review and
A-F ship grade for a diff, PR, branch, or commit range" states the artifact. The
next clauses name what comes back and the three modes, so a caller who only
wants the letter knows it can ask for one. The trigger list catches the request
in the words a caller actually types: "find the bugs before merge", "give it a
letter", "should this merge". Then the last sentence does the real work: "NOT
FOR: making CI enforce the verdict on every merge (use suede-ci-gate)." That
clause exists because `suede-ci-gate` lives next door and produces something
different, and without it an agent would pick between them by coin flip.

`suede-deslop` does the same job in 900 characters:

```text
description: "Suede Slop Stop: the Suede AI context-aware anti-slop pass for
finished prose. Finds or removes generic filler, manufactured emphasis, false
agency, formulaic structure, chat and draft residue, formatting applied by rule,
and the Suede AI house bans (em dashes, moreover, delve, game-changer, unlock,
elevate, seamless, landscape, tapestry, rule-of-three rhythm) without flattening
the author's voice. Returns cleaned prose with a 50-point score, or a
findings-only audit that leaves the text untouched. Use before copy, a README,
an email, a social post, or a doc ships; after a long AI-assisted writing
session; or when asked to strip AI tells, deslop, or audit text for slop. NOT
FOR: writing or restructuring copy (use suede-copy); one high-stakes public
piece that needs research and fact review (use suede-ship-copy); deciding
whether a person or model wrote text; changing or certifying facts."
```

Three parts. What it does, the trigger conditions in the vocabulary a user
actually types ("strip AI tells", "deslop"), and then the boundary.

## The `NOT FOR:` convention

Sixty-three of the 63 descriptions in this repo end with a `NOT FOR:` clause,
and it is the highest-leverage sentence in the file. That count is measured,
not asserted: the validator checks this sentence against the files on every run.

A description that only says what a skill does will fire on adjacent work,
because the agent has no signal that a better match exists. `NOT FOR:` supplies
the signal, and it does so by naming the alternative rather than just declining.
`suede-workflow-skills` closes with "NOT FOR: a request that already names one
lane (go straight to that specialist)." `suede-pricing` closes with
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

Before any of `suede-code`'s grading logic appears, the body opens with a
policy block. It is worth reading in full, because it is the most consequential
design decision in the pack:

```text
## Gate policy: advisory, not blocking

Every check, grade, and ship verdict here is a recommendation to the user, not
a control on the agent.

- Run every check and report results honestly. `ship`, `ship-with-caveats`,
  `hold`, letter grades, and BLOCKED items are advice attached to the work.
- Never block, delay, skip, or rewrite the action the user asked for because a
  gate said hold. A failed gate changes what you report, never what you do.
- Single exception: an extreme-risk finding (data loss, credential exposure,
  legal or rights violation, payment mistake, irreversible public damage).
  Pause, state the risk and the options, and let the user pick. Their choice
  is final.
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

**Pre-flight** comes first, and it is one instruction followed by a list: "Name
three things before analysis." Target, intent, risk lanes. The intent line
carries its own search order for the spec (issue references, a path the caller
passed, a matching file under `docs/` or `specs/`) and handles the case where
none exists: write "no spec available" and judge intent from the PR description
alone. "Never invent requirements." The skill never leaves the agent to
improvise a fallback. Right after it, **Run the repo's own gates first** tells
the agent to run the type check, lint, and tests the repo already ships before
reading a line by hand, and to cite command and exit status for each.

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

**Grade caps by surface** is where the skill stops being a rubric and becomes a
specialist. Auth changes cannot receive an A unless the bypass or escalation
path is tested. Without that, and without the happy path plus named caveats that
earn a B, the instruction is unambiguous: "otherwise cap at C." Data migrations
with no rollback plan cap at D.

**Technical debt** carries a table that grades the same pattern differently by
location, which is the kind of judgment most rubrics flatten:

| Pattern | Location | Impact |
|---|---|---|
| Function or class doing 5+ unrelated jobs | Payment module | D in Correctness |
| Same | Utility helper | B in Correctness |

The **Red flags** section lists the rationalizations that inflate grades, in the
agent's own voice: "CI is green, so it's fine." "The diff is small." "It was hard
work, round up to B."

**Output** fixes the artifact: a plain-language explanation first, then, by
mode, the findings, the seven lane grades with the cap applied, a deploy-safety
block, a commit-dirt rating, open questions, and a verification block split into
checked and not checked. The last line resolves mechanically. A becomes `ship`,
B becomes `ship-with-caveats`, C and below become `hold`.

One rule closes the most annoying possible failure: "Never report a C, D, or F
without the upgrade that would move it."

Then two worked examples, which is unusual and worth copying. The grade-only one
grades a real file from its own repo, `mcp/suede-skills-mcp.mjs`, spawned as a
process and driven with real JSON-RPC requests over stdin. It lands on an
overall A, and it closes by naming its own standard: every claim ties to a line
number or a command actually run, "not an invented test result or a guessed
line number." The skill loads those examples only when calibrating, so they
cost nothing on an ordinary run.

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
  display_name: "Suede Slop Stop"
  short_description: "Remove slop without flattening the author's voice"
  default_prompt: "Use $suede-deslop (Suede Slop Stop) on [text]. Preserve facts and voice, ..."
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
exact evidence that lifts the cap. Output leaves no room to write a
paragraph of impressions instead of seven letters and a gate.

A defined output artifact is the load-bearing part. Once the skill has to fill
in checked and not checked, the agent cannot quietly skip a step, because the
skipped step has to be written down in the second field.

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
