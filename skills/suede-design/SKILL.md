---
name: suede-design
description: Suede-specific frontend design, redesign, UI polish, visual audit, copy refinement, token extraction, responsive QA, and implementation handoff workflow. Use when work touches Suede websites, app surfaces, dashboards, campaign pages, onboarding, empty states, forms, components, tokens, typography, colors, layout, motion, imagery, public copy, or any design-related frontend change.
---

# Suede Design

Use this skill to make Suede interfaces feel intentional, premium, legible, and
alive without drifting into generic AI output. It covers product UI, brand
surfaces, landing pages, dashboards, component systems, responsive polish, and
visual QA.

## Operating Stance

- Work from current source and a rendered screen. Do not design from memory
  when a repo, live URL, screenshot, or local preview can be checked.
- Preserve user and other-agent WIP. If the target is inside a multi-repo
  workspace, identify the exact repo or folder before edits and avoid broad git
  commands from the workspace container.
- Keep Suede public copy anchored in creator ownership, programmable IP,
  rights, provenance, registry-backed media, royalty routing, and agent
  commerce. Do not reduce Suede to a generic AI music app.
- Prefer the existing app framework, tokens, components, icon library, and
  routing patterns. Add a new abstraction only when it removes real complexity
  or matches an established local pattern.
- For visual work, render the result. Screenshots beat code inspection.

Before editing files, state this preflight in the working update:

```text
SUEDE_DESIGN_PREFLIGHT: target=<repo-or-folder> surface=<route-or-url> register=<brand|product> context=<pass|partial> git=<pass|skipped:reason> render=<pass|pending|skipped:reason> mutation=open
```

For major design work, reusable systems, reference visual matching, App Store
assets, or public launch surfaces, keep `mutation=open` only after these are
known:

- `PRODUCT.md` or product context status;
- `DESIGN.md` or design-system context status;
- shape brief status for net-new or large redesigns;
- source visual target status when a mock, screenshot, Figma frame, or
  reference URL exists;
- rendered implementation status;
- ship blocker status.

Also apply the shared no-missed gate at
`../suede-workflow-skills/references/no-missed-quality-gates.md` when the work
touches copy, design-system, visual QA, Suedify, visibility, or public launch
quality.

## Task Router

Choose the smallest path that fits the request.

- **Clear small fix:** inspect current UI, make the narrow edit, verify render,
  and report what changed.
- **Ambiguous or net-new design:** gather context, propose 2-3 approaches with
  tradeoffs, recommend one, and get approval before implementation.
- **Large redesign:** write a compact shape brief first: audience, page job,
  register, scene, color strategy, typography, layout, signature moment,
  constraints, and QA plan.
- **Visual system work:** scan current CSS, tokens, components, spacing,
  shadows, breakpoints, icon usage, and repeated UI patterns before proposing
  changes.
- **Source-to-implementation QA:** if there is a mock, screenshot, Figma frame,
  or image target plus a rendered implementation, compare both visually before
  handoff and save `suede-visual-qa.md` in the project root.
- **Long polish loop:** iterate through a visible checklist. If the same failure
  repeats, freeze the loop, reduce scope to the failing unit, and rerun with
  explicit acceptance criteria.

## Delivery Discipline

Before major or important Suede design work, write a compact delivery contract:

- objective: the user-visible outcome;
- surface: repo, route, live URL, branch, and owner;
- done signal: screenshot, build, test, deploy readback, or review artifact;
- constraints: WIP to preserve, routes not to touch, copy claims not yet
  approved, and launch/release boundaries;
- lanes: what can run in parallel, what must wait, and what each lane writes.

Use this status vocabulary in updates and handoffs:

- inspected
- changed locally
- verified locally
- committed
- pushed
- deployed
- verified live
- blocked

Do not call work done because the code changed. Call it done only when the done
signal has been checked or the remaining gap is named.

Use `suede-agent-teams` for major design work when several lanes must move at
once, such as copy plus layout plus asset plus implementation plus QA. Use
`suede-code-review` before the ship gate when design work changes shared
components, routing, auth, payments, analytics, release config, or public claim
truth. Skip both for a small visual or copy fix that can be inspected, patched,
rendered, and verified directly.

## Suede UI Contract

Before a new surface, significant redesign, reusable component family, or
design-system pass, lock the design contract before implementation:

- audience, surface job, primary action, and launch stage;
- spacing scale, grid behavior, breakpoints, and stable dimensions;
- color roles, semantic states, contrast requirements, and dark/light behavior;
- typography roles, hierarchy limits, body measure, and truncation strategy;
- copy vocabulary for buttons, empty states, loading, errors, and success;
- asset sources, logo use, crop rules, screenshot states, and motion rules;
- acceptance checks for desktop, mobile, accessibility, and rendered evidence.

