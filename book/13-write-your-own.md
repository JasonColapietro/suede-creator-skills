# Chapter 13. Write Your Own

The third time you paste the same release checklist into a chat window, stop
typing and open a file instead.

That is the whole trigger. Not a strategy, not an assessment of whether your
process is "mature enough to systematize." You have explained a procedure to an
agent three times, or you keep a checklist in your head that you half-remember
and half-improvise, and the parts you forget are always the same parts. Those
are the two signals. Everything in `skills/` in this repo started as one of
them.

The second signal is worth being precise about, because it is easier to miss.
It is not "I do this often." It is "I do this often and I get it slightly wrong
in a different place each time." A procedure you execute perfectly from memory
does not need a file. A procedure where you remember the four steps and forget
the fifth, and it is a different fifth every time, is a skill waiting to be
written down. The forgetting is the value. You are not encoding what you know,
you are encoding what you drop under load.

## The anatomy, from the author's side

You already know the shape from the reader's side: description routes, body
pays off. Writing one inverts the emphasis. Almost all of your care goes into
the frontmatter, and almost all of your discipline goes into the body's output
contract.

The frontmatter is two fields.

```yaml
---
name: suede-deslop
description: "Strip AI writing patterns from prose before anything goes public. Em dashes, filler openers, manufactured enthusiasm, false agency, passive voice, formulaic structures, all of it. Use when copy, a README, an email, a social post, or a doc is about to ship, after a long AI-assisted writing session, or when text sounds fine but feels generated. NOT FOR: writing new copy (use suede-copy); changing or certifying facts, which must be checked against primary evidence before publication."
---
```

Read that description as three parts doing three jobs. The first sentence names
the durable job. The middle names the use-when conditions in the words a user
would actually type: "about to ship," "sounds fine but feels generated." The
last part is `NOT FOR`, and it hands the near-miss cases to a named neighbor.

Write the use-when clause in your trigger words, not your taxonomy. This is the
single most common authoring failure. You know the skill as "prose quality
normalization," so you write that, and then you type "this reads like ChatGPT
wrote it" and nothing loads. The description is the router and the router
matches on the language of the request. Before you write it, write down three
to five prompts you would realistically type, verbatim, and two or three that
should go somewhere else. The description has to cover the first set and the
`NOT FOR` has to cover the second.

The `NOT FOR` route is not politeness. Two skills with overlapping descriptions
make routing depend on loader order, which means the same prompt gets a
different skill on a different machine. An explicit route makes the boundary a
fact rather than a coin flip. Name the neighbor by skill name, in parentheses,
and make sure that neighbor exists.

Then the body. Three things earn their place, and most bodies that fail are
missing the third.

**Source Truth.** What the agent must read before it does anything. Not
"understand the context," a list. `suede-code-grader` opens with it: read the
repo, branch, remote, dirty state, then the diff and changed files, then the
imports, callers, schemas, configs, and tests that move with the change, then
build and test evidence that exercises the changed behavior. And a blunt line
above it: do not grade from the PR description or commit message alone. That
line exists because an agent will absolutely grade from the commit message if
you let it.

**The procedure.** Numbered steps, thresholds, and commands. Narrative only
where it changes a judgment call. The rule that keeps bodies honest: no naked
judgment words. Every "good," "polished," "safe," "high-risk" in a skill body
must resolve to a number, a checklist, or a command whose output decides it.
`suede-deslop` does not say the prose should be clean; it runs a merged kill
list against a 50-point score gate. If you cannot say how an agent would score
the quality, the quality is decoration and you should cut it.

**A defined output artifact.** The step people skip. A skill that ends without
saying what file, what report shape, what sections, and what fields will
produce something different on every run and you will never be able to tell
whether it worked. Specify the artifact. `suede-visibility-grader` has an
`## Output Format` section and then a `## Sample Report` section showing the
thing filled in. The sample is not padding. It is the fastest way to make a
weaker model produce the right shape.

One more, and it applies to any skill that says something "blocks": say what
happens at the block. Stop, name the blocker in one line, list two to four
resolution options, wait. A skill that says "this blocks release" and then keeps
working has written a comment, not a gate.

## Bundled files, and when to split

A skill folder is a directory, and the markdown file is only one thing in it.
Deterministic
procedures go in `scripts/`, heavy reference material in `references/`, reusable
inputs in `assets/`, `templates/`, or `fixtures/`.

The split rule is about loading cost, not tidiness. The body gets pulled into
context every time the skill fires. Anything that is long, rarely consulted in
full, or purely enumerative should live in `references/` and get named from the
body. `suede-deslop` keeps a 226-line kill list in
`skills/suede-deslop/references/kill-list.md` rather than inline, because the
agent needs the method every run and the exhaustive phrase list only when it is
actually scanning. `suede-agent-teams` does the same with
`references/public-contribution-program.md` and keeps
`scripts/contribution-ledger.mjs` as executable rather than as prose describing
what the script would do.

