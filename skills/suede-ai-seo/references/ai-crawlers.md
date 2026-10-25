# AI Crawler Policy

Every row below was checked against the operator's own documentation on
2026-10-25 (the "Verified" column). Source URLs are listed under the table and
in `sources.md`. Re-check before shipping a robots.txt change: operators add
and rename agents several times a year.

## User-agent reference

### Search and answer retrieval (blocking these costs citations)

| Token | Operator | Purpose | Blocking it means | Honors robots.txt | Verified |
|---|---|---|---|---|---|
| `Googlebot` | Google | Search crawling, including AI Overviews and AI Mode | Out of Google Search and its AI features | Yes | 2026-10-25 |
| `Bingbot` | Microsoft | Bing index, which grounds Copilot | Out of Bing and Copilot citations | Yes | 2026-10-25 |
| `OAI-SearchBot` | OpenAI | ChatGPT search index | Not shown in ChatGPT search answers (navigational links can remain) | Yes; about 24 hours to apply | 2026-10-25 |
| `Claude-SearchBot` | Anthropic | Indexes to improve Claude search results | Reduced visibility and accuracy in Claude search answers | Yes | 2026-10-25 |
| `PerplexityBot` | Perplexity | Surfaces and links sites; not used for model training | Not surfaced in Perplexity results | Yes; up to 24 hours | 2026-10-25 |
| `Meta-WebIndexer` | Meta | Improves Meta AI search results | Meta AI cannot cite and link the site | robots.txt controls it (Meta: allowing it lets Meta AI cite and link) | 2026-10-25 |
| `Amzn-SearchBot` | Amazon | Search experiences in Amazon products; not for generative AI training | Out of search experiences in Amazon products | Yes; no `Crawl-delay` support | 2026-10-25 |
| `Applebot` | Apple | Spotlight, Siri, and Safari search; Apple says data may also help train its foundation models | Out of Apple search features | Yes | 2026-10-25 |

### User-initiated fetchers (a person asked; robots.txt may not apply)

| Token | Operator | Purpose | Honors robots.txt | Verified |
|---|---|---|---|---|
| `ChatGPT-User` | OpenAI | Fetches when a user asks ChatGPT or a custom GPT; GPT Actions | May not apply; not used to decide search inclusion | 2026-10-25 |
| `Claude-User` | Anthropic | Fetches when a Claude user's question needs the web | Yes, per Anthropic; blocking it stops retrieval for users | 2026-10-25 |
| `Perplexity-User` | Perplexity | Fetches a page a user's question needs | Generally ignores robots.txt | 2026-10-25 |
| `Google-Agent` | Google | Agents on Google infrastructure that browse and act on a user's request (added 2026-03-20) | Generally ignores robots.txt (Google's user-triggered fetcher rule) | 2026-10-25 |
| `Google-GeminiNotebook` | Google | Fetches pages users add as sources in Gemini notebooks; replaced `Google-NotebookLM` in July 2026 | Generally ignores robots.txt | 2026-10-25 |
| `Meta-ExternalFetcher` | Meta | Fetches individual links at a user's request for agentic features | May bypass robots.txt | 2026-10-25 |
| `Amzn-User` | Amazon | User actions such as Alexa answers that need current information | May not follow all directives | 2026-10-25 |

### Training and model-use controls (the owner's licensing call)

| Token | Operator | Purpose | Blocking it means | Verified |
|---|---|---|---|---|
| `GPTBot` | OpenAI | Foundation-model training | Excluded from training; ChatGPT search unaffected | 2026-10-25 |
| `ClaudeBot` | Anthropic | Content that may be used for training | Future content excluded from training; supports `Crawl-delay` | 2026-10-25 |
| `Google-Extended` | Google | Token (no separate crawler) for Gemini training and grounding in Gemini Apps and Vertex AI | No Gemini training or grounding use; Google Search inclusion and ranking unaffected | 2026-10-25 |
| `Applebot-Extended` | Apple | Token (does not crawl) controlling whether Applebot data trains Apple generative models | Training opt-out; pages stay in Apple search results | 2026-10-25 |
| `Meta-ExternalAgent` | Meta | Training foundation models or improving products by indexing content directly | Excluded from that use | 2026-10-25 |
| `Amazonbot` | Amazon | Improves Amazon products and services; may be used to train Amazon AI models | Excluded from that crawl; Amazon says to email amazonbot@amazon.com for a training-specific opt-out, and honors `noarchive` as a training block | 2026-10-25 |
| `CCBot` | Common Crawl | Open corpus used by many model builders | Excluded from Common Crawl | 2026-10-23 (not rechecked) |

### Narrow-purpose agents (usually leave alone)

- `OAI-AdsBot` (OpenAI): visits only pages submitted as ChatGPT ads; data not
  used for training.
- `Google-CloudVertexBot`: crawls a site owner requests for Vertex AI Agents;
  no effect on Search.
- `GoogleOther`: generic Google research fetcher; rules for it affect no
  specific product.
- `Meta-ExternalAds`, `facebookexternalhit`: Meta ads and link previews.
  `facebookexternalhit` may bypass robots.txt for integrity checks.

`anthropic-ai` appears in older guides. Anthropic's current article names only
`ClaudeBot`, `Claude-SearchBot`, and `Claude-User`; an extra group for it is
harmless but optional.

