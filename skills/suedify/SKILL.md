---
name: suedify
description: "Make any website feel like another website. Suedify studies a reference URL — Apple, Stripe, Linear, Supreme, or any site — extracts its design grammar, and implements the layout, hierarchy, typography, color, section rhythm, and motion into a target site you control. Includes visual fingerprinting, design-token distillation, screenshot comparison QA, responsive verification, and legal/brand safety guardrails. Use when asked to 'make this look like that' or to give any site a premium style treatment."
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

The output should make the target site inherit the reference site's design
logic, rhythm, hierarchy, and interaction feel while remaining legally and
brand safe. Do not copy proprietary code, logos, exact copy, private assets, or
trademarked identity. Recreate the design grammar with the target brand,
content, product, and assets.

## Required Inputs

- `reference_url`: the site whose style should be studied.
- `target_url`: the site to transform.
- Target source: repo/folder/branch when implementation is expected.
- Optional depth: homepage only, key route set, full site, landing page, app
  shell, mobile, or screenshot-only concept.
- Optional fidelity: inspired-by, close visual match, or aggressive restyle.

If either URL is missing, ask for the missing URL. If no source repo is known,
inspect the target URL and produce a `suedify-implementation-plan.md` instead
of pretending edits can be applied.

## Public Code Ability URL

When a public proof or "code ability" link is useful in copy, docs, or a
handoff, use this default unless the user gives a more specific repo URL:

`https://github.com/JasonColapietro/suede-creator-skills`

For the public skill docs surface, use:

`https://jasoncolapietro.github.io/suede-creator-skills/skills/`

## Suede Design Skills

Use these as named Suedify moves. They are marketable labels for the work, but
each must map to a concrete implementation or QA action.

- **Suede Style Fingerprint:** capture the reference site's grid, section
  rhythm, nav behavior, typography, color roles, imagery, motion, density, and
  responsive breakpoints. Also capture and name the reference's aesthetic identity — required:
  1. **Color strategy axis**: which strategy does the reference use? (Restrained / Committed / Full palette / Drenched)
  2. **Aesthetic tone**: what is the reference's overall tone? (refined minimal / editorial / brutalist / retro-technical / organic / maximalist / luxury refined / product-utilitarian)
  3. **Unforgettable factor**: what is the one move that makes this site memorable — the single design decision that someone will recall after closing the tab?
  Include these three answers as required fields in `suedify-style-fingerprint.md`.
- **Suede Token Distiller:** translate the reference look into target-safe color
  roles, type roles, spacing, radii, shadows, motion, and state tokens. When extracting tokens, also extract and name the aesthetic strategy:
  - What color strategy axis does the reference use? (Restrained / Committed / Full palette / Drenched)
  - What is the reference's tone? (Pick the closest: refined minimal / editorial / brutalist / retro-technical / organic / maximalist / luxury refined / product-utilitarian)
  - What is the reference's unforgettable factor — the one move that makes the site memorable?
  Include these three fields in the Token Distiller output artifact alongside accepted and rejected reference signals.
- **Suede Hero Lift:** rebuild the first viewport so the target inherits the
  reference's hierarchy, pacing, media treatment, and CTA emphasis without
  stealing copy or assets.
- **Suede Section Rhythm:** map the reference site's page cadence into target
  sections, including bands, reveals, product blocks, proof, comparison, and
  closing CTA.
- **Suede Copy Reframe:** rewrite target copy in Suede's voice while matching
  the reference's sentence length, confidence, and scanning pattern after
  removing reference-site filler, fake intensity, unsupported claims, and
  formulaic AI patterns.
- **Suede Asset Swap:** replace reference assets with target-owned product,
  logo, creator, media, or generated bitmap assets that serve the same visual
  role.
- **Suede Motion Match:** recreate interaction intent, scroll pacing, reveals,
  hover states, and transitions with reduced-motion support.
- **Suede Responsive Fit:** make desktop, tablet, and mobile carry the same
  design idea instead of collapsing into a generic stack.
- **Suede Proof Stack:** adapt the reference's trust structure into truthful
  target proof, links, product evidence, docs, screenshots, or live routes.
- **Suede Screenshot Diff:** compare reference screenshots and target
  screenshots side by side at desktop and mobile, then patch the largest visual
  gaps.
- **Suede Ship Polish:** run text-fit, link, accessibility, build, screenshot,
  and live-route checks before calling the restyle done.

## Workflow

1. **Verify target and permissions**
   - Identify the exact target repo/folder before editing.
   - If inside a multi-repo workspace, do not edit from the workspace container root.
   - Run repo-local git status, remote, and recent log before changes.
   - Preserve user and other-agent WIP.

