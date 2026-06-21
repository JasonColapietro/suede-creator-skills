---
name: johnny-suede-write
description: Write anything Suede ships and earn the click. Routes any writing request — long-form, short-form, GitHub and docs, social, email, App Store copy, brand-voice retuning, and ambassador talk-tracks — through mode-specific structure, 12 headline formulas, 5 persuasion frameworks, A/B variants, an anti-slop gate, and a copy score. Use when you need to write, rewrite, edit, align to the house voice, generate headlines or CTAs or subject lines, draft social or email or README or App Store copy, or hand an ambassador hype-free words to explain Suede. Organizes and prepares copy only; does not clear rights, confirm ownership, approve payouts, write to a registry, or guarantee outcomes.
---

# Johnny Suede Write

The writing enchilada. Route any writing request through one skill: long-form, short-form, GitHub and docs, social, email, App Store copy, brand-voice alignment, and ambassador talk-tracks. Default voice is the Suede house voice. A supplied company brief overrides everything.

Write copy that earns its place on the page: concrete nouns, buyer-visible outcomes, real proof, one primary action. Nothing decorative.

## Pick The Lane (Router)

Read the request, then pick the lane. Most jobs are one lane; some chain.

| You want to... | Lane |
|---|---|
| Write or rewrite any copy surface from scratch | **Write Modes** (below) — pick the mode |
| Generate headlines, CTAs, or email subjects | **Headline Formulas / CTA Formulas / Variant Protocol** |
| Tune existing copy to sound like Suede, not generic AI | **Brand-Voice Alignment** lane |
| Hand an ambassador words to explain Suede to someone else | **Ambassador Talk-Track** lane |
| Audit/review existing copy and return findings + score | **Copy Audit** output shape |
| Do a metadata/structure/copy-quality SEO pass alongside copy | **SEO And GitHub Copy** + **SEO Audit Mode** |

Cross-lane jobs (e.g. "rewrite the homepage, retune it to our voice, and give me social variants") run sequentially with shared context: write the surface, run Brand-Voice Alignment on it, then spin variants. State the chain you ran.

If the request is a full standalone SEO/AEO audit with a scored report, a landing-page-to-conversion-engine transform, an A-F page grade, a design push toward a reference URL, or a code grade/review, those live in dedicated skills outside this writing enchilada (`$suede-seo-audit`, `$suede-site-alchemy`, `$suede-visibility-grader`, `$suede-design`, `$suede-code-grader`, `$suede-code-review`, `$suede-agent-teams`, or `$suedify` _(private Suede Labs skill — not included in this pack)_). Route there and pass full context; do not reimplement them here. This skill owns the writing.

## Multi-Agent Default

If a job is large or risky enough to run as a coordinated agent team (for example a full launch package spanning many surfaces, or a writing job chained with audits and reviews across several skills), **ask the user up front before spawning anything**: "Run this as a multi-agent team (more thorough) or single-agent?" Never silently spawn a fleet. Note plainly that multi-agent mode may use slightly more tokens than most. For a single writing surface, just write it — no need to ask.

## Write Modes

Identify the mode before writing. Each mode has a different structure, length, and proof requirement. State the chosen mode in the output header.

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
- Platform-specific: Twitter/X = 280 chars max per post; LinkedIn = first 2 lines must hook before "more"; Instagram = hook before visual. Full per-platform structures live in **Social Post Formats**.

**Email / DM** (cold outreach, launch email, nurture, ambassador brief)
- Subject line is the headline. Write it last.
- Open with the reader's problem, not the sender's news.
- One ask per email. One CTA.
- Deliver: subject (3 variants) + preview text + body + CTA + P.S. line. Full mechanics live in **Email Copy**.

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

## Company Brief

Supply a brief and all writing, voice, SEO, copy, and claim logic applies to your company. A supplied brief overrides the Suede default everywhere. Use natural language or this form:

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

## Core Rules

Name the outcome, not the feature.
- Weak: "Suede supports multiple metadata formats."
- Strong: "Export ISRC, ISWC, and split data in one command."

