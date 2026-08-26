# UI Component Sources

Vetted third-party component sources for build work. Vetted means each entry
was loaded live, its license and pricing read, its domain run through threat
reputation, and its source repository pinned before it entered the table.
Reach for one when the local design system lacks the piece — the standing rule
still holds: existing local tokens, components, and icon libraries win over
any import.

Entries verified 2026-08-26 (live load + reputation scan + repo check). If a
URL 404s, a license changed, a tier moved, or a repo pin goes stale, fix this
file in the same change that works around it.

| Source | URL | Pinned repo | Holds | Stack | License / tier |
|---|---|---|---|---|---|
| shadcn/ui | https://ui.shadcn.com | github.com/shadcn-ui/ui | Design-system foundation: primitives, forms, dialogs, tables, blocks — the registry the rest plug into | React, Tailwind | MIT, free |
| beUI | https://beui.dev | github.com/starc007/ui-components | 100+ animated components: modals, docks, command palettes, dynamic islands, carousels | React/Next.js, Motion (Framer), Tailwind | MIT core; paid Pro (pro.beui.dev) |
| Rare UI | https://rareui.com | github.com/swamimalode07/rare-ui | Small set of uncommon animated one-offs: fluid orb, gravity letters, duration picker, OTP input | React, one file per component, shadcn CLI install | MIT, free |
| Transitions.dev | https://transitions.dev | github.com/Jakubantalik/transitions.dev | Micro-transitions: modal, skeleton loader, badge, toggle, dropdown animation snippets; also packaged as an installable agent skill (`Jakubantalik/transitions-dev`) | Portable CSS (`t-*` namespaced), copy-paste, no framework deps | Free tier; paid Pro |

Name-collision warning: an unrelated project also called "RareUI" lives at
rareui.in (different author, different repo). The vetted one is rareui.com
backed by the pinned repo above — check the pin before installing.

## Not yet vetted — do not treat as a vetted source

- **Beautiful UI** (https://www.beautifului.dev, repo
  `github.com/TurboKach/ai-native-react-components`, MIT): AI-native
  primitives — streaming text, thinking states, tool-call traces,
  human-in-the-loop approval flows. The only source in this file aimed at
  that register, and the reason it stays listed. It fails the vetting bar as
  of 2026-08-26: the domain was registered ~2026-08-12 and carries a
  "suspicious" threat-reputation verdict — a pattern consistent with domain
  newness rather than confirmed malice (the repo states "From
  beautifului.dev" and its owner account has been active since 2017), but
  consistent-with is not cleared. Promote it to the table only when both
  hold: the threat verdict has cleared, and the domain is older than 90
  days. Until then, if a build needs an AI-native primitive now, take the
  code from the pinned GitHub repo, not the domain, and read every file
  before it lands.

## Which source for which job

- Base primitive, form, table, or dialog scaffolding → shadcn/ui.
- Agent or AI-product surface — chat stream, thinking state, tool-call
  display, approval step → no vetted source yet; see Beautiful UI in the
  not-yet-vetted section for the interim path.
- Interaction set-piece — dock, command palette, dynamic island, carousel →
  beUI.
- Raw material for the surface's signature move → Rare UI, then customize
  until check 3 below passes.
- Motion detail on a component that already exists — modal open, skeleton,
  toggle, badge → Transitions.dev.

## Adoption checklist (run per imported component)

1. **Local first.** Name the local gap before importing: which token,
   component, or pattern the system lacks. If the local system has the piece,
   style it instead.
2. **Registry over hand-copy.** Install through the shadcn CLI/registry when
   the source supports it (shadcn/ui, beUI, Rare UI); hand-copy only what has
   no registry path, and record the source URL in the commit message.
3. **Signature test.** A stock component from a public library is raw
   material, not a signature move — anyone can install the same one. It counts
   as the surface's memorable move only after subject-native customization:
   swap its content, motion, or geometry for something only this product would
   show.
4. **Retokenize before commit.** Replace the import's palette, radii, spacing,
   and font references with local tokens. An import still carrying its source
   palette is unfinished.
5. **Motion law still applies.** Imported animation animates `transform` and
   `opacity` only, within the timing rules in `references/design-laws.md`, and
   ships a `prefers-reduced-motion` variant — trim whatever the import does
   beyond that.
6. **License and tier check.** Confirm the license file in the source repo
   before shipping to a public or client surface. Free tiers only unless the
   user owns the paid tier (beUI Pro, Transitions.dev Pro) — never paste paid
   content from a demo page.
7. **Render the import.** The source's demo proves the demo. Render the
   component in the local stack at desktop and mobile widths before claiming
   it works.