Review the result against copy quality, visuals, color, typography, spacing, and
experience states. If the work is purely backend or a narrow one-element fix,
document only the relevant contract items instead of forcing a full spec.

## Context Checklist

1. Identify the surface: repo/folder, route, live URL, deployment target, branch,
   dirty files, and relevant local docs.
2. Read repo-local `AGENTS.md`, `CLAUDE.md`, `AI_HANDOFF.md`, `README.md`,
   `PRODUCT.md`, `DESIGN.md`, or task docs when present.
3. Decide the register:
   - **Brand:** marketing, launch, campaign, public page, portfolio, editorial.
   - **Product:** app shell, dashboard, tool, form, settings, admin, workflow.
4. Name the physical scene: who uses this, where, under what light, with what
   pressure, and what they need to do next.
5. Inspect the current rendered UI at desktop and mobile breakpoints before
   making claims about quality.

## Design Laws

### Subject First

Ground every decision in Suede's world: studio tools, rights ledgers, signal
chains, proofs, wallets, licensing, creator campaigns, media provenance, and
commerce rails. The page or component should feel like it belongs to Suede even
with the logo removed.

### One Memorable Move

Give each major surface one signature element that earns attention: an
interactive rights passport, a waveform ledger, a chain-of-title timeline, a
studio console, a claim map, a provenance receipt, or another subject-native
device. Keep the surrounding UI disciplined so the signature move carries.

### Color

- Pick a color strategy before picking values: restrained, committed, full
  palette, or drenched.
- For new CSS, prefer OKLCH when practical. Tint neutrals; do not use pure
  `#000` or `#fff`.
- Avoid one-note palettes. Do not default to purple-blue gradients, beige SaaS,
  dark navy dashboards, or crypto-neon unless the specific Suede surface
  demands it.
- Color must encode meaning: ownership, proof, action, risk, state, tier,
  provenance, or momentum.

### Typography

- Pair typefaces deliberately. Display, body, and utility text should have
  distinct jobs.
- Use scale and weight for hierarchy; keep at least a 1.25 ratio between major
  type steps.
- Keep body copy around 65-75 characters per line.
- Keep letter spacing at 0 by default. Do not use negative letter spacing.
- Match type size to context. Dashboards, cards, and toolbars need compact
  hierarchy, not hero-scale text.

### Layout

- Make structure explain the product. Use bands, rails, timelines, consoles,
  grids, tabs, and split panes because the content needs them.
- Cards are for repeated items, modals, and framed tools. Do not put cards
  inside cards. Do not turn every section into a floating card.
- Stable UI elements need stable dimensions: boards, grids, icon buttons,
  counters, tiles, canvases, and toolbars should not resize when labels, hover
  states, loading text, or data changes.
- On landing pages, the first viewport must show the brand, product, or offer
  clearly and leave a hint of the next section visible on mobile and desktop.
- Text must not overlap, clip, or fight its container at any viewport.

### Controls

- Use icon buttons for familiar commands when the icon exists in the local icon
  set. Add tooltips for icons that are not obvious.
- Use segmented controls for modes, toggles or checkboxes for binary settings,
  sliders or inputs for numeric values, tabs for views, menus for option sets,
  and text buttons for commands.
- Keep touch targets usable and focus states visible.

### Assets

- Use real product, creator, media, logo, or generated bitmap imagery when the
  surface needs a visual asset. Do not replace visible brand assets, product
  imagery, or nonstandard icons with CSS shapes, emoji, placeholder divs, or
  improvised inline drawings.
- Use approved Suede logo files from the current project, public repo assets,
  or an operator-provided brand folder. Do not reference private local asset
  paths in public docs, screenshots, or generated output.
- For 3D work, use Three.js and verify the canvas is nonblank, framed,
  interactive or moving as intended, and responsive.

### Motion

- Animate intent, not decoration.
- Do not animate layout properties.
- Use eased exits and entrances. Avoid bounce and elastic motion.
- Respect reduced motion.

## Design System Quality Of Life

For any major Suede surface, reusable app shell, launch system, or important
component family, include the smallest useful version of these artifacts:

- **Design source:** update or create `DESIGN.md` when the design decisions
  need to survive the session.
- **Machine tokens:** update or create `design-tokens.json`, `DESIGN.json`, or
  the local token file when tokens are part of the deliverable.
- **Token map:** color roles, type scale, spacing, radii, shadows, motion, z
  layers, chart/status colors, and semantic state names.
- **Component inventory:** core controls, navigation, cards, lists, forms,
  empty states, loading, errors, paywalls, media blocks, and proof/rights
  modules.
- **State matrix:** default, hover, focus, active, disabled, loading, empty,
  success, warning, error, offline, unauthenticated, and permission-denied
  states where relevant.
- **Preview gallery:** a local route, Storybook, SwiftUI preview group, or static
  HTML board that shows components with realistic Suede content.
