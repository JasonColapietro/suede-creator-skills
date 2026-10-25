# Platform Notes: How Each Answer Engine Finds Sources

Verified against primary documentation on 2026-10-25 unless marked otherwise.
Answer engines change retrieval, crawlers, and reporting often. Re-check the
linked source before a client deliverable states any of this as current.

Only documented behavior belongs here. Third-party "ranking factor" studies
(domain-authority weights, freshness multipliers, citation shares by site) are
correlational, usually vendor-funded, and rarely reproducible. Do not quote
them as facts.

## Google AI Overviews and AI Mode

- Rooted in core Search ranking and quality systems. "There are no additional
  requirements to appear in AI Overviews or AI Mode, nor other special
  optimizations necessary."
- Eligibility: indexed and eligible to show with a snippet. Indexing and
  serving are not guaranteed.
- Query fan-out: both may issue multiple related searches across subtopics and
  data sources, which can surface a wider set of supporting links than classic
  results. AI Overviews show only when judged additive and often do not trigger.
  AI Mode and AI Overviews can use different models, so links differ.
- Google's optimization guide (last updated 2026-07-10): no special schema,
  AI text files, markup, or Markdown needed; no need to break content into tiny
  pieces; no special writing style; mass-producing pages to manipulate rankings
  or AI responses violates the scaled content abuse policy. It also warns about
  tools claiming access to internal Google metrics.
- Recommended fundamentals: allow crawling (robots.txt and the CDN or host
  layer), internal links, good page experience, important content in text,
  structured data that matches visible text, current Merchant Center and
  Business Profile data for commerce and local.
- Controls: `nosnippet`, `data-nosnippet`, `max-snippet`, `noindex` limit what
  appears. `Google-Extended` controls Gemini training and grounding in Gemini
  Apps and Vertex AI; Google says it does not affect Search inclusion or
  ranking and is not a Search ranking signal.
- Search Console control (all sites since 2026-08-31): Settings > Search
  generative AI lets a property include (default), exclude, or inherit.
  Exclude removes the site's links and content as inputs to AI Overviews,
  AI Mode, and generative AI features in Discover within one to two days.
  Google says it is not a ranking or inclusion signal for the rest of Search
  and does not touch training (`Google-Extended` does). The optimization guide
  now lists being included in this setting as an eligibility condition.
- Reporting: AI feature traffic is still counted in the Performance report
  under search type Web. The Generative AI performance report (Search),
  announced 2026-06-03 and rolled out to all sites worldwide as of
  2026-08-31, shows impressions only (links to the site shown in AI Overviews
  or AI Mode), with Pages, Countries, Devices, and Dates tabs and a search-type
  filter for "Web: text-based" and "Web: multimodal" (Lens, Circle to Search).
  No clicks or queries. Search Labs experiments are excluded. The chart counts
  one impression per property per feature; page rows count per page, so totals
  differ. Low-impression sites can see an empty report, and excluded sites get
  none. A matching Discover report shows generative AI impressions in Discover.
- Agentic experiences: Google names the Universal Commerce Protocol (UCP) as
  emerging, not a current requirement. See `agent-readiness.md` for UCP
  checkout status, the `Google-Agent` fetcher, and WebMCP.

Sources:
- https://developers.google.com/search/docs/appearance/ai-features (page updated 2025-12-10)
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide (updated 2026-07-10)
- https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports
- Generative AI performance report (Search): https://support.google.com/webmasters/answer/16984139
- Generative AI performance report (Discover): https://support.google.com/webmasters/answer/16983858
- Include or exclude from Search generative AI features: https://support.google.com/webmasters/answer/16908024
- https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers

## ChatGPT search (OpenAI)

- `OAI-SearchBot` determines whether a site can appear in ChatGPT search
  answers. Sites opted out "will not be shown in ChatGPT search answers, though
  can still appear as navigational links."
- `GPTBot` is for foundation-model training. Blocking it does not remove a site
  from ChatGPT search.
- `ChatGPT-User` handles user-initiated fetches; robots.txt may not apply and it
  does not decide search inclusion.
- `OAI-AdsBot` validates pages submitted as ChatGPT ads only.
- robots.txt changes take about 24 hours to apply.
- OpenAI's publisher FAQ says ChatGPT adds `utm_source=chatgpt.com` to
  referral URLs from search results. Confirm in your own GA4 data; clicks from
  other ChatGPT surfaces or apps may arrive untagged.
