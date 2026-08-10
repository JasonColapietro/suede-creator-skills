# Chapter 8. Design and Copy Are Engineering

Someone picks a hex code at 1am. It looks right against the one screen they have
open. Three weeks later that color exists in nine files, four of them slightly
different, and nobody can say what it means. It is not the accent, it is not the
warning color, it is just there, and every new component inherits the confusion.

This is the normal failure mode of design work, and it has nothing to do with
taste. The person who picked that color may have excellent taste. They had no
system, so their taste evaporated the moment they closed the file.

## A named palette is a set of decisions with memory

This repo's own `DESIGN.md` carries eight color roles, and the roles are the
point:

| Role | Value |
|---|---|
| Background | `#080808` |
| Surface | `#111111` |
| Card | `#161616` |
| Border | `#222222` |
| Primary text | `#f0ece4` |
| Secondary text | `#888880` |
| Gold | `#c8a96e` |
| Risk red | `#8b1a1a` |

Three near-blacks that differ by eight points of lightness apiece, which is
what gives the surface stack its depth without a single shadow. Off-white text
at `#f0ece4` rather than `#fff`, because pure white on near-black is a glare
problem, not a contrast solution. Secondary text at `#888880` carrying a faint
warm tint, chosen to stay AA-readable rather than to look softer.

Then the two that carry meaning. Gold at `#c8a96e` is the brand accent and the
action emphasis. Risk red at `#8b1a1a` is reserved for failure, risk, and strict
grading accents only. When you see red on a Suede surface, something has gone
wrong or is about to. It never appears because a section needed variety.

The rule that keeps the whole thing from collapsing sits in the spacing section,
almost as an aside: **gold is used as a decision, not spread evenly across every
surface.** An accent that appears everywhere stops being an accent and becomes a
coating. The color is still there, the meaning is gone, and you have to invent a
second accent to say what the first one used to say.

Naming does the work. `--color-risk` cannot be applied to a decorative divider
without someone noticing they wrote something false. `#8b1a1a` can.

## Numbers instead of opinions

"Make it more readable" is a preference. Any of the following is a check:

Body text on a dark background needs a minimum 7:1 contrast ratio, secondary
text 4.5:1, disabled text 3:1. Primary actions and mobile controls provide at
least a 44px touch target. Body copy stays between 65 and 75 characters per line
at 1.6 to 1.7 line-height. Major type steps keep at least a 1.25 ratio between
them. Cards and inputs cap at a 12 to 16px corner radius, with full-pill radius
allowed for tags and buttons only. Animations move `transform` and `opacity`,
never width, height, top, left, or margin. Exit curves run 220 to 280ms on
`cubic-bezier(0.16, 1, 0.3, 1)`, list entrances stagger 40ms per item and clamp
at six, and the whole reveal sequence caps at 480ms.

And the one that outranks the rest: **content is visible by default.** Motion may
translate or soften content into place, but it must never gate visibility. A
scroll-reveal that leaves text invisible when the observer does not fire is not
a polish choice. It is a page that failed to render, dressed as an animation.

None of these numbers is sacred, and a different product would pick different
ones. What matters is that each is falsifiable. Two people can disagree about
whether a screen feels cramped forever. They cannot disagree about whether a
button is 44px.

The design skill also scores whole systems on ten dimensions out of 100: color
consistency, typography hierarchy, spacing rhythm, component consistency,
responsive behavior, dark and light behavior, motion restraint, accessibility,
information density, polish. Below 70 the system is failing, and the instruction
is to fix the two lowest dimensions before styling anything new on that surface.
Any single dimension at 4 or below is a P1 finding. Same principle as the code
grader in the last chapter: a number forces a decision that a paragraph of notes
lets you defer.

## Grade the render, not the stylesheet

The most expensive habit in agent-assisted design is judging CSS by reading it.
The skill's red-flag list opens with the exact thought that precedes the mistake:
"The code reads right, so it will render right." Render it. Screenshots beat code
inspection.

Minimum evidence is a desktop capture at 1280px and a mobile capture at 390px,
via `npx playwright screenshot <url> --viewport-size=1280,900 desktop.png` or
whatever your environment provides. When there is a source visual to match, the
comparison happens in the same pass, never from memory, and it writes
`visual-qa-report.md` with the source path, the implementation path, viewport
and state, the findings by severity, and a final line that reads `passed` or
`blocked`.

