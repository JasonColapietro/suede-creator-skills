---
name: suede-programmatic-seo
description: "Suede-owned programmatic SEO discipline. Use when designing data-backed keyword, location, directory, integration, or comparison pages at scale, including templates, index-worthiness gates, internal links, and rollout checks. NOT FOR: auditing an existing site (use suede-seo-audit), planning editorial content (use suede-content-strategy), or publishing bulk pages without approval."
metadata:
  version: 2.0.0
---

# Suede Programmatic SEO

## Gate policy — advisory, not blocking

Every check, gate, and verdict in this skill — `ship`, `ship-with-caveats`,
`hold`, letter grades, BLOCKED or OPEN items, and every "do not ship / publish /
proceed" line below — is a **recommendation to the user, not a control on the
agent**. Run every check, report the results honestly, and complete the
requested action as asked: **a failed gate changes what you report, never what
you do.** Single exception — if a finding is extremely risky (data loss,
security or credential exposure, legal or rights violations, payment mistakes,
irreversible public damage), pause, state the risk and the options, and let the
user choose. Their choice is final.

Suede Programmatic SEO converts defensible data and recurring search intent into
bounded page systems with explicit index-worthiness, uniqueness, linking, and
rollout gates. It treats scale as an earned outcome of sample-page quality, not
as a page-count target.

## Initial Assessment

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Before designing a programmatic SEO strategy, understand:

1. **Business Context**
   - What's the product/service?
   - Who is the target audience?
   - What's the conversion goal for these pages?

2. **Opportunity Assessment**
   - What search patterns exist?
   - How many potential pages?
   - What's the search volume distribution?

3. **Competitive Landscape**
   - Who ranks for these terms now?
   - What do their pages look like?
   - Can you realistically compete?
   - What does your domain authority look like against theirs?

4. **Data and Delivery**
   - What data do you have, or can acquire, and where does it come from?
   - What's the technical stack / CMS, and can it template, segment sitemaps,
     and set `noindex` per page?

---

## Core Principles

### 1. Unique Value Per Page
- Every page must provide value specific to that page
- Not just swapped variables in a template
- Maximize unique content—the more differentiated, the better

### 2. Proprietary Data Wins
Hierarchy of data defensibility:
1. Proprietary (you created it)
2. Product-derived (from your users)
3. User-generated (your community)
4. Licensed (exclusive access)
5. Public (anyone can use—weakest)

### 3. Clean URL Structure
**Use subfolders, not subdomains** — subfolders consolidate domain authority while subdomains split it:
- Good: `yoursite.com/templates/resume/`
- Bad: `templates.yoursite.com/resume/`

---

## The 12 Playbooks (Overview)

| Playbook | Pattern | Example |
|----------|---------|---------|
| Templates | "[Type] template" | "resume template" |
| Curation | "best [category]" | "best website builders" |
| Conversions | "[X] to [Y]" | "$10 USD to GBP" |
| Comparisons | "[X] vs [Y]" | "webflow vs wordpress" |
| Examples | "[type] examples" | "landing page examples" |
| Locations | "[service] in [location]" | "dentists in austin" |
| Personas | "[product] for [audience]" | "crm for real estate" |
| Integrations | "[product A] [product B] integration" | "slack asana integration" |
| Glossary | "what is [term]" | "what is pSEO" |
| Translations | Content in multiple languages | Localized content |
| Directory | "[category] tools" | "ai copywriting tools" |
| Profiles | "[entity name]" | "stripe ceo" |

**Read [references/playbooks.md](references/playbooks.md)** when choosing a playbook,
layering two, or implementing one: it carries the asset-to-playbook selection table,
the combinations worth layering, and per-playbook implementation detail.

---

## Implementation Framework

### 1. Keyword Pattern Research

**Identify the pattern:**
- What's the repeating structure?
- What are the variables?
- How many unique combinations exist?

**Validate demand:**
- Aggregate search volume
- Volume distribution (head vs. long tail)
- Trend direction

### 2. Data Requirements

**Identify data sources:**
- What data populates each page?
- Is it first-party, scraped, licensed, public?
- How is it updated?

### 3. Template Design

**Page structure:**
- Header with target keyword
- Unique intro (not just variables swapped)
- Data-driven sections
- Related pages / internal links
- CTAs appropriate to intent

