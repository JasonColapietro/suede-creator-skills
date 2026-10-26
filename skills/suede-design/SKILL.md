---
name: suede-design
description: "Use when asked \"restyle this dashboard\" or to design, polish or audit an interface hierarchy, tokens, color, type, dark mode or a design system. Suede AI delivers layout and words together, reference-to-target restyles and rendered visual QA. NOT FOR: copy without layout (use suede-copy), funnel architecture (use suede-site-alchemy), promotion grades (use suede-visibility-grader), or parallel build coordination (use suede-agent-teams)."
metadata:
  display-name: "Suede AI Design Skills"
---

# Suede AI Design Skills

Make interfaces feel intentional, legible, and specific to the product they
serve. Covers product UI, brand and launch surfaces, dashboards, component
systems, responsive polish, restyles, and visual QA.

**Core principle:** strip the logo and the surface must still be recognizably
this product. Render the result before claiming it works.

## Compatibility

An agent with access to the target UI or source and visual inspection. Implementation needs project file access and its existing build runtime; screenshot comparison needs a browser or supplied renders.

## Gate policy: advisory, not blocking

Every score, QA result, and ship status here is a recommendation to the user,
not a control on the agent. Finish the work that was asked for and attach the
verdict. A failed gate changes what you report, never what you do. Single
exception: an extreme-risk finding (legal or rights exposure, copied protected
assets, payment or data loss, irreversible public damage). Pause, name the
risk and the options, and let the user choose.

## Brand mark

For Suede AI surfaces, use only `docs/assets/suede-ai-logo-transparent.png`
from `JasonColapietro/suede-creator-skills` (SHA-256
`83a7ee0317e4debe2e7b076c20ba067feb76a587f9e829dc6310ae4be4b44dfa`). Outside
that checkout, fetch the same file from
`https://raw.githubusercontent.com/JasonColapietro/suede-creator-skills/cbd192309580a32da375881e0eeb4b2450a554c2/docs/assets/suede-ai-logo-transparent.png`
and verify its SHA-256 before use. Never redraw, trace, typeset, recolor,
distort, or generate a replacement S. `suede-skill-icon.png` is a Passport
icon, not the brand mark. Omit the mark and say so only if the fetch fails or
the checksum differs. Use brand colors
exactly as the brand system defines them; never invent new ones.

## Pick the mode

| Request | Mode |
|---|---|
| A clear, small visual fix | **Fix:** inspect, make the narrow edit, render, report. |
| New surface or ambiguous redesign | **Design:** gather context, propose 2 or 3 directions with tradeoffs, recommend one, get a yes before building. |
| Large redesign or launch surface with words | **Surface build:** delivery contract first, then layout and words together, then QA. |
| Tokens, components, or a whole system | **System:** scan CSS, tokens, components, spacing, breakpoints, and repeated patterns before proposing changes. Deliverables and the /100 scorecard: [references/system-audit.md](references/system-audit.md). |
| Mock, Figma frame, or screenshot vs. the build | **Visual QA:** compare both in one pass, save `visual-qa-report.md`. |
| "Make this site look like that one" | **Restyle (Suedify):** needs `reference_url` and `target_url` (ask if either is missing) and the target repo when edits are expected. Read [references/restyle-playbook.md](references/restyle-playbook.md) for defaults, the seven steps, May match / Must not copy, the twelve moves, and the `DESIGN.md` template. |

Name the active mode in the working update. Do not run every mode by default.

**Long polish loops:** at most 3 passes on the same unit. If the same failure
repeats, stop, report what each attempt changed and the unresolved failure,
offer 2 to 4 options, and let the user pick.

**Multi-agent work:** for a large surface build, ask first: "Run this as a
multi-agent team (more thorough, roughly 3 to 5 times the tokens) or
single-agent?" This skill spawns at most 4 subagents and names the model they
bill to. Anything larger goes to suede-agent-teams.

## Read current truth first

