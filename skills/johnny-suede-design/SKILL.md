---
name: johnny-suede-design
description: Design anything Suede ships. Routes brand surfaces, product UI, and token systems through register classification, context gate, design laws, and visual QA. Use as the fast entry point for any design request.
---

# Johnny Suede Design

This is the entry point for the full design stack. It routes requests into the
right lane — visual polish, copy, SEO, iOS surfaces, or conversion architecture
— and brings them to a shippable handoff. Writing mode is on by default: a
surface isn't finished until the copy pulls its weight.

## Core Job

The job is a surface that feels specific — not polished-generic. The named
company, product, or audience should be recognizable in every design decision
before the logo loads. Work from live URL, source, and rendered screenshot.
Never design from assumption when evidence is available.

Preserve the existing app framework, tokens, components, routing, and WIP
unless the task explicitly asks for a larger rebuild.

This skill routes and orchestrates. For deep visual QA, design-system
extraction, or state-rich UI checks, run `$suede-design` as a lane inside this
skill. For major public or launch work, apply the five-gate checklist: Copy
Gate, Visual QA Gate, SEO/AEO/AI EO Gate, Design System Gate, Launch Gate.

When the surface is public, structure it for SEO, AEO, AI EO, Google, Gemini,
and AI search with clear CTAs. When the surface is mobile, include Apple, iOS,
App Store, screenshot, onboarding, paywall, and app-shell needs in the design
pass.

For Suede work, anchor design and copy in creator ownership, programmable IP,
provenance, registry-backed media, royalty routing, licensing readiness, and
agent commerce. For a supplied company, replace Suede nouns, proof, voice, and
claim boundaries with that company's brief. Do not use em dashes in public copy.

## Surface Classifier

Classify the surface before any design work starts. Misidentifying the register
produces wrong tone, wrong density, and wrong motion posture.

| Register | Signal | Defaults |
|---|---|---|
| Brand | Homepage, about, campaign, press | Highest typographic ambition, lowest density, motion earns premium feel, copy is declarative |
| Product | App UI, dashboard, settings, onboarding | Density serves task completion, motion clarifies state, copy is instructional |
| Docs | Reference, API, guides, changelog | Monospace hierarchy, zero decoration, copy is precise and scannable |
| Campaign | Launch, landing, offer, event | Conversion architecture first, proof stack above the fold, CTA is singular |
| App Store / iOS | Screenshots, paywall, onboarding | Apple clarity conventions, system-safe typography, no custom fonts in screenshots |

When the request spans registers (e.g., a dashboard with a marketing hero),
name both and apply each register to its section.

## Routing

This skill is the entry point. It handles the full pass or routes to a lane:

- **Single visual polish pass** on a surface with no copy or SEO work needed → run `$suede-design` directly
- **Copy or voice work only**, no layout changes → run `$suede-copy` directly
- **Full redesign, launch surface, or conversion work** → this skill orchestrates; run Design Contract, then route lanes in parallel where possible
- **Style transfer from a reference URL** → open with `$suedify` before any design work; Suedify sets the visual vocabulary, then design and copy lanes refine it
- **SEO or visibility audit only** → run `$suede-seo-audit` or `$suede-visibility-grader` directly
- **Unknown scope** → run scout step, read the surface, then name the register and lanes before touching anything

Never run all lanes by default. Name which lanes are active and why before starting.

## Minimum Signal Gate

Stop and ask only if none of these can be read from context:

| Required | Source |
|---|---|
| Target URL or file path | Supplied or inferable from repo |
| Primary action the surface must drive | Supplied or read from existing CTA |
| Register (brand / product / docs / campaign / iOS) | Inferable from surface type |
| Company or brand (for non-Suede work) | Supplied in brief or inferable from domain |

Everything else — tone, color direction, layout choices, copy angle — is a
design decision. Make it, show the reasoning in the output, and let the user
override. Do not ask about optional parameters before starting.

## Company Brief (Non-Suede Work)

Supply in natural language or this form:

```text
Company:
Product or offer:
Audience:
Category:
Voice:
Terms to use:
Terms to avoid:
Proof:
Allowed claims:
Forbidden claims:
Primary CTA:
Reference URLs:
Assets or brand rules:
```

When a brief is active, replace all Suede positioning, domain language, and
claim boundaries with it. Keep the full workflow. Rename "Cue Suede" to
"Cue [Company]" in the output. If no brief and no explicit Suede context, ask
for the company.

Site-alchemy notes (use as surface modifiers, not shell commands):