- **Screenshot contract:** named states and seeded demo data so marketing,
  App Store, QA, and docs can reproduce the same visuals.
- **Asset register:** approved logos, app icons, illustration/image sources,
  attribution, crop rules, and export sizes.
- **Copy vocabulary:** action labels, toast language, error language, empty-state
  prompts, and terms that must stay consistent across the product.
- **Accessibility pass:** contrast, focus, touch targets, keyboard paths,
  dynamic type or text zoom, reduced motion, and screen-reader labels.
- **Migration notes:** where old styles still exist, what not to touch yet, and
  how new work should adopt the system without rewriting unrelated screens.

Scale this down for small fixes. A one-button polish pass may only need a token
check, a state check, and a rendered screenshot. A new app or flagship page
needs the full set.

Extract a design-system issue when a token, component, spacing pattern, color,
type treatment, or state pattern repeats at least three times or controls a
high-visibility surface. Classify drift root cause as token missing, token
ignored, component gap, content pressure, platform convention, or legacy debt.

For broad design-system audits, score:

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

## Scoped Bans And Exceptions

Rewrite the element if any of these appear as a lazy default:

- Gradient text.
- Decorative glass panels.
- Colored side-stripe borders on cards, alerts, callouts, or list items.
- The hero-metric template: big number, tiny label, support stats, gradient
  accent.
- Identical icon-card grids as the main page structure.
- Modal as the first answer to every interaction.
- Decorative orbs, bokeh blobs, or generic gradient backgrounds.
- Centered hero copy over a stock-feeling gradient with no real Suede artifact.
- Fake metrics, fake testimonials, fake partner claims, or unverified pricing.
- Em dashes in UI or marketing copy.

These are not blanket bans. Keep or recreate a pattern when source fidelity,
platform convention, accessibility, a confirmed brand system, or a direct user
request makes it the right choice. When making an exception, name why it is
earned.

## Copy Rules

- Write like a product operator, not a brochure.
- Use active voice with a clear actor.
- Name what the user controls: register a work, verify rights, route royalties,
  publish a claim, license a track, fund an agent, compare provenance.
- Cut filler, vague promises, and restated headings.
- Use the same action name across button, toast, empty state, and confirmation.
- Errors must say what happened and how to fix it.
- Empty states should point to the next useful action.

## Implementation Workflow

1. **Scan:** inspect current files, styles, rendered UI, and route behavior.
2. **Shape:** when needed, write a compact plan with color, type, layout, motion,
   asset, copy, and verification decisions.
3. **Build:** edit narrowly inside the local architecture. Keep unrelated
   refactors out.
4. **Render:** run the local server or use the existing preview. Capture desktop
   and mobile screenshots when practical.
5. **Review:** check typography, spacing, colors, asset fidelity, copy,
   accessibility, responsive behavior, loading, empty, error, hover, focus, and
   active states.
6. **Verify:** run the relevant lint, typecheck, test, build, or focused command.
   Run `git diff --check` when files changed. Verify live URLs or APIs before
   claiming public behavior.
7. **Handoff:** for meaningful work, record target, files changed, commands,
   verification, caveats, and the next step.

## Ship Gate

For launch pages, app shells, public marketing surfaces, App Store assets, or
high-visibility dashboard work, end with a short ship gate:

```text
Surface:
Done signal:
Evidence:
Blockers:
Accepted caveats:
Next action:
Status: ship | ship-with-caveats | hold
```

Use `hold` when a core path is broken, claims are false, screenshots do not
match implementation, accessibility blocks a primary action, or the live route
cannot be verified. Use `ship-with-caveats` only when the caveat is explicit,
non-critical, and acceptable for the launch stage.

## Visual QA Report

When comparing a source visual target against an implementation, save
`suede-visual-qa.md` with:

- source visual truth path or URL
- implementation path, URL, or screenshot
- viewport and state
- theme, auth state, content/data state, and interaction state
- full-view comparison evidence
- focused region comparison evidence, or why it was not needed
- findings ordered by P0/P1/P2/P3 severity
- patches made after the previous pass
- `final result: passed` or `final result: blocked`

Compare source and implementation in the same visual pass, not from memory.
Check typography, spacing/layout, colors/tokens, image and asset fidelity,
logos/icons, copy/content, loading/empty/error/hover/focus/active states,
responsiveness, accessibility, and motion where relevant.

Use `final result: blocked` when the source or rendered artifact is missing for
a required comparison, or when actionable P0/P1/P2 layout, typography, color,
asset, copy, accessibility, responsive, interaction-state, or source-fidelity
issues remain. Use `passed` only when no actionable P0/P1/P2 findings remain.

## Output Style

- For reviews, lead with findings and file or route references.
- For builds, report the concrete changes and verification.
- Keep user-facing prose concise, specific, and free of internal process names.
