# RedYA Xiaohongshu: accepted scope and source review

Application: [issue #408](https://github.com/JasonColapietro/suede-creator-skills/issues/408). Assessed November 19, 2026 at [a833171c4b126a226a31f8680118fa8df29796cc](https://github.com/rnthking/redya-skills/tree/a833171c4b126a226a31f8680118fa8df29796cc). Scope: the single MIT-licensed `redya-xiaohongshu` skill at `skill/redya-xiaohongshu`.

## Assessment

Required frontmatter and six of seven graded checks pass: name format, name matching its folder, description length, body of 500 lines or fewer (398), a declared license (repository `LICENSE`, MIT) and a commit within 12 months (November 9, 2026). The description trigger check does not pass because the description is in Chinese, which the English trigger detector does not read. That still meets the structural listing threshold.

The Chinese description does not pass the directory's default language filter. The [owner's approval](https://github.com/JasonColapietro/suede-creator-skills/issues/408#issuecomment-7022652379) accepts the original description as written, recorded as a `language_exceptions` entry for this exact name and path. **Translation is not a condition of acceptance.** The rubric is unchanged; the skill is scored by the existing graded-v2 pipeline at the next regular catalog refresh, with no manual points.

## Accepted scope

`directory/inclusions.json` records the repository, the `redya-xiaohongshu` allowlist and the exact `skill/redya-xiaohongshu` path. The repository's separate `mcp/` Node server, README assets and docs are outside this approval, so the whole-repository install route stays hidden. Future additions are outside this approval. The category is set to Marketing and SEO in `labels.json`, because the automatic classifier would file it under developer tools on the word "API".

## Data flow and requirements

The skill is a single `SKILL.md` of instructions with no bundled scripts. It tells the agent to call the RedYA open API with curl, sending the user's `REDYA_API_KEY` in an `Authorization` header to RedYA's own host (overridable by `REDYA_BASE_URL`). No other outbound host or hidden call was found. Users obtain the key from a RedYA account. Outlines, images, link parsing, AI Live Photos and sensitive-word checks spend RedYA credits; the skill tells the agent to show the price and get consent before paid Live Photos. Prompts and images go to RedYA's servers, which the skill says keep generation records. It drafts content and does not post to Xiaohongshu. Its link-parsing feature reads another creator's public post or video transcript as reference material; rights in that material remain the user's responsibility. These requirements are published as the listing note in `notes.json`.

This was structural assessment and targeted read-only source inspection. No submitted code, API call, account sign-in or paid generation was run. No full malware/security scan or runtime validation was performed. **security_scan_status: not_scanned.**

## Editorial disposition

Accepted for the next regular scored-catalog refresh. No Featured placement, grade claim or security certification is part of this decision. The owner's reply on the application gives the maintainer the listing badge snippet and a link to star this repository.
