---
name: suede-aso
description: "Suede AI App Store Optimization (ASO) Skills for Apple App Store and Google Play. Use when asked to \"improve our App Store or Google Play listing\", \"optimize our Play Store listing\", or \"do ASO for our app\", or to prepare prelaunch keyword, title, subtitle, short description, description and screenshot fields from app and console evidence. NOT FOR: app builds (android-app-factory or site-to-ios-app), release rollout (suede-play-release), paid assets (suede-ad-creative), or install instrumentation (suede-analytics)."
metadata:
  display-name: "Suede AI App Store Optimization Skills"
  version: 2.0.0
---

# Suede AI App Store Optimization Skills

Read [the worked delivery contract](references/worked-contract.md) for a concrete
input, expected artifact, failure response and validation example.

## Compatibility

Works with live listing URLs or a prelaunch feature brief; web access for current official store field rules, console exports for performance evidence. Store write access is unnecessary for an audit or metadata draft.

Analyze App Store and Google Play listings with the Suede AI ASO scoring system. Fetch
live listing data, score metadata, visuals, and ratings, then produce a
prioritized action plan.

## Before Auditing

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

## Phase 1: Identify Store & Fetch

### Detect store type from URL

```
Apple:  apps.apple.com/{country}/app/{name}/id{digits}
Google: play.google.com/store/apps/details?id={package}
```

If the user gives an app name instead of a URL, search the web for:
`site:apps.apple.com "{app name}"` or `site:play.google.com "{app name}"`

### Fetch the listing

Use WebFetch to retrieve the listing page. Extract every available field:

The field list for each store is under "Fields to extract" at the top of
`references/apple-specs.md` and `references/google-play-specs.md`. Read the one
for the store being audited before fetching.

If WebFetch returns incomplete data (stores render client-side), note gaps and
work with what's available. Ask the user to paste missing fields if critical.

### Visual asset assessment

WebFetch cannot extract screenshot images or caption text. **Take a screenshot
of the listing page** to get visual data:

1. Navigate to the listing URL and capture a full-page screenshot
2. Assess the screenshot for: icon quality, screenshot count, caption text,
   messaging quality, preview video presence, feature graphic (Google Play)
3. If browser tools are unavailable, ask the user to share a screenshot of the
   listing page

**Promotional text (Apple):** This 170-char field appears above the description
but is often indistinguishable from it in scraped HTML. If you cannot confirm
its presence, note this and recommend the user check App Store Connect.

---

## Phase 1.5: Assess Brand Maturity

Before scoring, classify the app into one of three tiers. This determines how
you interpret "textbook ASO" deviations: a deliberate brand choice by a
household name is not the same as a missed opportunity by an unknown app.

### Tier definitions

| Tier            | Signals                                                                                                                              | Examples                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| **Dominant**    | Household name, 1M+ ratings, top-10 in category, near-universal brand recognition. Users search by brand name, not generic keywords. | Instagram, Uber, Spotify, WhatsApp, Netflix |
| **Established** | Well-known in their category, 100K+ ratings, strong organic installs, recognized brand but not universally known.                    | Strava, Notion, Duolingo, Cash App, Calm    |
| **Challenger**  | Building awareness, <100K ratings, needs discovery through keywords and ASO tactics. Most apps fall here.                            | Your app, most indie/startup apps           |

Classification happens here, before any scoring. The per-dimension adjustments
each tier earns live under "Brand Maturity Adjustments" in
`references/scoring-criteria.md`, which Phase 2 loads before scoring: do not
restate or re-derive them here.

**Key principle:** Before docking points, ask: "Is this a mistake or a deliberate
choice by a team that has data I don't?" If the app has 1M+ ratings and a
dedicated ASO team, assume their choices are data-informed unless clearly wrong.

---

## Phase 2: Score Each Dimension

Score each dimension 0-10 using the criteria in `references/scoring-criteria.md`.
Apply the brand maturity tier adjustments from Phase 1.5.

Reference files for platform specs and benchmarks:

- `references/apple-specs.md`: Official Apple character limits, screenshot/video specs, CPP/PPO rules, rejection triggers
- `references/google-play-specs.md`: Official Google Play limits, screenshot specs, Android Vitals thresholds, policies
- `references/benchmarks.md`: How to use (and not use) third-party benchmarks, directional patterns, and how to build a client baseline from console data

