# S-Tier

### The Builder's Book Behind the Suede Skills

By Jason Colapietro, Suede Labs AI

Companion to [suede-creator-skills](https://github.com/JasonColapietro/suede-creator-skills),
a 74-skill open-source pack for Claude Code and OpenAI Codex.

The `suede-graph-flo-xr` operation graph and thought-state model discussed in this book
adapt Graph of Thoughts by ETH Zurich. Citation: Maciej Besta, Nils Blach, Ales
Kubicek, Robert Gerstenberger, Lukas Gianinazzi, Joanna Gajda, Tomasz Lehmann,
Michał Podstawski, Hubert Niewiadomski, Piotr Nyczyk, and Torsten Hoefler
(2024), "Graph of Thoughts: Solving Elaborate Problems with Large Language
Models," _Proceedings of the AAAI Conference on Artificial Intelligence_,
38(16), 17682-17690, https://doi.org/10.1609/aaai.v38i16.29720.

---

## Why this book exists

The pack came out of a specific irritation. A solo founder kept hiring marketing
firms for his own products and kept watching them skip fundamentals that take
twenty minutes: metadata that never got written, a signup flow nobody measured,
a launch page with no proof on it. The fix was not a better vendor. The fix was
writing the procedure down once, in a form an agent could run, and never
re-explaining it.

That is what a skill is. A folder, a markdown file, a procedure with a defined
output. Seventy-four public skills, readable before you install them and editable
after.

This book is the reasoning underneath. Half of it is how the machinery works:
progressive disclosure, description routing, agent lanes, grade cards, evidence
gates. The other half is the part the machinery cannot supply, which is judgment
about what to build, when to stop, and which of your habits are quietly keeping
you at the tier you are on.

## Who it is for

You already use an agent daily. You write decent prompts. You have noticed that
output volume went up and the ceiling did not move much. That gap is the subject.

You do not need the pack installed to read this. Every chapter names real files
in a public repo, so you can check the claims. Checking claims is most of what
the book argues for, so please do.

## How to read it

Straight through the first time. Parts I and II establish the vocabulary the rest
of the book leans on, and Chapter 11 will not land without them.

- **Part I. The Machinery** (Chapters 1 to 3): what a skill is, how it is built,
  how an agent decides to load it.
- **Part II. The Operating System** (Chapters 4 to 6): outcome-bound work, agent
  lanes and worker fleets, and the verification discipline the whole thing rests
  on.
- **Part III. The Craft Lanes** (Chapters 7 to 10): grading code, treating design
  and copy as systems, distribution, and the last mile into a store or a real
  account.
- **Part IV. Becoming S-Tier** (Chapters 11 to 14): the ladder, the judgment
  layer, writing your own skills, and a ninety-day plan.

Then the appendices: a skill index organized by what you are trying to do, and
the operating rules the book keeps returning to, collected in one page.

## Four ideas the book repeats

**Progressive disclosure.** An agent reads every skill's description and almost
none of their bodies. The description is the router. The body is the payload,
loaded only on a match. This is why a pack can grow to seventy-four skills
without drowning the context window, and why a badly written description is a
broken feature rather than a cosmetic one.

**Evidence or it did not ship.** A claim without command output, an HTTP status,
a diff, or a rendered screenshot is a guess wearing a confident tone. Agents are
extremely good at the confident tone.

**Bring a decision, not a workshop.** Compute is authorized and abundant. Your
attention is neither. Work that hands you five options and asks you to pick has
usually just moved the job back to you.

**The ladder.** C-tier builders produce output. B-tier produce working output.
A-tier produce verified output. S-tier build systems that keep producing verified
output when they are not in the room.

## A note on the prose

This repo ships `suede-deslop`, a skill that strips AI writing patterns from text
before it goes public: filler openers, manufactured enthusiasm, false agency,
formulaic contrast, metronomic rhythm, and em dashes. It would be strange to ship
that skill and then publish a book that trips every rule in it.

So the book was written under those constraints. The prose carries no em dashes.
Quoted material from the repo keeps its own punctuation, because changing a
quotation to fit a style rule is the kind of small dishonesty this pack exists to
catch. If you find a violation anywhere else, the file to check is
`skills/suede-deslop/SKILL.md`.

## License and credit

Original work in the pack is MIT licensed. Adapted components retain their
upstream notices beside the source. Forty of the marketing and growth skills are
adapted from [marketingskills](https://github.com/coreyhaines31/marketingskills)
by Corey Haines under the MIT License. That project is the origin of the material,
and the credit belongs there. The adapted Graph of Thoughts workflow carries
its upstream BSD terms at `skills/suede-graph-flo-xr/LICENSE.graph-of-thoughts-BSD.txt`.
Full notice: `NOTICE.md`.
