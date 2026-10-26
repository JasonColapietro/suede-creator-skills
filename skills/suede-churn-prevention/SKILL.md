---
name: suede-churn-prevention
description: "Suede AI Churn Prevention Skills. Use when asked to \"reduce subscription churn\" or design cancel flows, reason-matched save offers, failed-payment recovery and win-back measurement. NOT FOR: lifecycle email copy (suede-emails), pricing architecture (suede-pricing), paywalls (suede-pricing Paywall mode), or tracking implementation (suede-analytics)."
metadata:
  display-name: "Suede AI Churn Prevention Skills"
  version: 2.1.0
---

# Suede AI Churn Prevention Skills

Read [the worked delivery contract](references/worked-contract.md) for a concrete
input, expected artifact, failure response and validation example.

## Compatibility

Works from subscription cohorts, cancel reasons and payment-status exports; current official policy/legal sources for applicable cancellation requirements. Live billing mutations require existing authorized access.

Use this retention playbook to reduce voluntary and involuntary churn through transparent cancel flows, bounded save offers, proactive signals, and payment recovery.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task. If its Status line says `partial`, ask for the listed missing sections before using them and never infer them; treat `[unverified]` fields as absent.

Gather this context (ask if not provided):

### 1. Current Churn Situation
- What's your monthly churn rate? (Voluntary vs. involuntary if known)
- How many active subscribers?
- What's the average MRR per customer?
- Do you have a cancel flow today, or does cancel happen instantly?

### 2. Billing & Platform
- What billing provider? (Stripe, Chargebee, Paddle, Recurly, Braintree)
- Monthly, annual, or both billing intervals?
- Do you support plan pausing or downgrades?
- Any existing retention tooling? (Churnkey, ProsperStack, Raaft)

### 3. Product & Usage Data
- Do you track feature usage per user?
- Can you identify engagement drop-offs?
- Do you have cancellation reason data from past churns?
- What's your activation metric? (What do retained users do that churned users don't?)

### 4. Constraints
- B2B or B2C? (Affects flow design)
- Which states and countries are customers in? (California and other automatic
  renewal laws require online cancellation; see Cancellation law below and
  `suede-pricing` references/subscription-rules.md)
- Brand tone for offboarding? (Empathetic, direct, playful)

---

## How This Skill Works

Churn has two types requiring different strategies:

| Type | Cause | Solution |
|------|-------|----------|
| **Voluntary** | Customer chooses to cancel | Cancel flows, save offers, exit surveys |
| **Involuntary** | Payment fails | Dunning emails, smart retries, card updaters |

Measure the voluntary and involuntary split from the account's own billing data before choosing a mode; involuntary churn is often the faster fix because payment recovery needs no change in customer intent.

This skill supports three modes:

1. **Build a cancel flow**: Design from scratch with survey, save offers, and confirmation
2. **Optimize an existing flow**: Analyze cancel data and improve save rates
3. **Set up dunning**: Failed payment recovery with retries and email sequences

---

## Cancel Flow Design

### The Cancel Flow Structure

Every cancel flow follows this sequence:

```
Trigger → Survey → Dynamic Offer → Confirmation → Post-Cancel
```

**Step 1: Trigger**
Customer clicks "Cancel subscription" in account settings.

**Step 2: Exit Survey**
Ask why they're cancelling. This determines which save offer to show.

**Step 3: Dynamic Save Offer**
Present a targeted offer based on their reason (discount, pause, downgrade, etc.)

**Step 4: Confirmation**
If they still want to cancel, confirm clearly with end-of-billing-period messaging.

**Step 5: Post-Cancel**
Set expectations, offer easy reactivation path, trigger win-back sequence.

### Exit Survey Design

The exit survey is the foundation. Good reason categories:

| Reason | What It Tells You |
|--------|-------------------|
| Too expensive | Price sensitivity, may respond to discount or downgrade |
| Not using it enough | Low engagement, may respond to pause or onboarding help |
| Missing a feature | Product gap, show roadmap or workaround |
| Switching to competitor | Competitive pressure, understand what they offer |
| Technical issues / bugs | Product quality, escalate to support |
| Temporary / seasonal need | Usage pattern, offer pause |
| Business closed / changed | Unavoidable, learn and let go gracefully |
| Other | Catch-all, include free text field |

**Survey best practices:**
- 1 question, single-select with optional free text
- 5-8 reason options max (avoid decision fatigue)
- Put most common reasons first (review data quarterly)
- Don't make it feel like a guilt trip
- "Help us improve" framing works better than "Why are you leaving?"

### Dynamic Save Offers

The key insight: **match the offer to the reason.** A discount won't save someone who isn't using the product. A feature roadmap won't save someone who can't afford it.

**Offer-to-reason mapping:**

