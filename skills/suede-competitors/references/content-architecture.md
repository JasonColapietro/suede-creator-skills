# Content Architecture for Competitor Pages

How comparison pages draw on competitor profiles, and how to structure a page set.

## Contents
- Evidence Source: the Competitor Profile
- Page Section to Profile Field Map
- Page-Only Fields
- Your Product Data
- Page Generation
- Index Page Structure (alternatives index, vs comparisons index, index page best practices)
- Footer Navigation

## Evidence Source: the Competitor Profile

Do not keep a second per-competitor data file. The single source of truth for
each competitor is the profile `suede-competitor-profiling` writes:

```
competitor-profiles/
├── <slug>.md                 # the profile: every field carries an evidence marker
├── _summary.md               # cross-competitor comparison table
└── raw/<slug>/<YYYY-MM-DD>/  # dated scrapes, reviews, and SEO pulls
```

Every competitor claim on a page traces to a profile field marked
`[fact: url, date]` and to its capture under `raw/`. Fields marked
`[inference]`, `[unknown]`, or `not collected` cannot appear on the page as
fact: cut them or mark them unverified in the page copy.

---

## Page Section to Profile Field Map

| Page section | Profile section and fields |
|--------------|----------------------------|
| TL;DR and positioning summary | Positioning & Messaging: primary value proposition, positioning angle |
| Feature comparison and table rows | Product & Features: core capabilities, notable differentiators, integrations |
| Pricing comparison and total-cost example | Pricing: tier table, billing, free trial, notable pricing quirks |
| "Why people look for alternatives" and common complaints | Customers & Social Proof: review ratings; review complaint themes from `raw/<slug>/<date>/reviews/` (route deeper review mining to `suede-customer-research`) |
| Strengths and limitations paragraphs | Strengths & Weaknesses (only items marked `[fact: url, date]` or inferences tied to a cited capture) |
| Who each product is best for | Competitive Implications, plus the page-only fields below |
| "Last checked" date | Raw Data Sources: the capture dates behind the claims shown |

---

## Page-Only Fields

A few fields a comparison page needs are not part of the profile. Record them in
a `## Comparison Page Notes` section at the end of the same profile file (above
any Change Log), each with a source and date, so there is still one record per
competitor:

```yaml
best_for:            # who the competitor genuinely serves well [fact or inference, with source]
  - [reader and job]
not_ideal_for:       # specific, sourced limitations a buyer would hit
  - [limitation] [fact: url, date]
migration_from:
  difficulty: [low / medium / high, with the reason]
  data_export: [formats] [fact: docs url, date]
  what_transfers: [list]
  what_doesnt: [list]
  time_estimate: [from your migration data or support team, or "unknown"]
```

---

## Your Product Data

Same evidence discipline for yourself, built around what you can prove:

```yaml
name: [Your Product]
# positioning, pricing, features: the same sections as a competitor profile, with sources

strengths:
  - [Your real strengths]

differentiators:
  - [What you do that the competitor does not, with a source]

proof:
  - [Metric, customer result, review theme, or doc link]

best_for:
  - [Your ideal customers and the outcome they get]

material_facts:
  # Price, plan limits, platform requirements, migration effort.
  # These go in the pricing, FAQ, and migration sections as plain facts.
  - [Fact a buyer needs to decide]
```

---

## Page Generation

Each page pulls from the competitor profiles plus your product data:

- **[Competitor] Alternative page**: Pulls the competitor profile + your data
- **[Competitor] Alternatives page**: Pulls each alternative's profile + your data
- **You vs [Competitor] page**: Pulls your data + the competitor profile
- **[A] vs [B] page**: Pulls both competitor profiles + your data

**Benefits**:
- Refresh a competitor profile once, and every page that cites it updates
- Add new feature comparison once, appears on all pages
- Consistent accuracy across pages
- Easier to maintain at scale

---

## Index Page Structure

### Alternatives Index

