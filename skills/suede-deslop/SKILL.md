---
name: suede-deslop
description: "Suede Slop Stop: Suede Labs context-aware anti-slop pass for finished prose. Find or remove generic filler, manufactured emphasis, false agency, and formulaic structure without flattening the author's voice. Use before copy, a README, an email, a social post, or a doc ships; after a long assisted-writing session; or for a findings-only slop audit. NOT FOR: writing new copy (use suede-copy); deciding whether a person or model wrote text; changing or certifying facts, which require primary evidence."
---

# Suede Slop Stop

The canonical anti-slop method for the writing stack. The existing `suede-deslop`
command and folder remain stable for compatibility; there is no second method.

## Gate policy — advisory, not blocking

Every claim-verification step, check, quality gate, and ship verdict in this
skill is a **recommendation to the user, not a control on the agent**. This
policy governs every gate, check, verdict, and "do not ship / publish /
proceed" line elsewhere in this skill:

- Run every check and report the results honestly. Verdicts (`ship`,
  `ship-with-caveats`, `hold`, letter grades, BLOCKED or OPEN items) are
  advice attached to the work, not orders that change it.
- Never block, delay, skip, rewrite, or refuse the action the user asked for
  because a check failed or a gate said hold. Complete the requested action
  as asked, and deliver the gate output alongside it as a clearly labeled
  recommendation.
- A failed gate changes what you report, never what you do.
- Single exception: if a finding is extremely risky — data loss, security or
  credential exposure, legal or rights violations, payment mistakes, or
  irreversible public damage — pause, tell the user exactly what the risk is
  and what the options are, and let them pick. Their choice is final.


Run before finished text goes public. Look for throat-clearing before the point,
inanimate things doing human work, binary contrasts that announce the insight
instead of delivering it, and rhythm that never varies. These are writing-quality
signals, not evidence of who or what wrote the text.

## When to use

- Before copy, a README, an email, a social post, or a doc ships
- After a long AI-assisted writing session
- When the text sounds fine but feels generated
- Before anything goes to press, investors, or customers
- When the user wants issues identified without a rewrite

Do NOT run on fiction, conversational replies, or internal notes where loose voice is intentional.
When the user asks for findings only, report the issues and leave the supplied
text unchanged.

---

## Before the pass

1. **Choose the deliverable.** Default to cleaned prose. Use a findings-only
   audit when the user says detect, flag, review, diagnose, or do not rewrite.
2. **Lock the source.** Preserve facts, numbers, dates, names, prices, claims,
   quotations, qualifiers, code, commands, links, citations, and paths.
3. **Lock the voice.** Preserve deliberate fragments, dry humor, technical
   vocabulary, formality, and useful rough edges. Remove a pattern only when it
   weakens this piece in this context.
4. **Read the house style.** A supplied company or author brief overrides Suede
   punctuation and register defaults.

Make the minimum effective edit. Never add anecdotes, customers, metrics,
quotes, first-person experience, or specificity that the source did not supply.

---

## The eight rules

### 1. Cut filler phrases

No throat-clearing before the point. No emphasis crutches that add weight without meaning. No adverbs doing work a specific fact should do.

The kill list, 25 highest-frequency offenders:

| Category | Kill | Fix |
|----------|------|-----|
| Opener | Here's the thing: | Start with the point |
| Opener | Let's be honest / Let's face it | Cut; say the honest thing |
| Opener | The truth is / The reality is | Cut; state it |
| Opener | It's worth noting that | Cut; note it |
| Opener | In today's fast-paced world | Cut the sentence |
| Opener | Picture this: / Imagine this: | Describe the scene directly |
| Opener | At its core / At the end of the day | Cut; make the core claim |
| Crutch | Let that sink in / Read that again | Cut; the sentence carries or it does not |
| Crutch | genuinely / truly / literally | Cut |
| Crutch | actually / really / very | Cut |
| Crutch | full stop / period (as emphasis) | Cut |
| Crutch | make no mistake | Cut |
| Jargon | leverage (as a verb) | use |
| Jargon | utilize | use |
| Jargon | delve into | cover, get into |
| Jargon | navigate (a challenge) | handle, work through |
| Jargon | landscape / ecosystem (abstract) | market, field, or the named thing |
| Jargon | journey (not travel) | process, or name the steps |
| Jargon | unlock / unleash | say what was blocked |
| Jargon | robust / seamless / powerful | name the capability or prove it |
| Jargon | elevate / empower / transform | say what changes, before and after |
| Adverb | incredibly / remarkably / surprisingly | cut, or give the number that surprises |
| Adverb | seamlessly / effortlessly | cut; show the step count |
| Adverb | fundamentally / essentially / ultimately | cut; the claim stands or it does not |
| Adverb | importantly / notably | cut; if it matters, the content shows it |

The table is the high-frequency cut. The full sweep, with forty-plus more phrases across every category, lives in [references/kill-list.md](references/kill-list.md); run it when the text goes to press, investors, or customers. Three categories the table compresses:

