---
name: suede-site-alchemy
description: "Suede AI Site Alchemy Skills. Turn landing, launch, campaign, and product pages into measured conversion paths: funnel stage, friction, hero, proof, CTAs, pricing, mobile QA, and pre-registered experiments. Use when asked to \"fix this page that gets no signups\" or improve demos and sales from existing traffic. Implements and verifies changes within scope. NOT FOR: SEO scores (use suede-seo-audit), AI citations (use suede-ai-seo), promotion grades (use suede-visibility-grader), or copy alone (use suede-copy)."
metadata:
  display-name: "Suede AI Site Alchemy Skills"
---

# Suede AI Site Alchemy Skills

## Compatibility

Implementation needs access to the page source and a rendered browser preview; analytics exports or authorized analytics access support measurement. Without these, return an evidence-limited plan.

For a concrete input, expected handoff, and failure check, read
[the worked handoff](references/worked-handoff.md).

## Gate policy: advisory, not blocking

Every check, gate, grade, and ship verdict in this skill is a recommendation to
the user, not a control on the agent. Run every check, report results honestly,
complete the requested action, and attach the verdict as labeled advice. A
failed gate changes what you report, never what you do. Single exception: an
extreme-risk finding (data loss, credential exposure, legal or rights
violation, payment mistake, irreversible public damage). Pause, state the risk
and options, and let the user choose. Their choice is final.

**Core principle:** evidence before certainty. Diagnose friction, verify the
measurement, and turn design ideas into falsifiable hypotheses. Do not present
a heuristic, benchmark, or scenario as observed impact.

## Operating Stance

Use the page owner's company name, voice, and positioning throughout. On a
client page, never add Suede AI CTAs or links; the Suede AI lines in the Scope
Router apply only when the page is a Suede AI property.

- Work from the live page and current source. Verify the exact repo, route, and
  git state before edits.
- Module pricing without backing in current product docs or source is an
  extreme-risk claim: pause, show the user what is and is not authorized, and
  let them decide whether it publishes.
- "Sexy" means precise, visual, confident, and conversion-aware. Avoid vague
  hype, fake numbers, fake testimonials, and generic SaaS fog.
- For public pages, use the visibility grade when the page needs an A-F read on
  findability, first-screen clarity, CTA pull, proof, AI readability, and
  design signal.

## Delivery Contract

For a meaningful page, campaign, or conversion pass, define this before edits:

- objective: the one buyer action the page should earn;
- source truth: live URL, repo/folder, branch, route, and deployment target;
- done signal: local preview, desktop/mobile screenshots, CTA/link sweep, build,
  deploy readback, or live URL verification;
- constraints: claims, pricing, assets, and routes that are not approved;
- lanes: copy, layout, SEO/AEO/AI EO, assets, CTA plumbing, and QA. Run lanes in
  parallel only when they do not write the same files. Add a visibility grading
  lane when the page will be promoted publicly.

Use exact status words: inspected, changed locally, verified locally, deployed,
verified live, or blocked. Do not summarize a page as fixed until the stated
done signal has been checked.

## Page Contract

For a major page or campaign, lock this before implementation:

- buyer and one action the page must earn;
- offer spine, proof stack, CTA ladder, and route targets;
- visual system: type, color, spacing, imagery, motion, and mobile rhythm;
- search inputs carried in from `suede-seo-audit` or `suede-ai-seo` (title and
  meta, schema, answer-first opening, internal links) so conversion edits do
  not break them;
- source-truth limits for pricing, claims, partners, metrics, and testimonials;
- acceptance checks: desktop/mobile render, link sweep, copy fit, accessibility,
  build, deploy readback, and live verification when public.

For a small page fix, use only the relevant contract lines and keep the edit
narrow.

## Scope Router

Handle as Suede AI Site Alchemy:

- Campaign landing pages.
- Launch pages.
- Link-in-bio or creator profile pages.
- Product microsites.
- Static site builds.
- Conversion fixes tied to an active campaign.

Route search work out: crawl, index, schema, and scored SEO findings go to
`suede-seo-audit`; AI answer-engine visibility goes to `suede-ai-seo`. Keep
their fixes intact when you edit the page.

Route application builds out of this skill. Do not attempt these here:

- Open-ended custom apps.
- Backend systems.
- Auth, payments, data, or integration-heavy products.
- Dashboards, marketplaces, portals, mobile apps, or agent products.
- Long-lived engineering retainers.

When the request crosses that line, preserve the best landing-page work as the
front door and hand the build to the owner's chosen build path: scope it with
`suede-ops-architecture`, and send mobile apps to `android-app-factory` or
`site-to-ios-app`. Never invent a dead route.

### Only when the page is a Suede AI property

Apply this block only to Suede AI's own pages. On a client page, skip it.

- Suede AI positioning, cross-sells, CTAs, and module menus for the search
  practice (AEO, GEO, and SEO) and Agent Studio are in scope.
