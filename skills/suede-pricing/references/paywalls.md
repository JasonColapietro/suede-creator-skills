# Paywall Mode: In-Product Upgrade Screens

Read this whole file before drafting any paywall, feature gate, usage-limit
prompt, trial-expiry screen, or time-based upgrade nudge. It replaces the
standalone `suede-paywalls` skill.

## Contents
- Entitlement boundary
- Paywall intake
- Trigger points
- When to show, and when not to
- Screen components
- Screen templates (feature lock, usage limit, trial expiry)
- Frequency rules and measurement
- Subscription law check
- Upgrade flow and testing
- Anti-patterns
- Self-critique gate
- Paywall boundaries
- Output: Paywall Package

Suede AI designs in-product monetization around a truthful entitlement boundary
and a value-aware moment, not interruption volume. Define when the user has
enough context to evaluate an upgrade, what the paid change actually unlocks,
and how to test the prompt without obscuring price, consent, or exit.

## Entitlement boundary

The paywall is the tier map seen from inside the product. Every gate must match
a row of the tier map (Included, Limits, Price) in the Pricing Decision Brief or
the live plan definitions. If the gate the team wants does not exist in the
entitlement model, say so and stop: do not invent a block, a limit, or a price
to make the screen work. If the tier map itself is the problem (the free limit
is wrong, the paid tier unlocks too little), switch to the Decision Brief and fix
packaging first.

## Paywall intake

Check the product marketing context file first (see Before Starting in SKILL.md).
Then ask only what it does not answer. These replace the strategy-level intake
for this mode:

1. **Upgrade context:** freemium to paid, trial to paid, tier upgrade, feature
   upsell, or usage limit?
2. **Product model:** what is free, what sits behind the paywall, what triggers
   the prompt today, and the current conversion rate from that prompt?
3. **User journey:** when does the prompt appear, what has the user experienced
   by then, and what are they trying to do at that moment?

## Trigger points

### Feature gates
When the user clicks a paid-only feature:
- Explain plainly why it is paid
- Show what the feature does
- Give a quick path to unlock
- Offer a way to continue without it

### Usage limits
When the user hits a limit:
- Say clearly that the limit is reached
- Show what upgrading provides
- Do not block abruptly; leave a free path (delete, wait for reset, export)

### Trial expiration
When the trial is ending:
- Early warnings (7, 3, 1 day)
- A clear "what happens" on expiration
- A summary of the value received

### Time-based prompts
After X days of free use:
- A gentle upgrade reminder
- Highlight paid features the user has not tried
- Easy to dismiss

## When to show, and when not to

**Show:**
- After the value moment, before frustration
- After activation or the aha moment
- When the user hits a genuine limit

**Do not show:**
- During onboarding (too early)
- While the user is mid-flow on a task
- Repeatedly after a dismissal

## Screen components

1. **Headline:** what they get: "Unlock [Feature] to [Benefit]"
2. **Value demonstration:** preview, before/after, "With Pro you could..."
3. **Feature comparison:** the key differences, current plan marked
4. **Pricing:** clear and simple, annual vs. monthly options, renewal terms
5. **Social proof:** customer quotes, "X teams use this" (real numbers only)
6. **CTA:** specific and value-oriented: "Start Getting [Benefit]"
7. **Escape hatch:** a clear "Not now" or "Continue with Free"

## Screen templates

### Feature lock paywall
```
[Lock Icon]
This feature is available on Pro

[Feature preview/screenshot]

[Feature name] helps you [benefit]:
• [Capability]
• [Capability]

[Upgrade to Pro - $X/mo]
[Maybe Later]
```

### Usage limit paywall
```
You've reached your free limit

[Progress bar at 100%]

Free: 3 projects | Pro: Unlimited

[Upgrade to Pro]  [Delete a project]
```

### Trial expiration paywall
```
Your trial ends in 3 days

What you'll lose:
• [Feature used]
• [Data created]

What you've accomplished:
• Created X projects

[Continue with Pro]
[Remind me later]  [Downgrade]
```

## Frequency rules and measurement

Defaults unless a running experiment says otherwise. Ship these numbers, and
say so when a test moves them:

- Max **1** paywall impression per session.
- Cooldown **>= 7 days** after a dismiss; **>= 14 days** after a second dismiss.
- Suppress a given gate entirely after **3 lifetime dismissals**.

