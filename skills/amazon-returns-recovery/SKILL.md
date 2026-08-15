---
name: amazon-returns-recovery
description: "Suede-affiliated Amazon money-recovery audit for restocking fees, short or denied refunds, and Amazon-billed subscriptions. Use when the user mentions a restocking fee, a short or denied Amazon refund, or a forgotten Prime Video Channel, Audible, Kindle Unlimited, or Prime charge, or asks whether Amazon still owes or bills them. Read-only discovery; no chat, cancellation, or dispute without the account owner's per-item confirmation, and never a promise of recovery. Requires an authenticated Claude in Chrome session. NOT FOR: bank chargebacks, marketplace A-to-z seller claims, price-protection claims, or subscriptions billed outside Amazon (use subscription-recovery)."
metadata:
  version: 1.0.0
---

# Amazon Returns Recovery

**Iron Law:**

```
Nothing is disputed, canceled, or sent without the account owner's per-item
confirmation. Discovery is read-only; every action phase is gated.
```

## Why this exists

1. **Money like this doesn't announce itself.** Restocking fees, short refunds, and forgotten subscription charges sit unannounced in order history unless something checks.
2. **Overturning an already-denied refund after the return window closed is the realistic ceiling of a well-reasoned exception ask** — so ask for more than a waiver when the facts support it.

Read [references/example-cases.md](references/example-cases.md) before drafting a dispute: three real resolved cases with the exact wording that worked.

## Prerequisites

- Claude in Chrome browser extension connected to the browser, and the user already
  signed into the target Amazon account. If `mcp__claude-in-chrome__*` tools aren't
  loaded yet, fetch them via ToolSearch first (see the extension's own MCP
  instructions for the batch-load query).
- This runs against a real account. If the account is shared (family members with
  separate shipping addresses on the same login), be ready to see orders that aren't
  the user's — flag those, don't just fold them into the same batch without asking.

## Phase 1a — Order/return discovery (read-only, no side effects)

Goal: find every completed return where Amazon deducted a restocking fee, without
touching anything.

1. Search order history broadly by category keyword, not just exact terms — Amazon's
   `your-orders/search` matches loosely, so one keyword (e.g. "razor") surfaces
   adjacent items (shavers, trimmers) too. Restocking fees concentrate on
   higher-value electronics/appliances, so prioritize checking those over
   consumables or clothing.
   - `https://www.amazon.com/your-orders/search/ref=ppx_yo2ov_dt_b_search?opt=ab&search=<keyword>`
   - Paginate through all result pages — don't stop at page 1. Older orders (a year+
     back) still show up here even though they've long since dropped off `Your
     Returns`.
2. For faster coverage of *recent* activity, also check
   `https://www.amazon.com/your-returns` — but note it only shows roughly the last
   3 months, so it's a supplement to the search sweep, not a replacement for it.
3. For each order that shows "Return complete" / "Refund Complete" / "Refund issued",
   open its detail page:
   `https://www.amazon.com/your-orders/order-details?orderID=<orderID>`
   Find the **Refund Total** line — it has a small chevron that expands to an
   itemized breakdown (Item(s) refund / Tax refund / Restocking fee / Refund Total).
   Click it. Orders with no fee just show item + tax = refund total; orders with a
   fee show the deduction explicitly.
4. Record every hit: order #, item name, item price, restocking fee amount, who it
   shipped to, and whether it was sold by Amazon.com directly or a third-party
   seller (first-party listings are the strongest cases — Amazon's own chat agents
   can waive those without looping in a marketplace seller).
5. Don't try to make this exhaustive on the first pass if the account has a long
   history — report what's found so far and note that more may be scattered across
   older years if the user wants a deeper sweep.

**Stop here** — Iron Law. Discovery ends; nothing is opened or disputed yet.

## Phase 1b — Digital subscription audit (read-only, no side effects)

**Unvalidated click-path** — the exact URLs below are the best-known entry points as
of this writing, not yet confirmed live like the Phase 1a flow. If a URL 404s or
redirects somewhere unexpected, navigate from the account menu instead (Amazon moves
these pages periodically) and note the working path back into this file once
confirmed.

Goal: find every recurring digital subscription billed through the Amazon account —
Prime Video Channels, Audible, Kindle Unlimited, Prime itself — and flag ones that
look forgotten, unused, or worth reconsidering. This is a different shape of "money
Amazon is quietly taking" than restocking fees: it's ongoing, not a one-time
deduction, so the fix is usually "cancel it" rather than "waive it," with a refund
ask reserved for genuinely forgotten charges.

1. **Prime Video Channels** (this is how Britbox, Starz, AMC+, Paramount+, Shudder,
   MGM+, etc. actually bill — they're not separate Amazon relationships, they're
   add-on channels on top of Prime Video):
   `https://www.primevideo.com/settings/channels` — lists every active channel
   subscription, price, and next billing date. If that redirects, go to Prime
   Video → Account & Settings (top right) → Channels.
