# Handoff: vs and alternatives pages across the Suede AI estate (2026-11-04)

## What shipped

Every major Suede AI site now has a comparison hub, a "Suede AI vs X" page and
an "X alternative(s)" page for each major competitor. The work sits on a branch
named `seo/vs-and-alternatives-pages` in seven repos, each with a PR.
Nothing is merged or deployed. Merging to `main` deploys production on every
one of these sites, so each PR needs Jason's go-ahead.

| Site | Repo | Draft PR | Competitors covered |
|---|---|---|---|
| suedeai.app / agents.suedeai.ai (Agent Studio) | JasonColapietro/suede-agent-studio | (PR opened after the build; see the repo) | GoHighLevel, Zapier (incl. Agents), Make, n8n, Lindy, Relevance AI, Gumloop |
| seo.suedeai.ai (suedeai.agency, geo.suedeai.ai redirect here) | JasonColapietro/suede-seo | [suede-seo#522](https://github.com/JasonColapietro/suede-seo/pull/522) | Profound, AthenaHQ, Peec AI, Scrunch, Otterly.AI, Semrush AI Visibility Toolkit, Ahrefs Brand Radar |
| suedeai.ai | Suede-AI/Suede-AI-App (`suede-home/`) | [Suede-AI-App#1687](https://github.com/Suede-AI/Suede-AI-App/pull/1687) | Stammer.ai, Vendasta, full-time Chief AI Officer, TuneCore, CD Baby, Amuse, DistroKid |
| suedeai.directory | JasonColapietro/suede-creator-skills | [suede-creator-skills#338](https://github.com/JasonColapietro/suede-creator-skills/pull/338) | skills.sh, SkillsMP, Claude Marketplaces, claude-plugins.dev, awesome-claude-skills |
| suedeai.org | Suede-AI/suedeai-org | [suedeai-org#160](https://github.com/Suede-AI/suedeai-org/pull/160) | Story Protocol, Safe Creative, Bernstein, Numbers Protocol, Adobe Content Authenticity |
| guitarhub.org | JasonColapietro/suede-guitar-hub | [suede-guitar-hub#86](https://github.com/JasonColapietro/suede-guitar-hub/pull/86) | Fender Play, Yousician, JustinGuitar, Guitar Tricks, Ultimate Guitar |
| sing.suedeai.ai | JasonColapietro/sing | [sing#282](https://github.com/JasonColapietro/sing/pull/282) | Yousician, Singing Carrots, Smule, Simply Sing, Singeo, SingSharp |

## New URLs

- **Agent Studio:** `/compare` (now a real hub; it used to redirect to the
  Gumloop page), `/compare/suede-ai-vs-{gohighlevel,zapier,make,n8n,lindy,relevance-ai,gumloop}`,
  `/compare/{gohighlevel,zapier,make,n8n,lindy,relevance-ai}-alternative`. The
  existing hand-written `/compare/gumloop-alternative` stays.
- **seo.suedeai.ai:** `/suede-ai-vs-{profound,athenahq,peec-ai,scrunch,otterly-ai,semrush-ai-visibility-toolkit,ahrefs-brand-radar}`,
  `/{scrunch,otterly-ai,semrush-ai-visibility-toolkit,ahrefs-brand-radar}-alternative`.
  `/compare` gains a named-tools table and FAQ; the existing Profound, AthenaHQ
  and Peec alternative pages link to their new vs pages.
- **suedeai.ai:** `/vs` (was a redirect to `/proof-of-creation`; the
  `/vs/{audius,patchbay,story-protocol,suno}` redirects stay),
  `/vs/{stammer-ai,vendasta,full-time-chief-ai-officer,tunecore,cd-baby,amuse}`,
  `/alternatives`, `/alternatives/{hiring-a-chief-ai-officer,distrokid}`.
- **suedeai.directory:** `/compare/suede-vs-{skills-sh,skillsmp,claude-marketplaces,claude-plugins-dev,awesome-claude-skills}/`
  and `/compare/{same five}-alternatives/`. Per-skill alternatives pages went
  from 82 to 111 (see "Directory generator change").
- **suedeai.org:** `/compare/`, `/compare/suede-ai-vs-{story-protocol,safe-creative,bernstein,numbers-protocol,adobe-content-authenticity}/`,
  `/compare/{same five}-alternatives/`.
- **guitarhub.org:** `/compare`, `/compare/guitarhub-vs-{fender-play,yousician,justinguitar,guitar-tricks,ultimate-guitar}`,
  `/compare/{same five}-alternatives`.
- **sing.suedeai.ai:** `/compare`, `/compare/suede-sing-vs-{yousician,singing-carrots,smule,simply-sing,singeo,sing-sharp}`,
  `/compare/{same six}-alternatives`.

## How every page is built

- Direct answer in the first paragraph, question-style H2s, a comparison
  table, an FAQ with FAQPage JSON-LD, BreadcrumbList JSON-LD, its own title,
  description and canonical.
- Listed in the site's sitemap and llms.txt (and llms-full.txt where the site
  has one), linked from the hub, the footer and related pages.
- Competitor facts were read from each competitor's own pricing or docs pages
  on 2026-11-03 and are labeled "as of November 2026", with sources on the
  page or in the data module. Suede AI numbers come from constants or live
  data in each codebase, never typed in by hand.
- Copy follows each repo's sales-copy rules (no hedges, no reasons to pick a
  rival) and the org rules (no em dashes, no banned words, "Suede AI").
- Sister sites do not target each other's competitors. suedeai.ai's hubs link
  out to the SEO and Agent Studio hubs, and `suede-home/tests/comparison-hubs.test.mjs`
  fails if suedeai.ai starts targeting their competitors.

## Where the data lives

- Agent Studio: one typed profile per competitor in `src/lib/compare/`,
  rendered by `src/app/compare/[slug]`. Hub card and Gumloop card copy in
  `src/lib/og/compare-card.ts`.
- seo.suedeai.ai: static pages under `site/`, matching the existing
  alternative pages.
- suedeai.ai: `suede-home/src/content/comparisons.ts`, rendered by
  `src/app/vs/[slug]` and `src/app/alternatives/[slug]`.
- suedeai.directory: `directory/editorial/competitors.json`, rendered by
  `scripts/directory/versus.mjs` (which also blocks em dashes and banned words).
- suedeai.org: static HTML under `compare/`, covered by `tests/verify_site.py`.
- guitarhub.org: `lib/comparisons.ts`, tests in `tests/comparisons.test.ts`.
- sing.suedeai.ai: `lib/comparisons.ts`, `components/compare/parts.tsx`,
  `app/compare/`, guard test `lib/comparisons.test.tsx`.

## Verification at handoff

- Agent Studio: build, lint and typecheck pass. Full `npm test` had 6
  failures in the session container: 4 were fixed, 2 are container-only
  (`safe-url` needs IPv6, `preflight` needs Node 24; the container has 22).
  CI should run both.
- seo.suedeai.ai: verifier passes 105 contracts; 823 of 825 script tests pass,
  1 skipped, 1 fails (`achievement-measurement` test 12 needs commit
  `34a420c`, absent from a shallow clone; it fails the same way without these
  changes).
- suedeai.ai: test:entity 366, test:policy 17, test:partners 4, test:orphans 2,
  all pass; tsc, lint and build pass.
- suedeai.directory: `npm test` passes (650 node, 200 Python); both site
  builds succeed.
- suedeai.org: `tests/verify_site.py` passes 34 pages; 144 node tests pass.
- guitarhub.org: 1,494 tests, lint, tsc and build pass. `contracts:check`
  fails on `contracts/suede-vocal.json`, a file synced from the sing repo by
  workflow; it fails the same way on `main`.
- sing.suedeai.ai: 3,824 tests pass (8 skipped); lint, tsc and build pass.

## Follow-ups done on 2026-11-04

- Agent Studio: the `/compare` hub had been sharing the Gumloop table card.
  The Gumloop card moved to `src/app/compare/gumloop-alternative/opengraph-image.tsx`
  and the hub draws its own card with the hub headline. Renderer hash
  re-pinned without a revision bump (both card URLs are new to every cache).
- suedeai.org `/royalties/`: the Story Protocol Royalty Module citation now
  says the contracts were deprecated on 2026-09-19 and the IP Portal shut
  down 2026-10-15 (per the protocol-core-v1 README), calls it a reference
  design, and links `/compare/suede-ai-vs-story-protocol/`.
- suedeai.ai: `main` added a test to the same `package.json` line; merged
  `main` into the branch keeping both tests.

## Open items for review before merge

1. **Prices we could not read:** Make (credit-volume pricing, no dollar
   figures in page text) and Relevance AI (Enterprise only) show plan names,
   not dollar prices. Singing Carrots publishes no prices.
2. **Prices worth a second look:** Yousician's website shows $139.99/yr for
   Premium+ while its App Store listing shows $159.99 and $179.99 (pages quote
   the website). Profound's $399-per-workspace agency price comes from its
   November 2025 blog post, because the pricing page renders that tier
   client-side.
3. **Not re-checked on 2026-11-03:** DistroKid (403 to our fetch; `/vs/distrokid`
   keeps its August 29 sources) and SkillsMP (403; facts credited to SmartScope
   and KDnuggets, price shown as not stated). Fender and JustinGuitar facts
   came from their App Store listings and their official pages as indexed in
   search, because their sites answered 403.
4. **Skipped competitors and why:** BrightEdge (no published pricing),
   Writesonic (not verified to the same depth), UnitedMasters vs page (no
   prices on its plans page; it appears in `/alternatives/distrokid`),
   Vanido and Erol Singer's Studio (no first-party price or listing),
   Songsterr and Chordify (no matching GuitarHub feature), Smithery, mcp.so
   and Glama (MCP server directories, not skill directories).
5. **suedeai.org leans on IP.** Its comparisons are registry and provenance
   tools because the .org explains the Suede AI IP Registry. That fits the
   site but differs from the company default of leading with SEO and Agent
   Studio.
6. **guitarhub.org `public/llms-full.txt` is 488 KB** against a 500 KB test
   limit. The next large addition needs trimming.
7. **Sing copy changes outside the pages:** the footer column "More from
   Suede" is now "More from Suede AI"; Singing Carrots' "AI Coach" app is
   called a "companion app" because an existing test reserves "coach" for Pro
   phrases.

## Next steps

0. **Remove the footer from every PR body before merging.** GitHub appended
   `_Generated by [Claude Code](...)_` server-side to each body when the
   session opened the PRs through the REST API, and a REST edit re-appends
   it. Delete the line in the GitHub web UI (or with the GitHub MCP
   `update_pull_request` tool, the one call that does not re-append it). A
   squash merge built from the default message would carry it onto `main`.
1. Review each PR once full CI is green.
2. Merge per each repo's own rules (Agent Studio: squash after green
   `ci-success`; suede-seo: API squash with an explicit `commit_message` and
   no footer; Suede-AI-App: `gh pr merge --squash`, never `--auto`, merge
   authored by JasonColapietro so Vercel does not block the deploy).
3. After deploy, request indexing for the new hubs in Search Console and Bing
   Webmaster Tools, and recheck competitor prices every quarter (next pass:
   February 2027).