Instead of "annoyance signals," instrument the ones a reviewer can read: dismiss
rate per gate and post-paywall session-abandon rate, plus the impression,
click-through, completion, revenue-per-user, and post-upgrade churn metrics the
experiment reference tracks. Always read paid conversion together with task
completion and complaint guardrails, so a prompt that converts by blocking work
shows up as a loss.

## Subscription law check

Any paywall that starts a trial, converts a trial, or renews a subscription must
meet current auto-renewal rules. Status as of October 2026, with sources, in
[subscription-rules.md](subscription-rules.md), which also holds the 7-item
paywall design checklist. The short version:

- **US:** the FTC's 2024 click-to-cancel rule was vacated in July 2025 and the FTC is back at the advance-notice stage (March 2026), but ROSCA, FTC Act Section 5, and state laws still apply. California (since July 1, 2025) requires online click-to-cancel, limits save offers, and requires price-increase notices 7 to 30 days ahead.
- **UK:** DMCC unfair-practice fines are live; subscription rules (trial and renewal reminders, cooling-off, easy exit) are planned for January 1, 2027.
- **EU:** an online withdrawal function has been required since June 19, 2026.
- **App stores:** disclose renewal price, period, and terms on the paywall; check current external-purchase rules before linking out.

## Upgrade flow and testing

Keep the path from paywall to payment in context and pre-filled, and grant
access the moment payment clears. Do not bounce the user to a separate pricing
page or make them re-enter what the product already knows.

For frequency, trigger-timing, copy, and price-presentation experiments,
including which of the defaults above are worth testing first, see
[paywall-experiments.md](paywall-experiments.md). Use `suede-ab-testing` to
design and read out the test.

## Anti-patterns

### Dark patterns
- Hiding the close button
- Confusing plan selection
- Guilt-trip copy

### Conversion killers
- Asking before value is delivered
- Too-frequent prompts
- Blocking critical flows
- A complicated upgrade process

## Self-critique gate

Run before delivering any screen copy. Re-read the draft against Anti-patterns
above and Paywall boundaries below, and answer these out loud:

1. Where is the close/dismiss control, and is it visible without scrolling or hovering?
2. Is the price (including what renews, when, and at what amount) stated on the screen?
3. Does any urgency claim ("ends today", a countdown) correspond to a real deadline?
4. Can the user reach the free path in one tap from this screen?
5. Does any copy assign blame, shame, or loss the user did not actually incur?
6. If this screen starts or renews a subscription: are the renewal price, interval, trial end date, and cancel path shown before purchase, and is auto-renewal consent separate where the law requires it?

Name every hit before delivering. A hit on 1, 3, 4, or 6 is a blocker: fix the
draft, don't ship it with a caveat.

## Paywall boundaries

These add to the Boundaries in SKILL.md:

- Do not fabricate entitlement, plan, price, conversion, trial, or usage-limit data.
- Do not change billing, entitlements, app configuration, experiments, or live paywalls without explicit authorization.
- Do not recommend hidden close controls, confusing consent, forced continuity, obstructive cancellation, or false urgency.
- Do not decide refund, tax, legal, platform-policy, accessibility, or billing-risk terms for the user.

Routing inside this mode: cancel and save flows go to `suede-churn-prevention`;
public pricing-page conversion goes to `suede-site-alchemy`; reaching first value
goes to `suede-onboarding`; validating variants goes to `suede-ab-testing`.

## Output: Paywall Package

Use these headings verbatim; leave a heading in with "not decided, [what's
missing]" rather than dropping it.

```markdown
# Paywall Package: [product / gate]

## Entitlement boundary
[The tier-map row this gate enforces: what is free, what unlocks, the price.]

## Trigger rules
| Gate | Exact trigger | Frequency cap | Dismiss behavior | What stays free after dismiss |
|------|---------------|---------------|------------------|-------------------------------|

## Screen drafts
[One draft per gate, with price and renewal disclosure placement marked.]

## Self-critique and law check
[Each gate question answered, blockers fixed, jurisdictions checked and dated.]

## Experiment plan
[First test, primary metric, guardrails (task completion, complaints), and what to measure next.]

## What I did NOT decide
[Entitlement changes, live config, legal terms, and anything else left to the user.]
```