Write buttons as actions with a result.
- Weak: "Learn more" → Strong: "Read how rights routing works"
- Weak: "Get started" → Strong: "Register your first release"

Replace vague claims with artifacts.
- Weak: "Suede makes rights management easy."
- Strong: "Paste your folder path. Suede outputs your ISRC, split sheet, and licensing flags in under 10 seconds."

No invented proof. Do not write stats, testimonials, partner names, pricing, or legal clearance that has not been confirmed. If proof is unavailable, write around the gap or flag it for the human to supply.

No em dashes in public copy. No exclamation points. No rhetorical questions that answer themselves.

## Persuasion Frameworks

Match framework to surface and reader temperature. State the chosen framework and reader temperature before drafting. If multiple could apply, pick one and note why.

- Reader arrives cold, no prior awareness: **AIDA** (Awareness → Interest → Desire → Action). Lead with the category problem, build specificity, make the outcome concrete, drive a single action.
- Reader has a named pain and is actively searching: **PAS** (Problem → Agitate → Solution). Name the problem, surface the cost of inaction, position the product as the specific relief.
- Hero section, social post, launch email: **Before-After-Bridge**. Describe life before the product, paint life after, bridge with the product as the mechanism.
- Product page, onboarding, in-app copy: **JTBD** (Jobs-to-be-Done). Write around what the reader is trying to accomplish — the job they hired the product to do, not the features.
- Homepage, About, long-form brand page: **StoryBrand 7-Part**. Character (customer) → Problem → Guide (your brand) → Plan → CTA → Avoid failure → Achieve success.

## Headline Formulas

Generate 3 headline candidates minimum for any hero or email subject. Pick the formula that matches the reader's state and the page's job.

