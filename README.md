# Suede Creator Skills

![Suede Creator Skills preview](docs/assets/og-image.png)

**Suede Creator Skills** is a public 20-skill pack for AI coding agents,
design-heavy website work, mobile and product surfaces, copywriting, SEO/AEO/AI EO,
Suedify website restyling, QA, and creator
workflows. It includes one umbrella workflow, design and copy lanes, Johnny
Suede writing and design modes, SEO/AEO/AI EO audits, visibility and CTA
grading, site
alchemy, A-F Suede code grades, install support, MCP QA, launch packaging,
ambassador explainers, agent-commerce prep, artist campaign
tools, and creator utility skills.

The pack gives an agent a reusable product workflow: taste, page structure,
copy standards, SEO discipline, reference-site analysis, visual QA, review
gates, and a way to improve as feedback comes in. In this pack, SEO includes
AEO and AI EO: search snippets, answer engines, AI summaries, schema,
sourceable claims, and citation-ready proof. When the agent does something
that works, tell it what to keep. When it misses, tell it exactly what to
change. The next pass should self-correct inside the current work session. You
can also say `Cue Suede` mid-workflow or at the end to bring up choices:
change something, preserve what worked so the agent can mimic it later, or keep
as-is by saying nothing. At the end of meaningful work, the agent should give
two explanations first: a very simple non-coder version, then the usual
breakdown.

Public GitHub users can bring their own company. Use the Johnny Suede umbrella
modes with a company brief, voice, audience, proof, allowed claims, forbidden
claims, CTA, assets, and reference URLs; the workflow should keep the Suede
quality gates while using the user's brand voice and domain language.

Suedify is the marketable site workflow: give the agent a reference URL and a
target URL, then have it study layout, hierarchy, spacing, type, color, motion,
proof structure, and content rhythm before pushing the target toward the
reference with brand-safe design, matched screenshots, token distillation,
copy, SEO, and QA.

`johnny-suede-write` is the one-name writing mode: public copy, company voice,
product and mobile conversion copy, SEO/AEO/AI EO discoverability, CTAs,
launch copy, social/email variants, and anti-generic line editing with
Directness, Rhythm, Trust, Specificity, Authenticity, Density, and
Search/AI readability scoring. `johnny-suede-design` is the one-name design mode: Suedify,
mobile and product surfaces, product screenshots, UI polish, design-system QA,
responsive checks, visual QA, visibility grading, implementation handoff,
company voice, and the full writing mode included.

Suede Visibility Grader turns a public page into an A-F visibility and CTA
brief. It checks whether a site can be found, understood, trusted, cited by AI
systems, acted on, and promoted with rendered design evidence. Suede Code Grader gives code an A-F ship-risk grade with
the reason why across correctness, security, state, UX, tests, deploy readiness,
and public-claim truth. Suede Code Review keeps the deeper findings and fix
brief workflow. Suede Agent Teams adds grouping loops for major work: scout,
constraints mapping, safe parallel build, adversarial review, consensus review,
design visibility review, A-F code grading, WIP protection, quality/eval gates,
release lock, recovery replay, and evidence handoff without lanes stepping on
the same files.

The artist lane turns a song, catalog moment, show, or drop into campaign
material: era systems, song worlds, hook maps, release stunts, fan rituals,
visualizer directions, merch objects, setlist theater, catalog resurrections,
identity guides, collab angles, campaign-in-a-box plans, and sync-style review
packages. Sync packaging stops at clean review prep: no placement promises,
clearance claims, outreach claims, or Suede promo funnel.

Creator utility skills for release metadata, provenance, rights passports, and
royalty notes include evidence tables and severity models for projects that
need them, but they are support tools, not the headline.

The public page presents the workflow as a Suede Creator Passport: website
visits, app opens, Discord joins, X follows, Telegram visits, GitHub installs,
Codex and Claude installs, release linting, transfer packaging, Suede Holder
context, and Suede signing workflows become stampable participation signals.

Suede is creator ownership infrastructure for programmable IP, registry-backed
media, royalty routing, licensing readiness, and agent commerce. These skills
are public-safe: they inspect current files, pages, repos, and local folders,
but they do not upload files, write to a registry, call private Suede services,
request secrets, or claim legal clearance.

