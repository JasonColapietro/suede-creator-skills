---
name: suede-social
description: "Suede AI Social Skills. Plan, audit, and draft organic social for founder/brand accounts: platform mix, 30-post audits, calendars, Instagram, LinkedIn/X, short-video scripts, social search, and listening. Clip to guide mode turns a video moment into a short to long funnel that bridges to an owned guide or X Article, and any third-party video clip gets a rights route before reuse. Use when asked to \"audit our Instagram growth\", \"plan a 30-day social calendar\", or \"turn this clip into a guide funnel\", or to build an approval-ready content loop. NOT FOR: paid ads (use suede-ads or suede-ad-creative), editorial agents (use suede-newsroom), video rendering (use suede-video), or broad content strategy (use suede-content-strategy)."
metadata:
  display-name: "Suede AI Social Skills"
  version: 3.0.0
---

# Suede AI Social Skills

## Compatibility

Can work from supplied posts, screenshots, and analytics exports. Live account inspection needs authorized browser/platform access; publishing and scheduling require separately authorized tools. Clip-to-Guide mode also needs the source video or timestamped transcript, rights evidence, and a guide URL or draft, plus Python 3 for the bundled `scripts/validate_clip_package.py`.

For a concrete input, expected handoff, and failure check, read
[the worked handoff](references/worked-handoff.md).

Turn one account's real evidence into posts, scripts, calendars, and tests that
earn follows, leads, and sales, not only views. Every recommendation resolves
to the account's own content, audience, offer, voice, and production capacity,
or it is labeled an experiment. Publishing and engagement stay behind
exact-content approval.

## Correct these requests first

- **"Post daily and use the best time."** Cadence, timing, hashtag count, and
  format are account-level tests. Read the account's last 30 to 90 days first.
- **"Browse my last 30 posts automatically."** Use native analytics, an export,
  an authorized API, or user-supplied links. Do not scrape.
- **"This went viral, so it works."** Views are attention. Conversion needs
  follows, profile actions, DMs, leads, or sales evidence.
- **"Run the daily workflow" means publish.** It means refresh evidence and
  prepare approval-ready candidates. Publishing is a separate approved step.

## Step 1: Build the Account Evidence Pack

Read `.agents/product-marketing.md` (or `.claude/product-marketing.md`, or the
legacy `product-marketing-context.md`) plus any brand guide, voice samples,
offer sheet, content ledger, and analytics export. If its Status line says `partial`, ask for the listed missing sections before using them and never infer them; treat `[unverified]` fields as absent. Then fill:

```text
Handle and visible identity:        Account type: personal | creator | business
Objective: awareness | qualified followers | leads | sales | community
Primary audience and their problem:
Offer, price, and conversion path:
Voice samples with dates:           Faceless preference and available media:
Cadence now and production capacity:
Timezone and follower-active windows:
Evidence source and coverage:       Attribution: none | native | UTMs | CRM | checkout
Claims or topics needing review:    Last refreshed:
Unknowns that limit confidence:
```

Ask one compact batch of questions only for gaps that change the work.

Label every fact in the output by evidence class:

- **Observed-public:** visible post, caption, date, format, views, likes, comments.
- **Observed-owned:** native analytics, export, DM log, link analytics, CRM, checkout.
- **Computed:** a formula from observed values, with the formula and denominator shown.
- **Inferred:** a hypothesis to test, never worded as fact.
- **Unknown:** the measure is unavailable; say what would resolve it.

## Step 2: Pick the mode

| The user says | Run | Read |
|---|---|---|
| "analyze my account", "what converts" | 30-post audit and conversion map | [account-audit.md](references/account-audit.md) |
| "social strategy", "which platforms" | Platform mix and pillars | [platforms.md](references/platforms.md) |
| "make a calendar" | Ranked 30- or 60-day test calendar | Calendar row schema below |
| "write a post / thread" | Exact post copy | [post-templates.md](references/post-templates.md) |
| "make a Reel / TikTok / Short" | Hooks, timed script, shot plan, caption, test card | [content-production.md](references/content-production.md), [short-form-video.md](references/short-form-video.md) |
| "make a carousel" | Chosen narrative, exact slide copy, visual direction | [carousel-frameworks.md](references/carousel-frameworks.md) |
| "repurpose this" | Source atoms mapped to distinct platform assets | Repurposing below |
| "turn this clip into a guide funnel", "short to long", "X Article" | Clip-to-Guide package | [clip-to-guide.md](references/clip-to-guide.md) |
| "repost this podcast clip", any third-party video | Rights route before any copy | [clip-to-guide-rights.md](references/clip-to-guide-rights.md) only |
| "get found in search" | Social search brief | [social-search.md](references/social-search.md) |
| "what's working for others" | Lawful comparable-account pattern study | [reverse-engineering.md](references/reverse-engineering.md) |
| "find posts to reply to" | Ranked engagement drafts | [listening.md](references/listening.md) |
| "run the daily workflow" | Evidence refresh and approval packet | [daily-loop.md](references/daily-loop.md) |

Several modes in one request run in dependency order: audit or context refresh,
strategy, asset creation, QA, approval packet.

