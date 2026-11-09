# SuedeAI.directory design system

The directory (`docs/directory/`, served at suedeai.directory) has its own
design system, separate from the skills site described in the root
`DESIGN.md`. Its one stylesheet is `docs/assets/directory.css`; agent pages add
`docs/assets/agents.css`, which reads the same tokens. The pages load nothing
else.

## Register and scene

The Suede palette (Institutional IP Terminal, the canonical Suede brand in
`Suede-AI-App/suede-home`) on five colors: a black page, blue-black Panel and
Control Ink surfaces, Proof Sky blue links, Verified Emerald green for done and
verified, Rights Red for the primary action and Registry Cyan for focus, labels
and proof. A builder is deciding, in under a
minute, which skill to install: compare the score, see what the files touch,
copy the command. The surface is Operate (browse, compare) and Read (skill
pages, guides, the trust page), so expression lives in precision: mono type, a
pixel display face for the few words that carry the page, and four status
colors that mean the same thing everywhere.

## Palette

| Role | Value | Suede token | Use |
| --- | --- | --- | --- |
| Canvas | `#020409` | black (Deep Ink family) | Page ground |
| Paper | `#09101b` | Panel Ink | Rows, cards, the nav and footer |
| Paper 2 | `#0d1726` | Control Ink | Insets, inline code, hover rows, the compare highlight |
| Hairline / line / line strong | `#142033` / `#1d2b41` / `#34465f` | navy hairlines | Separators, borders, hover rings, corner brackets, terminal dots |
| Ink / text / muted / faint | `#eef2f7` / `#d7dee8` / `#9aa7b8` / `#7a879a` | Page Mist / mist / Slate | Headings, body, supporting text, ranks and icons |
| Link | `#38bdf8`, hover `#7dd3fc` | Proof Sky | Links in text, the reading list, the publisher group label |
| Accent | `#22d3ee` (Deep Ink text on it) | Registry Cyan | Active tabs, focus rings, sparklines, chart bars, pixel glyphs, eyebrows |
| Success | `#34d399` on `#062a1f` | Verified Emerald | Workflow progress, completed steps, the pressed "complete" button |
| Primary action | `#9f101a`, hover `#d11f2b`, white text | Rights Red | The primary button, the nav call to action, the skip link, form submit buttons |
| Accent 2 / danger | `#ff5e63` on `#330a11` | coral | Incident cards, errors, the "runs commands" matrix color |
| Suede modules (`--gold-*` names) | fill and border `#d11f2b`, text `#22d3ee`, tint `#170c16` | Rights Red / Registry Cyan | The Suede-owned modules: the Suede pick callout, the services module, Jason's quote, the chat box accents |
| Grades | A `#00ca52` on `#00250a`, B `#50a8ff` on `#06193a`, C `#ffb200` on `#291800`, D `#a0a0a0` on `#1a1a1a` | status colors | Chips, matrices and meters; the same four everywhere |

The chat box's Suede skill cards use the same palette directly: a Rights Red
head, Panel Ink body, a Registry Cyan proof row and a Control Ink footer.

No scanline, no radial glow, no text shadow: emphasis comes from blue, green,
red and cyan against black. Dark only, and `color-scheme: dark` says so. The legacy token
names other sheets and tests read (`--cream`, `--gold`, `--cool`, `--surface`,
`--border`) are aliased to the new values; `--gold-*` keeps its name for
compatibility and carries Rights Red and Registry Cyan.

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
- Pixelify Sans (variable, OFL) for the wordmark and every page H1, in plain
  white, plus the names on Best of topic tiles. The home headline is the
  largest (34 to 58px); every other H1 runs 30 to 46px so long titles stay
  readable.
- The eyebrow is a prompt: `> Skill directory · Design`. FAQ questions carry a
  `?` marker. Every H1 ends in a blinking block cursor that freezes under
  reduced motion; when the H1 carries a subline (`.h1-sub`), the cursor ends
  the subline instead, so it never wraps onto a line of its own.

## Focal graphics

Each page type owns one graphic, all generated from the dataset at build time:

- Skill matrix: one dot per listed skill, sorted by score and colored by
  grade (`/skill-matrix.svg` beside the home hero; `matrix.svg` beside every
  category hero). The security page draws every full-page skill by what its
  files touch, beside its hero. Hero matrices are shaped to the column (about
  2.4 dots wide per dot tall, 16 to 48 columns) and drawn at up to 16px a
  cell, so a small category reads as a smaller block, not a stretched one.
- Topic tile matrix: the same dots at tile scale, 24 to a row, on every Best
  of tile; the compact topic tiles reduce it to a four-stop grade bar.
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

- Kind bar: one row under the header on every page, holding every catalog the
  directory keeps (Skills, Featured Skills, AI agents, each kind in
  `kinds.json`, Stacks) with a pixel glyph and a count each. The catalog that
  owns the page is lit with a white underline; pages about the directory
  itself (method, submit, check, guides, API, security, saved) light none.
  Under the full shell width the labels shorten to one word (the full label
  stays the accessible name); under 900px the bar is a four-by-two grid, so
  Grok bots and MCP servers show on a phone without scrolling. The home hero
  no longer repeats it.
- Page hero: the home layout (copy left, focal graphic right, one column
  under 900px) on every page that owns a matrix: the category pages and the
  security page. Top 100 keeps its install chart at full width, where the
  bar labels have room.
- Best of tiles (`directory/editorial/best-of.json` picks the topics and their
  order): group and count in a mono head, the topic name in the pixel face,
  the tile matrix in a black field, and the top pick with its grade chip
  (Suede AI's own skills are never the pick). On hover or focus the corner
  brackets turn white and step out, the dots brighten, the name gains the
  cursor and a white scan line sweeps the field; reduced motion removes the
  scan. Two up on phones. The wall sits under Top 100 on the home page and
  leads the topics hub, where every published topic is a compact tile.
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

## Social card

`docs/assets/social/directory-card.html` renders `directory-card-v2.png`, the
Open Graph image for every directory page: the wordmark, the home headline in
the pixel face, the live skill matrix and the catalog row on black. It states
no counts, so it stays true between refreshes; re-render it after a design
change (see `docs/assets/social/README.md`).

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
