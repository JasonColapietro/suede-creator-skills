# Artist Tools and Sync Packaging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a design-forward Suede skill layer centered on Suedify, copywriting, SEO/AEO/AI EO, QA, progressive feedback, and creative artist campaign tools, while keeping sync/licensing prep free of promo CTAs.

**Architecture:** Keep the existing public skills repo structure. Add new `skills/<name>/SKILL.md` folders with `agents/openai.yaml`, update `mcp/catalog.json` as the source catalog, and refresh README, PROMO, COPY, and GitHub Pages HTML so public installs and CTAs match the new pack.

**Tech Stack:** Markdown skills, static HTML docs, JSON MCP catalog, dependency-free Node MCP server.

---

### Task 1: Add Artist-Facing Skills

**Files:**
- Create: `skills/suede-era-builder/SKILL.md`
- Create: `skills/suede-song-to-universe/SKILL.md`
- Create: `skills/suede-hook-hunter/SKILL.md`
- Create: `skills/suede-release-stunt-lab/SKILL.md`
- Create: `skills/suede-fan-rituals/SKILL.md`
- Create: `skills/suede-visualizer-director/SKILL.md`
- Create: `skills/suede-merch-object-lab/SKILL.md`
- Create: `skills/suede-setlist-theater/SKILL.md`
- Create: `skills/suede-catalog-resurrection/SKILL.md`
- Create: `skills/suede-artist-identity-forge/SKILL.md`
- Create: `skills/suede-collab-matchmaker/SKILL.md`
- Create: `skills/suede-campaign-in-a-box/SKILL.md`
- Create: `skills/suede-sync-packaging/SKILL.md`
- Create: matching `agents/openai.yaml` files for each folder

- [x] Initialize each skill with the system skill initializer.
- [x] Replace placeholder skill bodies with concise artist-facing workflows.
- [x] Ensure each skill has only `name` and `description` frontmatter.
- [x] Ensure each `default_prompt` mentions its `$skill-name`.

### Task 2: Update Catalog and Install Surface

**Files:**
- Modify: `mcp/catalog.json`
- Modify: `README.md`
- Modify: `PROMO.md`
- Modify: `COPY.md`

- [x] Add all 13 new skills to `catalog.skills`.
- [x] Expand the creator plugin from 6 to 19 skills.
- [x] Keep the umbrella install as the simplest public path.
- [x] Update direct install examples to include the new artist tools.
- [x] Reframe the public copy from rights-admin tooling to Suedify, design, copywriting, SEO/AEO/AI EO, QA, and creative artist campaign tooling.
- [x] Add sync packaging copy without a Suede CTA, placement promise, clearance claim, or outreach claim.

### Task 3: Update GitHub Pages Docs

**Files:**
- Modify: `docs/index.html`
- Modify: `docs/plugins.html`
- Modify: `docs/copy.html`
- Modify: `docs/skills/index.html`
- Modify: `docs/skills/suede-workflow-skills.html`

- [x] Change public count from 21 to 34.
- [x] Add an artist tools section and keep sync packaging as a review-prep tool without a promo CTA.
- [x] Update install commands and skill folder lists.
- [x] Keep `@personal` copy local-only.
- [x] Keep public CTAs pointing to GitHub installs and `https://suedeai.ai`.

### Task 4: Validate and Ship

**Files:**
- Review all changed files.

- [x] Count `SKILL.md` files and confirm 34.
- [x] Run a no-dependency skill structure validator.
- [x] Run `node --check mcp/suede-skills-mcp.mjs`.
- [x] Parse `mcp/catalog.json`.
- [x] Smoke-test MCP `initialize`, `list_suede_skills`, and `suede_install_options`.
- [x] Parse docs HTML metadata and JSON-LD.
- [x] Run local link sweep.
- [x] Run `git diff --check`.
- [x] Commit and push to `main`.
- [x] Test public GitHub install commands from a temporary destination.
- [x] Verify GitHub Pages build and live pages.
