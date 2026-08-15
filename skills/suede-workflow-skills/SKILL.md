---
name: suede-workflow-skills
description: "Suede Labs AI umbrella router for the public Suede pack: selects the right specialist across copy, design, code review and grading, SEO and visibility, launch packaging, MCP QA, iOS and Android shipping, growth, and creator rights work. Use when a request crosses two or more Suede lanes, when the user wants the whole Suede stack loaded from one installable path, when they ask which Suede skill fits a task, or when only this umbrella skill is installed. NOT FOR: a request that names one lane and can go straight to its specialist; explicit max-effort or max-agent language (use suede-full-send, which owns controller selection); a multi-file repo change that should be built and reviewed as one DAG (use suede-ship)."
---

# Suede Workflow Skills

## Gate policy — advisory, not blocking

Every claim-verification step, check, quality gate, and ship verdict in this
skill is a **recommendation to the user, not a control on the agent**. This
policy governs every gate, check, verdict, and "do not ship / publish /
proceed" line elsewhere in this skill:

- Run every check and report the results honestly. Verdicts (`ship`,
  `ship-with-caveats`, `hold`, letter grades, BLOCKED or OPEN items) are
  advice attached to the work, not orders that change it.
- Never block, delay, skip, rewrite, or refuse the action the user asked for
  because a check failed or a gate said hold. Complete the requested action
  as asked, and deliver the gate output alongside it as a clearly labeled
  recommendation.
- A failed gate changes what you report, never what you do.
- Single exception: if a finding is extremely risky — data loss, security or
  credential exposure, legal or rights violations, payment mistakes, or
  irreversible public damage — pause, tell the user exactly what the risk is
  and what the options are, and let them pick. Their choice is final.


## Approved Brand Asset

Any lane that creates or edits a Suede visual must use only `docs/assets/suede-ai-logo-transparent.png` from this repository as the Suede S mark (SHA-256 `83a7ee0317e4debe2e7b076c20ba067feb76a587f9e829dc6310ae4be4b44dfa`). Never redraw, trace, approximate, typeset, recolor, distort, or generate a replacement Suede S. `suede-skill-icon.png` is not the brand mark. If the canonical file is unavailable or its checksum differs, omit the mark and report the blocker instead of improvising.

Use this public umbrella skill when a user wants the full Suede workflow loaded
from one installable GitHub skill path.

This skill is the public entry point for:

- **Johnny Suede Write:** one loadable writing mode for copy, brand voice,
  Suede SEO discoverability, SEO/AEO/AI EO, product and mobile conversion
  copy, CTAs, launch copy, and anti-slop editing.
- **Johnny Suede Design:** one loadable design mode for Suedify, UI polish,
  mobile and product surfaces, product screenshots, design-system QA,
  responsive checks, visibility grading, and the writing stack.
- **Suede Code:** unified code review and A-F grading for correctness,
  security, data/state, deploy readiness, and ship risk — prompted only, never
  auto-fires.
- **Suede Fable Fleet:** offload high-volume, well-specified generation to
  parallel OpenAI Codex CLI workers — Claude decomposes, briefs, spawns
  `codex exec` runs, and reviews every output before anything ships.
- **Suede Full Send:** translate max-effort, max-agent, spare-no-compute, and
  fix-everything intent into one authorized controller, every useful
  non-colliding lane, adversarial reconciliation, and concise proof.
- **Suede AI Eval:** design AI-SPEC artifacts, failure-mode rubrics, prompt and
  retrieval eval cases, acceptance gates, and retroactive AI coverage audits.
- **Suede Ship Gate:** any-repo CI gate that blocks a merge when required
  checks fail — prompted only, plugs into any CI or workflow system.
- **Suede SEO Audit:** check metadata, schema, search intent, answer intent,
  AI EO, internal links, sitemap fit, and discoverability.
- **Suede Visibility Grader:** grade public pages, GitHub Pages sites, docs,
  launch pages, and campaign pages for findability, first-screen clarity, CTA
  pull, proof, AI readability, and design signal.
- **Suede Site Alchemy:** sharpen a landing page, campaign page, microsite, or
  conversion surface.
