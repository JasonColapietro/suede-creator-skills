# Email Formats

Structures for one-off emails and DMs, including subject, preview, body and compliance constraints.

## Email Copy

### Subject Line Formulas

Subject lines win opens on three mechanics: curiosity, self-interest, or specificity. Pick one per subject line.

**Curiosity:**
- "[Specific thing most people miss]"
- "The [category] rule that [counterintuitive result]"
- "What happens when [specific scenario]"

**Self-interest:**
- "[Outcome] in [time] without [obstacle]"
- "How [audience segment] [achieved result]"
- "Your [specific thing] is [state]. Here's the fix."

**Specificity anchor:**
- "[#] [specific mistakes/fields/steps] in your [thing]"
- "[Exact name of thing]: [what it becomes]"

**Avoid:**
- Rhetorical questions ("Are you ready to take your music to the next level?")
- All-caps words
- "Re:" faking a reply thread
- Emojis in subject lines for B2B or technical audiences

**Compliance that changes the copy:** commercial email in the US needs a working unsubscribe link and the sender's physical postal address (CAN-SPAM, https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business). Gmail and Yahoo require one-click unsubscribe (RFC 8058) for bulk senders. Subject lines must not mislead about the content.

### Preview Text

Preview text is a second subject line. Write it to add information, not echo the subject.
- Subject: "12 metadata fields your release is missing"
- Preview: "The ones sync libraries check before they respond."

Keep preview text under 90 characters. If the client truncates at 40, the first 40 characters must stand alone.

### Body Structure

```text
Hook (1-2 sentences): Name the problem or opportunity at the exact moment the reader is experiencing it.
Proof or evidence (2-4 sentences): Specific, not general. One example beats three claims.
Bridge (1 sentence): Connect the proof to the offer.
CTA (1 sentence + link): One action, one link. No secondary options in the primary CTA block.
P.S. (optional): Use for a single secondary offer or a time constraint. Not both.
```

**Unsubscribe-reduction:**
- Match email content to the opt-in promise. Topic or frequency drift is the primary unsubscribe driver.
- Segment before sending. A technical how-to sent to decision-makers who opted in for strategy reads as list mismanagement.
- Run a re-engagement sequence before suppressing inactive subscribers: three emails over 30 days (one value, one direct question, one break-up). Suppress non-openers after the sequence.

## Social posts

Per-platform post structures, hook formulas, character limits and hashtag caps live in suede-social (`references/post-templates.md` and `references/platform-limits.md`), which keeps them current. Route account-based posts, threads, carousels and scripts there.
