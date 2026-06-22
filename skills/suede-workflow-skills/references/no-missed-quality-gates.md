# No-Missed Quality Gates

Use this reference when Suede work touches public copy, visual design, design
systems, reference-site restyling, page visibility, launch packaging, or
agent-team delivery. These gates add quality pressure without replacing the
existing Suede rules for creator ownership, programmable IP, rights,
provenance, registry-backed media, royalty routing, licensing readiness, agent
commerce, mobile and product surfaces, SEO/AEO/AI EO, public claim safety, WIP
protection, and evidence handoff.

## Preservation Gate

Before adding or tightening a workflow, list the current Suede features that
must survive the edit:

- target skill trigger and description;
- Suede-specific language around rights, provenance, royalties, licensing,
  agent commerce, and creator ownership;
- product screenshots, mobile onboarding, paywall, and app-shell support
  when already present;
- SEO, AEO, AI EO, GitHub Pages, Google, Gemini, AI search, metadata, FAQ,
  schema, sourceable proof, and internal-link behavior;
- Suedify reference-site capture, token distillation, safe translation, and
  screenshot comparison behavior;
- design-system quality of life artifacts, state coverage, accessibility, and
  responsive QA;
- agent-team lanes, WIP protection, release lock, recovery, and handoff loops;
- public claim boundaries and the ban on invented metrics, partners, payouts,
  registry writes, clearance, rankings, pricing, testimonials, or release
  promises.

If an edit would weaken one of those features, stop and choose an additive
shape instead.

## Copy Gate

Run this gate before public copy is accepted.

- Cut throat-clearing, filler transitions, emphasis crutches, business jargon,
  adverbs, softeners, vague declarations, rhetorical questions, performative
  intensity, fake stakes, and meta-commentary about the writing.
- Avoid formulaic structures: binary setup lines, negative lists that define
  the product by what it is not, dramatic fragments, three-part cadence by
  reflex, obvious contrast pairs, and quote-bait lines that sound detached from
  the product.
- Prefer active voice with a human or product actor. Replace inanimate subjects
  that pretend to act with the real user, team, system, page, file, or action.
- Put the reader in the room: name the concrete artifact, state, action, risk,
  link, command, workflow, or proof that makes the claim believable.
- Do not begin most lines with `What`, `When`, `If`, `This`, or `It` when a
  direct actor and verb would be clearer.
- Keep one idea per sentence. Vary sentence length without using em dashes.
- Do not sand off Suede specificity. Preserve rights, provenance, registry,
  royalty, licensing, agent commerce, creator ownership, mobile product, and
  discoverability language when it is relevant and true.

Score meaningful public copy:

```text
Directness: /10
Rhythm: /10
Trust: /10
Specificity: /10
Authenticity: /10
Search/AI readability: /10
Density: /10
Total: /70
```

Revise below 58/70. For launch, homepage, GitHub, product listing, ambassador, or
investor-adjacent copy, aim for 62/70 or higher.

## Design Gate

Run this gate before major visual work, reusable UI, public launch surfaces,
Suedify work, product screenshot assets, or design-system passes.

- Name the subject, audience, page job, primary action, launch stage, and
  register before making visual decisions.
- Pick the register deliberately:
  - **Brand:** can carry a sharper point of view, signature image, distinctive
    type pairing, stronger color commitment, and one memorable subject-native
    move.
  - **Product:** should feel earned, efficient, state-rich, predictable, and
    compact enough for repeated work.
  - **Docs:** should favor scannability, sourceable proof, install clarity,
    durable headings, and citation-friendly structure.
- Write the physical scene: who uses this, where, under what pressure, what is
  on screen, and what they need to do next.
- Choose a color strategy before values: restrained, committed, full palette,
  or drenched. Use OKLCH when practical, tint neutrals, and make color carry
  meaning.