Sources (all checked 2026-10-25):
- OpenAI: https://developers.openai.com/api/docs/bots (change feed: https://developers.openai.com/api/docs/bots/rss.xml)
- Anthropic: https://support.claude.com/en/articles/8896518
- Perplexity: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- Google crawlers (page updated 2026-10-15): https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- Google user-triggered fetchers (updated 2026-08-19): https://developers.google.com/crawling/docs/crawlers-fetchers/google-user-triggered-fetchers
- Google crawling changelog: https://developers.google.com/crawling/docs/changelog
- Apple: https://support.apple.com/en-us/119829
- Meta: https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/
- Amazon: https://developer.amazon.com/amazonbot

## Default Suede configuration for a brand that wants citations

Allow retrieval, decide training separately. Present the training lines as
the user's licensing decision, not a recommendation either way.

```text
# Search and answer retrieval: allow
User-agent: Googlebot
User-agent: Bingbot
User-agent: OAI-SearchBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Meta-WebIndexer
User-agent: Amzn-SearchBot
User-agent: Applebot
Allow: /

# Model training: the owner's call (shown here opted out)
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: Meta-ExternalAgent
User-agent: CCBot
Disallow: /

User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://example.com/sitemap.xml
```

A named group replaces the `*` group for that bot, so repeat any private-path
`Disallow` lines inside named groups if they must apply.

`Amazonbot` is left out of the training group on purpose: Amazon describes it
as product improvement that may include training, so blocking it may cost more
than training use. Decide it with the owner after reading Amazon's page.

## Google's Search generative AI control (Search Console)

Since 2026-08-31 every Search Console property has a setting at Settings >
Search generative AI: include (default), exclude, or inherit from the parent
property. Exclude removes the site's links and content as inputs to AI
Overviews, AI Mode, and generative AI features in Discover within one to two
days. Google says it is not a ranking or inclusion signal for the rest of
Search and does not affect AI training (that remains `Google-Extended`).

Audit it alongside robots.txt. A property set to exclude, or a child property
inheriting exclude from a domain property, explains a site that ranks in
classic results but never appears in AI Overviews or AI Mode. Excluded sites
also lose the Generative AI performance report.

Source (checked 2026-10-25): https://support.google.com/webmasters/answer/16908024

## CDN and host defaults (Cloudflare)

Cloudflare can change what AI agents see without the owner touching
robots.txt. Check the zone before trusting the origin file.

- **Managed robots.txt (Bot Preference Sync).** When on and any Search, Agent,
  or Training policy is set to block, Cloudflare prepends a managed block to
  the served robots.txt, or creates the file if the origin has none. The
  managed block disallows `Amazonbot`, `Applebot-Extended`, `Bytespider`,
  `CCBot`, `ClaudeBot`, `Google-Extended`, `GPTBot`, and `meta-externalagent`.
  Fetch the live `/robots.txt` from the edge, not the repo copy.
- **Content Signals.** The managed file can carry `search`, `ai-input`, and
  `ai-train` values (default `search=yes, ai-train=no`, plus an experimental
  `use=reference`). These state preferences; no answer-engine operator
  documents reading them as of this check. Search Console may flag the line as
  "Syntax not understood"; Cloudflare reports no crawl effect.
- **AI Crawl Control.** Per-crawler Allow or Block actions enforced at the
  edge, plus robots.txt compliance tracking. A Block here returns errors to
  `OAI-SearchBot` or `PerplexityBot` even when robots.txt allows them.
- **Pay per crawl.** Listed as a private beta in Cloudflare's docs (page
  updated 2026-08-14). Treat it as a licensing option for training crawlers,
  never for the retrieval agents a brand needs for citations.

Cloudflare announced on 2025-07-01 that it was changing its default to block
AI crawlers. Its current docs do not state the default for a new zone, so read
the zone's actual settings rather than assuming either way.

Sources (checked 2026-10-25):
- https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/ (updated 2026-10-22)
- https://developers.cloudflare.com/ai-crawl-control/
- https://blog.cloudflare.com/content-independence-day-no-ai-crawl-without-compensation/

## Other checks robots.txt cannot answer

- WAF or bot-management rules on other CDNs returning 403 or challenges.
  Perplexity recommends matching both user-agent string and published IP
  ranges in WAF rules, and refreshing those IP lists on a schedule.
- `noindex`, `nosnippet`, `max-snippet:0`, or `data-nosnippet` on key content.
- Content that only renders after client-side JavaScript. Several AI fetchers
  do not execute JavaScript; compare raw HTML with the rendered DOM.
- Login walls, cookie walls, and geo-blocks on the pages you want cited.

## Verification steps

1. Fetch `/robots.txt` (and each relevant subdomain's) from the public edge and
   record status. Anthropic and Amazon both apply rules per host.
2. Classify each retrieval and user-fetch token above as allowed, blocked, or
   unverified.
3. Check the Search Console Search generative AI setting and any CDN bot
   policies.
4. Grep server or CDN logs for each user agent over 30 days; confirm 200s on
   priority pages. Verify IPs against the operator's published list before
   trusting a UA string. Published lists: openai.com/searchbot.json,
   claude.com/crawling/bots.json, perplexity.com/perplexitybot.json, Google's
   `/crawling/ipranges` files, developer.amazon.com/amazonbot/ip-addresses/.
5. Re-check 24 to 48 hours after any change.