1. Identify the surface: repo, route, live URL, deploy target, branch, dirty
   files.
2. Read `PRODUCT.md`, `DESIGN.md`, `AGENTS.md`, `CLAUDE.md`, and `README.md`
   when present. If `PRODUCT.md` or `DESIGN.md` is missing on a major surface,
   proceed and offer to create them afterward.
3. Render the current UI at desktop and mobile before judging it.
4. Name the physical scene: who uses this, where, under what light, under what
   pressure, and what they need to do next.

State the preflight line:

```text
SUEDE_DESIGN_PREFLIGHT: target=<repo-or-folder> surface=<route-or-url> mode=<fix|design|build|system|qa|restyle> register=<brand|product|docs|campaign|mobile> context=<pass|partial|none> render=<pass|pending|skipped:reason>
```

**Render, do not guess.** Desktop at 1280 px and mobile at 390 px minimum:
`npx playwright screenshot <url> --viewport-size=1280,900 desktop.png` and
`--viewport-size=390,844 mobile.png` (first run: `npx playwright install
chromium`), or the environment's built-in preview tool. For App Store sets,
check Apple's current screenshot specifications before exporting: the 6.9-inch
iPhone slot takes 1320 x 2868 (1290 x 2796 also accepted) and the 13-inch iPad
slot takes 2064 x 2752 (2048 x 2732 also accepted).

## Register sets the defaults

| Register | Signal | Defaults |
|---|---|---|
| Brand | Homepage, about, campaign, press, portfolio | Highest typographic ambition, lowest density, motion earns premium feel, declarative copy |
| Product | App UI, dashboard, settings, onboarding, admin | Density serves the task, motion clarifies state, instructional copy |
| Docs | Reference, API, guides, changelog | Monospace hierarchy, no decoration, precise scannable copy |
| Campaign | Launch, landing, offer, event | Conversion structure first, proof above the fold, one CTA |
| Mobile and listing | Screenshots, paywall, onboarding | Platform conventions, system-safe type, no custom fonts in store screenshots |

When a request spans registers (a dashboard with a marketing hero), name both
and apply each to its section.

## Delivery contract

Before a new surface, a significant redesign, a component family, or a system
pass, lock:

```text
Objective (user-visible outcome):
Surface (repo, route, live URL, branch):
Audience and primary action:
Register:
Reference or visual target:
Done signal (screenshot, build, test, deploy readback):
Constraints (WIP to keep, routes not to touch, unapproved claims):
Spacing, grid, breakpoints:
Color roles, states, contrast, dark and light behavior:
Type roles, hierarchy limits, measure, truncation:
Interface vocabulary (buttons, empty, loading, error, success):
Assets, logo use, motion rules:
Acceptance checks (desktop, mobile, accessibility, render evidence):
```

For a narrow fix, compress to target, route, primary action, and done signal.
Work is done when the done signal has been checked, or the remaining gap is
named.

## Design laws

The numeric rules (spacing, type scale, color, contrast, dark mode, density,
components, assets, motion) are in `references/design-laws.md`. Read it when
writing or reviewing actual styles. The heads that drive every decision:

- **Subject first.** If the remaining visual could belong to any SaaS, exchange,
  or streaming app, it has failed.
- **One memorable move.** Each major surface gets one subject-native signature
  element (a rights ledger, a chain-of-title timeline, an audit rail). Name it
  before building. Keep everything around it disciplined.
- **Color strategy before values.** Restrained (tinted neutrals plus one accent
  at 10% or less; dashboards and tools), Committed (one saturated color carries
  30 to 60%; brand pages), Full palette (3 or 4 named roles; data viz and
  campaigns), or Drenched (the surface is the color; launch heroes). Color
  encodes meaning. Prefer OKLCH, tint neutrals toward the brand hue, never pure
  #000 or #fff.
