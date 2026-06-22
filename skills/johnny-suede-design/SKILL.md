---
name: johnny-suede-design
description: Design and write high-polish creative surfaces for Suede or a supplied company — landing pages, brand pages, product UI, dashboards, components, campaigns, and creative projects. Routes through register classification, context gates, design laws, tokens, fluid type, motion, visual QA, Suedify reference-site restyling, full copywriting, anti-slop scoring, and optional multi-agent build coordination. Use when you design, redesign, restyle, suedify, adapt a site's look, build UI, create product screenshots, write or rewrite copy, headlines, CTAs, email or social, build a design system, run visual QA, or coordinate a multi-lane creative build.
---

# Johnny Suede Design — The Any-Creatives Enchilada

This is the full design-plus-copy stack for building any creative surface, not just websites. Landing pages, brand surfaces, product UI, dashboards, campaigns, components, and creative projects all route through here. It classifies the surface, locks a visual direction, writes the words that carry it, renders and QAs the result, and can run the whole thing as a coordinated agent team when the build is big. Writing mode is ON by default: a surface is not finished until the copy pulls its weight.

This skill organizes and prepares creative work. It does not clear rights, confirm ownership, approve payouts, write to a registry, guarantee placements, or guarantee outcomes. It produces drafts, designs, tokens, plans, and QA evidence for a human to verify and ship.

## Core Job

The job is a surface that feels specific — not polished-generic. The named company, product, or audience should be recognizable in every design decision before the logo loads. Work from live URL, source, and rendered screenshot. Never design from assumption when evidence is available.

Preserve the existing app framework, tokens, components, routing, and WIP unless the task explicitly asks for a larger rebuild. Prefer the existing icon library and component patterns. Add a new abstraction only when it removes real complexity or matches an established local pattern.

For Suede work, anchor design and copy in creator ownership, programmable IP, provenance, registry-backed media, royalty routing, licensing readiness, and agent commerce. Do not reduce Suede to a generic AI music app. For a supplied company, replace Suede nouns, proof, voice, and claim boundaries with that company's brief. Do not use em dashes in public copy.

## Pick The Lane (Router)

This skill is the entry point. Name which lanes are active and why before starting. Never run all lanes by default.

- **Visual polish / design pass** on a surface, no copy or restyle needed → run **Lane A: Design** directly.
- **Copy or voice work only**, no layout changes → run **Lane C: Copy** directly. (Writing mode is on by default even inside a design pass.)
- **Reference → target restyle / adapt a site's look / "suedify"** → open with **Lane B: Suedify** to set the visual vocabulary, then Design and Copy lanes refine it.
- **Full redesign, launch surface, app build, or conversion-shaped work** → this skill orchestrates: run the Design Contract, then route lanes in parallel where safe.
- **Big, risky, cross-surface, release-bound, or "do it thoroughly" work** → **Lane D: Agent Teams** (see the multi-agent gate below — ASK first).
- **Unknown scope** → run the scout step, read the surface, then name the register and lanes before touching anything.

**On-demand website companions (do NOT inline — run only when asked):**
- Conversion / CRO / funnel work on a web page → run `$suede-site-alchemy`.
- Deep standalone SEO / AEO / AI EO audit → run `$suede-seo-audit`.
- Page findability + first-screen + CTA + proof + AI-citation grade → run `$suede-visibility-grader`.
- Deep diff / code review of a change touching shared components, auth, payments, routing, analytics, or public-claim truth → run `$suede-code-review` (or `$suede-code-grader` for a blunt A–F grade).

These are separate skills for website analysis. Reference them; do not paste their content here.

## Multi-Agent Gate (ASK First)

Because this enchilada can run a multi-agent team (Lane D), by DEFAULT it asks the user up front before spawning a fleet. Never silently spawn agents or max tokens.

> Run this as a multi-agent team (more thorough — scout, parallel builders, adversarial + consensus review, release lock, evidence handoff) or single-agent (faster, one pass)? Multi-agent mode may use slightly more tokens than most skills.

Default to single-agent for clear, contained work. Escalate to multi-agent when the user asks, or when the work is broad, risky, release-bound, or needs continuous quality gates. State the choice in the output before starting.

## Surface Classifier

Classify the surface before any design work starts. Misidentifying the register produces wrong tone, wrong density, and wrong motion posture.

| Register | Signal | Defaults |
|---|---|---|
| Brand | Homepage, about, campaign, press, portfolio, editorial | Highest typographic ambition, lowest density, motion earns premium feel, copy is declarative |
| Product | App UI, dashboard, settings, onboarding, tool, form, admin, workflow | Density serves task completion, motion clarifies state, copy is instructional |
| Docs | Reference, API, guides, changelog | Monospace hierarchy, zero decoration, copy is precise and scannable |
| Campaign | Launch, landing, offer, event | Conversion architecture first, proof stack above the fold, CTA is singular |
| Product listing / mobile | Screenshots, paywall, onboarding | Mobile clarity conventions, system-safe typography, no custom fonts in screenshots |

When the request spans registers (e.g., a dashboard with a marketing hero), name both and apply each register to its section.

When the surface is public, structure it for SEO, AEO, AI EO, Google, Gemini, and AI search with clear CTAs. When the surface is mobile, include screenshots, onboarding, paywall, responsive layout, and app-shell needs in the design pass.

## Minimum Signal Gate

Stop and ask only if none of these can be read from context:

| Required | Source |
|---|---|
| Target URL or file path | Supplied or inferable from repo |
| Primary action the surface must drive | Supplied or read from existing CTA |
| Register (brand / product / docs / campaign / mobile) | Inferable from surface type |
| Company or brand (for non-Suede work) | Supplied in brief or inferable from domain |

Everything else — tone, color direction, layout choices, copy angle — is a design decision. Make it, show the reasoning in the output, and let the user override. Do not ask about optional parameters before starting. If no brief and no explicit Suede context, ask for the company.

## Company Brief (Non-Suede Work)

Supply in natural language or this form:

```text
Company:
Product or offer:
Audience:
Category:
Voice:
Terms to use:
Terms to avoid:
Proof:
Allowed claims:
Forbidden claims:
Primary CTA:
Reference URLs:
Assets or brand rules:
```

When a brief is active, replace all Suede positioning, domain language, and claim boundaries with it. Keep the full workflow. Rename "Cue Suede" to "Cue [Company]" in the output.

## Read Current Truth First

Before any design, copy, or QA claim, read the surface context:
- Local `PRODUCT.md`: users, brand, tone, anti-references, strategic principles.
- Local `DESIGN.md`: color tokens, type scale, component inventory, spacing.
- `AGENTS.md`, `CLAUDE.md`, `AI_HANDOFF.md`, `README.md`, or task docs: agent guidance and surface context.

If `PRODUCT.md` or `DESIGN.md` is missing on a major surface, note it and proceed with available context. Offer to create them after completing the task.

Render the result for visual work — screenshots beat code inspection. Minimum: desktop at 1280px width and mobile at 390px or 375px width. For product screenshot sets, verify the required platform dimensions before generating assets. Verify live URLs or APIs before claiming public behavior.