For the full concept, including what the Passport is, what it gates, which
signals become stamps, and what intentionally ships later, see
[`PASSPORT.md`](PASSPORT.md).

## Public Page

- [GitHub Pages site](https://jasoncolapietro.github.io/suede-creator-skills/) - the actual public documentation generated from this GitHub repository, not a separate marketing site.
- [GitHub repository](https://github.com/JasonColapietro/suede-creator-skills)
- [Suede Creator Passport concept](PASSPORT.md)
- [Suede Ambassador Explainer Pack](PROMO.md) - long-form public guide for ambassadors, founders, builders, agencies, creators, AI power users, Suedify, MCP, skills, social posts, emails, SEO/AEO/AI EO metadata, FAQ, and claim boundaries.
- [Suede Creator Skills copy bank](COPY.md) - public copy for GitHub descriptions, docs pages, CTAs, SEO/AEO/AI EO snippets, FAQs, social posts, and safety language.
- [Copy bank page](https://jasoncolapietro.github.io/suede-creator-skills/copy.html) - live copy bank for sharing, explaining, and documentation work.
- [Public installs and MCP page](https://jasoncolapietro.github.io/suede-creator-skills/plugins.html) - GitHub skill install commands plus the Suede Skills MCP server for skill discovery, SEO/AEO/AI EO copy audits, install guidance, and QA checklists.
- [Skill docs catalog](https://jasoncolapietro.github.io/suede-creator-skills/skills/) - public catalog with primary skill pages, install links, manifests, scripts, folders, and resource maps.
- [Suede Agent Teams docs](https://jasoncolapietro.github.io/suede-creator-skills/skills/suede-agent-teams.html) - controlled max-agent loops for scout, safe parallel build, adversarial review, visibility grading, code grading, release lock, recovery, and evidence handoff.
- [Suede Rights Passport docs](https://jasoncolapietro.github.io/suede-creator-skills/skills/suede-rights-passport.html) - full documentation for transfer package generation, provenance, credits, splits, licenses, Suede intake JSON, templates, safety defaults, and install prompts.
- [Suede Release Linter docs](https://jasoncolapietro.github.io/suede-creator-skills/skills/suede-release-linter.html) - full documentation for music release linting, metadata checks, missing-file detection, rights blockers, report outputs, templates, and Suede next steps.

## Quick Start

Install the umbrella workflow and call it for design, copy, SEO/AEO/AI EO, or
Suedify work:

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo JasonColapietro/suede-creator-skills \
  --path skills/suede-workflow-skills
```

Example prompts:

```text
Use $suedify. Study https://apple.com and push https://example.com toward that design language with brand-safe design, copy, SEO/AEO/AI EO, and QA.
```

```text
Use $suede-workflow-skills to rewrite this page, audit SEO/AEO/AI EO, check design quality, and run final QA.
```

```text
Use $johnny-suede-write for my company with our brand voice.
Company: Acme Robotics.
Audience: operations leaders at mid-market manufacturers.
Voice: precise, practical, slightly bold, never hype.
Proof: customer quotes, uptime reports, factory screenshots, install docs.
Forbidden claims: no guaranteed savings, no unverified rankings, no fake logos.
Primary CTA: book a plant-floor workflow review.
```

```text
Use $johnny-suede-design for my company. Redesign this landing page with our
voice, proof, CTA, assets, and reference URLs while keeping the full design,
copy, SEO/AEO/AI EO, visual QA, and ship-gate workflow.
```

Utility scripts are available when the project needs local creator reports:

```bash
git clone https://github.com/jasoncolapietro/suede-creator-skills.git
cd suede-creator-skills

python3 skills/suede-release-linter/scripts/lint_release.py \
  /path/to/music-project \
  --output /path/to/release-lint-output

python3 skills/suede-rights-passport/scripts/create_transfer_package.py \
  /path/to/creator-project \
  --output /path/to/suede-transfer-package \
  --metadata /path/to/creator-project/metadata.json \
  --project-title "Project Title" \
  --artist "Artist Name"
```

Both scripts skip hidden files, secret-like files, dependency folders, build
outputs, and unrecognized file types by default.

## Ambassador Explainer Pack

Use [`PROMO.md`](PROMO.md) when explaining the full Suede workflow publicly. It
includes founder, designer, developer, agency, creator, and AI power-user
positioning plus reusable copy for Suedify, Suede Workflow Skills, Suede
Creator Skills, the optional MCP, install listings, social posts, DMs, email,
SEO/AEO/AI EO metadata, FAQ answers, objection handling, and safe claim boundaries.

The ambassador rule: explain the outcome first. Suede gives agents a repeatable
workflow for design, copywriting, SEO/AEO/AI EO, Suedify site restyling, code
review with A-F Suede grades, visibility and CTA grading, QA, agent-team
coordination, and optional MCP-assisted discovery. Keep local install details
such as `@personal` inside technical setup sections.

Founder context for ambassadors: the workflow was built from live pressure, not
theory — turning repeated agent failures into reusable rules. The core
conviction is that public work is not done until it is findable across Google,
Gemini, and AI result surfaces, readable to AI systems, backed by proof, and
clear enough for a real visitor to act.

Safety-oriented CLI flags:

- `--include-hidden`: include hidden files and folders, while still skipping
  secret-like files.
- `--include-other`: include unrecognized file types in inventories.
- `--include-absolute-paths`: write absolute local paths into reports for
  private operator workflows. Reports use share-safer paths by default.
- `--force`: replace existing generated report/package files.

## Install Public Skills Or Use MCP

Suede skills can be installed from this public GitHub repo as plain Codex
skills. Use the Suede Skills MCP when structured discovery, install guidance,
SEO/AEO/AI EO copy audit scaffolds, or QA checklists would help the agent.

Public Codex skill installs:

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo JasonColapietro/suede-creator-skills \
  --path skills/suede-workflow-skills
```

Install individual workflow and operations skills when you want direct triggers:

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo JasonColapietro/suede-creator-skills \
  --path skills/johnny-suede-design \
  skills/johnny-suede-write \
  skills/suede-code \
  skills/suede-ship-gate \
  skills/suede-seo-audit \
  skills/suede-visibility-grader \
  skills/suede-site-alchemy \
  skills/suede-launch-packaging \
  skills/suede-mcp-qa
```

Install creator skills:

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo JasonColapietro/suede-creator-skills \
  --path skills/suede-campaign-in-a-box \
  skills/suede-sync-packaging \
  skills/suede-release-linter \
  skills/suede-rights-passport \
  skills/suede-rights-audit
```

Restart Codex after installing new skills.

Local personal marketplace plugin installs:

```bash
codex plugin add suede-workflow-skills@personal
codex plugin add suede-creator-skills@personal
```

These commands are for a local Codex personal marketplace where the Suede plugin
sources are registered. They are not the public install route.

Optional MCP server names:

- `suede_workflow_mcp`
- `suede_creator_mcp`

The public repo also includes the dependency-free stdio MCP server:

```bash
node mcp/suede-skills-mcp.mjs --profile all
```

MCP tools:

- `list_suede_skills`
- `get_suede_skill`
- `suede_install_options`
- `suede_copy_seo_audit`
- `suede_visibility_grade`
- `suede_code_grade`
- `suede_qa_checklist`

## Skills Included

### Suede Workflow Skills

Folder: [`skills/suede-workflow-skills`](skills/suede-workflow-skills)

Install the public umbrella workflow when you want one skill to load the Suede
design, anti-slop copy, SEO/AEO/AI EO, site polish, visibility and CTA grading,
code review with A-F Suede grades, visual QA, launch, install support, MCP QA,
ambassador explanation, agent-commerce, Suedify, progressive feedback,
two-level final explanations, Cue Suede choices, max-agent grouping loops,
artist campaign, and creator utility workflow. The repository now ships **20
public skill folders**.

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo JasonColapietro/suede-creator-skills \
  --path skills/suede-workflow-skills
```

Individual workflow and operations skills (14):

- [`skills/johnny-suede-design`](skills/johnny-suede-design)
- [`skills/johnny-suede-write`](skills/johnny-suede-write)
- [`skills/suede-agent-teams`](skills/suede-agent-teams)
- [`skills/suede-code`](skills/suede-code)
- [`skills/suede-code-grader`](skills/suede-code-grader)
- [`skills/suede-code-review`](skills/suede-code-review)
- [`skills/suede-copy`](skills/suede-copy)
- [`skills/suede-design`](skills/suede-design)
- [`skills/suede-ship-gate`](skills/suede-ship-gate)
- [`skills/suede-seo-audit`](skills/suede-seo-audit)
- [`skills/suede-visibility-grader`](skills/suede-visibility-grader)
- [`skills/suede-site-alchemy`](skills/suede-site-alchemy)
- [`skills/suede-launch-packaging`](skills/suede-launch-packaging)
- [`skills/suede-mcp-qa`](skills/suede-mcp-qa)

Creator skills (5):

- [`skills/suede-campaign-in-a-box`](skills/suede-campaign-in-a-box)
- [`skills/suede-sync-packaging`](skills/suede-sync-packaging)
- [`skills/suede-release-linter`](skills/suede-release-linter)
- [`skills/suede-rights-passport`](skills/suede-rights-passport)
- [`skills/suede-rights-audit`](skills/suede-rights-audit)

### Suede Rights Passport

![Suede Rights Passport preview](docs/assets/rights-passport-preview.png)

Folder: [`skills/suede-rights-passport`](skills/suede-rights-passport)

Turn a messy creator folder into a Suede-ready transfer package. The skill
inventories media, documents, lyrics, artwork, stems, credits, splits, licenses,
provenance notes, missing rights information, and optimization blockers.

Outputs include:

- `RIGHTS_PASSPORT.md`
- `suede-intake.json`
- `provenance.md`
- `credits-and-splits.md`
- `license-notes.md`
- `optimization-brief.md`
- `missing-info-report.md`

Run it locally:

```bash
python3 skills/suede-rights-passport/scripts/create_transfer_package.py \
  /path/to/creator-project \
  --output /path/to/suede-transfer-package \
  --project-title "Project Title" \
  --artist "Artist Name" \
  --copy-assets
```

The script refuses to write the package into or under the source folder and
requires `--force` before replacing existing generated package files.

To prefill the package with known rights facts, pass `--metadata` with a
public-safe JSON, YAML, or key=value text metadata file. Do not point metadata
at real `.env`, credential, wallet, or deployment config files. Metadata can
provide project title, artist, owner claim, ownership status, contributor
confirmations, splits status, sample status, clearance notes, wallet/payment
destination, release history, public URLs, and provenance notes. Unknown or
unconfirmed facts remain flagged in the generated reports.

### Suede Release Linter

![Suede Release Linter preview](docs/assets/release-linter-preview.png)

Folder: [`skills/suede-release-linter`](skills/suede-release-linter)

Audit a song, album, catalog, stem pack, or media project before release,
licensing, registry preparation, agent commerce, or Suede intake. The linter
checks for missing title, artist, metadata, final masters, artwork, lyrics,
stems, contributors, split totals, sample status, release history, provenance
notes, and Suede-readiness blockers.

Outputs include:

- `release-lint-report.md`
- `release-lint-report.json`

Run it locally:

```bash
python3 skills/suede-release-linter/scripts/lint_release.py \
  /path/to/music-project \
  --output /path/to/release-lint-output
```

With metadata:

```bash
python3 skills/suede-release-linter/scripts/lint_release.py \
  /path/to/music-project \
  --metadata /path/to/music-project/metadata.json \
  --output /path/to/release-lint-output
```

## Install For Codex

Codex skills live in `$CODEX_HOME/skills`, falling back to `~/.codex/skills`
when `CODEX_HOME` is not set.

```bash
git clone https://github.com/jasoncolapietro/suede-creator-skills.git
cd suede-creator-skills

mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/suede-rights-passport "${CODEX_HOME:-$HOME/.codex}/skills/"
cp -R skills/suede-release-linter "${CODEX_HOME:-$HOME/.codex}/skills/"
```

Example Codex prompts:

```text
Use $suede-release-linter to audit this album folder for release readiness.
```

```text
Use $suede-rights-passport to prepare this creator project as a Suede transfer package.
```

## Install For Claude Code

Quick install (all 20 skills):

```bash
git clone https://github.com/JasonColapietro/suede-creator-skills.git && bash suede-creator-skills/install.sh
```

Claude Code skills use `SKILL.md` files in `.claude/skills/` directories. For a
project-level install:

```bash
git clone https://github.com/jasoncolapietro/suede-creator-skills.git /tmp/suede-creator-skills
cd /path/to/your-project

mkdir -p .claude/skills
cp -R /tmp/suede-creator-skills/skills/suede-rights-passport .claude/skills/
cp -R /tmp/suede-creator-skills/skills/suede-release-linter .claude/skills/
```

For a user-level install:

```bash
mkdir -p ~/.claude/skills
cp -R skills/suede-rights-passport ~/.claude/skills/
cp -R skills/suede-release-linter ~/.claude/skills/
```

Example Claude Code prompts:

```text
Use the suede-release-linter skill to check this release folder.
```

```text
Use the suede-rights-passport skill to organize this catalog for Suede intake.
```

Claude.ai and organization-managed Claude Skills may use upload or admin-managed
skill flows instead of direct filesystem copy. Review the skill contents before
enabling code execution.

## How The Workflow Fits Together

```text
creator folder
  -> release metadata lint
  -> missing info and rights fixes
  -> Suede Rights Passport package
  -> Suede review, registry readiness, royalty routing, licensing, optimization
```

Use the linter first when you want a fast audit. Use the Rights Passport when
you are ready to create a durable transfer package for Suede review and
optimization.

## Full Linkset

These public links are also passport stamp locations. The page frames each
creator action as a stampable signal: visit, join, follow, install, lint, and
passport.

Suede public links:

- Website: <https://suedeai.ai>
- App / Vaults: <https://app.suedeai.ai>
- Long-form site: <https://suedeai.org>
- Follow on X: <https://x.com/aisuede>
- Join Discord: <https://discord.gg/suedeai>
- Telegram: <https://t.me/suedeai>

Project links:

- GitHub repository: <https://github.com/JasonColapietro/suede-creator-skills>
- GitHub Pages site: <https://jasoncolapietro.github.io/suede-creator-skills/>
- Skill docs catalog: <https://jasoncolapietro.github.io/suede-creator-skills/skills/> - public index for every Suede Creator Skill and its install/resource links.
- Ambassador guide source: [PROMO.md](PROMO.md) - full public explanation kit for Suede skills, MCP, Suedify, SEO/AEO/AI EO audits, QA, social posts, emails, FAQ, and claim boundaries.
- Copy bank page: <https://jasoncolapietro.github.io/suede-creator-skills/copy.html> - live GitHub, docs, CTA, SEO/AEO/AI EO, FAQ, social, and safety copy for Suede Creator Skills.
- Copy bank source: [COPY.md](COPY.md) - reusable public copy for repo metadata, skill pages, install surfaces, launch posts, and claim boundaries.
- Public installs and MCP page: <https://jasoncolapietro.github.io/suede-creator-skills/plugins.html> - GitHub skill install commands and Suede Skills MCP docs for skill discovery, SEO/AEO/AI EO copy audits, install guidance, and QA checklists.
- MCP source: [mcp/](mcp/) - dependency-free stdio MCP server, catalog, and MCP README.
- Suede Rights Passport docs: <https://jasoncolapietro.github.io/suede-creator-skills/skills/suede-rights-passport.html> - transfer package docs for creator rights, provenance, splits, license notes, intake JSON, and optimization briefs.
- Suede Release Linter docs: <https://jasoncolapietro.github.io/suede-creator-skills/skills/suede-release-linter.html> - release-readiness docs for metadata, artwork, masters, lyrics, stems, credits, samples, reports, and Suede blockers.
- Rights Passport skill: [skills/suede-rights-passport/SKILL.md](skills/suede-rights-passport/SKILL.md)
- Rights Passport script: [skills/suede-rights-passport/scripts/create_transfer_package.py](skills/suede-rights-passport/scripts/create_transfer_package.py)
- Rights Passport OpenAI metadata: [skills/suede-rights-passport/agents/openai.yaml](skills/suede-rights-passport/agents/openai.yaml)
- Rights Passport references: [skills/suede-rights-passport/references/](skills/suede-rights-passport/references/)
- Rights Passport templates: [skills/suede-rights-passport/assets/](skills/suede-rights-passport/assets/)
- Release Linter skill: [skills/suede-release-linter/SKILL.md](skills/suede-release-linter/SKILL.md)
- Release Linter script: [skills/suede-release-linter/scripts/lint_release.py](skills/suede-release-linter/scripts/lint_release.py)
- Release Linter OpenAI metadata: [skills/suede-release-linter/agents/openai.yaml](skills/suede-release-linter/agents/openai.yaml)
- Release Linter references: [skills/suede-release-linter/references/](skills/suede-release-linter/references/)
- Release Linter templates: [skills/suede-release-linter/assets/](skills/suede-release-linter/assets/)
- Passport concept: [PASSPORT.md](PASSPORT.md)
- Page source: [docs/index.html](docs/index.html)
- Skill docs source: [docs/skills/](docs/skills/)

Platform references:

- OpenAI Skills examples: <https://github.com/openai/skills>
- Claude Code skills documentation: <https://docs.claude.com/en/docs/claude-code/skills>
- Claude Skills help center: <https://support.claude.com/en/articles/12512180-using-skills-in-claude>

Suede language to preserve:

- creator ownership infrastructure
- programmable IP
- provenance
- registry-backed media
- royalty routing
- licensing readiness
- rights-aware media workflows
- agent commerce

Passport stamp language:

- website visit
- app visit
- Discord join
- X follow
- Telegram visit
- GitHub install, star, or fork
- Codex install
- Claude install
- Suede Holder participation stamp
- Suede signing workflow
- release lint
- rights passport package
- future engagement signal
- careful participation trail

## About the Creator

**Jason Colapietro** is the founder and CEO of [Suede Labs AI](https://suedeai.ai), a published author, and a Forbes contributor. He builds programmable IP and creator ownership infrastructure for AI-native media.

> "The gap in the creator economy isn't talent. It's the gap between the moment you make something and the moment you own it in a form that can be licensed, monetized, and defended."

> "Rights metadata is the dark matter of the creative economy. It governs everything. Almost nobody can see it."

> "Every piece of music that enters the world has a signal chain. The IP chain is just the part most musicians never mapped until now."

> "Build what doesn't exist yet. Register that you built it. That sequence is the whole game."

### Books by Jason Colapietro

- **[The Signal Chain](https://guitar.solutions)**: Illustrated electric-guitar tone history, memoir, method, and workbook editions. From pickup to speaker, from gear to IP. (guitar.solutions)
- **[The Guitar Without a Number](https://www.amazon.com/stores/author/B0GD5FX6N6)**: Memoir-driven guitar instruction for the self-taught player. Theory, tone, artist songbooks, and a music IP rights chapter. (Amazon author store)
- **[Suede Labs: The Human Authenticity Layer](https://www.amazon.com/dp/B0GD5FX6N6)**: How ownership, origin, and AI redraw the creative map. (Kindle)
- **[Proof as Infrastructure](https://www.amazon.com/dp/B0GMB2VLXQ)**: Designing durable systems without trust assumptions. (Kindle)
- **[Stake Your Claim](https://www.amazon.com/dp/B0GRG8LGQQ)**: Hard truths on turning the AI era into a real asset. (Kindle)

Follow: [X / @johnnysuede](https://x.com/johnnysuede) · [suedeai.ai](https://suedeai.ai) · [suedeai.ai/founder](https://suedeai.ai/founder)


## Public Safety

A clean lint report or completed transfer package is not a legal opinion,
distributor approval, registry write, or rights clearance. These skills prepare
materials so creators, Suede, and advisors can review the work with better
structure.

Generated reports and transfer packages are private drafts by default. They can
contain creator names, wallet/payment notes, file names, hashes, rights claims,
contributor details, restrictions, and provenance notes. Review and redact them
before publishing, committing, or sending outside the intended workflow.

## Status

The scripts are dependency-light Python and run with the standard library.
Optional enhancements use installed packages when available, such as Pillow for
artwork dimension checks or PyYAML for YAML metadata parsing.

YAML metadata support requires PyYAML:

```bash
python3 -m pip install PyYAML
```

## License And Contributions

Released under the [MIT License](LICENSE).

Contributions are welcome for docs fixes, install-path corrections, lint rules,
template improvements, and public-safe workflow improvements. Do not submit
private catalogs, unreleased media, credentials, seed phrases, private Suede API
details, payment secrets, or third-party copyrighted files.
