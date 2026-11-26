---
name: suede-domain-migration
description: "Plan or verify an SEO domain migration, URL move, rebrand, or folder consolidation. Match old sources to new equivalents, prove redirects and canonical parity, and prepare release monitoring. NOT FOR: changing DNS or deploying without approval, or a general SEO audit (suede-seo-audit)."
metadata:
  display-name: "Suede Domain Migration Skills"
  version: 1.0.0
---

# Suede Domain Migration Skills

## Compatibility

A URL inventory and old/new crawl or page exports are enough to plan. Use a
read-only crawl, approved staging access, and Search Console exports when
available. Implementation needs scoped repository access; publication and
configuration changes need separate authority.

## Procedure

1. Record the old and proposed origins, relevant environments, cutover owner,
   current hosting controls, and matching date windows. Build an inventory
   from sitemaps, crawls, landing-page traffic, known backlinks, historic
   URL lists, and manually protected assets. Reconcile URLs that exist in
   only one source instead of silently excluding them.
2. Make one decision per old URL: keep, permanently redirect to an equivalent,
   return 404 or 410 for a genuine retirement, or defer to a named reviewer.
   Record the reason, priority, canonical target, and expected response.
   Do not redirect unrelated URLs to the homepage. Preserve functional query
   parameters only where the destination uses them; ensure old URLs cannot
   create chains, loops, or alternate-host detours.
3. Save a map suitable for the actual host and a staging test list.
   Compare status, final URL, rendered content, canonical, robots directives,
   sitemap inclusion, hreflang reciprocation where applicable, structured
   data identity, pagination, and dependency availability. Check header
   redirects and rendered/document signals independently. Include priority
   files and old path variants, plus intentionally private and gone URLs.
4. Build a cutover checklist specifying which DNS, CDN, application, and
   search-console steps an authorized operator owns, what monitoring changes,
   and which reversible rollback action follows each predefined failure.
   Avoid unrelated redesigns and content changes in the cutover. A sitemap or
   Google Change of Address action is conditional on applicability and access.
5. Compare pre/post crawl samples and Search Console reports at agreed
   intervals. Record uncertainty from recrawl and data latency. Distinguish
   redirect/configuration regressions from expected temporary visibility
   variation; never guarantee traffic or ranking retention.

## Output contract

Return the old-to-new inventory, unresolved decisions, proposed diffs,
staging replay results, checkpoint owner and evidence, and the rollback
conditions. Clearly say planned, staged, deployed, or live verified. Do not
publish or contact linking sites unless the user authorizes that action.

## Boundaries

- Do not promise unchanged rankings.
- Do not apply redirects or alter DNS outside the approved plan.