For major design work, reusable systems, reference visual matching, product screenshot assets, or public launch surfaces, keep work open only after these are known: PRODUCT.md / product context status; DESIGN.md / design-system status; shape-brief status for net-new or large redesigns; source visual-target status when a mock, screenshot, Figma frame, or reference URL exists; rendered implementation status; ship-blocker status.

## Five-Gate Checklist (Major / Public / Launch Work)

For major public or launch work, apply all five before ship: **Copy Gate, Visual QA Gate, SEO/AEO/AI EO Gate, Design System Gate, Launch Gate.** Run each using the criteria defined in the relevant lane below.

---

# Lane A — Design (visual systems, laws, tokens, type, motion, QA)

Make any interface feel intentional, premium, legible, and alive without drifting into generic AI output. Covers product UI, brand surfaces, landing pages, dashboards, component systems, responsive polish, and visual QA.

## Task Router (within Lane A)

Choose the smallest path that fits the request.

- **Clear small fix:** inspect current UI, make the narrow edit, verify render, report what changed.
- **Ambiguous or net-new design:** gather context, propose 2–3 approaches with tradeoffs, recommend one, get approval before implementation.
- **Large redesign:** write a compact shape brief first — audience, page job, register, scene, color strategy, typography, layout, signature moment, constraints, QA plan.
- **Visual system work:** scan current CSS, tokens, components, spacing, shadows, breakpoints, icon usage, and repeated UI patterns before proposing changes.
- **Source-to-implementation QA:** if there is a mock, screenshot, Figma frame, or image target plus a rendered implementation, compare both visually before handoff and save `suede-visual-qa.md` in the project root.
- **Long polish loop:** iterate through a visible checklist. If the same failure repeats, freeze the loop, reduce scope to the failing unit, and rerun with explicit acceptance criteria.

## Delivery Discipline

Do not call work done because the code changed. Call it done only when the done signal has been checked or the remaining gap is named. Use Lane D (agent teams) when several lanes must move at once (copy + layout + asset + implementation + QA). Run `$suede-code-review` before the ship gate when design work changes shared components, routing, auth, payments, analytics, release config, or public claim truth. Skip both for a small visual or copy fix that can be inspected, patched, rendered, and verified directly.

## Suede UI Contract

Before a new surface, significant redesign, reusable component family, or design-system pass, lock the design contract before implementation:

- audience, surface job, primary action, and launch stage;
- spacing scale, grid behavior, breakpoints, and stable dimensions;
- color roles, semantic states, contrast requirements, and dark/light behavior;
- typography roles, hierarchy limits, body measure, and truncation strategy;
- copy vocabulary for buttons, empty states, loading, errors, and success;
- asset sources, logo use, crop rules, screenshot states, and motion rules;
- acceptance checks for desktop, mobile, accessibility, and rendered evidence.

If the work is purely backend or a narrow one-element fix, document only the relevant contract items instead of forcing a full spec.

## Context Checklist

1. Identify the surface: repo/folder, route, live URL, deployment target, branch, dirty files, and relevant local docs.
2. Read repo-local `AGENTS.md`, `CLAUDE.md`, `AI_HANDOFF.md`, `README.md`, `PRODUCT.md`, `DESIGN.md`, or task docs when present.
3. Decide the register: **Brand** (marketing, launch, campaign, public page, portfolio, editorial) or **Product** (app shell, dashboard, tool, form, settings, admin, workflow).
4. Name the physical scene: who uses this, where, under what light, with what pressure, and what they need to do next.
5. Inspect the current rendered UI at desktop and mobile breakpoints before making claims about quality.

## Design Laws

### Subject First
Strip the logo from any surface. If the remaining visual could belong to a generic SaaS, a crypto exchange, or a music streaming app, the design has failed. Suede surfaces should feel like purpose-built studio infrastructure: precise, traceable, operator-grade. Every surface should answer: "What does a creator do here, specifically?" Every layout choice, type weight, and motion decision answers to the product's native world, not a design trend.

### One Memorable Move
Give each major surface one signature element that earns attention. For Suede: a rights ledger, waveform proof panel, chain-of-title timeline, studio console, claim map, provenance receipt, or another subject-native device. For any company: one product-native device — a live data rail, a diagnostic card, an audit ledger, a timestamp receipt — that earns attention because it only makes sense for that product. If the memorable move could appear on a competitor's site, replace it. Keep the surrounding UI disciplined so the signature move carries. Name it before implementation.

### Color
- Pick a strategy from the Color Strategy Axis before picking any values.
- Color must earn its position by encoding meaning: ownership, rights status, action type, risk level, state change, tier, or provenance chain. Decorative color is waste.
- First-order reflex to reject: "music/creator tool → dark purple gradient." Second-order trap: avoided purple but landed on muted-teal-on-dark anyway. Go further until the palette is specific to this surface's physical scene.

### Color Strategy Axis
Before picking values, commit to a strategy on this axis:
- **Restrained**: tinted neutrals + one accent ≤10% of surface area. Default for product dashboards, admin, tools, and focus-heavy workflows.
- **Committed**: one saturated color carries 30–60% of the surface. Default for brand pages and identity-driven screens. The "one accent ≤10%" rule does NOT apply here.
- **Full palette**: 3–4 named color roles, each used deliberately. Use for data visualization, campaign pages, and multi-feature products.
- **Drenched**: the surface IS the color. Use for campaign heroes, launch moments, and brand statements.

Pick a strategy before picking values. Avoid defaulting to Restrained for everything. For CSS color values, prefer OKLCH. Reduce chroma as lightness approaches 0 or 100 to avoid garish extremes. Tint every neutral toward the brand hue (chroma 0.005–0.01 is enough). Never use pure #000 or #fff.

### Dark Mode
Dark mode is not an inversion. Specific rules:
- **Surfaces:** Dark surfaces use lightness 10–18 OKLCH, not 0. Background layers stack from dark to slightly lighter: base (L=12) → elevated (L=16) → overlay (L=20) → modal (L=24). Never use pure black as a surface.
- **Shadows:** Shadows disappear on dark surfaces. Replace elevation cues with border-based layering: 1px border at `oklch(1 0 0 / 0.08)` on elevated surfaces, `oklch(1 0 0 / 0.12)` on modals. Drop-shadows only appear in dark mode when the element is physically "lifted" (a draggable card, a tooltip, a floating toolbar).
- **Contrast minimums:** body text on dark background minimum 7:1 (WCAG AAA); secondary text 4.5:1; disabled text 3:1. Do not use near-black text on dark surfaces. Use light text with opacity adjustments (`oklch(1 0 0 / 0.45)` secondary, `oklch(1 0 0 / 0.25)` disabled).
- **Chroma:** In dark mode, reduce saturated color chroma by 15–25%. `oklch(0.65 0.22 260)` in light → `oklch(0.72 0.17 260)` in dark. Fully saturated accents on dark backgrounds feel neon. Pull back.
- **Semantic tokens:** define light and dark values for every semantic token at design time — `--color-surface-base`, `--color-surface-elevated`, `--color-border-subtle`, `--color-text-primary`, `--color-text-secondary`, `--color-text-disabled`. Never hardcode hex in component CSS.

