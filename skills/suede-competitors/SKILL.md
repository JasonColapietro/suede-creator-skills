---
name: suede-competitors
description: "Suede-owned comparison-page discipline for honest alternative, versus, and competitor-comparison content that serves evaluators and search intent. Use when planning or writing a public page that positions products against named alternatives from verified evidence. NOT FOR: gathering the underlying competitor evidence (use suede-competitor-profiling), internal battle cards (use suede-sales-enablement), or scaled page generation (use suede-programmatic-seo)."
metadata:
  version: 2.0.1
---

# Suede Competitor and Alternative Pages

Use this Suede comparison-page playbook to serve competitive search intent while keeping every product claim current, sourced, and fair.

## Initial Assessment

Check for `.agents/product-marketing.md` (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md`) and read it if present — your value proposition, ICP, pricing model, and honest weaknesses decide which comparisons are even defensible, and they are usually already written down there.

Then work the intake list under Task-Specific Questions below; ask only what the context file did not already answer. Current competitor evidence — pricing, features, ratings — comes from `suede-competitor-profiling`, not from memory.

---

## Page Formats

### Format 1: [Competitor] Alternative (Singular)

**Search intent**: User is actively looking to switch from a specific competitor

**URL pattern**: `/alternatives/[competitor]` or `/[competitor]-alternative`

**Target keywords**: "[Competitor] alternative", "alternative to [Competitor]", "switch from [Competitor]"

**Page structure**:
1. Why people look for alternatives (validate their pain)
2. Summary: You as the alternative (quick positioning)
3. Detailed comparison (features, service, pricing)
4. Who should switch (and who shouldn't)
5. Migration path
6. Social proof from switchers
7. CTA

---

### Format 2: [Competitor] Alternatives (Plural)

**Search intent**: User is researching options, earlier in journey

**URL pattern**: `/alternatives/[competitor]-alternatives`

**Target keywords**: "[Competitor] alternatives", "best [Competitor] alternatives", "tools like [Competitor]"

**Page structure**:
1. Why people look for alternatives (common pain points)
2. What to look for in an alternative (criteria framework)
3. List of alternatives (you first, but include real options)
4. Comparison table (summary)
5. Detailed breakdown of each alternative
6. Recommendation by use case
7. CTA

**Important**: Include 4-7 real alternatives. Being genuinely helpful builds trust and ranks better.

**AI-answer expectations by stage**: these pages can earn *citations* in AI answers, but whether AI *recommends* your brand from them also depends on offsite consensus (reviews, forums, analysts). For emerging brands, a self-ranked list may surface competitors while the brand receives only a citation. Treat that as a hypothesis and route current visibility evidence and claim validation to `suede-seo-audit`.

---

### Format 3: You vs [Competitor]

**Search intent**: User is directly comparing you to a specific competitor

**URL pattern**: `/vs/[competitor]` or `/compare/[you]-vs-[competitor]`

**Target keywords**: "[You] vs [Competitor]", "[Competitor] vs [You]"

**Page structure**:
1. TL;DR summary (key differences in 2-3 sentences)
2. At-a-glance comparison table
3. Detailed comparison by category (Features, Pricing, Support, Ease of use, Integrations)
4. Who [You] is best for
5. Who [Competitor] is best for (be honest)
6. What customers say (testimonials from switchers)
7. Migration support
8. CTA

---

### Format 4: [Competitor A] vs [Competitor B]

**Search intent**: User comparing two competitors (not you directly)

**URL pattern**: `/compare/[competitor-a]-vs-[competitor-b]`

**Page structure**:
1. Overview of both products
2. Comparison by category
3. Who each is best for
4. The third option (introduce yourself)
5. Comparison table (all three)
6. CTA

**Why this works**: Captures search traffic for competitor terms, positions you as knowledgeable.

---

## Cliches to Refuse

A comparison page written on autopilot arrives with these already in it. Each one
tells an evaluator the page is marketing, not research — refuse them by name:

- **The strawman competitor.** A weakness stated as caricature ("clunky", "built for 2015") rather than a specific, sourced limitation a user would actually hit.
- **A "Winner" row.** No verdict row, no trophy, no score-out-of-10 that resolves to you. The reader decides; the page supplies evidence.
- **Fake balance.** "They're great for enterprise, we're great for everyone else" concedes nothing. A real concession names a case where the competitor is the better buy for a reader you want.
- **A table where every row favors you.** If the dimensions were chosen honestly, some rows go the other way. If none do, the dimensions were chosen to win, not to inform.

For the two remaining defaults — the ✓/✗ feature table and a migration section with no real friction — use the concrete before/after in [references/templates.md](references/templates.md): "Comparison Table Best Practices" and "Migration Section".

---

## Essential Sections

### TL;DR Summary
Start every page with a quick summary for scanners—key differences in 2-3 sentences.

### Paragraph Comparisons
Go beyond tables. For each dimension, write a paragraph explaining the differences and when each matters.

### Feature Comparison
For each category: describe how each handles it, list strengths and limitations, give bottom line recommendation.

### Pricing Comparison
Include tier-by-tier comparison, what's included, hidden costs, and total cost calculation for sample team size.

### Who It's For
Be explicit about ideal customer for each option. Honest recommendations build trust.

Every page names at least one dimension where the competitor genuinely wins and
the reader should not switch — sourced like any other claim, with a URL and a
checked date. Not a hedge ("some teams prefer..."), a concession: the specific
reader, the specific reason. A page with no such dimension is not finished; it
means the comparison was scoped to guarantee the answer.

### Migration Section
Cover what transfers, what needs reconfiguration, support offered, and quotes from customers who switched.

**For detailed templates**: See [references/templates.md](references/templates.md)

---

## Content Architecture

### Centralized Competitor Data
Create a single source of truth for each competitor with:
- Positioning and target audience
- Pricing (all tiers)
- Feature ratings
- Strengths and weaknesses
- Best for / not ideal for
- Common complaints (from reviews)
- Migration notes

**For data structure and examples**: See [references/content-architecture.md](references/content-architecture.md)

---

## Research Process

### Deep Competitor Research

For each competitor, gather:

1. **Product research**: Sign up, use it, document features/UX/limitations
2. **Pricing research**: Current pricing, what's included, hidden costs
3. **Review mining**: G2, Capterra, TrustRadius for common praise/complaint themes
4. **Customer feedback**: Talk to customers who switched (both directions)
5. **Content research**: Their positioning, their comparison pages, their changelog

### Ongoing Updates

- **Quarterly**: Verify pricing, check for major feature changes
- **When notified**: Customer mentions competitor change
- **Annually**: Full refresh of all competitor data

---

## SEO Considerations

### Keyword Targeting

| Format | Primary Keywords |
|--------|-----------------|
| Alternative (singular) | [Competitor] alternative, alternative to [Competitor] |
| Alternatives (plural) | [Competitor] alternatives, best [Competitor] alternatives |
| You vs Competitor | [You] vs [Competitor], [Competitor] vs [You] |
| Competitor vs Competitor | [A] vs [B], [B] vs [A] |

### Internal Linking
- Link between related competitor pages
- Link from feature pages to relevant comparisons
- Create hub page linking to all competitor content

### Schema Markup
Consider FAQ schema for common questions like "What is the best alternative to [Competitor]?"

---

## Before You Hand It Over

Boundaries below requires a final claim review before any comparison page ships.
This is that review — run it as a second pass over the finished draft, not while
drafting:

1. Re-read every claim about a competitor: pricing, tier contents, feature
   availability, ratings, review counts, testimonials, headcount, funding.
2. Each one carries a source URL and the date you checked it. A claim without
   both is **cut, or explicitly marked unverified in the page** — never softened
   into hedged prose ("reportedly", "many users find", "known for"). Hedging an
   unsourced claim keeps the claim and loses the accountability.
3. Anything sourced more than a quarter ago gets re-checked before publication,
   not carried forward. Pricing pages move.
4. Claims about your own live visibility or how AI answers cite the page are not
   verifiable from here — route those to `suede-seo-audit`.

---

## Output Format

Three deliverables, all with their schemas in the references — do not invent a
shape for them:

- **Competitor data file** — the centralized per-competitor record; structure in [references/content-architecture.md](references/content-architecture.md).
- **Page content** — URL, meta tags, full copy by section, tables, CTAs; section templates in [references/templates.md](references/templates.md).
- **Page set plan** — which pages to create, in priority order by search volume and evidence readiness.

---

## Task-Specific Questions

1. What are common reasons people switch to you?
2. Do you have customer quotes about switching?
3. What's your pricing vs. competitors?
4. Do you offer migration support?

---

## Boundaries

- Do not invent, cherry-pick, or present stale competitor claims, prices, features, testimonials, or rankings as current fact.
- Do not publish, deploy, index, or update comparison pages without explicit authorization and a final claim review.
- Do not use competitor trademarks in a way that implies affiliation or reuse protected creative assets without rights.
- Do not decide that an option is universally best; state audience, criteria, tradeoffs, sources, and checked dates.

## Routing

- Need current competitor evidence -> use `suede-competitor-profiling`.
- Need review-mining or forum synthesis for the "common complaints" and switching-reason sections -> use `suede-customer-research`.
- Need scaled comparison-page architecture -> use `suede-programmatic-seo`.
- Need final page copy or organic QA -> use `suede-copy` or `suede-seo-audit`.
- Need internal battle cards -> use `suede-sales-enablement`.
- From those skills, route honest public alternative and versus-page composition back to `suede-competitors`.
