---
name: suede-workflow-skills
description: Public umbrella workflow for Suede design, copy, SEO audits, site restyling, code review, agent-team QA, plugin docs, and public launch packaging. Use when a user asks to load the full Suede workflow pack, use Suedify, improve a website, write Suede copy, audit SEO, run design QA, review code, prepare public docs, or coordinate multiple Suede work lanes.
---

# Suede Workflow Skills

Use this public umbrella skill when a user wants the full Suede workflow loaded
from one installable GitHub skill path.

This skill is the public entry point for:

- **Suedify:** study a reference URL and push a target URL toward that style.
- **Suede Design:** make a site, app surface, or component feel intentional,
  polished, responsive, and Suede-native.
- **Suede Copy:** write direct public copy, docs, SEO metadata, CTAs, launch
  copy, FAQ answers, and claim boundaries.
- **Suede Site Alchemy:** sharpen a landing page, campaign page, microsite, or
  conversion surface.
- **Suede Code Review:** review changes for real bugs, regressions, security
  risk, public-claim drift, and missing verification.
- **Suede Agent Teams:** split important work into clear lanes for scout,
  planner, builder, design reviewer, code reviewer, release verifier, and
  handoff writer.

If the individual public skills are also installed, use them directly when
their names match the task:

- `suedify`
- `suede-design`
- `suede-copy`
- `suede-site-alchemy`
- `suede-code-review`
- `suede-agent-teams`

If only this umbrella skill is installed, follow the condensed workflow below.

## Core Rule

Start from current truth. Inspect the live URL, repo, docs, screenshots, or
rendered output before making design, copy, SEO, code, or QA claims.

Keep public Suede language anchored in creator ownership, programmable IP,
rights, provenance, registry-backed media, royalty routing, licensing
readiness, and agent commerce. Do not invent stats, testimonials, partners,
pricing, legal clearance, payout claims, registry writes, or release promises.

## When To Use MCP

Use the Suede MCP only when it adds structure:

- list available Suede skills;
- explain install options;
- scaffold a full SEO copy audit;
- generate a QA checklist;
- help another agent understand the Suede stack quickly.

Skip MCP for small edits, normal implementation, quick copy fixes, or anything
where direct skill execution is faster.

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

## Copy And SEO Workflow

For public copy, docs, README, landing pages, skill pages, plugin listings, and
SEO passes:

1. Identify reader, page type, primary action, proof, and claim boundaries.
2. Write the clearest outcome first.
3. Use concrete artifacts, commands, links, screenshots, files, or examples as
   proof.
4. Keep titles under 60 characters when practical and meta descriptions under
   160 characters when practical.
5. Check H1, headings, internal links, schema/JSON-LD, CTA clarity, FAQ fit,
   and search intent.
6. Remove generic AI phrasing, filler, vague claims, and unsupported promises.

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
Claim boundaries:
Ship gate: ship | ship-with-caveats | hold
```

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
2. Review for production behavior, security, public claim truth, regression
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

## Agent Team Workflow

Use team lanes for large, risky, cross-surface, public, design-heavy, or
release-bound work.

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

Useful lanes:

- Scout: repo, docs, live state, dirty files, and blast radius.
- Planner: tasks, dependencies, and acceptance criteria.
- Builder: narrow code/content changes.
- Design reviewer: responsive visual QA, accessibility basics, copy, states.
- Code reviewer: correctness, security, regression, tests, install paths.
- Release verifier: build, deploy, live/API behavior, public claims.
- Handoff writer: files changed, commands, verification, caveats, next step.

## Public Install Guidance

This public umbrella skill can be installed from GitHub:

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo JasonColapietro/suede-creator-skills \
  --path skills/suede-workflow-skills
```

Install the individual public workflow skills when direct triggering matters:

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo JasonColapietro/suede-creator-skills \
  --path skills/suedify \
  --path skills/suede-design \
  --path skills/suede-copy \
  --path skills/suede-site-alchemy \
  --path skills/suede-code-review \
  --path skills/suede-agent-teams
```

Restart Codex after installing new skills.

## Boundaries

- Do not expose private paths, credentials, secrets, tokens, unreleased assets,
  private repos, or private Suede service details.
- Do not copy protected site assets, exact UI copy, proprietary source code, or
  trademarked identity when using Suedify.
- Do not invent metrics, pricing, partner claims, testimonials, legal clearance,
  payout claims, registry writes, or release/distribution outcomes.
- Do not mark work done until the stated done signal has been checked or the
  remaining caveat is explicitly named.
