---
name: suedify
description: Clone any site's visual DNA into transferable Suede tokens. Use when extracting color strategy, type system, spacing rhythm, motion fingerprint, or brand voice from a reference site, screenshot, or design.
---

# Suedify

Use this skill when the user wants:

```text
reference_url -> target_url
```

Example:

```text
Use apple.com and make suede.example look like it.
```

The output makes the target site inherit the reference site's design logic, rhythm, hierarchy, and interaction feel while remaining legally and brand safe. Do not copy proprietary code, logos, exact copy, private assets, or trademarked identity. Recreate the design grammar with the target brand, content, product, and assets.

## Required Inputs

- `reference_url`: the site whose style should be studied.
- `target_url`: the site to transform.
- Target source: repo/folder/branch when implementation is expected.
- Optional depth: homepage only, key route set, full site, landing page, app shell, mobile, or screenshot-only concept.
- Optional fidelity: inspired-by, close-visual-match, or aggressive-restyle.

If either URL is missing, ask for the missing URL. If no source repo is known, inspect the target URL and produce `suedify-implementation-plan.md` instead of pretending edits can be applied.

## Suede Design Skills

Use these as named Suedify moves. Each maps to a concrete implementation or QA action.

- **Suede Style Fingerprint:** Capture the reference site's grid, section rhythm, nav behavior, typography, color roles, imagery, motion, density, and responsive breakpoints. Required fields:
  1. **Color strategy axis**: Restrained / Committed / Full palette / Drenched
  2. **Aesthetic tone**: refined minimal / editorial / brutalist / retro-technical / organic / maximalist / luxury refined / product-utilitarian
  3. **Unforgettable factor**: the one design decision someone recalls after closing the tab.
  4. **Font pairing analysis**: Identify the personality font (headlines/display, carries brand character) and the utility font (body/UI, optimized for readability). For each, record: name, weight range in use, optical size used at, and one sentence on why the pairing works — what contrast or tension between the two creates the typographic system. Example: "PP Neue Montreal (personality: geometric, confident, slightly wide) paired with Inter (utility: neutral, familiar, screen-optimized) — contrast is personality vs. disappearance."

- **Suede Token Distiller:** Produce a token table with these rows: `--color-bg`, `--color-surface`, `--color-text-primary`, `--color-text-secondary`, `--color-accent`, `--color-accent-hover`, `--color-border`, `--font-personality` (display/heading font, with reason it works for this brand), `--font-utility` (body/UI font, with reason it pairs), `--text-base`, `--text-scale-ratio`, `--radius-sm/md/lg`, `--shadow-card`, `--shadow-elevated`, `--motion-fast`, `--motion-base`, `--motion-slow`, `--motion-easing`. Mark each token as ADOPTED, ADAPTED (modified to fit target brand), or REJECTED (with reason). Output as a CSS custom properties block ready to drop into `:root {}`.

- **Suede Hero Lift:** Rebuild the first viewport so the target inherits the reference's hierarchy, pacing, media treatment, and CTA emphasis without stealing copy or assets.

- **Suede Section Rhythm:** Map the reference site's page cadence into target sections, including bands, reveals, product blocks, proof, comparison, and closing CTA.

- **Suede Voice Fingerprint:** Scrape 3-5 sentences from the reference site's hero, subhead, and primary CTA. Extract and record: (1) vocabulary register on a scale of Technical-to-Casual and Functional-to-Aspirational, (2) median sentence word count, (3) person/stance (second-person imperative / first-person brand / third-person observer), (4) claim type (feature-list / outcome-promise / identity-statement / provocative-question), (5) three words that recur or feel distinctly "theirs." Output as a voice brief: four parameters + three vocabulary anchors. This brief feeds Suede Copy Reframe.

- **Suede Copy Reframe:** Read 3-5 sentences from the reference site's hero and primary CTA. Extract: (a) vocabulary register (technical / casual / luxury / utilitarian), (b) median sentence length (short punchy / mid complex / long discursive), (c) first-person vs. second-person stance, (d) claim style (feature-list / outcome-promise / identity-statement). Apply those four parameters to target copy. Strip phrases that appear in 80% of SaaS sites: "powerful," "seamlessly," "effortless," "elevate your," "next-level," and any sentence beginning with "Whether you're."

- **Suede Asset Swap:** Replace reference assets with target-owned product, logo, creator, media, or generated bitmap assets that serve the same visual role.

- **Suede Motion Match:** Extract easing curves (cubic-bezier values or named easing tokens), duration ranges (fast/base/slow in ms), stagger patterns (which elements reveal in sequence vs. simultaneously), and scroll-trigger thresholds. Classify the reference's motion character: Snappy (under 200ms, tight easing), Considered (200-500ms, ease-out or spring), or Cinematic (500ms+, dramatic reveals). Implement with `transition` / `@keyframes` / `IntersectionObserver` patterns. Always include `prefers-reduced-motion` override.

- **Suede Responsive Fit:** Make desktop, tablet, and mobile carry the same design idea instead of collapsing into a generic stack.

- **Suede Proof Stack:** Adapt the reference's trust structure into truthful target proof, links, product evidence, docs, screenshots, or live routes.

- **Suede Screenshot Diff:** Compare reference screenshots and target screenshots side by side at desktop and mobile, then patch the largest visual gaps.

- **Suede Ship Polish:** Run text-fit, link, accessibility, build, screenshot, and live-route checks before calling the restyle done.

## Workflow

