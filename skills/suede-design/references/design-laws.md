# Design Laws

The numeric rules a Suede interface has to satisfy: spacing, type scale, color, contrast, density, motion, and state. Every law here is a threshold, not a preference.

## Design Laws

### Subject First

Strip the logo from any Suede surface. If the remaining visual could belong to a generic SaaS, a crypto exchange, or a music streaming app, the design has failed. Suede surfaces should feel like purpose-built studio infrastructure: precise, traceable, and operator-grade. Every surface should answer: "What does a creator do here, specifically?"

### One Memorable Move

Give each major surface one signature element that earns attention: an
interactive rights passport, a waveform ledger, a chain-of-title timeline, a
studio console, a claim map, a provenance receipt, or another subject-native
device. Keep the surrounding UI disciplined so the signature move carries.

### Color

- Pick a strategy from the Color Strategy Axis below before picking any values.
- Color must earn its position by encoding meaning: ownership, rights status, action type, risk level, state change, tier, or provenance chain. Decorative color is waste.
- First-order reflex to reject: "music/creator tool → dark purple gradient." Second-order trap: avoided purple but landed on muted-teal-on-dark anyway. Go further until the palette is specific to this surface's physical scene.

### Color Strategy Axis

Before picking values, commit to a strategy on this axis:

- **Restrained**: tinted neutrals + one accent ≤10% of surface area. Default for product dashboards, admin, tools, and focus-heavy workflows.
- **Committed**: one saturated color carries 30–60% of the surface. Default for brand pages and identity-driven screens. The "one accent ≤10%" rule does NOT apply here.
- **Full palette**: 3–4 named color roles, each used deliberately. Use for data visualization, campaign pages, and multi-feature products.
- **Drenched**: the surface IS the color. Use for campaign heroes, launch moments, and brand statements.

Pick a strategy before picking values. Avoid defaulting to Restrained for everything. Committed and Full palette designs require it to feel intentional.

For CSS color values, prefer OKLCH. Reduce chroma as lightness approaches 0 or 100 to avoid garish extremes. Tint every neutral toward the brand hue (chroma 0.005–0.01 is enough). Never use pure #000 or #fff.

### Dark Mode

Dark mode is not an inversion. These are the specific rules:

**Surfaces:** Dark surfaces use lightness 10-18 OKLCH, not 0. Background layers stack from dark to slightly lighter: base (L=12) → elevated (L=16) → overlay (L=20) → modal (L=24). Never use pure black as a surface.

**Shadows:** Shadows disappear on dark surfaces. Replace elevation cues with border-based layering: 1px border at `oklch(1 0 0 / 0.08)` on elevated surfaces, `oklch(1 0 0 / 0.12)` on modals. Drop-shadows only appear in dark mode when the element is physically "lifted" (a draggable card, a tooltip, a floating toolbar).

**Contrast minimums:** body text on dark background: minimum 7:1 (WCAG AAA). Secondary text: 4.5:1. Disabled text: 3:1. Do not use near-black text on dark surfaces. Use light text with opacity adjustments (`oklch(1 0 0 / 0.45)` for secondary, `oklch(1 0 0 / 0.25)` for disabled).

**Chroma:** In dark mode, reduce saturated color chroma by 15-25%. `oklch(0.65 0.22 260)` in light → `oklch(0.72 0.17 260)` in dark. Fully saturated accent colors on dark backgrounds feel neon. Pull back.

**Semantic tokens:** define light and dark values for every semantic token at design time. `--color-surface-base`, `--color-surface-elevated`, `--color-border-subtle`, `--color-text-primary`, `--color-text-secondary`, `--color-text-disabled`. Never hardcode hex in component CSS.

### Typography

- Pair typefaces deliberately. Display, body, and utility text should have
  distinct jobs.
- Use scale and weight for hierarchy; keep at least a 1.25 ratio between major
  type steps.
- Keep body copy around 65-75 characters per line.
- Keep letter spacing at 0 by default. Do not use negative letter spacing.
- Match type size to context. Dashboards, cards, and toolbars need compact
  hierarchy, not hero-scale text.

Typography anti-patterns to avoid without explicit justification:
- Overused system fonts: Inter, Roboto, Arial, SF Pro as the display face
- Symmetric type pairing: display and body from the same family
- Uniform weight: same weight across headline, subhead, and body
- Letter-spacing on body copy
- Negative letter-spacing on small text (under 16px)

Pair typefaces deliberately: one font earns the display role (personality, brand signal), one earns the body role (readability, neutrality). They should contrast: a geometric display pairs with a humanist body; a serif display pairs with a sans body.

### Fluid Type Scale

Use `clamp()` for all responsive type. The pattern is `clamp(min, preferred, max)` where preferred is a viewport-relative value.

