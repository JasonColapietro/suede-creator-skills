# Current Search Guidance

Primary-source baseline verified on 2026-10-25. Re-check the linked page when
a rule affects a ship decision; Google and Microsoft change these often.
Google's dated changelog of documentation changes is the fastest re-check:
https://developers.google.com/search/updates

## Generative AI features (AI Overviews, AI Mode)

- Rooted in core Search ranking and quality systems. "There are no additional
  requirements to appear in AI Overviews or AI Mode, nor other special
  optimizations necessary."
- Eligibility: indexed and eligible to show with a snippet. No other technical
  requirement. Serving is not guaranteed.
- Both may use query fan-out (multiple related searches across subtopics), so
  topic coverage across a site matters more than one page per phrasing.
- No special schema, AI text files, markup, or Markdown copies are needed.
  Google Search does not use `llms.txt`.
- No need to break content into tiny chunks or write in a special style.
- Mass-producing pages to manipulate rankings or AI responses violates the
  scaled content abuse policy.
- Controls: `nosnippet`, `data-nosnippet`, `max-snippet`, and `noindex` limit
  what AI features show. The robots meta tag doc says `nosnippet` "will also
  prevent the content from being used as a direct input for AI Overviews and
  AI Mode."
- **Search generative AI control** (Search Console, rolled out to all sites
  worldwide as of August 31, 2026): a site-level setting that excludes the
  property's content from AI Overviews, AI Mode and generative AI features in
  Discover. Exclusion takes effect within 1-2 days. Google says it is not a
  ranking or inclusion signal for the rest of Search and does not affect AI
  training. Child properties can follow or override the parent setting. It
  cannot be seen from outside; ask the owner when AI feature impressions are
  zero. Whether to use it is a policy call for `suede-ai-seo`.
- Spam policies apply to generative AI responses in Search (clarified May 15,
  2026). The AI optimization guide (June 15, 2026 update) says `llms.txt`
  files "aren't needed for Google Search" and have no positive or negative
  ranking effect. `Google-Extended` affects Gemini training and
  grounding outside Search; Google says it does not affect Search inclusion or
  ranking.
- Reporting: AI feature clicks and impressions count in the Performance report
  under the Web search type. Google introduced a Search Generative AI
  performance report in June 2026 (impressions by page, country, device, date;
  no clicks or queries; shown only above an impressions threshold).

Sources:
- https://developers.google.com/search/docs/appearance/ai-features (last updated 2025-12-10)
- https://support.google.com/webmasters/answer/16908024 (Search generative AI control)
- https://developers.google.com/search/docs/crawling-indexing/control-what-you-share (last updated 2026-10-21)
- https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag (last updated 2026-03-24)
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide (last updated 2026-07-10)
- https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports
- https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers

## Helpful content and spam policies

- Helpfulness is assessed by core ranking systems; there is no separate
  helpful content update to recover from. Use Google's self-assessment
  questions: original information, first-hand expertise, a satisfying answer,
  content made for people rather than for search engines.
- Spam policies that matter most for audits: scaled content abuse, doorway
  abuse, site reputation abuse, expired domain abuse, keyword stuffing, hidden
  text, and misleading structured data.
- There is no keyword-density target and no ideal word count.
- **Back button hijacking** joined the malicious practices policy on April 13,
  2026: a site "interferes with user browser navigation by manipulating the
  browser history" so Back does not return the user to the previous page.
  Industry coverage of the announcement reports enforcement from June 15,
  2026, by manual action or automated demotion, and that included libraries
  or ad platforms can be the source. The offline audit flags the inline
  pattern for browser review.
- The site reputation abuse section is now titled **Site reputation policy**.
  On August 28, 2026 Google updated it for a change in enforcement approach
  inside the European Economic Area. Name the market when citing it.
- Review snippets: since July 24, 2026 the guidelines say "Don't include fake
  or undisclosed incentivized reviews on your page or in your structured data
  markup." Self-serving LocalBusiness and Organization reviews stay
  ineligible for stars.

