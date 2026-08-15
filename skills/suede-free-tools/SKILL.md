---
name: suede-free-tools
description: "Suede-affiliated engineering-as-marketing strategy for selecting, scoring, and scoping calculators, graders, generators, and other free interactive tools. Use when the user wants a lead, link, education, or product-adoption asset with a measurable path to the paid product. NOT FOR: downloadable lead assets (use suede-lead-magnets), implementation of a full website (use suede-site-alchemy), or search diagnostics (use suede-seo-audit)."
metadata:
  version: 2.0.0
---

# Suede Free-Tool Growth Strategy

Suede uses engineering as marketing when a genuinely useful tool can create qualified discovery and a natural bridge to the paid product. Select, score, and scope the smallest maintainable calculator, grader, generator, or utility whose output earns attention rather than merely capturing it.

## Initial Assessment

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Before designing a tool strategy, understand:

1. **Business Context** - What's the core product? Who is the target audience? What problems do they have?

2. **Goals** - Lead generation? SEO/traffic? Brand awareness? Product education? What is one lead worth (LTV and close rate from this source)?

3. **Resources** - Technical capacity to build? Ongoing maintenance bandwidth? Budget for promotion? Timeline?

4. **Existing Behavior** - What tools or manual workarounds does the audience use today? How are leads generated now?

---

## Core Principles

### 1. Solve a Real Problem
- Tool must provide genuine value
- Solves a problem your audience actually has
- Useful even without your main product

### 2. Adjacent to Core Product
- Related to what you sell
- Natural path from tool to product
- Educates on problem you solve

### 3. Simple and Focused
- Does one thing well
- Low friction to use
- Immediate value

### 4. Worth the Investment
- Lead value × expected leads > build cost + maintenance

Populate all four terms before calling the go/no-go, and show the arithmetic:
- **Lead value** = customer LTV × close rate for this lead source, from the intake numbers.
- **Expected leads** = monthly search volume for the SEO target keyword × a stated visit-to-use rate × a stated use-to-capture rate.
- **Build cost** = the MVP scope below, in engineer-days.
- **Maintenance** = engineer-days per quarter to keep data, dependencies, and the hosting current.

State every rate you assumed and where it came from. If a term cannot be sourced,
say which one and mark the go/no-go unresolved rather than filling it in.

---

## Tool Types Overview

| Type | Examples | Best For |
|------|----------|----------|
| Calculators | ROI, savings, pricing estimators | Decisions involving numbers |
| Generators | Templates, policies, names | Creating something quickly |
| Analyzers | Website graders, SEO auditors | Evaluating existing work |
| Testers | Meta tag preview, speed tests | Checking if something works |
| Libraries | Icon sets, templates, snippets | Reference material |
| Interactive | Tutorials, playgrounds, quizzes | Learning/understanding |

**For detailed tool types and examples**: See [references/tool-types.md](references/tool-types.md)

---

## Ideation Framework

### Start with Pain Points

1. **What problems does your audience Google?** - Search query research, common questions

2. **What manual processes are tedious?** - Spreadsheet tasks, repetitive calculations

3. **What do they need before buying your product?** - Assessments, planning, comparisons

4. **What information do they wish they had?** - Data they can't easily access, benchmarks

### Validate the Idea

- **Search demand**: Is there search volume? How competitive?
- **Uniqueness**: What exists? How can you be 10x better?
- **Lead quality**: Does this audience match buyers?
- **Build feasibility**: How complex? Can you scope an MVP?

---

## Lead Capture Strategy

### Gating Options

| Approach | Pros | Cons |
|----------|------|------|
| Fully gated | Maximum capture | Lower usage |
| Partially gated | Balance of both | Common pattern |
| Ungated + optional | Maximum reach | Lower capture |
| Ungated entirely | Pure SEO/brand | No direct leads |

### Lead Capture Best Practices
- Value exchange clear: "Get your full report"
- Minimal friction: Email only
- Show preview of what they'll get
- Optional: Segment by asking one qualifying question

