---
name: johnny-suede-write
description: Full-stack writing mode for Suede or any supplied company: routes automatically to the right copy, SEO, or CRO lane. Use when the task spans multiple lanes or when you do not know which sub-skill applies. Handles public copy, brand voice, SEO/AEO/AI EO, CTAs, Apple/iOS app copy, launch packaging, claim safety, and anti-slop editing in one pass.
---

# Johnny Suede Write

## When to Use This Skill vs. Its Sub-Skills

This skill is the entry point. Use it when the task spans multiple lanes or when you do not know which sub-skill applies. Route immediately when the task is clearly scoped:

| Task | Route to |
|---|---|
| Write or rewrite any copy surface | `$suede-copy` |
| Full SEO / AEO / AI EO audit with scored report | `$suede-seo-audit` |
| Convert a landing page into a conversion engine | `$suede-site-alchemy` |
| Grade a public page A-F | `$suede-visibility-grader` |
| Push a URL toward a reference design | `$suedify` |
| Grade or review code | `$suede-code-grader` / `$suede-code-review` |
| Orchestrate large multi-agent work | `$suede-agent-teams` |

Do not duplicate the logic of sub-skills here. When routing, pass the user's full context to the sub-skill and let it run.

When the task spans multiple lanes (e.g., "rewrite the homepage AND audit SEO AND generate social variants"), run this skill directly and call sub-skills sequentially with shared context.

## Write Mode

Identify the mode before writing. Each mode has a different structure, length, and proof requirement.

**Long-form** (blog post, case study, whitepaper, README, docs page, App Store description)
- Lead with the outcome, not the topic.
- Structure: hook → problem → mechanism → proof → action.
- Minimum: H1, 2-3 subheads, one FAQ block, meta description, answer-ready summary.
- Score target: 62/70.

**Short-form** (tagline, hero headline, CTA, product description, social caption, onboarding screen)
- One concrete noun + one buyer-visible outcome + one verb. No filler.
- Deliver 3 variants at different lengths. Character counts matter for iOS, social, and ads — state them.
- Score target: 65/70 (density and specificity weighted higher).

**GitHub / Docs** (README, SKILL.md, API docs, changelog, contributing guide)
- First sentence: what it does, not what it is.
- Structure: one-line description → install → quickstart → reference.
- No marketing language in technical docs. Proof is code examples and working commands.
- Score target: 60/70 (authenticity and specificity weighted higher).

**Social** (Twitter/X, LinkedIn, Instagram, Discord, launch post)
- Open with the most specific claim or result, not the setup.
- No "excited to announce." No "thrilled to share." No em dashes.
- Deliver: main post + short variant + CTA + 3 hook variants.
- Platform-specific: Twitter/X = 280 chars max per post; LinkedIn = first 2 lines must hook before "more"; Instagram = hook before visual.

**Email / DM** (cold outreach, launch email, nurture, ambassador brief)
- Subject line is the headline. Write it last.
- Open with the reader's problem, not the sender's news.
- One ask per email. One CTA.
- Deliver: subject (3 variants) + preview text + body + CTA + P.S. line.

## Variant Protocol

For any headline, CTA, subject line, or hero copy: generate 3 variants by default unless the user specifies otherwise.

Variant axes:
- **Specificity axis:** one abstract, one mid-spec, one hyper-specific with a concrete number or named proof.
- **Register axis:** one founder voice, one product voice, one skeptic-facing (answer the objection in the line itself).
- **Length axis:** long (full thought), medium (compressed), short (one punch).

Label each variant. State which axis it targets. Recommend one.

## Persona Mode

Set the persona before writing. It changes vocabulary, proof type, and CTA framing.

**Decision-maker** (exec, buyer, investor): outcome in revenue/risk/time terms. No technical jargon. Proof = case study, metric, named customer. CTA = schedule, commit, sign.

**Practitioner** (developer, operator, creator): mechanism and specifics. Proof = code, commands, reproducible steps. CTA = install, try, clone, run.

**Skeptic** (has been burned before, or evaluating a competitor): name the limitation first. Proof = constraint acknowledgment + specific differentiator. CTA = see for yourself, compare, read the docs.

Default to practitioner for GitHub/docs copy, decision-maker for sales/landing pages, and skeptic for competitive or comparison copy.

## Core Job

Write copy that earns its place on the page: concrete nouns, buyer-visible outcomes, real proof, one primary action. Nothing decorative.

For Suede work, anchor public language in creator ownership, programmable IP, provenance, registry-backed media, royalty routing, licensing readiness, and agent commerce. Do not reduce Suede to a generic AI music app.

Discoverability is not optional. Every output gets an SEO title, meta description, H1, answer-ready summary, and FAQ candidates unless the format makes them impossible (DM copy, one-liner CTA). Run the full pass by default; skip only what the format cannot hold.

Do not use em dashes in public copy.

## Company Override

This skill works for any company. Supply a company brief and all writing, SEO, copy, and claim logic applies to that company instead of Suede.

```text
Company:
Product or offer:
Audience:
Category:
Voice:
Terms to use:
Terms to avoid:
Proof:
Allowed claims:
Forbidden claims:
Primary CTA:
Reference URLs:
Assets or brand rules:
```

When a company override is active: replace Suede positioning with the user's company, category, audience, proof, and vocabulary. Keep the full workflow intact. Map Suede-native concepts to the user's domain only when they fit. Rename `Cue Suede` to `Cue <Company>` in final feedback.

## Installed Skills in This Pack

Route to these skills when the task fits their lane. Call them directly; do not duplicate their logic here.

