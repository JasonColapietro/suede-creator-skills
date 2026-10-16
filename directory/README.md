# Agent Skills Directory data

Source data for [skills.suedeai.ai/directory/](https://skills.suedeai.ai/directory/), a curated index of other people's open-source Agent Skills. Every page under `docs/directory/` is generated from the files here by `scripts/build-directory.mjs`; never edit that HTML by hand.

| File | What it holds | Who writes it |
| --- | --- | --- |
| `skills.json` | One record per listed skill: source repository, SKILL.md metadata, Suede Skill Check results, license, category, and whether it gets its own page | `scripts/directory/curate.py` |
| `labels.json` | The editorial layer: a category for every skill and a one-sentence summary, in the directory's own words, for skills with a page | Reviewed by hand or by an agent, keyed by skill id |
| `categories.json` | The sixteen category directories: slug, title and intro copy | Hand-written |
| `inclusions.json` | Repositories (`owner/repo`) added from accepted listing requests; read on the next refresh even when no curated list cites them | Hand-written |
| `notes.json` | Install routes a publisher documents for a skill whose license restricts copying, shown on that skill's page with a link to the source | Hand-written |
| `exclusions.json` | Repositories (`owner/repo`) and skills (`owner/repo/skill-name`) kept out of the directory, each with a recorded reason: author removal requests, and skills whose text trips the pack's public-source guards (`npm run validate` names the file) | Hand-written |

## Commands

```
npm run build:directory          # rebuild docs/directory/ and the sitemap from the data here
node scripts/build-directory.mjs --check   # part of npm run validate
scripts/directory/refresh.sh     # re-read the source repositories, then rebuild
```

`refresh.sh` clones the curated lists and the repositories they cite, reads every SKILL.md, applies the [published method](https://skills.suedeai.ai/directory/methodology/) and rewrites `skills.json`. It reads files only and never executes anything from a clone. Skills that are new since the last refresh get a keyword category and no page of their own until `labels.json` gives them a category and a summary.

Repository entries in `exclusions.json` are applied before downloading, including repositories also named in `inclusions.json`. Skill-level exclusions are applied during curation. A confirmed unavailable public repository can be recorded with its reason and verification date; transient fetch failures still abort the refresh and never silently drop a selected source.

Pass an optional work directory to reuse downloads: `scripts/directory/refresh.sh /tmp/suede-directory`. Every run fetches the current default branch of both the curated lists and selected repositories before parsing. Reused repositories become detached snapshots; `suede.directoryDefaultBranch` in their local Git configuration records the branch used for source links and install commands. Cached repositories no longer selected are retained but excluded from parsing. A clone/fetch failure or a dirty checkout stops the refresh before it changes the published dataset; preserve or move local edits before retrying.

## Listing requests

Authors add, correct or remove listings through the `Directory listing request` issue form (`.github/ISSUE_TEMPLATE/directory-listing.yml`). An accepted addition is a line in `inclusions.json` followed by `refresh.sh`. A removal is an entry in `exclusions.json` followed by `refresh.sh`, or by re-running `curate.py` on the last parsed snapshot.
