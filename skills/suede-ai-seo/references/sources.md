# Sources

Primary sources behind the claims in this skill. Checked 2026-10-25 unless
noted. Re-check before any client deliverable quotes a rule as current.

## Google

- AI features and your website (AI Overviews, AI Mode, eligibility, controls,
  reporting): https://developers.google.com/search/docs/appearance/ai-features
- Optimizing for generative AI features (no special files, no chunking, scaled
  content abuse; last updated 2026-07-10):
  https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Search Generative AI performance reports in Search Console (announced June
  2026): https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports
- Generative AI performance report (Search), rolled out to all sites as of
  2026-08-31: https://support.google.com/webmasters/answer/16984139
- Generative AI performance report (Discover):
  https://support.google.com/webmasters/answer/16983858
- Include or exclude a site from Search generative AI features (Search
  Console setting, all sites as of 2026-08-31):
  https://support.google.com/webmasters/answer/16908024
- Google user-triggered fetchers, including `Google-Agent` and
  `Google-GeminiNotebook`:
  https://developers.google.com/crawling/docs/crawlers-fetchers/google-user-triggered-fetchers
- Google crawling changelog: https://developers.google.com/crawling/docs/changelog
- Build agent-friendly websites (web.dev, updated 2026-04-01):
  https://web.dev/articles/ai-agent-site-ux
- WebMCP origin trial in Chrome 149 (2026-06-09):
  https://developer.chrome.com/blog/ai-webmcp-origin-trial
- Universal Commerce Protocol merchant guides (updated 2026-10-19):
  https://developers.google.com/merchant/ucp/guides
- Google common crawlers, including Google-Extended:
  https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- FAQ rich results ended May 7, 2026 (notice on the FAQPage doc; direct fetch
  was blocked during this check, confirmed via secondary coverage at
  https://www.techwyse.com/news/ai-search/google-faq-rich-results-deprecated-2026):
  https://developers.google.com/search/docs/appearance/structured-data/faqpage
- Spam policies (scaled content abuse, doorway abuse, site reputation abuse):
  https://developers.google.com/search/docs/essentials/spam-policies
- Organization structured data:
  https://developers.google.com/search/docs/appearance/structured-data/organization

## Answer-engine crawlers

- OpenAI: https://developers.openai.com/api/docs/bots
- Anthropic: https://support.claude.com/en/articles/8896518
- Perplexity: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- Apple: https://support.apple.com/en-us/119829
- Meta: https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/
- Amazon: https://developer.amazon.com/amazonbot

## OpenAI commerce and referrals

- Publishers and developers FAQ (`utm_source=chatgpt.com`):
  https://help.openai.com/en/articles/12627856
- Agentic Commerce Protocol and product feeds:
  https://developers.openai.com/commerce,
  https://developers.openai.com/commerce/guides/get-started,
  https://developers.openai.com/commerce/guides/key-concepts

## CDN

- Cloudflare managed robots.txt and Content Signals (updated 2026-10-22):
  https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/
- Cloudflare AI Crawl Control (pay per crawl listed as private beta):
  https://developers.cloudflare.com/ai-crawl-control/

## Microsoft

- AI Performance public preview (2026-02-10):
  https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/
- Intents, Topics, Citation Share, Compare (2026-06-16):
  https://blogs.bing.com/search/June-2026/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare
- Topics Portfolio beta (2026-10-13):
  https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/
- Bing Webmaster Tools: https://www.bing.com/webmasters
- IndexNow: https://www.indexnow.org/

## Research

- Generative engine optimization research (KDD 2024), which tested content
  edits against generative engines and found that adding citations, quotations,
  and statistics improved source visibility while keyword stuffing did not:
  https://arxiv.org/abs/2311.09735
  Use the direction of the finding. Its benchmark and engines predate current
  products, so do not quote its percentages as current lifts.

## Not verified

- `llms.txt` support: no major engine operator documents reading it as of this
  check. Google states Search does not use it. Vendor reports claiming adoption
  cite no primary statements.
- OKF ingestion by any answer engine: none announced.
- Cloudflare Content Signals (`search`, `ai-input`, `ai-train`): no engine
  operator documents honoring them.
- NLWeb: not checked against a primary source in this pass.
- Google AP2 (agent payments) inside Search or Gemini: no current Search doc
  names it.
- Export or API for Bing AI Performance: not mentioned in Microsoft's posts.
- `CCBot` row in `ai-crawlers.md`: last checked 2026-10-23.
