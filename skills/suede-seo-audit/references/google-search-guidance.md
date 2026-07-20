# Current Google Search Guidance

Use this reference before applying SEO, AEO, generative-search, metadata, or
structured-data findings. It records the primary-source baseline verified on
2026-07-19. Re-check the linked documentation when the current rule affects a
ship decision.

## Generative search

Google Search states that its generative features rely on the same foundational
SEO practices as ordinary Search.

- Google Search does not use `llms.txt` or similar AI text files for visibility
  or ranking. Such a file may serve another explicitly documented consumer,
  but its presence is neutral for Google Search.
- No AI-specific schema or markup is required.
- There is no requirement to split content into tiny chunks or rewrite it for
  AI systems.
- Write useful, accessible, sourceable content for people. Do not create
  repetitive variants for every synonym or long-tail query.

Source: [Google's guide to optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

## Keywords and content length

- Google defines unnatural repetition intended to manipulate rankings as
  keyword stuffing.
- There is no universal keyword-density target or ideal page length.
- Evaluate whether the page uses the entity and subject language naturally and
  answers the reader's intent. Do not prescribe repetitions per 1,000 words.

Sources:

- [Spam policies for Google web search](https://developers.google.com/search/docs/essentials/spam-policies)
- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

## Titles and snippets

- The HTML `title` element and meta description have no fixed Google character
  limit. Search results truncate them as needed for the device and query.
- Google may generate title links and snippets from page content and other
  signals instead of using the supplied fields verbatim.
- Character counts are useful preview diagnostics, not pass/fail ranking rules.

Sources:

- [Influencing title links](https://developers.google.com/search/docs/appearance/title-link)
- [Controlling snippets](https://developers.google.com/search/docs/appearance/snippet)

## Structured data

- Markup must represent visible page content, use a supported type when Google
  Search appearance is the goal, and satisfy that feature's required fields.
- Valid markup creates eligibility; it does not guarantee a rich result.
- FAQ rich results are generally limited to authoritative government and health
  sites. Do not promise FAQ visibility to ordinary product or marketing sites.
- Use the Rich Results Test for Google eligibility and Schema.org Validator for
  general vocabulary/shape checks. Record which validator was used.

Sources:

- [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google-supported structured data features](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)
- [FAQ and HowTo search appearance changes](https://developers.google.com/search/blog/2023/08/howto-faq-changes)

## Evidence boundary

Search Console, analytics, third-party SEO tools, and live SERPs measure
different things. Name the source, market, scope, and date. If a metric or
result was not observed, mark it unknown. Never convert a heuristic into a
traffic, ranking, citation, or conversion promise.