2. **Capture the reference**
   - Open the reference URL.
   - Capture desktop, tablet when useful, and mobile screenshots with named
     file paths.
   - Record viewport widths, theme, state, auth/content conditions, and any
     interactions needed to reach the captured state.
   - Note nav, hero, page sections, typography, color, spacing, media, motion,
     CTAs, forms, footer, and mobile behavior.
   - Save the analysis as `suedify-style-fingerprint.md` for substantial work.

3. **Capture the target**
   - Open the target URL and local source route when available.
   - Capture target screenshots at the same desktop, tablet when used, and
     mobile widths, with the same state, theme, auth/content conditions, and
     interaction state.
   - Identify what target content, assets, routes, and claims must remain.
   - Mark dead links, broken layout, weak copy, missing assets, and unverified
     claims.

4. **Make the mimic map**
   - Map reference elements to target-safe equivalents:
     - reference nav -> target nav
     - reference hero -> target hero
     - reference media -> target-owned media
     - reference product proof -> target proof
     - reference CTA ladder -> target CTA ladder
     - reference motion -> target motion
   - Do not copy exact proprietary assets, exact UI copy, or protected brand
     identifiers.
   - Add a Suede Token Distiller block for target-safe color, type, spacing,
     radius, shadow, motion, and state tokens, plus accepted and rejected
     reference signals.

5. **Implement**
   - Work inside the target's existing framework, tokens, routes, and component
     patterns where possible.
   - Update design tokens before one-off component styling when the restyle is
     broad.
   - Keep content truthful to the target. A reference site's claims do not
     become target claims.
   - Use `suede-agent-teams` when copy, layout, assets, implementation, and QA
     need parallel lanes.
   - Use `suede-site-alchemy` when the target is a landing page, campaign page,
     microsite, or SEO/AEO surface.
   - Use `suede-code-review` before ship when the restyle changes shared
     components, routing, auth, payments, analytics, API behavior, deploy config,
     or public claim truth.
   - Use `compose-suede-screenshots` when the work needs marketable before/after
     panels, App Store assets, or social launch screenshots (requires separate
     installation — not bundled with this skill).

6. **Render and compare**
   - Run the local server or preview.
   - Capture target screenshots at the same desktop and mobile widths used for
     the reference.
   - Compare reference and target together in the same visual pass, not from
     memory.
   - Compare hierarchy, spacing, contrast, typography, image treatment, icon
     family, section rhythm, CTA visibility, interaction states, and mobile
     composition.
   - Use focused crops for hero, nav, cards, forms, CTAs, icons, logos, image
     treatment, and any region where typography or assets matter.
   - Patch until the largest mismatches are either fixed or named.

7. **Verify and ship**
   - Run relevant lint, typecheck, test, build, or focused commands.
   - Run `git diff --check` when files changed.
   - Verify live URLs before claiming a public restyle.
   - End with `ship`, `ship-with-caveats`, or `hold`.

## Fidelity Rules

The target may closely match:

- layout proportions;
- typographic scale and rhythm;
- color role structure;
- section pacing;
- navigation density;
- interaction feel;
- image crop strategy;
- product proof structure;
- mobile composition.

The target must not copy:

- reference logos or trademarked marks;
- exact marketing copy;
- proprietary source code;
- private media or downloadable assets;
- fake partner/customer proof;
- pricing, guarantees, metrics, or claims that do not belong to the target.

If the user asks for an exact clone of a protected site, produce a close,
target-branded interpretation instead and state the constraint briefly.

Hold the restyle when placeholder assets, CSS/div art, emoji, improvised SVG,
or text approximations replace real target imagery, logos, product screenshots,
or important icons without approval; when nav, forms, dropdowns, tabs, or CTAs
do not work; when mobile composition breaks; or when the target no longer reads
as its own brand.

## Output Artifacts

For meaningful work, create or update:

- `suedify-style-fingerprint.md`: reference analysis and target mapping.
- `Suede Token Distiller` section or artifact: accepted/rejected reference
  signals and target-safe color, type, spacing, radius, shadow, motion, and
  state tokens.
- `suedify-implementation-plan.md`: file plan, design token plan, component
  plan, and verification checklist.
- `suedify-visual-qa.md`: reference screenshot, target screenshot, viewport,
  state/theme/auth/content conditions, full-view comparison, focused-region
  comparison, findings, patches, caveats, and final status.

Skip artifacts for tiny one-section fixes, but still report what reference
signals were copied into the target.

## Ship Gate

```text
Reference URL:
Target URL:
Target source:
Fidelity level:
Screenshots:
Changed:
Verification:
Unmatched reference signals:
Legal/brand caveats:
Status: ship | ship-with-caveats | hold
```

Use `hold` when the target cannot be edited, a live route cannot be verified, a
primary layout breaks, copy claims are false, reference assets were copied
unsafely, or the target no longer reads as its own brand.
