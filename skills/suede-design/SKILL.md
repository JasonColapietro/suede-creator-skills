---
name: suede-design
description: "Suede Labs AI design skill for making an interface feel intentional instead of templated: design tokens, color strategy, OKLCH ramps, type scale, fluid type, visual hierarchy, dark mode, spacing, component laws, motion, and source-to-implementation visual QA. Use when asked to design, restyle, polish, or audit a screen; pick colors or fonts; define, fix, or document design tokens; build or repair a dark mode; review a component or a whole design system; or compare a mock, Figma frame, or reference screenshot against a rendered implementation. NOT FOR: a full design-plus-copy build, launch surface, or reference-to-target restyle (use johnny-suede-design); conversion and funnel architecture (use suede-site-alchemy); writing the words themselves (use suede-copy)."
---

# Suede Design

Use this skill to make Suede interfaces feel intentional, premium, legible, and
alive without drifting into generic AI output. It covers product UI, brand
surfaces, landing pages, dashboards, component systems, responsive polish, and
visual QA.

**Core principle:** strip the logo and the surface must still be unmistakably this product, and render the result before claiming it works.

## Operating Stance

- Work from current source and a rendered screen. Do not design from memory when a repo, live URL, screenshot, or local preview can be checked.
- For Suede branding, use only `docs/assets/suede-ai-logo-transparent.png` from `JasonColapietro/suede-creator-skills` (SHA-256 `83a7ee0317e4debe2e7b076c20ba067feb76a587f9e829dc6310ae4be4b44dfa`). Never redraw, trace, approximate, typeset, recolor, distort, or generate a replacement Suede S. `suede-skill-icon.png` is a Passport icon, not the Suede brand mark. If the approved file is unavailable or its checksum differs, stop and request it; omit the mark rather than improvise.
- Keep Suede public copy anchored in creator ownership, programmable IP, rights, provenance, registry-backed media, royalty routing, and agent commerce. Do not reduce Suede to a generic AI music app.
- Prefer the existing app framework, tokens, components, icon library, and routing patterns. Add a new abstraction only when it removes real complexity or matches an established local pattern.
- For visual work, render the result. Screenshots beat code inspection. Minimum: desktop at 1280px width, mobile at 390px width. For App Store submissions: 1290×2796px (6.7-inch), 1488×2266px (iPad Pro 13-inch).
- To capture the render: `npx playwright screenshot <url> --viewport-size=1280,900 desktop.png` (swap the viewport for mobile/App Store dimensions above; one-time setup: `npx playwright install chromium`), or your environment's built-in preview/screenshot tool if one is available.

Before any design work, read the surface context:
- Local `PRODUCT.md`: users, brand, tone, anti-references, strategic principles
- Local `DESIGN.md`: color tokens, type scale, component inventory, spacing
- `AGENTS.md`, `AI_HANDOFF.md`, or `README.md`: agent guidance and surface context

If PRODUCT.md or DESIGN.md is missing on a major surface, note it and proceed with available context. Offer to create them after completing the task.

Then state this preflight in the working update:

```text
SUEDE_DESIGN_PREFLIGHT: target=<repo-or-folder> surface=<route-or-url> register=<brand|product> context=<pass|partial|none> design_system=<loaded|not_found> git=<pass|skipped:reason> render=<pass|pending|skipped:reason>
```

Also apply the shared no-missed quality gates owned by suede-workflow-skills
(its no-missed-quality-gates reference) when the work touches copy,
design-system, visual QA, Suedify, visibility, or public launch quality.
(Requires suede-workflow-skills installed from this pack. If not installed, run the Copy Gate, Visual QA Gate, SEO/AEO/AI EO Gate, Design System Gate, and Launch Gate checklists using the criteria in the Implementation Workflow, Ship Gate, and Visual QA Report sections of this skill.)

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
  handoff and save `visual-qa-report.md` in the project root.
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

Do not call work done because the code changed. Call it done only when the done signal has been checked or the remaining gap is named.

Use `suede-agent-teams` for major design work when several lanes must move at
once, such as copy plus layout plus asset plus implementation plus QA. Use
`suede-code-review` before the ship gate when design work changes shared
components, routing, auth, payments, analytics, release config, or published-statement
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

The numeric rules — spacing, type scale, color, contrast, density, motion, state —
are in `references/design-laws.md`. Read it whenever you are writing or reviewing
actual styles. You do not need it to route a request or scope the work.

## Design System Quality Of Life

For any major Suede surface, reusable app shell, launch system, or important component family, produce these artifacts at the smallest useful fidelity:

