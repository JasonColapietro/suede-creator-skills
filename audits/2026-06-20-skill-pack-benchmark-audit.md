# Skill Pack Benchmark Audit

Date: 2026-06-20
Target: `/Users/jason/Documents/Ramboed/suede-creator-skills`
Scope: current local filesystem, 38 `SKILL.md` folders
Benchmark rule: compare against anonymous high-performing patterns in each niche. Do not name or refer to external exemplars in the audit.

## Agent-Team Contract

Objective: audit every skill in the current pack against best-in-class behavior for its niche, then identify the fastest path to make the pack stronger.

Target: local repo only. No publish, commit, or live-site claim in this pass.

Constraints:

- Preserve existing WIP.
- Do not stage, revert, or overwrite existing modified files.
- Include the current committed skill folders and this audit artifact.
- Keep benchmark references anonymous.

Lanes:

- Scout: repo state, inventory, catalog, metadata, docs references.
- Benchmark: anonymous niche rubric for workflow, design, copy, SEO, code review, artist campaign, rights, install, MCP, and commerce skills.
- Audit: grade every skill.
- Review: identify pack-level blockers and sequencing.
- Handoff: capture evidence, caveats, and next action.

Done signal:

- 38 skills accounted for.
- Catalog and filesystem compared.
- Each skill receives a grade, strongest asset, main gap, and top fix.
- Pack-level blockers and fix waves are named.

## Current State

- Branch: `main...origin/main`.
- HEAD: `dcaa3fa Clarify Johnny Suede mode cross-links`.
- No tracked diffs at final verification.
- The only untracked repo item is this audit folder: `audits/`.
- The Johnny Suede skill folders and docs pages are tracked in current HEAD.
- Local filesystem has 38 `SKILL.md` files.
- `mcp/catalog.json` has 38 skill entries.
- Local manifest check found no missing frontmatter names, folder/name mismatches, missing `agents/openai.yaml`, or catalog/filesystem mismatches.
- `git diff --check` passed.
- `node --check mcp/suede-skills-mcp.mjs` passed.

## Benchmark Rubric

A-level skills act like reusable operating procedures:

- clear trigger and non-trigger boundaries;
- explicit source-truth and intake requirements;
- ordered workflow with branch points;
- output contract the agent can fill without guessing;
- verification or evidence gate;
- safety boundaries for secrets, rights, claims, legal, payments, or publishing;
- concrete examples, templates, scripts, or references;
- install and discovery metadata aligned with docs and catalog.

B-level skills are usable and differentiated, but need examples, deeper niche scoring, or stronger verification.

C-level skills have a useful concept and basic output, but read more like prompt cards than durable operating procedures.

D-level skills are too shallow, ambiguous, or risky to promote without a focused rewrite.

## Pack-Level Findings

### P1: The pack is uneven

The strongest skills are full operating systems: `suedify`, `suede-design`, `suede-code-review`, `suede-agent-teams`, `suede-copy`, `suede-site-alchemy`, `suede-visibility-grader`, `suede-code-grader`, `suede-release-linter`, and `suede-rights-passport`.

The weaker skills are mostly short operator and utility micro-skills. They have good positioning and output shapes, but not enough intake, scoring, examples, or verification to compete in their niches.

Fix: upgrade the short skills to a shared v2 template with intake, evidence, scoring, output, safety, and verification sections.

### P1: Artist campaign skills need instrumentation

The artist lane is distinct, broad, and marketable. Its issue is not concept coverage. It is that most skills are 37-50 line scaffolds with no examples, references, templates, intake forms, timeline/owner matrices, or QA loops.

Fix: add one shared `references/artist-campaign-playbook.md` plus one compact example per skill. Every artist skill should also include an "Idea Quality Gate":

- artist truth;
- audience behavior;
- channel fit;
- asset availability;
- cost or production complexity;
- rights/provenance risk;
- one reason the idea is worth doing now.

### P1: Rights and creator utility skills need evidence schemas

The script-backed rights/linting skills are strong. The shorter rights skills need more formal evidence tables and severity models so agents do not overstate clearance, licensing, ownership, routing, or payout readiness.

Fix: add a shared `Evidence Table` output pattern:

- fact;
- source;
- confidence;
- owner confirmation needed;
- blocker severity;
- safe public wording.

### P2: Verification is inconsistent

Many skills include output templates but no final verification or "ship gate." The best skills force the agent to say what was checked and what remains unverified.

Fix: add `Verification:` and `Ship gate:` to every skill output, even if the answer is "source-only, not live verified."

### P2: Implicit invocation policy is inconsistent

Every skill has `agents/openai.yaml`, but only some include `policy.allow_implicit_invocation`. This may be intentional, but the current distinction is not documented.

Fix: decide whether all public skills should be implicitly invokable or only the high-confidence umbrella/workflow skills. Encode that rule in the catalog or README.

## Skill Matrix

