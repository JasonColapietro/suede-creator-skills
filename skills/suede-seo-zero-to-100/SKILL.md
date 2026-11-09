---
name: suede-seo-zero-to-100
description: "Take any company, brand, local business, creator, or person from invisible on Google to a compounding search engine — the Suede 0-100 Search Ladder. Diagnoses the current level with evidence, fixes lower gates first (indexing, Search Console, Bing, name SERP, Google Business Profile, schema, demand map, pages), then runs the click-earning title and snippet testing loop on Search Console data in 14-day cohorts with control pages and a significance-tested verdict script, climbs page-2 pages, builds authority, and checks AI answer citations. Use when someone says rank me, get me on Google, nobody finds me, SEO from scratch, title tests, CTR, Search Console data, god-mode SEO, rank #1, grow organic traffic, or shares a GSC export. NOT FOR: a one-page nine-lane audit (use suede-seo-audit); a fast A-F promotion grade (use suede-visibility-grader); conversion rewrites (use suede-site-alchemy)."
---

# Suede SEO Zero to 100

Every subject, from a solo photographer with a week-old site to a SaaS company
with 10,000 pages, sits somewhere on one ladder. This skill finds the rung with
evidence, fixes what leaks below it, and runs the next rung as a measured
loop. The headline lever, testing many titles in parallel and keeping the
winners, is Level 60. It works only when 0-50 hold.

**Core principle:** evidence before advice, gates before growth, verdicts from
data. Fetch the live site and real Search Console numbers; never plan from
memory.

## The ladder

