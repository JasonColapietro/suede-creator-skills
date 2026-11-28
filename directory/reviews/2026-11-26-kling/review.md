# Kling AI skills added to the scored catalog, November 26, 2026

This change carries out #395 on the current catalog. Kling AI Global (`klingai-tech/claude-plugin`, request #394) has been a Featured project since November 17 (`directory/reviews/2026-11-17-kling-global.md`), but its three skills were not in the scored catalog. They are now, with the owner editorial ratings from #395 shown beside the computed scores. Receipt: `scoped-ingestion.json` in this folder. The other 3,913 listings, their scores and source revisions are unchanged.

## Method

The repository was fetched at its default branch on November 26, 2026 (`5f666eb`) and scored by the existing pipeline (`parse_skills.py`, `grade.py`, `curate.py`, graded-v2 rubric). Only the three requested skills are allowlisted. No manual points. `snapshot_id` was rotated and the site rebuilt.

Source changes since the November 17 feature review (`d4e0b6a`): model guidance updates (Kling Image 4.0 series mode, video HDR settings), README updates, and a third-party index's verification comment at the top of the README. Scope, license (MIT) and hosted-service requirements are unchanged.

## Added (3 skills)

| Skill | Skill Check | Owner editorial rating |
| --- | --- | --- |
| kling-ai | 72 (C) | 88 (B) |
| kling-ai-generate-image | 80 (B) | 89 (B) |
| kling-ai-generate-video | 72 (C) | 88 (B) |

Editorial ratings are recorded in `directory/editorial-ratings.json` against the revision the owner assessed (`f470369`, November 14). They are labeled "Editorial", shown next to the Skill Check score, and do not change computed scores, component totals, ranking, badge eligibility or featured placement. The video skill's Skill Check score is 72 at this revision (80 in #395's November 14 run).

Each skill carries a service note: the full plugin and Kling's Global MCP with browser OAuth are required, and generation spends paid credits.

Static assessment only; **security_scan_status: not_scanned**.