2. **Audible membership**: `https://www.audible.com/account/membership-overview` —
   same Amazon login, separate billing page. Shows plan tier, price, next charge
   date, and credit balance (unused credits are themselves worth flagging — they
   don't expire immediately but do eventually).
3. **Kindle Unlimited**: `https://www.amazon.com/kindle-dbs/subscribe/kindle_unlimited`
   or via Account → Digital Services and Devices → Kindle Unlimited.
4. **Prime membership itself**: `https://www.amazon.com/manageprime` — for cases
   where the user isn't using Prime shipping/video/music benefits and it's worth
   flagging (this one is more consequential to cancel than a $9 channel add-on, so
   treat it as report-only unless the user specifically asks about it).
5. For each subscription found, record: name, monthly/annual price, next billing
   date, and — if the page shows it — last-used or last-watched date. If usage data
   isn't visible on the billing page, ask the user directly whether they still use
   it rather than guessing.
6. Build the list only — Iron Law.

## Phase 2 — Confirm with the user

Report the findings as a plain list: for fees, item / order # / fee amount / who it
shipped to / first-party or third-party; for subscriptions, name / price / billing
cadence / next charge date / whether it looks used or forgotten. Ask which ones to
pursue and what outcome they want for each (waive a fee, dispute a charge, cancel a
subscription, or cancel *and* ask for the last charge back). Some fees are legitimate
(e.g. an opened-item policy the seller disclosed at return time) and some
subscriptions may turn out to still be wanted — don't assume every finding is worth
acting on, and say so if one looks earned or intentional rather than a mistake.

## Phase 3 — Dispute or cancel (one item at a time, only after confirmation)

For fee/refund disputes, drive Amazon's live chat to request a waiver. The exact
click-path, a critical popup-window workaround, and the escalation flow to a human
associate are documented in
[references/dispute-chat-flow.md](references/dispute-chat-flow.md) — read that file
before starting this phase, since Amazon's chat UI has a specific gotcha (it opens in
a popup window Claude in Chrome's tab tracking can't see) that will silently strand
the flow if skipped. The same chat flow and associate-facing script apply whether the
ask is "waive this restocking fee" or "cancel this channel and refund the last
charge" — only the specifics of the ask change.

For subscription cancellations, note the two distinct asks are not equally strong:
- **"Cancel this subscription"** is unconditional — the user is entitled to cancel
  anytime, no negotiation needed. This can usually be done directly on the
  subscription's own settings page (the URLs in Phase 1b) without needing chat at
  all — try that first, it's faster than a chat dispute.
- **"Refund the last charge because I forgot to cancel / wasn't using it"** is a
  goodwill ask, same as a restocking-fee waiver — reasonable to make once, under
  the truthfulness and single-counter rules in Boundaries.

Two chat mechanics, beyond those Boundaries rules:
- When offered a refund method, default to original payment method unless the user
  said otherwise.
- Confirm the exact refund amount and stated timeline, or the exact cancellation
  effective date, before ending the chat.

## Phase 4 — Report

After each dispute or cancellation resolves (or if the associate declines), tell the
user: amount, refund method, stated ETA or effective date, and associate name if
given. If several items were pursued in one session, summarize as a running total
across fees, refunds, and subscriptions canceled (report subscription savings as
"$X/month going forward" separately from one-time dollars recovered — they're not
the same kind of money).

**Evidence rules — a promise is not money:**

- Quote the associate's confirmation **verbatim from the transcript**, not paraphrased. No captured confirmation line means no amount is reported.
- Label every unverified amount **promised**, never "recovered." Only a posted line item counts toward a recovered total.
- Set the readback as a follow-up: the stated ETA is typically 3-5 business days, so it cannot resolve in-session. After that date, reopen the order detail page, expand the **Refund Total** chevron per Phase 1a step 3, and compare the breakdown against the promised amount. Tell the user the date to check and the number to look for.
- If the readback shows the waiver never posted, reopen it as a new case with the transcript quote as evidence.

## Boundaries

- Nothing is disputed, canceled, or sent without the account owner's per-item confirmation; approval for one item never transfers to another. Phases 1a and 1b are read-only.
- On a shared login, flag orders belonging to other people instead of folding them into the batch.
- State only true facts to an associate: order number or subscription name, item, price, fee amount. Never invent a prior contact attempt, a return reason, or a cancellation reason.
- Make a goodwill ask once. Do not push past a single polite counter if declined.
- Never promise recovery, and never report a promised amount as recovered money.
- Price-protection refunds are out of scope and unvalidated — do not attempt one without discussing it with the user first.

## Routing

- Subscriptions billed outside Amazon (by the provider, Apple, or Google rather than the Amazon account) -> use `subscription-recovery`.
- Bank chargebacks, marketplace A-to-z seller claims, and price-protection claims are out of scope for this skill entirely.