The gating trade-off itself — per-field conversion cost and how to frame the
exchange — is owned by `suede-lead-magnets`. Use its gating tables when deciding
what to ask for; the table above only covers where the gate sits in a tool.

---

## SEO Considerations

### Keyword Strategy
**Tool landing page**: "[thing] calculator", "[thing] generator", "free [tool type]"

**Supporting content**: "How to [use case]", "What is [concept]"

### Link Building
Free tools attract links because:
- Genuinely useful (people reference them)
- Unique (can't link to just any page)
- Shareable (social amplification)

---

## Build vs. Buy

### Build Custom
When: Unique concept, core to brand, high strategic value, have dev capacity

### Use No-Code Tools
Options: Outgrow, Involve.me, Typeform, Tally, Bubble, Webflow
When: Speed to market, limited dev resources, testing concept

### Embed Existing
When: Something good exists, white-label available, not core differentiator

---

## MVP Scope

### Minimum Viable Tool
1. Core functionality only—does the one thing, works reliably
2. Essential UX—clear input, obvious output, mobile works
3. Basic lead capture—email collection, leads go somewhere useful

### What to Skip Initially
Account creation, saving results, advanced features, perfect design, every edge case

---

## Evaluation Scorecard

Rate each factor 1-5:

| Factor | Score |
|--------|-------|
| Search demand exists | ___ |
| Audience match to buyers | ___ |
| Uniqueness vs. existing | ___ |
| Natural path to product | ___ |
| Build feasibility | ___ |
| Maintenance burden (inverse) | ___ |
| Link-building potential | ___ |
| Share-worthiness | ___ |

**25+**: Strong candidate | **15-24**: Promising | **<15**: Reconsider

Anchors for the three decisive factors — score these against the anchor, not on
impression, and cite the evidence used:

| Factor | 1 | 3 | 5 |
|--------|---|---|---|
| Search demand exists | No query with measurable volume | A query family in the hundreds of searches/month | A head term in the thousands/month |
| Build feasibility | Needs a data pipeline, licensed data, or an ongoing integration | Two to four engineer-weeks with known components | One engineer-week, one screen, no backend state |
| Maintenance burden (inverse) | Depends on data refreshed on a schedule or a third-party API | Occasional content or dependency updates | Static computation, nothing to refresh |

---

## Output Format

Return exactly these sections:

### 1. Recommended Tool
Name and the one-sentence job it does for the user.

### 2. Scorecard
The filled table with a score per factor, the total, and the verdict band. For the
three anchored factors, name the evidence behind the score.

### 3. MVP Scope
Two explicit lists: **In** (what v1 does) and **Out** (what is deliberately
deferred). No item appears in both.

### 4. Gating Decision
Which option from Gating Options, and the trade-off accepted in one line.

### 5. SEO Target
The single target query for the tool page, plus the supporting-content query.

### 6. Instrumentation Handoff
The two or three usage events the tool must emit (use, complete, capture) so
`suede-analytics` can read the funnel. This skill does not define the metrics
plan itself.

---

## Boundaries

- Do not claim search demand, lead volume, link potential, or build feasibility without evidence and dated assumptions.
- Do not build, deploy, publish, collect leads, or connect production data unless the user authorizes implementation.
- Do not invent tool outputs or use a calculator as disguised professional, legal, medical, or financial advice.
- Do not decide pricing, data-retention, or consent policy for the user.

## Routing

- Use `suede-lead-magnets` for downloadable assets and `suede-site-alchemy` for the public conversion surface.
- Use `suede-seo-audit` for search validation and `suede-analytics` for usage measurement.
- Use `suede-emails` for the post-capture lifecycle sequence.
- Use `suede-content-strategy` for the supporting content around the tool page.
- Use `suede-ads` and `suede-social` for tool distribution and launch promotion.
- Use `suede-ab-testing` to design and evaluate tests on the tool page or its gate.
