<div align="center">

<img src="docs/assets/readme/hero.svg" alt="Suede Creator Skills — the ship discipline your agent is missing. Open-source skills for Claude Code and Codex." width="100%">

<br><br>

[![Skills: 71](https://img.shields.io/badge/skills-71-c8a96e?labelColor=080808)](#the-skills)
[![Licenses: MIT + BSD](https://img.shields.io/badge/licenses-MIT_%2B_BSD-c8a96e?labelColor=080808)](NOTICE.md)
[![Claude Code](https://img.shields.io/badge/Claude_Code-plugin-c8a96e?labelColor=080808)](#install-in-30-seconds)
[![Codex](https://img.shields.io/badge/Codex-plugin-c8a96e?labelColor=080808)](#install-in-30-seconds)
[![MCP](https://img.shields.io/badge/MCP-stdio_server-c8a96e?labelColor=080808)](#mcp-server)
[![GitHub stars](https://img.shields.io/github/stars/JasonColapietro/suede-creator-skills?style=social)](https://github.com/JasonColapietro/suede-creator-skills/stargazers)

**[Install](#install-in-30-seconds)** · **[The skills](#the-skills)** · **[Docs site](https://skills.suedeai.ai/)** · **[Skill catalog](https://skills.suedeai.ai/skills/)** · **[Blog](https://skills.suedeai.ai/blog/)** · **[MCP](#mcp-server)** · **[@johnnysuede](https://x.com/johnnysuede)**

<sub>By <a href="https://suedeai.ai/founder">Jason Colapietro</a> / <a href="https://suedeai.ai">Suede Labs AI</a></sub>

</div>

---

Your coding agent is fast, capable, and completely unsupervised. It will happily ship the bug, skip the test, publish the slop, and tell you everything went great.

This pack is the supervision: **public, broadly reusable, open-source skill folders** for Claude Code, OpenAI Codex, and any skills-compatible agent. Outcome-bound orchestration, multi-agent teams, code review with a blunt A–F ship grade, AI evals, design, conversion copy, SEO, marketing lanes, mobile app factories, and creator-rights tooling. Every skill is a plain `skills/<name>/SKILL.md` file you can read before you trust it. The original work is MIT licensed, and adapted components carry their upstream notices beside the source. No binaries, no telemetry, no accounts.

<img src="docs/assets/readme/pack-map.svg" alt="The pack at a glance: 41 marketing and growth skills, 10 design copy and SEO, 6 orchestration and workflows, 5 code quality and shipping, 5 creator rights and release, 2 mobile app factories, 2 consumer recovery." width="100%">

## Install in 30 seconds

**Claude Code** — add the marketplace, install the pack:

```text
/plugin marketplace add JasonColapietro/suede-creator-skills
/plugin install suede-skills@suede
```

`suede-skills` installs every skill. Want less? Three focused subsets: `/plugin install suede-marketing@suede` (42 marketing and growth skills), `/plugin install suede-agent-workflows@suede` (Graph-of-Thoughts shipping, orchestration, workflows, evals), and `/plugin install suede-code@suede` (review, grade, ship-gate).

**Codex** — add the Codex-native marketplace, install the complete plugin:

```bash
codex plugin marketplace add JasonColapietro/suede-creator-skills --ref main
codex plugin add suede-skills@suede-codex
```

The Codex plugin loads every skill and registers three read-only MCP discovery profiles. Restart Codex after installing or updating.

**Any agent** (Cursor, Copilot, Windsurf, Claude Code, Codex) via the [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add JasonColapietro/suede-creator-skills
```

**Prefer a clone?** `install.sh` copies every skill into `~/.claude/skills/` and prints the installed count:

```bash
git clone https://github.com/JasonColapietro/suede-creator-skills.git && bash suede-creator-skills/install.sh
```

You can also copy individual skill folders into `.claude/skills/` (project) or
`~/.claude/skills/` (user). One exception: the hardened `suede-graph-flo-xr` JavaScript
workflow also requires the repository's `agents/suede-graph-flo-xr-*.md` profiles in
`~/.claude/agents` and macOS `sandbox-exec`. The `suede-skills` and
`suede-agent-workflows` Claude plugins, plus `install.sh`, install those profiles;
a skill-folder-only or generic skills-CLI install does
not. Codex can use the skill's orchestration contract, but does not execute this
Claude Workflow runner. The caller passes the namespace explicitly on every
launch: `suede-skills` for the full plugin, `suede-agent-workflows` for the
focused plugin, and the empty string for clone or manual user-agent installs.

<details>
<summary><b>More install routes</b> (single-skill Codex installer, project-level copy, MCP)</summary>

<br>

**Codex — install one skill from GitHub:**

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo JasonColapietro/suede-creator-skills \
  --path skills/suede-agent-teams
```

Swap `skills/<skill>` for any skill folder, or pass extra `skills/<name>` paths to install several at once. Restart Codex after installing.

**Claude Code — project-level copy of a single skill:**

```bash
git clone https://github.com/JasonColapietro/suede-creator-skills.git /tmp/suede-creator-skills
mkdir -p .claude/skills
cp -R /tmp/suede-creator-skills/skills/suede-agent-teams .claude/skills/
```

For a user-level install, copy into `~/.claude/skills/` instead. Claude.ai and organization-managed Claude Skills may use upload or admin-managed flows instead of filesystem copy. Review skill contents before enabling code execution.

**MCP — dependency-free stdio server:**

```bash
node mcp/suede-skills-mcp.mjs --profile all
```

Exposes 9 tools (`list_suede_skills`, `list_suede_specialties`, `search_suede_skills`, `get_suede_skill`, `suede_install_options`, `suede_copy_seo_audit`, `suede_visibility_grade`, `suede_code_grade`, `suede_qa_checklist`), 7 resources, and 5 prompts over JSON-RPC.

</details>

## Try it right now

Install the pack, then ask for a code review with a ship grade on your current changes:

```text
Use suede-code to review my staged diff and give it an A-F ship grade.
```

For a nontrivial multi-file change, run the ship DAG:

```text
Use suede-graph-flo-xr to take this change through the canonical Suede DAG: research it, build it in disjoint lanes, refute the review findings, and hand back evidence.
```

If the pack saves you an hour, [star the repo](https://github.com/JasonColapietro/suede-creator-skills/stargazers) — stars are how other builders find it.

## Orchestration: broad outcomes, adversarial review

Tell your agent "max effort, spare no compute, fix everything" and most of the time you get enthusiasm, not engineering. The orchestration lane turns that intent into structure:

- [`suede-graph-flo-xr`](skills/suede-graph-flo-xr) runs a Graph-of-Thoughts shipping search on a repo: generate competing plans, score and prune them, adversarially refute and improve survivors, aggregate compatible lanes, then build, review, and gate only the selected plan. Light/standard/deep are capped at 55/110/200 calls. Production reads only; it never deploys.
- [`suede-agent-teams`](skills/suede-agent-teams) wires complex changes into coordinated agent lanes with WIP collision detection, RFC mode, feature-flag strategy, rollback trees, and a handoff checklist that won't close without evidence. Its public-contribution mode adds scored issue queues, atomic leases, isolated worktrees, and authority-gated contribution packets.
- [`suede-ship-copy`](skills/suede-ship-copy) is a separate copy-only orchestration DAG for one high-stakes piece of writing: five blind research lenses, a claim audit that closes the set of assertable facts, disjoint section writers, adversarial refutation, a deslop pass, and a publish-readiness gate.

## The A–F ship grade

[`suede-code`](skills/suede-code) runs a findings pass (TypeScript, React, Next.js, OWASP, and database checklists), then returns a grade card scoring seven lanes: Correctness, Security and permissions, Data and state, Domain truth, UX and release behavior, Tests and verification, and Deploy readiness. The weakest lane caps the grade, and auth and payment surfaces carry grade caps of their own.

<img src="docs/assets/readme/ship-grade.svg" alt="The ship grade: seven graded lanes and one verdict. Instant-F triggers such as a hardcoded secret lock the grade to F with the exact file and line." width="100%">

If it hits an instant-F trigger — a hardcoded secret, a permission check bypassable via a request param — the grade locks to F with the exact file and line, and no other lane can raise it. A polite review tells you what could be better. A grade tells you whether to ship.

## The skills

Every link below goes to the skill's folder in this repo; the [skill catalog](https://skills.suedeai.ai/skills/) has the same list with install commands per skill.

### Agent orchestration & workflows

| Skill | What it does |
|---|---|
| [`suede-agent-teams`](skills/suede-agent-teams) | Coordinate agent lanes and public contribution programs with collision checks, atomic issue leases, review gates, and a signed handoff |
| [`suede-graph-flo-xr`](skills/suede-graph-flo-xr) | Graph-of-Thoughts repo shipping: search competing plans, score and prune, refute and improve, aggregate compatible lanes, then mutate only the selected plan; 55/110/200-call caps; production reads only, never deploys |
| [`suede-ship-copy`](skills/suede-ship-copy) | Copy-only orchestration DAG for one high-stakes piece: blind research, claim audit, section writers, refutation, publish gate |
| [`suede-ai-eval`](skills/suede-ai-eval) | AI-SPEC artifacts, failure-mode rubrics, eval cases, and acceptance gates for LLM, RAG, classifier, and agent surfaces |
| [`suede-recommend-next-action`](skills/suede-recommend-next-action) | Scores candidate moves on goal fit, unblocking, evidence, urgency, and leverage, then hands back one recommendation as a short runnable prompt |
| [`suede-workflow-skills`](skills/suede-workflow-skills) | Umbrella skill that loads the full pack |

### Code quality & shipping

| Skill | What it does |
|---|---|
| [`suede-code`](skills/suede-code) | Review + A–F grade in one pass |
| [`suede-code-review`](skills/suede-code-review) | Deep findings with Accessibility and SEO lanes, no letter grade |
| [`suede-code-grader`](skills/suede-code-grader) | A–F ship verdict only, 7 lanes, instant-F triggers |
| [`suede-ci-gate`](skills/suede-ci-gate) | Write CI that gates the merge — stack/lockfile detection, one required check, branch protection |
| [`suede-clip-to-guide`](skills/suede-clip-to-guide) | Turn a clip, talk moment, or transcript into a clip-to-guide funnel package with rights routing and an evidence gate |

### Design, copy & SEO

| Skill | What it does |
|---|---|
| [`johnny-suede-design`](skills/johnny-suede-design) | Full design lane: brand and product surfaces, tokens, visual QA |
| [`johnny-suede-write`](skills/johnny-suede-write) | Full writing lane: structure, persuasion frameworks, anti-slop gate, copy score |
| [`suede-design`](skills/suede-design) | Design laws, dark-mode tokens, fluid type, component rules |
| [`suede-copy`](skills/suede-copy) | Conversion copy: headline formulas, A/B variants, anti-slop gate |
| [`suede-deslop`](skills/suede-deslop) | Strips AI writing patterns from prose before it ships: merged kill list, structure fixes, active voice, varied rhythm, and a 50-point score gate |
| [`suede-seo-audit`](skills/suede-seo-audit) | SEO/AEO/AI-EO, metadata, schema, internal-link, and intent audit |
| [`suede-visibility-grader`](skills/suede-visibility-grader) | A–F page grades for findability, clarity, CTA pull, proof, and AI citation readiness |
| [`suede-site-alchemy`](skills/suede-site-alchemy) | Funnel analysis, friction audit, conversion math, ranked quick-wins |
| [`suede-launch-packaging`](skills/suede-launch-packaging) | Package work as a launch: docs, install commands, proof links, QA |
| [`suede-mcp-qa`](skills/suede-mcp-qa) | QA the Suede Skills MCP before it ships |

### Mobile app factories

| Skill | What it does |
|---|---|
| [`site-to-ios-app`](skills/site-to-ios-app) | Convert any website into an App Store-ready iOS app: audit, 4.2 wrapper-risk gate, shell strategy, release gate |
| [`android-app-factory`](skills/android-app-factory) | One prompt to a Play Store-ready native Android app: Kotlin + Jetpack Compose scaffold, Play Billing, ASO listing, signed release |

### Consumer recovery — the negotiation lane, proven outside a repo

| Skill | What it does |
|---|---|
| [`amazon-returns-recovery`](skills/amazon-returns-recovery) | The pack's contract negotiator, run against a real account instead of a repo: scan Amazon order/return history and digital subscriptions (Britbox, Starz, Audible, Kindle Unlimited, and more) for restocking fees, short refunds, and forgotten charges, then drive Amazon live chat to waive, refund, or cancel them — includes a validated click-path and popup workaround for the fee-dispute flow. Real recoveries: $448.31, including a previously denied refund overturned after the return window closed |
| [`subscription-recovery`](skills/subscription-recovery) | Audit recurring charges outside Amazon across App Store, Google Play, PayPal, bank/card evidence, and direct-bill services; report findings first and require confirmation before cancellation or refund contact |

### Creator rights & release

Rights and release-prep tooling for working musicians and creators — see the [skill catalog](https://skills.suedeai.ai/skills/) for each one: [`suede-campaign-in-a-box`](skills/suede-campaign-in-a-box), [`suede-sync-packaging`](skills/suede-sync-packaging), [`suede-release-linter`](skills/suede-release-linter), [`suede-rights-passport`](skills/suede-rights-passport), [`suede-rights-audit`](skills/suede-rights-audit).

### Marketing & growth

Forty-one skills covering paid acquisition and outbound, monetisation, lifecycle and
retention, and the measurement and operations layer — `suede-ads`, `suede-ad-creative`,
`suede-cold-email`, `suede-prospecting`, `suede-public-relations`, `suede-directory-submissions`,
`suede-pricing`, `suede-offers`, `suede-paywalls`, `suede-signup`, `suede-onboarding`,
`suede-churn-prevention`, `suede-emails`, `suede-referrals`, `suede-co-marketing`,
`suede-community-marketing`, `suede-lead-magnets`, `suede-free-tools`, `suede-sms`,
`suede-marketing-loops`, `suede-analytics`, `suede-ab-testing`, `suede-revops`,
`suede-sales-enablement`, `suede-programmatic-seo`, `suede-content-strategy`,
`suede-marketing-plan`, `suede-marketing-psychology`, `suede-marketing-council`, `suede-instagram-growth`, `suede-social`,
`suede-aso`, `suede-video`, `suede-image`, `suede-product-marketing`, `suede-competitors`,
`suede-competitor-profiling`, `suede-customer-research`, `suede-marketing-ideas`,
`suede-ai-seo`, `suede-attribution`.

Adapted from [marketingskills](https://github.com/coreyhaines31/marketingskills) by Corey Haines
under the MIT License — see [NOTICE.md](NOTICE.md).

## From the blog

Essays on why the pack is built the way it is:

- [**71 skills installed. Your agent reads almost none of them.**](https://skills.suedeai.ai/blog/progressive-disclosure-ship-dag-and-mcp.html) — progressive disclosure, Graph-of-Thoughts shipping search, and the MCP layer
- [**Why breadth is free now, and what that changes**](https://skills.suedeai.ai/blog/why-breadth-is-free.html) — the economics of a 73-skill pack
- [**NOT FOR: the two words that make a big skill pack work**](https://skills.suedeai.ai/blog/not-for-the-line-that-makes-a-pack-work.html) — how skills route without colliding
- [**Your memory file is a tax you pay on every prompt**](https://skills.suedeai.ai/blog/memory-belongs-in-skills.html) — why memory belongs in skills
- [**Two new lanes: a next-action recommender and a one-prompt Android app factory**](https://skills.suedeai.ai/blog/android-recommend-next-action-and-workflows.html)

## Public pages

- [GitHub repository](https://github.com/JasonColapietro/suede-creator-skills)
- [GitHub Pages site](https://skills.suedeai.ai/) — public documentation generated from this repo
- [Skill docs catalog](https://skills.suedeai.ai/skills/) — every skill with install and resource links
- [Installs and MCP page](https://skills.suedeai.ai/plugins.html) — install commands plus the Suede Skills MCP
- [Copy bank](https://skills.suedeai.ai/copy.html) ([source](COPY.md)) and [public explainer pack](PROMO.md)
- [S-Tier: the builder's book](https://skills.suedeai.ai/book/) ([source](book/), [PDF](https://skills.suedeai.ai/book/s-tier.pdf)) — a free, roughly 29,900-word book on how Agent Skills work and how to get genuinely good with them

## MCP server

The repo ships a dependency-free stdio MCP server at [`mcp/`](mcp/). It implements `initialize`, `tools/list`, `tools/call`, `resources/list`, `resources/read`, `prompts/list`, and `prompts/get`.

```bash
node mcp/suede-skills-mcp.mjs --profile all
```

| Tools (9) | Resources (7) | Prompts (5) |
|---|---|---|
| `list_suede_skills`, `list_suede_specialties`, `search_suede_skills`, `get_suede_skill`, `suede_install_options`, `suede_copy_seo_audit`, `suede_visibility_grade`, `suede_code_grade`, `suede_qa_checklist` | catalog, specialties, plugins, copy-seo-audit, visibility-grade, code-grade, qa-checklist | discovery and audit prompts |

## Safety

Core local workflows inspect current files, pages, repos, and local folders
without uploading by default or granting new authority. Explicit browser,
deployment, marketplace, publishing, or support workflows may use the
operator's existing authenticated access only when that action is authorized.
The skills do not request secrets, write to a registry, or claim legal
clearance.

The creator skills generate private drafts by default — reports and packages can contain names, payment notes, file names, hashes, rights claims, and provenance notes. Review and redact before publishing or sending outside the intended workflow. A clean report is not a legal opinion, registry write, rights clearance, or payment guarantee.

CLI flags on the creator scripts: `--include-hidden`, `--include-other`, `--include-absolute-paths`, and `--force`. Scripts skip hidden files, secret-like files, dependency folders, and build outputs by default, and refuse to write a package into or under its source folder.

## Status

The creator scripts are dependency-light Python and run on the standard library. Optional enhancements use installed packages when available — Pillow for artwork dimension checks, PyYAML for YAML metadata:

```bash
python3 -m pip install PyYAML
```

## About the creator

**Jason Colapietro** is the founder and CEO of [Suede Labs AI](https://suedeai.ai). He builds programmable IP and creator-ownership infrastructure for AI-native media. He spent years watching hired marketing firms skip the fundamentals on his own products; this pack turns those misses into reusable, inspectable agent workflows instead of one-off fixes.

Follow: [X / @johnnysuede](https://x.com/johnnysuede) · [suedeai.ai](https://suedeai.ai) · [suedeai.ai/founder](https://suedeai.ai/founder)

## License and contributions

Released under the [MIT License](LICENSE).

Contributions are welcome for docs fixes, install-path corrections, lint rules, template improvements, and public-safe workflow improvements. Do not submit private catalogs, unreleased media, credentials, seed phrases, private Suede API details, payment secrets, or third-party copyrighted files.

### Third-party credit

Forty of the marketing and growth skills are adapted from
**[marketingskills](https://github.com/coreyhaines31/marketingskills) by Corey Haines**, used under
the MIT License. That project is the origin of the material — if these skills are useful, the credit
belongs there. Full notice and licence: [NOTICE.md](NOTICE.md),
[licenses/marketingskills-MIT.txt](licenses/marketingskills-MIT.txt).