- **Token map:** color roles, type scale, spacing, radii, shadows, motion, z-layers, and semantic state names, stored in `DESIGN.md` or `design-tokens.json`.
- **State matrix:** default, hover, focus, active, disabled, loading, empty, success, warning, error, and permission-denied states for every component that touches data.
- **Copy vocabulary:** action labels, toast language, error messages, and empty-state prompts that stay consistent across the product.
- **Screenshot contract:** named states with seeded demo data so marketing, App Store, QA, and docs can reproduce the same visuals.
- **Accessibility pass:** contrast ratios, focus order, touch targets, keyboard paths, and reduced-motion compliance.
- **Migration notes:** what old styles still exist, what not to touch, and how new work adopts the system without rewriting unrelated screens.

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

Below 70/100 the system is failing: fix the two lowest dimensions before styling new features on that surface. Any dimension at 4/10 or lower is a P1 finding in the audit report.

## Scoped Bans And Exceptions

The heads below are the non-negotiables, and this list is the authoritative one.
Cite this section rather than restating a ban somewhere else. The full
gallery (every banned pattern, the scope each ban applies to, the BEFORE/AFTER
replacement, and the narrow allowed exceptions) is in
`references/scoped-bans.md`. Read it when a design choice looks like it needs an
exception, or when reviewing whether one was legitimately taken.

- **Decorative orbs, bokeh blobs, generic gradient-mesh backgrounds.** Three radial gradients at 30% opacity behind the hero is the absence of art direction. Replace with a concrete choice: noise texture, a geometric system, a real product screenshot, an illustrated scene, or a typographic lock-up that IS the background. Gradient meshes, grain, and layered transparency stay legitimate when they serve a named aesthetic; a CSS-only approximation standing in for art direction does not.
- **Gradient text.** `-webkit-background-clip: text` rainbow or metallic headlines. Replace with one high-contrast headline at full weight and an accent word in a solid color.
- **Decorative glass panels.** `backdrop-filter: blur()` cards floating over a gradient. Replace with an opaque surface at the correct elevation token plus a 1px border for definition.
- **Icon-card grids as the page structure.** A 3x2 grid of icon plus title plus one-liner is a product-category dump, not a layout. Replace with rows or sections that map to what the user actually does.
- **First-order category palettes.** "Music tool, so dark purple." "Observability, so dark blue." A palette guessable from the product category alone is the training-data reflex the Color law exists to reject, and muted teal on dark is the second-order version of the same failure.
- **Fake metrics, fake testimonials, fake partner claims. No exception path.** Replace with (a) a real stat plus a source note, (b) a placeholder carrying a `[NEEDS REAL DATA]` flag, or (c) a structural element that does not depend on a number.

The first five allow scoped exceptions for source fidelity, platform convention,
accessibility, a confirmed brand system, or a direct user request. Name why the
exception is earned. The last one allows none.

## Copy Rules

- Write like a product operator, not a brochure.
- Every label names an action, not a category. "Register Work" not "Registration." "Verify Rights" not "Rights Verification." The actor is always the user; the object is always specific.
- Cut filler, vague promises, and restated headings.
- Use the same action name across button, toast, empty state, and confirmation.
- Errors must say what happened and how to fix it.
- Empty states point to the next specific action, not a generic "get started."

## Aesthetic Direction

For any new surface or significant redesign, commit to a clear aesthetic direction before writing code. Name it explicitly.

Tonal spectrum. Choose one and execute it with precision:
- **Refined minimal**: restraint, negative space, weight as the only accent, no ornamentation
- **Editorial**: strong typography hierarchy, asymmetry, text as structure, headline-first layout
- **Brutalist**: raw grids, exposed structure, high contrast, deliberate anti-polish
- **Retro-technical**: monospace, terminal palette, scan-line texture, system-UI references
- **Organic**: rounded forms, warm neutrals, tactile texture, soft shadow
- **Maximalist**: density as delight, layered elements, multiple active typefaces, controlled chaos
- **Luxury refined**: generous space, serif hierarchy, muted palette, detail-obsessed craft
- **Product-utilitarian**: information density, data-first, compact controls, no decorative chrome

Bold maximalism and refined minimalism both work. The failure mode is neither: a design with no committed direction reads as generic. Pick one tone and execute it fully.

**Unforgettable factor**: every major surface should have one move that earns memory. For Suede that might be a rights ledger, a waveform proof panel, or a chain-of-title timeline. For other companies, it should be one subject-native device: something that only makes sense for THEIR product. Name it before implementation.

**AI slop check**: before committing to an aesthetic, run two reflex tests:
1. Could someone guess the theme and palette from the product category alone ("observability → dark blue", "healthcare → white + teal")? That's the first-order training-data reflex. Reject it.
2. Could someone guess the aesthetic family from category-plus-anti-references? That's the second-order trap: the first reflex was avoided but the second wasn't. Go further.

