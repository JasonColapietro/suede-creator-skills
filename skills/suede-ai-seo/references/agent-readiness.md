# Agent Readiness: Sites That Agents Can Use, Not Just Quote

Answer engines now send agents that browse, fill forms, and buy on a user's
behalf. This lane covers what the operators themselves document. Checked
2026-10-25. Everything here is early-stage: present it as optional work after
layers 1 to 5, and never as a ranking or citation requirement.

Google's own optimization guide says to look at agent-friendly practices only
if the topic fits the business. Most service brands need none of the commerce
pieces below.

## 1. Let the agents in

User-triggered agents generally ignore robots.txt because a person asked for
the fetch, so access problems show up at the CDN or WAF instead.

| Agent | Operator | Identify it by |
|---|---|---|
| `Google-Agent` | Google | UA contains `compatible; Google-Agent`; IPs in Google's `user-triggered-agents.json`; Google is experimenting with Web Bot Auth under the `agent.bot.goog` identity |
| `ChatGPT-User` | OpenAI | openai.com/chatgpt-user.json |
| `Claude-User` | Anthropic | claude.com/crawling/bots.json |
| `Perplexity-User` | Perplexity | perplexity.com/perplexity-user.json |
| `Meta-ExternalFetcher` | Meta | UA string; see Meta's crawler page for current guidance |
| `Amzn-User` | Amazon | developer.amazon.com/amazonbot/live-ip-addresses/ |

Check that bot-management rules do not challenge these on pricing, product,
booking, and contact pages. A CAPTCHA on the checkout path stops every agent.

## 2. Make pages operable (web.dev guidance)

Google's web.dev article "Build agent-friendly websites" (last updated
2026-04-01) recommends:

- Avoid ghost elements (hidden or overlapping controls that intercept clicks).
- Use semantic HTML: real `<button>` and `<a>`, labels tied to inputs with
  `for`.
- Use CSS for visual cues such as `cursor: pointer` on clickable elements.
- Meet minimum sizes so controls are readable in screenshots.
- Keep layouts stable between pages and states.
- Create WebMCP tools (below).

Google's line: everything that makes a site agent-ready also makes it better
for people. Hand the accessibility and markup work to `suede-seo-audit` or
the site's developers; this skill only flags it.

## 3. WebMCP (experimental)

WebMCP is a proposed web standard that lets a page declare tools and state so
an in-browser agent does not have to guess what a control does. Chrome opened
an origin trial in Chrome 149 (Chrome Developers blog, 2026-06-09). The spec
lives as an explainer on GitHub; it is not a finished standard and no answer
engine has said it affects citations.

Recommend it only for products where agents completing a task (search a
catalog, book, configure) is a real business goal, and only behind the origin
trial with the tool security guidance Chrome links from the post.

## 4. Agentic commerce feeds

### ChatGPT (OpenAI Agentic Commerce Protocol)

- Product feeds in CSV or JSON: identifiers, descriptions, price, inventory,
  media, fulfillment. OpenAI recommends a full daily file plus API updates
  during the day; promotions go through the API only.
- Instant Checkout runs inside ChatGPT, but checkout state and payment stay on
  the merchant's systems. OpenAI is not the merchant of record. Payments use
  the Delegated Payment Spec; Stripe's Shared Payment Token is the first
  compatible implementation.
- Building with ACP is open; feed onboarding and Instant Checkout are limited
  to approved partners who apply at chatgpt.com/merchants.
- Prohibited categories include adult, age-restricted, prescription-only, and
  weapons products.
- Ranking guidance from OpenAI is one sentence: optional attributes such as
  rich media, reviews, and performance signals can improve ranking, relevance,
  and trust. Do not claim more.

Sources: https://developers.openai.com/commerce,
https://developers.openai.com/commerce/guides/get-started,
https://developers.openai.com/commerce/guides/key-concepts

### Google (Universal Commerce Protocol)

- UCP checkout is an early access program, gradually available in the United
  States for U.S. products; Google says Australia and Canada are expected
  next year.
- Merchants configure and test in the UCP integration hub in Merchant Center
  (or the Direct API path) after submitting an interest form.
- Only listings with the `native_commerce(checkout_eligibility)` attribute show
  the Buy now button.
- Google's AI optimization guide calls UCP emerging, not required.

Source: https://developers.google.com/merchant/ucp/guides (updated 2026-10-19)

### Readiness checklist for a merchant

| Check | Pass condition |
|---|---|
| Feed parity | Feed price, availability, and variants match the live product page on the same day |
| Merchant Center | Products approved and Business Profile current (both named in Google's AI features guidance) |
| Agent access | User-triggered agents reach product and checkout pages without challenges |
| Program status | Applied or waitlisted for ChatGPT merchants and UCP early access, or a recorded decision not to |
| Measurement | Orders from agent checkouts tagged separately where the platform reports them |

## Output line

Add to the report when this lane runs:

```text
AGENT READINESS: agent fetchers [reachable | challenged: which | unverified] | operability [issues | none found] | ChatGPT feed [live | applied | not applicable] | UCP [live | applied | not applicable] | WebMCP [trial | not applicable]
```

## Not verified (do not present as fact)

- NLWeb and any engine reading it.
- Any engine reading `llms.txt`, Cloudflare Content Signals, or WebMCP tools
  as a citation input.
- Google's Agent Payments Protocol (AP2) status in Google Search or Gemini;
  the 2025 Google Cloud announcement exists, but no current Search doc names
  it.