### Typography
- Pair typefaces deliberately. Display, body, and utility text should have distinct jobs: one font earns the display role (personality, brand signal), one earns the body role (readability, neutrality). They should contrast — a geometric display pairs with a humanist body; a serif display pairs with a sans body.
- Use scale and weight for hierarchy; keep at least a 1.25 ratio between major type steps.
- Keep body copy around 65–75 characters per line.
- Keep letter spacing at 0 by default. Do not use negative letter spacing.
- Match type size to context. Dashboards, cards, and toolbars need compact hierarchy, not hero-scale text.

Type anti-patterns to avoid without explicit justification: overused system fonts (Inter, Roboto, Arial, SF Pro) as the display face; symmetric pairing (display and body from the same family); uniform weight across headline/subhead/body; letter-spacing on body copy; negative letter-spacing on small text (under 16px).

### Fluid Type Scale
Use `clamp()` for all responsive type: `clamp(min, preferred, max)` where preferred is viewport-relative.

```css
--text-xs:   clamp(0.75rem,  0.70rem + 0.25vw,  0.875rem);
--text-sm:   clamp(0.875rem, 0.82rem + 0.28vw,  1rem);
--text-base: clamp(1rem,     0.94rem + 0.30vw,  1.125rem);
--text-lg:   clamp(1.125rem, 1.0rem  + 0.62vw,  1.375rem);
--text-xl:   clamp(1.375rem, 1.1rem  + 1.40vw,  2rem);
--text-2xl:  clamp(1.75rem,  1.3rem  + 2.20vw,  3rem);
--text-3xl:  clamp(2.25rem,  1.6rem  + 3.25vw,  4.5rem);
```

Min is the floor at ~375px; max is the ceiling at ~1440px; the vw value controls growth aggression. Never use fixed `px` font sizes for display, heading, or subheading roles. Fixed sizes are acceptable only for UI chrome (badges, labels, captions) that must not resize. Line height scales inversely with size: large display (≥2xl) uses 1.05–1.1; body uses 1.5–1.6; subheadings 1.2–1.35.

