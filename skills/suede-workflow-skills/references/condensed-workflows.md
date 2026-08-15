# Condensed Workflows — umbrella-only fallback

Read this file **only when the individual Suede skills named in SKILL.md are
not installed** — for example the Codex install path that installs
`suede-workflow-skills` alone. When the pack is installed (Claude Code
`/plugin install suede-skills@suede`, `install.sh`, or the per-skill Codex
install), route to the named specialist instead: it owns the current version of
every method below and this file is a frozen, lossy summary of it.

Each section is the minimum viable version of one specialist's workflow.

## Contents

| Workflow | Owning skill when installed |
|---|---|
| [Suedify Workflow](#suedify-workflow) | `johnny-suede-design` |
| [Design Workflow](#design-workflow) | `johnny-suede-design`, `suede-design` |
| [Copy And SEO Workflow](#copy-and-seo-workflow) | `johnny-suede-write`, `suede-copy`, `suede-seo-audit` |
| [Visibility Grading Workflow](#visibility-grading-workflow) | `suede-visibility-grader` |
| [Site Alchemy Workflow](#site-alchemy-workflow) | `suede-site-alchemy` |
| [Code Review Workflow](#code-review-workflow) | `suede-code-review`, `suede-code-grader`, `suede-code` |
| [Agent Team Workflow](#agent-team-workflow) | `suede-agent-teams`, `suede-full-send` |

The Gate policy, Core Rule, Boundaries, and the fix-loop cap in SKILL.md govern
everything here. Nothing in this file overrides them.

## Suedify Workflow

Use this when the user provides or implies:

```text
reference_url -> target_url
```

1. Capture the reference site's layout, hierarchy, spacing, typography, color
   roles, imagery, navigation, motion, proof structure, and mobile behavior.
2. Capture the target site's current content, brand assets, claims, routes,
   dead links, weak copy, and mobile behavior.
3. Map reference signals to target-safe equivalents. Do not copy proprietary
   code, logos, exact copy, private assets, fake proof, or unsupported claims.
4. Implement inside the target's existing framework, components, tokens, and
   routing patterns when possible.
5. Verify desktop and mobile render, text fit, links, accessibility basics,
   build/test commands, and live route before calling the restyle done.

Output:

```text
Reference URL:
Target URL:
Fidelity level:
Changed:
Verification:
Unmatched reference signals:
Legal/brand caveats:
Status: ship | ship-with-caveats | hold
```

## Design Workflow

For design or frontend work:

1. Identify the exact surface: repo/folder, route, live URL, branch, dirty
   files, and relevant local docs.
2. Decide the register: brand page, product UI, dashboard, campaign page,
   docs surface, or app workflow.
3. Name the user-visible job and primary action.
4. Check layout, typography, color, spacing, imagery, state coverage,
   responsiveness, accessibility basics, and copy fit.
5. Render before and after when practical.
6. For major visual work, compare source visual truth and rendered
   implementation together, with matched viewport, state, theme, content, and
   auth conditions.

Major design work needs a compact contract:

```text
Objective:
Surface:
Done signal:
Constraints:
Lanes:
```

Do not call visual work done from source inspection alone when a rendered page
can be checked.

For design-system work, capture at least the token map, component inventory,
state matrix, screenshot contract or preview board, asset register, migration
notes, and a scored quality audit when the scope is broad enough.

## Copy And SEO Workflow

For public copy, docs, README, landing pages, skill pages, plugin listings, and
SEO passes, including AEO and AI EO:

1. Identify reader, page type, primary action, proof, and evidence boundaries.
2. Write the clearest outcome first.
3. Use concrete artifacts, commands, links, screenshots, files, or examples as
   proof.
4. Keep titles under 60 characters when practical and meta descriptions under
   160 characters when practical.
5. Check H1, headings, internal links, schema/JSON-LD, CTA clarity, FAQ fit,
   search intent, answer intent, and sourceable proof.
6. Remove generic AI phrasing, filler, vague claims, and unsupported promises.
7. Run the no-missed copy gate: cut formulaic structure, fake intensity,
   rhetorical setup, inanimate false agency, quote-bait lines, and detached
   business jargon while preserving true Suede specificity.

Full audit output:

```text
[HIGH|MEDIUM|LOW] Finding
Location:
Issue:
Fix:
Suggested copy:
Verification:

SEO title:
Meta description:
H1:
Subhead:
Primary CTA:
Internal links:
Schema changes:
Answer-ready summary:
Evidence boundaries:
Ship gate: ship | ship-with-caveats | hold
```

## Visibility Grading Workflow

For public pages, GitHub Pages sites, docs, campaign pages, launch pages, and
creator pages, use `suede-visibility-grader` when the question is whether the
right person or agent can find the page, understand it, trust it, cite it, and
take the next action.

Grade:

```text
Findability: A-F
First-screen clarity: A-F
CTA pull: A-F
Proof and trust: A-F
AI readability: A-F
Design signal: A-F
Overall: A-F
```

Treat the grade as an execution guide, not an audited traffic metric. Inspect
the live URL or source before grading and name anything that was not checked.
For public surfaces, visual evidence matters. Missing live/render inspection
caps promotion readiness, and broken CTA, false claim, inaccessible primary
action, or unresolved major design-signal failure can hold the page even when
metadata looks acceptable.

## Site Alchemy Workflow

For landing pages, campaign pages, product microsites, public repo pages, or
conversion surfaces:

1. Name one buyer, one offer, one proof stack, and one action.
2. Rewrite the hero before touching decorative details.
3. Build a CTA ladder: primary action, proof/docs action, and next-step action.
4. Improve section rhythm, mobile composition, text fit, and link clarity.
5. Run a link sweep and verify the live or local rendered page before shipping.

Use these named moves as notes, not shell commands:

- `/vibe-scan`
- `/hero-voltage`
- `/offer-spine`
- `/proof-stack`
- `/cta-magnet`
- `/mobile-seduction`
- `/ship-polish`

## Code Review Workflow

For code, docs, plugin, MCP, or public-site changes:

1. Build a context graph: changed files, callers, routes, data flow, configs,
   docs, tests, generated files, and runtime surfaces.
2. Review for production behavior, security, published-statement accuracy, regression
   risk, missing tests, broken install paths, stale docs, and deploy gaps.
3. Lead with findings ordered by severity.

Finding format:

```text
P0/P1/P2/P3 - Title
File/route:
Evidence:
Impact:
Fix:
Verification:
Confidence:
```

Ship gate:

- `ship`: required verification passed and no known blocker remains.
- `ship-with-caveats`: no blocker remains, but caveats are named.
- `hold`: blocker or high-risk unknown remains.

For important work, include a Suede A-F code grade:

```text
Code grade:
Correctness: A-F
Security and permissions: A-F
Data and state: A-F
Suede truth: A-F
UX and release behavior: A-F
Tests and verification: A-F
Deploy readiness: A-F
Overall: A-F
```

When the user asks for a grade more than a full findings report, route to
`suede-code-grader` and include the explanation for why the grade landed there.

## Agent Team Workflow

Use team lanes for large, risky, cross-surface, public, design-heavy, or
release-bound work. Use the max-agent loop when the user asks for it or the
task needs continuous quality gates, evals, recovery controls, and release
truth.

When the user explicitly asks for full send, max effort, max agents, max agent
teams, spare no compute, to throw or burn tokens, to fix everything, not to
stop, or says "never end your allocation above zero," route through
`suede-full-send`. It freezes authority and selects one controller; it does
not create a competing team protocol or promise access to a hidden token
counter.

Define:

```text
Objective:
Target:
Constraints:
Lane Map:
Dependency Order:
Done Signal:
Ship Gate:
```

Useful grouping loops:

- Linear delivery loop: scout, plan, build, verify, review, ship.
- Continuous PR loop: branch/PR/CI/review/release control for public or risky
  work.
- RFC/DAG loop: decompose broad work into ordered decisions and atomic tasks
  before implementation.
- Exploratory parallel loop: run independent approaches or audits in parallel
  only when file ownership does not collide.
- Parallel surface loop: split lanes only when file ownership does not collide.
- Scout and constraints loop: map docs, WIP, risky files, live routes, owners,
  and no-touch boundaries before edits.
- Adversarial review loop: one lane tries to break the work from production,
  user, release, published-statement, and abuse angles before release.
- Consensus review loop: two review lenses merge blockers, caveats, and fixes.
- Design and visibility loop: rendered QA plus A-F page visibility grading.
- Code grade loop: A-F code grade plus fix briefs for weak lanes.
- WIP protection loop: claim allowed files and sequence lanes that collide.
- Release lock loop: build, deploy, live/API readback, claim truth, handoff.
- Recovery loop: isolate a failed check, patch the gap, rerun the failed check.
- Evidence handoff loop: gather screenshots, commands, URLs, caveats, and next
  action for the next agent.
