# Suede Creator Skills Design System

## Register And Scene

Brand register. A builder is evaluating an agent toolkit on a laptop or phone,
often in a dark workspace, and needs confidence before running install commands.
The interface should feel like a compact release dossier: dark, precise,
evidence-led, and easy to scan.

## Palette

| Role | Value | Use |
| --- | --- | --- |
| Background | `#080808` | Page canvas |
| Surface | `#111111` | Panels and grouped content |
| Card | `#161616` | Raised content |
| Border | `#222222` | Hairlines and separation |
| Primary text | `#f0ece4` | Headings and essential text |
| Secondary text | `#888880` | Supporting text that must remain AA-readable |
| Gold | `#c8a96e` | Primary brand accent and action emphasis |
| Risk red | `#8b1a1a` | Failure, risk, and strict grading accents only |

## Typography

- Display headings are set in Fraunces, a variable editorial serif,
  self-hosted at `docs/assets/fonts/fraunces-var.woff2` (roman, ~66KB) with
  an italic cut used on the homepage hero (`fraunces-var-italic.woff2`).
  OFL-licensed; the license text lives in `licenses/fraunces-OFL.txt`.
  Weight sits between 560 and 650 with `-0.01em` to `-0.02em` tracking and
  `font-optical-sizing: auto`, so the face gains contrast at poster sizes.
- The pairing is deliberate tension: editorial serif display over the
  operator-grade mono/terminal layer. Component titles (cards, rows, TOC
  entries) stay on the system sans stack so the serif keeps section-level
  authority; body copy never uses the serif.
- System sans stack for body: dependable loading and a product-native feel.
- Body copy stays between 65 and 75 characters per line with `1.6-1.7`
  line-height.
- Monospace is reserved for commands, code, terminal labels, and the proof
  tape.

## Spacing And Shape

- Four-point spacing foundation exposed as `--space-*` tokens.
- Corners remain tight: 2-4px for controls and panels.
- Gold is used as a decision, not spread evenly across every surface.

## Motion

- Content is visible by default. Motion may translate or soften content into
  place but must never gate visibility.
- Use exponential ease-out and provide a reduced-motion path.
- Marquee and ambient hero motion are decorative and must not carry meaning.

## Interaction

- Primary actions and mobile controls provide at least a 44px target.
- Every link, button, and summary has a visible gold focus ring.
- Labels describe state changes, including open/close mobile navigation.
- Install commands remain selectable and copyable without hiding the raw text.

## Components

- Global navigation and mobile menu.
- Proof tape: full-width telemetry strip between nav and hero. A CSS-only
  marquee of real, on-page numbers (skills, commits, dollars recovered,
  uploads). Numbers in gold, labels in dim mono. Pauses on hover; the
  reduced-motion variant freezes into a centered wrapping row. Every figure
  on the tape must appear, sourced, further down the page.
- Proof-led hero with terminal install panel. The headline reserves the
  Fraunces italic plus a red underline for the single risk phrase; red stays
  a border/fill color and the text remains cream. Film grain at low opacity
  keeps the near-black canvas from reading as a flat fill.
- Catalog live filter on the skills index: hidden until JS reveals it, mono
  input, gold focus ring, `/` focuses, lanes collapse while filtering, and
  the result count announces via `aria-live`.
- Changelog ship log: timeline ledger of real commits with type-coded spine
  nodes, commit-activity sparkline, last-shipped freshness pill, and type
  filter chips. Entries carry real dates and short hashes linking to GitHub;
  filters and relative time are progressive enhancement.
- Benchmark tiles and disclosed scorecard.
- Skill catalog lanes and rows.
- Install terminals and alternative install paths.
- Evidence panels, FAQ disclosures, and footer identity.
