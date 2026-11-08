# Design System — SuedeAI.directory
Extracted from: https://suedeai.directory (`/assets/directory.css`) on 2026-11-08

Use this guide for anything that carries the SuedeAI.directory brand: promo videos, OG images, badges, launch pages. The tokens below are copied from the live stylesheet.

## Identity
- Color strategy: **Restrained.** Pure black canvas, near-white ink, and color only where it carries meaning (grade A/B/C/D, danger, gold for featured).
- Aesthetic tone: **retro-technical / product-utilitarian.** Pixel display type over a quiet mono-and-sans interface.
- Unforgettable factor: every skill has a **0–99 score and an A–D grade**, shown as a colored pill. The grade colors are the brand palette.
- Name: **SuedeAI.directory**, "the AI skill library". Hero line: "Agent skills, graded and ready to install."

## Typography
- Display: **Pixelify Sans** (`/assets/fonts/pixelify-sans-var-latin.woff2`). Use it for big headlines and short punchy lines.
- Mono: **Geist Mono** (`/assets/fonts/geist-mono-var-latin.woff2`). Use it for scores, install commands, labels and eyebrows.
- Sans: **Geist** (`/assets/fonts/geist-var-latin.woff2`). Use it for body text and UI.
- Score numerals: Geist Mono 46px / 600 with tabular figures.
- Labels: Geist Mono 12px, uppercase, 0.06em tracking, `--muted`.
- Install code: 13.5px mono on `--paper` with a `--hairline` border.

```css
--display: "Pixelify Sans", "Geist Mono", ui-monospace, monospace;
--mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
--sans: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
```

## Color tokens
```css
:root {
  --canvas: #000000;      /* page background */
  --paper: #0a0a0a;       /* cards, code */
  --paper-2: #1a1a1a;     /* hover, meters */
  --hairline: #1f1f1f;
  --line: #292929;        /* borders */
  --line-strong: #454545;
  --ink: #ededed;         /* headings */
  --text: #d4d4d4;        /* body */
  --muted: #a0a0a0;
  --faint: #7d7d7d;
  --accent: #ededed;      /* primary buttons are light-on-dark */
  --on-accent: #000000;
  --danger: #ff5e63;      /* also --accent-2 */
  --gold: #c8a96e;        /* featured */

  /* grades: the brand palette */
  --grade-a: #00ca52;  --grade-a-bg: #00250a;   /* 90–99 */
  --grade-b: #50a8ff;  --grade-b-bg: #06193a;   /* 80–89 */
  --grade-c: #ffb200;  --grade-c-bg: #291800;   /* 70–79 */
  --grade-d: #a0a0a0;  --grade-d-bg: #1a1a1a;   /* 0–69 */
}
```

### On a white background (promo outros, print)
The site is dark-only. On white, keep the grade hues as the foreground and use light tints as fills:

| Role | Foreground | Fill |
|---|---|---|
| Grade A | `#00ca52` (text `#00a344` for contrast) | `#e6f9ee` |
| Grade B | `#50a8ff` | `#e8f3ff` |
| Grade C | `#ffb200` | `#fff5e0` |
| Danger | `#ff5e63` | `#ffeced` |
| Gold | `#c8a96e` | `#f7f1e6` |
| Ink | `#0a0a0a` | `#f2f2f2` |

Command bars stay black (`#0a0a0a`) with `#ededed` text and a grade-A green `$` prompt.

## Spacing and shape
- Content widths: 600px, 720px and 900px reading columns; the nav is 60px tall.
- Radii: `--radius: 4px`, `--radius-sm: 3px`; meters use 2px. Nothing is pill-rounded except grade chips.
- Shadows: `--shadow: none`. Elevation comes from a 1px `--line-strong` ring (`--glow`), not blur.

## Components
- **Score card:** shield + mono score + uppercase label + 6px meter colored by grade, on `--paper` with a `--line` border.
- **Grade chip:** grade color text on its `-bg` tint, for example `A 94`.
- **Skill row:** rank, **name**, `owner/repo`, installs or "Listed <date>", then "NN/100 · Grade".
- **Install block:** copyable `npx skills add …`, plus the `.claude/skills` and `.agents/skills` copy paths.

## Motion
- Character: **snappy.** 150ms color/background and box-shadow/transform transitions; 160ms ease for transforms.
- No scroll-triggered reveals on the site. Video and promo motion can go bigger, but should resolve to these flat, sharp-cornered states.

## Voice
- Register: technical and plain. Short declaratives.
- Stance: third-person catalog ("3,871 skills … scored 0 to 99 … linked to source").
- Claim type: verifiable counts and grades, never superlatives.
- Vocabulary anchors: graded, install, score, source, skills.

## Fidelity level
Close visual match: the tokens are copied from the live stylesheet. The white-background table is an adaptation for promo use and is not on the site.