The counter-rule matters just as much: keep it inline when splitting would hide
the rule. A four-line threshold table belongs in the body. Move it to
`references/` and the agent now has to decide to go look, which it often will
not.

## The test for a good skill

A competent stranger runs it on your work and produces the same artifact you
would have produced.

Not "understands your intent." Produces the artifact. That is the bar, and it
is unforgiving in a useful way, because it fails on exactly the things you
cannot see in your own writing. Read your skill as if you were a small model
with no context and no history with you. Every place you would have to guess,
the skill loses. Add the threshold, the command, or the halt format that removes
the guess.

Then run the boundary version of the test: take a prompt that should go to the
neighboring skill and check that your description does not catch it. A skill
that fires too often is worse than one that fires too rarely, because it
displaces the correct skill silently.

## Linting the estate

Once you have more than a handful, the failure mode changes. Individual skills
stay fine and the connections between them rot.

Two things rot first. **Dangling routes**: a `NOT FOR: ... (use suede-foo)`
where `suede-foo` was renamed, or never existed, or lives in a private repo the
reader does not have. The agent reads a route to nowhere and improvises.
**Missing relative assets**: the body references `scripts/check.py` and the file
was never committed. Both are mechanically checkable, and the forge linter
checks exactly them, exiting nonzero on any route target not present in the
target surface or a declared external root, and on any relative path under
`scripts/`, `references/`, `assets/`, `agents/`, `templates/`, `fixtures/`,
`examples/`, or `data/` that does not exist.

The third rot is worse because it is invisible and it is not about skills at
all. It is duplicated numbers. This repo says "73 skills" in the README badge
URL, the README badge alt text, the README intro, five separate install
sections, `PRODUCT.md`, `CITATION.cff`, `docs/llms.txt`, four different `docs/`
pages' title tags and og:descriptions and JSON-LD blocks, both plugin manifests,
the MCP catalog, and inside `skills/suede-workflow-skills/SKILL.md` itself. Add
a skill and every one of those is wrong, and not one of them will tell you.

So they are guarded. `scripts/validate-skill-pack.mjs` carries a `countChecks`
array: file, label, regex with a capture group, expected value. The comments in
it are a field log of what actually broke. The shields.io badge value drifted to
29 while the alt text and all the prose said 67. Five install sections said "all
70 skills" while the badge and intro said 71, which is why that check carries
`every: true` and validates every occurrence instead of the first match. The
docs catalog page had no count check at all, so its title said 28 while the meta
description on the same page said 67. There is also a structural check that
counts the rows the catalog page actually lists, because one lane badge read 4
above 5 rows and no string check would ever have caught it.

The lesson generalizes past this repo. Anything missing from `countChecks` goes
stale silently, so when you add a surface that states a count, add its guard in
the same commit. `npm test` runs the validator with `--strict` plus the trigger
routing contract, the MCP protocol tests, and the Python suite.

## Actually adding one

Four steps, no ceremony.

```bash
mkdir -p skills/suede-release-notes
$EDITOR skills/suede-release-notes/SKILL.md
```

Write the frontmatter first, in your trigger words, with the `NOT FOR` route.
Then Source Truth, procedure, output artifact, boundaries, routing. Then install
it. For the whole pack, `bash install.sh` rsyncs every skill folder into
`~/.claude/skills/` and prints the count, leaving non-pack skills alone. For one
skill you are iterating on, copy the folder into `.claude/skills/` in the
project so it is scoped to the repo you are testing against:

```bash
mkdir -p .claude/skills
cp -R skills/suede-release-notes .claude/skills/
```

Then verify the route, which is the step everyone skips. Start a fresh session,
type one of the prompts you wrote during the pressure test, and confirm the
agent loads your skill rather than a neighbor or nothing. Fresh session matters:
an agent already holding the procedure in context will look like the routing
worked when it did not. If it does not fire, the description is wrong, not the
body. Rewrite the use-when clause in the exact words you just typed.

None of this required a vendor. `skills/<name>/SKILL.md` is a text file in your
repo. It diffs, it reviews, it reverts, it merges, and when the tool that reads
it changes its mind about something, you edit a file instead of filing a support
request. The skills in this pack are MIT licensed, which means the first thing
you should do with any of them is fork the parts that fit your work and delete
the parts that do not. They are a starting shape, not a product surface. Your
estate is yours.

### The move

Take the procedure you have explained to an agent three times this month, write
it as `skills/<name>/SKILL.md` with a description in your own trigger words and
one `NOT FOR` route, then start a fresh session and confirm it loads before you
write another line of the body.
