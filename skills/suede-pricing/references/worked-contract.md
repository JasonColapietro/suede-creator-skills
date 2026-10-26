# Suede AI Pricing Skills: Worked Contract

This is a synthetic application scenario, not a client result or a required output filename. Adapt the values to the supplied evidence. The skill's existing output format and authority boundaries apply.

## Input

An AI transcription service charges per seat but incurs compute cost per minute. The team supplies usage percentiles and cost per minute; no willingness-to-pay study has been completed.

## Expected output

Return a Pricing Decision Brief comparing seat, usage, and hybrid metrics. Show the cost-to-serve calculations by supplied usage cohort, tier hypothesis, validation plan, and migration/grandfathering options. Mark candidate prices as hypotheses until buyer evidence supports them.

## Missing input and recovery

If cost or usage units are missing, name the missing unit and avoid a fabricated margin. If the work is a page teardown, grade the observed page rather than silently redesigning the billing model. A proposed price increase remains a decision brief until billing changes are explicitly authorized.

## Validation

Recompute margins using consistent monthly units, including high-usage cohorts. Check that text prices, billing period, limits, FAQ, and structured data agree. Inspect grandfathering, overage, and cancellation consequences before recommending a migration.

## Paywall mode case

A second synthetic scenario, for Paywall mode. The same rule applies: adapt the values to the supplied evidence, and the Paywall Package format and the boundaries in [paywalls.md](paywalls.md) govern.

### Input

A note-taking app lets free users export five documents per month. The team requests a prompt when a sixth export is attempted; existing notes remain readable. The subscription price and renewal period are supplied.

### Expected output

Return the Paywall Package: the screen draft, exact trigger, frequency cap, entitlement behavior, dismissal path, price/renewal disclosure placement, and experiment plan. State what happens after dismissing and what remains available on the free plan. Measure paid conversion together with task completion and complaint guardrails.

### Missing input and recovery

If entitlement or renewal terms are absent, keep those product decisions explicit and draft only the supported screen structure. Do not guess price, hide renewal, or introduce an entitlement block that the product does not have. Missing live access means interaction validation is pending.

### Validation

Walk eligible, already-paid, limit-reset, declined-payment, and dismissed states. Check that the free path and recurring price remain legible. Verify applicable legal/platform requirements against current primary sources, starting from [subscription-rules.md](subscription-rules.md), before finalizing disclosures.

## Detailed scope and routing

Suede AI pricing and packaging: chooses the value metric (seats, usage, credits, outcomes), structures tiers, compares free trial, freemium, and reverse trial, plans willingness to pay research and price increases with grandfathering, and tears down a pricing page for buyer clarity and for search and AI-assistant readability (text prices, matching schema, quotable FAQ). Its Paywall mode designs in-product monetization: paywall screens, feature gates, trial-expiry states, usage-limit prompts, and free-to-paid upgrade moments, with trigger timing, frequency caps, screen copy, a dark-pattern self-check, and subscription-law checks current to October 2026 (ROSCA and state auto-renewal laws after the vacated FTC click-to-cancel rule, California's click-to-cancel and renewal notices, UK DMCC subscription rules, the EU withdrawal button, App Store and Google Play disclosure). It holds the pack's single subscription-law reference. Returns a Pricing Decision Brief, a scored teardown, or a Paywall Package (screen drafts, trigger rules, experiment plan). Use when deciding what to charge, restructuring tiers, pricing AI features with variable compute cost, raising prices, fixing a pricing page that buyers or AI answers misread, or designing the upgrade prompt users see after they experience value. NOT FOR: offer bonuses and guarantees (use suede-offers), cancellation and save flows (use suede-churn-prevention), or executing billing changes.