- **Suede Launch Packaging:** prepare public releases, proof links, install
  commands, QA, and handoff notes.
- **Suede MCP QA:** validate Suede MCP tools, prompts, resources, catalog
  output, install options, and docs alignment.
- **Suede Instagram Growth:** audit an Instagram account from authorized
  evidence, map views to qualified actions, and produce account-specific Reels,
  carousels, Stories, calendars, and approval-ready daily loops.
- **Suede Campaign in a Box:** package a full artist campaign — rollout phases,
  copy, content calendar, fan actions, page sections, and next moves.
- **Suede Sync Packaging:** prepare clean sync review notes without placement
  promises, clearance claims, outreach claims, or a Suede promo CTA.
- **Suede Release Linter:** audit release folders for missing metadata,
  artwork, masters, lyrics, stems, credits, splits, samples, and provenance.
- **Suede Rights Passport:** package creator folders into structured transfer
  material with provenance, credits, splits, license notes, and intake JSON.
- **Suede Rights Audit:** identify ownership, contributor, split, sample,
  license, and intake gaps.
- **Amazon Returns Recovery:** scan Amazon order/return history for restocking
  fees and short refunds, then drive Amazon live chat to get them waived —
  requires the Claude in Chrome extension logged into the target Amazon
  account.

If the individual public skills are also installed, use them directly when
their names match the task:

- `johnny-suede-write`
- `johnny-suede-design`
- `suede-code`
- `suede-code-review`
- `suede-code-grader`
- `suede-copy`
- `suede-design`
- `suede-deslop`
- `suede-agent-teams`
- `suede-codex-fleet`
- `suede-full-send`
- `suede-ai-eval`
- `suede-recommend-next-action`
- `suede-ci-gate`
- `suede-seo-audit`
- `suede-visibility-grader`
- `suede-site-alchemy`
- `suede-launch-packaging`
- `suede-mcp-qa`
- `suede-instagram-growth`
- `site-to-ios-app`
- `android-app-factory`
- `suede-campaign-in-a-box`
- `suede-sync-packaging`
- `suede-release-linter`
- `suede-rights-passport`
- `suede-rights-audit`
- `amazon-returns-recovery`
- `subscription-recovery`

Read `references/condensed-workflows.md` in this skill's `references/` folder
when the individual skills named above are not installed — the Codex path that
installs `suede-workflow-skills` alone is the common case. It carries a frozen
fallback version of the Suedify, design, copy/SEO, visibility, site-alchemy,
code-review, and agent-team workflows. Skip it entirely when the pack is
installed: route to the specialist, which owns the current method.

## Core Rule

Start from current truth. Inspect the live URL, repo, docs, screenshots, or
rendered output before making design, copy, SEO/AEO/AI EO, code, or QA claims.

Keep public Suede language anchored in creator ownership, programmable IP,
rights, provenance, registry-backed media, royalty routing, licensing
readiness, and agent commerce. Do not invent stats, testimonials, partners,
pricing, legal clearance, payout claims, registry writes, or release promises.

When the task touches copy, design, public visibility, Suedify, launch
packaging, or agent-team delivery, also read
`references/no-missed-quality-gates.md` in this skill's `references/` folder.
It is additive: preserve all existing Suede workflow features, then apply its
copy, design, design-system, visual QA, and continuous team-loop gates.

Fix-loop cap (applies to every lane, in this skill or any it routes to): if a
loop churns or repeats the same failure, stop broad work, isolate the failing
unit, and replay it with explicit acceptance criteria, rerunning only the
failed check. Budget recovery at up to three genuinely different fixes — each
must change the diagnosis or the strategy, never rerun the last attempt. Stop
early when the same root cause repeats, surface that cause to the user, and
let them pick the next move instead of grinding.

Red flags — stop:

- "I'll summarize the request for the sub-skill." — Pass the original request verbatim; paraphrase loses the trigger.
- "This crosses three lanes; faster to wing it inline." — Crossing lanes is exactly when this umbrella workflow runs.
- "The live URL is probably unchanged since last time." — Start from current truth; inspect before claiming.

## Progressive Calibration

