---
name: subscription-recovery
description: "Suede-owned recovery discipline for recurring charges billed outside Amazon: App Store, Google Play, PayPal, direct-bill streaming, gyms, news, and SaaS. Use when the user wants to find, audit, cancel, or dispute a subscription they may have forgotten, is being charged for twice, or no longer uses. Every cancellation and dispute requires the user to name the service first. Never enters payment credentials and never promises a refund. Requires Claude in Chrome for browser actions. NOT FOR: Amazon returns, restocking fees, or Amazon-billed Prime Video Channels, Audible, Kindle Unlimited, or Prime (use amazon-returns-recovery); merchant-side dunning and cancel-flow design (use suede-churn-prevention)."
metadata:
  version: 1.0.0
---

# Subscription Recovery

```
IRON LAW: Never cancel, dispute, or contact a merchant about a service until the
user has named that specific service and the specific outcome they want for it.
A subscription appearing in a discovery list is not authorization to act on it.
```

## Prerequisites

- Claude in Chrome browser extension connected, for any service checked or acted on
  in-browser. If `mcp__claude-in-chrome__*` tools aren't loaded yet, fetch them via
  ToolSearch first.
- Unlike amazon-returns-recovery, there is no single account to sweep — discovery
  depends on what the user can provide (a bank/card statement, app access, or just
  naming what they remember paying for) and what platform-level subscription hubs
  are available (App Store, Google Play, PayPal).
- **Unvalidated click-paths.** Only the App Store, Google Play, and PayPal hub pages
  in Phase 1a are close to a fixed, checkable URL. Every individual service's own
  billing/cancellation page (Netflix, Spotify, a gym's member portal, etc.) has to be
  discovered live and should be recorded in
  [references/service-playbook.md](references/service-playbook.md) once confirmed,
  so the next run doesn't rediscover it from scratch.

## Phase 1a — Platform subscription hubs (read-only, no side effects)

These three cover a large share of subscriptions in one page each, because the
platform (not the individual service) is the merchant of record:

1. **Apple App Store** (iOS/iPadOS/Mac subscriptions bought through Apple's
   in-app-purchase flow — many streaming apps route here instead of billing
   directly): `https://apps.apple.com/account/subscriptions` (requires Apple ID
   sign-in) or on-device: Settings → [Apple ID] → Subscriptions.
2. **Google Play**: `https://play.google.com/store/account/subscriptions` — same
   idea for Android-purchased subscriptions.
3. **PayPal recurring payments**: `https://www.paypal.com/myaccount/autopay/` —
   lists every merchant with standing authorization to charge the account, including
   ones that don't show up anywhere else (a common blind spot: an old free trial that
   converted, billed via PayPal, with no reminder email ever opened).

Each of these lists service name, price, billing cadence, and next charge date, and
each has a **direct cancel button on the same page** — no negotiation needed for a
straight cancellation found here.

## Phase 1b — Bank/card statement scan (read-only, no side effects)

If the user can share a recent statement (PDF, CSV export, or even a screenshot of
the transaction list), scan for recurring merchant names and amounts — the same
charge appearing monthly/annually from the same merchant is the signal. This catches
services that bill directly (Netflix, Hulu, Disney+, HBO Max, a gym, a SaaS tool)
and aren't visible through the Phase 1a hubs. Ask for the statement rather than
guessing; don't assume access to financial accounts.

## Phase 1c — Ask directly

Ask the user what else they know they're paying for that Phase 1a/1b didn't surface
— people usually remember 60-70% of their subscriptions when prompted but forget the
rest until specifically asked. This is often faster than a statement scan for a first
pass, and worth doing even after one.

## Phase 1d — Amazon carve-out

If a subscription turns out to be Amazon-billed (Prime Video Channels, Audible,
Kindle Unlimited, Prime itself), don't handle it here — hand off to
`amazon-returns-recovery`'s Phase 1b, which already documents those pages.

## Phase 2 — Confirm with the user

**HALT.** Discovery is over and nothing has been canceled, disputed, or contacted.
Present the findings, then wait for the user. No service is acted on unless the
user names it — silence, "sounds good," or a general go-ahead is not a naming.

Report every subscription found as a plain list: service, price, billing cadence,
next charge date, and usage signal if known (last opened, last watched, last
attended). Ask which ones to pursue and what outcome they want per service: cancel
only, cancel *and* ask for the last charge back, or dispute a specific charge without
canceling (e.g. billed twice in one month). Some subscriptions may turn out to still
be wanted — don't assume every finding is a mistake, and say so if one looks
intentional.

## Phase 3 — Execute (one service at a time, only after confirmation)

**Straight cancellation, no negotiation needed:**
- If found via Phase 1a (App Store, Google Play, or PayPal), cancel directly on that
  same hub page — fastest path, no chat required.
- Otherwise navigate to the service's own account/billing settings and look for a
  direct cancel option before resorting to chat or a phone call.

**Refund/goodwill ask** (forgot to cancel, charged after a cancellation attempt,
billed twice, or genuinely unused for months):
- Use the same ground rules as amazon-returns-recovery: state only true facts
  (service name, price, charge date, and the real reason), don't invent a prior
  contact attempt or cancellation date that didn't happen, ask plainly for the
  specific outcome wanted, and accept one polite counteroffer round at most before
  reporting back rather than escalating with anything untrue.
- Apple and Google have their own self-service refund-request flows separate from
  the subscription hub itself — Apple: `https://reportaproblem.apple.com`; Google
  Play: order history → "Report a problem" (or `support.google.com` refund request).
  These are usually faster than chat for App Store/Play Store charges and worth
  trying first.
- For direct-bill services, most have either a support chat or a cancellation
  retention flow (which sometimes offers a discount or partial refund unprompted
  when the user tries to cancel) — take the retention offer only if the user
  actually wants to keep the service at the lower price; otherwise decline and
  proceed with cancellation.

**Record the working path.** Once a service's actual cancellation/dispute flow is
confirmed live, add it to
[references/service-playbook.md](references/service-playbook.md) with the exact URL
and click-path, the same way amazon-returns-recovery documents its own chat flow —
this is what turns "unvalidated" into "validated" over time.

## Phase 4 — Report

After each cancellation or dispute resolves, report per service: what happened
(canceled, refunded, disputed and declined), the confirmation identifier or
confirmation email, the effective end date, and the refund amount and method. An
outcome with no confirmation identifier or email is reported as **unconfirmed**,
never as done. For anything unresolved, name the exact next contact and date.

If several services were pursued in one session, summarize as a running total —
keep one-time dollars recovered separate from ongoing monthly/annual savings from
cancellations, since they're not the same kind of money.

## Boundaries

- Never enter, store, or transcribe payment credentials, card numbers, or bank logins, and never connect a financial account.
- Never promise a refund amount, a refund timeline, or that a dispute will succeed.
- Never act on a service the user has not named, and never batch several services
  under one approval.
- Never dispute or cancel a charge the user recognizes as intentional.
- Never escalate with a fact the user did not supply — no invented prior contact,
  cancellation date, or usage claim.

## Routing

- Amazon-billed subscriptions, returns, and restocking fees -> use
  `amazon-returns-recovery`.
- Designing the cancel flow, dunning, retention offers, or save offers for a
  product the user sells -> use `suede-churn-prevention`. That skill is the
  merchant side; this one is the subscriber side.