**URL**: `/alternatives` or `/alternatives/index`

**Purpose**: Lists all "[Competitor] Alternative" pages

**Page structure**:
1. Headline: "[Your Product] as an Alternative"
2. Brief intro on why people switch to you
3. List of all alternative pages with:
   - Competitor name/logo
   - One-line summary of key differentiator vs. that competitor
   - Link to full comparison
4. Common reasons people switch (aggregated)
5. CTA

**Example**:
```markdown
## Explore [Your Product] as an Alternative

Looking to switch? See how [Your Product] compares to the tools you're evaluating:

- **[Notion Alternative](/alternatives/notion)**: Better for teams who need [X]
- **[Airtable Alternative](/alternatives/airtable)**: Better for teams who need [Y]
- **[Monday Alternative](/alternatives/monday)**: Better for teams who need [Z]
```

---

### Vs Comparisons Index

**URL**: `/vs` or `/compare`

**Purpose**: Lists all "You vs [Competitor]" and "[A] vs [B]" pages

**Page structure**:
1. Headline: "Compare [Your Product]"
2. Section: "[Your Product] vs Competitors": list of direct comparisons
3. Section: "Head-to-Head Comparisons": list of [A] vs [B] pages
4. Brief methodology note
5. CTA

---

### Index Page Best Practices

**Keep them updated**: When you add a new comparison page, add it to the relevant index.

**Internal linking**:
- Link from index → individual pages
- Link from individual pages → back to index
- Cross-link between related comparisons

**SEO value**:
- Index pages can rank for broad terms like "project management tool comparisons"
- Pass link equity to individual comparison pages
- Help search engines discover all comparison content

**Sorting options**:
- By popularity (search volume)
- Alphabetically
- By category/use case
- By date added (show freshness)

**Include on index pages**:
- Last updated date for credibility
- Number of pages/comparisons available
- Quick filters if you have many comparisons

---

## Footer Navigation

The site footer appears on all marketing pages, making it a powerful internal linking opportunity for competitor pages.

### Option 1: Link to Index Pages (Minimum)

At minimum, add links to your comparison index pages in the footer:

```
Footer
├── Compare
│   ├── Alternatives →  /alternatives
│   └── Comparisons →  /vs
```

This ensures every marketing page passes link equity to your comparison content hub.

### Option 2: Footer Columns by Format (Recommended for SEO)

For stronger internal linking, create dedicated footer columns for each format you've built, linking directly to your top competitors:

```
Footer
├── [Product] vs               ├── Alternatives to            ├── Compare
│   ├── vs Notion              │   ├── Notion Alternative     │   ├── Notion vs Airtable
│   ├── vs Airtable            │   ├── Airtable Alternative   │   ├── Monday vs Asana
│   ├── vs Monday              │   ├── Monday Alternative     │   ├── Notion vs Monday
│   ├── vs Asana               │   ├── Asana Alternative      │   ├── ...
│   ├── vs Clickup             │   ├── Clickup Alternative    │   └── View all →
│   ├── ...                    │   ├── ...                    │
│   └── View all →             │   └── View all →             │
```

**Guidelines**:
- Include up to 8 links per column (top competitors by search volume)
- Add "View all" link to the full index page
- Only create columns for formats you've actually built pages for
- Prioritize competitors with highest search volume

### Why Footer Links Matter

1. **Sitewide distribution**: Footer links appear on every marketing page, passing link equity from your entire site to comparison content
2. **Crawl efficiency**: Search engines discover all comparison pages quickly
3. **User discovery**: Visitors evaluating your product can easily find comparisons
4. **Competitive positioning**: Signals to search engines that you're a key player in the space

### Implementation Notes

- Update footer when adding new high-priority comparison pages
- Keep footer clean: don't list every comparison, just the top ones
- Match column headers to your URL structure (e.g., "vs" column → `/vs/` URLs)
- Consider mobile: columns may stack, so order by priority