### Dimensions and Weights

| #   | Dimension            | Weight | What It Covers                                                            |
| --- | -------------------- | ------ | ------------------------------------------------------------------------- |
| 1   | Title & Subtitle     | 20%    | Character usage, keyword presence, clarity, brand + keyword balance       |
| 2   | Description          | 15%    | First 3 lines, natural use of core terms (Google), CTA, structure, promotional text |
| 3   | Visual Assets        | 25%    | Screenshot count/quality/messaging, video, icon, feature graphic          |
| 4   | Ratings & Reviews    | 20%    | Average rating, volume, recency, developer responses                      |
| 5   | Metadata & Freshness | 10%    | Category choice, update recency, localization count, data safety          |
| 6   | Conversion Signals   | 10%    | Price positioning, IAP transparency, social proof, download range         |

**Final score** = weighted sum of the dimensions that were actually observed.

### Unassessable dimensions (read before computing any score)

`references/scoring-criteria.md` defines score 0 as "cannot assess (data
unavailable)". Missing data is the normal case here, not the exception:
WebFetch cannot extract screenshots or caption text, and promotional text is
indistinguishable in scraped HTML. A 0 for unfetched data is not a bad listing;
scoring it as one fabricates a failing grade (an unobserved Visual Assets
dimension at 25% weight silently drops an A listing to D).

House rule:

1. A dimension you could not observe is **excluded from the weighted
   denominator**, not scored 0. Rescale the remaining weights and state the
   denominator used ("74/100 across 4 dimensions carrying 75% weight").
2. List every excluded dimension as **not assessed**, with the reason and what
   the user would need to supply to close it (a screenshot of the listing page,
   App Store Connect access).
3. If **more than 25% of total weight** is unassessed, **withhold the letter
   grade entirely.** Report the partial scores and the blocked dimensions
   instead; do not present a grade the evidence cannot support.

### Score interpretation

| Score  | Grade | Meaning                                                   |
| ------ | ----- | --------------------------------------------------------- |
| 85-100 | A     | Well-optimized; focus on A/B testing and iteration        |
| 70-84  | B     | Good foundation; clear opportunities to improve           |
| 50-69  | C     | Significant gaps; prioritized fixes will have high impact |
| 30-49  | D     | Major optimization needed across multiple dimensions      |
| 0-29   | F     | Listing needs a complete overhaul                         |

---

## Phase 3: Competitor Comparison (Optional)

If the user provides competitor URLs or asks for comparison:

1. Fetch 2-3 top competitors in the same category
2. Run the same scoring on each
3. Build a comparison table highlighting where the user's app is weaker/stronger
4. Identify keyword gaps: terms competitors rank for that the user's app doesn't target

If no competitors are specified, suggest the user provide 2-3 or offer to search
for top apps in their category.

---

## Phase 4: Generate Report

Use the template in `references/report-template.md` to structure the output.

The report must include:

1. **Score card**: table with all 6 dimensions, scores, the weighted denominator
   actually used, and the grade (withheld per the unassessable-dimension rule
   when more than 25% of weight went unassessed)
2. **Top 3 quick wins**: changes that take <1 hour and have highest impact
3. **Detailed findings**: per-dimension breakdown with specific issues and fixes
4. **Keyword suggestions**: based on title/description analysis and competitor gaps
5. **Visual asset recommendations**: specific screenshot/video improvements
6. **Priority action plan**: ordered list of changes by impact vs effort

### Report rules

- Every recommendation must be **specific and actionable** ("Change subtitle from X to Y" not "Improve subtitle")
- Include character counts for all text recommendations
- Flag platform-specific differences (Apple vs Google) when relevant
- Note what CANNOT be assessed without paid tools (search volume, exact rankings)
- When suggesting keyword changes, explain WHY each keyword matters

---

## Platform-Specific Rules

Character limits, screenshot and video specs, CPP and experiment rules, policy
prohibitions, Android Vitals thresholds, editorial curation, and rejection
triggers are versioned in the three reference files listed in Phase 2. Read the
one for the store being audited before scoring any dimension against a spec:
they are the source of truth, and dated platform facts are not repeated here.

The one comparison that drives scoring on every audit stays inline:

### What Apple Indexes vs What Google Indexes

