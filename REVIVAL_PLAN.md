# Neglected Sites Revival Plan

A traffic + discoverability plan for the Johnny Suede / Jason Colapietro project
constellation, produced from a portfolio-wide audit (June 2026). Goal: give the
neglected, near-zero-traffic sites a *place* to live and a realistic path to
real visitors — without breaking anything live or disturbing work in progress.

## The diagnosis (in plain language)

The portfolio is **one bright star and a field of dark ones.**

- **`guitar.solutions` (The Signal Chain) is the only healthy asset.** It is fully
  indexed, ranks #1 for its own brand and player-tone long-tail, has a $19.99
  product, and is the only property with real traffic and crawl authority.
- **Every other site is an unlinked island.** The Top 100 Pedals list, iOS App
  Dev Skills, this Suede Creator Skills site, the Tokenmaxxing essay, and
  Anti-Slop Templates are effectively *unindexed* and rank for nothing.

The problem is **not** on-page quality — this skills site already has strong
JSON-LD, canonicals, and OG cards on every page. The problem is **isolation**:
near-zero interlinking, no backlinks, no directory placement, and no AI-engine
surface (no `llms.txt`). The one site with authority passes none of it to its
siblings.

**The strategy is a hub-and-spoke "constellation":** treat `guitar.solutions` as
the authority anchor and traffic donor, wire the islands to it and to each
other, place each island inside the directories that already rank, and optimize
for AI-answer citation instead of fighting saturated head-term SERPs.

> Reality check baked into this plan: do **not** chase "rank #1" for *best
> guitar pedals*, *claude code skills*, or *is AI a bubble* — Fortune,
> GuitarPlayer, and the curated awesome-lists own those. Win the long-tail and
> the AI-answer layer instead.

## Per-site plan

| Site | Status | Priority | The move |
|---|---|---|---|
| **The Signal Chain** (`guitar.solutions`) | Healthy anchor | P0 | Use as hub + authority donor, never "revive." Add a crawlable *Gear & Pedals* section and in-chapter contextual links pointing OUT to the pedals list and the rest of the constellation. |
| **Top 100 Pedals list** | Zero-volume, highest upside | P0 | Deploy to a real indexable URL — ideally `guitar.solutions/top-100-pedals` so it inherits domain authority. Per-pedal anchors + "why ranked" + ItemList schema. Lead with the contrarian "list the press won't print" hook. |
| **Tokenmaxxing essay** | Zero-volume, *live news wave* | P0 | Timing is the whole game — "tokenmaxxing" is peaking now. Distribution beats SEO: cross-post to the Substack, submit to HN / r/artificial / r/OpenAI **this week**. Add title/H1/Article schema + a themed brand URL. |
| **Suede Creator Skills** (this repo) | Zero-volume, strong on-page | P1 | Traffic *recipient* first. Ship `llms.txt` + the `projects.html` hub (done — see below). Real unlock is off-page: a backlink from `guitar.solutions` + PRs to awesome-claude-skills directories. |
| **iOS App Dev Skills** | Zero-volume, brand-new | P1 | Launch hygiene: set GitHub Topics + homepage URL, rewrite README around the *"website/PWA → iOS App Store via Capacitor"* wedge, enable Pages, submit to skill directories, earn first stars. |
| **Anti-Slop Templates** | Zero-volume, contested niche | P2 | Pick ONE canonical repo home, ship a live demo page (Folio + Suede terminal), lead the README with the genuine *"no build, copy one HTML file"* wedge, add Topics, submit to design-resource directories. |

## What shipped in THIS repo (additive, non-breaking)

These are the safe changes made on the revival branch. None touch the
work-in-progress homepage (`docs/index.html` / `docs/dav/`) or any existing page
body — they are new files plus one appended sitemap entry.

- **`docs/llms.txt`** — an AI-engine discoverability surface (the `/llms.txt`
  convention). Indexes the skills, the founder/company, and every sibling
  project so AI answer engines can learn and cite the constellation. This site's
  own skills preach AI EO; now it practices it.
- **`docs/projects.html`** — a standalone "constellation" hub page that gives the
  neglected sites a *place* and an internal-linking home, surfaced from this
  indexed site. Matches the site's existing palette/nav/footer; includes
  `CollectionPage` + `ItemList` JSON-LD. Every island links back to the anchor
  and to Suede Labs.
- **`docs/sitemap.xml`** — one appended `<url>` entry for `projects.html`.

> Deliberately **not** changed: the homepage canonical currently points to
> `/dav/` while `index.html` sits at root — this is part of the recent DAV WIP.
> Flagged for you to reconcile later; left untouched here.

## External actions (only you can do these — not pushed by this branch)

Ordered by leverage. These live in other repos / external surfaces.

1. **Add one contextual link from `guitar.solutions` to each island.** This is
   the single highest-value move in the whole portfolio — one link from the only
   crawled, trafficked domain is what gets the github.io and fresh-repo pages
   discovered at all. Best: a permanent *Gear & Pedals / What I'm building*
   block + in-chapter links (fuzz/overdrive passages → pedals list).
2. **Deploy the Top 100 Pedals list under `guitar.solutions`** (subdomain or
   path) and submit to Google Search Console. Converts an invisible island into
   a same-audience funnel page that inherits real authority, and lets the hub
   link to a live page instead of the repo.
3. **Ride the tokenmaxxing wave now:** verify the live URL returns crawlable
   HTML, add title/H1/Article schema, move to a themed brand path
   (`suedeai.org/tokenmaxxing`), cross-post to the Substack with a canonical
   link, and submit to HN / Reddit / Lobsters while the term trends.
4. **Directory submissions (first backlinks):** PRs to ComposioHQ/awesome-claude-skills,
   travisvn/awesome-claude-skills, VoltAgent/awesome-agent-skills for the skills
   + iOS repos; design-resources lists for anti-slop; guitar/gear communities for
   the pedals list. Directory inclusion both earns the first real backlinks and
   rides pages that already rank.
5. **iOS + Anti-Slop on-GitHub hygiene:** set Topics and homepage URLs, enable
   GitHub Pages, rewrite READMEs around the differentiated wedge.
6. **Consolidate the entity:** cross-link `guitar.solutions`, `suedeai.ai/founder`,
   `suedeai.org`, the Substack, and the Suede-AI GitHub org README so Google
   co-cites the *Johnny Suede / Jason Colapietro* author entity. Always pair
   "Johnny Suede" with "Signal Chain" / "guitar.solutions" to disambiguate from
   the 1990s band Suede.
7. **Add an `llms.txt` + Book/Product + Author schema to `guitar.solutions`** so
   the anchor itself surfaces in AI answers and passes a cleaner author entity.

## Quick wins (do first)

1. Merge this branch → `llms.txt` + `projects.html` go live (zero risk).
2. Add one link from `guitar.solutions` to the new hub page + each island.
3. Deploy the pedals list under `guitar.solutions` and submit to GSC.
4. Cross-post tokenmaxxing to the Substack + HN/Reddit **this week**, while hot.
5. Set GitHub Topics + homepage on the iOS and anti-slop repos.
6. Open directory PRs for the skills + iOS repos.

---

*Generated from a 9-agent portfolio audit. Findings reflect web-search
discoverability signals (live crawling of these GitHub-hosted sites is
bot-blocked), so verify exact indexed URLs in Google Search Console.*