Sources:
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/essentials/spam-policies (last updated 2026-08-28)
- https://developers.google.com/search/blog/2026/04/back-button-hijacking
- https://developers.google.com/search/blog/2026/08/update-site-reputation-policy
- https://developers.google.com/search/docs/appearance/structured-data/review-snippet (last updated 2026-09-08)
- Enforcement date as reported: https://ppc.land/google-sets-june-15-deadline-to-stop-hijacking-users-back-button/
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide

## Titles and snippets

- No fixed character limit for titles or meta descriptions; results truncate
  by device and query.
- Google may generate title links and snippets from page content.
- Character counts are preview diagnostics only.
- "Read more" deep links (documented April 20, 2026) jump from a snippet to a
  section. Google's tips: keep content immediately visible rather than behind
  tabs or expanders, do not force scroll position on load, and do not strip
  the URL hash fragment with history API calls on load.
- Preferred image (documented March 2, 2026): Google picks previews
  automatically but reads `primaryImageOfPage`, an image on the
  `mainEntity`/`mainEntityOfPage`, or `og:image` as preferences.

Sources:
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/appearance/snippet (last updated 2026-04-20)
- https://developers.google.com/search/docs/appearance/google-images (last updated 2026-03-02)

## Crawling limits and robots placement

- Googlebot for Google Search fetches the first **2MB** of HTML or another
  supported text file and the first **64MB** of a PDF. Each CSS or JavaScript
  resource has the same per-file limit. Past the limit "Googlebot stops the
  fetch and only sends the already downloaded part of the file for indexing
  consideration." Other Google crawlers default to 15MB unless they set their
  own limit. The offline audit flags HTML over 2,000,000 bytes and names the
  tags that fall past the cutoff.
- Google Search respects robots meta tags in the `<body>` as well as the
  `<head>` (note added 2026-03-24; behavior unchanged). Audit the whole
  document, not only the head.
- Site moves: use the Change of Address tool for every subdomain variant,
  including www and non-www (June 17, 2026).

Sources:
- https://developers.google.com/search/docs/advanced/crawling/googlebot (last updated 2026-02-03)
- https://developers.google.com/crawling/docs/crawlers-fetchers/overview-google-crawlers (last updated 2026-06-12)
- https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag

## Structured data: what earns a result in 2026

- Markup must describe visible content, use a supported type for the targeted
  feature, and include that feature's required properties. Valid markup
  creates eligibility, not a guarantee.
- **FAQ rich results ended on May 7, 2026** for all sites. The Search Console
  FAQ report and Rich Results Test support were scheduled for removal in June
  2026 and API support in August 2026. FAQPage remains valid schema.org
  vocabulary and Google may still read it to understand pages; it no longer
  produces a Google rich result.
- **HowTo rich results** were removed in 2023 (mobile first, then desktop). Do
  not recommend HowTo markup for a Google feature.
- **Retired in June 2025** (simplifying search results): Course Info, Claim
  Review, Estimated Salary, Learning Video, Special Announcement, Vehicle
  Listing. Book Actions was announced for retirement and later kept because
  some features still use it. Practice Problems was announced for deprecation
  with Search Console support for several retired types ending January 2026.
  Practice problem documentation was removed January 6, 2026; its markup is
  `Quiz`. FAQ documentation was removed June 15, 2026.
- **Sitelinks search box** (`WebSite` + `SearchAction`) stopped showing
  November 21, 2024. Google said unsupported markup like this "won't cause
  issues in Search" and need not be removed.
- The offline audit lists these retired types as info findings; none is a
  defect by itself.
