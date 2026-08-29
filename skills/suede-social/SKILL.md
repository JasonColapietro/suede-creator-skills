---
name: suede-social
description: "Suede-owned organic social strategy and content discipline. Use when planning platform mix, posts, threads, cross-platform calendars, repurposing, listening, engagement, or cadence for a founder or brand account. NOT FOR: Instagram-specific account audits, Reels, carousels, Stories, or daily Instagram loops (use suede-instagram-growth), paid ad creative (use suede-ad-creative), broader editorial strategy (use suede-content-strategy), full video production (use suede-video), or publishing and engagement without approval."
metadata:
  version: 2.2.0
---

# Suede Organic Social

Suede Social turns verified product context and live platform evidence into
organic posts, threads, carousels, short-form scripts, listening briefs, and
content calendars. It distinguishes creation from account action and keeps every
publish or engagement step behind exact-content approval.

## Before Creating Content

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):

### 1. Goals
- What's the primary objective? (Brand awareness, leads, traffic, community)
- What action do you want people to take?
- Are you building personal brand, company brand, or both?

### 2. Audience
- Who are you trying to reach?
- What platforms are they most active on?
- What content do they engage with?

### 3. Brand Voice
- What's your tone? (Professional, casual, witty, authoritative)
- Any topics to avoid?
- Any specific terminology or style guidelines?

### 4. Resources
- How much time can you dedicate to social?
- Do you have existing content to repurpose?
- Can you create video content?

---

## Platform Quick Reference

Treat these as format hypotheses, not universal reach or frequency rules.
Before setting cadence, read current official platform guidance plus the
account's last 30–90 days of impressions, retention, saves, replies, follows,
and production capacity. Start with the lowest cadence that can sustain quality,
then change one variable at a time.

| Platform | Common Fit Hypothesis | Formats to Test |
|----------|-----------------------|-----------------|
| LinkedIn | B2B, professional expertise | Text posts, documents, stories |
| Twitter/X | Real-time expertise and community | Short posts, threads, replies |
| Instagram | Visual brands and creator narratives | Reels, carousels, Stories |
| TikTok | Native short-form storytelling | Vertical video, series, replies |
| Facebook | Communities and local audiences | Groups, posts, native video |

**For detailed platform strategies**: See [references/platforms.md](references/platforms.md)

For an Instagram-specific account audit, conversion map, Reel or carousel
package, Story system, or daily Instagram loop, route to
`suede-instagram-growth` instead of applying the cross-platform defaults here.

**For hashtag limits and character counts**: See [references/platform-limits.md](references/platform-limits.md)

---

## Content Pillars Framework

Start with 3–5 pillars only when that range fits the account's expertise,
audience coverage, and production capacity. Merge or expand after the first
review cycle based on current results.

### Example for a SaaS Founder

| Pillar | Starting Share Hypothesis | Topics |
|--------|---------------------------|--------|
| Industry insights | 20–30% | Trends, data, predictions |
| Behind-the-scenes | 20–30% | Building the company, lessons learned |
| Educational | 20–30% | How-tos, frameworks, tips |
| Personal | 10–20% | Stories, values, informed opinions |
| Promotional | 0–10% | Product updates, offers |

These ranges are a first content-mix test, not a universal formula. Reallocate
from qualified audience response and business outcomes.

### Pillar Development Questions

For each pillar, ask:
1. What unique perspective do you have?
2. What questions does your audience ask?
3. What content has performed well before?
4. What can you create consistently?
5. What aligns with business goals?

---

## Hook Formulas

The first line determines whether anyone reads the rest.

### Curiosity Hooks
- "I was wrong about [common belief]."
- "The real reason [outcome] happens isn't what you think."
- "[Impressive result] — and it only took [surprisingly short time]."

### Story Hooks
- "Last week, [unexpected thing] happened."
- "I almost [big mistake/failure]."
- "3 years ago, I [past state]. Today, [current state]."

### Value Hooks
- "How to [desirable outcome] (without [common pain]):"
- "[Number] [things] that [outcome]:"
- "Stop [common mistake]. Do this instead:"

### Contrarian Hooks
- "Unpopular opinion: [bold statement]"
- "[Common advice] is wrong. Here's why:"
- "I stopped [common practice] and [positive result]."

### Named defaults to avoid

A hook formula invites the exact copy these produce by default. Reject a draft
that contains any of them and rewrite from the claim's actual evidence:

