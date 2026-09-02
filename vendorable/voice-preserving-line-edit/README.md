# Voice-Preserving Line Edit

A finishing pass that removes generic AI writing patterns from prose you have
already written, without erasing the author underneath.

## The problem with most anti-slop rules

Most cleanup rule sheets are absolute. Kill every adverb. Never use passive
voice. Remove every em dash. Applied literally, they turn three different
writers into the same writer, break technical prose that needs a conventional
passive, and fight a house style that already made the punctuation call.

This skill applies the same pattern knowledge contextually:

- **Adverbs** are cut when they merely intensify, soften, or announce
  importance, and kept when they carry factual, technical, legal, quoted, or
  voice-specific meaning.
- **Passive voice** is converted when the actor matters and kept when the actor
  is unknown, immaterial, deliberately withheld, or conventional for the genre.
- **Register** is preserved. Third-person, academic, legal, and documentary
  writing is not forced into second-person marketing voice.
- **Punctuation** follows the house style you supply, and punctuation is never
  treated as evidence that a model wrote something.

## Two modes

**Findings-only audit.** Say "audit", "flag", "review", "diagnose", or "do not
rewrite" and your text comes back unchanged, alongside quoted issues split into
two tiers:

- **Clear issues** with the exact quote, why it weakens this piece, and the
  minimum correction.
- **Judgment calls** with the trade-off named, so you decide whether the trait
  is voice or slop.

Useful when the draft is a client's, a colleague's, or a named author's and you
do not have the standing to just rewrite it.

**Cleaning pass.** The default. Cleaned prose first, then a change report with
counts per category and a 50-point score.

## What it never does

- Change a fact, number, date, name, price, claim, qualifier, quotation, code,
  command, link, citation, or path.
- Invent a metric, actor, anecdote, customer, quote, or first-person
  experience. If a rewrite needs a specific the source did not supply, the gap
  is marked rather than filled.
- Say whether a human or a model wrote the text. Findings describe the prose
  and its effect only.
- Publish, post, send, commit, or overwrite anything. Cleaned prose comes back
  in the response and you decide where it lands.

## What it catches

Throat-clearing openers, emphasis crutches, business jargon, low-information
adverbs, meta-commentary, performative sincerity, vague declaratives, binary
contrasts in all eleven spellings, negative listing, dramatic fragmentation,
rhetorical setups, formulaic templates, false agency, narrator-from-a-distance
voice, responsibility-hiding passives, Wh- sentence starters, metronomic
rhythm, and lazy extremes.

`SKILL.md` carries the 25 highest-frequency offenders inline. The full sweep,
with forty-plus more entries, is in `references/kill-list.md`, meant for text
going to press, to investors, or to customers.

## Scoring

Rate 1-10 on each dimension after the pass:

| Dimension | Question |
|-----------|----------|
| Directness | Statements, not announcements? |
| Rhythm | Varied, not metronomic? |
| Trust | Respects the reader? |
| Authenticity | Sounds human? |
| Density | Anything still cuttable? |

Below 35 out of 50: revise. The verdict is advice about the prose, not a gate
on your decision to publish.

## Structure

```
voice-preserving-line-edit/
  SKILL.md                  Core instructions, rules, checklist, output contract
  references/
    kill-list.md            The full sweep, deferred until needed
  agents/
    openai.yaml             Agent interface metadata
  README.md
  LICENSE
```

## Install

**Claude Code.** Copy this folder into `.claude/skills/` in your project, or
into the user-level skills directory.

**Claude Projects.** Upload `SKILL.md` and `references/kill-list.md` to project
knowledge.

**System prompt or custom instructions.** Paste `SKILL.md`. Load
`references/kill-list.md` on demand.

## Usage

    Run a voice-preserving line edit on this README intro.
    <paste text>

    Audit this launch email for slop. Findings only, do not rewrite it.

    Line-edit this page. House style: em dashes are fine, we write in third
    person, and "platform" is our term, never "ecosystem".

Paste real numbers and names alongside the draft. Vague prose usually hides
missing facts, and a line edit cannot conjure them.

## Credit

Adapted from the suede-creator-skills collection:
<https://github.com/JasonColapietro/suede-creator-skills>

## License

MIT. See [LICENSE](LICENSE).
