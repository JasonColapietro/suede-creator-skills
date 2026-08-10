# S-Tier: The Builder's Book Behind the Suede Skills

A book about how agent skills actually work and how a person becomes an
exceptional builder using them. Companion to the 71-skill
[suede-creator-skills](https://github.com/JasonColapietro/suede-creator-skills)
pack, and readable without installing it.

Roughly 29,000 words. Every claim points at a file in this repo, so you can
check it.

Read it in one file: [`BOOK.md`](BOOK.md). Rebuild that file with
`node scripts/build-book.mjs`.

## Contents

[Front matter](00-front-matter.md) — why the book exists, how to read it, and the
four ideas it repeats.

### Part I. The Machinery

1. [The Competence Gap](01-the-competence-gap.md) — why a capable model plus a
   vague prompt produces confident mediocrity, and why the fix is procedure.
2. [Anatomy of a Skill](02-anatomy-of-a-skill.md) — a real `SKILL.md` taken apart:
   frontmatter, body, references, scripts, and the advisory-gate policy.
3. [The Description Contract](03-the-description-contract.md) — routing. Trigger
   words, `NOT FOR` clauses, overlapping descriptions, and dead routes.

### Part II. The Operating System

4. [Full Send](04-full-send.md) — outcome-bound work, the mission freeze, useful
   lanes versus process theater.
5. [Lanes, Fleets, and Collisions](05-lanes-fleets-and-collisions.md) —
   multi-agent work that is not theater, and what a fan-out actually costs.
6. [Evidence or It Did Not Ship](06-evidence-or-it-didnt-ship.md) — the
   verification discipline the rest of the book rests on.

### Part III. The Craft Lanes

7. [Grading Your Own Work](07-grading-your-own-work.md) — seven lanes, instant-F
   triggers, and learning to predict the grade before you run it.
8. [Design and Copy Are Engineering](08-design-and-copy-are-engineering.md) —
   tokens, numeric thresholds, and the anti-slop gate.
9. [Getting Found](09-getting-found.md) — distribution as an engineering surface,
   from ranking to being cited.
10. [Shipping Into the Real World](10-shipping-into-the-real-world.md) — the last
    mile: app stores, launch packaging, and a procedure that recovered $448.31
    outside a repo.

### Part IV. Becoming S-Tier

11. [The S-Tier Ladder](11-the-s-tier-ladder.md) — five tiers by observable
    behavior, with a self-assessment most readers will fail one rung high.
12. [Taste, Judgment, and Knowing When to Stop](12-taste-judgment-and-stopping.md)
    — the layer no procedure supplies.
13. [Write Your Own](13-write-your-own.md) — authoring skills, and linting an
    estate.
14. [The First Ninety Days](14-the-first-ninety-days.md) — a real practice plan,
    and the close.

### Appendices

- [A. The Skill Index, by Intent](A1-skill-index.md) — all 71 skills, grouped by
  what you are trying to do.
- [B. The Rules, on One Page](A2-the-rules.md) — 29 rules, compressed.

## Notes

- [`STYLE.md`](STYLE.md) is the brief the book was written against. It bans em
  dashes, filler openers, manufactured enthusiasm, and fabricated statistics,
  which is the same standard `skills/suede-deslop/SKILL.md` enforces. Quoted
  repo material keeps its own punctuation.
- Skill counts in the prose are guarded by `scripts/validate-skill-pack.mjs`, so
  a chapter that goes stale fails the same way a stale meta tag does.
