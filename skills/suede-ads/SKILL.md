---
name: suede-ads
description: "Suede AI Ads Skills. Use when planning paid acquisition and asked to \"audit our paid campaigns\" or choose channels, structure campaigns, set budget pacing, retargeting and kill-or-scale rules from verified unit economics and performance. NOT FOR: ad asset production (suede-ad-creative), tracking implementation (suede-analytics), attribution reconciliation (suede-attribution), or landing-page work (suede-site-alchemy)."
metadata:
  display-name: "Suede AI Ads Skills"
  version: 2.3.0
---

# Suede AI Ads Skills

Read [the worked delivery contract](references/worked-contract.md) for a concrete
input, expected artifact, failure response and validation example.

## Compatibility

Works from campaign exports and business economics; current official platform documentation for changing controls. Live account access is optional for audits and requires existing authorization for changes.

Use this paid-acquisition playbook to create, optimize, and scale campaigns against explicit acquisition economics. Never assume account access.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task. If its Status line says `partial`, ask for the listed missing sections before using them and never infer them; treat `[unverified]` fields as absent.

Gather this context (ask if not provided):

### 1. Campaign Goals
- Which platform(s) are running now, or which do you want to start with?
- What's the primary objective? (Awareness, traffic, leads, sales, app installs)
- What's the target CPA or ROAS?
- What's the monthly/weekly budget?
- Any constraints? (Brand guidelines, compliance, geographic)

### 2. Product & Offer
- What are you promoting? (Product, free trial, lead magnet, demo)
- What's the landing page URL?
- What makes this offer compelling?

### 3. Audience
- Who is the ideal customer?
- What problem does your product solve for them?
- What are they searching for or interested in?
- Do you have existing customer data for lookalikes?

### 4. Current State
- Have you run ads before? What worked/didn't?
- Do you have existing pixel/conversion data?
- What's your current funnel conversion rate?
- Do you have creative assets already, or do they need to be produced?

---

## Reference Routing

This skill's depth lives in references: load by intent. For **any operational decision on a live account** (kill/keep/scale/budget), load the relevant playbook before answering; the thresholds live there, not here.

| User intent | Load | Covers |
|---|---|---|
| B2B strategy, funnel stages, budget splits, kill rules, lead quality, breakeven math | [b2b-paid-playbook.md](references/b2b-paid-playbook.md) | Demand lifecycle, leading/lagging signals, kill rules, offline conversion loop, U/B/F lead scoring, scaling quadrant |
| Meta operations: when to kill/graduate/scale an ad, fatigue, testing structure | [meta-decision-system.md](references/meta-decision-system.md) | TCPL-anchored decision tree, ad-count ceiling, 80/20 CBO structure, fatigue bands, lead forms, Advantage+ transition |
| LinkedIn operations: bidding, audience sizing, scaling, benchmarks, TLAs, formats | [linkedin-b2b-playbook.md](references/linkedin-b2b-playbook.md) | Bidding progression, penetration scaling, sizing rules, funnel benchmarks, document/conversation ads, audit shortlist |
| Google Search: what to spend on first, structure, match types, negatives, PMax | [google-search-playbook.md](references/google-search-playbook.md) | Intent ladder, account structure, match-type gates, negatives, bidding by volume, offline conversions, PMax guardrails |
| Named-account targeting, pipeline acceleration, cross-channel retargeting | [abm-playbook.md](references/abm-playbook.md) | LinkedIn/Meta ABM, list mechanics, acceleration campaigns, UTM cross-channel remarketing, ABM measurement |
| Generating Google RSAs | Route to `suede-ad-creative` | It owns the RSA output spec (limits, sidecars, template, self-check) |
| Audience setup, per-platform creative-vs-targeting split, launch checklists | [audience-targeting.md](references/audience-targeting.md) · [platform-setup-checklists.md](references/platform-setup-checklists.md) | Existing foundations |
| Pixels, CAPI, server-side conversion events | Route to `suede-analytics` | It owns ad-platform conversion setup and firing proof |

---

## Platform Selection Guide