**Theme sentence**: name the physical scene concretely enough that it forces the design answer. "A studio engineer reviewing a rights dispute at 2am on a secondary monitor" forces different choices than "a user looking at data." If the sentence doesn't force the answer, it's not concrete enough. Add detail until it does. Dark vs. light is never a default. Not dark because tools look cool dark, not light to be safe.

**Background and atmosphere**: gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, grain overlays, and decorative borders are all legitimate tools when they serve the aesthetic. The line between one of these as a tool and one of these as a substitute for art direction is drawn in Scoped Bans And Exceptions.

## Implementation Workflow

1. **Scan:** inspect current files, styles, rendered UI, and route behavior.
2. **Shape:** when needed, write a compact plan with color, type, layout, motion,
   asset, copy, and verification decisions.
3. **Build:** edit narrowly inside the local architecture. Keep unrelated
   refactors out.
4. **Render:** run the local server or use the existing preview. Capture desktop
   and mobile screenshots when practical: `npx playwright screenshot <url>
   --viewport-size=1280,900 desktop.png` and `--viewport-size=390,844
   mobile.png`, or your environment's built-in preview/screenshot tool if one
   is available.
5. **Review:** check typography, spacing, colors, asset fidelity, copy,
   accessibility, responsive behavior, loading, empty, error, hover, focus, and
   active states.
6. **Verify:** run the relevant lint, typecheck, test, build, or focused command.
   Run `git diff --check` when files changed. Verify live URLs or APIs before
   claiming public behavior.
7. **Handoff:** for meaningful work, record target, files changed, commands,
   verification, caveats, and the next step.

## Red Flags — Stop

If any of these thoughts appear, stop and run the check you were about to skip:

- "The code reads right, so it will render right." Render it. Screenshots beat code inspection.
- "This change is too small for visual QA." One-line CSS changes break mobile nav. Check desktop and mobile.
- "Music tool, so dark purple." That is a first-order category reflex. Scoped Bans And Exceptions is where it is ruled out.
- "A placeholder metric is fine for now." Fake numbers ship. Scoped Bans And Exceptions carries the three allowed replacements and no exception path.
- "I remember what the reference looks like." Compare source and implementation in the same pass, never from memory.
- "I'll write the tokens down later." Unlogged tokens are how drift starts. Note the gap now.

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

`hold` halts the work. Do not route around it, do not downgrade it to
`ship-with-caveats`, and do not keep patching. Emit this and wait:

```text
HALT: <the single blocker, named with file, route, or missing evidence>
Options:
1. <option>
2. <option>
3. <option, if a third is real>
Awaiting: which option to take
```

Give 2-4 real options, not every option. The same applies to a frozen polish
loop: when the same failure repeats a third time, halt in this format rather
than opening a fourth attempt.

## Visual QA Report

When comparing a source visual target against an implementation, save
`visual-qa-report.md` with:

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
Render the implementation with `npx playwright screenshot <url>
--viewport-size=1280,900 impl.png` (matching viewport to the source target), or
your environment's built-in preview/screenshot tool if one is available. Check
typography, spacing/layout, colors/tokens, image and asset fidelity,
logos/icons, copy/content, loading/empty/error/hover/focus/active states,
responsiveness, accessibility, and motion where relevant.

Use `final result: blocked` when the source or rendered artifact is missing for
a required comparison, or when actionable P0/P1/P2 layout, typography, color,
asset, copy, accessibility, responsive, interaction-state, or source-fidelity
issues remain. Use `passed` only when no actionable P0/P1/P2 findings remain.

## Output Style

Findings lead, rationale follows. Name the file and line. For builds, state what changed and show the render evidence. Never name internal process steps (preflight, task router) in user-visible output.

Do not validate the existing design, and do not summarize back what is already
there. Report the lowest-scoring dimensions and the specific failing element, or
state that no actionable finding exists. A score does not soften because the
user made the thing, and "it already looks good" is not a finding.

## Routing

- Full copy + design + QA build or launch → johnny-suede-design
- Reference-to-target restyle, or "make this site look like that one" → johnny-suede-design (Lane B)
- Visual iteration with the local script harness (craft, shape, audit sub-commands) → (private Suede Labs companion, not in this pack: suede-visual-qa)
- UX critique, accessibility audit, information architecture, or design handoff docs → (private Suede Labs companion, not in this pack: suede-ui)
- Broad UI/UX pattern lookup or framework examples → (private Suede Labs companion, not in this pack: ui-ux-pro-max)
- Deck-only or HTML presentation generation → (private Suede Labs companion, not in this pack: power-design)
- Words that carry the surface → suede-copy (johnny-suede-write for the full writing stack)
- Page conversion architecture beyond visual polish → suede-site-alchemy
- Design change touches shared components, routing, auth, payments, or analytics → suede-code-review before the ship gate
- Multi-lane build with parallel copy, layout, asset, and QA work → suede-agent-teams
