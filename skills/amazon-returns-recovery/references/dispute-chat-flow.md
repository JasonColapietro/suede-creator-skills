# Amazon dispute chat — click path and gotchas

This is the exact flow validated live: it recovered a $44.99 restocking fee and,
separately in the same account, a $28.50 restocking fee. Both went through this same
path with a human associate.

## The popup-window gotcha (read this first)

Amazon's "Start chatting now" button calls `window.open()` to launch the chat in a
genuine new browser window. Claude in Chrome's tab tracking (`tabs_context_mcp`) only
sees tabs inside its own tracked tab group — it cannot see or control that popup.
Clicking "Start chatting now" without the workaround below will silently open a
window you can't drive; you'll be stuck watching the original page do nothing.

**Fix — before clicking "Start chatting now" (or "Back to chat"), run this via the
JS/console tool on the current page:**

```js
window.open = function(){ return window; };
```

This makes `window.open()` return the current window instead of spawning a real
popup, so the chat loads in the same tab you're already tracking. Re-apply this patch
every time the page does a full navigation/reload — it doesn't survive a page load,
only script execution within the current page.

If you forget and land on `about:blank` or a genuinely separate window you can't see,
don't try to chase the popup — just navigate back to the hub gateway, re-apply the
patch, and click through again.

## Click path to reach live chat

1. `https://www.amazon.com/hz/contact-us/foresight/hubgateway`
2. Scroll to **"Can't find what you're looking for?"** → click
   **"Payment methods, charges, or gift cards"**
3. Click **"Unknown or incorrect charges"**
4. Click **"I need more help"**
5. Apply the `window.open` patch (see above)
6. Click **"Start chatting now"**

If a **"Looks like you already have a chat in progress"** prompt appears (leftover
from an earlier session), click **"Start a new chat"** — don't try to resume an old
one for a different order.

## Qualifying questions (bot, not yet a human)

The bot asks a couple of quick questions before showing an item picker:

- "Do you know what the charge was for?" → **Retail order on Amazon.com**
- "Do you know the approximate amount of the charge?" → pick the bracket that
  contains the fee amount (e.g. "Over $25")

Then it shows a **Transaction Picker Widget** — a short list of recent charges. If
the order in question is recent it may appear directly; tap it and skip ahead to
"Escalating to a human."

## If the order isn't in the picker (older order)

This is the common case for anything more than ~30 days old — the picker only shows
recent charges.

1. Click **"Charge is not listed"**
2. That leads to a fallback menu: *Report unauthorized activity / Closed by mistake /
   I'm not asking about an item / Start over and rephrase my question*. Click
   **"I'm not asking about an item"** — the others either lie about the situation or
   loop back to the same dead end.
3. That opens a general options menu (*Managing my account / Kindle, Fire, or Amazon
   device / Music, eBooks... / An unknown charge / Suspicious call or email / I want
   to return a gift / I need more help*). Click **"I need more help."**
4. The bot replies: *"If you need more help on this issue, you can chat with an
   associate or request a phone call."* Click **"Chat with an associate now."**
5. Confirm **"Yes, wait for an associate"** when the wait-time estimate appears.

## Priming the chat before the human joins

Once queued, a free-text box appears: *"If you have details you think would help the
associate, type them here."* Type the full case and send it now — it'll be sitting
there when the associate joins, which speeds things up a lot:

> Hi, order #<order-id>, <item name> ($<price>), sold directly by Amazon.com. The
> return was already processed, but a $<fee> restocking fee was deducted. I'd like to
> request that this restocking fee be waived and refunded as a courtesy. Thank you!

## Once a human associate joins

From this point on it's a real support team, not a bot.

1. They'll usually paste back the item name and ask **"Is this the item?"** — confirm
   yes.
2. They check the account and typically offer to process the refund "as an exception."
   Confirm yes.
3. They'll ask refund method: **original payment method** or Amazon gift card.
   Default to original payment method unless told otherwise.
4. They confirm the exact amount and a timeline (usually 3-5 business days, with a
   confirmation email once it posts). Record this for the report back to the user.
5. Close out politely — a short thank-you is enough. No need to over-explain why you
   were asking.

## If the associate declines or asks for more

Don't invent facts to strengthen the case (no fabricated prior-contact claims, no
embellished return reasons). If they decline outright, report that back to the user
honestly rather than escalating with anything untrue — a real waiver ask on a
first-party Amazon order is reasonable on its own merits.
