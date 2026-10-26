# CRO Frameworks

Reference material for suede-site-alchemy, read at the step SKILL.md names:
funnel stages (Funnel Analysis), mobile and accessibility checks (Friction Audit and mobile QA), candidate
hypotheses (a vague "make it convert better" brief), the social proof framework
with placement hypotheses, and the proof-type table. The proof-verifiability
rule, pricing, and urgency rules stay in SKILL.md and
`pricing-and-urgency.md`.

## Funnel stages

**TOFU (Top of Funnel: Awareness)**
Reader: doesn't know about the product yet. Needs: problem education, category definition, credibility signal.
Copy job: make the problem vivid, not the solution. Don't ask for commitment.
CTA: download, read, explore, learn.

**MOFU (Middle of Funnel: Consideration)**
Reader: aware of the problem, comparing solutions. Needs: differentiation, proof, objection handling.
Copy job: show why THIS solution, not just any solution. Comparison content, case studies, deep dives.
CTA: demo, trial, detailed docs, comparison guide.

**BOFU (Bottom of Funnel: Decision)**
Reader: ready to buy, looking for permission to pull the trigger. Needs: risk reduction, guarantee, testimonials, pricing clarity.
Copy job: remove friction and doubt. Urgency if genuine, guarantee if real, social proof from peers.
CTA: start now, get started, buy, talk to sales.

## Mobile and accessibility checks

Required for every public page.

- Target size: meet WCAG 2.2 target-size requirements. Use at least 24×24 CSS
  pixels or compliant spacing for the minimum criterion; treat 44×44 as an
  enhanced house target, not a universal pass/fail rule.
- Text and zoom: test browser zoom, text scaling, reflow, and form focus on real
  mobile browsers. Do not disable pinch zoom to preserve a layout.
- CTA visibility: capture the first viewport and task path at representative
  device sizes. Test placement instead of assuming a fixed fold percentage or
  one universal thumb zone.
- Forms: request only data needed for the stated task, explain why sensitive
  data is needed, and measure field-level abandonment before attributing a
  numeric cost to any field.
- Overflow: test at narrow widths and large text. Fix the element causing
  horizontal overflow; do not conceal the defect with blanket
  `overflow-x: hidden`.

## Candidate Hypotheses

When the brief is only "make it convert better," inspect these common surfaces.
They are prompts for diagnosis, not a ranked list of guaranteed quick wins:

1. **Broken paths and measurement**: repair dead CTAs, validation traps, lost
   state, and missing or duplicate conversion events first.
2. **Hero clarity**: test a concrete buyer, outcome, and next action against the
   current version without introducing an unsupported promise.
3. **CTA specificity**: test an action-and-outcome label against a generic label.
4. **Proof relevance**: place verified proof near the claim or objection it
   supports; do not assume one fixed pixel distance or section.
5. **Form necessity**: remove or defer a field only when downstream operations,
   security, legal, and qualification needs still hold.
6. **Navigation focus**: test hierarchy and visual weight. Do not remove routes
   required for trust, accessibility, consent, or task completion.
7. **Pricing presentation**: test comprehension, total-cost clarity, plan fit,
   and cancellation terms; do not presume a pricing order or decoy wins.
8. **Mobile task path**: make the primary action discoverable without a sticky
   control obscuring content, consent, or platform UI.
9. **Image-copy alignment**: verify the visual demonstrates the same product,
   audience, and outcome as the copy.
10. **Performance**: measure field Core Web Vitals and key task latency; fix a
    confirmed bottleneck and monitor conversion and experience guardrails.

Prioritize by evidence strength, affected traffic, decision value, effort, and
risk. If impact is unknown, say so and design the measurement that will resolve
it.

## Social Proof Framework

Match proof to the claim or objection it can actually support. Placement is a
testable design choice, not a universal conversion rule.

Use the proof-type table below when you need to know which type answers which
objection, with examples, before choosing what proof to ask the client for.
Skip it when the page's proof is already chosen.

**Placement hypotheses:**
- Put peer testimony near the relevant audience or objection.
- Put case-study metrics where the methodology and source can be inspected.
- Put scale evidence near a scale claim, if scale matters to the decision.
- Put endorsements beside the claim they endorse and disclose material ties.
- Put certification or security evidence where a visitor assesses that risk.

Choose placement from user research and page context, then verify it with
usability evidence or a pre-registered experiment when the decision matters.


## Proof types and when to use them

| Type | Best for | Example |
|---|---|---|
| Peer testimonials | Emotional objections ("will this work for me?") | Quote from someone with the same job title or problem |
| Case studies with metrics | ROI objections ("is this worth it?") | "Company X increased Y by Z% in N weeks" |
| Social numbers | Scale objections ("do enough people use this?") | "10,000+ creators", "4.9★ from 2,300 reviews" |
| Expert endorsements | Authority objections ("who says this is legit?") | Industry name, publication, or credential |
| Certifications / trust marks | Trust objections ("is this safe/legit?") | SOC 2, GDPR, security badges, app store ratings |

Every entry in this table is subject to the proof-verifiability rule in
SKILL.md: if the claim cannot be verified as written, it does not ship,
regardless of which type it is.