| Field                 | Apple Indexed?   | Google Indexed?        |
| --------------------- | ---------------- | ---------------------- |
| Title                 | Yes              | Yes (strongest signal) |
| Subtitle / Short desc | Yes              | Yes                    |
| Keyword field         | Yes (hidden)     | Does not exist         |
| Long description      | No               | Yes (heavily)          |
| Screenshot captions   | Unconfirmed      | No                     |
| In-app events         | Yes              | N/A (LiveOps instead)  |
| Developer name        | No               | Partial                |
| IAP names             | Yes              | Yes                    |

### Store listings outside the store

App Store and Google Play pages are indexed by web search and often cited by
AI assistants when someone asks "best app for [job]". Two checks on every
audit:

- **Entity match**: developer name, app name, and the one-line description
  match the brand's canonical entity facts (see `suede-ai-seo`). A developer
  name that still shows an old company name splits the entity.
- **Web landing page**: the app has a crawlable page on the brand's site that
  states what it does, links to both store listings, and carries
  `SoftwareApplication` (or `MobileApplication`) JSON-LD matching the store
  facts. Route the page itself to `suede-seo-audit`.

## Pre-Launch Metadata Mode

Use this mode when the app has no live listing yet, so there is no URL to audit.
Search language belongs in the keyword surfaces; product differentiation belongs
in screenshots, the description body, and promo text.

1. Pick one winnable target keyword before the listing is written: users
   plausibly search it, competitors exist but are not all dominant incumbents,
   recent apps show the niche is alive, the app satisfies the searcher's job
   directly, and the term is not a competitor trademark.
2. Write the text fields for each store the app ships to. Take every character
   limit from the dated spec file for that store, never from memory.
   - **Apple App Store** (`references/apple-specs.md`): app name, subtitle,
     keyword field, and promotional text. Do not repeat a word across name,
     subtitle, and keyword field, use no spaces after commas in the keyword
     field, keep one of singular or plural, and front-load the highest-value
     terms.
   - **Google Play** (`references/google-play-specs.md`): title (30), short
     description (80), and full description (4,000). Play has no keyword
     field, and the full description is indexed, so use the core terms in
     natural sentences and never as keyword lists.
3. Plan screenshots outcome first: screenshot 1 sells the result, screenshot 2
   sells the differentiator, captions use the searcher's words.
4. Run every claim through a feature-truth check. Never advertise a feature the
   build does not have.
5. Set a 2 to 4 week measurement plan for rankings, impressions, product page
   conversion, and promo text or caption rotation.

Output artifacts:

- `aso/keywords.md` and `aso/aso-doc.md`
- Apple: `fastlane/metadata/<locale>/name.txt`, `subtitle.txt`,
  `keywords.txt`, `description.txt`, and `promotional_text.txt`
- Google Play: `fastlane/metadata/android/<locale>/title.txt`,
  `short_description.txt`, and `full_description.txt`
- a screenshot title plan and the ordered screenshot asset list, per store

Play listing files ship through `suede-play-release`'s listing lane, separately
from the build upload (its Boundary 4).

---

## Common Issues Checklist

The tiered flag checklist, with an author action on every flag (blocks the
listing, required, optional), is under "Flag checklist" in
`references/scoring-criteria.md`. Read it while writing Detailed findings.

---

## Task-Specific Questions

Ask only for what you cannot fetch: the listing URL if none was given, and
console exports if conversion is in scope. Infer store, category, and
competitors from the listing.

---

## Boundaries

- Do not claim keyword rank, conversion lift, review status, or store approval without a current source or console readback.
- Do not edit or submit store metadata, screenshots, builds, prices, or releases without explicit authorization.
- Do not invent competitor performance, customer sentiment, or platform benchmarks; label estimates and their source dates.
- Do not reuse copyrighted competitor assets or generate an alternate Suede S in screenshot recommendations.

## Routing

- Need paid app-install creative -> use `suede-ad-creative`.
- Need install attribution or in-app events -> use `suede-analytics`.
- Need customer language for listing copy -> use `suede-customer-research`.
- Need an iOS or Android product build -> use `site-to-ios-app` or `android-app-factory`; native iOS from scratch is a private Suede AI companion, not in this pack: ios-app-factory.
- Need App Store or Google Play metadata authored for an app that has not shipped yet -> stay in `suede-aso` and run Pre-Launch Metadata Mode.
- From those skills, route listing audits, metadata strategy, and screenshot sequencing back to `suede-aso`.
