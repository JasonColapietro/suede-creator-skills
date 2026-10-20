# Contribute to Suede Awesome Everything

[Awesome Everything](README.md) · [Directory on Suede](https://skills.suedeai.ai/directory/)

## Request a listing, correction or removal

Open a [Directory listing request](https://github.com/JasonColapietro/suede-creator-skills/issues/new?template=directory-listing.yml). Include the source repository, exact skill names and paths, license, intended use, and any required services or installation components. For corrections or removal, link the existing Suede listing and explain the change.

Maintainers review requests under the [directory methodology](https://skills.suedeai.ai/directory/methodology/) and record accepted scope in [inclusions.json](../directory/inclusions.json). Partial acceptance uses an explicit skill-name allowlist. Removals and policy exclusions go in [exclusions.json](../directory/exclusions.json). A repository’s future additions do not expand an existing allowlist.

Appie’s accepted scope is `appie-article-writer`, `appie-chatbot` and `appie-url-shortener`. CoalWash is an editorial plugin feature: its [complete Claude Code installation](featured.md#coalwash) includes commands, hooks and the engine. A skill-folder-only install does not preserve that behavior.

Listing eligibility follows the existing structural, license, language, duplication and editorial rules. Numeric grades measure the saved structural evidence. Quality shields require a listed skill with a verified score of 80–99; editorial selection does not award a shield or security certification. README-badge promotion uses its own evidence ledger. See the [data maintenance guide](../directory/README.md) for those separate processes.

## Edit the source, then regenerate

The Markdown catalog reads the same accepted snapshot as the website. It does not fetch or execute third-party code, install skills, or change the source dataset.

| Change | Source |
| --- | --- |
| Accepted records and score evidence | [directory/skills.json](../directory/skills.json), produced by the existing curation pipeline |
| Editorial skill summaries and classification | [directory/labels.json](../directory/labels.json), applied during curation |
| Category titles and introductions | [directory/categories.json](../directory/categories.json) |
| Featured projects, reviews and setup | [directory/featured-projects.json](../directory/featured-projects.json) |
| Catalog layout and excerpt formatting | [scripts/build-awesome-directory.mjs](../scripts/build-awesome-directory.mjs) |

From the repository root with Node.js 22 or newer:

```sh
npm run build:awesome
npm run test:awesome
node scripts/build-awesome-directory.mjs --check
```

The Awesome generator and its tests use Node built-ins and existing repository code; they need no dependency installation or network access. It writes the index, publisher index, featured page and one page per category. Keep this contribution guide hand-written. All other catalog pages carry a generated-file notice.

The generator recomputes each grade from the saved evidence using the shared rubric. It rejects mismatched grades, duplicate listings, unknown categories, excluded records, records outside accepted scope, and unsupported security claims. Tests check every listing’s coverage and its existing Suede route or anchor, restricted-license labels, publisher credits, Appie scope and CoalWash setup.

## Refresh upstream data

Use the existing pipeline after a reviewed data change:

```sh
scripts/directory/refresh.sh /path/to/reusable-cache
```

This fetches upstream repositories, applies curation, and rebuilds both the website and Awesome pages. It can download many repositories; allow disk space and review the resulting data diff. It reads source files without executing cloned code. Preserve the allowlists and exclusions when reviewing additions, and rerun badge verification after a snapshot changes as documented in the data maintenance guide.

For changes to an already-saved snapshot or category/feature data:

```sh
npm run build:directory
npm test
git diff --check
```

`build:directory` also builds the Awesome catalog. Existing CI runs the generation check through `npm run validate` and the focused tests through `npm test`. The check exits unsuccessfully for missing, edited or orphaned generated pages without changing files. Commit source changes and regenerated Markdown together. The index records the data date and SHA-256; rebuilding never invents a newer upstream verification date.

## Credits and licenses

Credit the original repository owner or team. Preserve source and Suede links when correcting an entry. Saved publisher descriptions are quoted as short excerpts when no editorial summary is available; an ellipsis marks shortening. Each skill keeps its source license, including non-commercial or other restricted terms. This catalog’s inclusion is not permission to redistribute an upstream skill.