## Step 3: Audit before you prescribe

When a handle or export is supplied, audit before recommending anything:

1. Confirm the visible handle and whether evidence is public-only or owned. Never
   ask for a password or connect a third-party tool as a shortcut.
2. Collect the most recent 30 posts (all, if fewer). Tag boosted posts, collabs,
   giveaways, and launches as confounders.
3. Code each post: topic, pillar, hook family, format, CTA, offer proximity,
   production burden, and the search phrase it carries.
4. Compare within like formats using medians; show `n` for every pattern.
5. Classify each post `converts`, `assists`, `attention-only`, or `unknown`
   using the rules in [account-audit.md](references/account-audit.md).
6. Return repeatable patterns, dead weight, evidence gaps, and the next 3 to 5
   controlled tests, each citing post IDs.

## Pillars

Derive 3 to 5 pillars where audience problem, account expertise, observed
response, business objective, and a repeatable production source overlap. For
each, return:

```text
Pillar | Audience job | Proof the account can own it | Supporting post IDs
Format hypothesis | Business bridge | Stop condition
```

Do not force equal shares. Weight pillars by evidence and the next thing the
account needs to learn. Promotional content usually stays a small share; let
the account's own conversion data set the number.

## Platform quick reference

Format fit is a hypothesis per account. Facts verified October 2026 are in
[platform-limits.md](references/platform-limits.md), including the Instagram
5-hashtag cap, 3-minute Reels and Shorts, the 3:4 Instagram grid crop, and
Google indexing of public Instagram professional accounts.

| Platform | Common fit | Formats to test |
|---|---|---|
| LinkedIn | B2B expertise, founders, hiring | Text posts, document carousels, short video |
| X | Real-time expertise, tech, media | Posts, threads, replies, Articles |
| Instagram | Visual brands, creators, commerce | Reels, carousels, Stories |
| TikTok | Short-form discovery and search | Vertical video, series, comment replies |
| YouTube Shorts | Search-led how-to and demos | Square or vertical video up to 3 minutes |
| Facebook | Local audiences, groups | Group posts, native video |

## Hooks

The first line or first two seconds decide whether anyone stays. Families to
draw from: a belief the account was wrong about, a specific result with its
timeframe, a mistake and its fix, a how-to with the pain removed, a defensible
contrarian claim. Full lists live in
[post-templates.md](references/post-templates.md) and
[short-form-video.md](references/short-form-video.md).

Reject any draft that contains:

- Engagement bait with no stake ("Thoughts?", "Agree?", "Who else?").
- Manufactured awe ("Let that sink in", "This changes everything").
- A contrarian claim the account cannot back with a result or named source.
- A hook wrapped around an unproven claim. Fix the claim, not the hook.
- Fake specificity: invented percentages, round results, unmeasured timelines.

Score candidate ideas 0 to 4 on each: audience recognition, specific payoff,
evidence strength, voice fit, business bridge. Rank by total, show every
component, and call the winner a test candidate, never "viral".

## Asset contracts

**Short video (Reels, TikTok, Shorts).** Return 5 hooks (20 on request), the
selected hook with its score, a second-by-second script (visual, voiceover,
on-screen text, retention job per beat), a faceless shot plan when asked, a
caption whose first line carries the search phrase, one CTA, alt text and
caption notes, a rights and claims checklist, and a one-variable test card. With
no account evidence, label 15 to 45 seconds a starting test range.

**Carousel or document post.** Pick the narrative first (value stack,
problem-proof, numbered techniques, critique, demo walkthrough). Slide count
equals the beats the idea needs. Slide 1 names the audience tension or payoff;
each middle slide does one job; the last slide pays off and gives one action.

**Text post or thread.** First line stands alone before truncation. One idea.
One CTA. Use the skeletons in [post-templates.md](references/post-templates.md).

**Story sequence.** Use Stories for a job (research, proof, objection handling,
launch, reply, conversion), never a daily quota. Frame table in
[content-production.md](references/content-production.md).

Write captions and voiceover from the account's real voice samples: sentence
length, vocabulary, humor, punctuation, taboo list. Run final copy through
`suede-deslop` before it goes for approval.

## Repurposing

Extract self-contained atoms from one approved source: a quotable claim, a
complete mini-story, a tactical tip, a data point, a behind-the-scenes moment.
Map each atom to the platform where its format fits, and give each asset its own
point. When the source cannot support the requested count without repeating
itself, say how many it supports and what extra input would support more.