- **Dark mode is not an inversion.** Surfaces at OKLCH L 12 to 24 stacked
  lighter as they rise, border-based elevation, 7:1 body contrast, chroma cut 15
  to 25%, semantic tokens only.
- **Type.** Contrasting display and body faces with distinct jobs, at least a
  1.25 scale ratio, 65 to 75 character measure, `clamp()` fluid display sizes.
- **Layout.** Structure explains the product. A row beats a card; a card inside
  a card means the information architecture is wrong. The first viewport shows
  brand, offer, and a hint of what follows. Text never clips at any width.
- **Motion by register.** Animate `transform` and `opacity` only, ease-out
  around 220 to 280 ms, and always ship a `prefers-reduced-motion` variant.

**Components the local system lacks:** pull from the vetted registries in
`references/ui-component-sources.md` and run its adoption checklist (local
first, retokenize, motion law, license tier, render proof) before the import
lands. Read it only when importing.

## Aesthetic direction

For a new surface or significant redesign, commit to one named direction:
refined minimal, editorial, brutalist, retro-technical, organic, maximalist,
luxury refined, or product-utilitarian. A design with no committed direction
reads as generic.

Two reflex tests before committing. First: could someone guess the palette from
the product category alone ("music tool, so dark purple")? Reject it. Second:
could someone guess the aesthetic family from category plus anti-references
(muted teal on dark)? Go further.

Write a theme sentence concrete enough to force the answer: "a studio engineer
reviewing a rights dispute at 2 a.m. on a secondary monitor" decides more than
"a user looking at data". Dark or light is never a default.

## Scoped bans

Authoritative list; the full gallery with before and after fixes and the narrow
exceptions is in `references/scoped-bans.md`.

- Decorative orbs, bokeh blobs, and generic gradient meshes standing in for art
  direction.
- Gradient text on headlines.
- Decorative glass panels floating over gradients.
- Icon-card grids as the page structure.
- First-order category palettes.
- **Fake metrics, testimonials, or partner claims. No exception.** Use a real
  stat with its source, a `[NEEDS REAL DATA]` placeholder, or a structure that
  needs no number.

The first five allow a named exception for source fidelity, platform
convention, accessibility, a confirmed brand system, or a direct request.

## Words on the surface

The surface is not finished until the words carry it. Inside a design pass:

- Labels are actions, not categories: "Register Work", not "Registration".
- One action name across button, toast, empty state, and confirmation.
- Errors say what happened and how to fix it. Empty states name the next
  specific action.
- No em dashes, no promotional exclamation points, no invented proof.
- On public pages, structure for search and answer engines: one H1 that says
  what the page is, a direct answer in the first viewport, question-shaped H2s,
  an FAQ block, descriptive link text, and real text (not text baked into
  images) for anything a search or AI engine should quote.

Hero, page, and campaign copy beyond interface labels goes through suede-copy,
which owns frameworks, variants, the answer-first SEO pass, and the 70-point
copy score. Run it in the same pass when a build needs new copy.

## System audit

For a reusable app shell, launch system, or component family, read
[references/system-audit.md](references/system-audit.md): it holds the
deliverables (token map, state matrix, vocabulary, screenshot contract,
accessibility pass, migration notes), the drift-cause list, and the /100
scorecard. Below 70: fix the two lowest dimensions before styling new features
there. Any dimension at 4 or lower is a P1 finding.

## Implementation workflow

1. **Scan** files, styles, rendered UI, and route behavior.
2. **Shape** a compact plan: color, type, layout, motion, assets, words,
   verification.
3. **Build** narrowly inside the local architecture. No unrelated refactors.
4. **Render** desktop and mobile.
5. **Review** type, spacing, color, asset fidelity, words, accessibility,
   responsive behavior, and loading, empty, error, hover, focus, and active
   states.
