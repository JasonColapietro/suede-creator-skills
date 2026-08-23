# Chapter 3. The Description Contract

Five skills in this pack mention code in their first sentence. A review skill, a
grader, a combined pass, a CI gate, and a Suede Thought Graph shipping search
capped at 55, 110, or 200 calls. You type
"can you look at this PR," and exactly one of them is correct. Nothing in the
system errors if the wrong one runs. You get output either way, and the output
looks fine.

That is the whole problem with descriptions. They read like marketing copy and
they behave like routing tables. The body of a skill can be a thousand lines of
careful procedure, and none of it matters if the router never selects it.
Progressive disclosure means the description is the only thing the agent
reliably sees for every installed skill, every time. It is the contract. The
body is the payload.

So write it as a contract.

## Write the words a user would actually type

Open `skills/suede-full-send/SKILL.md` and read the description before the body.
It does not describe a philosophy of maximum effort. It lists literal strings:
`full send`, `max effort`, `max agents`, `spare no compute`, `throw tokens at
it`, `burn tokens`, `burn max tokens`, `never end your allocation above zero`.
Those are not synonyms chosen for elegance. They are the phrases a tired founder
types at 1am, transcribed into the frontmatter so the router has something to
match against.

This is the part most people get backwards. You know what your skill does, so
you describe it in your vocabulary. The user does not have your vocabulary. They
have a problem and a keyboard. If your grading skill's description says
"holistic readiness assessment" and the user types "just give me an A-F, no
line-by-line," the match is weaker than it should be, and a neighboring skill
with sloppier prose but better word overlap takes the request.

The pack enforces this mechanically. `tests/fixtures/trigger-routing.json`
defines groups of competing skills, and each route carries `positive` signals,
`negative` signals, and a `metadataMustContain` list that has to appear in the
skill's actual description. For `suede-code-grader`, `metadataMustContain` is
`["a f", "grade"]`. If someone rewrites that description into something more
dignified and drops the literal "A-F," `node scripts/validate-trigger-routing.mjs`
fails. The vocabulary is a tested interface, not a style choice.

There is also an ambiguous case in that fixture, and it is the honest one:

```json
{ "id": "code-ambiguous-fallback",
  "mode": "ambiguous",
  "prompt": "Check this PR and tell me if it ships.",
  "expected": "suede-code" }
```

Some requests genuinely do not disambiguate. When that happens you want a
declared fallback rather than a coin flip. The group names one: `suede-code`,
the combined pass, because doing both findings and a grade is the least
regrettable answer to an unclear question.

## NOT FOR is the other half of the contract

Forty-eight of the 71 public skills carry a `NOT FOR:` clause in their
description. It always has the same shape: the condition under which a sibling
wins, then the sibling's exact name in parentheses.

`suede-graph-flo-xr` refuses three specific neighbors: high-volume work that splits into
independent worker tasks goes to `suede-codex-fleet`, findings-only review with
no code change goes to `suede-code-review`, and CI and branch-protection wiring
goes to `suede-ci-gate`. Read that as a routing table written from the point of
view of whichever skill is most likely to steal the request.

The generic version is worthless. "NOT FOR: other tasks" tells the router
nothing, because the router's question is never "is this skill relevant." Every
description in a coherent pack is relevant to something. The question is "is this
skill more relevant than that one," and only a named comparison answers it.

Two rules make the clause work. Name the sibling, not the category: `use
suede-code-review` routes, "use a review tool" does not. Name the condition, not
the vibe: "findings-only review with no code change" is testable against a
request string, "smaller jobs" is not. And write it from the near-miss. Nobody
confuses a shipping pipeline with a rights audit. The dangerous neighbor is
always the one that does almost the same thing.

The cleanest example in the repo is a mutual pair. `amazon-returns-recovery`
declines bank chargebacks, marketplace seller claims, and subscriptions billed
outside Amazon, and hands them to `subscription-recovery`. `subscription-recovery`
declines Amazon returns, restocking fees, and Amazon-billed Prime Video Channels,
Audible, and Kindle Unlimited, and hands them back. Two skills that would
otherwise fight over every refund request instead partition the space by billing
relationship. Neither description needs to be cleverer than the other, because
the boundary is written down on both sides.

## What overlap actually costs you