| Cancel Reason | Primary Offer | Fallback Offer |
|---------------|---------------|----------------|
| Too expensive | Discount (20-30% for 2-3 months) | Downgrade to lower plan |
| Not using it enough | Pause (1-3 months) | Free onboarding session |
| Missing feature | Roadmap preview + timeline | Workaround guide |
| Switching to competitor | Competitive comparison + discount | Feedback session |
| Technical issues | Escalate to support immediately | Credit + priority fix |
| Temporary / seasonal | Pause subscription | Downgrade temporarily |
| Business closed | Skip offer (respect the situation) | n/a |

### Save Offer Types

**Discount**
- 20-30% off for 2-3 months is a common starting point (commonly reported, unsourced; test it in this account)
- Avoid 50%+ discounts (trains customers to cancel for deals)
- Time-limit the offer ("This offer expires when you leave this page")
- Show the dollar amount saved, not just the percentage

**Pause subscription**
- 1-3 month pause maximum (longer pauses rarely reactivate)
- Many pausers return to active (commonly reported as 60-80%, unsourced; measure your own reactivation rate)
- Auto-reactivation with advance notice email
- Keep their data and settings intact

**Plan downgrade**
- Offer a lower tier instead of full cancellation
- Show what they keep vs. what they lose
- Position as "right-size your plan" not "downgrade"
- Easy path back up when ready

**Feature unlock / extension**
- Turn on a premium feature they haven't tried
- Extend trial of a higher tier
- Works best for "not getting enough value" reasons

**Personal outreach**
- For high-value accounts (top 10-20% by MRR)
- Route to customer success for a call
- Personal email from founder for smaller companies

### Cancellation law

Design rule: one save offer, a visible "continue to cancel" control on every
screen, and a cancellation that completes online in the same session. Legal
review decides edge cases, not this skill.

- **Federal (US):** the FTC's 2024 click-to-cancel rule was vacated in July 2025
  and is not in force; the FTC published an advance notice of proposed
  rulemaking on March 13, 2026 (FTC-2026-0265) with no proposed rule since.
  ROSCA still requires a simple way to stop recurring charges.
- **California:** the Automatic Renewal Law (AB 2863, July 1, 2025) requires
  online cancellation for online sign-ups, with any save offer shown beside a
  continuously visible cancel option.

Current US, UK, EU, and app-store subscription law, with sources: read
`suede-pricing` `references/subscription-rules.md` (the pack's single source) and date the check before designing a flow.

### Cancel Flow UI Patterns

**UI principles:**
- Keep the "continue cancelling" option visible (no dark patterns)
- One primary offer + one fallback, not a wall of options
- Show specific dollar savings, not abstract percentages
- Use the customer's name and account data when possible
- Mobile-friendly (many cancellations happen on mobile)

Read [references/cancel-flow-patterns.md](references/cancel-flow-patterns.md)
before designing a flow: it carries the patterns by industry and billing
provider, the segment-specific variants, the post-cancel sequence, and screen
mockups of the survey and offer steps.

---

## Churn Prediction & Proactive Retention

The best save happens before the customer ever clicks "Cancel." Read
[references/health-and-tests.md](references/health-and-tests.md) when building
risk signals, a health score, or proactive interventions.

---

## Involuntary Churn: Payment Recovery

Failed payments are often a large share of churn (commonly reported as 30-50%, unsourced; measure your own split) and are the most recoverable.

### The Dunning Stack

```
Pre-dunning → Smart retry → Dunning emails → Grace period → Hard cancel
```

### Pre-Dunning (Prevent Failures)

- **Card expiry alerts**: Email 30, 15, and 7 days before card expires
- **Backup payment method**: Prompt for a second payment method at signup
- **Card updater services**: Visa/Mastercard auto-update programs (commonly reported to cut hard declines, unsourced; confirm with your provider)
- **Pre-billing notification**: Email 3-5 days before charge for annual plans

### Smart Retry Logic

Not all failures are the same. Retry strategy by decline type:

| Decline Type | Examples | Retry Strategy |
|-------------|----------|----------------|
| Soft decline (temporary) | Insufficient funds, processor timeout | Retry on the canonical schedule below |
| Hard decline (permanent) | Card stolen, account closed | Don't retry: ask for new card |
| Authentication required | 3D Secure, SCA | Send customer to update payment |

**Canonical retry schedule:** one schedule governs this skill: the manual retry
table in [references/dunning-playbook.md](references/dunning-playbook.md)
§Retry Schedule by Provider (Day 1 / 3 / 5 / 7 / 10, fifth attempt last before
the grace period ends). Read it before configuring retries and do not restate a
different schedule anywhere.

### Dunning Email Sequence

Four emails on Day 0 / 3 / 7 / 10. The timing, tone, and full copy for each live
in [references/dunning-playbook.md](references/dunning-playbook.md) §Dunning
Email Sequence: read it before writing or configuring the sequence.

**Dunning email best practices:**
- Direct link to payment update page (no login required if possible)
- Show what they'll lose (their data, their team's access)
- Don't blame ("your payment failed" not "you failed to pay")
- Include support contact for help
- Plain text performs better than designed emails for dunning