**Run to completion in one pass.** Do not stop to ask clarifying questions once a reference URL and target are known. If depth or fidelity is not specified, default to: homepage + hero + primary CTA section, close-visual-match fidelity. State what you chose in the Ship Gate.

1. **Verify target and permissions**
   - Identify the exact target repo/folder before editing.
   - If inside a multi-repo workspace, do not edit from the workspace container root.
   - Run repo-local git status, remote, and recent log before changes.
   - Preserve user and other-agent WIP.

2. **Capture the reference**
   - Open the reference URL.
   - Capture desktop, tablet when useful, and mobile screenshots with named file paths.
   - Record viewport widths, theme, state, auth/content conditions, and any interactions needed to reach the captured state.
   - Record: grid column count and max-width, section band height ratios (hero : content : proof : CTA), type scale (H1 size + weight, body size + line-height, caption treatment), primary/secondary/surface color values, border-radius and shadow signature, motion character (see Motion Match), image treatment (full-bleed vs. contained, photography vs. illustration vs. 3D), icon family (outlined / filled / custom), and CTA hierarchy (how many levels, color contrast delta between primary and secondary).
   - Motion capture: open DevTools > Elements panel. Run `getComputedStyle(document.body).getPropertyValue('--transition-base')` to check for CSS custom properties. Inspect active elements for `transition` and `animation` computed values. Note the cubic-bezier or named easing, duration in ms, and which element types animate on hover vs. scroll. If scroll animations are used, note whether they're CSS `@keyframes` + IntersectionObserver or a JS library (GSAP, Framer Motion, AOS) — the library choice signals the reference's performance budget.
   - Save the analysis as `DESIGN.md` in the target repo root.

3. **Capture the target**
   - Open the target URL and local source route when available.
   - Capture target screenshots at the same desktop, tablet when used, and mobile widths, with the same state, theme, auth/content conditions, and interaction state.
   - Identify what target content, assets, routes, and claims must remain.
   - Mark dead links, broken layout, weak copy, missing assets, and unverified claims.

4. **Make the mimic map**
   - Map reference elements to target-safe equivalents:
     - reference nav -> target nav
     - reference hero -> target hero
     - reference media -> target-owned media
     - reference product proof -> target proof
     - reference CTA ladder -> target CTA ladder
     - reference motion -> target motion
   - Do not copy exact proprietary assets, exact UI copy, or protected brand identifiers.
   - Run Suede Token Distiller. Output the full CSS custom properties block for `:root {}`.

5. **Implement**
   - Work inside the target's existing framework, tokens, routes, and component patterns where possible.
   - Update design tokens before one-off component styling when the restyle is broad.
   - Keep content truthful to the target. A reference site's claims do not become target claims.

6. **Render and compare**
   - Run the local server or preview.
   - Capture target screenshots at the same desktop and mobile widths used for the reference.
   - Compare reference and target together in the same visual pass, not from memory.
   - Compare hierarchy, spacing, contrast, typography, image treatment, icon family, section rhythm, CTA visibility, interaction states, and mobile composition.
   - Use focused crops for hero, nav, cards, forms, CTAs, icons, logos, image treatment, and any region where typography or assets matter.
   - Patch until the largest mismatches are either fixed or named.

7. **Verify and ship**
   - Run relevant lint, typecheck, test, build, or focused commands.
   - Run `git diff --check` when files changed.
   - Verify live URLs before claiming a public restyle.
   - End with `ship`, `ship-with-caveats`, or `hold`.

## Fidelity Rules

The target may closely match layout proportions, typographic scale and rhythm, color role structure, section pacing, navigation density, interaction feel, image crop strategy, product proof structure, and mobile composition.

The target must not copy reference logos or trademarked marks, exact marketing copy, proprietary source code, private media or downloadable assets, fake partner/customer proof, or pricing, guarantees, metrics, or claims that do not belong to the target.

If the user asks for an exact clone of a protected site, produce a close, target-branded interpretation instead and state the constraint briefly.

## Output Artifacts

Every suedify run produces `DESIGN.md` in the target repo root, with all token fields filled from the reference extraction. For multi-section work also produce `suedify-visual-qa.md`. For planning-only runs (no target repo), produce `suedify-implementation-plan.md`. Never produce empty or partially-filled token files — if a value cannot be extracted, record `UNKNOWN` with the reason.

## DESIGN.md Template

Every suedify run writes or updates this file in the target repo root. All fields must be filled. `UNKNOWN` is allowed only with a reason.

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
```css
:root {
  --color-bg: ;
  --color-surface: ;
  --color-text-primary: ;
  --color-text-secondary: ;
  --color-accent: ;
  --color-accent-hover: ;
  --color-border: ;
}
```

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
| --color-accent | #0A85FF | ADOPTED | |
| --font-personality | ... | ADAPTED | swapped to target brand font with same optical weight |

## Fidelity Level
[inspired-by / close-visual-match / aggressive-restyle]
```

## Ship Gate

```text
Reference URL:
Target URL:
Target source:
Fidelity level:
Depth:
Screenshots:
Changed:
Verification:
Unmatched reference signals:
Legal/brand caveats:
Status: ship | ship-with-caveats | hold
```

Use `hold` when the target cannot be edited, a live route cannot be verified, a primary layout breaks, copy claims are false, reference assets were copied unsafely, placeholder assets or CSS/div art replace real imagery without approval, nav/forms/CTAs do not work, mobile composition breaks, or the target no longer reads as its own brand.