- `/vibe-scan`: Name the current feeling, desired feeling, and the mismatch that blocks trust, desire, clarity, or action.
- `/first-frame`: Judge only the first viewport for brand, offer, proof, and primary action.
- `/desire-line`: Trace the path from first glance to click and remove sections that do not increase want, trust, urgency, or clarity.
- `/hero-voltage`: Sharpen the hero around a concrete noun, buyer-visible outcome, proof hint, and one primary CTA.
- `/offer-spine`: Reduce the page to one buyer, one pain, one transformation, one proof stack, and one action.
- `/cta-magnet`: Turn vague buttons into specific actions with clear next-step value.
- `/objection-burn`: Answer the smart buyer's hesitation with proof, scope, limits, and risk reversal.
- `/palette-pressure`: Improve color contrast, hierarchy, semantic roles, and palette richness without falling into one-hue design.
- `/type-chemistry`: Tune display, body, mono, button, and caption type so the page feels deliberate and readable.
- `/section-rhythm`: Balance density and breathing room so proof, product, story, and action do not collapse into a wall of cards.
- `/trust-lacquer`: Turn trust marks, stats, logos, testimonials, security, and proof claims into a real argument without fake proof.
- `/proof-stack`: Build a layered proof argument from artifacts, links, screenshots, commands, examples, quotes, docs, and visible product evidence.
- `/console-moment`: Add one inspectable product-style moment such as a status rail, audit result, campaign ledger, asset passport, or workflow card.
- `/aeo-shine`: Tune titles, metadata, schema, headings, answer blocks, FAQ, plain-language summaries, and crawler-readable structure.
- `/visitor-intent`: Surface what the visitor is likely trying to do and route them to the right proof, action, docs, demo, or contact path.
- `/proof-to-pipeline`: Connect proof, content, landing pages, visitor signals, CRM/follow-up, and next actions.
- `/mobile-seduction`: Make mobile feel intentionally composed instead of merely stacked.
- `/motion-restraint`: Use motion only when it clarifies state, sequence, or premium feel, and respect reduced motion.
- `/link-sweep`: Click or inspect every CTA and navigation path, then remove or replace dead or misleading routes.
- `/ship-polish`: Run formatting, checks, browser QA, screenshots or render notes, link checks, and live verification before handoff.

## Design Contract

Before major design work, name:

```text
Objective:
Surface:
Audience:
Primary action:
Register: brand | product | docs | campaign | app workflow
Reference URL or visual target:
Done signal:
Constraints:
Lanes:
```

For small polish work, compress to the target, route, primary action, and done
signal.

For major design work, add:

```text
Source truth:
Design brief confirmed:
Render evidence:
Reference/mock status:
Design-system status:
Apple/iOS state coverage:
Ship blockers:
```

## Workflow

1. **Read current truth first.** Open the live URL or screenshot. Read the
   source route. Check dirty files, docs, and existing copy. Identify the
   surface type (brand, product, app, campaign, docs) — this determines tone
   density, motion posture, and layout defaults before any pixel moves.
2. **Shape the page job.** Decide what the surface must help the reader do.
3. **Lock the visual direction.** Choose layout, type, color roles, asset
   strategy, motion posture, and one memorable subject-native move.
4. **Write with the design.** Improve headings, buttons, body copy, empty
   states, errors, proof blocks, FAQ, SEO/AEO/AI EO, answer-ready summary, and
   Apple or iOS copy when relevant.
5. **Build narrowly.** Use existing framework, components, tokens, and icon
   library. Avoid unrelated refactors.
6. **Render and compare.** Check desktop and mobile, first viewport, text fit,
   spacing, states, accessibility basics, links, and visual balance.
7. **Run visual QA.** For source-to-implementation work, compare source visual
   truth and rendered implementation together, with matched viewport, state,
   theme, auth, content, and interaction conditions.
8. **Grade visibility.** Score findability, CTA pull, proof, AI readability,
   company or Suede SEO strength, and design signal when the surface is public.
9. **Review and ship.** Run the relevant test/build/check commands, then hand
   off with evidence and caveats.

## Design Laws

- Subject first: strip the logo and the surface should still be unmistakably
  theirs. Every layout choice, type weight, and motion decision answers to the
  product's native world, not a design trend.
- One memorable move per surface. For Suede: rights ledger, waveform proof,
  studio console, claim receipt, provenance timeline. For any company: one
  product-native device — a live data rail, a diagnostic card, an audit ledger,
  a timestamp receipt — that earns attention because it only makes sense for
  that product. If the memorable move could appear on a competitor's site,
  replace it.
- Cards are for repeated items, framed tools, and modals. Do not put cards
  inside cards.
- Text must fit its container on mobile and desktop.
- Use icons for familiar tool commands when the local icon set has them.
- Motion posture by register: brand surfaces earn motion as premium signal
  (entrance reveals, parallax subtlety, micro-transitions); product surfaces
  use motion only to clarify state change or sequence (no decorative animation
  in dashboards or settings); docs surfaces use no motion; campaign surfaces
  use motion only on the primary CTA or hero transformation. Always include a
  `prefers-reduced-motion` override. Motion that cannot be explained as "this
  clarifies X for the user" is decorative — cut it.
- Never ship: decorative orbs, gradient-as-personality, icon-card grids as the
  entire page, fake metrics, unverified partner logos, or stock testimonials.
  These are signals that no design decision was made. Exceptions require a
  direct source-fidelity or platform-convention justification.

## Output Shapes

For a design plan:

```text
Objective:
Surface:
Design direction:
Copy direction:
SEO/AEO/AI EO notes:
Primary CTA:
Proof stack:
Implementation lanes:
Verification:
```

For a finished design pass:

```text
Simple explanation:
One or two sentences for a non-coder.

Usual breakdown:
Changed:
Design QA:
Desktop/mobile screenshots or render notes:
Visual QA surfaces checked:
Visibility grades:
Design-system drift notes:
P0/P1/P2 blockers:
Copy/SEO QA:
Verification:
Caveats:
Status: ship | ship-with-caveats | hold

Cue Suede: revise, preserve, or accept — say what changed.
```

## Ship Gate

`hold` when: a core user path is broken; rendered output contradicts the
implementation; text overflows or truncates on any breakpoint; mobile layout is
unintentionally stacked; any accessibility issue blocks the primary action; copy
makes unsupported claims; or the live surface cannot be verified.

`ship-with-caveats` is only valid when all P0 issues are resolved and remaining
issues have a documented owner and timeline. Public surfaces cannot ship if the
design gate passes while visual or accessibility blockers are open.