- Shopping: merchants send product feeds (CSV or JSON, daily snapshot plus API
  updates) under the Agentic Commerce Protocol. Feed onboarding and Instant
  Checkout are limited to approved partners who apply at chatgpt.com/merchants.
  OpenAI says optional attributes such as rich media and reviews can improve
  ranking and relevance; it publishes no other ranking guidance. Details in
  `agent-readiness.md`.

Sources:
- https://developers.openai.com/api/docs/bots
- https://help.openai.com/en/articles/12627856
- https://developers.openai.com/commerce/guides/key-concepts

## Claude (Anthropic)

- `ClaudeBot`: collects content that may be used for model training.
- `Claude-SearchBot`: indexes content to improve search result quality;
  blocking it may reduce visibility in Claude's search answers.
- `Claude-User`: fetches pages when a user asks Claude a question; blocking it
  prevents retrieval for user queries.
- All honor robots.txt per Anthropic; IP blocking is not a reliable opt-out.
  Each subdomain needs its own robots.txt. Verify source IPs against Anthropic's
  published list.
- Anthropic does not publish which search index backs Claude's web search. Do
  not claim one.

Source: https://support.claude.com/en/articles/8896518

## Perplexity

- `PerplexityBot` surfaces and links sites in Perplexity results and is not used
  to crawl content for AI foundation models. Perplexity recommends allowing it.
- `Perplexity-User` fetches for user questions and generally ignores robots.txt.
- Changes may take up to 24 hours.

Source: https://docs.perplexity.ai/docs/resources/perplexity-crawlers

## Microsoft Copilot and Bing

- Copilot grounds answers on the Bing index; a page Bing has not indexed cannot
  be cited there. Verify the site in Bing Webmaster Tools, submit sitemaps, and
  allow `Bingbot`.
- Bing Webmaster Tools AI Performance (public preview since 2026-02-10)
  covers Microsoft Copilot, AI-generated summaries in Bing, and select partner
  integrations. Metrics: Total Citations, Average Cited Pages (daily unique
  pages cited), a sample of grounding queries, page-level citation counts, and
  trends. Microsoft states these do not indicate ranking or page importance.
- June 16, 2026 preview additions: Intents (grounding queries grouped as
  Informational, Commercial, Navigational, Learn and Solve, Research,
  Creation, Local), Topics, Citation Share (the site's percentage of all
  citations shown for the same grounding query; competitor domains are not
  exposed), and Compare (overlay a prior period).
- October 13, 2026: Topics Portfolio (beta) clusters grounding queries and
  lists Top Opportunity Queries where other sites are cited and yours is not.
  Shown only with sufficient data; Microsoft calls the numbers directional.
- Microsoft's posts do not mention export or an API. Check the interface.
- IndexNow notifies participating engines (including Bing) of changed URLs.
  Google does not participate.

Sources:
- https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/
- https://blogs.bing.com/search/June-2026/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare
- https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/
- https://www.bing.com/webmasters
- https://www.indexnow.org/

## Apple, Meta, and Amazon assistants

None of these publish a citation or reporting program for site owners. What
is documented is crawler control (see `ai-crawlers.md`):

- Apple: `Applebot` powers Spotlight, Siri, and Safari search;
  `Applebot-Extended` is a non-crawling token for opting out of generative
  model training without leaving search.
- Meta: `Meta-WebIndexer` lets Meta AI cite and link; `Meta-ExternalAgent` is
  the training and product-indexing crawler; `Meta-ExternalFetcher` handles
  user-requested fetches.
- Amazon: `Amzn-SearchBot` for search experiences (not training), `Amzn-User`
  for live Alexa-style user requests, `Amazonbot` for product improvement that
  may include training.

Sources: https://support.apple.com/en-us/119829,
https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/,
https://developer.amazon.com/amazonbot (all checked 2026-10-25)

## Gemini app

- Grounds on Google Search. `Google-Extended` opts content out of Gemini
  training and Gemini Apps grounding without touching Search.
- Pages users add to Gemini notebooks are fetched by `Google-GeminiNotebook`
  (formerly `Google-NotebookLM`), which generally ignores robots.txt.

## What this means for prioritization

1. Google: classic SEO plus original, people-first content. No AI-only tactics.
2. ChatGPT: allow `OAI-SearchBot`; earn corroboration on sites ChatGPT cites.
3. Copilot: Bing indexation and IndexNow; read AI Performance, Citation Share,
   and Topics Portfolio opportunity queries.
4. Perplexity and Claude: allow their search and user agents; publish quotable,
   sourced passages.
5. Everywhere: one consistent entity and third-party consensus.
