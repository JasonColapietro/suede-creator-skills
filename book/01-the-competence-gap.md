# Chapter 1. The Competence Gap

You paste a diff into Claude Code and type "review my diff." Thirty seconds later
you get a tidy response. Two naming suggestions, one note about extracting a
helper, a closing line that the change looks solid. You merge it.

The diff added a `role` check to an API route. The agent never opened the
middleware that route sits behind. It never checked whether the role came from
the session or from a request parameter. It never ran your test suite, and it
never said it hadn't. It read the changed lines, pattern-matched them against a
general sense of what good code looks like, and reported back with the tone of
someone who checked.

That is the competence gap. The model was smart enough to catch the bug. Nothing
in the request told it to go look.

## Confident mediocrity has a shape

When a capable model gets a vague instruction, it does not fail randomly. It
fails in a consistent, recognizable way, and once you see the shape you cannot
unsee it.

First, it picks a plausible approach instead of the correct one. "Review my
diff" has no defined scope, so the agent invents one, and the scope it invents
is almost always the changed lines. Callers, config, migrations, and the
`.env.example` that no longer matches the code are outside the frame it drew for
itself.

Second, it skips the checks a specialist would run without being asked. A senior
reviewer looking at an auth change does not check the happy path. They check the
expired token, the missing token, the token signed with `alg: none`, and the
role field an attacker can put in a query string. That list is not intelligence.
It is procedure, learned by watching those exact things go wrong.

Third, and worst, it reports success it never verified. "Tests should pass" and
"tests pass" are one word apart in English and infinitely far apart in fact. A
model with no instruction about evidence will produce the confident version,
because confident prose is what most of its training data looks like.

None of these are reasoning failures. Ask the same model directly whether a role
check read from `req.query` is safe and it will tell you no, at length, with a
correct explanation. The knowledge is there. The procedure that would have made
it look is not.

## Why a better prompt does not scale

The obvious fix is to write a better prompt. So you do. You write four
paragraphs specifying that the review should trace callers, check the auth
boundary, run the repo's linter and test suite, and report which checks it could
not run. It works. The review is genuinely good.

Then you close the terminal.

Tomorrow the diff touches a Stripe webhook, and the four paragraphs you wrote
are about auth. Next week you need a design review, then a README pass, then a
migration check. Each one needs its own four paragraphs, written under time
pressure, by you, from memory, at the exact moment you least want to be writing
process documentation.

There is a second failure that hurts more. The prompt you wrote yesterday was
good because you remembered eleven things. Today you remember nine. The two you
dropped are invisible, because a missing check produces no output. You cannot
review a prompt for the checks that are not in it. Prompting well is a skill
that degrades silently under fatigue, and it does not survive being handed to
anyone else, including yourself in a month.

The scaling problem is not that prompts are hard to write. It is that a prompt
is a thing you say, and things you say are not versioned, not reviewable, and
not reusable across a hundred tasks.

## What a skill actually is

Mechanically, a skill is boring, which is the best thing about it.

It is a folder with a `SKILL.md` file inside. In this repo they live at
`skills/<name>/SKILL.md`, 71 of them, under documented open-source licenses. The file opens with YAML
frontmatter carrying a `name` and a `description`. Everything after the closing
`---` is the body: the procedure the agent reads when the skill fires.

```yaml
---
name: suede-deslop
description: "Suede Labs anti-slop pass: strip AI writing patterns from prose before anything goes public. ..."
---
```

That is the whole mechanism. No plugin API, no compilation step, no runtime. A
skill is a document, and it works because the agent reading it is a competent
reader who follows written instructions.

The body is where the specialist lives. `skills/suede-code-grader/SKILL.md` is
212 lines. It contains a list of instant-F triggers checked before any lane is
scored, seven grading lanes, grade caps that hold auth and payment changes at C
without named bypass-path evidence, and a fixed output block ending in a ship
gate. `skills/suede-deslop/SKILL.md` carries a 25-row kill list of filler
phrases with replacements, ten formulaic structures with their fixes, and a
50-point score with a threshold below which the text does not ship. None of that
is clever. All of it is written down, which means it runs the same way on a
Tuesday afternoon as it does at midnight.

