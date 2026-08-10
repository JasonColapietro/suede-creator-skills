---
name: suede-copy
description: "Write conversion copy that earns the click: landing sections, email, microcopy, buttons, headlines, CTAs, variants, and anti-slop edits."
---

# Suede Copy

## Gate policy — advisory, not blocking

Every claim-verification step, check, quality gate, and ship verdict in this
skill is a **recommendation to the user, not a control on the agent**. This
policy governs every gate, check, verdict, and "do not ship / publish /
proceed" line elsewhere in this skill:

- Run every check and report the results honestly. Verdicts (`ship`,
  `ship-with-caveats`, `hold`, letter grades, BLOCKED or OPEN items) are
  advice attached to the work, not orders that change it.
- Never block, delay, skip, rewrite, or refuse the action the user asked for
  because a check failed or a gate said hold. Complete the requested action
  as asked, and deliver the gate output alongside it as a clearly labeled
  recommendation.
- A failed gate changes what you report, never what you do.
- Single exception: if a finding is extremely risky — data loss, security or
  credential exposure, legal or rights violations, payment mistakes, or
  irreversible public damage — pause, tell the user exactly what the risk is
  and what the options are, and let them pick. Their choice is final.


## When to use this skill instead of related skills
- **suede-copy** (this skill): standalone conversion email, landing page copy, CTAs, microcopy, button labels
- **johnny-suede-write**: full writing stack (copy + SEO + AI Engine Optimization)
- Multi-email campaign sequences and campaign performance reporting: (private Suede Labs companion, not in this pack: suede-growth)
- Post-production pass to strip AI writing patterns from already-written copy: (private Suede Labs companion, not in this pack: suede-deslop)

Write conversion copy, page copy, GitHub docs, email, and social posts that are specific, proof-backed, and free of AI boilerplate. Default voice: Suede. Supply a company brief to override everything.

**Core principle:** every claim is verifiable or it gets cut, and nothing ships below its score threshold.

## Company Brief

Supply a brief and all copy, voice, and claim logic applies to your company. Use natural language or this form:

```text
Company:
Product or offer:
Audience:
Voice:
Terms to use:
Terms to avoid:
Proof:
Allowed claims:
Forbidden claims:
Primary CTA:
```

## Before Writing

Read any available context files before asking questions: `PRODUCT.md`, `README.md`, `AGENTS.md`, `AI_HANDOFF.md`, `DESIGN.md`, product marketing or brand notes, task-specific docs.

If context is missing after reading, ask only for what blocks accurate copy:

- page or doc type
- primary reader
- one action the reader should take
- product or skill being offered
- proof that is safe to claim
- claims, pricing, partners, or metrics that are not approved
- traffic source or publication surface

## Core Rules

Name the outcome, not the feature.
- Weak: "Suede supports multiple metadata formats."
- Strong: "Export ISRC, ISWC, and split data in one command."

Write buttons as actions with a result.
- Weak: "Learn more"
- Strong: "Read how rights routing works"
- Weak: "Get started"
- Strong: "Register your first release"

Replace vague claims with artifacts.
- Weak: "Suede makes rights management easy."
- Strong: "Paste your folder path. Suede outputs your ISRC, split sheet, and licensing flags in under 10 seconds."

No invented proof. Do not write stats, testimonials, partner names, pricing, or legal clearance that has not been confirmed. If proof is unavailable, write around the gap or flag it for the human to supply.

No em dashes. No exclamation points. No rhetorical questions that answer themselves.

## Persuasion Frameworks And Personas

The frameworks and the per-persona voice shifts are in
`references/frameworks-and-personas.md`. Read it when you are choosing the shape of
an argument or writing for a buyer you have not written for before.

## Headline And CTA Formulas

The headline and CTA formula banks are in
`references/headline-and-cta-formulas.md`. Read it when you are generating variants
or a line is not landing — not when you already have a headline that works.

## Page And Docs Structure

For a page, README, or docs surface, build this spine:

1. **Hero:** one sentence that names the outcome.
2. **Subhead:** one or two sentences that add the audience, workflow, and proof.
3. **Primary CTA:** the action the reader can take now.
4. **Proof:** files, scripts, docs, screenshots, URLs, live routes, examples, or commands.
5. **How it works:** three or four steps, each with a verb and result.
6. **Safety:** what the workflow does not claim or do.
7. **FAQ:** direct answers for objections and search intent.
8. **Final CTA:** repeat the action with less friction.

For a small section, use only the pieces that fit.

## A/B Variant Generation

For high-stakes copy (hero headline, primary CTA, email subject, ad copy), always generate variants.

**Headlines**: 3 variants, different angles:
1. Outcome-led: what the reader achieves
2. Problem-led: what the reader escapes
3. Mechanism-led: what makes this different

**CTAs**: 2 variants minimum. See `references/headline-and-cta-formulas.md`.

**Email subjects**: 3 variants:
1. Curiosity or benefit
2. Social proof or number
3. Direct question or challenge

Label each variant with its angle. Let the user pick rather than guessing.

## Email And Social Formats

