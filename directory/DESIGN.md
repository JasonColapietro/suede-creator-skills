# SuedeAI.directory design system

The directory (`docs/directory/`, served at suedeai.directory) has its own
design system, separate from the skills site described in the root
`DESIGN.md`. Its one stylesheet is `docs/assets/directory.css`; agent pages add
`docs/assets/agents.css`, which reads the same tokens. The pages load nothing
else.

## Register and scene

The Vercel scheme, as skills.sh wears it: a pure black page, near-black
panels, gray hairlines, white for text and action, and nothing that glows. A
builder is deciding, in under a minute, which skill to install: compare the
score, see what the files touch, copy the command. The surface is Operate
(browse, compare) and Read (skill pages, guides, the trust page), so expression
lives in precision: mono type, a pixel display face for the few words that
carry the page, and four status colors that mean the same thing everywhere.

## Palette

Every value is a token from Vercel's dark scale, the one skills.sh ships.

| Role | Value | Vercel token | Use |
| --- | --- | --- | --- |
| Canvas | `#000000` | background-200 | Page ground |
| Paper | `#0a0a0a` | background-100 | Rows, cards, the nav and footer |
| Paper 2 | `#1a1a1a` | gray-100 | Insets, inline code, hover rows, the compare highlight |
| Hairline / line / line strong | `#1f1f1f` / `#292929` / `#454545` | gray-200 / 300 / 500 | Separators, borders, hover rings, corner brackets, terminal dots |
| Ink / text / muted / faint | `#ededed` / `#d4d4d4` / `#a0a0a0` / `#7d7d7d` | gray-1000 / between / 900 / 800 | Headings, body, supporting text, ranks and icons |
| Accent | `#ededed` | gray-1000 | Links, active tabs, focus rings, the primary button fill (black text), sparklines, chart bars, pixel glyphs |
| Accent 2 / danger | `#ff5e63` on `#330a11` | red-900 / red-100 | Incident cards, errors, the "runs commands" matrix color |
| Gold | `#c8a96e` | Suede brand | Only the Suede-owned modules: the Suede pick callout, the services module, Jason's quote |
| Grades | A `#00ca52` on `#00250a`, B `#50a8ff` on `#06193a`, C `#ffb200` on `#291800`, D `#a0a0a0` on `#1a1a1a` | green-900, blue-900, amber-700, gray-900 | Chips, matrices and meters; the same four everywhere |

No scanline, no radial glow, no text shadow: the page is flat black, and
emphasis comes from white against gray. Dark only, as skills.sh is, and
`color-scheme: dark` says so. The legacy token names other sheets and tests
read (`--cream`, `--gold`, `--cool`, `--surface`, `--border`) are aliased to
the new values.

## Typography

The pairing skills.sh uses, self-hosted as Latin subsets of the variable
fonts:

- Geist (variable, OFL) for prose and headings: body 15px/1.6, H1 at 30 to
  40px semibold with tight tracking, H2 at 20 to 24px semibold.
- Geist Mono (variable, OFL) for everything that is a label, a number or a
  command: the nav, eyebrows and kickers, tabs, chips and tags, table heads
  and numeric cells, ranks, install counts, stat tiles, the score card, the
  glance panel, form controls, code and terminals. Labels are 12px uppercase
  with 0.06em tracking.
- Pixelify Sans (variable, OFL) only where skills.sh keeps its bitmap logo:
  the wordmark and the hub headline, in plain white.
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
- Corner brackets in gray on stat tiles, the score card and the glance panel;
  a `[ Most installed ]` bracket on the active tab; three gray dots on
  terminal headers.

## Components

- Leaderboard: tabbed panes (most installed, highest scores, rising, new,
  updated), zero-padded ranks in the pixel face, white for the top three, an
  eight-week sparkline in white where skills.sh publishes one.
- Glance panel: publisher, license, cost, installs, scripts, credentials,
  hosts, MCP, security scan, listed since; warnings in amber, clear states in
  green.
- Kind cards, stack cards and entries share the paper surface, a hairline
  border and a gray ring on hover.
- Terminal snippets: a header with three dots and a copy button, commands in
  green on near-black.
- Mobile navigation keeps the `details.nav-disclosure` pattern at 768px and
  under, with a 44px hamburger in white.

## Fonts and licenses

All three faces are self-hosted Latin subsets of the variable fonts, served
only on directory pages. The root `NOTICE.md` is pinned by the first-party intake
receipt, so their notices live here until the next intake folds them in.

### Geist and Geist Mono

Copyright (c) 2023 Vercel, in collaboration with basement.studio
(https://github.com/vercel/geist-font). SIL Open Font License 1.1. Full
text: [`licenses/geist-OFL.txt`](../licenses/geist-OFL.txt).

Files: `docs/assets/fonts/geist-var-latin.woff2`,
`docs/assets/fonts/geist-var-italic-latin.woff2`,
`docs/assets/fonts/geist-mono-var-latin.woff2`.

### Pixelify Sans

Copyright 2021 The Pixelify Sans Project Authors
(https://github.com/eifetx/Pixelify-Sans). SIL Open Font License 1.1. Full
text: [`licenses/pixelify-sans-OFL.txt`](../licenses/pixelify-sans-OFL.txt).

Files: `docs/assets/fonts/pixelify-sans-var-latin.woff2`.