| Skill | Niche | Grade | Strongest asset | Main benchmark gap | Top fix |
| --- | --- | --- | --- | --- | --- |
| `suede-workflow-skills` | umbrella workflow | B | excellent lane map, source-truth rule, ship boundaries, and full-pack routing | too broad; acts as both router and manual | add a one-page decision tree and push depth into child skills |
| `suedify` | reference-site restyling | A | strong two-URL contract, mimic map, fidelity rules, safety, artifacts, and ship gate | needs concrete screenshot/browser commands | add exact QA command and Playwright screenshot recipe |
| `johnny-suede-design` | full design mode | B | clear combined design/copy/visibility workflow and design contract | overlaps with `suede-design` while having less implementation depth | clarify when to use this vs `suede-design`, then add render commands |
| `johnny-suede-write` | full writing mode | B | useful one-name copy stack, scoring, and claim safety | too few before/after examples | add 3 example rewrites and a claim-evidence matrix |
| `suede-design` | design QA and implementation | A | production-grade design laws, preflight, system QA, source-truth discipline, and ship gate | dense; could use faster quick-start routes | add "small fix / major redesign" quick paths at top |
| `suede-copy` | public copy and SEO copy | A- | clear voice, claim boundaries, SEO spine, and anti-slop pass | lacks progressive feedback loop and worked examples | add before/after examples and a preserve/change calibration section |
| `suede-brand-voice` | voice editing | C | crisp voice and claim-boundary reminders | too thin and overlaps with `suede-copy` and `johnny-suede-write` | merge into `suede-copy` or expand with examples and scoring |
| `suede-seo-audit` | SEO/AEO/AI EO | B- | includes AEO/AI EO and claim-safe proof | checklist is thin and lacks command-level verification | add curl, schema, link, sitemap checks, and severity ranking |
| `suede-visibility-grader` | page visibility grading | B+ | strong A-F lanes and source-truth requirements | needs sample graded reports and command evidence | add one complete sample report and live/source verification templates |
| `suede-site-alchemy` | conversion page polish | B+ | strong page contract, scope router, and conversion framing | examples are mostly conceptual | add before/after hero, CTA ladder, and proof-stack samples |
| `suede-code-grader` | A-F code risk grade | A- | strong risk lanes, independent grading, grade meanings, and ship gate | needs grade calibration examples | add example grade reports for small diff, MCP, and public page |
| `suede-code-review` | code review | A | strong context graph, severity model, finding format, fix briefs, Suede-specific checks, and ship gate | could add stack-specific command map | add optional command matrix by web, MCP, iOS, and API surface |
| `suede-agent-teams` | multi-lane orchestration | A- | strong lane map, WIP protection, review convergence, and grouping loops | no ready-made contracts for common task types | add sample contracts for design, release, audit, and recovery |
| `suede-launch-packaging` | public launch prep | B | clear packaging mindset and verification language | needs deeper channel checklist and proof hierarchy | add launch checklist for repo, docs, social, email, live URL, and handoff |
| `suede-install-support` | install troubleshooting | B | captures the important one-`--path` installer rule | needs troubleshooting matrix | add common failures: missing path, stale main, local-only plugin confusion |
| `suede-mcp-qa` | MCP QA | B | covers tools, resources, prompts, catalog, and docs alignment | no JSON-RPC smoke-test examples | add exact stdio test payloads and expected responses |
| `suede-ambassador-explainer` | ambassador copy | C+ | good safety boundary and format list | too skeletal for real ambassador usage | add audience-specific examples for builder, creator, agency, and investor-adjacent readers |
| `suede-public-claim-check` | public claim safety | B- | clear claim-safety target | too short for legal/payment/rights nuance | add claim taxonomy, severity, rewrite examples, and evidence table |
| `suede-agent-commerce` | agent-readable commerce | C+ | good agent-readable framing | too shallow for commerce readiness | add metadata schema, action permissions, payment/licensing caveats, and validation |
| `suede-era-builder` | artist era system | B | strong world system across visuals, symbols, wardrobe, language, and behavior | no intake/examples to prevent generic era output | add one worked example and an era-readiness intake checklist |
| `suede-song-to-universe` | song worldbuilding | B- | good extraction of conflict, setting, objects, and mystery | many artifacts, no prioritization model | add must/should/could artifact tiers and a sample output |
| `suede-hook-hunter` | short-form hook discovery | B+ | best rubric in artist lane: repeatability, emotion, caption, visual cue, and participation | scores hooks but has no scale or test metrics | add 1-5 scoring table, timestamp matrix, and test plan format |
| `suede-release-stunt-lab` | release stunt ideation | B | strong stunt taxonomy, proof mechanic, and safety boundary | no feasibility/risk matrix | add budget/time/risk tiers and ops checklist |
| `suede-fan-rituals` | fan participation | B- | clear focus on simple, visible, repeatable behavior | no adoption ladder or failure criteria | add seed/test/scale ritual ladder |
| `suede-visualizer-director` | visual treatment | B- | covers format, motion, type, prompt, and shot-note direction | missing production specs | add duration, aspect, deliverable specs, and storyboard template |
| `suede-merch-object-lab` | merch concepting | B | pushes beyond generic apparel into artifacts and object mechanics | no production economics or fulfillment detail | add cost/MOQ/pricing/fulfillment risk matrix |
| `suede-setlist-theater` | live set design | B- | strong show arc: entrance, reveal, participation, peak, reset | no cue-sheet depth | add minute-by-minute cue sheet and rehearsal handoff |
| `suede-catalog-resurrection` | catalog revival | B | honest "old material" framing and rights uncertainty flags | treats one asset at a time; no catalog triage | add catalog scoring matrix: relevance, rights risk, asset quality, effort |
| `suede-artist-identity-forge` | artist positioning | B | strong identity spine and anti-hype guardrails | needs evidence-based intake and contradiction resolution | add intake questions, anti-reference rules, and example identity spine |
| `suede-collab-matchmaker` | collaboration strategy | B | good lane model and "public proof needed" safety | no prioritization or research method | add fit/feasibility/reach scoring and outreach package template |
| `suede-campaign-in-a-box` | artist campaign packaging | B | covers campaign phases and grounded-claims rule | too skeletal for a full rollout | add calendar, owners, dependencies, asset requests, and KPI checks |
| `suede-sync-packaging` | sync review prep | A- | strongest artist readiness checklist and clean claim boundaries | needs full one-sheet/admin schema | add one-sheet template with rights, admin, contact, and link fields |
| `suede-release-linter` | release linting | A- | executable linter, references, score bands, severity model, MD/JSON reports, and safety defaults | needs fixture-backed examples/tests and clearer platform-delivery presets | add sample project fixtures, expected reports, and presets for release/distribution, registry, licensing, and royalty-routing readiness |
| `suede-rights-passport` | rights transfer package | A- | structured package generator, intake JSON, hashes, reports, missing-info flow, and references | no visible validator/sample output suite proving package completeness | add `validate_transfer_package.py` plus one complete sample package and one blocked package |
| `suede-rights-audit` | rights gap review | C | right audit categories across ownership, contributors, splits, samples, licenses, provenance, and public context | overlaps with linter/passport but lacks its own severity model, proof requirements, and triage gates | make it the front-door triage skill with A-F readiness grade, blocker severity, proof checklist, and exact next-skill routing |
| `suede-provenance-map` | provenance mapping | C+ | separates confirmed, inferred, unknown, evidence, conflicts, hashes, and do-not-share items | missing dated chain-of-custody schema, confidence levels, and derivative/source graph | add a provenance event table: date, actor, source, asset hash, evidence, confidence, public/private flag, next question |
| `suede-licensing-prep` | licensing readiness | C | preserves claim boundaries and routes unresolved provenance/splits | too thin for licensing work; lacks territory/media/term/exclusivity/use/restriction matrix and risk levels | add a licensing brief template with deal-use matrix, master/publishing sides, sample status, allowed uses, restrictions, and unsafe-claim rewrites |
| `suede-royalty-routing-brief` | royalty split routing | C- | correctly distinguishes routing readiness from payout approval | missing master/publishing/mechanical/performance/admin roles, collection channels, territories, payout destinations, and tax/payment caveats | add a routing matrix: party, role, right type, split, destination, confirmation status, missing data, blocker, safe public wording |

