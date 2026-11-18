# Directory technical SEO audit — 2026-11-18

Scope: `suedeai.directory` and the legacy `skills.suedeai.ai/directory/` route.
No visual, layout, body, branding, feature or badge changes.

## Production observations (22:34 UTC)

- `/`, `/featured/`, `/robots.txt`, `/sitemap.xml`: HTTP 200.
- Legacy directory root redirects to `https://suedeai.directory/`.
- Random nonexistent path `/audit-definitely-missing-181126/`: HTTP 404, not a soft 404.
- Robots explicitly allow search crawlers and name the correct sitemap.
- Sitemap parses as XML and contains 1,853 URLs.
- Root and featured pages each have one canonical pointing to their clean URL.
- `/index.html` and `/featured/index.html` also return HTTP 200 and byte-identical HTML to their clean URLs. Existing canonicals mitigate this duplication; permanent redirects strengthen URL consolidation and avoid redundant crawl URLs. This is an improvement, not an indexing outage.

## Whole-build audit

Built current source with `node scripts/build-directory-site.mjs` and examined all 1,861 HTML files:
- All 1,853 published sitemap routes exist locally, are self-canonical and have valid JSON-LD syntax.
- No published indexable page omitted from sitemap.
- The eight intentional exceptions are two Google verification files, 404, saved shortlist and four social-image templates. They are not missing content routes.
- No change proposed to valid entity nodes or schema merely because multiple JSON-LD blocks occur on one page.

## Patch

Two host-scoped permanent redirects normalize root and nested `index.html` aliases on `suedeai.directory`. Separate pack-site URLs are unaffected. Canonical URLs, assets, verification files and old directory redirects remain intact. No HTML/CSS/assets or templates changed.

Routing syntax reference: https://vercel.com/docs/project-configuration/vercel-json

## Verification and release

Regression test fails against previous routing config and passes with normalization rules. Both host/build routing suites exercised. Full `npm test` attempted separately; see PR for result. Production behavior after release must be checked for 308 + correct Location and no redirect loop. No production release performed by this audit.
