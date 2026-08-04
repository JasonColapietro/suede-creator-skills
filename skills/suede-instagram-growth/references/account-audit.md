# Instagram Account Audit

Use this schema to audit the recent account cohort without blurring visible
engagement, private Insights, and business conversion.

## Source order

1. Authenticated Instagram Insights or a user export.
2. Authorized Instagram API data for a professional account.
3. User-supplied post URLs, screenshots, content ledger, link analytics, CRM,
   and checkout data.
4. Public profile evidence, limited to metrics and content actually visible.

Instagram's Terms of Use prohibit automated collection without express
permission. If no authorized source is available, provide the worksheet and ask
for an export; do not scrape.

## Post ledger

Create one row per post:

```text
Post ID / permalink:
Published at / timezone:
Format: Reel | carousel | static | collaboration | other
Organic / boosted / unknown:
Duration or slide count:
Topic and pillar:
Audience problem or desire:
Hook text and hook family:
Structure:
Proof used:
CTA and destination:
Offer proximity: none | assist | direct
Visual mode: face | faceless | product | UGC | mixed
Production burden: low | medium | high, with minutes when known
Views / plays:
Accounts reached:
Watch time / average watch time:
Likes / comments / saves / shares:
Follows attributed to post:
Profile visits / profile actions / site taps:
DM starts / keyword replies:
Attributed leads / sales / revenue:
Metric source and captured date:
Evidence class:
Notes and confounders:
```

## Cohort controls

- Separate Reels, carousels, and static posts before comparing medians.
- Tag boosted posts, collaborations, giveaways, launches, major news, and
  creator reposts as distribution confounders.
- Compare rates only when their denominators are available and consistent.
- Use median rather than mean when a small number of outliers dominate.
- Show sample size beside every pattern: `n=<count>`.
- Do not name a repeatable pattern from one post. Two posts are a clue; three or
  more comparable posts can support a starting hypothesis.

## Audit output

```text
Coverage: <collected>/<target> posts
Access level: public | authenticated | export | mixed
Date range:
Metrics unavailable:

What repeatedly earns attention:
- Pattern -> post IDs -> cohort result

What repeatedly earns qualified action:
- Pattern -> post IDs -> cohort result -> attribution source

Views without downstream proof:
- Pattern -> post IDs -> missing or weak action

Audience response:
- recurring questions, objections, vocabulary, and requests

Conversion map:
- converts | assists | attention-only | unknown

Next controlled tests:
1. hypothesis / variable / primary metric / stop rule
```

## Official checkpoint links

Refresh these before encoding current platform behavior:

- Reel Insights: https://www.facebook.com/help/instagram/202865988324236
- Recommendation eligibility: https://www.facebook.com/help/instagram/653964212890722
- Instagram Terms of Use: https://www.facebook.com/help/instagram/581066165581870
- Instagram API collection: https://www.postman.com/meta/instagram/collection/6yqw8pt/instagram-api