### Layout
- Make structure explain the product. Use bands, rails, timelines, consoles, grids, tabs, and split panes because the content needs them.
- Spatial composition — intentional layouts use asymmetry (column grids that don't divide evenly, intentional weight on one side), overlap (elements breaking their rows to create depth), diagonal flow (content leading the eye along a non-horizontal axis), and generous negative space OR controlled density, not an accidental middle ground.
- Never use a card where a row would do. Use cards only for items that must be independently scannable, draggable, or selected — not as a visual wrapper for sections, tabs, or form groups. One card inside another card means the information architecture is wrong. Fix the hierarchy, not the nesting.
- Stable UI elements need stable dimensions: boards, grids, icon buttons, counters, tiles, canvases, and toolbars should not resize when labels, hover states, loading text, or data changes.
- On landing pages, the first viewport must show the brand, product, or offer clearly and leave a hint of the next section visible on mobile and desktop.
- Text must not overlap, clip, or fight its container at any viewport.

### Controls
- Use icon buttons for familiar commands when the icon exists in the local icon set. Add tooltips for icons that are not obvious.
- Use segmented controls for modes, toggles or checkboxes for binary settings, sliders or inputs for numeric values, tabs for views, menus for option sets, and text buttons for commands.
- Keep touch targets usable and focus states visible.

### Component Laws
**Forms:** Every form field shows its label above the input, never as placeholder text. Placeholder is hint text only — it disappears on focus and must not carry required information. Error messages appear below the field they belong to, not as a toast. Required fields are marked; optional fields are not (the default expectation is required). A submit button is always the primary action; it is disabled only when the form is provably incomplete, never as the default initial state.
BEFORE: `<input placeholder="Email address" />` with no visible label
AFTER: `<label>Email address</label><input placeholder="e.g. you@studio.com" />`

**Modals:** A modal is for a destructive action, a focused sub-task that needs temporary full attention, or a preview that shouldn't break navigation context. It is not the first answer to "the user needs more information." Use inline expansion, a side drawer, or a dedicated route when the content is browseable or the action is reversible. Every modal has one primary action and one escape (keyboard Escape + backdrop click). Never stack modals.
BEFORE: clicking "details" opens a modal with a scrollable list of 12 items
AFTER: clicking "details" expands an inline panel or navigates to a detail route

**Empty states:** An empty state is a conversion opportunity, not a placeholder. It must contain: what would be here (one concrete example), why it's empty (the specific reason), and what to do next (a single, specific action). Never show just an illustration and "No results found." Name the specific thing that's missing.
BEFORE: `[Icon] No tracks yet.` with a disabled button
AFTER: `Register your first work to start building your rights ledger. [Register a Work →]`

**Data tables:** Column headers are left-aligned except numeric columns, which are right-aligned. Rows are 40–48px tall for data-dense tables, 56–64px when each row needs a secondary line. Alternating row fills are a last resort for wide tables with more than 8 columns — prefer generous column padding and strong header contrast. Sort indicators are visible on hover for all sortable columns, not just the active one. Pagination controls live below the table, right-aligned, with total count visible at all times.

**Navigation:** Primary navigation shows the user's current location at all times with a visible active state that is not just color — use weight, underline, or background shape so it survives grayscale. Depth beyond three levels means the information architecture needs restructuring, not another nav level. Mobile nav collapses to a bottom tab bar (max 5 items) or a full-screen drawer. Never a hamburger that reveals a sidebar on a phone.

### Assets
- Use real product, creator, media, logo, or generated bitmap imagery when the surface needs a visual asset. Do not replace visible brand assets, product imagery, or nonstandard icons with CSS shapes, emoji, placeholder divs, or improvised inline drawings.
- Use approved Suede logo files from the current project, public repo assets, or an operator-provided brand folder. Do not reference private local asset paths in public docs, screenshots, or generated output.
- For 3D work, use Three.js and verify the canvas is nonblank, framed, interactive or moving as intended, and responsive.

### Motion
- Motion posture by register: brand surfaces earn motion as premium signal (entrance reveals, parallax subtlety, micro-transitions); product surfaces use motion only to clarify state change or sequence (no decorative animation in dashboards or settings); docs surfaces use no motion; campaign surfaces use motion only on the primary CTA or hero transformation. Motion that cannot be explained as "this clarifies X for the user" is decorative — cut it.
- Every animation must justify its CPU cost. If removing it makes the UI clearer, remove it. If keeping it makes an action legible (a row sliding out when deleted, a panel expanding from its trigger, a success state settling into place), keep it.
- Never animate width, height, top, left, or margin. Animate `transform` and `opacity` only.
- Exit curve: `ease-out-expo` (`cubic-bezier(0.16, 1, 0.3, 1)`), duration 220–280ms. The UI should feel like it arrives, not drifts.
- Entrance sequencing for lists, cards, and panels: `translate3d(0, 12px, 0)` → `translate3d(0, 0, 0)` + opacity 0→1, 240ms ease-out-expo, stagger 40ms per item, max 6 items staggered then clamp. Cap total reveal at 480ms. Panels enter at 300ms; hero content at 180ms.
- Scroll-triggered reveals fire once, not on every scroll-direction change. Use `IntersectionObserver` with `threshold: 0.15`.
- In React, use Motion (Framer Motion). Always include a `prefers-reduced-motion` variant that removes translate and cuts duration to 0ms.

### Never Ship (signals that no design decision was made)
Decorative orbs, gradient-as-personality, icon-card grids as the entire page, fake metrics, unverified partner logos, or stock testimonials. Exceptions require a direct source-fidelity or platform-convention justification.

## Aesthetic Direction

For any new surface or significant redesign, commit to a clear aesthetic direction before writing code. Name it explicitly.

Tonal spectrum — choose one and execute it with precision:
- **Refined minimal**: restraint, negative space, weight as the only accent, no ornamentation.
- **Editorial**: strong typography hierarchy, asymmetry, text as structure, headline-first layout.
- **Brutalist**: raw grids, exposed structure, high contrast, deliberate anti-polish.
- **Retro-technical**: monospace, terminal palette, scan-line texture, system-UI references.
- **Organic**: rounded forms, warm neutrals, tactile texture, soft shadow.
- **Maximalist**: density as delight, layered elements, multiple active typefaces, controlled chaos.
- **Luxury refined**: generous space, serif hierarchy, muted palette, detail-obsessed craft.
- **Product-utilitarian**: information density, data-first, compact controls, no decorative chrome.

Bold maximalism and refined minimalism both work. The failure mode is neither: a design with no committed direction reads as generic. Pick one tone and execute it fully.

**AI slop check** — before committing to an aesthetic, run two reflex tests:
1. Could someone guess the theme and palette from the product category alone ("observability → dark blue", "healthcare → white + teal")? That's the first-order training-data reflex. Reject it.
2. Could someone guess the aesthetic family from category-plus-anti-references? That's the second-order trap. Go further.

**Theme sentence** — name the physical scene concretely enough that it forces the design answer. "A studio engineer reviewing a rights dispute at 2am on a secondary monitor" forces different choices than "a user looking at data." If the sentence doesn't force the answer, add detail until it does. Dark vs. light is never a default.

**Background and atmosphere** — gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, grain overlays, and decorative borders are all legitimate tools when they serve the aesthetic. Do not substitute generic gradient blobs, bokeh orbs, or CSS-only approximations for real art direction.

## Scoped Bans And Exceptions

These are not blanket bans. Keep or recreate a pattern when source fidelity, platform convention, accessibility, a confirmed brand system, or a direct user request makes it the right choice. When making an exception, name why it is earned. Rewrite the element if any of these appear as a lazy default:

**Gradient text.** BEFORE: `-webkit-background-clip: text` rainbow/metallic on headlines. AFTER: a single high-contrast headline at full weight with an accent word in a solid color, or a single-hue gradient at low chroma (a slight lightness shift).

**Decorative glass panels (blur + translucent background).** BEFORE: `backdrop-filter: blur(20px)` card floating over a gradient. AFTER: an opaque surface at the correct elevation token, with a 1px border for definition.

**Colored side-stripe borders on cards, alerts, or list items.** BEFORE: a card with a 4px left border in `--color-warning`. AFTER: an icon + label in the semantic color inside the card; or a full-width top-of-card banner strip carrying text.

**The hero-metric template (big number, tiny label, support stats, gradient accent).** BEFORE: `$2.4M` in 80px weight-900 with "Revenue generated" in 12px below. AFTER: a metric placed inside a real workflow context — the royalty total shown inside the rights ledger column it belongs to, not isolated as a hero number.

**Identical icon-card grids as main page structure.** BEFORE: 3×2 grid of cards each with icon + title + one-line description. AFTER: a task-driven layout where each row or section maps to a specific user action, not a product category.

**Modal as the first answer to every interaction.** BEFORE: every "view details" → modal. AFTER: inline expansion, side panel, or dedicated route; modal reserved for destructive confirmation or focused isolated actions.

**Decorative orbs, bokeh blobs, generic gradient backgrounds.** BEFORE: three radial gradients at 30% opacity behind the hero. AFTER: a concrete art-direction choice — a noise texture, a geometric system, a real product screenshot, an illustrated scene, or a typographic lock-up that IS the background.

**Centered hero copy over a stock-feeling gradient with no real artifact.** BEFORE: "Own Your Music" centered on dark purple, no visual content below. AFTER: a hero containing a real product artifact (a partial rights registry UI, an animated waveform ledger, a claim receipt) with copy anchored to it.

**Fake metrics, fake testimonials, fake partner claims.** No exception. Remove and replace with either (a) a real stat with a source note, (b) a placeholder with a `[NEEDS REAL DATA]` flag, or (c) a structural element that doesn't depend on a specific number.

**Em dashes in UI or marketing copy.** Use a period, colon, or comma. If the clause needs an em dash, restructure the sentence.

## Design System Quality Of Life

For any major surface, reusable app shell, launch system, or important component family, produce these at the smallest useful fidelity:
- **Token map:** color roles, type scale, spacing, radii, shadows, motion, z-layers, and semantic state names, stored in `DESIGN.md` or `design-tokens.json`.
- **State matrix:** default, hover, focus, active, disabled, loading, empty, success, warning, error, and permission-denied states for every component that touches data.
- **Copy vocabulary:** action labels, toast language, error messages, and empty-state prompts that stay consistent across the product.
- **Screenshot contract:** named states with seeded demo data so marketing, product listing, QA, and docs reproduce the same visuals.
- **Accessibility pass:** contrast ratios, focus order, touch targets, keyboard paths, and reduced-motion compliance.
- **Migration notes:** what old styles still exist, what not to touch, and how new work adopts the system without rewriting unrelated screens.

Extract a design-system issue when a token, component, spacing pattern, color, type treatment, or state pattern repeats at least three times or controls a high-visibility surface. Classify drift root cause as: token missing, token ignored, component gap, content pressure, platform convention, or legacy debt.

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

## Visual QA Report (Lane A)

When comparing a source visual target against an implementation, save `suede-visual-qa.md` with:
- source visual truth path or URL
- implementation path, URL, or screenshot
- viewport and state
- theme, auth state, content/data state, and interaction state
- full-view comparison evidence
- focused region comparison evidence, or why it was not needed
- findings ordered by P0/P1/P2/P3 severity
- patches made after the previous pass
- `final result: passed` or `final result: blocked`

Compare source and implementation in the same visual pass, not from memory. Check typography, spacing/layout, colors/tokens, image and asset fidelity, logos/icons, copy/content, loading/empty/error/hover/focus/active states, responsiveness, accessibility, and motion where relevant. Use `final result: blocked` when the source or rendered artifact is missing for a required comparison, or when actionable P0/P1/P2 issues remain. Use `passed` only when no actionable P0/P1/P2 findings remain.

---

# Lane B — Suedify (reference → target visual-DNA translation into tokens)

Use this lane when the user wants:

```text
reference_url -> target_url
```

Example: "Use apple.example and make suede.example look like it."

The output makes the target site inherit the reference's design logic, rhythm, hierarchy, and interaction feel while remaining legally and brand safe. This lane recreates design grammar with the target's own brand, content, product, and assets. It does NOT copy proprietary code, logos, exact copy, private assets, or trademarked identity, and it does not transfer the reference's claims, proof, pricing, or guarantees to the target.

## Required Inputs
- `reference_url`: the site whose style should be studied.
- `target_url`: the site to transform.
- Target source: repo/folder/branch when implementation is expected.
- Optional depth: homepage only, key route set, full site, landing page, app shell, mobile, or screenshot-only concept.
- Optional fidelity: inspired-by, close-visual-match, or aggressive-restyle.

If either URL is missing, ask for the missing URL. If no source repo is known, inspect the target URL and produce `suedify-implementation-plan.md` instead of pretending edits can be applied.

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

## Suedify Workflow
**Run to completion in one pass.** Do not stop to ask clarifying questions once a reference URL and target are known. If depth or fidelity is not specified, default to homepage + hero + primary CTA section, close-visual-match fidelity. State what you chose in the Ship Gate.

1. **Verify target and permissions.** Identify the exact target repo/folder before editing. If inside a multi-repo workspace, do not edit from the container root. Run repo-local git status, remote, and recent log before changes. Preserve user and other-agent WIP.
2. **Capture the reference.** Open the reference URL. Capture desktop, tablet when useful, and mobile screenshots with named paths. Record viewport widths, theme, state, auth/content conditions, and any interactions needed. Record grid column count and max-width, section band height ratios (hero : content : proof : CTA), type scale (H1 size+weight, body size+line-height, caption), primary/secondary/surface color values, border-radius and shadow signature, motion character, image treatment (full-bleed vs. contained; photography vs. illustration vs. 3D), icon family (outlined / filled / custom), and CTA hierarchy. Motion capture: open DevTools, run `getComputedStyle(document.body).getPropertyValue('--transition-base')`, inspect active elements for `transition`/`animation` values; note cubic-bezier or named easing, duration in ms, which elements animate on hover vs. scroll, and whether scroll animation is CSS `@keyframes` + IntersectionObserver or a JS library (GSAP, Framer Motion, AOS — the library signals the perf budget). Save the analysis as `DESIGN.md` in the target repo root.
3. **Capture the target.** Open the target URL and local source route. Capture target screenshots at matching widths, state, theme, auth/content, and interaction state. Identify what target content, assets, routes, and claims must remain. Mark dead links, broken layout, weak copy, missing assets, and unverified claims.
4. **Make the translation map.** Map reference → target-safe equivalents (nav→nav, hero→hero, media→target-owned media, proof→target proof, CTA ladder→CTA ladder, motion→motion). Do not copy exact proprietary assets, exact UI copy, or protected brand identifiers. Run Token Distiller; output the full `:root {}` CSS block.
5. **Implement.** Work inside the target's existing framework, tokens, routes, and component patterns. Update design tokens before one-off component styling when the restyle is broad. Keep content truthful to the target — a reference's claims do not become target claims.
6. **Render and compare.** Run the local server or preview. Capture target screenshots at the same widths used for the reference. Compare reference and target together in the same pass, not from memory — hierarchy, spacing, contrast, typography, image treatment, icon family, section rhythm, CTA visibility, interaction states, mobile composition. Use focused crops for hero, nav, cards, forms, CTAs, icons, logos. Patch until the largest mismatches are fixed or named.
7. **Verify and ship.** Run relevant lint, typecheck, test, build, or focused commands. Run `git diff --check` when files changed. Verify live URLs before claiming a public restyle. End with `ship`, `ship-with-caveats`, or `hold`.

## Fidelity Rules
The target MAY closely match: layout proportions, typographic scale and rhythm, color role structure, section pacing, navigation density, interaction feel, image crop strategy, product proof structure, and mobile composition.

The target MUST NOT copy: reference logos or trademarked marks, exact marketing copy, proprietary source code, private media or downloadable assets, fake partner/customer proof, or pricing/guarantees/metrics/claims that do not belong to the target.

If the user asks for an exact clone of a protected site, produce a close, target-branded interpretation instead and state the constraint briefly.

## Suedify Output Artifacts
Every suedify run produces `DESIGN.md` in the target repo root with all token fields filled from the reference extraction. For multi-section work also produce `suedify-visual-qa.md`. For planning-only runs (no target repo), produce `suedify-implementation-plan.md`. Never produce empty or partially-filled token files — if a value cannot be extracted, record `UNKNOWN` with the reason.

### DESIGN.md Template
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

## Suedify Ship Gate
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

---

# Lane C — Copy (writing mode, ON by default)

Write the words for what this skill designs: conversion copy, page copy, GitHub docs, email, and social posts that are specific, proof-backed, and free of AI boilerplate. Default voice: Suede. A company brief overrides everything. Writing mode is on by default — a surface is not finished until the copy carries it.

## Before Writing
Read available context first: `PRODUCT.md`, `README.md`, `AGENTS.md`, `AI_HANDOFF.md`, `DESIGN.md`, product/brand notes, task docs. If context is missing after reading, ask only for what blocks accurate copy: page or doc type; primary reader; one action the reader should take; product or skill being offered; proof safe to claim; claims/pricing/partners/metrics not approved; traffic source or publication surface.

## Core Rules
Name the outcome, not the feature.
- Weak: "Suede supports multiple metadata formats." Strong: "Export ISRC, ISWC, and split data in one command."

Write buttons as actions with a result.
- Weak: "Learn more" → Strong: "Read how rights routing works." Weak: "Get started" → Strong: "Register your first release."

Replace vague claims with artifacts.
- Weak: "Suede makes rights management easy." Strong: "Paste your folder path. Suede outputs your ISRC, split sheet, and licensing flags in under 10 seconds."

No invented proof — do not write stats, testimonials, partner names, pricing, or legal clearance that has not been confirmed. If proof is unavailable, write around the gap or flag it for the human to supply. No em dashes. No exclamation points. No rhetorical questions that answer themselves.

## Persuasion Frameworks
Match framework to surface and reader temperature. State the chosen framework and reader temperature before drafting. If multiple could apply, pick one and note why.
- Reader arrives cold, no prior awareness → **AIDA** (Awareness → Interest → Desire → Action). Lead with the category problem, build specificity, make the outcome concrete, drive a single action.
- Reader has a named pain and is actively searching → **PAS** (Problem → Agitate → Solution). Name the problem, surface the cost of inaction, position the product as the specific relief.
- Hero section, social post, launch email → **Before-After-Bridge**. Describe life before, paint life after, bridge with the product as the mechanism.
- Product page, onboarding, in-app copy → **JTBD**. Write around the job the reader hired the product to do, not features.
- Homepage, About, long-form brand page → **StoryBrand 7-Part**. Character (customer) → Problem → Guide (your brand) → Plan → CTA → Avoid failure → Achieve success.

## Headline Formulas
Generate at least 3 headline candidates for any hero or email subject. Pick the formula that matches the reader's state and the page's job.

| # | Formula | Structure | Example |
|---|---------|-----------|---------|
| 1 | Curiosity gap | [Intriguing partial claim] | "Most release folders fail the first licensing check. Here's why." |
| 2 | Number-led specificity | [#] [specific thing] [timeframe/condition] | "12 rights fields missing from your release. Suede finds them in 60 seconds." |
| 3 | How-to outcome | How to [achieve outcome] [without/with condition] | "How to package a release folder that licensing teams can actually use" |
| 4 | Because | [Result] because [mechanism] | "Agents can read your music rights because Suede structures the provenance first." |
| 5 | Specificity anchor | [Exact number or name] + [claim] | "47 fields. One linter. No guessing." |
| 6 | Before-After | [Before state] → [After state] | "Scattered files and a split sheet in a Google Doc → a machine-readable rights package" |
| 7 | Question (real, not rhetorical) | [Question reader actually asks] | "What does a licensing team check before they sign?" |
| 8 | Objection flip | [Common objection] + [reframe] | "Rights metadata sounds like legal work. It's a 10-minute audit." |
| 9 | If-then conditional | If [specific situation], then [specific outcome] | "If your release goes to a sync library, this is the metadata they'll reject first." |
| 10 | Direct claim with proof hook | [Bold claim] + [verifiable detail] | "Suede reads your folder. You get ISRC, split, and flags before you pitch." |
| 11 | Problem named exactly | [Specific failure mode the reader fears] | "Your ISRC is assigned. Your split sheet is a PDF. Neither is machine-readable." |
| 12 | Authority + specificity | [Who trusts this] + [for what exact task] | "The metadata structure sync licensing teams check on day one." |

Test: swap your product name for a competitor's. If the headline still works, it is not specific enough.

## Buyer Persona Modes
State the persona before writing. If multiple personas share a page, write the hero for the decision-maker and include practitioner proof in the secondary section.
- **Decision-maker** (exec, founder, buyer): Lead with outcome and cost of inaction. Proof = outcomes, not features ("Cut release prep from 3 days to 40 minutes"). CTA low-risk, high-clarity ("See the workflow"). Skip implementation details, CLI commands.
- **Practitioner** (developer, designer, operator): Lead with how it works. Proof = commands, file paths, schema examples, error outputs. CTA direct ("Run the linter" / "Fork the skill"). Skip ROI language, vague transformation claims.
- **Skeptic** (comparison shopper, previously burned): Lead with the objection, named ("Every tool claims to solve this. Here's what's different."). Proof = third-party verifiable ("Open the script. Read the output."). CTA zero-pressure ("Read the code" / "Run it yourself"). Skip hype, superlatives.
- **Creator / end-user** (non-technical): Lead with what changes for them, in plain language. Proof = before/after in human terms. CTA lowest-friction ("Try it with one release folder"). Skip technical vocabulary, command syntax.

## Page And Docs Structure
For a page, README, or docs surface, build this spine (use only the pieces that fit for a small section):
1. **Hero:** one sentence that names the outcome.
2. **Subhead:** one or two sentences adding audience, workflow, and proof.
3. **Primary CTA:** the action the reader can take now.
4. **Proof:** files, scripts, docs, screenshots, URLs, live routes, examples, or commands.
5. **How it works:** three or four steps, each with a verb and result.
6. **Safety:** what the workflow does not claim or do.
7. **FAQ:** direct answers for objections and search intent.
8. **Final CTA:** repeat the action with less friction.

## A/B Variant Generation
For high-stakes copy (hero headline, primary CTA, email subject, ad copy), always generate variants and label each with its angle. Let the user pick rather than guessing.
- **Headlines:** 3 variants — outcome-led (what the reader achieves), problem-led (what the reader escapes), mechanism-led (what makes this different).
- **CTAs:** 2 variants minimum (see formulas below).
- **Email subjects:** 3 variants — curiosity or benefit; social proof or number; direct question or challenge.

## CTA Formulas
Every CTA answers: "What happens the moment I click this?"
- **Formula A — Verb + immediate result:** "Run the audit. Get your grade in 60 seconds." / "Fork the skill. Live in your Codex in under a minute." / "Paste your folder path. See your rights gaps."
- **Formula B — Verb + object + benefit:** "Register a release. Make it readable to licensing agents." / "Install the skill. Audit any repo from your terminal." / "Download the schema. Stop building it by hand."
- **Formula C — Low-commitment framing** (skeptic / discovery): "See how rights routing works" / "Read the spec" / "Open the repo" / "Watch a 90-second demo."
- **Formula D — Stakes-aware framing** (decision-maker): "Start the audit before the pitch" / "Get the split sheet the label actually needs" / "Ship the release with provenance attached."

Anti-patterns to cut: "Get started" (started what?), "Learn more" (more about what?), "Sign up" (for what?), "Try for free" without naming what they're trying, any CTA with an exclamation point. The 3-word test: describe what happens after clicking in 3 words. If you cannot, the CTA is too vague.

## Email Copy
**Subject lines** win opens on curiosity, self-interest, or specificity — pick one per line. Curiosity: "[Specific thing most people miss]" / "The [category] rule that [counterintuitive result]." Self-interest: "[Outcome] in [time] without [obstacle]" / "Your [specific thing] is [state]. Here's the fix." Specificity anchor: "[#] [specific mistakes/fields/steps] in your [thing]." Avoid rhetorical questions, all-caps words, "Re:" faking a reply thread, emojis for B2B/technical audiences.

**Preview text** is a second subject line — add information, don't echo. Subject: "12 metadata fields your release is missing." Preview: "The ones sync libraries check before they respond." Keep under 90 characters; the first 40 must stand alone.

**Body structure:**
```text
Hook (1-2 sentences): Name the problem or opportunity at the moment the reader is experiencing it.
Proof or evidence (2-4 sentences): Specific, not general. One example beats three claims.
Bridge (1 sentence): Connect the proof to the offer.
CTA (1 sentence + link): One action, one link. No secondary options in the primary CTA block.
P.S. (optional): A single secondary offer or a time constraint. Not both.
```
Unsubscribe-reduction: match content to the opt-in promise; segment before sending; run a re-engagement sequence before suppressing inactive subscribers (three emails over 30 days — one value, one direct question, one break-up; suppress non-openers after).

## Social Post Formats
**LinkedIn** — hook = the first two lines before "see more"; it is the post. Works: specific observation, counterintuitive claim, single concrete number, named failure mode. Fails: vague industry wisdom, rhetorical questions, inspirational openers, "I'm excited to share." Structure: hook → 2–4 line break → insight/story (3–6 short paragraphs, one idea each) → takeaway → one low-friction CTA. Rules: paragraphs 1–2 sentences max; no bullet lists over 5 items; one link max (in comments if the algo penalizes in-post links); 1–2 hashtags at the end.

**X / Twitter** — standalone tweet: [specific observation or fact] + [one implication or action], max 240 chars. Thread opener: [bold specific claim], blank line, "[Thread: number + what the reader gets]" — the opener must be the strongest tweet; do not save the best point for tweet 5. Reply to trend/news: acknowledge in 1 sentence, give a specific take from your vantage point, optional link.

**Instagram** — product/feature reveal: hook (what it does in one sentence) → why it matters for this audience → one specific proof point → CTA in bio/link sticker. Behind-the-scenes: name the moment/decision → what you learned or chose and why → invitation. Testimonial: lead with the result (not the quote) → quote/paraphrase → bridge to offer → CTA. Rules: first line a complete thought (1–2 lines show before "more"); hashtags in first comment or after a line break, never inside body; no more than 10 hashtags.

## Suede Voice
Confident, not breathless; technical enough for builders; clear enough for creators; polished, not corporate; specific, not cute; operator-grade, not brochure-grade. Good Suede copy names what the reader controls: register a work, verify rights, route royalties, publish a claim, package a release folder, prepare licensing evidence, make a work readable to agents, compare provenance, ship a public skill page. (For non-Suede work, supply the equivalent domain vocabulary in the company brief.)

## SEO And GitHub Copy
For GitHub repositories, skill docs, and Pages sites, treat SEO as the umbrella for search, AEO, and AI EO. Include: a search-ready title under 60 characters when practical; a meta description under 160 characters; repo description under GitHub's practical limit; 8–20 topic keywords when the surface supports them; a first paragraph that repeats durable entity names naturally; answer-ready definitions, FAQ copy, and proof links AI summaries can cite without inventing facts; links to install docs, manifests, scripts, references, examples, live Pages, and source; a safe public claim boundary. Use keywords because they help the right reader find the page — do not cram a keyword where a human would notice.

Suede durable keywords (replace for non-Suede work): Suede Creator Skills, Suede Rights Passport, Suede Release Linter, Suedify, Suede Copy, AI EO, AEO, answer engine optimization, Codex skills, Claude Code skills, SKILL.md, music rights, creator rights, release readiness, provenance, royalty splits, licensing readiness, programmable IP, agent commerce, GitHub Pages.

When the copy workflow includes an SEO pass (metadata, structure, or copy quality only): **Metadata** — title, meta description, Open Graph, Twitter card, image alt, author/publisher, durable entity names. **Structure** — one H1, useful H2/H3 hierarchy, FAQ fit, internal links, descriptive anchor text. **Copy quality** — directness, proof, claim boundaries, CTA clarity, trust language, filler, vocabulary fit. For a deep standalone SEO/AEO/AI EO audit, run `$suede-seo-audit` instead.

## Anti-Slop Pass
Run this as a line-edit gate before delivery, not a vibe check.

### Word Substitution List (non-negotiable swaps)
| Cut | Replace with |
|-----|-------------|
| utilize | use |
| leverage (as verb) | use, apply, run |
| seamless | remove or prove it: "no export step", "one command" |
| powerful | prove it: "processes 10k records in 4 seconds" |
| innovative | cut; name the innovation instead |
| revolutionary | cut entirely |
| game-changing | cut entirely |
| solution | name what it actually does |
| ecosystem | platform, system, toolchain (pick the accurate one) |
| empower | cut; say what the person now controls |
| unlock | cut; say what was blocked and is now accessible |
| streamline | speed up, cut the step, reduce from X to Y |
| intuitive | cut; prove it with a UX detail |
| robust | cut; name the specific capability |
| best-in-class | cut; or supply the benchmark |
| next-generation | cut; name what changed |
| cutting-edge | cut entirely |
| world-class | cut; or name the credential |
| end-to-end | name the actual start and end |
| holistic | cut; describe the scope instead |
| scalable | prove it: "handles X at Y load" |
| simple / simply / just / easy | cut or prove it with a step count |
| we believe / we think | cut; make the assertion directly |
| in order to | to |
| due to the fact that | because |
| at this point in time | now |
| going forward | cut; state the new behavior directly |
| synergy / synergistic | cut entirely |
| value-add | name the value |
| best practices | name the practice |

### Readability Gate
Flesch-Kincaid Grade 8–10 for B2B general; Grade 6–8 for consumer/onboarding; Grade 10–14 for technical/developer where precision requires complexity. Average sentence length under 18 words for consumer, under 22 for B2B. Flag paragraphs over 4 sentences.

### Structure Gate — rewrite
Binary setup lines; negative listing that defines the product by what it is not; formulaic "not X, but Y" pivots; false transformation arcs; dramatic fragments; rhetorical questions that answer themselves; three-item cadence when two items work; repeated punchy paragraph endings; Wh-starter crutches when a direct actor and verb work better.

### Actor Gate
Name who does the action — prefer the creator, operator, buyer, agent, page, repo, workflow, file, command, route, or proof artifact. Weak: "The page converts traffic." Better: "The page routes visitors to the audit, the proof link, or the build request." Weak: "The market rewards provenance." Better: "Licensing teams can inspect the provenance trail before they ask for the split sheet."

### Rhythm Gate
One idea per sentence. Vary sentence length without em dashes. Do not stack slogans where a concrete sentence builds more trust. Cut lazy extremes (always, never, everything, nothing) unless literally true.

### Pull-Quote Gate
If a line sounds manufactured for a quote card, rewrite it with a real artifact, action, or proof point. Weak: "The future of creator ownership is here." Better: "Suede turns a release folder into rights, provenance, split, and licensing evidence an agent can read." Weak: "We're changing how music rights work." Better: "Paste a folder path. Suede returns your ISRC status, missing fields, and a split-ready JSON file."

### Copy Score (before handoff)
```text
Directness: /10
Rhythm: /10
Trust: /10
Specificity: /10
Authenticity: /10
Density: /10
Search/AI readability: /10
Total: /70
```
Revise below 58/70. For public launch, homepage, GitHub, product listing, investor-adjacent, or ambassador copy, aim for 62/70 or higher.

## Copy Output Shapes
**Page Copy:** Title / Meta description / Hero / Subhead / Primary CTA / Sections / FAQ / Final CTA / Safety note.
**GitHub Skill Copy:** Skill / One-line description / Reader / Primary action / Repo/Docs copy / Install CTA / SEO title / Meta description / Keywords / Safety boundary.
**Copy Review:** Findings / Rewrites / Claims to verify / Score / Ready: yes | with caveats | no.

## Copy Ship Gate
Do not ship copy when: the primary action is unclear; the page promises a feature the product does not implement; proof is fake or unverified; the copy hides a legal, payment, privacy, or release caveat; the writing sounds generic enough to belong to any AI product. End copy-only requests with the exact copy, not a long explanation of the copy.

---

# Lane D — Agent Teams

For multi-agent orchestration, large cross-lane builds, WIP protection, RFC workflows, and rollback coordination: invoke **suede-agent-teams** with the full creative brief and context. It is the canonical source for multi-agent builds — do not duplicate its protocols here.

---

# House Process (applies across every lane)

## Workflow Spine (the repeatable order)
1. **Read current truth first.** Open the live URL or screenshot. Read the source route. Check dirty files, docs, and existing copy. Identify the surface type (brand, product, app, campaign, docs) — this determines tone density, motion posture, and layout defaults before any pixel moves.
2. **Shape the page job.** Decide what the surface must help the reader do.
3. **Lock the visual direction.** Choose layout, type, color roles, asset strategy, motion posture, and one memorable subject-native move.
4. **Write with the design.** Improve headings, buttons, body copy, empty states, errors, proof blocks, FAQ, SEO/AEO/AI EO, answer-ready summary, and product or mobile copy when relevant. (Writing mode is on by default.)
5. **Build narrowly.** Use existing framework, components, tokens, and icon library. Avoid unrelated refactors.
6. **Render and compare.** Check desktop and mobile, first viewport, text fit, spacing, states, accessibility basics, links, and visual balance.
7. **Run visual QA.** For source-to-implementation work, compare source visual truth and rendered implementation together, with matched viewport, state, theme, auth, content, and interaction conditions.
8. **Grade visibility (public surfaces).** Run `$suede-visibility-grader` when asked, or score findability, CTA pull, proof, AI readability, SEO strength, and design signal.
9. **Review and ship.** Run the relevant test/build/check commands, then hand off with evidence and caveats.

## Design Contract
Before major design work, name:
```text
Objective:
Surface:
Audience:
Primary action:
Register: brand | product | docs | campaign | app workflow
Reference URL or visual target:
Done signal:
Constraints:
Lanes:
```
For small polish work, compress to target, route, primary action, and done signal. For major design work, add: Source truth / Design brief confirmed / Render evidence / Reference/mock status / Design-system status / mobile product state coverage / Ship blockers.

## Surface Modifier Moves (notes, not shell commands)
Use these as lenses, named where useful:
- `/vibe-scan`: name the current feeling, desired feeling, and the mismatch that blocks trust, desire, clarity, or action.
- `/first-frame`: judge only the first viewport for brand, offer, proof, and primary action.
- `/desire-line`: trace the path from first glance to click and remove sections that do not increase want, trust, urgency, or clarity.
- `/hero-voltage`: sharpen the hero around a concrete noun, buyer-visible outcome, proof hint, and one primary CTA.
- `/offer-spine`: reduce the page to one buyer, one pain, one transformation, one proof stack, and one action.
- `/cta-magnet`: turn vague buttons into specific actions with clear next-step value.
- `/objection-burn`: answer the smart buyer's hesitation with proof, scope, limits, and risk reversal.
- `/palette-pressure`: improve contrast, hierarchy, semantic roles, and palette richness without one-hue design.
- `/type-chemistry`: tune display, body, mono, button, and caption type so the page feels deliberate and readable.
- `/section-rhythm`: balance density and breathing room so proof, product, story, and action do not collapse into a wall of cards.
- `/trust-lacquer`: turn trust marks, stats, logos, testimonials, security, and proof claims into a real argument without fake proof.
- `/proof-stack`: build a layered proof argument from artifacts, links, screenshots, commands, examples, quotes, docs, and visible product evidence.
- `/console-moment`: add one inspectable product-style moment (status rail, audit result, campaign ledger, asset passport, workflow card).
- `/aeo-shine`: tune titles, metadata, schema, headings, answer blocks, FAQ, plain-language summaries, and crawler-readable structure.
- `/visitor-intent`: surface what the visitor is trying to do and route them to the right proof, action, docs, demo, or contact path.
- `/proof-to-pipeline`: connect proof, content, landing pages, visitor signals, follow-up, and next actions.
- `/mobile-seduction`: make mobile feel intentionally composed instead of merely stacked.
- `/motion-restraint`: use motion only when it clarifies state, sequence, or premium feel, and respect reduced motion.
- `/link-sweep`: click or inspect every CTA and navigation path, then remove or replace dead or misleading routes.
- `/ship-polish`: run formatting, checks, browser QA, screenshots or render notes, link checks, and live verification before handoff.

## Progressive Calibration (say what worked / what missed)
Accept feedback at any point, not only after final handoff. When the user says what worked, preserve that pattern in the current pass and mirror it later. When the user says what missed, adjust immediately instead of defending the previous direction.

If the user says `cue suede`, asks for feedback choices, or seems to be calibrating mid-stream, pause at the next safe checkpoint and offer:
```text
Cue Suede:
1. Change something - tell me what to revise and I will adjust it.
2. Preserve this - tell me what worked so I can mimic it later.
3. Keep as-is - say nothing and I will treat it as accepted.
```
Do not block completion waiting for a `Cue Suede` answer. If the interface supports choice chips, use `Change something`, `Preserve this`, and `Keep as-is`. (Rename to "Cue [Company]" when a company brief is active.)

## Boundaries (claim-safety — preserve verbatim in spirit)
This skill organizes and prepares creative work. It does NOT clear rights, confirm ownership, approve payouts, write to a registry, guarantee placements, or guarantee outcomes.
- Do not expose private paths, credentials, secrets, tokens, unreleased assets, private repos, or private service details.
- Do not copy protected site assets, exact UI copy, proprietary source code, or trademarked identity when using the Suedify lane.
- Do not invent metrics, pricing, partner claims, testimonials, legal clearance, payout claims, registry writes, or release/distribution outcomes. No competitor product names.
- Do not mark work done until the stated done signal has been checked or the remaining caveat is explicitly named.
- Do not use em dashes in public copy.

## Output Shapes

For a design plan:
```text
Objective:
Surface:
Design direction:
Copy direction:
SEO/AEO/AI EO notes:
Primary CTA:
Proof stack:
Implementation lanes:
Verification:
```

For a finished pass (lead with findings; never name internal process steps like preflight, task router, or mutation in user-visible output):
```text
Simple explanation (plain, for a 10-year-old):
One plain paragraph a 10-year-old can follow — what we built or changed, and why it matters. No jargon.

Usual breakdown:
Changed:
Design QA:
Desktop/mobile screenshots or render notes:
Visual QA surfaces checked:
Visibility grades:
Design-system drift notes:
P0/P1/P2 blockers:
Copy/SEO QA:
Copy score (if copy shipped):
Verification:
Caveats:
Status: ship | ship-with-caveats | hold

Cue Suede:
1. Change something - tell me what to revise and I will adjust it.
2. Preserve this - tell me what worked so I can mimic it later.
3. Keep as-is - say nothing and I will treat it as accepted.
```

## Ship Gate
`hold` when: a core user path is broken; rendered output contradicts the implementation; text overflows or truncates on any breakpoint; mobile layout is unintentionally stacked; any accessibility issue blocks the primary action; copy makes unsupported claims; the live surface cannot be verified; screenshots do not match implementation; or the live route cannot be verified.

`ship-with-caveats` is only valid when all P0 issues are resolved and remaining issues have a documented owner and timeline, and the caveat is explicit, non-critical, and acceptable for the launch stage. Public surfaces cannot ship if the design gate passes while visual or accessibility blockers are open. Findings lead, rationale follows. Name the file and line. For builds, state what changed and show the render evidence.