- Engagement-bait questions with no stake ("Thoughts?", "Agree?", "Who else?").
- Manufactured awe ("Let that sink in", "This changes everything").
- Contrarianism with no evidence — an "unpopular opinion" the account cannot
  defend with an observed result or a named source.
- A hook wrapped around an unproven claim. If the payoff has no owned metric,
  named source, or demonstrable artifact behind it, fix the claim, not the hook.
- Fake specificity — invented percentages, round-number results, or timelines
  the account did not measure.

Run final copy through `suede-deslop` before it goes out for approval.

**For post templates and more hooks**: See [references/post-templates.md](references/post-templates.md)

**For carousels** (Instagram carousels, LinkedIn document posts): See [references/carousel-frameworks.md](references/carousel-frameworks.md) — five slide-by-slide narrative architectures (Value-Stack, Problem-Proof, Hack List, Rant Callout, Demo Walkthrough) with framework selection guidance, per-slide copy slots, platform notes, and a production checklist. Pick the framework before writing slides.

---

## Content Repurposing System

Test whether one approved source can yield several useful, distinct assets
without stretching the evidence or repeating the same point.

### Blog Post → Social Content

| Platform | Format |
|----------|--------|
| LinkedIn | Key insight with link placement tested against current guidance and account results |
| LinkedIn | Carousel of main points |
| Twitter/X | Thread of key takeaways |
| Instagram | Carousel with visuals |
| Instagram | Reel summarizing the post |

### Podcast / Video → Social Content

Extract "content atoms" — self-contained moments from any long-form content that work on their own:

| Atom Type | What to Look For | Candidate Formats to Test |
|-----------|-----------------|---------------------------|
| Quotable moment | A bold claim, hot take, or memorable line (15-60 sec) | Twitter/X, LinkedIn, TikTok |
| Story arc | A complete mini-story with setup, conflict, resolution (60-90 sec) | Instagram Reels, TikTok, YouTube Shorts |
| Tactical tip | A specific how-to or framework explained clearly (30-60 sec) | LinkedIn, YouTube Shorts |
| Controversial take | A contrarian opinion that sparks debate | Twitter/X, LinkedIn |
| Data/stat callout | A surprising number or research finding | LinkedIn carousel, Twitter/X |
| Behind-the-scenes | Authentic, unpolished moments | Instagram Stories, TikTok |

**Podcast repurposing workflow:**
1. **Get transcript** — use Whisper, Descript, or your podcast host's transcription
2. **Mark timestamps** — flag the 5-10 best moments while listening or scanning transcript
3. **Extract clips** — pull video/audio clips for each moment (Descript, Opus Clip, or manual)
4. **Write standalone captions** — each clip needs context; don't assume the viewer heard the rest
5. **Add subtitles** — make the clip accessible without assuming a universal
   sound-off rate
6. **Plan a distribution test** — choose timing from current cadence, source
   volume, approval capacity, and account evidence

**Starting extraction hypothesis, only when the source supports enough distinct
moments and the team can review them:**
- 3-5 short video clips or audiograms (15-60 sec) for Reels/TikTok/Shorts
- 1-2 LinkedIn text posts from key insights
- 1 Twitter/X thread of takeaways
- 1 carousel summarizing the main framework or list
- 1 newsletter section or blog post from the best segment

### Webinar / Live Event → Social Content

| Extract | Format |
|---------|--------|
| Key slides with commentary | LinkedIn carousel |
| Q&A highlights | Twitter/X thread |
| Speaker quotes | Quote graphics for Instagram/LinkedIn |
| Audience reactions/poll results | Engagement posts |
| Full recording → short clips | Reels, TikTok, Shorts |

### Newsletter → Social Content

| Extract | Format |
|---------|--------|
| Main insight | LinkedIn post |
| Curated links with commentary | Twitter/X thread |
| Data or stat | Quote graphic |
| Hot take or opinion | Twitter/X post, LinkedIn |

### Repurposing Workflow

1. **Create pillar content** (blog, video, podcast, webinar, newsletter)
2. **Extract content atoms** (5-10 per piece — quotes, stories, tips, data)
3. **Adapt to each platform** (format, length, and tone)
4. **Write standalone captions** (each post must work without context)
5. **Plan distribution** from current cadence and approval capacity
6. **Test updates or reshares** only when current relevance and account evidence
   support them

### X: Third-Party Video + Owned Article

When promoting an owned X Article with a relevant third-party video:

1. Use only the video as native media, and only with a lawful basis to reuse it.
   Preserve source attribution.
2. Do not quote, repost, or inherit the third party's whole post, caption,
   replies, or engagement context.
