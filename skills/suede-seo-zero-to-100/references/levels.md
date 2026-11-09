# The Suede 0-100 Search Ladder: Level Checklists

Each level has a **gate**: the observable evidence that proves it is done. A
subject sits at the highest level whose gate AND every lower gate pass. A
missed lower gate is fixed first, because everything above it leaks.

## Contents
- L0 Exist
- L10 Indexed
- L20 Own your name
- L30 Demand map
- L40 Pages that deserve to rank
- L50 Measurement baseline
- L60 Win the click (title testing)
- L70 Climb (page 2 to page 1)
- L80 Authority
- L90 AI answers
- L100 Compounding system

---

## L0 Exist

- A domain the subject controls (not only a social profile or marketplace page).
  People: `firstnamelastname.com` or name + craft. Brands: the brand domain.
- HTTPS, loads under ~2.5s LCP on mobile, renders real text in HTML (not only
  inside images or a client-only JS app).
- `robots.txt` does not block the site; no sitewide `noindex` (common on new
  Squarespace/Wix/Webflow sites: "hide from search engines" toggles, password
  pages, staging domains).
- A home page that says in plain words who/what this is, for whom, and where.

**Gate:** home page fetches 200, indexable, and its first screen names the
entity and what it does.

## L10 Indexed

- Verify the domain in **Google Search Console** (domain property via DNS) and
  **Bing Webmaster Tools** (import from GSC; Bing powers Copilot and
  DuckDuckGo results).
- Submit the XML sitemap in both. Use URL Inspection on the home page and key
  pages; Request indexing.
- Install analytics (GA4, Plausible, or similar) and mark the conversion event
  (booking, signup, purchase, lead form).
- Check `site:domain.com` after a few days. New sites take days to weeks.

**Gate:** GSC shows the key pages as "Indexed" and the sitemap as "Success".

## L20 Own your name

The query someone types after hearing about you. Losing it loses warm demand.

