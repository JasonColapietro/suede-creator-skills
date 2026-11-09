# Handoff: Suede Directory chat box, Suede-first picks and the Suede palette (2026-11-09)

## What shipped

Six PRs to `JasonColapietro/suede-creator-skills`, all merged to `main` after
green CI and live on suedeai.directory (checked on the live site: `--canvas`
serves `#020409`, `--link` serves `#38bdf8`).

| PR | Change | Merge |
|---|---|---|
| [#361](https://github.com/JasonColapietro/suede-creator-skills/pull/361) | The homepage chat box asks "What are you working on?" and answers any goal with skills, a workflow and Jason's articles; Best of tiles sit beside it | `6adc740e9` |
| [#362](https://github.com/JasonColapietro/suede-creator-skills/pull/362) | Suede AI skills are recommended at all (they were filtered out) and lead the lists | `395201cea` |
| [#363](https://github.com/JasonColapietro/suede-creator-skills/pull/363) | Suede AI skills lead the workflow steps they cover | `118b80f71` |
| [#364](https://github.com/JasonColapietro/suede-creator-skills/pull/364) | Suede card accent (gold, since replaced) and a fix for the browser-suite event-loop stall | `1b33744bd` |
| [#365](https://github.com/JasonColapietro/suede-creator-skills/pull/365) | Suede cards rebuilt on the Suede palette, split into zones, lists grouped | `9163c523d` |
| [#366](https://github.com/JasonColapietro/suede-creator-skills/pull/366) | The whole directory moves from gold-on-black to the Suede palette | `64c34065f` |

## How the chat box works

- **Question and answer.** The visitor describes a goal in plain words. If it
  matches one of the eight authored workflows (landing page, web app, SEO and
  AI search, social campaign, AI agent, data report, research, video), they
  get the step-by-step workflow, up to three "Recommended skills for this
  goal" above the steps, tips and articles. Any other goal gets graded skill
  matches from the full catalog, the workflow choices and articles, instead of
  a "be more specific" note.
- **Matching is local and lexical.** Nothing typed leaves the browser and
  there is no model call. `recommendSkills` weights words by rarity across the
  catalog, maps everyday wording to skill vocabulary (`EXPANSIONS`: "customers
  from Google" means SEO, "releasing a single" means music release), strips
  `NOT FOR:` clauses before matching and dedupes by name.
- **Suede first.** A matching Suede AI skill (repo
  `jasoncolapietro/suede-creator-skills`) leads the list when it is at least
  35% as relevant as the best match (`LEAD_SHARE`); weaker Suede matches keep
  their normal place, and a goal no Suede skill fits shows none. Lists are
  grouped "From Suede AI", then "From other publishers".
- **Suede skills in workflow steps.** Each authored step a Suede skill covers
  picks it first (`choice(SUEDE + '...')`), with the earlier pick kept in the
  step's "Choose a skill" menu: suede-copy, suede-design, suede-analytics,
  suede-code (security review), suede-seo-audit, suede-content-strategy,
  suede-ai-seo, suede-social, suede-deslop, suede-ai-eval,
  suede-competitor-profiling (only when the brief names competitors) and
  suede-video. Steps with no matching Suede skill keep their picks.
- **Articles.** 38 of Jason's articles: the directory stacks and guides, his
  blog posts and the S-Tier chapters on skills.suedeai.ai. `recommendArticles`
  takes the best article per matched workflow, then the strongest keyword
  matches, up to three. Only Jason's articles on approved paths pass
  `isPublishableArticle`.
- **Suede cards.** Red head (badge and name), description, cyan proof row
  (publisher and grade), footer with setup facts and a "View skill" button.
  A Suede skill in a workflow step gets the same red head band.

## The palette

The directory now uses the canonical Suede palette (Institutional IP Terminal,
from `Suede-AI-App/suede-home/src/app/globals.css`) on five colors. It is a
CSS-only change; no generated page changed.

| Color | Value | Where |
|---|---|---|
| Black | `#020409` page; Panel Ink `#09101b`, Control Ink `#0d1726` | Page, panels, cards, nav |
| Blue | Proof Sky `#38bdf8` | Links, reading list, publisher group label |
| Green | Verified Emerald `#34d399` | Workflow progress, completed steps, pressed "complete" button |
| Red | Rights Red `#9f101a`, hover `#d11f2b` | Buttons, "List your skill", form submits, skip link, Suede card heads |
| Cyan | Registry Cyan `#22d3ee` | Active tabs, focus, eyebrows, glyphs, proof details |

The `--gold-*` token names stay for compatibility (tests and other sheets read
them) and now carry Rights Red and Registry Cyan. Grade colors are unchanged.
`directory/DESIGN.md` documents the palette.

## Where the code lives

- `docs/assets/workflow-recommender.js`: matching (`planWorkflow`,
  `recommendSkills`, `recommendArticles`, `isPublishableArticle`,
  `isFirstParty`), the `FLOWS` presets and Suede step picks, `EXPANSIONS`,
  `LEAD_SHARE`, `WORKFLOW_EXAMPLES`.
- `docs/assets/workflow-builder.js` and `.css`: the chat box client, Suede
  cards, groups and the layout beside Best of.
- `directory/editorial/workflow-articles.json`: the article list (title,
  summary, href, intents, keywords). `scripts/build-directory.mjs` validates
  each entry and publishes `docs/directory/workflow-articles.json`.
- `scripts/build-directory.mjs` (`workflowHtml`): the chat box markup and the
  `directory-start` band that holds it and Best of.
- `docs/assets/directory.css`: the palette tokens.
- Tests: `tests/test_workflow_recommender.mjs`, `test_workflow_builder.mjs`,
  `test_workflow_builder_client.mjs`, `test_workflow_builder_browser.mjs`.

## Verification at handoff

- Workflow unit tests: 91 pass. New tests were checked to fail without their
  change.
- `npm run validate`, `npm run test:directory` (350), `test_directory_rebuild`
  (11) and `npm run test:directory:browser` (exit 0, including the palette
  contrast check) pass. The Python suite passed (202) earlier in the day.
- CI was green on every PR's final head.

## Browser-suite stall (fixed in #364)

`copy link changes the button text…` timed out intermittently. Measured cause:
`verifyStandaloneWorkflow` ran a 7.1 s synchronous standalone build in the same
Node process as the concurrently running browse-client tests, stalling the
event loop by 7,064 ms inside a 5 s wait. The build now runs in an awaited
child process; lag during that wait measured 3 to 6 ms.

## Open items

1. **The workflow unit tests do not run in CI.** `npm test` does not list
   `test_workflow_recommender.mjs`, `test_workflow_builder.mjs` or
   `test_workflow_builder_client.mjs`, and `package.json` is hash-pinned by
   `directory/intake/2026-10-31-interface-quality.json`, so adding them changes
   that receipt. Only the browser flow runs in CI. Wiring them in needs a
   decision on refreshing the receipt.
2. **Still gold:** the mobile address-bar `theme-color` meta (`#000000`;
   changing it rewrites 1,834 generated pages and every sitemap date), the
   listing badge SVG drawn in `scripts/build-directory.mjs`, the README skills
   badge (`skills-N-c8a96e`, pinned by `scripts/validate-skill-pack.mjs` and
   `tests/test_neutral_oss_positioning.py`) and the Suede Skill Check shield
   image.
3. **skills.suedeai.ai is unchanged.** It uses `site.css` and its own gold
   scheme; only the directory moved to the Suede palette.
4. **Suede-first tuning.** `LEAD_SHARE = 0.35` keeps weak Suede matches (for
   example Paywalls on a landing-page goal) from leading. Some Suede picks
   still lead loosely, such as Co-Marketing for "a small bakery wanting more
   customers from Google".
5. **`test_validator_runtime` hung once locally** for 18 minutes after the
   session clone was deepened to full history. It passes in CI and passed
   locally before; not investigated further.

## Next steps

1. Decide on item 1 (refresh the intake receipt and add the workflow unit
   tests to `test:directory`).
2. Decide whether items 2 and 3 should move to the Suede palette.
3. Add articles by appending entries to
   `directory/editorial/workflow-articles.json` with intents or keywords, then
   run `node scripts/build-directory.mjs`.
