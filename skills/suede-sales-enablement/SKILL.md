---
name: suede-sales-enablement
description: "Suede AI Sales Enablement Skills. Create rep-ready pitch decks, one-pagers, objection libraries, demo scripts, battle cards, proposals, buyer cards, and ROI models with a claim-source table. Use when asked to \"build a competitive battle card\" or refresh sales collateral. Distinguishes sourced proof from modeled value. NOT FOR: pricing strategy (use suede-pricing), offer design (use suede-offers), public comparison pages (use suede-competitors), outreach (use suede-cold-email), or unsupported proof."
metadata:
  display-name: "Suede AI Sales Enablement Skills"
  version: 2.1.0
---

# Suede AI Sales Enablement Skills

## Compatibility

Drafts work from supplied product, customer, and deal evidence. Live competitor checks need web access; native slide creation or CRM delivery needs separately available authorized tools.

For a concrete input, expected handoff, and failure check, read
[the worked handoff](references/worked-handoff.md).

Suede AI Sales Enablement turns verified positioning, proof, and deal context into
rep-usable decks, one-pagers, objection guides, demos, and playbooks. Every
asset separates sourced claims from modeled value and remains a draft until its
audience and version are approved.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task. If its Status line says `partial`, ask for the listed missing sections before using them and never infer them; treat `[unverified]` fields as absent.

Gather this context (ask if not provided):

1. **Value Proposition & Differentiators**
   - What do you sell and who is it for?
   - What makes you different from the next best alternative?
   - What outcomes can you prove?

2. **Sales Motion**
   - How do you sell? (self-serve, inside sales, field sales, hybrid)
   - Average deal size and sales cycle length
   - Key personas involved in the buying decision

3. **Collateral Needs**
   - What specific assets do you need?
   - What stage of the funnel are they for?
   - Who will use them? (AE, SDR, champion, prospect)

4. **Current State**
   - What materials exist today?
   - What's working and what's not?
   - What do reps ask for most?

---

## Core Principles

### Sales Uses What Sales Trusts
Involve reps in creation. Use their language, not marketing's. If reps rewrite your deck before sending it, you wrote the wrong deck. Test drafts with your top performers first.

### Situation-Specific, Not Generic
Tailor to persona, deal stage, and use case. A deck for a CTO should look different from one for a VP of Sales. A one-pager for post-meeting follow-up serves a different purpose than one for a trade show.

### Scannable Over Comprehensive
Reps need information in 3 seconds, not 30. Use bold headers, short bullets, and visual hierarchy. If a rep can't find the answer mid-call, the doc has failed.

### Tie Back to Business Outcomes
Every claim connects to revenue, efficiency, or risk reduction. Features mean nothing without the "so what." Replace "AI-powered analytics" with "cut reporting time by [sourced figure]."

---

## Sales Deck / Pitch Deck

Read [references/deck-frameworks.md](references/deck-frameworks.md) before
building a deck: it holds the 10-12 slide framework, deck principles,
customization by buyer type, and slide-by-slide guidance.

---

## One-Pagers / Leave-Behinds

Read [references/one-pager-templates.md](references/one-pager-templates.md) for
when to use a one-pager, the five-part structure, design principles, and
templates by use case.

---

## Objection Handling Docs

Read [references/objection-library.md](references/objection-library.md) for
objection categories, the five-part response framework, the quick-reference and
detailed formats, and the full library. Every proof point in a response still
needs a row in the claim-source table.

---

## ROI Calculators & Value Props

### Calculator Design

**Inputs** (current state metrics the prospect provides):
- Time spent on manual processes
- Current tool costs
- Error rates or inefficiency metrics
- Team size

**Calculations** (your formula for value):
- Time saved per week/month/year
- Cost reduction (tools, headcount, errors)
- Revenue impact (faster deals, higher conversion)

**Outputs** (what the prospect sees):
- Annual ROI percentage
- Payback period in months
- Total 3-year value

### Value Prop by Persona

| Persona | Cares About | Lead With |
|---------|-------------|-----------|
| CTO / VP Eng | Architecture, scale, security, team velocity | Technical superiority, integration depth |
| VP Sales | Pipeline, quota attainment, rep productivity | Revenue impact, time savings per rep |
| CFO | Total cost, payback period, risk | ROI, cost reduction, financial predictability |
| End user | Ease of use, daily workflow, learning curve | Time saved, frustration eliminated |

### Implementation Options

Default to **slide-based**: the ROI story lives in the deck the rep already
presents. Escape to a **spreadsheet** when the prospect supplies and wants to
change their own inputs; build a **web tool** only when deal volume justifies it.

---

## Demo Scripts & Talk Tracks

Read [references/demo-scripts.md](references/demo-scripts.md) for the script
structure, talk track types and lengths, key principles (demo after discovery),
and scene-by-scene templates.

---

## Case Study Briefs (Sales Format)

### How Sales Case Studies Differ

Marketing case studies tell a story. Sales case studies arm reps with fast-access proof. Keep them short, outcome-focused, and tagged for retrieval.

### Structure

1. **Customer profile**: Industry, company size, buyer role
2. **Challenge**: What they were struggling with (2-3 sentences)
3. **Solution**: What they implemented (1-2 sentences)
4. **Results**: 3 specific metrics (before/after)
5. **Pull quote**: One sentence from the customer
6. **Tags**: Industry, use case, company size, persona