| Level | Name | Gate (observable proof it's done) |
|---|---|---|
| 0 | Exist | Own domain, HTTPS, indexable, home page says who/what/where in words |
| 10 | Indexed | GSC + Bing Webmaster verified, sitemap submitted, key pages "Indexed", analytics + conversion event live |
| 20 | Own your name | Exact name search shows the subject at #1; `Person`/`Organization`/`LocalBusiness` schema with `sameAs`; GBP claimed if local |
| 30 | Demand map | Intent → one URL table, prioritized, zero cannibalization |
| 40 | Pages that deserve to rank | Every priority intent has an indexed page passing `suede-seo-audit` |
| 50 | Baseline | Dated GSC snapshot (pages + queries), brand/non-brand split, data source fixed |
| 60 | Win the click | One full title-test cycle read by the verdict script, log started |
| 70 | Climb | Page-2 pages refreshed/consolidated; page-2 list shrinking |
| 80 | Authority | Earned links, reviews, mentions trending up |
| 90 | AI answers | Cited in AI assistants for target questions; monthly check scheduled |
| 100 | Compounding | Weekly/monthly/quarterly cadence runs; organic conversions growing |

Full checklists per level: `references/levels.md`. Per-profile weighting
(SaaS, e-commerce, local, person, creator, publisher, nonprofit):
`references/profiles.md`.

## Workflow

### 1. Gather evidence (before any advice)

- Fetch the home page and top pages: status, `robots.txt`, meta robots,
  canonical, `<title>`, meta description, H1, JSON-LD, sitemap. Builder sites
  (Squarespace, Wix, Webflow, Shopify) hide noindex behind password pages,
  "hide from search" toggles, and staging domains: check them.
- Search the exact name and the money query; note what ranks and whether
  Google rewrote the subject's titles.
- Search Console: use a GSC connector or API if one is available in the
  session; otherwise ask for Pages + Queries CSV exports (Performance → Export,
  last 28 days, plus 3 or 16 months if they have it). Bing Webmaster export
  is a bonus.
- If something cannot be fetched, say so and mark it UNVERIFIED. Ask only for
  what you could not get yourself.

### 2. Diagnose the level

Score each gate PASS / FAIL / UNVERIFIED with the evidence. The subject's level
is the highest rung whose gate and every lower gate pass. A FAIL below the
target rung is the first work, even when the user asked for the top rung
("rank me #1" on a site with a noindex tag starts at Level 0).

Pick the profile from `references/profiles.md` and note its heavy levels.

### 3. Build the next 14 days

Plan the work for the lowest failing gates, then the next rung. Each action
names: what, where (exact setting, file, or URL), who, how long, and the gate it
closes. New sites with no impressions spend the first cycles on L0-L40; the
title loop starts when GSC shows impressions (usually 2-6 weeks after
indexing). Say so in the plan instead of skipping the loop.

### 4. Run the Level 60 loop when data exists

Follow `references/title-testing.md` exactly. In short:

1. `python3 scripts/gsc_opportunities.py PAGES.csv --queries QUERIES.csv --brand "<full brand names>"`
   ranks testable pages (position 1-15, enough impressions, CTR below expected),
   routes page-2+ pages to Level 70, and flags cannibalization.
2. Ship flagged consolidations (merge, 301, relink) before the cohort starts.
3. Split the eligible pool at random into test pages and 3+ control pages of
   similar size. Every test page gets one variant: 3 candidates with a
   hypothesis each, one chosen and why.
4. Ship the cohort in one deploy, request indexing, change nothing else.
5. Start the clock when Google displays the new title; log REWRITTEN if it
   doesn't within 7 days.
6. At day 14 (+ 2-3 days GSC lag), run
   `python3 scripts/title_test_verdict.py TESTS.csv` and report WIN / LOSS / LOST VISIBILITY /
   CONFOUNDED / INCONCLUSIVE exactly as returned.
7. Keep winners, revert losers, queue next variants, record the learning.

Throughput comes from parallel pages in weekly cohorts, never from several
variants on one URL. A site with 4 eligible pages runs 4 tests.

### 5. Climb, authorize, get cited

Levels 70-100 per `references/levels.md`: refresh and consolidate page-2 pages
against the top 3 results, earn links and reviews, test AI-assistant
citations for 5-10 target questions across 3+ assistants, and set the
recurring cadence.

## Output contract

Every response that plans or reports search work uses this shape:

```text
Simple explanation: one plain paragraph a 10-year-old follows: where they are,
  what happens next, what to expect.

Ladder scorecard: Level <N>/100 (<profile>)
  L0 Exist ........ PASS/FAIL/UNVERIFIED: <evidence>
  ... every level up to the first FAIL plus the next two

Fix first: lower-gate failures, each with exact steps

Next 14 days: dated actions, owner, gate each closes

Title-test cohort (when data exists):
  page | queries | impr | ctr | pos | current title | variant A/B/C + hypothesis | pick
  Controls: <pages>
  Not a title problem yet: <pages → Level 70 action>
  Cannibalization: <query → pages → merge plan>

Measurement: what to export, when, the verdict command, the test log columns

Later rungs: one line per level 70-100 with the first action

Needs from you: only what couldn't be fetched or verified
```

## Operating rules

- Verdicts come from the script. INCONCLUSIVE stays INCONCLUSIVE.
- Titles match what the page delivers, or Google rewrites them.
- Skip tactics that get sites penalized: click bots, bought links, PBNs, fake
  reviews, keyword-stuffed business names, doorway pages.
- Copy (titles, descriptions, bios, GBP text) is concrete and specific.

## Red flags: stop and re-check

| Thought | Reality |
|---|---|
| "They asked for title tests, skip the indexing checks" | A noindex or missing sitemap zeroes every test. Verify L0-L10 first, it takes minutes. |
| "Ask the user for their current titles" | Fetch the pages. Ask only for what you can't reach. |
| "Test 2 pages to be safe" | Test every eligible page; controls make volume safe. |
| "CTR went up 20%, call it a win" | Run the verdict script. Check position shift and controls. |
| "Rewrite the title on the position-24 page" | Past ~15 it's a content/intent/links problem (Level 70). |

## Routing

- One page needs the deep audit (schema, metadata, E-E-A-T) → `suede-seo-audit`.
- Launch-readiness or AI-citation grade for a page → `suede-visibility-grader`.
- Page ranks and gets clicks but doesn't convert → `suede-site-alchemy`.
- Fresh copy for new pages → `suede-copy` or `johnny-suede-write`.
- Artist release moments that need pages → `suede-campaign-in-a-box`.
- Deeper builds (site, tracking, agent workflows): https://suedeai.ai