| Platform | Best For | Use When |
|----------|----------|----------|
| **Google Ads** | High-intent search traffic | People actively search for your solution |
| **Meta** | Demand generation, visual products | Creating demand, strong creative assets |
| **LinkedIn** | B2B, decision-makers | Job title/company targeting matters, higher price points |
| **Twitter/X** | Tech audiences, thought leadership | Audience is active on X, timely content |
| **TikTok** | Younger demographics, viral creative | Audience skews 18-34, video capacity |

---

## Campaign Structure Best Practices

### Account Organization

```
Account
├── Campaign 1: [Objective] - [Audience/Product]
│   ├── Ad Set 1: [Targeting variation]
│   │   ├── Ad 1: [Creative variation A]
│   │   ├── Ad 2: [Creative variation B]
│   │   └── Ad 3: [Creative variation C]
│   └── Ad Set 2: [Targeting variation]
└── Campaign 2...
```

### Naming Conventions

```
[Platform]_[Objective]_[Audience]_[Offer]_[Date]

Examples:
META_Conv_Lookalike-Customers_FreeTrial_[YYYYQ#]
GOOG_Search_Brand_Demo_Ongoing
LI_LeadGen_CMOs-SaaS_Whitepaper_[MMMYY]
```

### Budget Allocation

**Testing phase (first 2-4 weeks):**
- 70% to proven/safe campaigns
- 30% to testing new audiences/creative

**Scaling phase:**
- Consolidate budget into winning combinations
- Increase budgets ~20% at a time: never 30%+ in one move (resets platform learning)
- Wait 3-5 days between increases for algorithm learning

---

## Ad Copy

Copy formulas, angle libraries, creative best practices, and character limits
belong to `suede-ad-creative`. This skill decides which campaign, audience, and
offer the copy serves; route creative production there.

---

## Audience Understanding & Targeting

Knowing your audience deeply is still the highest-leverage work in paid ads: demographics, job titles, pain points, fears, hopes, the exact language they use, who they follow, what they've tried, why they failed, what they buy. **Gather every identifier you can.**

What has changed is **where you apply that knowledge.** As ad-platform algorithms have gotten dramatically better at finding the right person, jamming all your audience identifiers into the platform's *targeting filters* underperforms feeding those same identifiers into the *creative* (headlines, copy, visuals, hooks, examples).

The discipline now: **audience knowledge → creative first, targeting filters second.** How much that ratio tips toward "creative" varies meaningfully by platform.

The per-platform split (how much audience knowledge goes into creative versus targeting filters on Meta, Google Search, PMax, LinkedIn, TikTok and X) lives in [references/audience-targeting.md](references/audience-targeting.md). Load it before recommending a targeting setup.

For how each identifier becomes a headline, hook, or angle, use `suede-ad-creative`: it owns the angle-to-copy mapping.

### Key Concepts (still apply)

- **Lookalikes**: Base on best customers (by LTV), not all customers. Still high-value across platforms.
- **Retargeting**: Segment by funnel stage (visitors vs. cart abandoners). See "Retarget with a different offer" and "The four-ad retargeting layer" in [references/optimization-and-retargeting.md](references/optimization-and-retargeting.md).
- **Exclusions**: Exclude existing customers and recent converters: showing ads to people who already bought wastes spend.

**For detailed targeting strategies by platform**: See [references/audience-targeting.md](references/audience-targeting.md)

---

## Meta in the Andromeda era

**Verified facts.** Andromeda is Meta's ad retrieval system (Meta Engineering,
December 2, 2024). Since January 12, 2026 the Ads Insights API no longer returns
7-day view and 28-day view attribution windows. Before any Meta strategy call,
load the strategy layer at the top of [meta-decision-system.md](references/meta-decision-system.md).

---

## Campaign Optimization

Read [optimization and retargeting](references/optimization-and-retargeting.md) before proposing budget, bid, audience or retargeting changes. It contains the existing metric, bid progression and funnel-window rules.

## Landing Page Alignment

Headline-mirror testing (run ad headlines, mirror the winner in the page H1) lives in
[optimization-and-retargeting.md](references/optimization-and-retargeting.md).
Post-click page work itself belongs to `suede-site-alchemy`.

---

## Reporting & Analysis

### Weekly Review
- Spend vs. budget pacing
- CPA/ROAS vs. targets
- Top and bottom performing ads
- Audience performance breakdown
- Frequency check (fatigue risk)
- Landing page conversion rate