When two descriptions overlap and neither carries a boundary, the agent still
picks. It picks by vibes: whichever description sounds more enthusiastic about
the request. The tiebreaker is prose style. That is not a metaphor for how the
selection works, it is a fair description of what you are left with once
semantic relevance is a tie.

Two costs follow, and they are asymmetric.

A description that oversells gets the skill loaded for work it cannot do. The
skill fires, the body loads, the agent starts executing a procedure built for a
different shape of problem, and it produces something. `suede-graph-flo-xr` running
against a one-line typo fix will happily scout, research across multiple lenses,
plan lanes, and gate the release. You burn real time and real context, and at the
end you have a correct one-line fix wrapped in ceremony. The failure is expensive
and invisible, because the output is fine.

A description that undersells never fires at all. This one is cheaper per
incident and worse in aggregate, because you never learn about it. The skill sits
in the pack, correct and unreachable, and you go on solving the problem by hand
while believing you have tooling for it. If you have ever written a skill and
then noticed six weeks later that it has never once been selected, the
description undersold. Nothing will tell you. There is no error for a skill that
did not run.

`suede-codex-fleet` is the case where oversell would be more than wasteful. Its
description says the workers are always `codex exec` processes billed to the
user's OpenAI subscription, that Claude subagent fan-out is never a substitute on
any model, and that the correct behavior when the Codex CLI is missing is to halt
rather than fall back. The body repeats it in a callout: the word "Fable" in the
brand name is not the model `claude-fable-5`. That redundancy exists because the
substitution is semantically reasonable and financially wrong. Both routes spawn
parallel workers. Only one of them costs nothing against your Anthropic
allocation. A description that said "parallel worker fleet for bulk generation"
and stopped there would be accurate and would still let the expensive
interpretation through.

## Estate lint: routes that point at nothing

A `NOT FOR` clause names a skill. If that skill does not exist, you have written
a dead link inside your agent's routing logic, and the agent will try to follow
it.

This is not hypothetical in a pack that has both public and private halves. My
personal `~/.claude/skills/` directory contains `suede-debug`, `suede-verify`,
`suede-plan`, `suede-spec`, and about fifteen more that are not in the public
repo. Their boundaries are real to me: `suede-debug` declines proving a finished
feature works and sends it to `suede-verify`, and declines reviewing a diff for
quality and sends it to `suede-code-review`. Two of those three exist for me. One
of them exists for you.

So `scripts/validate-skill-pack.mjs` lints the estate. It parses every `NOT FOR`
clause, collects each `(use X)` target, and fails the build when `X` is not a
folder in the pack:

```
NOT FOR redirect in <skill>: named skill <name> does not exist in skill pack
```

It also keeps a `knownPrivateSkills` list, filtered down to the ones that are not
public, and refuses to let any of those names appear in a public skill's
frontmatter at all. Bodies may mention them, but only as a disclosed dead end,
tagged with a phrase marking them unavailable. The comment in the source says why
plainly: an undisclosed pointer "sends a public installer after a skill they do
not have and cannot get, with nothing marking it as unavailable." Two lines in
`suede-codex-fleet` were exactly that, because an earlier version of the guard
read only frontmatter.

The lint itself had a hole worth knowing about. The original regex anchored every
match on the literal string `NOT FOR:`, so in a clause naming three targets,
only the first was ever checked. Sixteen of the twenty-one skills in the pack at
that time had two or more targets on one line. Nothing broken shipped through it,
but two of every three redirect targets in a three-target clause were validated
by nobody. The current version finds the clause span first, then collects every
`(use X)` inside it. That fix is preserved verbatim as the worked example in
`skills/suede-code/SKILL.md`, which is a nice property: the pack's review skill
demonstrates itself by finding a real bug in the pack's release gate.

## A pack is a namespace

Ten skills have forty-five possible pairwise collisions. Seventy-one have more
than two thousand six hundred. You cannot write your way out of that with better
positive descriptions, because none of the descriptions are inaccurate. They are
all true. Truth about what a skill does says nothing about whether it should
beat its neighbor.

Which is why a set of skills is a namespace, and namespaces need the same
discipline as any other: unique names, declared boundaries, no dangling
references, and a checker that fails the build when someone breaks one. The
alternative is not chaos. The alternative is a system that quietly does the
second-best thing forever and never tells you.

### The move

Take a request that should go to a neighboring skill, hand it to this one, and
see whether the description alone sends it away. If it does not, the boundary
is not written yet, and it is not the router's fault.