- **Adverbs, contextual rule.** Cut adverbs that merely intensify, soften, or
  announce importance. Keep an adverb when it carries factual, technical,
  legal, quoted, or voice-specific meaning.
- **Meta-commentary.** The piece moves; it never announces its own structure. Cut "Let me walk you through", "In this section, we'll", "As we'll see", "Plot twist:", "Hint:", "But that's another post", "X is a feature, not a bug".
- **Performative sincerity.** False intimacy and announced significance. Cut "I promise", "creeps in", "This is genuinely hard", "This is what X actually looks like", "actually matters". Show the difficulty; never claim it.

Bad: "Here's the thing: this is genuinely hard. Let that sink in."
Good: "This is hard."

---

### 2. Break formulaic structures

The patterns the model reaches for when it has nothing original to say. Each with its fix:

- **Binary contrast** ("It's not about speed. It's about precision.") | Fix: state the real claim directly. "Precision matters more than speed here."
- **"Isn't just" construction** ("This isn't just a tool, it's a platform.") | Fix: cut the setup; say what it is with one proof.
- **Negative listing** ("No setup. No config. No hassle.") | Fix: one positive sentence naming what the user does.
- **Dramatic fragment** ("One problem." / "And it worked.") | Fix: attach the fragment to the sentence it modifies.
- **Rhetorical setup** ("So what does this mean for you?" / "What if I told you...?" / "Think about it:") | Fix: delete the question; give the answer.
- **False agency** ("The data tells us" / "the decision emerges" / "the culture shifts" / "the market rewards") | Fix: name the person. "We measured." "I argue." If no one fits, use "you".
- **Triad rhythm** ("Faster. Cleaner. Better.") | Fix: two items, or a full sentence. Three-beat lists only when the count is really three.
- **Reveal fragment** ("[Noun]. That's it. That's the [thing].") | Fix: one complete sentence, no staged reveal.
- **Formulaic template** ("By the time X, I was Y." / "X that isn't Y") | Fix: drop the template; state the fact. "X is broken."
- **Permission grant** ("And that's okay.") | Fix: cut it; the reader did not ask.

Binary contrast alone has eleven spellings ("The answer isn't X. It's Y." / "It feels like X. It's actually Y." / "stops being X and starts being Y" and more); the full variant table is in [references/kill-list.md](references/kill-list.md).

Bad: "It's not about speed. It's about precision."
Good: "Precision matters more than speed here."

---

### 3. Prefer active voice when the actor matters

Name the actor when responsibility or causality matters. Keep passive voice when
the actor is unknown, immaterial, deliberately withheld, or conventional in the
technical context. Do not force a human subject into a sentence that does not
need one.

Bad: "The decision was reached after careful consideration."
Good: "The team decided after reviewing three options."

Bad: "Mistakes were made."
Good: "Name who made them."

---

### 4. Be specific

No vague declaratives. No lazy extremes. Name the specific thing.

Lazy extremes are every, always, never, everyone, everybody, nobody: false authority doing vague work. Vague declaratives announce weight without naming it: "The reasons are structural", "The stakes are high", "This is the deepest problem", "The consequences are real".

Bad: "The implications are significant."
Good: Name the implication.

Bad: "Everyone knows this."
Good: Name who knows it and what they know.

---

### 5. Put the reader in the room when the genre supports it

Specifics beat abstractions. In direct guidance, "you" often beats a vague
"people." Preserve third-person, academic, legal, or documentary register when
the source calls for it.

Bad: "Nobody designed this. It just happened."
Good: "You didn't sit down and decide to build this. It accumulated."

---

### 6. Vary rhythm

Mix sentence lengths. Two items often beat three. End paragraphs differently.
Follow the supplied house style for em dashes. For Suede-owned public copy,
replace them with commas, parentheses, colons, or periods. Do not treat
punctuation as evidence of authorship.
Suede-owned public copy also avoids promotional exclamation points; preserve
them in protected source spans or when the supplied house style calls for them.

Three consecutive sentences at the same length: break one. Every paragraph ending with a punchy one-liner: vary it. Staccato fragments stacked for effect: merge them. A question answered in the same breath: let it breathe or cut it. Hedging dressed as reassurance ("Not always. Not perfectly."): cut it.

Sentence starters count as rhythm. Wh- openers ("What makes this hard is...") read as a crutch: lead with the subject ("The constraint is..."). Paragraphs opening with "So": start with content. Sentences opening with "Look,": remove.

---

### 7. Trust the reader

State facts directly. Skip softening, justification, hand-holding. The reader is an adult.

Cut: "I want to be clear that..." / "It's important to note that..." / "As you might expect..."
Start with the content.

---

### 8. Cut quotables

If a sentence sounds like it was written to be screenshotted, rewrite it. Pull-quote prose is manufactured. Cut the performance.

---

## Pre-ship checklist

Run every item before delivering prose:

