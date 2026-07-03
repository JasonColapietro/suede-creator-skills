# Suedify Playbook: Moves, Capture Detail, And DESIGN.md Template

Used by johnny-suede-design Lane B. Read when running a reference → target restyle. The lane's inputs, workflow order, fidelity rules, and ship gate live in SKILL.md; the move-by-move detail and output template live here.

## Suedify Moves

- **Style Fingerprint:** Capture the reference's grid, section rhythm, nav behavior, typography, color roles, imagery, motion, density, and responsive breakpoints. Required fields: (1) color strategy axis — Restrained / Committed / Full palette / Drenched; (2) aesthetic tone — refined minimal / editorial / brutalist / retro-technical / organic / maximalist / luxury refined / product-utilitarian; (3) unforgettable factor — the one design decision someone recalls after closing the tab; (4) font pairing analysis — identify the personality font (headlines/display, carries brand character) and the utility font (body/UI, optimized for readability), recording for each: name, weight range in use, optical size used at, and one sentence on why the pairing works (what contrast or tension creates the system). Example: "PP Neue Montreal (personality: geometric, confident, slightly wide) paired with Inter (utility: neutral, familiar, screen-optimized) — contrast is personality vs. disappearance."
- **Token Distiller:** Produce a token table with these rows: `--color-bg`, `--color-surface`, `--color-text-primary`, `--color-text-secondary`, `--color-accent`, `--color-accent-hover`, `--color-border`, `--font-personality` (with reason it works), `--font-utility` (with reason it pairs), `--text-base`, `--text-scale-ratio`, `--radius-sm/md/lg`, `--shadow-card`, `--shadow-elevated`, `--motion-fast`, `--motion-base`, `--motion-slow`, `--motion-easing`. Mark each token ADOPTED, ADAPTED (modified to fit target brand), or REJECTED (with reason). Output as a CSS custom properties block ready to drop into `:root {}`.
- **Hero Lift:** Rebuild the first viewport so the target inherits the reference's hierarchy, pacing, media treatment, and CTA emphasis without stealing copy or assets.
- **Section Rhythm:** Map the reference's page cadence into target sections — bands, reveals, product blocks, proof, comparison, closing CTA.
- **Voice Fingerprint:** Scrape 3–5 sentences from the reference's hero, subhead, and primary CTA. Record: (1) vocabulary register on Technical–Casual and Functional–Aspirational axes, (2) median sentence word count, (3) person/stance (second-person imperative / first-person brand / third-person observer), (4) claim type (feature-list / outcome-promise / identity-statement / provocative-question), (5) three words that recur or feel distinctly theirs. Output a voice brief: four parameters + three vocabulary anchors. Feeds Copy Reframe.
- **Copy Reframe:** Apply the four voice parameters to target copy. Strip phrases that appear in 80% of SaaS sites: "powerful," "seamlessly," "effortless," "elevate your," "next-level," and any sentence beginning with "Whether you're."
- **Asset Swap:** Replace reference assets with target-owned product, logo, creator, media, or generated bitmap assets that serve the same visual role.
- **Motion Match:** Extract easing curves (cubic-bezier or named tokens), duration ranges (fast/base/slow in ms), stagger patterns, and scroll-trigger thresholds. Classify the reference's motion character: Snappy (under 200ms, tight easing), Considered (200–500ms, ease-out or spring), or Cinematic (500ms+, dramatic reveals). Implement with `transition` / `@keyframes` / `IntersectionObserver`. Always include a `prefers-reduced-motion` override.
- **Responsive Fit:** Make desktop, tablet, and mobile carry the same design idea instead of collapsing into a generic stack.
- **Proof Stack:** Adapt the reference's trust structure into truthful target proof, links, product evidence, docs, screenshots, or live routes.
- **Screenshot Diff:** Compare reference and target screenshots side by side at desktop and mobile, then patch the largest visual gaps.
- **Ship Polish:** Run text-fit, link, accessibility, build, screenshot, and live-route checks before calling the restyle done.

## Reference Capture Detail (workflow step 2)

Open the reference URL. Capture desktop, tablet when useful, and mobile screenshots with named paths. Record viewport widths, theme, state, auth/content conditions, and any interactions needed. Record grid column count and max-width, section band height ratios (hero : content : proof : CTA), type scale (H1 size+weight, body size+line-height, caption), primary/secondary/surface color values, border-radius and shadow signature, motion character, image treatment (full-bleed vs. contained; photography vs. illustration vs. 3D), icon family (outlined / filled / custom), and CTA hierarchy.

Screenshot capture: `npx playwright screenshot <reference_url> --viewport-size=1280,900 reference-desktop.png`, then repeat with `--viewport-size=768,1024` for tablet and `--viewport-size=390,844` for mobile (one-time setup: `npx playwright install chromium`). Substitute your environment's built-in preview/screenshot tool if one is available. Run the same command against `target_url` in Screenshot Diff (below) to produce the comparison pair.

Motion capture: open DevTools, run `getComputedStyle(document.body).getPropertyValue('--transition-base')`, inspect active elements for `transition`/`animation` values; note cubic-bezier or named easing, duration in ms, which elements animate on hover vs. scroll, and whether scroll animation is CSS `@keyframes` + IntersectionObserver or a JS library (GSAP, Framer Motion, AOS — the library signals the perf budget). Save the analysis as `DESIGN.md` in the target repo root.

## DESIGN.md Template

```md
# Design System — [Target Name]
Extracted from: [reference_url] on [date]

## Identity
- Color strategy: [Restrained / Committed / Full palette / Drenched]
- Aesthetic tone: [refined minimal / editorial / brutalist / retro-technical / organic / maximalist / luxury refined / product-utilitarian]
- Unforgettable factor: [one sentence]

## Typography
- Personality font: [name] — [why it works for this brand]
- Utility font: [name] — [why it pairs]
- Type scale: H1 [size/weight], H2, H3, body, caption, label
- Line-height base: [value]

## Color Tokens
:root {
  --color-bg: ;
  --color-surface: ;
  --color-text-primary: ;
  --color-text-secondary: ;
  --color-accent: ;
  --color-accent-hover: ;
  --color-border: ;
}

## Spacing & Shape
- Grid: [columns] / max-width: [value]
- Radii: sm [value], md [value], lg [value]
- Shadow card: [value]
- Shadow elevated: [value]

## Motion
- Character: [Snappy / Considered / Cinematic]
- Fast: [ms] / Base: [ms] / Slow: [ms]
- Easing: [cubic-bezier or named token]
- Stagger pattern: [sequential / simultaneous / cascade-down]
- Scroll trigger: [threshold %]

## Voice
- Register: [Technical–Casual axis] / [Functional–Aspirational axis]
- Median sentence length: [word count]
- Stance: [2nd-person imperative / 1st-person brand / 3rd-person observer]
- Claim type: [feature-list / outcome-promise / identity-statement / provocative-question]
- Vocabulary anchors: [word1], [word2], [word3]

## Token Adoption Log
| Token | Source value | Status | Reason if ADAPTED/REJECTED |
|---|---|---|---|

## Fidelity Level
[inspired-by / close-visual-match / aggressive-restyle]
```
