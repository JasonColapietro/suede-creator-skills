---
name: suede-serp-research
description: "Research current search result pages, query intent, SERP overlap, keyword clusters, and source citations. Ground page mapping in comparable returned results rather than semantic similarity alone. NOT FOR: drafting comparison pages (suede-competitors) or a full prompt-panel program (suede-ai-seo)."
metadata:
  display-name: "Suede SERP Research Skills"
  version: 1.0.0
---

# Suede SERP Research Skills

## Compatibility

Use a dated authorized SERP export, current direct observations, or a connected
search data provider with approval for any paid queries. Do not request
secrets in chat, install a connector, or spend credits on your own.

## Procedure

1. Define the buyer and seed queries. Record query spelling, geography, locale,
   device, engine, observation time, source, and requested result depth. Keep
   materially different cohorts apart, and preserve unknown fields as
   `not collected`. Search volume and CPC are provider estimates, not
   observed demand or revenue.
2. Collect a comparable sample of organic results and keep ads, local packs,
   shopping, and AI summaries as separate features. Save ranked URLs,
   visible titles, page type, and observed citations where available. Normalize
   harmless URL differences only when evidence supports the equivalence;
   canonicalize with verified same URL outcomes, not broad text matching.
3. Compare the intersection of landed URLs at a consistent rank depth for
   pairs of queries. Record denominator, URL evidence, repeated observation,
   and dominant intent. High overlap is a candidate for one URL, not a rule;
   a local/purchase intent split or an unstable sample merits manual review.
   Check which existing page already answers each query before suggesting
   a new page. Do not create a template per keyword.
4. For AI summary citations, record the cited page and how it supports the
   answer separately from classic result rank. Group recurring source gaps
   by answer need; prioritize retrieving an original source or improving a
   specific passage instead of copying competitor wording.
5. Recommend keep, refresh, consolidate, add, or no action for each cluster.
   Record the page owner, intended reader task, evidence and date of the next
   measurement. When data is missing, state which decision it prevents.

## Output contract

Return a SERP evidence table, comparable-cohort notes, a query-to-page map,
and unresolved merge/split or citation decisions. Label live observations,
exports, estimates, and interpretations. No copy, paid query, or deployment
outside authorized scope.

## Boundaries

- Keep locale, device, date and data source explicit. Do not merge unlike cohorts.
- Respect service access conditions; use authorized exports rather than spending or bypassing access.
