# Writing for agents — the full lever set

Reference for the Agent-Facing Docs lane in `SKILL.md`. Read it when writing or
editing a document an agent consumes: a `SKILL.md`, a `CLAUDE.md`, an
`AGENTS.md`, or a reference file a pointer reaches.

Adapted from `writing-for-agents` in
[mattpocock/skills](https://github.com/mattpocock/skills) by Matt Pocock, MIT.
See `NOTICE.md` at the repo root.

## Contents

1. [What changes when the reader is an agent](#1-what-changes-when-the-reader-is-an-agent)
2. [Context pointers](#2-context-pointers)
3. [The two loads](#3-the-two-loads)
4. [The information hierarchy](#4-the-information-hierarchy)
5. [Completion criteria](#5-completion-criteria)
6. [When to split](#6-when-to-split)
7. [Leading words](#7-leading-words)
8. [Prompt the positive](#8-prompt-the-positive)
9. [Pruning](#9-pruning)
10. [Invocation](#10-invocation)

---

## 1. What changes when the reader is an agent

Human copy earns attention. Agent docs spend it. Every always-loaded line costs
tokens on every turn whether or not it fires, and the goal is not a better
sentence but a predictable **process**: the agent takes the same route through
the document on run 12 as it did on run 1.

The packaging varies — skill, `CLAUDE.md`, `AGENTS.md`, bundled reference — and
the levers below do not.

## 2. Context pointers

A **context pointer** is a reference sitting in the agent's context that names
material outside it and encodes the condition for reaching it. A skill's
`description` is one. So is a line in `AGENTS.md` naming a doc.

The pointer's wording, not its target, decides when the agent reaches the
material and how reliably. Must-reach material behind a vague pointer is a
variance defect: found on some runs, missed on others. Sharpen the wording
first; inline the material only when sharpening fails.

A pointer does two jobs: say what the material is, and list the **branches**
that trigger it. A branch is a distinct case the document handles, so different
runs take different paths through it.

| Check | Fix |
|---|---|
| Leading word buried mid-sentence | Move it to the front, where it does the triggering |
| Two triggers naming one branch | Collapse to one; keep only distinct branches |
| Pointer restates identity the body carries | Cut it from the pointer |

Bad: "Can be used for a variety of documentation tasks."
Good: "Use when authoring a skill, tuning a trigger that misfires, or splitting a long agent doc."

## 3. The two loads

Every document and pointer spends one of two budgets. Name which before adding
either.

- **Context load** — always-loaded material on the agent's window: a skill
  description, an `AGENTS.md` line, anything resident every turn.
- **Cognitive load** — the cost on the human: knowing which documents exist and
  when to reach for each. The human is the index.

Cognitive load is not a cost to drive to zero. It is the price of human agency:
spend it where human judgment decides, remove it where it does not.

Material behind a pointer escapes context load at the price of the pointer's own
line. Material with no pointer rides entirely on cognitive load.

## 4. The information hierarchy

A document mixes **steps** (ordered actions) and **reference** (facts consulted
on demand) freely. The decision for each piece is which rung it sits on:

1. **In-file step** — the primary tier: what the agent does, in order.
2. **In-file reference** — consulted on demand. A flat peer-set here is often
   correct, not a smell.
3. **Disclosed reference** — a separate file behind a pointer, loaded only when
   the pointer fires.

**Progressive disclosure** is the move down the ladder. It protects the
hierarchy first and saves tokens second. The branching test decides it: inline
what every branch needs, disclose what only some branches reach. In a document
with steps, in-file reference that should have been disclosed buries them.

Push too little down and the top bloats. Push too much and the agent cannot find
what it needs.

**Co-location**: the ladder decides how far down a piece sits; co-location
decides what sits beside it. Keep a concept's definition, rules, and caveats
under one heading so reading one part brings its neighbours along.

**Sprawl** is the failure mode: a document too long even when every line is live.
Attention thins across the excess. The cure is the ladder.

Suede thresholds on top of this: over ~100 lines of reference moves to
`references/` with a table of contents; under ~50 stays inline; between the two,
keep it inline unless it pushes `SKILL.md` past the 500-line ceiling.

## 5. Completion criteria

Each step ends on a **completion criterion** — the condition that says the work
is done. Two properties make it a lever.

**Clarity.** Can the agent tell done from not-done? A vague bound ("once the code
is understood") invites **premature completion**: the agent ends early, attention
already on being finished. The steps visible after it supply that pull; the
criterion's clarity is the resistance. Defend in order:

1. Sharpen the bound. Local, cheap, fixes most cases.
2. Only if the bound is irreducibly fuzzy **and** you have watched the agent rush
   it, hide the later steps by splitting the sequence.

Hiding works only across a real context boundary — a hand-off or a subagent
dispatch. An inline call leaves the later steps in context and clears nothing.

**Demand.** How much the criterion requires. "Every modified model accounted for"
forces thorough work where "produce a change list" does not. Demand drives
**legwork**: the digging done inside the work, latent in the wording rather than
written as its own step. It is not step-bound — "every rule applied" binds flat
reference exactly as "every step done" binds a sequence.

The strongest criteria are both checkable and exhaustive.

Bad: "Review until you understand the module."
Good: "Every exported function has a one-line note saying who calls it."

## 6. When to split

Splitting spends one of the two loads, so the cut earns it or it does not happen.

- **By sequence.** Split a run of steps when the later steps tempt the agent to
  rush the one in front of it. The reverse holds as a warning: merging two
  sequences invites premature completion.
- **By invocation.** Split off a model-invoked skill when a distinct leading word
  should trigger it on its own, or when another skill must reach it. You pay
  context load for a new always-loaded description.

## 7. Leading words

A **leading word** is a compact concept already in the model's pretraining that
the agent thinks with while running the document: *lesson*, *fog of war*, *tracer
bullet*, *tight*, *red*. Repeated as a token and never restated as a sentence, it
accumulates a distributed definition and anchors a region of behavior in very few
tokens, because it recruits priors the model already holds.

Coining your own works when you define it clearly, but an invented word recruits
no priors: you pay in definition tokens what a pretrained word gives free.

It anchors twice:

- **In the body — execution.** The agent reaches for the same behavior every time
  the word appears.
- **In a pointer — invocation.** When the same word lives in your prompts, docs,
  and codebase, the agent links that shared language to the material.

Collapse restatements into one token:

- "fast, deterministic, low-overhead" → *tight* (a *tight* loop)
- "a loop you believe in" → *red* — a fuzzy gate becomes a binary observable
  state: the loop goes red on the bug, or it does not

## 8. Prompt the positive

Steering by prohibition drags the forbidden behavior into context and makes it
*more* available. Say *don't think of an elephant* and the elephant is all there
is: the negation is a weak modifier the activated concept overruns, so the ban
half-reads as an instruction to do the thing.

Bad: "Don't write long rambling comments."
Good: "Write one-line comments."

A prohibition earns its place only as a hard guardrail you cannot phrase
positively, and even then it rides next to the positive target.

## 9. Pruning

**Single source of truth.** Each meaning lives in one authoritative place, so
changing the behavior is a one-place edit. **Duplication** costs maintenance and
tokens, and inflates a meaning's prominence past its real rank. It is the
accidental inverse of a leading word, which repeats a token on purpose and never
the meaning.

**The environment is a source of truth too** — `package.json` scripts, config
files, directory layout, `--help` output. A document restating them is a
**cache**: a copy of a lookup, earning its load only when the lookup is
expensive. Cache what the agent cannot find by looking: the unwritten convention,
the reason behind a choice, the gotcha no config confesses.

**Relevance.** Does the line still bear on what the document does? Lines lose it
by never bearing on the task, or by going stale. The default fate without a
pruning discipline is **sediment**: stale layers that settle because adding feels
safe and removing feels risky.

**No-ops.** An instruction the model already obeys by default pays load to say
nothing. The test — does this change behavior versus the default? — is
model-relative, not reader-relative. Two people who disagree about a no-op
disagree about the model's default, and settle it by running the document, not by
arguing. When a sentence fails, delete the whole sentence rather than trimming
words. The test also grades leading words: a word too weak to beat the default
("be thorough") is itself a no-op, and the fix is a stronger word ("relentless"),
not a different technique.

## 10. Invocation

Skill-specific, and it trades the two loads directly.

| | Model-invoked | User-invoked |
|---|---|---|
| Frontmatter | omit `disable-model-invocation` | `disable-model-invocation: true` |
| `description` | model-facing, carries trigger branches | human-facing one-liner |
| Who can fire it | agent, other skills, and the human | the human typing its name |
| Context load | permanent | zero |
| Cognitive load | none | you are the index |

Model-invocation always *includes* human reach: a description only adds agent
discovery, never removes your ability to type the name.

Pick model-invocation when the agent must reach the skill on its own, or when
another skill must. When a skill only ever fires by hand, make it user-invoked
and pay no context load.

Shared reference that two user-invoked skills both need can live in neither: with
no descriptions, neither can fire the other. Push it to a plain file outside the
skill system.

**Router skills.** When user-invoked skills multiply past what you can remember,
that cognitive load is cured by a router: one user-invoked skill naming the
others and when to reach for each. A router can only hint, never fire.
