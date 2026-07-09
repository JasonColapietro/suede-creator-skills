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

- System sans stack for dependable loading and a product-native feel.
- Display headings use heavy weight, `-0.03em` to `-0.04em` tracking, and
  balanced wrapping.
- Body copy stays between 65 and 75 characters per line with `1.6-1.7`
  line-height.
- Monospace is reserved for commands, code, and terminal labels.

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
- Proof-led hero with terminal install panel.
- Benchmark tiles and disclosed scorecard.
- Skill catalog lanes and rows.
- Install terminals and alternative install paths.
- Evidence panels, FAQ disclosures, and footer identity.