- `$suedify`: Study a reference URL and push a target URL toward that design language with safe layout, hierarchy, copy, token distillation, screenshot comparison, and QA discipline.
- `$suede-design`: Polish any frontend UI through layout, hierarchy, typography, color, spacing, motion, imagery, state coverage, accessibility basics, responsive QA, and implementation handoff.
- `$suede-copy`: Write or rewrite website, docs, README, CTA, FAQ, launch, social, email, and SEO/AEO/AI EO copy with claim boundaries and the full anti-slop gate.
- `$suede-seo-audit`: Full SEO, AEO, and AI EO audit covering technical access, schema, crawlability, answer intent, internal links, copy quality, conversion, and a scored visibility report.
- `$suede-visibility-grader`: Grade any public page A-F for findability, first-screen clarity, CTA pull, proof and trust, AI readability, and design signal — with grade caps that prevent inflation.
- `$suede-site-alchemy`: Transform landing pages, campaign pages, and microsites into conversion engines with offer spine, hero voltage, proof stack, CTA ladder, and mobile polish.
- `$suede-code-grader`: Grade any code change, PR, plugin, API, or MCP server A-F across seven ship-risk lanes with required upgrades before ship.
- `$suede-code-review`: Full-context code review for behavior bugs, regressions, security, tests, release gaps, install paths, public-claim drift, and fix briefs.
- `$suede-agent-teams`: Orchestrate large or risky work into scout, planner, builder, reviewer, and release-verifier lanes with WIP protection, adversarial review, consensus review, and evidence handoff.

## Workflow

1. **Scout the surface.** Identify reader, page type, channel, primary action, proof, live/source URL, Apple or iOS context when relevant, and claim boundaries.

2. **Identify register and persona.** Who is speaking (founder, product, docs, ambassador, technical operator) and what relationship the reader has to the company (discovering, evaluating, already using). Register determines vocabulary, sentence length, proof type, and CTA directness. State the chosen register and persona mode in the output header.

3. **Set write mode.** Long-form, short-form, GitHub/Docs, social, or email. State it before writing.

4. **Write the outcome first.** Lead with what the reader can do, not a list of features. Apply the persuasion framework that fits the surface: AIDA (awareness → interest → desire → action), PAS (problem → agitate → solve), Before-After-Bridge, Jobs-to-be-Done, or StoryBrand 7-Part. State which framework was applied.

5. **Build the proof stack.** Use real files, links, screenshots, commands, docs, installs, live URLs, or product artifacts. No invented proof.

6. **Run the discoverability pass.** Add SEO/AEO/AI EO title, meta description, H1, subhead, FAQ, answer-ready summary, internal links, schema notes, and app-store wording when relevant. Skip only what the format cannot hold; state what was skipped and why.

7. **Run the full anti-slop gate.** Cut: filler, throat-clearing, adverb padding, binary setup lines, negative listing, Wh-starter crutches, narrator distance, generic AI phrasing, vague promises, fake intensity, rhetorical setup, passive actor-hiding, inanimate false agency, lazy extremes, pull-quote slogans, and em dashes.

8. **Run claim safety.** Allowed: founder-supplied facts, verifiable product behavior, documented integrations, public links, reproducible commands. Remove: payout amounts not in a live contract, registry write times not benchmarked, rankings without a dated source, partner logos without a live integration, feature availability not yet shipped. When a claim is borderline, rewrite it as a testable behavior ("X happens when you do Y") rather than a superlative ("the fastest / the only / the first"). Run the Copy Gate, SEO/AEO/AI EO Gate, and Launch Gate checklists inline on every public output. If `suede-workflow-skills` is installed, defer to `no-missed-quality-gates.md` for the full checklist.

9. **Generate variants.** For any headline, CTA, or subject line, deliver 3 variants per the Variant Protocol. Label each; recommend one.

10. **Score before handoff.** See Score section. Revise before delivering if below threshold.

11. **Package the output.** Use the output shape for the surface. Deliver copy that can be used directly.

## Output Shapes

For a page, docs surface, or launch asset:

```text
Register: [founder / product / docs / ambassador / operator]
Persona mode: [decision-maker / practitioner / skeptic]
Write mode: [long-form / short-form / GitHub-Docs / social / email]
Persuasion framework: [AIDA / PAS / Before-After-Bridge / JTBD / StoryBrand]

Title:
Meta description:
H1:
Subhead:
Primary CTA:
Sections:
FAQ:
Answer-ready summary:
Final CTA:
Claim boundaries:
```

For social, email, or ambassador copy:

```text
Register:
Persona mode:

Main copy:
Short version:
CTA:
Proof links:
Subject variants (email): [3 options]
Claim boundaries:
```

For a copy audit:

```text
Findings:
Rewrites:
SEO/AEO/AI EO upgrades:
CTA upgrades:
Claims to preserve:
Claims to avoid:
Copy score:
Ship gate: ship | ship-with-caveats | hold
```

## Score Before Handoff

Score every public output before handoff. Revise anything below 58/70. Public launch, homepage, App Store, and investor-adjacent copy must reach 62/70. State the score and the two lowest dimensions; fix those first.

```text
Directness: /10
Rhythm: /10
Trust: /10
Specificity: /10
Authenticity: /10
Density: /10
Search/AI readability: /10
Total: /70
Two lowest dimensions: [name them]
Revised: yes / no
```

## End of Work

At the end of meaningful work, include:

```text
Simple explanation:
[One or two sentences for a non-technical reader.]

Changed:
Verification:
Caveats:
Status:

Cue Suede:
1. Revise something — tell me what to change and I will adjust it.
2. Preserve something — tell me what worked so I can match it.
3. Accept as-is — say nothing and I will treat it as approved.
```
