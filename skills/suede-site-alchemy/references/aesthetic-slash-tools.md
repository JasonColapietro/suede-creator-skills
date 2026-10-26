# Aesthetic Slash Tools

These are named design moves for Suede AI Site Alchemy. They are not shell
commands. Use them to structure notes, edits, or a short critique.

## Default stack

Use this order for a fast polish pass:

1. `/vibe-scan` - name the current feeling and the feeling the page should sell.
2. `/hero-voltage` - make the first viewport impossible to misunderstand.
3. `/offer-spine` - lock the page to one promise, one buyer, one action.
4. `/trust-lacquer` - turn trust from decoration into a conversion argument.
5. `/cta-magnet` - make the next click feel obvious and worth it.
6. `/mobile-seduction` - make the small-screen version feel composed, not
   collapsed.
7. `/ship-polish` - verify links, responsiveness, copy fit, and live behavior.

## Core Read

`/vibe-scan`
: Name the current feeling in one sentence, then name the desired feeling. Be
specific: "credible but sleepy" is useful; "needs polish" is not.

`/first-frame`
: Inspect the first viewport only. The brand, offer, proof, and next action
should be legible without scrolling.

`/desire-line`
: Trace the emotional path from first glance to click. Remove sections that do
not increase want, trust, urgency, or clarity.

## Offer And Copy

`/hero-voltage`
: Rewrite the hero until it has a sharp noun, a buyer-visible outcome, and one
clean CTA. Kill decorative cleverness that hides the offer.

`/offer-spine`
: Reduce the page to one buyer, one pain, one transformation, one proof point,
and one action.

`/cta-magnet`
: Make every CTA say what the visitor gets. Replace weak labels like "Learn
more" with concrete actions such as "Grade my brand" or "Build the page."

`/objection-burn`
: Add or sharpen the section that handles the reason a smart buyer hesitates:
cost, effort, trust, time, risk, or "will this look like us?"

## Visual System

`/palette-pressure`
: Push color toward richer contrast and clearer hierarchy without turning the
page into one hue. Preserve existing tokens when the repo has them.

`/type-chemistry`
: Tune headline, body, mono accents, and button text so they feel intentional
together. No viewport-width font scaling.

`/section-rhythm`
: Balance dense proof with breathing room. Alternate momentum, evidence, and
decision sections so the page does not feel like a wall of cards.

`/trust-lacquer`
: Convert trust marks, stats, logos, testimonials, and security claims into a
clear argument. Do not fabricate proof.

`/console-moment`
: For Suede AI technical/product surfaces, add one inspectable product-style
moment: terminal, status rail, audit result, campaign ledger, asset passport,
or live workflow card.

## Growth Engine

`/search-guard`
: Before shipping conversion edits, confirm they kept the title, meta
description, H1, answer-first opening, schema, and internal links that
`suede-seo-audit` or `suede-ai-seo` set. Conversion copy that buries the direct
answer or drops a question heading costs search visibility; route any new
search work to those skills.

`/visitor-intent`
: Surface what the buyer is doing next: grade the site, post a campaign, build
a page, start the app workflow, or book a demo.

`/proof-to-pipeline`
: Tie content, campaign output, landing pages, visitor signals, CRM sync, and
follow-up into one growth loop.

## Delivery

`/mobile-seduction`
: Make the mobile page feel designed, not merely stacked. Check line length,
button fit, header density, image crop, and section order.

`/motion-restraint`
: Use motion only to clarify state or add premium feel. Respect reduced motion.
Do not mask weak hierarchy with animation.

`/link-sweep`
: Click every CTA and nav item in local preview. Replace or remove dead routes.

`/ship-polish`
: Run formatting/check commands, browser QA, desktop/mobile screenshots when
needed, and live verification before claiming anything public.

## Premium by surface

Use with Workflow step 7 in SKILL.md, only where a friction-audit finding names
a conversion penalty. Token, type, color, or restyle work routes to
`suede-design`. For each surface type, "premium" means:

- **Hero**: one dominant type weight, one color for the CTA, nothing competing at the same visual size.
- **Social proof sections**: real photos over stock, real numbers over vague claims, name + title + company over anonymous quotes.
- **Pricing/offer sections**: generous whitespace, price isolated in visual hierarchy, guarantee text printed adjacent to CTA not buried in footer.
- **Mobile**: readable type, WCAG-compliant target size/spacing, tested CTA
  discovery, text scaling, and no unintended horizontal scroll.
- **Motion**: motion clarifies state, respects reduced-motion settings, and
  does not block reading or interaction. Choose duration from context and
  test it rather than enforcing one universal threshold.

Operate inside the existing color and type system. Introduce a new visual choice only when the current system has a direct conversion penalty.
