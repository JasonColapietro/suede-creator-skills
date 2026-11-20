# Scoped ingestion of accepted listing requests, November 20, 2026

This change adds the accepted listing requests that were recorded in `directory/inclusions.json` but missing from `directory/skills.json`, without a full catalog refresh. The other 3,894 listings, their scores and their source revisions are unchanged. Precedent: the GoVisit scoped ingestion (`directory/reviews/2026-11-11-govisit.md`). Receipt: `scoped-ingestion.json` in this folder.

## Method

Every accepted repository was fetched at its default branch on November 19, 2026, and scored by the existing pipeline (`parse_skills.py`, `grade.py`, `curate.py`, graded-v2 rubric) as part of a full refresh run that was not published. Only the rows for accepted skills that were not yet listed were copied into the current dataset, with their repository records and an `assessment_date` of 2026-11-19. No manual points. `snapshot_id` was rotated and the site rebuilt.

## Added (12 skills, 8 repositories)

| Skill | Repository | Score |
| --- | --- | --- |
| satori | MetcalfSolutions/Satori | 87 (B) |
| agentswarm-work | andrewsiah/agentswarm-work-skill | 79 (C) |
| cloudgpu-ai-short-drama, cloudgpu-comfyui-images, cloudgpu-discover-compute, cloudgpu-lora-finetune, cloudgpu-open-model-inference | mrhy7176/cloudgpu-agent-skills | 77 (C) each |
| resume-claim-guard | korey2028-prog/resume-claim-guard | 72 (C) |
| socratic-story-cartographer | OakcoderX/awesome-agent-skills | 72 (C) |
| extra-caffeine-workflow | cwong5/extra-caffeine-mcp | 69 (D) |
| redya-xiaohongshu | rnthking/redya-skills | 65 (D) |
| datacircle | waynehamadi/datacircle | 63 (D) |

## Accepted but still not listed

`curate.py` excludes three allowlisted skills under the published listing policy, so they stay out: `github/awesome-copilot` `latchshot-page-capture` and `x-twitter-scraper`, and `apify/agent-skills` `apify-actorization`. Listing them would need a policy decision, not a data change.

## Not included

New requests filed after the run (#427, #428) are not part of this change. Static assessment only; **security_scan_status: not_scanned**.