### Recovery Benchmarks

| Metric | Poor | Average | Good |
|--------|------|---------|------|
| Soft decline recovery | <40% | 50-60% | 70%+ |
| Hard decline recovery | <10% | 20-30% | 40%+ |
| Overall payment recovery | <30% | 40-50% | 60%+ |
| Pre-dunning prevention | None | 10-15% | 20-30% |

These bands are commonly reported, unsourced ranges for calibrating a
recommendation. Never assert
them as this product's result.

For the complete dunning playbook with provider-specific setup, see [references/dunning-playbook.md](references/dunning-playbook.md).

---

## Metrics & Measurement

### Key Churn Metrics

| Metric | Formula | Illustrative range (replace with your trailing baseline) |
|--------|---------|--------|
| Monthly churn rate | Churned customers / Start-of-month customers | <5% B2C, <2% B2B |
| Revenue churn (net) | (Lost MRR - Expansion MRR) / Start MRR | Negative (net expansion) |
| Cancel flow save rate | Saved / Total cancel sessions | 25-35% |
| Offer acceptance rate | Accepted offers / Shown offers | 15-25% |
| Pause reactivation rate | Reactivated / Total paused | 60-80% |
| Dunning recovery rate | Recovered / Total failed payments | 50-60% |
| Time to cancel | Days from first churn signal to cancel | Track trend |

### Cohort Analysis

Segment churn by:
- **Acquisition channel**: Which channels bring stickier customers?
- **Plan type**: Which plans churn most?
- **Tenure**: When do most cancellations happen? (30, 60, 90 days?)
- **Cancel reason**: Which reasons are growing?
- **Save offer type**: Which offers work best for which segments?

### Cancel Flow A/B Tests

Test one variable at a time. The test table and experiment routing live in
[references/health-and-tests.md](references/health-and-tests.md); read it before
proposing a cancel-flow experiment.

---

## Common Mistakes

- **No cancel flow at all**: Instant cancel leaves money on the table. Even a simple survey + one offer gives you a save rate to measure and improve
- **Not tracking save offer LTV**: A "saved" customer who churns 30 days later wasn't really saved
- **No post-cancel path**: Make reactivation easy and trigger win-back emails, because some churned users will want to come back

---

## Tool Integrations

This pack does not ship retention, billing, or analytics connectors. Select an
authorized system from the user's actual stack and verify its current official
documentation, account plan, test mode, and rollback path before configuration.

### Capability Checklist

- Cancel-flow routing, survey capture, and an unobstructed final cancel action
- Stable experiment assignment and step-level event readback
- Pause, downgrade, and save-offer rules with explicit eligibility
- Payment-retry state, card-updater state, and customer-notification controls
- Audit history, test mode, role controls, and rollback or disable behavior

### Implementation Routing

- Route message writing to `suede-emails`.
- Route event schemas and readback to `suede-analytics`.
- Route test design to `suede-ab-testing`.
- Treat billing retries, discounts, subscription changes, and activation as
  separately authorized mutations.

### Halt Format for Billing Mutations

Before any change to a live billing object (retry rules, discounts, plan
changes, pauses, cancellations, subscription state, or customer-facing billing
messages), stop and emit this block, then wait. Inferred consent is not
authorization, and "the user asked for a cancel flow" is not authorization to
configure one.

```
HALT: billing mutation requires authorization

Mutation: <the exact change, e.g. "enable 5-attempt retry rule">
Objects touched: <provider, environment, subscriptions/customers/coupons affected, count>
Reversible by: <the exact rollback, or "not reversible">

Options:
1. Proceed in test mode only
2. Proceed on live objects as specified
3. Narrow the scope to <smaller set> and proceed
4. Abandon this mutation

Waiting for your choice.
```

---

## Boundaries

- Do not obstruct cancellation, hide downgrade paths, manufacture urgency, or use deceptive retention friction.
- Do not change subscriptions, retry rules, discounts, billing objects, or customer messaging without explicit authorization.
- Do not claim saved revenue or churn reduction without a defined cohort, window, denominator, and verified payment state.
- Do not decide which individual customer should receive a sensitive offer from protected traits or unsupported inference.

## Routing

- Need retention, dunning, or win-back messages -> use `suede-emails`.
- Need plan structure or offer economics -> use `suede-pricing` or `suede-offers`.
- Need paywall or trial-expiry UX -> use `suede-pricing` (Paywall mode).
- Need churn events or a controlled retention test -> use `suede-analytics` or `suede-ab-testing`.
- From those skills, route cancellation and payment-recovery strategy back to `suede-churn-prevention`.