| # | Formula | Structure | Example |
|---|---------|-----------|---------|
| 1 | Curiosity gap | [Intriguing partial claim] | "Most release folders fail the first licensing check. Here's why." |
| 2 | Number-led specificity | [#] [specific thing] [timeframe/condition] | "12 rights fields missing from your release. Suede finds them in 60 seconds." |
| 3 | How-to outcome | How to [achieve outcome] [without/with condition] | "How to package a release folder that licensing teams can actually use" |
| 4 | Because | [Result] because [mechanism] | "Agents can read your music rights because Suede structures the provenance first." |
| 5 | Specificity anchor | [Exact number or name] + [claim] | "47 fields. One linter. No guessing." |
| 6 | Before-After | [Before state] → [After state] | "Scattered files and a split sheet in a Google Doc → a machine-readable rights package" |
| 7 | Question (real, not rhetorical) | [Question reader actually asks] | "What does a licensing team check before they sign?" |
| 8 | Objection flip | [Common objection] + [reframe] | "Rights metadata sounds like legal work. It's a 10-minute audit." |
| 9 | If-then conditional | If [specific situation], then [specific outcome] | "If your release goes to a sync library, this is the metadata they'll reject first." |
| 10 | Direct claim with proof hook | [Bold claim] + [verifiable detail] | "Suede reads your folder. You get ISRC, split, and flags before you pitch." |
| 11 | Problem named exactly | [Specific failure mode the reader fears] | "Your ISRC is assigned. Your split sheet is a PDF. Neither is machine-readable." |
| 12 | Authority + specificity | [Who trusts this] + [for what exact task] | "The metadata structure sync licensing teams check on day one." |

Test: swap your product name for a competitor's. If the headline still works, it is not specific enough.

## Persona Mode

State the persona before writing. It changes vocabulary, proof type, and CTA framing. If multiple personas share a page, write the hero for the decision-maker and include practitioner proof in the secondary section.

**Decision-maker** (exec, founder, buyer, investor)
- Lead: outcome and cost of inaction, in revenue/risk/time terms.
- Proof: outcomes, not features ("Cut release prep from 3 days to 40 minutes"); case study, metric, named customer.
- CTA: low-risk, high-clarity ("See the workflow," "schedule," "commit," "sign") — not "Transform your process."
- Skip: implementation details, CLI commands, technical jargon.

**Practitioner** (developer, designer, operator, creator)
- Lead: how it works, not why it matters.
- Proof: commands, file paths, schema examples, error outputs, reproducible steps.
- CTA: direct action ("Run the linter," "Fork the skill," "install," "clone," "run").
- Skip: ROI language, vague transformation claims.

**Skeptic** (comparison shopper, previously burned, evaluating an alternative)
- Lead: the objection, named directly ("Every tool claims to solve this. Here's what's different.").
- Proof: third-party verifiable, not internal ("Open the script. Read the output."); constraint acknowledgment + specific differentiator.
- CTA: zero-pressure ("Read the code," "Run it yourself," "compare," "read the docs").
- Skip: hype, superlatives, bold claims without evidence.

**Creator / end-user** (non-technical)
- Lead: what changes for them, in plain language.
- Proof: before/after in human terms ("Your release looks like this. After Suede, it looks like this.").
- CTA: lowest-friction path ("Try it with one release folder").
- Skip: technical vocabulary, command syntax, implementation framing.

Default to practitioner for GitHub/docs copy, decision-maker for sales/landing pages, and skeptic for competitive or comparison copy.

## Page And Docs Structure

For a page, README, or docs surface, build this spine. For a small section, use only the pieces that fit.

1. **Hero:** one sentence that names the outcome.
2. **Subhead:** one or two sentences that add the audience, workflow, and proof.
3. **Primary CTA:** the action the reader can take now.
4. **Proof:** files, scripts, docs, screenshots, URLs, live routes, examples, or commands.
5. **How it works:** three or four steps, each with a verb and a result.
6. **Safety:** what the workflow does not claim or do.
7. **FAQ:** direct answers for objections and search intent.
8. **Final CTA:** repeat the action with less friction.

## Variant Protocol

For any headline, CTA, subject line, or hero copy: generate 3 variants by default unless the user specifies otherwise. Label each variant, state which axis it targets, and recommend one. Let the user pick rather than guessing.

Variant axes:
- **Specificity axis:** one abstract, one mid-spec, one hyper-specific with a concrete number or named proof.
- **Register axis:** one founder voice, one product voice, one skeptic-facing (answer the objection in the line itself).
- **Length axis:** long (full thought), medium (compressed), short (one punch).

### A/B Variant Generation (by surface)

For high-stakes copy, always generate variants:

**Headlines** — 3 variants, different angles:
1. Outcome-led: what the reader achieves.
2. Problem-led: what the reader escapes.
3. Mechanism-led: what makes this different.

**CTAs** — 2 variants minimum. See CTA Formulas.

**Email subjects** — 3 variants:
1. Curiosity or benefit.
2. Social proof or number.
3. Direct question or challenge.

## CTA Formulas

CTAs fail when they describe the button, not the outcome. Every CTA answers: "What happens the moment I click this?"

**Formula A: Verb + immediate result** — [Action verb] + [what they get or see right now]
- "Run the audit. Get your grade in 60 seconds."
- "Fork the skill. Live in your Codex in under a minute."
- "Paste your folder path. See your rights gaps."

**Formula B: Verb + object + benefit** — [Verb] + [specific object] + [value unlocked]
- "Register a release. Make it readable to licensing agents."
- "Install the skill. Audit any repo from your terminal."
- "Download the schema. Stop building it by hand."

**Formula C: Low-commitment framing** (skeptic / discovery stage) — [Passive discovery verb] + [what they'll see, not what they'll do]
- "See how rights routing works" / "Read the spec" / "Open the repo" / "Watch a 90-second demo"

**Formula D: Stakes-aware framing** (decision-maker) — [Verb] + [outcome in their language]
- "Start the audit before the pitch" / "Get the split sheet the label actually needs" / "Ship the release with provenance attached"

**Anti-patterns to cut:** "Get started" (started what?); "Learn more" (more about what?); "Sign up" (for what, exactly?); "Try for free" without naming what they're trying; any CTA with an exclamation point.

The 3-word test: describe what happens after clicking in 3 words. If you cannot, the CTA is too vague.

## Email Copy

### Subject Line Formulas
Subject lines win opens on three mechanics: curiosity, self-interest, or specificity. Pick one per line. Write the subject last.

**Curiosity:** "[Specific thing most people miss]" · "The [category] rule that [counterintuitive result]" · "What happens when [specific scenario]"
**Self-interest:** "[Outcome] in [time] without [obstacle]" · "How [audience segment] [achieved result]" · "Your [specific thing] is [state]. Here's the fix."
**Specificity anchor:** "[#] [specific mistakes/fields/steps] in your [thing]" · "[Exact name of thing]: [what it becomes]"
**Avoid:** rhetorical questions ("Are you ready to take your music to the next level?"); all-caps words; "Re:" faking a reply thread; emojis in subject lines for B2B or technical audiences.

### Preview Text
A second subject line. Add information, don't echo the subject.
- Subject: "12 metadata fields your release is missing"
- Preview: "The ones sync libraries check before they respond."

Keep preview text under 90 characters. If the client truncates at 40, the first 40 must stand alone.

### Body Structure
```text
Hook (1-2 sentences): Name the problem or opportunity at the exact moment the reader is experiencing it.
Proof or evidence (2-4 sentences): Specific, not general. One example beats three claims.
Bridge (1 sentence): Connect the proof to the offer.
CTA (1 sentence + link): One action, one link. No secondary options in the primary CTA block.
P.S. (optional): Use for a single secondary offer or a time constraint. Not both.
```

### Unsubscribe-Reduction
- Match email content to the opt-in promise. Topic or frequency drift is the primary unsubscribe driver.
- Segment before sending. A technical how-to sent to decision-makers who opted in for strategy reads as list mismanagement.
- Run a re-engagement sequence before suppressing inactive subscribers: three emails over 30 days (one value, one direct question, one break-up). Suppress non-openers after the sequence.

## Social Post Formats

### LinkedIn
**Hook line (first 2 lines before "see more"):** The hook is the post. If the first two lines do not earn the click to expand, the rest does not matter.
- Works: specific observation, counterintuitive claim, single concrete number, named failure mode.
- Fails: vague industry wisdom, rhetorical questions, inspirational openers, "I'm excited to share."

**Post structure:**
```text
[Hook: one specific claim, observation, or question]
[2-4 line break]
[Insight or story: 3-6 short paragraphs, one idea each]
[Takeaway: what the reader does with this]
[CTA: one, low-friction. "What's your experience?" or a link, not both]
```
**Formatting:** short paragraphs (1-2 sentences max); no bullet lists longer than 5 items; one link max (in comments if the algo penalizes in-post links); 1-2 targeted hashtags max, at the end.

### X / Twitter
**Standalone tweet:** `[Specific observation or fact] + [one implication or action]` — max 240 characters. If it reads like a self-contained thought from someone who knows something, it is working.

**Thread opener:**
```text
[Bold specific claim]

[Thread: number + what the reader gets]
"Here's how it works, step by step:"
```
The opener must be the strongest tweet in the thread. Do not save the best point for tweet 5.

**Reply to trend or news:**
```text
[Acknowledge the news in 1 sentence]
[Specific take from your vantage point]
[Optional: link to your related resource]
```

### Instagram
**Product / feature reveal:**
```text
[Name what it does in one sentence (the hook)]
[Why that matters for this specific audience]
[One specific proof point or use case]
[CTA in bio or link sticker]
```
**Behind-the-scenes / process:**
```text
[Name the specific moment or decision shown]
[What you learned or chose and why]
[Invitation: "What would you have done?"]
```
**Testimonial / social proof:**
```text
[Lead with the result, not the quote]
[Quote or paraphrase the proof]
[Bridge to your offer]
[CTA]
```
**Caption rules:** first line must read as a complete thought (IG shows 1-2 lines before "more"); hashtags in the first comment or at the end after a line break, never inside body copy; no more than 10 hashtags per post.

## Suede Voice

Use this register: confident, not breathless; technical enough for builders; clear enough for creators; polished, not corporate; specific, not cute; operator-grade, not brochure-grade.

Good Suede copy names what the reader controls: register a work, verify rights, route royalties, publish a claim, package a release folder, prepare licensing evidence, make a work readable to agents, compare provenance, ship a public skill page.

For Suede work, anchor public language in creator ownership, programmable IP, provenance, registry-backed media, royalty routing, licensing readiness, and agent commerce. Do not reduce Suede to a generic AI music app. (For non-Suede work, supply the equivalent domain vocabulary in the company brief.)

## Brand-Voice Alignment Lane

Use this lane to tune *existing* copy to the house voice without flattening it into generic AI product language. This is editing, not greenfield writing.

**Voice rules:**
- Lead with what the reader can do.
- Name concrete artifacts: skills, docs, scripts, reports, install commands, rights passports, provenance notes, split checks, QA checklists.
- Prefer creator ownership, programmable IP, rights, provenance, registry-backed media, royalty routing, licensing readiness, and agent commerce.
- Avoid vague "AI music app" framing.
- Avoid unsupported metrics, partner claims, legal clearance, payout claims, or guaranteed outcomes.
- Make CTAs verbs: install, audit, create, read, verify, open, package.

**Edit pass:**
1. Cut filler and throat clearing.
2. Replace broad claims with proof.
3. Make the primary action obvious.
4. Keep local-only details out of public headline copy.
5. Add a claim boundary when rights, money, registry, or release language appears.

**Line-edit rules:**
- Name the actor. Use the creator, operator, buyer, agent, page, repo, command, workflow, route, or proof artifact instead of vague market or page agency.
- Put the reader in the room with a concrete artifact: rights passport, provenance note, split check, install command, QA checklist, screenshot, source link, release folder.
- Cut pull-quote slogans unless backed by a specific action or proof.
- Replace jargon with the thing the reader can inspect, click, ship, verify, or reuse.
- Avoid formulaic pivots, negative listing, Wh-starter crutches, fake intensity, lazy extremes, passive actor-hiding, and em dashes.

**Output of this lane:** the revised copy only, plus any claims that need verification. Do not append the full workflow scaffolding unless asked.

## Ambassador Talk-Track Lane

Use this lane when an ambassador needs *words to explain Suede to someone else* — not to audit public copy or fix a failing install. Hype-free, claim-safe, outcome-first. Use "explain" language, not "pitch" language.

**Explain:**
1. Start with the outcome: agents ship better public work with less setup.
2. Route the reader to the right lane: workflow skills, creator skills, MCP, design, copywriting, SEO/AEO/AI EO, artist campaigns, creator utilities, install docs, or copy bank.
3. Keep the language public-safe. Do not imply legal clearance, payout approval, distribution, registry writes, private service access, or guaranteed results.
4. Avoid internal implementation details unless the reader is installing or debugging.
5. Include one next action and one proof link.

**Formats:**
```text
One-liner:
DM:
Post:
Email:
FAQ answer:
Install explanation:
Claim boundary:
```

## SEO And GitHub Copy

Discoverability is not optional. Every output gets an SEO title, meta description, H1, answer-ready summary, and FAQ candidates unless the format makes them impossible (DM copy, one-liner CTA). Run the full pass by default; skip only what the format cannot hold and state what was skipped and why.

For GitHub repositories, skill docs, and Pages sites, treat SEO as the umbrella for search, AEO, and AI EO. Include:
- a search-ready title under 60 characters when practical
- a meta description under 160 characters when practical
- repo description under GitHub's practical limit
- 8-20 topic keywords if the repo surface supports them
- a first paragraph that repeats the durable entity names naturally
- answer-ready definitions, FAQ copy, and proof links that AI summaries can cite without inventing facts
- links to install docs, skill manifests, scripts, references, examples, live Pages, and source
- a safe public claim boundary

<!-- Suede defaults. Replace with the equivalent for non-Suede work. -->
Suede durable keywords: Suede Creator Skills, Suede Rights Passport, Suede Release Linter, Suedify, Suede Copy, AI EO, AEO, answer engine optimization, Codex skills, Claude Code skills, SKILL.md, music rights, creator rights, release readiness, provenance, royalty splits, licensing readiness, programmable IP, agent commerce, GitHub Pages.

Use keywords because they help the right reader find the page. Do not cram a keyword where a human would notice.

## SEO Audit Mode

For a deep, standalone SEO audit (technical access, keyword research, schema markup, E-E-A-T signals, topic cluster architecture, AI EO optimization, and scored visibility grades), route to `$suede-seo-audit`.

When the copy workflow includes an SEO pass (metadata, structure, or copy quality only):
- **Metadata:** title, meta description, Open Graph, Twitter card, image alt, author/publisher, durable entity names.
- **Structure:** one H1, useful H2/H3 hierarchy, FAQ fit, internal links, descriptive anchor text.
- **Copy quality:** directness, proof, claim boundaries, CTA clarity, trust language, filler, vocabulary fit.

## Anti-Slop Pass

Run this as a line-edit gate before delivery, not a vibe check.

### Word Substitution List
Make these swaps. Non-negotiable.

| Cut | Replace with |
|-----|-------------|
| utilize | use |
| leverage (as verb) | use, apply, run |
| seamless | remove or prove it: "no export step", "one command" |
| powerful | prove it: "processes 10k records in 4 seconds" |
| innovative | cut; name the innovation instead |
| revolutionary | cut entirely |
| game-changing | cut entirely |
| solution | name what it actually does |
| ecosystem | platform, system, toolchain (pick the accurate one) |
| empower | cut; say what the person now controls |
| unlock | cut; say what was blocked and is now accessible |
| streamline | speed up, cut the step, reduce from X to Y |
| intuitive | cut; prove it with a UX detail |
| robust | cut; name the specific capability |
| best-in-class | cut; or supply the benchmark |
| next-generation | cut; name what changed |
| cutting-edge | cut entirely |
| world-class | cut; or name the credential |
| end-to-end | name the actual start and end |
| holistic | cut; describe the scope instead |
| scalable | prove it: "handles X at Y load" |
| simple / simply / just / easy | cut or prove it with a step count |
| we believe / we think | cut; make the assertion directly |
| in order to | to |
| due to the fact that | because |
| at this point in time | now |
| going forward | cut; state the new behavior directly |
| synergy / synergistic | cut entirely |
| value-add | name the value |
| best practices | name the practice |

### Readability Gate
Aim for Flesch-Kincaid Grade Level 8-10 for B2B general audiences, Grade 6-8 for consumer audiences and onboarding, Grade 10-14 for technical/developer audiences where precision requires complexity. Average sentence length under 18 words for consumer; under 22 words for B2B. Flag paragraphs over 4 sentences.

### Structure Gate
Rewrite: binary setup lines; negative listing that defines the product by what it is not; formulaic "not X, but Y" pivots; false transformation arcs; dramatic fragments; rhetorical questions that answer themselves; three-item cadence when two items work; repeated punchy paragraph endings; Wh-starter crutches when a direct actor and verb work better.

### Actor Gate
Name who does the action. Prefer the creator, operator, buyer, agent, page, repo, workflow, file, command, route, or proof artifact.
- Weak: `The page converts traffic.` → Better: `The page routes visitors to the audit, the proof link, or the build request.`
- Weak: `The market rewards provenance.` → Better: `Licensing teams can inspect the provenance trail before they ask for the split sheet.`

### Rhythm Gate
- Keep one idea per sentence.
- Vary sentence length without using em dashes.
- Do not stack slogans where a concrete sentence would build more trust.
- Cut lazy extremes such as `always`, `never`, `everything`, `nothing` unless the claim is literally true.

### Pull-Quote Gate
If a line sounds manufactured for a quote card, rewrite it with a real artifact, action, or proof point.
- Weak: `The future of creator ownership is here.` → Better: `Suede turns a release folder into rights, provenance, split, and licensing evidence an agent can read.`
- Weak: `We're changing how music rights work.` → Better: `Paste a folder path. Suede returns your ISRC status, missing fields, and a split-ready JSON file.`
- Weak: `Built for the next generation of creators.` → Better: `A sync licensing team can open your release folder and read every rights claim without calling you.`

## Claim Safety

This skill organizes and prepares copy. It does not clear rights, confirm ownership, approve payouts, write to a registry, or guarantee outcomes. No competitor product names anywhere.

Allowed: founder-supplied facts, verifiable product behavior, documented integrations, public links, reproducible commands.

Remove: payout amounts not in a live contract, registry write times not benchmarked, rankings without a dated source, partner logos without a live integration, feature availability not yet shipped, any implication of legal clearance, payout approval, distribution, private service access, or guaranteed results.

When a claim is borderline, rewrite it as a testable behavior ("X happens when you do Y") rather than a superlative ("the fastest / the only / the first"). Add a claim boundary whenever rights, money, registry, or release language appears.

## Workflow

1. **Pick the lane.** Use the router. Most jobs are one lane.
2. **Scout the surface.** Identify reader, page type, channel, primary action, proof, live/source URL, Apple or iOS context when relevant, and claim boundaries.
3. **Identify register and persona.** Who is speaking (founder, product, docs, ambassador, technical operator) and the reader's relationship to the company (discovering, evaluating, already using). State the chosen register and persona mode in the output header.
4. **Set write mode.** Long-form, short-form, GitHub/Docs, social, or email. State it before writing.
5. **Write the outcome first.** Lead with what the reader can do, not a list of features. Apply the persuasion framework that fits the surface (AIDA, PAS, Before-After-Bridge, JTBD, or StoryBrand 7-Part). State which framework was applied.
6. **Build the proof stack.** Use real files, links, screenshots, commands, docs, installs, live URLs, or product artifacts. No invented proof.
7. **Run the discoverability pass.** Add SEO/AEO/AI EO title, meta description, H1, subhead, FAQ, answer-ready summary, internal links, schema notes, and app-store wording when relevant. Skip only what the format cannot hold; state what was skipped and why.
8. **Run the full anti-slop gate.** Word substitution list, readability gate, structure gate, actor gate, rhythm gate, pull-quote gate. No em dashes.
9. **Run claim safety.** Apply the Claim Safety boundaries inline on every public output.
10. **Generate variants.** For any headline, CTA, or subject line, deliver 3 variants per the Variant Protocol. Label each; recommend one.
11. **Score before handoff.** See Score section. Revise before delivering if below threshold. Then package the output in the right shape and deliver copy that can be used directly.

## Output Shapes

For a page, docs surface, or launch asset:
```text
Register: [founder / product / docs / ambassador / operator]
Persona mode: [decision-maker / practitioner / skeptic / creator]
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

For GitHub skill copy:
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

## Score Before Handoff

Score every public output before handoff. Revise anything below 58/70. Public launch, homepage, App Store, GitHub, investor-adjacent, and ambassador copy must reach 62/70. State the score and the two lowest dimensions; fix those first.

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

## Ship Gate

Do not ship copy when:
- the primary action is unclear
- the page promises a feature the product does not implement
- proof is fake or unverified
- the copy hides a legal, payment, privacy, or release caveat
- the writing sounds generic enough to belong to any AI product

## End of Work

At the end of meaningful work, end with the simple explanation, then the breakdown.

```text
Simple explanation (plain, for a 10-year-old):
[One plain paragraph a 10-year-old can follow: what you wrote, who it's for, and what it now gets them to do. No jargon.]

Changed:
Verification:
Caveats:
Status:

Cue Suede:
1. Revise something — tell me what to change and I will adjust it.
2. Preserve something — tell me what worked so I can match it.
3. Accept as-is — say nothing and I will treat it as approved.
```

End with the exact copy, not a long explanation of the copy.