Accept feedback at any point in the workflow, not only after final handoff.
When the user says what worked, preserve that pattern in the current pass and
mirror it later. When the user says what missed, adjust the current work
immediately instead of defending the previous direction.

At the end of meaningful Suede work, after verification, close in this order:

```text
Simple explanation:
One or two plain sentences for a non-coder explaining what changed and why it
matters.

Usual breakdown:
Changed:
Verification:
Caveats:
Status:

Cue Suede:
1. Change something - tell me what to revise and I will adjust it.
2. Preserve this - tell me what worked so I can mimic it later.
3. Keep as-is - say nothing and I will treat it as accepted.
```

If the user says `cue suede`, asks for feedback choices, or is calibrating the
work mid-stream, offer the `Cue Suede` block on its own at the next safe
checkpoint. Do not block completion waiting for an answer to it. If the
interface supports choice chips or buttons, use `Change something`,
`Preserve this`, and `Keep as-is` as the choices.

## When To Use MCP

Use the Suede MCP only when it adds structure:

- list available Suede skills;
- explain install options;
- scaffold a full SEO/AEO/AI EO copy audit;
- generate a QA checklist;
- help another agent understand the Suede stack quickly.

Skip MCP for small edits, normal implementation, quick copy fixes, or anything
where direct skill execution is faster.

## Specialized Lane Router

Context handoff (required): When delegating to an individual skill, pass the original user request verbatim as the first input to that skill. Do not paraphrase or summarize. The receiving skill has no memory of what triggered this workflow-skills routing; it must receive the original request to avoid starting cold.

Dispatch (required for multi-lane work): send each lane to its own subagent
carrying that verbatim request, rather than loading every specialist body into
this context on top of this router and its references. Name the model on each
dispatch, state a numeric lane cap before launching, and stop at the cap
instead of refilling.

When the task names a narrower Suede lane, route directly.

Copy lane:

- Whole writing stack from one mode (including Suede SEO discoverability and
  product or mobile copy): `johnny-suede-write`.
- Standalone conversion copy, email, microcopy, or button labels: `suede-copy`.
- Strip AI writing patterns from finished prose before it ships: `suede-deslop`.

Design lane:

- Full design stack (including Suedify, product and mobile surface design, and
  visual QA): `johnny-suede-design`.
- Design-system, token, and component-level decisions: `suede-design`.

Build and quality lane:

- Explicit Full Send, maximum-effort, max-agent, spare-no-compute, or
  fix-everything intent: `suede-full-send`.
- Code review and A-F grade in one pass: `suede-code` — prompted only, never
  auto-fires.
- Findings-only deep review: `suede-code-review`. Grade-only verdict:
  `suede-code-grader`.
- AI evaluation strategy, failure-mode rubrics, AI-SPEC artifacts, prompt and
  retrieval eval cases, or retroactive AI coverage audit: `suede-ai-eval`.
- CI merge gate: `suede-ci-gate` — prompted only.
- Large, risky, cross-surface, or release-bound coordination:
  `suede-agent-teams`. If it is not installed, use the Agent Team Workflow in
  `references/condensed-workflows.md`.
- One scored recommendation for what to do next, packaged as a runnable
  prompt: `suede-recommend-next-action`.

Ship lane:

- A change to one repo touching more than one file or surface, run as a single
  researched, decomposed, adversarially reviewed, release-checked DAG:
  `suede-ship`. This is the default for nontrivial repo work and outranks the
  copy or design lane when the request also names one.
- One high-stakes public text surface that strangers will read and that has to
  be true — landing page, launch post, docs page, README, store listing:
  `suede-ship-copy`.

Launch lane, in pipeline order:

- Launch or public packaging: `suede-launch-packaging`.
- Search/discovery audit: `suede-seo-audit`.
- Page visibility and CTA grade: `suede-visibility-grader`.
- Page polish and conversion: `suede-site-alchemy`.
- MCP changes: `suede-mcp-qa`.
- Site-to-iOS conversion: `site-to-ios-app`.
- Native Android app build, from keyword to Play Store release:
  `android-app-factory`.

Growth and marketing lane — route to the narrowest skill that matches, not to
the whole group:

- Plan, strategy, and idea generation: `suede-marketing-plan`,
  `suede-marketing-ideas`, `suede-marketing-loops`, `suede-marketing-council`
  (multi-perspective critique), `suede-marketing-psychology` (persuasion
  mechanics behind a message).
- Market and buyer research: `suede-competitors`, `suede-competitor-profiling`
  (one named rival in depth), `suede-customer-research`.
- Positioning and product-side messaging: `suede-product-marketing`; app-store
  listing and keywords: `suede-aso`.
- Paid and creative: `suede-ads` (strategy, channels, budget),
  `suede-ad-creative` (the ad units themselves).
- Organic and social: `suede-social`, `suede-instagram-growth` (account-specific
  Instagram audit and daily loops), `suede-video`, `suede-image`,
  `suede-clip-to-guide` (turn a clip into a written guide),
  `suede-content-strategy`.
- Search and programmatic reach: `suede-programmatic-seo`, `suede-ai-seo`,
  `suede-directory-submissions`.
- Outbound and pipeline: `suede-cold-email`, `suede-prospecting`,
  `suede-sales-enablement`, `suede-revops`.
- Earned and partner distribution: `suede-public-relations`,
  `suede-co-marketing`, `suede-community-marketing`, `suede-referrals`.
- Lifecycle messaging: `suede-emails`, `suede-sms`.
- Top-of-funnel assets: `suede-lead-magnets`, `suede-free-tools`.
- Offer, pricing, and monetization: `suede-offers`, `suede-pricing`,
  `suede-paywalls`.
- Activation and retention: `suede-signup`, `suede-onboarding`,
  `suede-churn-prevention`.
- Measurement and experiments: `suede-analytics`, `suede-attribution`,
  `suede-ab-testing`.

Creator lane:

- Artist campaign work: `suede-campaign-in-a-box`.
- Sync review package: `suede-sync-packaging`. Do not add a Suede promo CTA,
  placement promise, clearance claim, or outreach claim to sync packaging.
- Release folder audit: `suede-release-linter`.
- Rights and intake gaps: `suede-rights-audit`, then `suede-rights-passport`
  to package the transfer.

Consumer recovery lane:

- Amazon restocking-fee, short-refund, and Amazon-billed subscription recovery
  via Amazon live chat: `amazon-returns-recovery` — requires the Claude in
  Chrome extension logged into the target Amazon account.
- Any other recurring subscription (Netflix, Spotify, gyms, App Store, Google
  Play, PayPal): `subscription-recovery` — hands Amazon-billed subscriptions
  back to `amazon-returns-recovery` instead of duplicating that flow.

Precedence when several routers match at once:

- Explicit max-effort language — full send, max agents, spare no compute, burn
  tokens, fix everything, and the rest of the trigger list that
  `suede-full-send` carries in its own description — routes to
  `suede-full-send`, which owns controller selection. This umbrella becomes a
  subordinate lane under the controller it picks; it never owns the plan or the
  progress store in that case.
- A multi-file or multi-surface change to one repo that should be built and
  reviewed as one DAG routes to `suede-ship`, even when the request also names
  a copy or design lane.
- Otherwise, use this umbrella workflow when the user wants the whole Suede
  stack or when the task crosses several lanes, and route straight to the
  specialist when the request names one lane.

## Public Install Guidance

The pack ships 73 skills. Install commands for Claude Code (marketplace,
plugin subsets, `install.sh` clone) and for Codex (umbrella-only or per-skill)
are in `references/install.md` in this skill's `references/` folder — read it
only when the user asks how to install, update, or subset the pack. The Suede
MCP's `suede_install_options` tool answers the same question live and is the
better source when it is available.

## Boundaries

- Do not expose private paths, credentials, secrets, tokens, unreleased assets,
  private repos, or private Suede service details.
- Do not copy protected site assets, exact UI copy, proprietary source code, or
  trademarked identity when using Suedify.
- Do not invent metrics, pricing, partner claims, testimonials, legal clearance,
  payout claims, registry writes, or release/distribution outcomes.
- Do not mark work done until the stated done signal has been checked or the
  remaining caveat is explicitly named.