3. Create a fresh post from the approved account with the exact approved copy,
   then place the owned Article status URL at the end so X renders the owned
   Article as the quoted card.
4. Before publishing, verify the identity, native video, owned Article card,
   exact text, audience, and reply settings.
5. After publishing, verify the live post still contains both the native video
   and owned Article card, then capture the permalink.

If X's Quote composer accepts the video but leaves publishing disabled, use the
fresh-post construction above or report the blocker. Never substitute a quote
of the third party's post.

---

## Content Calendar Structure

### Illustrative Planning Grid

Use this only as a worksheet shape. Fill cells from the approved platform
hypotheses and production capacity; blank cells are valid.

| Slot | LinkedIn | Twitter/X | Instagram |
|-----|----------|-----------|-----------|
| 1 | Industry insight | Thread | Carousel |
| 2 | Behind-scenes | Reply draft | Story test |
| 3 | Educational | Short post | Reel test |

### Calendar row schema

Every calendar row returned to the user carries these exact fields. A row
missing evidence source, test variable, or approval status is not ready to
return:

```text
Slot/date + timezone | platform | pillar | hook | payoff | CTA
Evidence source | one variable under test | primary metric
Asset owner | production status | approval status
```

For the post draft itself, do not restate a template here — write it from
[references/post-templates.md](references/post-templates.md), which owns the
exact LinkedIn, X thread, carousel, and Reel skeletons.

### Batching Pilot

Set the timebox and output count from current capacity. A possible first pilot:

1. Review content pillar topics.
2. Draft one or two variants for each selected platform.
3. Prepare only the approved asset concepts.
4. Return the batch for exact-content review before scheduling or publishing.
   Each batch item is one calendar row in the schema above, plus its draft.

---

## Engagement Strategy

### Participation test (15–30 minute starting estimate)

1. Triage relevant comments on owned posts.
2. Draft 2–5 substantive replies to approved target-account posts.
3. Draft at most one share or quote post when it adds sourced context.
4. Draft a direct message only when the relationship and platform norms support
   it; never send without exact-content and identity approval.

Run this on 3–5 active days for two weeks only as a starting hypothesis. Compare
qualified replies, profile visits, follows, and time cost with the prior period.

**For surfacing *which* posts may merit a comment draft** (bounded ranked lists,
brand/competitor monitoring, intent-signal triage), see
[references/listening.md](references/listening.md). To set up the source list
that feeds it, use
[references/listening-sources-template.md](references/listening-sources-template.md).

### Quality Comments

- Add new insight, not just "Great post!"
- Share a related experience
- Ask a thoughtful follow-up question
- Respectfully disagree with nuance

### Building Relationships

- Build a bounded account set with explicit audience-fit reasons
- Participate only when the post is relevant and the visible identity is
  approved
- Share their content with credit
- Eventually collaborate (podcasts, co-created content)

---

## Analytics & Optimization

### Metrics That Matter

**Awareness:** Impressions, Reach, Follower growth rate

**Engagement:** Engagement rate, comments, shares/reposts, saves; weight them
according to the campaign objective rather than a universal hierarchy

**Conversion:** Link clicks, Profile visits, DMs received, Leads attributed

### Review Interval

- Choose an interval that contains enough comparable posts; weekly is only a
  starting estimate for active accounts.
- Compare a higher- and lower-performing cohort and test why they differed.
- Follower growth trend
- Engagement rate trend
- Timing patterns from current account data, with sample size and timezone

### Optimization Actions

**If engagement is low:**
- Test new hooks
- Post at different times
- Try different formats
- Test a bounded participation routine

**If reach is declining:**
- Compare link and no-link posts at similar account conditions
- Test one cadence change within production capacity
- Compare comments, text, document, image, and video formats against the account
  baseline

---

## Scheduling Best Practices

### When to Schedule vs. Post Live

**Schedule:** Core content posts, Threads, Carousels, Evergreen content

**Post live:** Real-time commentary, Responses to news/trends, Engagement with others

### Queue Management

- Set queue depth from current news sensitivity, approval capacity, and account
  cadence
- Review the queue before publication and whenever material context changes
- Leave gaps for spontaneous posts
- Adjust timing based on performance data

---

## Evidence-Based Content Pattern Analysis

Instead of guessing, analyze a lawful, recent sample from comparable accounts:

1. **Define comparables** — Similar audience, offer, account maturity, and
   platform; record why each account belongs in the sample.
2. **Collect a bounded sample** — Use only data the current platform and account
   access lawfully expose. Set the count from available volume and stop when
   another batch no longer changes the leading patterns.
