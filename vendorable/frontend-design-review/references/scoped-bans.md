# Scoped Bans And Exceptions

What is banned, where the ban applies, and the narrow cases allowed to break it.
Check this before arguing an exception.

These are not blanket bans. Keep or recreate a pattern when source fidelity,
platform convention, accessibility, a confirmed brand system, or a direct user
request makes it the right choice. When making an exception, name why it is
earned.

Rewrite the element if any of these appear as a lazy default.

## Scaffolding And Typography Devices

**Tiny uppercase tracked eyebrow above every section.**
BEFORE: a small all-caps kicker ("ABOUT", "PROCESS", "PRICING") sitting above
every section heading, page after page.
AFTER: vary the cadence, or drop the kicker and let the heading carry weight. One
deliberate kicker as a named brand device is voice; one on every section is AI
grammar.

**Numbered section markers as default scaffolding (01 / 02 / 03).**
BEFORE: `01 About`, `02 Process`, `03 Pricing` stamped above every section
regardless of content.
AFTER: reserve numbering for a real ordered sequence (an actual three-step flow,
a timeline) where the order carries information. Elsewhere, drop it.

**Identical icon-card grids as the main page structure.**
BEFORE: a 3x2 grid of cards, each with an icon, a title, and a one-line
description.
AFTER: a task-driven layout where each row or section maps to a specific user
action, not a product category.

**Em dashes in UI or marketing copy.**
BEFORE: "Ship faster. Own every decision."
AFTER: use a period, a colon, or a comma. If the clause needs an em dash,
restructure the sentence.

## Surface And Color Treatments

**Gradient text.**
BEFORE: `-webkit-background-clip: text` rainbow or metallic effect on headlines.
AFTER: a single high-contrast headline at full weight with an accent word in a
solid color, or a single-hue gradient at low chroma (essentially a slight
lightness shift).

**Decorative glass panels (blur plus translucent background).**
BEFORE: a `backdrop-filter: blur(20px)` card floating over a gradient background.
AFTER: an opaque surface at the correct elevation token, with a 1px border for
definition.

**Colored side-stripe borders on cards, alerts, or list items.**
BEFORE: a card with a 4px left border in `--color-warning` indicating status.
AFTER: an icon plus label in the semantic color inside the card, or a
top-of-card banner strip that spans the full width and carries text.

**The ghost-card pattern (thin border plus soft wide shadow, stacked).**
BEFORE: `border: 1px solid` combined with `box-shadow: 0 16px+ blur` on the same
card or button as decoration.
AFTER: pick one. A defined border at the brand color, or a shadow no wider than
8px blur at the correct elevation token. Never both as ornament.

**Over-rounded corners.**
BEFORE: `border-radius: 32px` or higher on cards, sections, or inputs.
AFTER: cap cards and inputs at a 12-16px radius. Full-pill radius is fine for
tags and buttons only.

**Repeating-linear-gradient stripe backgrounds.**
BEFORE: diagonal stripe patterns in a section or body background via
`repeating-linear-gradient`.
AFTER: a real art-direction choice: a solid surface, a noise texture, or a
concrete product artifact.

**Decorative orbs, bokeh blobs, generic gradient backgrounds.**
BEFORE: three radial gradients at 30% opacity behind the hero.
AFTER: a concrete art-direction choice: a noise texture, a geometric system, a
real product screenshot, an illustrated scene, or a typographic lock-up that IS
the background.

**Cream, sand, or beige as the default body background.**
BEFORE: a near-white warm-tinted background (OKLCH lightness 0.84-0.97, chroma
below 0.06, hue 40-100) used as the safe default for a "warm" or "editorial"
brief, under a name like `--paper`, `--cream`, `--sand`, `--linen`, or
`--ivory`.
AFTER: pick a saturated brand color as the body, a true off-white at chroma 0
(or tinted toward the brand's own hue, not toward warmth by default), or a
darker tinted neutral that reads as this brand's own. Carry warmth through
accent color, typography, and imagery instead. Same chroma-tinting discipline as
the Color Strategy Axis, applied to the one background choice teams default on
without thinking.

## Content Integrity And Structure

**The hero-metric template (big number, tiny label, support stats, gradient
accent).**
BEFORE: `$2.4M` at 80px weight-900 with "Revenue generated" in 12px below it.
AFTER: a metric placed inside a real workflow context. The payout total shown
inside the ledger column it belongs to, not isolated as a hero number.

**Modal as the first answer to every interaction.**
BEFORE: every "view details" opens a modal.
AFTER: inline expansion, a side panel, or a dedicated route. Modals reserved for
destructive confirmation or focused isolated actions.

**Centered hero copy over a stock-feeling gradient with no real product
artifact.**
BEFORE: a three-word promise centered on a dark gradient, with no visual content
below.
AFTER: a hero containing a real product artifact (a partial registry UI, a live
data panel, a receipt, an actual screen) with copy anchored to it.

**Fake metrics, fake testimonials, fake partner claims.**
No exception. Remove and replace with one of: a real statistic with a source
note, a placeholder carrying a `[NEEDS REAL DATA]` flag, or a structural element
that does not depend on a specific number.

**Hand-drawn or sketchy SVG illustrations.**
BEFORE: crude wavy-line doodles, `feTurbulence`/`feDisplacementMap` paper-grain
filters, or a 5-30 path sketch standing in for a real subject.
AFTER: ship a real asset (a photo, a product screenshot, a properly illustrated
scene) or ship no illustration at all.