### Attribution Considerations
- Every platform counts the same sale; never sum platform-reported conversions
- Use UTM parameters consistently and reconcile against the CRM or backend
- Record each platform's attribution window with the number (Meta's API now
  offers only 1-day view and click windows up to 28 days)
- Judge on blended CAC and pipeline, not platform CPA alone; route model and
  reconciliation work to `suede-attribution`

### Scaling discipline

Before arguing that ROAS will drop with more spend, read "Scaling discipline" in
[optimization-and-retargeting.md](references/optimization-and-retargeting.md):
optimize blended net cash against the break-even CPA ceiling, not per-ad-set ROAS.

---

## Platform Setup

Before launching campaigns, ensure proper tracking and account setup.

**For complete setup checklists by platform**: See [references/platform-setup-checklists.md](references/platform-setup-checklists.md)

**For conversion pixel, CAPI, and server-side event setup**: route to `suede-analytics` (its ad-platform conversions reference).

### Universal Pre-Launch Checklist

Each box names the artifact that proves it. A box is checked when the artifact exists, not when it sounds true.

- [ ] Conversion tracking fired: the test conversion is visible in the platform's event manager with a timestamp
- [ ] Landing page loads in <3 sec: cite the PageSpeed / Lighthouse number and the test date
- [ ] Landing page mobile-friendly: a mobile render of the page, not a desktop assumption
- [ ] UTM parameters working: paste the resolved destination URL with parameters intact
- [ ] Budget set correctly: the daily/lifetime figure, against the cap the user stated
- [ ] Targeting matches intended audience: the saved audience definition, read back

Any unchecked box means do not recommend launch. Name the box and what is missing.

---

## Common Mistakes to Avoid

- **Too many campaigns**: fragmenting budget across campaigns none of which exit learning
- **Optimizing for the wrong metric**: clicks or CTR when the objective is conversions
- **Only one ad per ad set**: the algorithm has nothing to allocate between
- **Overlapping audiences competing**: the same account bidding against itself

---

## Tool Integrations

This pack does not include ad-network integrations. Work through an authorized
platform UI, current export, API, or installed connector; verify current
official documentation and the selected account before any mutation.

| Platform family | Typical use | Verify before execution |
|-----------------|-------------|-------------------------|
| Search ads | Capture declared intent | Query scope, match behavior, negatives, location, conversion action |
| Social feed ads | Create or harvest demand | Audience controls, placement, creative specs, attribution window |
| Professional-network ads | Reach role or account segments | Targeting availability, minimum audience, lead form and CRM mapping |
| Short-video ads | Visual discovery and creator-style demand | Placement specs, audio rights, age and regional policy |

For the measurement contract, pixel and CAPI setup, and firing checks, route
to `suede-analytics`.

---

## Boundaries

- Do not create, launch, pause, delete, or change campaigns, bids, audiences, or budgets without explicit authorization.
- Do not claim ROAS, attribution, or incrementality when conversion tracking and revenue inputs have not been verified.
- Do not recommend spend above the stated cap; if no cap exists, provide a bounded test budget and wait for approval.
- Do not target sensitive traits, evade platform policy, or present inferred audience attributes as verified facts.

**When authorization is missing.** If an authorized account or connector is present and the user asks for a mutation you have no approval for, stop before the call. Name the exact mutation and the account, campaign, or ad set it would hit. Offer: a draft-only change list they can apply themselves, a request for written approval on that specific change, or continuing read-only with an audit instead. Then wait, do not execute on assumed consent. (For the spend-cap case, the standing rule in the third boundary above already applies; don't restate it.)

## Routing

- Need ad copy, visual variants, or Google RSAs -> use `suede-ad-creative` (it owns the RSA output spec).
- Need conversion tracking, pixels, or CAPI implementation -> use `suede-analytics`; attribution
  models and cross-platform reconciliation -> use `suede-attribution`.
- Need post-click conversion work -> use `suede-site-alchemy`.
- Need CRM handoff or offline conversion design -> use `suede-revops`.
- From those skills, route paid channel, budget, bid, and campaign decisions back to `suede-ads`.
