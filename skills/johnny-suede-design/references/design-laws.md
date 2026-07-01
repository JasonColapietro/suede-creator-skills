# Design Law Specs, Component Laws, And Scoped Bans

Used by johnny-suede-design Lane A. Read before implementing any visual work. The law heads and gates live in SKILL.md; the full values, BEFORE/AFTER pairs, and menus live here.

## Dark Mode

Dark mode is not an inversion. Specific rules:
- **Surfaces:** Dark surfaces use lightness 10–18 OKLCH, not 0. Background layers stack from dark to slightly lighter: base (L=12) → elevated (L=16) → overlay (L=20) → modal (L=24). Never use pure black as a surface.
- **Shadows:** Shadows disappear on dark surfaces. Replace elevation cues with border-based layering: 1px border at `oklch(1 0 0 / 0.08)` on elevated surfaces, `oklch(1 0 0 / 0.12)` on modals. Drop-shadows only appear in dark mode when the element is physically "lifted" (a draggable card, a tooltip, a floating toolbar).
- **Contrast minimums:** body text on dark background minimum 7:1 (WCAG AAA); secondary text 4.5:1; disabled text 3:1. Do not use near-black text on dark surfaces. Use light text with opacity adjustments (`oklch(1 0 0 / 0.45)` secondary, `oklch(1 0 0 / 0.25)` disabled).
- **Chroma:** In dark mode, reduce saturated color chroma by 15–25%. `oklch(0.65 0.22 260)` in light → `oklch(0.72 0.17 260)` in dark. Fully saturated accents on dark backgrounds feel neon. Pull back.
- **Semantic tokens:** define light and dark values for every semantic token at design time — `--color-surface-base`, `--color-surface-elevated`, `--color-border-subtle`, `--color-text-primary`, `--color-text-secondary`, `--color-text-disabled`. Never hardcode hex in component CSS.

## Typography

- Pair typefaces deliberately. Display, body, and utility text should have distinct jobs: one font earns the display role (personality, brand signal), one earns the body role (readability, neutrality). They should contrast — a geometric display pairs with a humanist body; a serif display pairs with a sans body.
- Use scale and weight for hierarchy; keep at least a 1.25 ratio between major type steps.
- Keep body copy around 65–75 characters per line.
- Keep letter spacing at 0 by default. Do not use negative letter spacing.
- Match type size to context. Dashboards, cards, and toolbars need compact hierarchy, not hero-scale text.

Type anti-patterns to avoid without explicit justification: overused system fonts (Inter, Roboto, Arial, SF Pro) as the display face; symmetric pairing (display and body from the same family); uniform weight across headline/subhead/body; letter-spacing on body copy; negative letter-spacing on small text (under 16px).

## Fluid Type Scale

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

## Layout

- Make structure explain the product. Use bands, rails, timelines, consoles, grids, tabs, and split panes because the content needs them.
- Spatial composition — intentional layouts use asymmetry (column grids that don't divide evenly, intentional weight on one side), overlap (elements breaking their rows to create depth), diagonal flow (content leading the eye along a non-horizontal axis), and generous negative space OR controlled density, not an accidental middle ground.
- Never use a card where a row would do. Use cards only for items that must be independently scannable, draggable, or selected — not as a visual wrapper for sections, tabs, or form groups. One card inside another card means the information architecture is wrong. Fix the hierarchy, not the nesting.
- Stable UI elements need stable dimensions: boards, grids, icon buttons, counters, tiles, canvases, and toolbars should not resize when labels, hover states, loading text, or data changes.
- On landing pages, the first viewport must show the brand, product, or offer clearly and leave a hint of the next section visible on mobile and desktop.
- Text must not overlap, clip, or fight its container at any viewport.

## Controls

- Use icon buttons for familiar commands when the icon exists in the local icon set. Add tooltips for icons that are not obvious.
- Use segmented controls for modes, toggles or checkboxes for binary settings, sliders or inputs for numeric values, tabs for views, menus for option sets, and text buttons for commands.
- Keep touch targets usable and focus states visible.

## Component Laws

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

## Assets

- Use real product, creator, media, logo, or generated bitmap imagery when the surface needs a visual asset. Do not replace visible brand assets, product imagery, or nonstandard icons with CSS shapes, emoji, placeholder divs, or improvised inline drawings.
- Use approved Suede logo files from the current project, public repo assets, or an operator-provided brand folder. Do not reference private local asset paths in public docs, screenshots, or generated output.
- For 3D work, use Three.js and verify the canvas is nonblank, framed, interactive or moving as intended, and responsive.

## Motion

- Motion posture by register: brand surfaces earn motion as premium signal (entrance reveals, parallax subtlety, micro-transitions); product surfaces use motion only to clarify state change or sequence (no decorative animation in dashboards or settings); docs surfaces use no motion; campaign surfaces use motion only on the primary CTA or hero transformation. Motion that cannot be explained as "this clarifies X for the user" is decorative — cut it.
- Every animation must justify its CPU cost. If removing it makes the UI clearer, remove it. If keeping it makes an action legible (a row sliding out when deleted, a panel expanding from its trigger, a success state settling into place), keep it.
- Never animate width, height, top, left, or margin. Animate `transform` and `opacity` only.
- Exit curve: `ease-out-expo` (`cubic-bezier(0.16, 1, 0.3, 1)`), duration 220–280ms. The UI should feel like it arrives, not drifts.
- Entrance sequencing for lists, cards, and panels: `translate3d(0, 12px, 0)` → `translate3d(0, 0, 0)` + opacity 0→1, 240ms ease-out-expo, stagger 40ms per item, max 6 items staggered then clamp. Cap total reveal at 480ms. Panels enter at 300ms; hero content at 180ms.
- Scroll-triggered reveals fire once, not on every scroll-direction change. Use `IntersectionObserver` with `threshold: 0.15`.
- In React, use Motion (Framer Motion). Always include a `prefers-reduced-motion` variant that removes translate and cuts duration to 0ms.

## Aesthetic Direction Menu

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

## Design System Quality Of Life Artifacts

For any major surface, reusable app shell, launch system, or important component family, produce these at the smallest useful fidelity:
- **Token map:** color roles, type scale, spacing, radii, shadows, motion, z-layers, and semantic state names, stored in `DESIGN.md` or `design-tokens.json`.
- **State matrix:** default, hover, focus, active, disabled, loading, empty, success, warning, error, and permission-denied states for every component that touches data.
- **Copy vocabulary:** action labels, toast language, error messages, and empty-state prompts that stay consistent across the product.
- **Screenshot contract:** named states with seeded demo data so marketing, product listing, QA, and docs reproduce the same visuals.
- **Accessibility pass:** contrast ratios, focus order, touch targets, keyboard paths, and reduced-motion compliance.
- **Migration notes:** what old styles still exist, what not to touch, and how new work adopts the system without rewriting unrelated screens.

Extract a design-system issue when a token, component, spacing pattern, color, type treatment, or state pattern repeats at least three times or controls a high-visibility surface. Classify drift root cause as: token missing, token ignored, component gap, content pressure, platform convention, or legacy debt.