6. **Verify** with the repo's lint, typecheck, test, or build, plus `git diff
   --check`. Verify live URLs before claiming public behavior.
7. **Hand off** target, files changed, commands, verification, caveats, next
   step.

For shaping or critique, the named lenses in `references/surface-lenses.md`
(`/first-frame`, `/hero-voltage`, `/proof-stack`, `/aeo-shine`,
`/mobile-seduction`, `/link-sweep`, and others) give quick, nameable angles.
Name the ones you apply.

## Visual QA report

When a source target exists, save `visual-qa-report.md` with: source path or
URL; implementation path, URL, or screenshot; viewport and state; theme, auth,
data, and interaction state; full-view comparison; focused-region comparison
(or why it was not needed); findings ordered P0 to P3; patches since the last
pass; and `final result: passed` or `final result: blocked`.

Compare source and implementation in the same pass, never from memory. Mark
`blocked` when a required artifact is missing or actionable P0 to P2 issues
remain in layout, type, color, assets, words, accessibility, responsiveness,
interaction states, or source fidelity.

## Red flags: stop

- "The code reads right, so it will render right." Render it.
- "Too small for visual QA." One-line CSS changes break mobile nav.
- "Music tool, so dark purple." First-order reflex; see Scoped Bans.
- "A placeholder metric is fine for now." Fake numbers ship. Use `[NEEDS REAL DATA]`.
- "I remember what the reference looks like." Compare in the same pass.
- "I'll write the tokens down later." Unlogged tokens are how drift starts.
- "Run every lane, it's a big job." Name the active mode and why.

## Ship gate

For launch pages, app shells, public marketing surfaces, store assets, or
high-visibility dashboards, end with:

```text
Surface:
Mode:
Done signal:
Evidence (screenshots, commands):
Copy gate (suede-copy score if new copy shipped):
Search gate (H1, direct answer, metadata, crawlable text):
Design system gate (score or drift notes):
Visual QA gate (passed | blocked):
Blockers:
Accepted caveats:
Next action:
Status: ship | ship-with-caveats | hold
```

Recommend `hold` when a core path is broken, claims are false, screenshots do
not match the build, an accessibility issue blocks the primary action, or the
live route cannot be verified. `ship-with-caveats` needs every P0 resolved and
each caveat named and non-critical. When recommending `hold`, name the single
blocker and give 2 to 4 real options; the user decides.

For restyles, add: reference URL, target URL, target source, fidelity, depth,
unmatched reference signals, and legal or brand caveats.

## Output

Findings lead, rationale follows. Name the file and line. For builds, state
what changed and show render evidence. Do not narrate internal steps
(preflight, mode routing) to the user, and do not praise the existing design
in place of findings. After meaningful work, add a one-paragraph plain
explanation, then:

```text
Changed:
Design QA:
Screenshots or render notes:
Design-system drift:
P0/P1/P2 blockers:
Verification:
Caveats:
Status: ship | ship-with-caveats | hold
```

## Boundaries

- Preserve WIP. Never edit unrelated files.
- Never copy protected site assets, exact copy, proprietary code, or
  trademarked identity during a restyle, and never carry over the reference's
  proof, pricing, guarantees, or metrics.
- Never invent metrics, pricing, partners, testimonials, legal clearance, or
  release outcomes.
- Never call work done until the done signal has been checked or the remaining
  gap is named.

## Routing

- Copy with no layout work, or new hero and page copy inside a build →
  suede-copy
- Page conversion architecture beyond visual polish → suede-site-alchemy
- A-F findability, first-screen, CTA, and citation grade of a public page →
  suede-visibility-grader; scored search audit → suede-seo-audit
- The design change touches shared components, routing, auth, payments, or
  analytics → suede-code before the ship gate
- Copy, layout, assets, and QA must run as coordinated parallel lanes →
  suede-agent-teams
- The finished surface ships with a software, skill-pack, or MCP release that
  needs install docs and release notes → suede-launch-packaging

## Worked contract

[Worked contract](references/usage-contract.md) gives a bounded input, expected output and failure check for this workflow.