Reference scale (adjust to match the surface's type role):

```css
--text-xs:   clamp(0.75rem,  0.70rem + 0.25vw,  0.875rem);
--text-sm:   clamp(0.875rem, 0.82rem + 0.28vw,  1rem);
--text-base: clamp(1rem,     0.94rem + 0.30vw,  1.125rem);
--text-lg:   clamp(1.125rem, 1.0rem  + 0.62vw,  1.375rem);
--text-xl:   clamp(1.375rem, 1.1rem  + 1.40vw,  2rem);
--text-2xl:  clamp(1.75rem,  1.3rem  + 2.20vw,  3rem);
--text-3xl:  clamp(2.25rem,  1.6rem  + 3.25vw,  4.5rem);
```

Min is the floor at ~375px viewport. Max is the ceiling at ~1440px. The preferred vw value controls how aggressively the type grows.

Never use fixed `px` font sizes for display, heading, or subheading roles. Fixed sizes are acceptable only for UI chrome (badges, labels, captions) that must not resize with viewport changes.

Line height scales inversely with size: large display text (≥2xl) uses line-height 1.05–1.1. Body text uses 1.5–1.6. Subheadings use 1.2–1.35.

### Layout

- Make structure explain the product. Use bands, rails, timelines, consoles,
  grids, tabs, and split panes because the content needs them.

Spatial composition: intentional layouts use asymmetry, overlap, diagonal flow, and the tension between density and negative space. All of these are legitimate tools:
- Asymmetry: column grids that don't divide evenly, intentional visual weight on one side
- Overlap: elements that break their containing rows to create depth
- Diagonal flow: content that leads the eye along a non-horizontal axis
- Generous negative space OR controlled density, not an accidental middle ground

Never use a card where a row would do. Use cards only for items that must be independently scannable, draggable, or selected, not as a visual wrapper for sections, tabs, or form groups. One card inside another card means your information architecture is wrong. Fix the hierarchy, not the nesting.

- Stable UI elements need stable dimensions: boards, grids, icon buttons,
  counters, tiles, canvases, and toolbars should not resize when labels, hover
  states, loading text, or data changes.
- Build a semantic z-index scale: dropdown → sticky → modal-backdrop → modal →
  toast → tooltip. Never arbitrary values like 999 or 9999.
- On landing pages, the first viewport must show the brand, product, or offer
  clearly and leave a hint of the next section visible on mobile and desktop.
- Text must not overlap, clip, or fight its container at any viewport.

### Controls

- Use icon buttons for familiar commands when the icon exists in the local icon set. Add tooltips for icons that are not obvious.
- Use segmented controls for modes, toggles or checkboxes for binary settings, sliders or inputs for numeric values, tabs for views, menus for option sets, and text buttons for commands.
- Keep touch targets usable and focus states visible.
- A dropdown or popover rendered with `position: absolute` inside a parent with `overflow: hidden` or `overflow: auto` gets clipped. Use the native `<dialog>`/popover API, `position: fixed`, or a portal to escape the stacking context.

### Component Laws

**Forms:**
Every form field shows its label above the input, never as placeholder text. Placeholder is hint text only. It disappears on focus and must not carry required information. Error messages appear below the field they belong to, not as a toast. Required fields are marked; optional fields are not (the default expectation is required). A submit button is always the primary action; it is disabled only when the form is provably incomplete, never as the default initial state.

BEFORE: `<input placeholder="Email address" />` with no visible label
AFTER: `<label>Email address</label><input placeholder="e.g. you@studio.com" />`

**Modals:**
A modal is for a destructive action, a focused sub-task that needs temporary full attention, or a preview that shouldn't break navigation context. It is not the first answer to "the user needs more information." Use inline expansion, a side drawer, or a dedicated route instead when the content is browseable or the action is reversible. Every modal has one primary action and one escape (keyboard Escape + backdrop click). Never stack modals.

BEFORE: clicking "details" opens a modal with a scrollable list of 12 items
AFTER: clicking "details" expands an inline panel or navigates to a detail route

**Empty states:**
An empty state is a conversion opportunity, not a placeholder. It must contain: what would be here (one concrete example), why it's empty (the specific reason), and what to do next (a single, specific action). Never show just an illustration and "No results found." Name the specific thing that's missing.

BEFORE: `[Icon] No tracks yet.` with a disabled button
AFTER: `Register your first work to start building your rights ledger. [Register a Work →]`

**Data tables:**
Column headers are left-aligned except numeric columns, which are right-aligned. Rows are 40-48px tall for data-dense tables, 56-64px when each row needs a secondary line. Alternating row fills are a last resort for wide tables with more than 8 columns. Prefer generous column padding and strong header contrast instead. Sort indicators are visible on hover for all sortable columns, not just the active one. Pagination controls live below the table, right-aligned, with total count visible at all times.

**Navigation:**
Primary navigation shows the user's current location at all times with a visible active state that is not just color. Use weight, underline, or background shape so it survives grayscale. Depth beyond three levels means the information architecture needs restructuring, not another nav level. Mobile nav collapses to a bottom tab bar (max 5 items) or a full-screen drawer. Never a hamburger that reveals a sidebar on a phone.

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

Every animation must justify its CPU cost. If removing it makes the UI clearer, remove it. If keeping it makes an action legible (a row sliding out when deleted, a panel expanding from its trigger, a success state settling into place), keep it.

Never animate width, height, top, left, or margin. Animate `transform` and `opacity` only.

Exit curve: `ease-out-expo` (`cubic-bezier(0.16, 1, 0.3, 1)`), duration 220-280ms. The UI should feel like it arrives, not drifts.

Entrance sequencing for lists, cards, and panels: `translate3d(0, 12px, 0)` → `translate3d(0, 0, 0)` + opacity 0→1, 240ms ease-out-expo, stagger 40ms per item, max 6 items staggered then clamp. Cap total reveal sequence at 480ms. Panels enter at 300ms; hero content at 180ms.

Scroll-triggered reveals fire once, not on every scroll direction change. Use `IntersectionObserver` with `threshold: 0.15`.

In React, use Motion (Framer Motion). Always include a `prefers-reduced-motion` variant that removes translate and cuts duration to 0ms.