When the source is any third-party video (a podcast clip, conference talk,
interview, webinar, or another creator's post), load
[clip-to-guide-rights.md](references/clip-to-guide-rights.md), which opens with
the rights-route table, before writing copy. Do not load clip-to-guide.md for a
plain repost; it is for guide or article bridges only. A plain "repost
this podcast clip" still runs the rights gate: classify the source as original,
licensed, permission-recorded, native-repost-only, fair-use-review, or blocked,
and halt on anything blocked or unreviewed. Public availability and credit are
not permission.

When the clip must lead to an article, guide, X Article, LinkedIn article, or
newsletter, run Clip-to-Guide mode from
[clip-to-guide.md](references/clip-to-guide.md): moment scorecard, guide
anchor, verified publish sequence, certainty gate, and exact-content approval
bundle. A calendar or platform plan stays in the normal modes above; it loads
Clip-to-Guide mode only for the rows that bridge a clip to a guide.

## Calendar row schema

Every calendar row carries these fields. A row missing evidence source, test
variable, or approval status is not ready:

```text
Date + timezone | platform | format | pillar | audience problem | hook | payoff | CTA
Search phrase | evidence source | one variable under test | primary metric
Asset owner | production status | approval status | readback field
```

Use the lowest cadence that preserves evidence, voice, rights, and review
quality. Daily candidate generation is fine; daily publishing is a hypothesis.

## Listening and engagement

Listening surfaces posts worth a reply draft: ICP fit, buying intent, a real
chance to add something. Score, draft, and return for approval; every comment
is a separate external action. Method, rubric, and source recipes:
[listening.md](references/listening.md) and
[listening-sources-template.md](references/listening-sources-template.md).

## Measurement

Pick one primary metric from the objective and 2 to 4 diagnostics. With
denominators available, compute rates explicitly:

```text
save rate = saves / accounts reached        share rate = shares / accounts reached
follow rate = follows from post / reached   profile-action rate = profile actions / reached
lead rate = attributed leads / reached      search share = search-sourced views / views
```

Compare each post with its format's trailing median, not a universal benchmark.
Change one variable per test. Diagnosis rules and the experiment card are in
[measurement.md](references/measurement.md).

## Suede AI account mode

When the account belongs to Suede AI, Jason Colapietro, or a Suede AI product:

- Lead with what Suede AI sells first: AEO, GEO, and SEO services
  (https://suedeai.agency) and Agent Studio multi-agent automation for
  businesses (https://suedeai.app). Product lanes such as Suede Sing,
  StoryBeam, GuitarHub, and the creator skills come after.
- Build proof-led lanes: live demos, before-and-after search visibility with a
  named source, agent workflows shown working, founder lessons with specifics.
- Bylines and bios use Jason Colapietro. "Johnny Suede" is for social handles
  and casual creator content only.
- Never claim rankings, AI citations, revenue, or client results the account
  cannot show.
- Brand mark: use only `docs/assets/suede-ai-logo-transparent.png` from
  `JasonColapietro/suede-creator-skills` as the Suede S mark (SHA-256
  `83a7ee0317e4debe2e7b076c20ba067feb76a587f9e829dc6310ae4be4b44dfa`). Outside that checkout,
  fetch the same file from
  `https://raw.githubusercontent.com/JasonColapietro/suede-creator-skills/cbd192309580a32da375881e0eeb4b2450a554c2/docs/assets/suede-ai-logo-transparent.png`
  and verify its SHA-256 before use. Never redraw, trace, typeset, recolor,
  distort, or generate a replacement S. `suede-skill-icon.png` is a Passport
  icon, not the brand mark. Omit the mark and halt only if the fetch fails or
  the checksum differs.

## Halt contract

Use this format when access, asset rights, visible identity, or exact-content
approval blocks the result:

```text
HALT: <one-line blocker>
Why it blocks: <specific missing authority or evidence>
Resolve with:
1. <option>
2. <option>
3. <option, when useful>
Waiting for: <the exact item or approval>
```

Keep producing safe drafts and worksheets when they stay useful and do not imply
the blocker is resolved.

## Boundaries

- Do not publish, schedule, reply, follow, like, repost, message, or edit an
  account without approval of the exact content and the visible identity.
- Do not scrape, bypass access controls, evade rate limits, or put a consumer
  password into an automation.
- Do not invent private insights, trends, quotes, sentiment, competitor
  conversion, testimonials, or results. Public competitor data cannot show
  saves, shares, retention, or sales.
- Do not run engagement pods, buy followers, auto-like or mass-comment, or post
  undisclosed synthetic endorsements.
- Do not use music, footage, likenesses, logos, or reposted creator content
  without a verified lawful basis and any required credit.
- A draft, scheduled item, or composer preview is not a published post. Require
  a live permalink readback.

## Routing

- Paid social campaigns, budgets, and targeting: `suede-ads`. Paid creative
  variants: `suede-ad-creative`.
- One idea that must carry several surfaces with distinct arguments, or an
  agent-run editorial pipeline: `suede-newsroom`. This skill decides where and
  when; that one decides what each asset argues.
- A clip, interview moment, or third-party video bridged to an article,
  newsletter, or guide: Clip-to-Guide mode in this skill
  ([clip-to-guide.md](references/clip-to-guide.md)).
- Rendering, editing, captions tooling, and exports: `suede-video`. Still
  images and graphics: `suede-image`.
- Editorial portfolio and topic clusters: `suede-content-strategy`.
- UTMs, events, and attribution repair: `suede-analytics`.
- Site-level SEO and AI answer visibility: `suede-seo-audit` and `suede-ai-seo`.
- Final anti-slop pass on anything public: `suede-deslop`.
