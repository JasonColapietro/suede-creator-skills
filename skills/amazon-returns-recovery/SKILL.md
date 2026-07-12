---
name: amazon-returns-recovery
description: "Scans Amazon order/return history for restocking fees and other money Amazon owes you that you never noticed, then drives Amazon's live chat to get it waived and refunded. Started as a test of a general-purpose negotiation tool and recovered $448.31 in one sitting — including a full refund on an item Amazon had already denied once, with no return required. Use this whenever the user mentions Amazon returns, restocking fees, an Amazon refund that looks short, disputing an Amazon charge, checking whether a return was fully refunded, or asks something like 'did I get charged for that return' or 'is Amazon still holding money on me' — even if they never say the word 'restocking.' Requires the Claude in Chrome browser extension connected and logged into the target Amazon account. NOT FOR: marketplace third-party seller disputes that require the A-to-z Guarantee process, chargebacks through a bank, or price-protection claims (unvalidated stretch goal)."
---

# Amazon Returns Recovery

## Why this exists

This started as a test of a general-purpose contract/customer-service negotiation
tool — the goal was just to see if it could hold its own in a dispute. Pointed at a
live Amazon account, it surfaced two restocking fees ($44.99 and $28.50) the account
owner had no idea existed, on returns processed weeks earlier. Both got waived in the
same sitting — the first refunded exactly the $44.99 fee, the second came back at
$30.63 (the associate rounded up past the $28.50 fee as a goodwill gesture). Total
recovered from fees alone: **$75.62**, on charges the account owner never would have
gone looking for. The lesson: money like this doesn't announce itself — restocking
fees, partial refunds, and price-protection differences sit quietly in order history
unless something goes and checks. That's what this skill automates.

Treat this as a metal detector, not an autopilot: it surfaces what's buried and drafts
the case, but every dispute goes through the account owner before anything gets sent.

The same account also had a third case worth knowing about, even though it's outside
this skill's default restocking-fee scope: a $372.69 electric shaver the account
owner had already been **denied a refund on once — while still inside the return
window**. Re-disputed two days after the window closed, hands-off, the case ended in
a full **$372.69** refund with no return required — the associate just let the account
owner keep it. Overturning an existing denial after the window shut is the ceiling of
what a well-reasoned exception ask can get, not just fee waivers. See
[references/example-cases.md](references/example-cases.md) for the full writeup of
all three real cases, including exactly what was said and what worked.

## Prerequisites

- Claude in Chrome browser extension connected to the browser, and the user already
  signed into the target Amazon account. If `mcp__claude-in-chrome__*` tools aren't
  loaded yet, fetch them via ToolSearch first (see the extension's own MCP
  instructions for the batch-load query).
- This runs against a real account. If the account is shared (family members with
  separate shipping addresses on the same login), be ready to see orders that aren't
  the user's — flag those, don't just fold them into the same batch without asking.

## Phase 1 — Discovery (read-only, no side effects)

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

**Stop here.** Do not open the dispute chat yet.

## Phase 2 — Confirm with the user

Report the findings as a plain list: item, order #, fee amount, who it shipped to,
first-party or third-party. Ask which ones to pursue. Some fees are legitimate (e.g.
an opened-item policy the seller disclosed at return time) — don't assume every fee
found is worth fighting, and say so if one looks like it was earned rather than
padded.

## Phase 3 — Dispute (one order at a time, only after confirmation)

For each order the user wants pursued, drive Amazon's live chat to request a waiver.
The exact click-path, a critical popup-window workaround, and the escalation flow to
a human associate are documented in
[references/dispute-chat-flow.md](references/dispute-chat-flow.md) — read that file
before starting this phase, since Amazon's chat UI has a specific gotcha (it opens in
a popup window Claude in Chrome's tab tracking can't see) that will silently strand
the flow if skipped.

Ground rules while chatting with the associate:
- State only true facts: order number, item, price, restocking fee amount, and that
  it was sold by Amazon.com (when true). Don't invent a prior contact attempt or a
  return reason that didn't happen — the ask ("waive this as a courtesy") is
  reasonable on its own and doesn't need embellishment to land.
- When offered a refund method, default to original payment method unless the user
  said otherwise.
- Confirm the exact refund amount and stated timeline before ending the chat.

## Phase 4 — Report

After each dispute resolves (or if the associate declines), tell the user: amount
recovered, refund method, stated ETA, and associate name if given. If several orders
were pursued in one session, summarize as a running total.

## Stretch goal — not yet built

**Price-protection refunds**: some categories/sellers refund the difference if a
listing's price drops within the return window after purchase. This would mean
comparing paid price vs. current listing price on recent (still-returnable) orders
and flagging drops worth claiming. Worth building as a Phase 1b once the restocking-fee
flow is solid, but out of scope for now — don't attempt it without discussing it
with the user first, since it's unvalidated.