- Route agent and multi-agent automation builds to Suede AI Agent Studio
  (https://suedeai.app), after verifying the route.
- Route-out copy, when the request crosses the build line:
  - "Build the campaign page now."
  - "Open Suede AI Agent Studio."
  - "Build the product with Suede AI."
  - "Bring this into Suede AI Agent Studio."
- Escape valve: `https://suedeai.ai`, or the current verified Suede AI route.
  If the current repo does not expose a verified Agent Studio URL, CTA to
  `https://suedeai.ai`.

## Funnel Analysis

Map the page's role in the buyer journey before optimizing it. A page that serves the wrong funnel stage will fail regardless of CRO polish.

Name the stage: TOFU (awareness), MOFU (consideration), or BOFU (decision).
Each stage's reader, needs, copy job, and CTA type are under "Funnel stages" in
`references/cro-frameworks.md`; read it when the stage is unclear.

State the funnel stage before running any slash tool. Then optimize for that stage, not just for generic "conversion."

## Friction Audit

Count every source of friction on the page before fixing anything. A friction audit reveals WHERE the page loses visitors, not just that it does.

**Cognitive friction** (mental load):
- [ ] How many decisions does the visitor face before the primary CTA?
- [ ] How many value propositions compete on the first screen?
- [ ] Is the primary action obvious without reading?

**Physical friction** (effort):
- [ ] How many form fields before the first value delivery?
- [ ] How many clicks to reach the primary action?
- [ ] Does the mobile user have to scroll past the fold before seeing a CTA?

**Trust friction** (doubt):
- [ ] Is there a fear or objection that isn't answered before the CTA?
- [ ] Is the proof visible before the ask?
- [ ] Is the risk reversal (guarantee, cancel anytime, free trial) near the CTA?

Treat the friction list as an inventory, not a validated score. For each item,
record the affected population, evidence (analytics, replay, usability test,
support signal, or direct observation), severity, and the event that would show
improvement. A raw count does not prove impact.

**Mobile and accessibility checks are required for every public page.** Read
"Mobile and accessibility checks" in `references/cro-frameworks.md` during the
Friction Audit and before the mobile QA in Workflow step 9.

## Measurement and Decision Math

Before ranking hypotheses, define the decision and verify the event chain. Use
observed values from a named date range, population, and source. Leave a field
`unknown` when it is not measured; do not silently fill it with a generic
industry benchmark.

**Descriptive model:**
`observed_revenue = eligible_visitors × observed_CTA_rate × observed_close_rate × observed_order_value`

Use the model to locate leverage and instrumentation gaps. It is not a causal
forecast. If stakeholders need a planning range, show a sensitivity table with
each assumption labeled; call it a scenario, never an expected lift.

Before an A/B test, read `references/experiment-design.md` for evidence labels,
instrumentation readiness, assignment, and the sample-ratio mismatch (SRM)
check, and create or copy `assets/cro-hypothesis-ledger.csv`. Hand power,
sample size, duration, significance, and readout to `suede-ab-testing`; keep
`assets/cro-hypothesis-ledger.csv` as the shared ledger.

When reliable data is unavailable, request analytics exports or instrument the
funnel first. Validate event definitions, denominators, duplicate events,
consent effects, and bot/internal traffic before using the numbers.

## Slash Tools

Use slash tools as named design moves, not shell commands. Start with
`/vibe-scan`, then pick the smallest set that fits the page.

For the full menu, read `references/aesthetic-slash-tools.md` in this skill's
`references/` folder.

The default seven-tool stack for a fast polish pass is under "Default stack"
at the top of that file.

## Candidate Hypotheses

When the brief is only "make it convert better," read "Candidate Hypotheses" in
`references/cro-frameworks.md`: ten common surfaces to diagnose, not a ranked
list of guaranteed quick wins.

## Workflow

1. Identify the surface: live URL, source folder, route, deploy target, current
   git branch, dirty files, and relevant handoff/spec docs.
2. Run **Funnel Analysis**: name the page's funnel stage (TOFU/MOFU/BOFU). Optimize for that stage throughout.
3. Run **Friction Audit**: inventory cognitive, physical, and trust friction,
   then attach evidence and severity. Fix launch blockers before visual work.
4. Read the page like a buyer. Capture the current offer, primary CTA, trust
   evidence, visual system, remaining friction points, and dead links.
5. Run the aesthetic slash tools. Keep the notes short and actionable.
6. Rewrite the page spine before touching components:
   - Headline: the sharpest promise.
   - Subhead: what changes for the buyer.
   - Primary CTA: the action that starts the workflow.
   - Secondary CTA: proof, demo, grader, or site/app routing.
7. Visual changes stay inside the existing system and only where a
   friction-audit finding names a conversion penalty; token, type, color or
   restyle work routes to `suede-design`. What "premium" means per surface is
   in `references/aesthetic-slash-tools.md` under "Premium by surface".
8. Build the CTA ladder. Every page needs three exits:
   - **Primary action**: the one thing this page was built to earn. One button. Obvious placement. No competing CTA at the same visual weight.
   - **Secondary action**: proof, demo, or deeper content for visitors not ready to convert. Lower visual weight, same screen.
   - **Escape valve**: where does a visitor go when this page isn't right for them? Name the route (client page: home, alternative product, or contact; Suede AI property: the escape valve in the Scope Router). A missing escape valve doesn't hold visitors: it loses them.
9. Verify like the page is already public:
   - Local preview.
   - Desktop and mobile browser QA.
   - Text fit and no overlap.
   - CTA/link sweep.
   - Visibility grade when public promotion or GitHub Pages discoverability is
     part of the ask.
   - `git diff --check`.
   - Live URL/API verification before claiming a production fix.
10. For any experiment, pre-register the ledger row, validate assignment and
    exposure, and check SRM before interpreting outcomes; hand power,
    duration, significance, and readout to `suede-ab-testing`.
11. Recommended ship gate:
    - `ship`: page passes the done signal and no launch-critical gaps remain.
    - `ship-with-caveats`: only non-critical caveats remain and they are named.
    - `hold`: core CTA, visible layout, false claim, accessibility, build, or
      live verification is blocked.
12. Leave a concise handoff with target, files changed, commands, verification,
    caveats, and the exact next step.

## Worked Example

Read `references/evidence-boundary-worked-example.md` for a compact before/after pass.
Its "after" block is a set of hypotheses and proof slots, not publishable copy.

## A/B test hypotheses

Before writing or ranking test hypotheses, read
[the hypothesis format and worked recipe](references/hypothesis-recipes.md)
and `references/experiment-design.md`. Create the pre-registration ledger before
launch. Keep at most three hypotheses, ranked by evidence, population, decision
value, effort, and risk; never rank by invented lift.

## Social Proof Framework

Match proof to the claim or objection it can actually support. Read "Social
Proof Framework" in `references/cro-frameworks.md` before choosing what proof
to ask for or where to place it.

**Proof check**: every proof claim must be verifiable. Remove or rewrite vague claims like "used by thousands" without a number, "industry-leading" without a comparison, or "fast" without a metric.

## Pricing and urgency

Before changing pricing presentation, guarantees, deadlines, or scarcity, read
[the pricing and urgency framework](references/pricing-and-urgency.md).
Verify material terms and the actual capacity or deadline mechanism. Treat
presentation choices as hypotheses, keep trust and post-purchase guardrails,
and never manufacture scarcity or reset a timer. The full framework and examples
remain in the reference.

## Red Flags: Stop

If you catch yourself thinking any of these, stop and run the required step:

- "The page just needs visual polish.": Run the Friction Audit and render the
  current experience before deciding what kind of change is warranted.
- "This change feels high-impact.": Identify the evidence, affected
  population, primary metric, guardrails, and decision the evidence would
  change.
- "Urgency will lift conversions.": Only use truthful urgency, and treat any
  effect as a hypothesis with trust and post-purchase guardrails.
- "Source inspection is enough for visual work.": Render the page; check desktop and mobile.
- "I'll estimate their traffic to fill in the model.": Ask for analytics exports; never invent numbers.

## Output Contract

Close every meaningful conversion pass with this block:

```text
Surface: [URL or route + repo/branch]
Funnel stage: TOFU | MOFU | BOFU
Friction inventory: [items with evidence, affected population, and severity]
Changed: [files or sections touched]
Measurement readiness: [events/denominators/assignment/exposure verified or gaps]
Hypotheses: [1–3, prioritized by evidence, population, decision value, effort, risk]
Experiment plan: [ledger row, primary metric, guardrails, SRM check; power, duration and readout via suede-ab-testing; or not applicable]
Verification: [exact status words: inspected, changed locally, verified locally, deployed, verified live, blocked]
Caveats: [or "none"]
Ship gate: ship | ship-with-caveats | hold
```

## Routing

- Page needs an A-F promotion-readiness verdict → `suede-visibility-grader` before any paid or public promotion.
- Search, schema, crawl, or index access → `suede-seo-audit`.
- Getting the page cited by ChatGPT, Perplexity, or AI Overviews: extractability, AI-bot access, `llms.txt` → `suede-ai-seo`.
- Page needs fresh headlines, subheads, CTA labels, or copy variants → `suede-copy`.
- Visual system, tokens, typography or restyle → `suede-design`.
- Test statistics: power, sample size, duration, significance, and readout → `suede-ab-testing`.
- Page converts and the release is ready to announce → `suede-launch-packaging`.
- Suede AI projects: multiple independent lanes, a campaign deadline, or SEO plus implementation plus QA → `suede-agent-teams`.
- Suede AI projects: work touches CTA plumbing, forms, auth, payments, analytics, API routes, deployment config, shared components, or claims that must match product behavior → `suede-code`.

Skip the extra gates for pure copy or layout polish after live/source inspection and rendered QA.

## Boundaries

- Do not add pricing, guarantees, traffic claims, or visitor-ID percentages
  unless they already exist in the current approved source.
- Do not claim a CRO benchmark, prior, uplift, or revenue projection without a
  dated source, comparable population, metric definition, and clear label.
- Do not interpret an experiment before assignment, exposure, event health,
  sample-ratio mismatch, uncertainty, and guardrail checks pass.
- Do not stop at source inspection for visual work. Render the page.