Two of the red flags are worth quoting because they are the ones that catch
experienced people. "This change is too small for visual QA" precedes the
one-line CSS change that broke mobile nav. "I remember what the reference looks
like" precedes the handoff where the implementation was 20px off in a direction
nobody could name afterward.

The chapter-1 rule holds here without modification. A design claim without a
screenshot is a guess about pixels.

## Copy has the same shape

`suede-copy` builds a page on a fixed spine: hero that names the outcome,
subhead that adds audience and proof, primary CTA, proof (files, scripts,
screenshots, live routes, commands), how it works in three or four steps each
with a verb and a result, a safety section stating what the workflow does not
claim, an FAQ, and a final CTA with less friction than the first.

Its tests are as concrete as the contrast ratios. The competitor-swap test: put
a competitor's name in your headline, and if it still reads true, the headline
is not specific enough. The 3-word test for CTAs: describe what happens after
the click in three words, and if you cannot, the button is too vague. "Get
started" fails both. "Register your first release" passes both.

Copy carries its own score, seven dimensions out of 70, with revision required
below 58 and 62 required for a public launch, homepage, GitHub, App Store, or
investor-adjacent surface. Same enforcement pattern, different units.

## The uncomfortable part

Generated prose reads fine sentence by sentence and hollow paragraph by
paragraph. That is what makes it hard to catch. Each individual line is
grammatical, confident, and on topic. Read four of them together and you notice
that nothing was actually claimed.

`suede-deslop` exists for that gap, and it is a merged kill list rather than a
vibe check. Twenty-five highest-frequency offenders sit in a table in the skill
body with a replacement for each, and forty-plus more live in
`references/kill-list.md` for anything going to press, investors, or customers.
Eight rules govern the pass, and a five-dimension score (directness, rhythm,
trust, authenticity, density) gates the result at 35 out of 50. Below 35, revise.
The red flags include the exact rationalization: "The score is 34, close enough."
Below 35 means revise.

The tells, honestly listed:

**Em dashes everywhere.** The single highest-signal marker in current AI prose.
The rule in the skill is absolute, with the anticipated objection pre-refused:
"The em dash is stylistic here." No em dashes, anywhere, ever.

**False agency.** "The data tells us." "The decision emerges." "The culture
shifts." "The market rewards provenance." Inanimate things doing human work, so
that no one has to be named as the person who measured, decided, or argued. The
fix is to name the actor or use "you."

**Formulaic contrast.** "It's not about speed. It's about precision." The binary
setup announces that an insight is coming instead of delivering one, and the
skill catalogs eleven separate spellings of it, from "The answer isn't X. It's
Y." to "stops being X and starts being Y." Adjacent offenders: the triad rhythm
("Faster. Cleaner. Better."), the reveal fragment ("That's it. That's the
thing."), and the permission grant ("And that's okay.").

**Metronomic rhythm.** Three consecutive sentences at the same length. Every
paragraph landing on a punchy one-liner. The prose has a pulse you can set a
watch to, which is what happens when nothing is being worked out on the page.

This book was written under those bans. No em dashes appear in it, the triads
were cut, and every paragraph that ended too neatly got a longer sentence
appended until it stopped sounding like a slogan. Whether that produced better
prose is yours to judge. It did produce prose that can be checked, which is a
different property from being good and a necessary one if you want the quality
to survive contact with an agent, a deadline, and a bad night.

One boundary matters and the skill is strict about it: deslop edits style only.
It never changes a fact, a number, a date, a name, or a price, and when a rewrite
needs a specific the source did not contain, it inserts `[AUTHOR: supply X]`
rather than inventing one. Style passes that quietly improve your statistics are
how false claims enter a public page wearing better sentences.

## The standard

Every rule in this chapter started as somebody's preference. The 44px target,
the 65 to 75 character measure, the reserved red, the ban on em dashes: none of
them descended from first principles. Someone made a call.

The difference is that the call got written down with a number attached, so it
can be applied by a person who was not in the room, enforced by a validator, and
argued with on the merits when it turns out to be wrong. That is the whole
transformation, and it is available for any part of your work you currently
handle by feel.

Taste you cannot write down is a preference. Taste you can write down is a
system.

### The move

Take the one visual or verbal judgment you make most often by feel, write it as a
number or a named token in your repo's `DESIGN.md`, and apply it to the next
three things you ship.
