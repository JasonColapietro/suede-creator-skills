# Visual QA report — site elevation pass, 2026-08-16

- **Source visual truth:** live https://skills.suedeai.ai/ (pre-change), captured
  at 1280x900 and 390x844, full-page desktop scroll sliced and reviewed.
- **Implementation:** this branch (`claude/site-design-improvements-cb2d3e`),
  rendered from a local server over `docs/` and re-captured at the same
  viewports at each build step.
- **Viewports and state:** 1280x900 desktop, 390x844 / 375x812 / 414x896
  mobile; dark theme (site is single-theme); no auth; static content plus the
  terminal replay and proof-tape marquee; hover/focus checked via CSS review,
  filter interaction driven in a real browser session.

## Findings source

A 10-lens review fleet (typography, color/signature, catalog/skill template,
guide/book/blog, plugins/copy, copy staleness, accessibility, mobile,
performance, metadata) produced 98 findings: 6 P0, ~30 P1. Full detail lives in
the workflow journal for run `wf_9676a98c-d81`.

## Fixed and verified this pass

| Finding | Verification |
| --- | --- |
| P0 mobile horizontal overflow (497px doc in 390px viewport) | `document.scrollWidth == innerWidth` measured at 375/390/414 |
| P0 hamburger clipped off-canvas by nav-star cascade bug | hamburger rect 330-374 at 390px; nav-star `display:none` |
| P0 hero terminal empty 272px void for 5.6s | 8 lines visible at first paint (static session; replay starts on rotation) |
| P0 catalog lane chart said 39/summed 71 under "Where the 73 live" | chart, desc, and lead all read 41; validator guard chains them to the structurally-verified badge |
| P0 40 skill pages carried the suede-deslop footer | 41 footers regenerated from catalog descriptions; 30 correct ones untouched |
| P0 stale-count estate (71 vs 73 on ~35 surfaces) | all current-tense surfaces fixed; ~30 new validator countChecks; negative-tested (perturbed count fails with the right message) |
| P1 display type: 6 sizes, install shouting 2.1x hero | 4-step ramp measured: hero 62.7 / install 66.6 / features 56.3 / others 46.1 |
| P1 bento empty cells exposing #222 slab | per-card hairlines replace background-bleed |
| P1 hero CTAs below fold at 1280x900 | CTA bottom 897px (< 900), ship-log card peeks as next-section hint |
| P1 red assigned by nth-child | red = meaning: cards 02 (ship verdict), 06 (CI gate), 13 (recovery); 27 skill-page red CTAs normalized to gold |
| P1 132KB PNG logo on every page | 164 `<img>`s now use the 9.5KB webp; favicon is a 4KB downscale of the approved mark |
| P1 copy buttons under 44px on interior pages | catalog, plugins, copy bank raised to 44px min |
| P1 SR issues (arrows read out, silent copy state, no entry headings) | 107 arrows aria-hidden, copy buttons announce state, blog/book entries are h2/h3 |
| Em dashes in public prose (house rule) | guide, plugins, llms.txt, and 21 skill pages rewritten; blog/book essay bodies deliberately kept as dated editorial |

## Elevation (net-new)

- Fraunces variable serif display across ~101 pages, self-hosted, OFL.
- Hero: poster scale, italic risk phrase with red rule, film grain, gold-first
  glow, proof tape of on-page numbers (CSS marquee, reduced-motion safe).
- Catalog live filter (progressive enhancement, `/` shortcut, aria-live count)
  — driven in-browser: "review" filters to 6 of 73 across 3 lanes.

## Known-open (deferred with owners noted in PR)

- 1.28MB duplicated inline CSS across 103 pages (extraction blocked by tests
  that grep index.html for literal CSS; needs a deliberate refactor).
- 45 skill pages have no install commands; per-page copy buttons missing.
- Book chapters keep pre-growth measurements (need re-measuring, not sed).
- Homepage mobile nav requires JS; interior pages have no hamburger at all.
- ~5.5MB orphaned assets in docs/assets (deletion deferred, external links).

final result: passed