- Home `<title>` leads with the exact name ("Maria Ortiz Photography | Austin
  Wedding Photographer"), and the About page tells the real story with a
  real photo.
- `Organization` or `Person` (or `LocalBusiness`) JSON-LD with `name`, `url`,
  `logo`/`image`, and `sameAs` linking every official profile.
- Consistent name, bio line, and link on every profile (Instagram, LinkedIn,
  YouTube, TikTok, GitHub, Crunchbase, directories). Each profile links back.
- Local businesses: claim and complete **Google Business Profile** (category,
  service area, hours, photos, services) and Apple Business Connect / Bing Places.
  Keep NAP (name, address, phone) identical everywhere.
- Knowledge panel: when one appears, claim it via Google's verification flow.
  Wikipedia/Wikidata only if the subject meets their notability rules; never
  self-create promotional entries.

**Gate:** searching the exact name returns the subject's site at #1 and their
profiles across most of page 1.

## L30 Demand map

- List the jobs the audience searches for: problems, services, comparisons,
  "near me"/city, price, how-to, templates, alternatives.
- Gather queries from GSC (if any data), autocomplete, People Also Ask,
  competitors' ranking pages, customer language (sales calls, reviews, DMs).
- Classify intent (know / do / buy / local / navigational) by looking at what
  ranks today. The SERP is the spec.
- Assign **one primary intent per URL**. Two URLs for one intent is
  cannibalization; merge or differentiate.
- Prioritize by: business value × winnability (who ranks, how strong) × effort.
  For a new site, start with long-tail and local queries the big players ignore.

**Gate:** a table of intent → URL (existing or planned) → priority, with no
intent mapped to two URLs.

## L40 Pages that deserve to rank

- Money pages first (services, product, pricing, location pages), then
  supporting content that links to them.
- Each page: title (L60 rules), meta description, one H1, a first paragraph that
  answers the query, proof (real photos, examples, numbers, reviews,
  credentials), FAQs that match PAA questions, relevant schema
  (`Product`, `Service`, `LocalBusiness`, `FAQPage` where eligible, `Article`
  with author).
- Internal links: every new page linked from at least 2-3 relevant pages with
  descriptive anchor text; money pages reachable from the home page in one click.
- E-E-A-T signals: named author or owner, real experience, contact info,
  policies.
- Run `suede-seo-audit` on each money page before calling it done.

- Conversion path on every money page: one clear action (book, buy, start
  trial, inquire), prices or starting prices where the market expects them, a
  short form, and a "how did you find us" field. Local and personal brands:
  reply to inquiries the same day; that is where search traffic becomes bookings.

**Gate:** every priority intent has a live, indexed page that passes the audit
without blocking issues, and organic conversions are tracked.

## L50 Measurement baseline

- Wait for data: GSC needs ~2-4 weeks of impressions before CTR and position
  mean much. Do not run title tests on a site with no impressions.
- Export 28 days (and 3 or 16 months if available) of Pages and Queries.
- Record a baseline scorecard: total clicks, impressions, avg position, brand vs
  non-brand split, top pages, conversions from organic.
- Connect the data: GSC connector or API for Claude, or CSV exports on a fixed
  cadence. Store snapshots so later reads compare like with like.

**Gate:** a dated baseline exists and the team knows where fresh data comes from.

## L60 Win the click

Run the protocol in `references/title-testing.md` and the scripts.

**Gate:** at least one full test cycle read with the verdict script, the log
started, winners kept, losers reverted.

## L70 Climb (position ~8-30)

- For each page in the band: compare against the top 3 results. What do they
  cover that this page does not? Which intent do they serve?
- Refresh: add missing sections, real examples, original data, better visuals,
  updated facts; tighten the intro to answer fast.
- Consolidate thin or overlapping pages with 301s; update internal links.
- Add internal links from strong pages (high impressions/backlinks) with
  relevant anchors.
- Re-read at 4-8 weeks. Content moves slower than titles.

**Gate:** the page-2 list shrinks cycle over cycle; refreshed pages gain position.

## L80 Authority

Links and mentions from real, relevant places. Earn them:
- digital PR with a genuine story or original data; journalist request platforms
  (respond with real expertise);
- partners, suppliers, clients, venues, podcasts, associations, local press,
  university or community programs;
- linkable assets: free tools, templates, calculators, original research,
  galleries, guides others cite;
- reviews (Google, industry sites) with a steady, honest ask after delivery;
- unlinked brand mentions turned into links with a polite request.

Out of scope: buying links, private blog networks, link exchanges at scale,
fake reviews, review gating. They violate Google's spam policies and can
erase rankings.

**Gate:** referring domains and branded search volume trend up quarter over
quarter.

## L90 AI answers (AEO / GEO)

AI Overviews, ChatGPT search, Perplexity, Gemini, Copilot, and Claude cite pages
they can parse and trust.
- Answer-first blocks: a 40-60 word direct answer under question-style headings.
- Facts that can be quoted: numbers with sources, definitions, comparison tables.
- Entity consistency: same name, description, and `sameAs` everywhere (L20).
- Crawl access for the AI search crawlers you want cited by: OAI-SearchBot
  (ChatGPT search), Claude-SearchBot, PerplexityBot, Bingbot (Copilot).
  Training crawlers are a separate choice: GPTBot, ClaudeBot, and the
  Google-Extended token (Gemini training and grounding). AI Overviews use
  normal Googlebot crawling, so blocking Google-Extended does not remove you
  from them.
- Optional `llms.txt` summarizing key pages.
- Test: ask 5-10 target questions in 3+ assistants; record whether the subject
  is cited and which page. Repeat monthly.
- Run `suede-visibility-grader` for the AI-readiness grade.

**Gate:** the subject is cited for at least some target questions and the
monthly check is on the calendar.

## L100 Compounding system

- Weekly: new title cohort live, last cohort read, log updated.
- Monthly: page-2 refresh batch, AI-citation check, decay scan (pages losing
  clicks 3 months running get refreshed first), new content from the demand map.
- Quarterly: re-run the demand map, authority push, full `suede-seo-audit` on
  money pages, review organic conversions (not just clicks).
- Scale patterns that won: programmatic pages only when each page has unique,
  useful data (locations, integrations, templates); never doorway pages.

**Gate:** the cadence runs without the strategist re-explaining it, and organic
conversions grow.