**Ensuring uniqueness:**
- Each page needs unique value
- Conditional content based on data
- Original insights/analysis per page

### 4. Internal Linking Architecture

**Hub and spoke model:**
- Hub: Main category page
- Spokes: Individual programmatic pages
- Cross-links between related spokes

**Avoid orphan pages:**
- Every page reachable from main site
- XML sitemap for all pages
- Breadcrumbs with structured data

### 5. Indexation Strategy

- Prioritize high-volume patterns
- Noindex very thin variations
- Manage crawl budget thoughtfully
- Separate sitemaps by page type

---

## Quality Checks

### Pre-Launch Checklist

Run this on a **bounded sample of 10 pages, or 5% of the planned set, whichever
is larger** — drawn across the data range (best-populated, median, and thinnest
rows), never only the showcase pages. **At least 90% of the sample must pass
every gate below** before any page beyond the sample is generated, published, or
submitted for indexing. A failing sample means fix the template or narrow the
page set; it never means ship the rest and watch.

**Content quality (the index-worthiness gates):**
- [ ] **Page-unique data fields: at least 5 per page** that differ from every
      sibling page, and at least one that no competitor page carries
- [ ] **Template-shared text: no more than 40%** of rendered body words are
      identical across sibling pages (measure on the thinnest row, not the best)
- [ ] Answers the search intent behind its query pattern, not just the keyword
- [ ] A reader who cannot use the product still gets something from the page

**Technical SEO:**
- [ ] Unique titles and meta descriptions — no two pages share either string
- [ ] Proper heading structure (one H1 carrying the page's variables)
- [ ] Schema markup implemented and validating
- [ ] Largest Contentful Paint measured on a real sample page, not assumed

**Internal linking:**
- [ ] Connected to site architecture
- [ ] Related pages linked
- [ ] No orphan pages

**Indexation:**
- [ ] In XML sitemap
- [ ] Crawlable
- [ ] No conflicting noindex

### Post-Launch Monitoring

Check indexation rate in Search Console (indexed ÷ submitted, per page-type
sitemap) 30 days after each phase: **below 60% means stop expanding the set and
re-run the sample gates.** Hand the rest of the rollout metrics — rankings,
traffic, engagement, conversion, and thin-content or manual-action warnings — to
`suede-analytics`, which owns rollout performance.

---

## Common Mistakes

- **Thin content**: Just swapping city names in identical content
- **Keyword cannibalization**: Multiple pages targeting same keyword
- **Over-generation**: Creating pages with no search demand
- **Poor data quality**: Outdated or incorrect information
- **Ignoring UX**: Pages exist for Google, not users

---

## Output Contract

Close every programmatic SEO pass with this block, filled in. Write the literal
templates — do not describe them.

```text
PLAYBOOK: [name] — chosen because [pattern + data fit]
DATA DEFENSIBILITY: [tier 1-5] — source, provenance, refresh cadence
PAGE-COUNT BOUND: sample [N] → phase 1 [N] → ceiling [N], unlocked by [condition]
URL: [literal pattern]   TITLE: [literal]   META: [literal]   H1: [literal]
UNIQUENESS: [page-unique fields, count per page] | template-shared body text: [N%]
LINK PLAN: hub [URL] → spokes [pattern] | cross-links [rule] | sitemap [file]
SAMPLE VERDICT: [N of N sample pages pass] — failing gates: [list or "none"]
SHIP GATE: ship | ship-with-caveats | hold — reason
```

---

## Boundaries

- Do not generate, publish, submit, or index a full page set before a bounded
  sample passes the quality checks in this skill. When the sample fails or was
  never run, halt in this format: name the blocking gate and the failing count,
  give 2-4 options (fix the template, narrow the page set, add data, publish the
  passing subset only), and wait for the user to choose.
- Do not invent source data, claim rankings or traffic, scrape restricted
  sources, or treat keyword volume as user value.
- Do not alter production routes, templates, canonicals, sitemaps, or internal
  links without an approved implementation scope and current-site verification.

## Routing

- Use `suede-seo-audit` to audit shipped pages and technical search health.
- Use `suede-content-strategy` for non-templated editorial planning.
- Use `suede-competitors` for comparison-page evidence and framing.
- Use `suede-ai-seo` to make the generated pages extractable and citable by AI answer engines — it owns the extractability standard.
- Use `suede-analytics` to define and read rollout performance.