### Organization

Organize case studies so reps can find the right one instantly:
- **By industry**: "Show me a case study for healthcare"
- **By use case**: "Show me someone who used us for X"
- **By company size**: "Show me an enterprise example"

---

## Proposal Templates

Read [references/proposal-templates.md](references/proposal-templates.md) for
the five-part structure, customization guidance, and common mistakes before
drafting a proposal.

---

## Sales Playbooks

### What Goes in a Playbook

- **Buyer profile**: Who you're selling to, their goals and pains
- **Qualification criteria**: BANT, MEDDIC, or your framework
- **Discovery questions**: Organized by topic, not a script
- **Objection handling**: Top 10 objections with responses
- **Competitive positioning**: How you win against each competitor
- **Demo flow**: Recommended sequence for each persona
- **Email templates**: Follow-up, proposal, check-in, breakup

### When to Build

- **New product launch**: Reps need a single source of truth
- **New market segment**: Different buyers need different approaches
- **New hire ramp**: Playbooks cut ramp time significantly

### Keeping It Living

Review quarterly, get input from top reps, remove anything outdated, and assign a named owner.

---

## Competitive Battle Cards

One card per competitor, one page, scannable in a live call.

| Field | Content |
|-------|---------|
| When you meet them | Segments, deal sizes, and triggers where they show up |
| Their pitch | How they describe themselves, quoted from their current site with date |
| Where we win | 3 differentiators, each with a sourced proof point |
| Where they push back | Their strongest claims against us, and our honest response |
| Landmines | Discovery questions that surface our strengths |
| Pricing context | Public prices with source and date; never guessed |
| Proof | Win stories and logos the user has approved for this use |

Keep cards and public comparison pages consistent. Buyers now check claims against "vs" pages, review sites, and AI-assistant answers before the call; a rep claim that contradicts the public page loses credibility. Refresh both when a competitor changes pricing or packaging. Evidence gathering and public pages: `suede-competitors` and `suede-competitor-profiling`.

---

## Buyer Persona Cards

### Card Structure

| Field | Description |
|-------|-------------|
| Role / title | Common titles and reporting structure |
| Goals | What success looks like for them |
| Pains | What frustrates them daily |
| Top objections | The 3-5 objections you'll hear from this role |
| Evaluation criteria | How they judge solutions |
| Buying process | Their role in the decision, who they influence |
| Messaging angle | The one sentence that resonates most |

### Persona Types

- **Economic buyer**: Signs the check. Cares about ROI and risk.
- **Technical buyer**: Evaluates the product. Cares about capabilities and integration.
- **End user**: Uses it daily. Cares about ease and workflow fit.
- **Champion**: Advocates internally. Needs ammunition to sell for you.
- **Blocker**: Opposes the purchase. Understand their concern to neutralize it.

---

## Output Format

Deliver the right format for each asset type:

| Asset | Deliverable |
|-------|-------------|
| Sales deck | Slide-by-slide outline with headline, body copy, and speaker notes |
| One-pager | Full copy with layout guidance (visual hierarchy, sections) |
| Objection doc | Table format: objection, response, proof point, follow-up |
| Demo script | Scene-by-scene with timing, talk track, and interaction points |
| ROI calculator | Input fields, formulas, output display with sample data |
| Playbook | Structured document with table of contents and sections |
| Persona card | One-page card format per persona |
| Battle card | One page per competitor in the field table above |
| Proposal | Section-by-section copy with customization notes |

Close every delivery with a **claim-source table**: each number, customer name, and capability claim in the asset, its source and date or its modeled assumptions, and whether the user has approved it for external use.

Every proof point and every ROI figure in a delivered asset carries an inline tag: `[source: named customer / study / internal report + date]` or `[modeled, assumptions: the inputs used]`. An untagged number is a delivery blocker: tag it or cut it before the asset goes out. The sales deck deliverable uses this unit, repeated for each of the 11 slides in the framework in [references/deck-frameworks.md](references/deck-frameworks.md):

```markdown
### Slide N: [slide name]
**Headline:** [the single idea, written as a sentence]
**Body copy:** [on-slide text, minimal]
**Speaker notes:** [what the rep says out loud, not a re-read of the slide]
**Visual:** [chart / screenshot / logo wall / none]
**Proof:** [source: …] or [modeled, assumptions: …] for every number above
```

---

## Tool Integrations

Partner-relationship and digital-sales-room platforms can support engagement
tracking, deal registration, and mutual action plans. Treat any named vendor as
an evaluation lead, not a guaranteed integration: verify current documentation,
authenticated access, pricing, permissions, and data-export behavior before use.

---

## Boundaries

- Do not publish, send, present, or upload sales collateral without approval of
  the final audience, claims, and version.
- Do not invent customer quotes, logos, benchmarks, savings, integrations, or
  product capabilities; cite the source for each proof point and label modeled
  ROI.
- Do not decide pricing, contract terms, discounts, guarantees, or legal
  commitments. Route those decisions to their accountable owner.

## Routing

- Use `suede-product-marketing` for approved positioning and proof context.
- Use `suede-competitor-profiling` for battle-card evidence and `suede-competitors`
  to keep cards consistent with public comparison pages.
- Use `suede-pricing` for pricing and packaging decisions.
- Use `suede-revops` for pipeline stages, routing, and deal-desk operations.
