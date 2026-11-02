# Trong Hieu agent skills: scoped editorial feature

Accepted scope: thirteen skills from [`tronghieu/agent-skills@831d1ae5c686a81b10f9c5b9cca04a7b8b97303d`](https://github.com/tronghieu/agent-skills/tree/831d1ae5c686a81b10f9c5b9cca04a7b8b97303d), which was the head of the default branch `main` on November 1, 2026. The feature is published at `/featured/#trong-hieu` with a feature date of November 2, 2026, and carries the featured README badge for that section.

## Accepted scope and scores

Each accepted skill scores 80 or higher in `directory/skills.json` (snapshot of October 22, 2026, `graded-v2`) and passes all eight checks. The feature links each skill to its directory listing: its full page where one exists, otherwise its row on the [repository page](https://suedeai.directory/tronghieu/agent-skills/).

| Skill | Score | Grade | Listing |
| --- | ---: | :---: | --- |
| brainstorm-coach | 88 | B | Repository row |
| critical-thinking | 90 | A | Full page |
| cv-scorer | 83 | B | Repository row |
| data-scientist | 86 | B | Full page |
| design-thinking | 90 | A | Repository row |
| fiction-studio | 86 | B | Full page |
| market-researcher | 86 | B | Full page |
| problem-solver | 88 | B | Repository row |
| product-manager | 88 | B | Repository row |
| project-manager | 88 | B | Full page |
| scrum-master | 90 | A | Full page |
| socratic-questor | 86 | B | Repository row |
| strategy-board | 84 | B | Full page |

The repository's other six listed skills (`bmad-run-inspector`, `deep-reader`, `diataxis-writer`, `manual-tester`, `slidewright` and `system-prompt-creator`) keep their existing listings, scores and badges and are outside this feature. The feature does not change `skills.json`, `inclusions.json` or any score.

## Source revision

The catalog records read revision `f923333754b1fcf45c443cae1ebe8c9886162207` (October 18, 2026). Two commits separate it from the review pin: `fea59e4` adds evidence-based job-description scoring and validation to `cv-scorer`, and `831d1ae` adds the directory badge to the README. The other twelve accepted skill folders are identical at both revisions. At the pin, `cv-scorer` also bundles a standard-library Python report script with tests, evals and fixtures; its catalog record updates at the next directory refresh.

## License

The root [MIT license](https://github.com/tronghieu/agent-skills/blob/831d1ae5c686a81b10f9c5b9cca04a7b8b97303d/LICENSE) (Copyright (c) 2026 Hieu T. Luu) covers the reviewed source. None of the thirteen SKILL.md files declares the optional `license` frontmatter field.

## Metadata warnings: 25 retained

The strict metadata scan of the accepted scope retained 25 raw warnings. All 25 are kept as raw output; none is suppressed. They fall into two kinds, and the counts match the pinned source:

- **13 absent license fields**, one per skill. Disposition: the frontmatter field is optional, and the root MIT license applies to the reviewed source.
- **12 descriptions over 512 characters.** Every accepted description except `cv-scorer` (266 characters) runs from 596 to 983 characters. Disposition: the strict scanner applies a 512-character rule; the Agent Skills specification and the directory's `description_length` check allow up to 1,024 characters, and every accepted description fits within that allowance.

These dispositions apply to this scoped feature only. They do not relax a scanner rule or suppress warnings for any other skill or repository.

## ZIP packages excluded

The repository ships one ZIP package per skill under `skills/` (19 at the pin). None of the thirteen accepted ZIP packages contains a license file, so the ZIP packages are outside the feature. Install from the skill folders, where the root MIT license travels with the repository. A repository license check is not treated as evidence that a separately distributed ZIP includes its license.

## Setup facts

Every accepted skill is instruction-based with bundled references. The bundled scripts run locally and make no network requests:

- Shell scripts create local workspaces for `critical-thinking`, `design-thinking`, `market-researcher`, `product-manager`, `project-manager` and `scrum-master`.
- `cv-scorer`, `fiction-studio` and `strategy-board` bundle Python scripts that use the standard library only.
- `data-scientist` bundles `profile_data.py` and `baseline_model.py`, which use pandas and NumPy; `baseline_model.py` also uses scikit-learn.

The publisher's README offers a whole-collection install. The feature points readers to the individual skill listings instead, so an install stays within the accepted scope.

## Review method

The pinned source was read as data from a shallow clone. No submitted scripts, packages, install hooks or commands were executed. The README's broader-collection listing badge describes the repository listing, not this thirteen-skill feature.

## Outcome

Accepted for a scoped editorial feature at `/featured/#trong-hieu` with the featured README badge snippet. Editorial selection is independent of quality scoring and README-badge verification; no promotion verification record is created. Catalog security status remains `not_scanned`.