3. **Analyze patterns** — Compare hooks, formats, CTAs, reach, retention, saves,
   and replies only where the platform exposes those measures.
4. **Codify playbook** — Document repeatable patterns
5. **Layer your voice** — Apply patterns with authenticity
6. **Convert** — Bridge attention to business results

**For the complete framework**: See [references/reverse-engineering.md](references/reverse-engineering.md)

---

## Short-Form Video (TikTok, Reels, Shorts)

Short-form video may be a useful discovery format when current platform
guidance and account-level results support it. Verify that premise for the
specific account before prioritizing it; the frameworks below organize a test,
not a guaranteed reach outcome.

### Platform test specs

Verify current official upload requirements and the authenticated composer
before production. If account evidence is unavailable, use these as first-test
ranges, not optimal lengths:

| Platform | Starting Length Test | Starting Canvas | Evidence to Read |
|----------|----------------------|-----------------|------------------|
| TikTok | 15–60 seconds | 9:16 | Retention, completion, qualified actions |
| Reels | 15–45 seconds | 9:16 | Retention, saves, shares, qualified actions |
| Shorts | 20–60 seconds | 9:16 | Retention, rewatches, search and channel actions |

### Opening-hook hypothesis

Test whether the first 1–3 seconds establish enough visual, verbal, or text
context to retain the intended viewer. Use one or more hook modes as the concept
requires; do not require all three without account evidence:

```
[VISUAL HOOK] + [VERBAL HOOK] + [TEXT OVERLAY]
```

Compare opening variants against the account's comparable-format retention
baseline before standardizing the pattern.

### Video Structures

Pick the beat sheet before scripting. All five structures — Problem-Solution,
List Format, Tutorial, Story Arc, POV/Skit — with timings and fit hypotheses,
plus the caption spec below, live in
[references/short-form-video.md](references/short-form-video.md); read it
whenever a short-form script or its on-screen text is actually being written.

### Caption & Subtitle Best Practices

Captions are an accessibility default, not a watch-time claim. Hard caps: **max
2 lines on screen, 3-5 words per line, timing matched to speech.** Caption
tooling, export specs, and edit execution belong to `suede-video`.

### Common Mistakes

1. **Unclear opening** — test whether the premise is understood in the first
   1–3 seconds
2. **No accessible captions** — provide captions independent of sound-off-rate
   assumptions
3. **Unusable audio** — verify speech intelligibility on target devices
4. **Unsupported length** — compare length bands against retention and the idea
5. **Missing next step** — include a CTA only when the objective needs one
6. **Unreviewed comments** — choose response priority from relevance and account
   evidence, not a universal first-hour rule

**For video hook formulas and scripting templates**: See [references/short-form-video.md](references/short-form-video.md)

---

## Halt Contract

Use this exact format when account access, asset rights, visible identity, or
exact-content approval blocks the requested result — including when the
publish/engagement gate in Boundaries fires:

```text
HALT — <one-line blocker>
Why it blocks: <specific missing authority or evidence>
Resolve with:
1. <option>
2. <option>
3. <option, when useful>
Waiting for: <the exact item or approval>
```

Continue with safe drafts, calendars, or worksheets only when they remain
useful and do not imply the blocker was resolved.

---

## Boundaries

- Do not publish, schedule, reply, follow, message, like, repost, or otherwise
  act as an account without explicit approval of the exact content and visible
  identity.
- Do not invent performance, trends, quotes, audience sentiment, or account
  access; distinguish observed platform evidence from hypotheses.
- Do not impersonate people, scrape private spaces, evade platform rules, or
  turn sensitive personal data into engagement material.

## Routing

- Use `suede-instagram-growth` for Instagram-specific account audits,
  conversion mapping, Reels, carousels, Stories, calendars, and daily loops.
- Use `suede-content-strategy` for the broader editorial system.
- Use `suede-newsroom` when one approved idea has to fill several surfaces and
  each asset needs its own argument, or when the pipeline itself needs roles,
  handoff contracts, and a campaign record. This skill decides where and when;
  that one decides what each asset argues.
- Use `suede-video` for full video generation and production, including caption
  tooling, export specs, and edit execution.
- Use `suede-clip-to-guide` to turn a clip, interview moment, or talk excerpt
  into a short-to-long package that bridges to an Article, newsletter, or guide.
- Use `suede-ad-creative` for paid social concepts and variants.
- Use `suede-analytics` for channel measurement and performance readback.
- Use `suede-deslop` for the final anti-slop pass on any copy that will be
  published.
