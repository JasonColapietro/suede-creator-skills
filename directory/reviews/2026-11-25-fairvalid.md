# FairValid: accepted scope and source review

Application: [issue #445](https://github.com/JasonColapietro/suede-creator-skills/issues/445). Assessed November 25, 2026 at [40cac2883dc74f50f7bc8562b380782c4c6a4379](https://github.com/moonlitnayeem/fairvalid-ai/tree/40cac2883dc74f50f7bc8562b380782c4c6a4379). Scope: the two MIT-licensed skills `email-verification` at `skills/email-verification` and `fairmatch-leads` at `skills/fairmatch-leads`.

## Assessment

Both skills pass required frontmatter and all seven graded checks when parsed with `scripts/directory/parse_skills.py` and checked with `grade.run_checks`: name format, name matching its folder, description length, a description that says when to use the skill, a body of 500 lines or fewer, a declared license (repository `LICENSE`, MIT) and a commit within 12 months (November 19, 2026). Neither trips a listing-policy rule in `curate.py`, the content filter or the language filter. The rubric is unchanged; both skills are scored by the existing graded-v2 pipeline at the next catalog refresh, with no manual points.

## Accepted scope

`directory/inclusions.json` records the repository, the two-skill allowlist and the exact `skills/` paths. The repository also carries same-named copies for other agents under `claude/`, `devin/`, `openai/` and `openclaw/`, plus integration files; all of those are outside this approval, so the whole-repository install route stays hidden. Future additions are outside this approval. Both skills are filed under Marketing and SEO in `labels.json`, because the automatic classifier would file them under productivity.

## Data flow and requirements

Each skill is a single `SKILL.md` of instructions with no bundled scripts. Both tell the agent to use FairValid's hosted MCP server at `mcp.fairvalid.com`, connected through OAuth on fairvalid.com. No other outbound host or hidden call was found. Both need a FairValid account; verifications and lead unlocks spend workspace credits. The applicant states that eligible workspaces receive a monthly free credit allowance with optional paid credits; that was not verified here. `fairmatch-leads` requires the user to confirm the selected leads and a numeric credit maximum before any unlock, retrieves only leads owned by the connected workspace, and states that it sends no outreach. It is a licensed business-contact service, not scraping of a social network or map listing. These requirements are published as the listing notes in `notes.json`.

This was structural assessment and targeted read-only source inspection. No submitted code, API call, account sign-in or paid credit use was run. No full malware/security scan or runtime validation was performed. **security_scan_status: not_scanned.**

## Editorial disposition

Accepted for the next scored-catalog refresh. No Featured placement, grade claim or security certification is part of this decision. The owner's reply on the application gives the maintainer the listing badge snippet and a link to star this repository.