## Fix Waves

### Wave 1: Commit or park the audit artifact

The committed repo is currently aligned around 38 skills. This audit is the only untracked item.

1. Keep it as local planning evidence, commit it if it should live in the public repo, or move it to a private handoff if the public repo should stay clean.
2. Before any later publish, re-run manifest check, `git diff --check`, MCP parse, docs link sweep, and install checks.

### Wave 2: Create a micro-skill v2 template

Apply this to every C-level or B-minus operator, rights, install, ambassador, commerce, and artist skill:

```text
Required inputs:
Source truth:
Workflow:
Quality gate:
Output:
Verification:
Safety boundaries:
Escalate to:
```

### Wave 3: Upgrade artist skills from idea cards to operating systems

Add shared sections:

- artist evidence to inspect;
- audience or fan behavior signal;
- platform fit;
- production effort;
- rights/provenance risk;
- "what not to copy";
- one sample output.

### Wave 4: Upgrade rights skills with evidence and severity

Add shared sections:

- confirmed facts;
- missing facts;
- supporting evidence;
- severity;
- owner confirmation needed;
- safe public wording;
- not legal advice boundary.

### Wave 5: Add validation and publishing discipline

The repo needs a durable no-dependency checker committed to the repo, not only ad hoc shell checks. It should verify:

- frontmatter exists;
- folder name matches skill name;
- description exists and is under practical display limits;
- `agents/openai.yaml` exists and has required fields;
- catalog names match filesystem names;
- docs links exist for every public skill that claims docs;
- install command paths are real;
- no private paths, internal endpoints, secrets, or unsupported claims appear in public docs.

## Ship Gate

Current status: audit complete locally.

Ship gate: ship-with-caveats for the audit artifact. No public publish, commit, or live-site verification was requested or performed.

Next action: decide whether to commit the audit, then upgrade the lowest-grade micro-skills in batches by lane.