## Progressive disclosure, or why 71 skills fit

Here is the objection that arrives immediately. The 71 `SKILL.md` files in this
repo total 1,034,705 bytes. Loading all of them into every conversation would
crowd out the thing you actually came to do.

They are not all loaded. Only the frontmatter descriptions stay resident, and
all 71 descriptions together come to 41,799 bytes. That is roughly a
twenty-fifth of the corpus. The agent holds a catalog of what exists and reads
a body only when a description matches the task in front of it.

This is progressive disclosure, and it changes what a description is for. The
description is not marketing copy for the skill. It is the router. It carries
the entire burden of deciding whether 400 lines of procedure load or stay on
disk. Chapter 2 takes that apart in detail, including the `NOT FOR:` convention
that 69 of the 71 descriptions in this repo use to push work toward a better
match.

The consequence for you is direct: a skill you install and never trigger costs
you almost nothing, and a skill with a sloppy description is invisible no matter
how good its body is.

## The before and after

Take the same diff and invoke `suede-code` instead of asking for a review.

The skill's body defines the target before any judgment happens: repo, branch,
commit range, what the change claims to accomplish, and which risk lanes it
touches. Then it builds a context graph, five specified layers, including
"imports, callers, routes, API handlers, jobs, hooks, models, schemas, and
config/env dependencies touched by the change." The scope stops being something
the agent improvises.

Before manual analysis, it runs the gates your repo already ships: typecheck,
the configured linter on changed files, the test suite, the dependency auditor
when dependencies changed, a real secret scanner over the diff. The instruction
is explicit about the failure mode it exists to prevent:

```text
Detect what exists; run only that; never fabricate a result you did not run,
and note in Verification when a gate could not run.
```

Then it reads your `CLAUDE.md` and `AGENTS.md` and treats them as binding, so it
stops flagging the patterns your team already decided to accept.

Only then does it review. Step 1 checks instant-F triggers, a fixed list where
any single match locks the grade at F: hardcoded secrets, SQL built by string
concatenation, auth middleware with a path that skips it, a webhook with no
signature verification, a migration with a DROP and no tested restore. Step 2
runs language traps by stack, so a React diff gets checked for stale closures in
a `useEffect` with an empty dependency array and a Swift diff gets checked for
escaping closures capturing `self` strongly. Step 3 runs the OWASP Top 10, but
only when the diff imports crypto, session, or payment modules, or touches
auth, api, middleware, or routes.

The output has a defined shape, ending in two lines that are not opinions:

```text
Overall: A-F
Grade cap applied: [surface type] — [what evidence would lift the cap] | none
...
Ship gate: ship | ship-with-caveats | hold
```

The ship gate follows the grade mechanically. A becomes `ship`, B becomes
`ship-with-caveats`, and C, D, and F all become `hold`. There is no room for the
agent to be encouraging.

The skill even anticipates the ways a review talks itself into a better verdict,
and names them in its Red Flags section. The first is "CI passed, round up." The
second is "The work was clearly hard." Effort never moves a grade. Evidence
does.

The difference between the two runs is not that the second agent is smarter. It
is the same model. The difference is that the second one was handed a procedure
that had already made the mistakes, and had the corrections written into it.

## The thesis

Your agent will do roughly what a competent professional would do given the same
instructions. That is the whole game. The instructions are the variable, and for
most people the instructions are whatever they happened to type.

The ceiling on your output is now the quality of the procedures you can hand an
agent. That is a real ceiling, and it is not set by the model. It is set by how
much hard-won practice you have managed to write down in a form something else
can execute.

The good news is that those procedures are files. You can read them, diff them,
argue with them, delete the parts that are wrong, and commit the parts that
survived a real incident. A model you cannot inspect got better at reasoning. A
folder you own got better at remembering. The second one is the part you
control.

### The move

Take the last task you prompted well and got a good result from, and write the
prompt down as a `SKILL.md` body before you forget which eleven things you asked
for.