- Empty intensifiers or hedges? Cut them; preserve meaning-bearing adverbs.
- Passive voice hiding responsibility? Name the actor; preserve useful technical passive voice.
- Inanimate thing doing a human verb ("the decision emerges")? Name the person.
- Sentence starts with What/When/Where/Which/Who/Why/How? Restructure it.
- "Here's what/this/that" opener? Cut to the point.
- "Not X, it's Y" contrast? State Y directly.
- Three consecutive sentences at the same length? Break one.
- Paragraph ends punchily? Vary it.
- Em dash conflicts with the active house style? Replace it; otherwise preserve the author's punctuation.
- Vague declarative ("The implications are significant")? Name the specific implication.
- Narrator above the scene ("Nobody designed this")? Put the reader in it.
- Meta-joiner ("The rest of this piece...")? Delete. Let it move.
- Paragraph starts with "So", or a sentence starts with "Look,"? Start with the content.
- Question answered in the same breath? Let it breathe or cut it.
- Announced significance ("This is genuinely hard" / "actually matters")? Show it or cut it.
- Lazy extreme (every, always, never, everyone, nobody) making a vague claim? Name the specific.

---

## Scoring

Rate 1–10 on each dimension after the pass:

| Dimension | Question |
|-----------|----------|
| Directness | Statements, not announcements? |
| Rhythm | Varied, not metronomic? |
| Trust | Respects the reader? |
| Authenticity | Sounds human? |
| Density | Anything still cuttable? |

**Below 35/50: revise.** Don't ship it.

---

## Examples

Before: "Here's the thing — the migration wasn't just a technical challenge. It was a fundamental shift in how the team operates. No more silos. No more handoffs. No more waiting."
After: "The migration changed how the team operates: engineers now deploy their own services instead of filing tickets and waiting two days."

Before: "The implications are truly significant. This decision was reached after careful consideration, and it will ultimately transform the developer experience."
After: "The platform team chose Vite over Webpack. Local builds dropped from 90 seconds to 4."

Before: "So what does this mean for creators? It means empowerment. It means ownership. It means the landscape has fundamentally shifted."
After: "Creators now hold the registry keys. When a track sells, the split executes without a label in the loop."

Note: the specifics in these After lines came from author context. Never invent
specifics. Ask for missing material when interaction is possible; otherwise
mark the unresolved gap without manufacturing an answer.

---

## Red Flags: Stop

If you catch yourself thinking any of these, stop and correct:

- "It's just an internal note." Internal notes get pasted into public docs. Run the pass.
- "An em dash proves this was generated." Punctuation cannot establish authorship. Follow the active house style.
- "That line earned its quotability." If it sounds written to be screenshotted, it was. Rewrite it.
- "The triad has rhythm." Rhythm the reader has seen a thousand times is a tell, not a style.
- "The score is 34, close enough." Below 35 means revise. Revise.

## Boundaries

This skill edits style only. It must NOT:

- Change any fact, number, date, name, price, claim, qualifier, quotation, code,
  command, link, citation, or path.
- Infer or report whether a human or model wrote the text. Findings describe the
  prose and its effect only.
- Flatten deliberate voice traits merely because they resemble a common pattern.
- Invent a metric, actor, anecdote, customer, quote, or first-person experience.
- Verify or vouch for the truth of any claim. Flag missing support separately;
  never qualify, remove, or otherwise alter supplied factual wording during this
  style pass.
- Publish, post, send, commit, or overwrite the original file/message. Return cleaned prose in the response; the author decides where it lands.
- Decide whether the piece should ship at all: the CLEAN/REVISE verdict is about slop, not content approval.

## Output format

For a findings-only audit, return:

```text
Clear issues
- [exact quote] — [why it weakens this piece] — [minimum correction]

Judgment calls
- [exact quote] — [context or voice trade-off] — [optional correction]

Boundary: writing-quality signals do not establish authorship.
```

Do not include cleaned prose in a findings-only audit.

For a cleaning pass, return the cleaned prose first. Then append:

```
Slop Stop pass
──────────────────────────────
Filler phrases removed:      [count]
Structural patterns fixed:   [count]
Passive voice → active:      [count]
Vague declaratives cut:      [count]
Rhythm breaks added:         [count]
Em dashes removed:           [count]

Score
──────────────────────────────
Directness:   [1–10]
Rhythm:       [1–10]
Trust:        [1–10]
Authenticity: [1–10]
Density:      [1–10]
Total:        [X/50]

Verdict: [CLEAN / REVISE]
```

If total is below 35, name what is still generating the score and why it could not be resolved without more author context.

## Routing

- The text needs writing, not cleaning → /suede-copy (one surface) or /johnny-suede-write (full stack)
- The cleaned text makes claims a public audience will read → route factual
  verification to primary evidence such as the current product, live URL,
  recorded metric, or named source; report unsupported claims separately without
  changing their wording
- The text is a campaign artifact → campaign strategy gate (private Suede Labs companion, not in this pack: suede-growth)
