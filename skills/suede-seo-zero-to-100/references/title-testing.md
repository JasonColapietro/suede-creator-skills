# Title & Snippet Testing Protocol (Level 60)

The fastest lever in search: pages Google already shows on page 1-2 earn more
clicks when the title and description win the click. A new article takes 3-6
months to rank. A title test reads in about 14 days.

Why clicks matter beyond traffic: in *United States v. Google LLC* (2023 trial
testimony), Google witnesses described ranking systems (Navboost) that use
click and interaction data. Treat that as "earned clicks are a real signal,"
never as a license to fake them. Click bots, paid click farms, and CTR
manipulation services violate Google's spam policies and poison your own test
data. They are out of scope.

## Contents
1. Pick the pages
2. Capture the baseline
3. Write the variants
4. Launch the cohort
5. Confirm Google shows it
6. Read the result
7. Log, keep, revert, repeat
8. Throughput: how "25 titles a week" actually works

## 1. Pick the pages

Run `python3 scripts/gsc_opportunities.py PAGES.csv --queries QUERIES.csv --brand "<full brand names>"`.
Pass full brand names ("brightledger", "bright ledger"), not generic words that
also appear in non-brand searches.

A page is testable when all hold:
- average position 1-15 (page 1 or top of page 2);
- at least ~1,000 impressions per 14-day window (the script's default floor is
  300 per export period; raise it for short exports);
- CTR below what its position should earn;
- no unresolved cannibalization on its main query (consolidate first);
- not mostly brand traffic (brand demand hides title effects; test last).

Pages past position ~15 go to Level 70 (climb): content, intent, internal links.
A title will not lift a page from 24 to 3.

## 2. Capture the baseline

For every test page AND every control page, record before touching anything:
- live `<title>` and `<meta name="description">` (fetch the page; never ask the
  user to type them);
- the title Google actually displays (search the main query or
  `site:domain.com/path`); Google rewrites many titles, and a rewritten title
  means your edit may not show;
- 14 days of clicks, impressions, CTR, position for the page, and for its top
  2-3 queries (query-level CTR is cleaner than page totals);
- date of the export and GSC's data lag (2-3 days).

Controls: with 8+ eligible pages, pick them from the same eligible pool
(position 1-15, CTR below expected, similar page type) and assign test vs
control at random. With fewer than 8, test every eligible page and pool the
site's other non-brand page-1 pages as the control group; a small site should
not give up most of its tests to controls. Picking
controls from pages that already perform well biases every result toward a
win, because low-CTR pages drift up on their own. Pooled control impressions
should be at least as large as a typical test page's, or every verdict comes
back INCONCLUSIVE. Controls absorb seasonality, holidays, algorithm updates,
and SERP-feature changes. Without them the read is before/after only.

## 3. Write the variants

One variant live per page per window. Keep the other candidates queued.

Rules that make a title win and stick (Google keeps titles that match the page):
- front-load the exact primary query, or its closest natural phrasing;
- match the dominant intent of the SERP (guide, list, tool, template, price,
  comparison, local);
- add one concrete reason to click the page can prove: a count, a format
  (template, calculator, checklist), a scope (for contractors), a freshness
  marker (year) only if the page is actually updated;
- 50-60 characters (~580px) so it does not truncate on mobile;
- brand suffix only when the brand helps the click (known brand, YMYL trust);
- never promise what the page does not deliver: a mismatched title gets
  rewritten by Google and bounces visitors, which costs you twice;
- keep the H1 aligned in meaning (not necessarily identical).

The meta description is a second lever. Change it in the same edit only if you
are testing the snippet as one unit, and log it that way. Otherwise test one
element at a time.

Give 3 candidates per page with a one-line hypothesis each ("adds 'free
template' to match the 'template' modifier in 3,200 impressions/mo of queries").
Pick one to launch and say why.

## 4. Launch the cohort

1. Ship all title edits for the cohort the same day (one deploy, logged time).
2. Request indexing in GSC URL Inspection for each changed URL and update the
   sitemap `lastmod`.
3. Touch nothing else on test or control pages for the window: no content
   rewrites, no internal-link changes, no redirects. Ship consolidations and
   redirects before the cohort starts or after it reads, never during.

## 5. Confirm Google shows it

Check the SERP every 2-3 days. The test clock starts on the first day Google
displays the new title, not the deploy day. If Google is still showing its own
rewrite after 7 days, the variant mismatches the page: log it as REWRITTEN,
revert or rewrite closer to the H1 and page content.

## 6. Read the result

At day 14 after first display (plus GSC's 2-3 day lag), export equal windows
(14 days before the change vs 14 days after, same weekdays) for test and
control pages. Fill `TESTS.csv` and run:

`python3 scripts/title_test_verdict.py TESTS.csv`

The script runs a difference-in-differences test (test page change minus
pooled control change) and applies a Holm correction across every page in the
cohort, so 25 parallel tests do not produce false wins. Verdicts:
- **WIN**: significant positive effect vs control after correction, rank stable.
- **LOSS**: significant negative effect. Revert.
- **CONFOUNDED**: rank moved more than one position; CTR is not comparable.
  Hold the title another window.
- **LOST VISIBILITY**: impressions collapsed. Check indexing, rewrites, and
  cannibalization before anything else.
- **INCONCLUSIVE**: under 1,000 impressions per window or no clear difference.
  Extend 14 days or queue the next variant. Pages under ~0.5% CTR usually need
  several thousand impressions per window to read.

Re-read winners in the next cycle; a win that holds twice is a pattern.

Report verdicts exactly as the script returns them. Do not round an
INCONCLUSIVE up to a win.

## 7. Log, keep, revert, repeat

Keep one test log the whole team can see (sheet, Notion, or `seo-test-log.csv`):

```text
cohort | page | old title | new title | hypothesis | first_shown |
pre_ctr | post_ctr | effect_vs_control | verdict | decision | learning
```

The `learning` column is the asset: patterns that win for this site ("numbers
beat years," "'free template' wins on checklist intent," "brand suffix loses on
blog posts") become the default for every new page.

## 8. Throughput: how "25 titles a week" actually works

You cannot A/B split Google organic traffic on one URL. High throughput comes
from testing many pages in parallel, one variant each, in weekly cohorts:

- Week 1: cohort A (up to 25 eligible pages) goes live. Controls held.
- Week 2: cohort B (next 25 pages) goes live with a fresh control set.
- Week 3: cohort A reads at day 14. Winners stay. Losers revert and queue the
  next variant into cohort C.

A small site with 4 eligible pages runs 4 tests per cycle. That is the
ceiling. Do not invent volume by testing pages without the impressions to read.
