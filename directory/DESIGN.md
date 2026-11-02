# SuedeAI.directory design system

The directory (`docs/directory/`, served at suedeai.directory) has its own
design system, separate from the skills site described in the root
`DESIGN.md`. Its one stylesheet is `docs/assets/directory.css`; agent pages add
`docs/assets/agents.css`, which reads the same tokens. The pages load nothing
else.

## Register and scene

A terminal in a dark room. A builder is deciding, in under a minute, which
skill to install: compare the score, see what the files touch, copy the
command. The surface is Operate (browse, compare) and Read (skill pages,
guides, the trust page), so expression lives in precision: one neon, mono
type, a pixel display face for the few words that carry the page.

## Palette

| Role | Value | Use |
| --- | --- | --- |
| Canvas | `#05060a` | Page ground, with two faint radial glows (cyan top left, magenta top right) |
| Paper | `#0b0d14` | Rows, cards, the nav and footer |
| Paper 2 | `#12151f` | Insets, inline code, hover rows |
| Hairline / line | `#1a1f2c` / `#2a3142` | Separators and borders |
| Ink / text / muted | `#eaf0f6` / `#c2cad6` / `#8b95a7` | Headings, body, supporting text (muted is 6:1 on paper) |
| Accent | `#4cf2ff` | Links, active tabs, focus rings, the primary button fill (black text), sparklines, pixel glyphs |
| Accent 2 | `#ff5fe1` | One emphasis only: incident cards and the terminal dots |
| Gold | `#d7b56d` / `#e3c57c` | The Suede mark, top-three ranks, featured numbering, the Suede pick callout |
| Grades | A `#5cf7a4`, B `#5fcbff`, C `#ffc55e`, D `#98a2b3` | Chips, matrices and meters; the same four everywhere |

A fixed scanline (`body::after`, 3px repeat at 3.5 percent) sits above the
page with `mix-blend-mode: overlay`. It is decoration and carries no meaning.
Dark only: the brief is a terminal, and `color-scheme: dark` says so. The
legacy token names other sheets and tests read (`--cream`, `--gold`, `--cool`,
`--surface`, `--border`) are aliased to the new values.

## Typography

- JetBrains Mono (variable, OFL) for every word: body 15px/1.65, labels 12px
  uppercase with 0.06em tracking, section titles 20 to 24px bold led by a cyan
  `//`.
- Pixelify Sans (variable, OFL) for display only: the H1 of every page, the
  wordmark, the Top 100 heading, ranks, stat numbers and the score card. A
  faint cyan text-shadow gives the pixel face its glow.
- The eyebrow is a prompt: `> Skill directory · Design`. FAQ questions carry a
  `?` marker. The hub H1 ends in a blinking block cursor that freezes under
  reduced motion.

## Focal graphics

Each page type owns one graphic, all generated from the dataset at build time:

- Skill matrix: one 8px dot per listed skill, sorted by score and colored by
  grade (`/skill-matrix.svg` beside the hero; `matrix.svg` on every category
  page). The trust page draws every full-page skill by what its files touch.
- Install chart: a bar chart of the twenty most installed skills on Top 100,
  from the skills.sh snapshot.
- Score card: the pixel-face score, grade chip, meter and, for scores of 80 to
  99, the Suede S shield beside the lead of every full skill page.
- Pixel glyphs: 12 by 12 bitmaps (`scripts/directory/pixel-icons.mjs`) for
  each category and kind, drawn beside the H1 and in the category rail.
- Corner brackets on stat tiles, the score card and the glance panel; a
  `[ Most installed ]` bracket on the active tab; three colored dots on
  terminal headers.

## Components

- Leaderboard: tabbed panes (most installed, highest scores, rising, new,
  updated), zero-padded ranks in the pixel face, gold for the top three, an
  eight-week sparkline where skills.sh publishes one.
- Glance panel: publisher, license, cost, installs, scripts, credentials,
  hosts, MCP, security scan, listed since; warnings in amber, clear states in
  green.
- Kind cards, stack cards and entries share the paper surface, a hairline
  border and a cyan glow on hover.
- Terminal snippets: a header with three dots and a copy button, commands in
  green on near-black.
- Mobile navigation keeps the `details.nav-disclosure` pattern at 768px and
  under, with a 44px hamburger in accent cyan.

## Fonts and licenses

Both faces are self-hosted Latin subsets of the variable fonts, served only on
directory pages. The root `NOTICE.md` is pinned by the first-party intake
receipt, so their notices live here until the next intake folds them in.

### JetBrains Mono

Copyright 2020 The JetBrains Mono Project Authors
(https://github.com/JetBrains/JetBrainsMono). SIL Open Font License 1.1. Full
text: [`licenses/jetbrains-mono-OFL.txt`](../licenses/jetbrains-mono-OFL.txt).

Files: `docs/assets/fonts/jetbrains-mono-var-latin.woff2`,
`docs/assets/fonts/jetbrains-mono-var-italic-latin.woff2`.

### Pixelify Sans

Copyright 2021 The Pixelify Sans Project Authors
(https://github.com/eifetx/Pixelify-Sans). SIL Open Font License 1.1. Full
text: [`licenses/pixelify-sans-OFL.txt`](../licenses/pixelify-sans-OFL.txt).

Files: `docs/assets/fonts/pixelify-sans-var-latin.woff2`.
