# Scoped ingestion of accepted listing requests, November 26, 2026

This change adds the accepted listing requests from #445 (FairValid), #413 (StalkChain) and #430 (Skills for Bots) to `directory/skills.json` without a full catalog refresh. The other 3,906 listings, their scores and their source revisions are unchanged. Precedents: `directory/reviews/2026-11-11-govisit.md` and `directory/reviews/2026-11-20-accepted-skills/`. Receipt: `scoped-ingestion.json` in this folder.

## Method

Each accepted repository was fetched at its default branch on November 26, 2026, and scored by the existing pipeline (`parse_skills.py`, `grade.py`, `curate.py`, graded-v2 rubric). Only the rows for the accepted skills were copied into the current dataset, with their repository records and an `assessment_date` of 2026-11-26. No manual points. `snapshot_id` was rotated and the site rebuilt. Editorial labels were added for the five StalkChain and Skills for Bots skills, and a service note for the three StalkChain skills (account and credits required; research only).

Source changes since the review records: the StalkChain skill folders match the reviewed revision. The Skills for Bots skills added always-on rules to take orders only from the owner and to ignore hidden instructions in outside content; scope is unchanged. FairValid is at the reviewed revision.

## Added (7 skills, 3 repositories)

| Skill | Repository | Score |
| --- | --- | --- |
| email-verification, fairmatch-leads | moonlitnayeem/fairvalid-ai | 77 (C) each |
| bot-safety-rules-starter, reminder-basics | skillsforbots/grok-bot-skills | 77 (C) each |
| token-check, trader-check | StalkC/stalkchain-plugin | 77 (C) each |
| smart-money-radar | StalkC/stalkchain-plugin | 74 (C) |

## Accepted but not listed

`kochetkov-ma/brewpage-publish-plugins` `brewpage-publish` (#428) is excluded by the unchanged curator's English-language filter, as its November 21 review anticipated. No language exception was added. DESIGN:OS (#414) is an editorial feature only and is not part of the scored catalog.

## Side effect

The browse clock follows the latest source assessment, so `directory/new/` now counts 30 days back from November 26. Skills first listed on October 22 have aged out of that page. Static assessment only; **security_scan_status: not_scanned**.