- Gallery as of 2026-10-16 (25 features): Article, Breadcrumb, Carousel,
  Course list, Dataset, Discussion forum, Education Q&A, Employer aggregate
  rating, Event, Image metadata, Job posting, Local business, Math solver,
  Movie, Organization, Product, Profile page, Q&A, Recipe, Review snippet,
  Software app, Speakable, Subscription and paywalled content, Vacation
  rental, Video. Dataset markup serves Dataset Search only.
- Recent property additions: merchant listings document a sale window with
  `validFrom` plus `validThrough` or `priceValidUntil`, and `Product.category`
  as text or `CategoryCode` (July 7, 2026); `hasAdultConsideration` (May 20,
  2026); VideoObject `creator` (September 24, 2026); more Discussion Forum and
  QA Page properties for comment threads (March 24, 2026).
- Schema.org 30.0 (2026-03-19) and 30.1 (2026-09-16, EU Digital Product
  Passport vocabulary) add vocabulary only. A new schema.org type earns no
  Google feature until the gallery lists one.
- Validate with the Rich Results Test for Google features and the Schema.org
  Validator for vocabulary. Record which was used.

Sources:
- https://developers.google.com/search/docs/appearance/structured-data/search-gallery
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- https://developers.google.com/search/docs/appearance/structured-data/faqpage
- https://developers.google.com/search/updates (changelog: FAQ deprecated
  May 8, 2026 and removed June 15, 2026; practice problems removed January 6, 2026)
- https://developers.google.com/search/blog/2024/10/sitelinks-search-box
- https://schema.org/docs/releases.html
- https://developers.google.com/search/blog/2025/06/simplifying-search-results
- https://developers.google.com/search/blog/2023/08/howto-faq-changes

## Core Web Vitals

| Metric | Good | Needs improvement | Poor |
|---|---|---|---|
| LCP | 2.5 s or less | up to 4 s | over 4 s |
| INP | 200 ms or less | up to 500 ms | over 500 ms |
| CLS | 0.1 or less | up to 0.25 | over 0.25 |

Assessed at the 75th percentile of field data (CrUX), split by mobile and
desktop. INP replaced FID in March 2024. CWV is part of page experience, not a
standalone ranking guarantee.

Sources:
- https://web.dev/articles/vitals (fetched 2026-10-25; LCP, INP and CLS all
  listed Stable, and stable metrics change at most once a year with notice)
- https://developers.google.com/search/docs/appearance/core-web-vitals

## Search Console reporting added since late 2025

- Branded queries filter and custom chart annotations (November 2025);
  weekly and monthly views and social channels (December 2025); platform
  properties for social and video content (global, July 2026).
- **Multimodal** search type under Web (September 24, 2026): traffic from
  Lens, Circle to Search, image uploads and similar image searches. The data
  was not previously in Web totals, and the query dimension is unavailable
  with this filter. Note the launch date when a KPI baseline straddles it.

Sources:
- https://developers.google.com/search/blog/2025/11/search-console-branded-filter
- https://developers.google.com/search/blog/2025/11/custom-chart-annotations
- https://developers.google.com/search/blog/2025/12/weekly-monthly-views-search-console
- https://developers.google.com/search/blog/2026/07/platform-properties-social-video-guide
- https://developers.google.com/search/blog/2026/09/web-multimodal-in-sc
- https://support.google.com/webmasters/answer/7576553

## Bing and IndexNow

- Copilot grounds on the Bing index. Verify the site in Bing Webmaster Tools,
  submit sitemaps, and allow `Bingbot`.
- Bing Webmaster Tools AI Performance report (public preview February 2026):
  Copilot citations, cited pages, grounding queries.
- IndexNow pings participating engines when URLs change. Google does not
  participate; keep sitemaps accurate for Google.

Sources:
- https://www.bing.com/webmasters
- https://www.indexnow.org/

## Evidence boundary

Search Console, Bing Webmaster Tools, analytics, third-party SEO tools, and
live results measure different things. Name the source, market, scope, and
date. Unobserved results are `unknown`. Never turn a heuristic into a traffic,
ranking, citation, or conversion promise.