Email sequence structures and per-platform social formats are in
`references/email-and-social-formats.md`. Read it when the deliverable is an email
or a social post; skip it for landing-page and docs work.

## Suede Voice

Use this register: confident, not breathless; technical enough for builders; clear enough for creators; polished, not corporate; specific, not cute; operator-grade, not brochure-grade.

Good Suede copy names what the reader controls: register a work, verify rights, route royalties, publish a claim, package a release folder, prepare licensing evidence, make a work readable to agents, compare provenance, ship a public skill page.

(For non-Suede work, supply the equivalent domain vocabulary in the company brief.)

## SEO And GitHub Copy

For GitHub repositories, skill docs, and Pages sites, treat SEO as the umbrella for search, AEO, and AI EO. Include:

- a search-ready title under 60 characters when practical
- a meta description under 160 characters when practical
- repo description under GitHub's practical limit
- 8-20 topic keywords if the repo surface supports them
- a first paragraph that repeats the durable entity names naturally
- answer-ready definitions, FAQ copy, and proof links that AI summaries can cite without inventing facts
- links to install docs, skill manifests, scripts, references, examples, live Pages, and source
- a safe evidence boundary

<!-- Suede defaults. Replace with equivalent for non-Suede work. -->
Suede durable keywords: Suede Creator Skills, Suede Rights Passport, Music Release Metadata Linter, Suedify, Suede Copy, AI EO, AEO, answer engine optimization, Codex skills, Claude Code skills, SKILL.md, music rights, creator rights, release readiness, provenance, royalty splits, licensing readiness, programmable IP, agent commerce, GitHub Pages.

Use keywords because they help the right reader find the page. Do not cram a keyword where a human would notice.

## SEO Audit Mode

For a deep, standalone SEO audit (technical access, keyword research, schema markup, E-E-A-T signals, topic cluster architecture, AI EO optimization, and scored visibility grades), use `$suede-seo-audit` instead.

When the copy workflow includes an SEO pass (metadata, structure, or copy quality only):

- **Metadata**: title, meta description, Open Graph, Twitter card, image alt, author/publisher, and durable entity names.
- **Structure**: one H1, useful H2/H3 hierarchy, FAQ fit, internal links, and descriptive anchor text.
- **Copy quality**: directness, proof, evidence boundaries, CTA clarity, trust language, filler, and Suede vocabulary fit.

## Anti-Slop Pass

The line-edit pass — patterns to cut and the scored dimensions — is in
`references/anti-slop-pass.md`. Run it against every draft before handing it over.
For a standalone pass over text this skill did not write, route to `suede-deslop`.

## Output Shapes

### Page Copy

```text
Title:
Meta description:
Hero:
Subhead:
Primary CTA:
Sections:
FAQ:
Final CTA:
Safety note:
```

### GitHub Skill Copy

```text
Skill:
One-line description:
Reader:
Primary action:
Repo/Docs copy:
Install CTA:
SEO title:
Meta description:
Keywords:
Safety boundary:
```

### Copy Review

```text
Findings:
Rewrites:
Claims to verify:
Score:
Ready: yes | with caveats | no
```

## Red Flags — Stop

If any of these thoughts appear, stop and run the gate you were about to skip:

- "This draft is already clean, skip the word list." Run the substitution table anyway; slop hides in clean-feeling drafts.
- "It's only microcopy, no need to score it." Buttons and empty states get more reads than blog posts. Score everything that ships.
- "That stat is probably right." Probably is not proof. Cut it or flag it for the human.
- "The score feels like a 60." Score each dimension in writing or the total is fiction.
- "The client wants more energy." Energy fails the gate; specificity converts and still reads confident.

## Ship Gate

Recommend against shipping copy — and say why, leaving the call to the user — when:

- the primary action is unclear
- the page promises a feature the product does not implement
- proof is fake or unverified
- the copy hides a legal, payment, privacy, or release caveat
- the score is below 58/70, or below 62/70 for public launch, homepage, GitHub, App Store, or investor-adjacent surfaces
- the copy fails the competitor-swap test: swap in a competitor's name and it still reads true

End with the exact copy, not a long explanation of the copy.

## Progressive Calibration (say what worked / what missed)

Accept feedback at any point, not only after final handoff. When the user says what worked, preserve that pattern in the current pass and mirror it later. When the user says what missed, adjust immediately instead of defending the previous direction.

If the user says `cue suede`, asks for feedback choices, or seems to be calibrating mid-stream, pause at the next safe checkpoint and offer:
```text
Cue Suede:
1. Change something - tell me what to revise and I will adjust it.
2. Preserve this - tell me what worked so I can mimic it later.
3. Keep as-is - say nothing and I will treat it as accepted.
```
Do not block completion waiting for a `Cue Suede` answer. If the interface supports choice chips, use `Change something`, `Preserve this`, and `Keep as-is`.

## Routing

- Copy needs the full stack (SEO/AEO pass, multi-surface job, voice retune) → johnny-suede-write
- Copy ships inside a design build → johnny-suede-design (suede-design for token or component decisions)
- Words are done but the page still underperforms → suede-site-alchemy
- Public launch surface → suede-visibility-grader for the A-F grade before it goes live