- Use typography as product voice: deliberate pairing, clear roles, body copy
  around 65-75 characters, hierarchy ratio of at least 1.25 between major type
  steps, letter spacing at 0 by default, and no viewport-based font scaling.
- Make the structure explain the product. Avoid lazy cards, nested cards,
  identical icon-card grids, hero-metric templates, decorative glass, gradient
  text, side-stripe card borders, stock-feeling gradient heroes, decorative
  blobs, and modal-first interaction.
- Spend boldness in one place: a rights passport, waveform ledger, provenance
  receipt, chain-of-title map, studio console, claim graph, screenshot stack, or
  another Suede-native signature. Keep surrounding UI disciplined.
- Motion must serve state or comprehension. Avoid layout-property animation,
  bounce, elastic motion, and decorative scroll effects. Respect reduced
  motion.
- Self-critique before build: name the generic default this could fall into,
  then state the concrete Suede move that prevents it.

## Design-System Gate

For a major surface or component family, scan existing source before inventing
tokens. Capture the smallest useful artifact set:

- token map for color roles, typography, spacing, radii, shadows, motion,
  z-layers, charts, statuses, and semantic states;
- component inventory for navigation, controls, cards, lists, forms, media,
  paywalls, proof modules, rights/provenance modules, loading, empty, errors,
  and permission states;
- state matrix for default, hover, focus, active, disabled, loading, empty,
  success, warning, error, offline, unauthenticated, and permission-denied
  states where relevant;
- preview gallery or reproducible screenshot contract with seeded Suede
  content;
- asset register for logos, app icons, product images, screenshots, crop rules,
  attribution, and export sizes;
- migration notes that name what old patterns remain and what not to rewrite.

Score design-system work across ten lanes:

```text
Color consistency: /10
Typography hierarchy: /10
Spacing rhythm: /10
Component consistency: /10
Responsive behavior: /10
Dark/light behavior: /10
Motion restraint: /10
Accessibility: /10
Information density: /10
Polish: /10
Total: /100
```

Use the score to direct fixes, not as a vanity metric.

## Visual QA Gate

For source-to-implementation comparison, use the source visual target and the
rendered implementation together in the same comparison pass. Do not compare
one from memory.

- Match viewport, device, state, theme, auth state, route, content, seeded data,
  and interaction state.
- Capture full-view evidence first, then focused-region evidence for typography,
  spacing, icons, logos, imagery, charts, buttons, forms, and hard-to-read
  details.
- Compare these fidelity surfaces: typography, spacing/layout, colors/tokens,
  image and asset fidelity, copy/content, interaction states, accessibility,
  responsive behavior, and motion where relevant.
- Treat replacement of target assets, logos, illustrations, icons, product
  imagery, or screenshot content with CSS shapes, emoji, placeholder divs,
  improvised SVGs, or text approximations as a blocking defect unless the user
  explicitly asked for that substitution.
- Save the QA artifact named by the relevant skill, usually
  `suede-visual-qa.md` or `suedify-visual-qa.md`, with source truth,
  implementation evidence, viewport/state, findings, patches, caveats, and
  `final result: passed` or `final result: blocked`.

Finding format:

```text
Severity:
Location:
Evidence:
Impact:
Fix:
```

## Agent-Team Loop Gate

Use the smallest useful loop, but make quality measurable:

1. Scout current truth, WIP, source files, live/rendered surfaces, and no-touch
   boundaries.
2. Plan atomic lanes with file ownership and observable acceptance criteria.
3. Execute only non-colliding lanes in parallel.
4. Review with at least two lenses when stakes are high: one for intended
   behavior, one for failure modes.
5. Verify the done signal with commands, screenshots, live/API readback, or
   saved QA artifacts.
6. If the same failure repeats, freeze broad work, isolate the failing unit,
   reduce scope, patch only that gap, and rerun the failed check.
7. End with evidence: changed files, commands, screenshots or URLs, caveats,
   status, and exact next action.
