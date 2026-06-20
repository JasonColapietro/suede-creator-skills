---
name: suede-seo-audit
description: Full SEO, AEO, and AI EO audit for websites, GitHub Pages, landing pages, app listings, docs surfaces, and any public URL. Covers technical access, metadata, schema markup, crawlability, search intent, answer intent, internal linking, content structure, copy quality, conversion readiness, and AI citation readiness — with ranked findings, exact rewrites, and a scored visibility report. Use when a page needs to be found, understood, cited by AI systems, and acted on.
---

# Suede SEO Audit

Use this skill to audit any public surface for discoverability, AI citation
readiness, trust, and conversion. SEO here means the full stack: classical
search, answer engines (Perplexity, SGE, Bing Chat), AI knowledge synthesis
(ChatGPT Browse, Claude, Gemini), and long-tail schema-driven features. A
surface that scores well here can be found, understood, quoted, and acted on.

This skill goes deeper than an inline copy audit. It inspects live page source,
validates schema, traces crawl access, checks AI EO signals, and produces exact
rewrites with a lane-by-lane grade. Use suede-copy for writing new copy. Use
this skill when the audit itself is the deliverable.

---

## 1. Source Truth

Do not audit from memory. Before writing a single finding, verify the live
surface.

### Required pre-audit checks

- HTTP status code (200, 301, 404, 503 — note exact code)
- Final URL after all redirects (is the canonical URL the destination?)
- `robots.txt` — is the path allowed? Is `Disallow: /` blocking indexers?
- `<meta name="robots">` or `<meta name="googlebot">` — noindex? nofollow?
- `<link rel="canonical">` — does it match the intended URL exactly?
- Sitemap entry — is the URL present in any listed sitemap?
- `<title>` tag — exact text, character count
- `<meta name="description">` — exact text, character count
- Open Graph tags — og:title, og:description, og:image, og:url, og:type
- Twitter card tags — twitter:card, twitter:title, twitter:description,
  twitter:image
- JSON-LD presence — any `<script type="application/ld+json">` block present?
- Primary H1 — exact text, position in document

If the URL is inaccessible, note that and audit from source files with caveats.
If the page is behind auth or a paywall, say so and limit the audit to what is
accessible.

---

## 2. Audit Lanes

Run all lanes. Score each A-F at the end. State explicitly when a check
was skipped and why.

---

### Lane 0: Keyword Research (optional mode)

Activate this lane when the user asks "what should this page rank for", "find
the right keywords", or any equivalent keyword-discovery request. Skip it for
pure technical or copy audits.

**Goal:** produce a keyword brief the page can be built or optimized around.

1. **Primary keyword**: one phrase the page should be #1 for. Match search
   intent precisely — classify as informational, navigational, commercial, or
   transactional.

2. **Secondary keywords**: 3–5 phrases the page should rank on page 1 for.
   Related but not synonymous with the primary keyword.

3. **LSI / supporting terms**: 5–10 phrases, entities, and related concepts
   that should appear naturally in the content. These signal topic depth to
   search engines.

4. **Competitor gap**: name 2–3 queries that competitor pages rank for on this
   topic but the target page does not cover.

5. **SERP feature opportunities**: which SERP features is the target eligible
   for? Options: Featured snippet, People Also Ask, Image pack, Video carousel,
   Knowledge panel, Local pack, Site links.

Output keyword brief:

```
Primary: [keyword] — [intent: info/nav/commercial/transactional]
Secondary: [k1], [k2], [k3]
LSI terms: [list]
Competitor gap queries: [list]
SERP feature targets: [list]
```

Lane 0 is informational only — it produces a brief, not a grade. Incorporate
the brief into Lanes 2–7 findings where relevant.

---

### Lane 1: Technical Access

**Goal:** confirm that crawlers, indexers, and AI scrapers can reach, parse,
and attribute the page.

Checklist:

- [ ] HTTP status is 200 on the canonical URL
- [ ] No redirect chain longer than one hop (double redirects dilute equity)
- [ ] Canonical URL is self-referencing and matches the intended URL
- [ ] Trailing slash is consistent across all internal links to this page
- [ ] www and non-www resolve to the same canonical (no duplicate indexing)
- [ ] http redirects to https (no mixed-content split)
- [ ] `robots.txt` allows the path for `*`, `Googlebot`, and `GPTBot`
- [ ] `<meta name="robots">` is absent or set to `index, follow`
- [ ] Sitemap lists the canonical URL with a valid `<lastmod>` date
- [ ] Page loads meaningful content without JavaScript execution (check
      `curl -A "Googlebot"` output or view-source)
- [ ] Core Web Vitals: if LCP > 4s, CLS > 0.25, or INP > 500ms is observable
      from available tooling, note it — do not invent scores

Lane 1 grade drops to C or below if: any indexability block is present, if the
canonical is wrong, or if the page is JavaScript-only with no SSR/SSG fallback.

---

### Lane 2: Search and Answer Intent

**Goal:** confirm the page has a single coherent intent that matches real
queries and can earn a featured snippet or AI citation.

Checklist:

- [ ] Name the primary reader in one phrase (e.g., "a creator who wants to
      register a music release")
- [ ] Name the primary query theme — what someone types or asks to land here
- [ ] Write the AI-answer-ready definition: one or two sentences that define the
      page's subject precisely enough for an LLM to quote directly
- [ ] Name one action the page should earn (install, sign up, read docs, fork
      repo, contact)
- [ ] Check for keyword cannibalization: are there three or more other pages on
      the same site targeting the same primary term? If yes, flag which URL
      should be the canonical topic owner
- [ ] Does the page answer a question a person would plausibly ask aloud?
- [ ] Is the primary intent clear within the first 200 words?

Lane 2 grade drops to C or below if: the page has no clear primary reader, if
the intent conflicts with the title, or if the first screen answers a different
question than the URL implies.

---

### Lane 3: Metadata

**Goal:** every metadata field is populated, within safe limits, and tuned for
click-through from search results and social previews.

Checklist:

**Title tag**
- [ ] Under 60 characters (Google truncates above ~580px width)
- [ ] Primary keyword or entity name in first three words
- [ ] Brand suffix separated by ` | ` or ` — ` (not an em dash in tag value)
- [ ] Does not duplicate the H1 word-for-word (slight variation improves CTR)
- [ ] Does not start with "Welcome to" or the domain name

**Meta description**
- [ ] Under 160 characters
- [ ] Contains the primary outcome or action, not a feature list
- [ ] Ends with a reason to click (question, imperative, or benefit)
- [ ] Does not duplicate the title
- [ ] Does not contain structured data markup or JSON

**Open Graph**
- [ ] og:title — set, under 88 characters
- [ ] og:description — set, under 200 characters
- [ ] og:image — set, image is 1200x630px minimum, no text near edges
- [ ] og:url — matches canonical URL
- [ ] og:type — set to `website`, `article`, or appropriate type

**Twitter/X card**
- [ ] twitter:card — `summary_large_image` for pages with a hero image
- [ ] twitter:title and twitter:description — set and distinct from OG when
      appropriate
- [ ] twitter:image — set and accessible without authentication

**Other**
- [ ] Image alt text on all visible images (not empty, not "image", not
      filename)
- [ ] Author or publisher entity name appears in metadata or schema (not just
      visible copy)
- [ ] Durable entity names (product name, company name, skill name) appear in
      title, description, and H1 — at least one each

Lane 3 grade drops to D or below if: title is over 70 characters and truncates
the entity name, meta description is missing, og:image is missing, or any entity
name is absent from all three (title + description + H1).

---

### Lane 4: Structure

**Goal:** the page's heading hierarchy, section order, internal link network,
and FAQ placement serve both human readers and AI citation engines.

Checklist:

**Headings**
- [ ] Exactly one H1, matching the title intent (not necessarily identical text)
- [ ] H2s cover the primary sub-topics a searcher would expect
- [ ] H3s are optional but used consistently if present
- [ ] No heading is a sentence longer than 12 words
- [ ] No heading is a generic label like "Introduction" or "Overview"

**Section order**
- [ ] Hero: what it is and who it is for
- [ ] Proof: links, artifacts, commands, or evidence
- [ ] How: numbered or bulleted steps with verbs and results
- [ ] FAQ: direct answers for the most common objections and queries
- [ ] CTA: the action, with no competing secondary action in the same viewport

**Links**
- [ ] Internal links use descriptive anchor text (not "click here" or "read more")
- [ ] Internal links connect this page to at least two related pages on the same
      site
- [ ] No internal links are broken (verify with fetch or curl)
- [ ] External links go to authoritative sources when making factual claims
- [ ] No external links open in the same tab when the page has a primary CTA
      that would compete

**FAQ**
- [ ] FAQ section present if the page makes a product or service claim
- [ ] Each FAQ item is a real question a user or searcher would ask
- [ ] Each FAQ answer is self-contained — the answer makes sense without reading
      the question
- [ ] FAQ answers are under 100 words each (AI citation sweet spot)

Lane 4 grade drops to C or below if: H1 is missing, section order puts the FAQ
or proof below the fold without any in-page anchor, or internal links use
non-descriptive anchor text throughout.

---

### Lane 5: Schema Markup

**Goal:** every JSON-LD block is valid, typed correctly for the page, and
matches visible content.

Checklist:

- [ ] At least one `<script type="application/ld+json">` block present
- [ ] Schema validates at schema.org/validator (or equivalent) with no errors
- [ ] Schema type matches the page purpose:
  - FAQ page or page with Q&A section → `FAQPage`
  - Blog post or article → `Article` or `BlogPosting`
  - Product or app page → `SoftwareApplication` or `Product`
  - Docs or reference page → `TechArticle` or `WebPage`
  - Organization root page → `Organization`
  - Breadcrumb present for deep pages → `BreadcrumbList`
- [ ] FAQ schema items match the visible FAQ text exactly (no hallucinated Q&A)
- [ ] `Organization` schema includes: `name`, `url`, `logo`, `sameAs` (GitHub,
      LinkedIn, App Store, or other authoritative profiles)
- [ ] `SoftwareApplication` schema includes: `name`, `applicationCategory`,
      `operatingSystem`, `offers` (even if free — use `price: "0"`)
- [ ] `Article` schema includes: `headline`, `author`, `datePublished`,
      `dateModified`

When schema is missing or broken, provide the exact corrected JSON-LD block
inline in the findings — do not describe it in prose.

Example minimum Organization block:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Suede",
  "url": "https://suedeai.ai",
  "logo": "https://suedeai.ai/logo.png",
  "sameAs": [
    "https://github.com/Suede-AI",
    "https://www.linkedin.com/company/suedeai"
  ]
}
```

Lane 5 grade drops to D or below if: no schema is present on a page making
factual product claims, or if FAQ schema items do not match visible text.

---

**Schema Generator Mode**

When schema is missing or broken, generate the complete, valid JSON-LD rather
than just recommending it. Required inputs: page type, page title, primary
content, URL.

Templates to generate on request:

FAQ schema (when a FAQ section is present):

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text"
      }
    }
  ]
}
```

SoftwareApplication (for apps and tools):

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "App name",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
  "description": "...",
  "url": "..."
}
```

Organization:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "...",
  "url": "...",
  "logo": "...",
  "sameAs": ["...social URLs..."]
}
```

Validate generated schema at schema.org/validator before including in output.

---

### Lane 6: AI EO (Answer Engine Optimization)

**Goal:** the page is structured so that LLMs, answer engines, and AI overviews
can extract, quote, and cite it accurately without inventing facts.

Checklist:

**Summary and definitions**
- [ ] First 200 words contain a clear, citable answer to the page's primary
      question — the answer can stand alone without surrounding context
- [ ] The product, skill, or service is defined plainly in the first section,
      not assumed
- [ ] No jargon is used without an inline definition on first use
- [ ] Definitions are written as `[Term] is [concise definition].` not buried in
      nested clauses

**FAQ and citation targets**
- [ ] FAQ answers are in plain prose, not bullet trees (AI cites prose better)
- [ ] Each FAQ answer names the subject explicitly (not "it" or "this")
- [ ] At least one FAQ directly addresses the primary query from Lane 2

**Entity signals**
- [ ] Company/product name appears in: H1, first paragraph, at least one H2,
      and schema `name` field
- [ ] `sameAs` links in schema point to at least one external authoritative
      profile (GitHub, LinkedIn, App Store, Wikipedia if applicable)
- [ ] URL structure reflects the entity and topic (not `/p/1234` or `/post`)

**AI-accessible content**
- [ ] `llms.txt` or `ai.txt` consideration: if site has 10+ pages, note whether
      an `llms.txt` is present or warranted (not required, but increases AI
      crawl signal)
- [ ] Primary content is not behind JavaScript hydration with no SSR fallback
- [ ] Primary content is not paywalled or auth-gated (AI cannot cite what it
      cannot read)
- [ ] Citation-friendly headings use noun phrases, not questions alone (e.g.,
      "How Suede Routes Royalties" is more citable than "How does it work?")

**Hallucination risk**
- [ ] Page does not make vague claims an LLM could cite incorrectly (e.g.,
      "used by thousands" without evidence — state the real proof or remove it)
- [ ] No stat, partner name, or pricing claim is present without a verification
      source

Lane 6 grade drops to C or below if: the primary answer is not in the first 200
words, FAQ answers use "it" as the subject, or primary content is
JavaScript-only.

---

### Lane 7: Copy and Conversion Quality

**Goal:** copy earns action. Every sentence either moves the reader toward the
primary CTA or proves the claim that does.

Checklist:

**Directness**
- [ ] First sentence names the outcome, not the feature (outcome: "Register a
      music release with rights and provenance"; feature: "A platform for music
      metadata")
- [ ] No throat-clearing openers ("Welcome to", "In today's digital landscape")
- [ ] Active voice with a named actor in each key sentence
- [ ] Subhead adds proof, audience, or workflow — not a restatement of the hero

**Proof**
- [ ] At least one real artifact: link, command, screenshot reference, file
      name, live URL, or example
- [ ] No invented stats, testimonials, partner names, pricing, or availability
      claims
- [ ] Proof appears before the CTA, not after

**Claims**
- [ ] Every superlative ("only", "best", "first") is either verifiable or
      removed
- [ ] Legal, payment, privacy, or regulatory claims are accurate and sourced
- [ ] Product capabilities described match what is currently shipped and live

**CTA**
- [ ] One primary CTA is visible above the fold
- [ ] CTA text is an action + object ("Install the skill", not "Get started")
- [ ] No two competing CTAs in the same viewport
- [ ] Secondary CTA is visually subordinate to primary

**Trust**
- [ ] If testimonials are present, they are real and attributable
- [ ] If testimonials are absent, copy does not imply them
- [ ] Brand vocabulary matches the actual product (no generic AI-music-app
      language when the product does rights infrastructure)

**Filler removal**
- [ ] No filler transitions ("Additionally", "Furthermore", "It is worth noting")
- [ ] No exclamation points in body copy
- [ ] No em dashes in public copy (use a comma, period, or recast the sentence)
- [ ] No adverb softeners ("simply", "just", "easily", "seamlessly")

Lane 7 grade drops to C or below if: the primary CTA is absent above the fold,
any public claim is unverifiable, or the copy could belong to any competing
product without changing a word.

---

### Lane 8: E-E-A-T Signals

**Goal:** confirm that Google's quality evaluator signals — Experience,
Expertise, Authoritativeness, and Trustworthiness — are present and verifiable
on the page.

**Experience**: Does the page show first-hand, real-world use of the product or
topic? Look for: demos, screenshots of real output, case studies with specific
results, personal or company proof.

**Expertise**: Does the content demonstrate deep, accurate knowledge? Look for:
technical depth, correct use of domain vocabulary, specific examples over
generic claims, citations to primary sources.

**Authoritativeness**: Is this site or page recognized as a source in the
space? Look for: backlinks from authoritative sites (note if checkable),
mentions in industry press, author credentials visible, organization About page.

**Trustworthiness**: Can users trust this content and site? Look for: HTTPS,
privacy policy, clear contact and company info, accurate and verifiable claims,
no misleading UI patterns, consistent authorship.

Checklist:

- [ ] First-person or company-specific proof present (E — Experience)
- [ ] Accurate technical claims with no puffery (E — Expertise)
- [ ] Author name and credentials visible when relevant (A — Authoritativeness)
- [ ] Privacy policy, contact page, and HTTPS present (T — Trustworthiness)
- [ ] No misleading UI patterns or dark patterns (T — Trustworthiness)
- [ ] Claims are verifiable and sourced (T — Trustworthiness)

Grade: A (all four strong), B (3 strong), C (2 strong), D/F (1 or 0).

Lane 8 grade drops to C or below if: no real proof of experience or expertise
is visible, contact or privacy information is absent, or misleading UI patterns
are present.

---

### Lane 9: Topic Cluster Architecture

**Goal:** for sites with multiple pages, confirm the content is organized into
pillar and cluster pages with complete internal linking. Skip for single-page
audits and note the skip.

**Pillar page**: one comprehensive, authoritative page on the core topic. Should
rank for broad head terms.

**Cluster pages**: specific, narrow pages that support the pillar by covering
sub-topics in depth. Each links back to the pillar.

Audit questions:

1. Does a clear pillar page exist for the site's primary topic?
2. Do cluster pages exist for each major sub-topic?
3. Does each cluster page link to the pillar?
4. Does the pillar page link to each cluster?
5. Are there orphan pages (no internal links in or out)?
6. Are there keyword cannibalization risks (two pages competing for the same
   query)?

Output a simple map:

```
Pillar: [page] — [target keyword]
  Cluster: [page] — [sub-topic keyword]
  Cluster: [page] — [sub-topic keyword]
Orphan pages: [list or "none found"]
Cannibalization risks: [list or "none found"]
```

Lane 9 grade drops to C or below if: no pillar page exists, cluster pages do
not link back to the pillar, or two or more pages compete for the same primary
keyword.

---

## 3. Finding Format

Report every finding in this block. Do not describe findings in prose.

```
[HIGH|MEDIUM|LOW] Finding title
Location: <URL, selector, or file + line>
Issue: <what is wrong and why it matters>
Fix: <exact corrective action>
Suggested copy or code: <literal rewrite, JSON-LD block, or command>
Verification: <how to confirm the fix worked>
```

Severity guide:
- HIGH: blocks indexing, breaks CTA, contains false public claim, schema invalid
- MEDIUM: hurts CTR, weakens AI citation, missing recommended signal
- LOW: copy quality, filler, minor structural improvement

---

## 4. Scoring

Grade each lane A-F:

| Grade | Meaning |
|-------|---------|
| A | Fully implemented, no significant gaps |
| B | Mostly implemented, one or two medium findings |
| C | Partially implemented, one or more high findings |
| D | Significant gaps, multiple high findings |
| F | Lane is absent or actively harmful |

Hard caps:
- Cannot earn A overall without verifying a live URL
- Cannot earn A if primary CTA is broken or absent
- Cannot earn A if any public claim is false, unverifiable, or invented
- Cannot earn A in Lane 5 if schema does not validate
- Cannot earn A in Lane 6 if primary content is paywalled or JavaScript-only
- Cannot earn A in Lane 8 if contact, privacy policy, or HTTPS is absent
- Cannot earn A in Lane 9 if two or more pages compete for the same primary keyword

Overall grade is the weighted average with Lane 1, 3, and 6 weighted 1.5x.
Lane 8 and Lane 9 are weighted 1x. Lane 0 is informational and not included
in the grade calculation.

---

## 5. Output Template

Produce this block at the end of every full audit. Fill every field. Write
"none found" or "not applicable" rather than leaving a field blank.

```
=== SEO AUDIT REPORT ===

Audited URL:
Audit date:
Source checked: [live URL | source file | both]

--- KEYWORD BRIEF (Lane 0 — omit if not requested) ---
Primary: [keyword] — [intent: info/nav/commercial/transactional]
Secondary: [k1], [k2], [k3]
LSI terms: [list]
Competitor gap queries: [list]
SERP feature targets: [list]

--- METADATA ---
SEO title (suggested):
Meta description (suggested):
H1 (suggested):
Subhead (suggested):

--- CONVERSION ---
Primary CTA (text and destination):
Secondary CTA (text and destination):

--- CONTENT ADDITIONS ---
FAQ additions:
  Q:
  A:
Internal links to add (anchor text → destination URL):
External links to add (anchor text → destination URL):

--- SCHEMA ---
Schema changes:
  [Paste corrected or new JSON-LD block here]

--- AI EO NOTES ---
AI-ready summary (first 200 words target):
llms.txt warranted: [yes | no | already present]
Hallucination risk flags:

--- E-E-A-T NOTES ---
Experience proof present:
Expertise signals:
Authoritativeness signals:
Trustworthiness gaps:

--- TOPIC CLUSTER MAP (omit for single-page audits) ---
Pillar: [page] — [target keyword]
  Cluster: [page] — [sub-topic keyword]
Orphan pages:
Cannibalization risks:

--- SCORES ---
Copy score: /70
  Directness: /10
  Rhythm: /10
  Trust: /10
  Specificity: /10
  Authenticity: /10
  Density: /10
  Search/AI readability: /10

Lane grades:
  Lane 1 — Technical Access:
  Lane 2 — Search and Answer Intent:
  Lane 3 — Metadata:
  Lane 4 — Structure:
  Lane 5 — Schema Markup:
  Lane 6 — AI EO:
  Lane 7 — Copy and Conversion Quality:
  Lane 8 — E-E-A-T Signals:
  Lane 9 — Topic Cluster Architecture:

Overall grade:

--- CLAIM BOUNDARIES ---
Safe to publish:
Do not publish until verified:
Remove entirely:

--- VERIFICATION CHECKLIST ---
[ ] Status code confirmed 200
[ ] Canonical URL confirmed
[ ] robots.txt allows path
[ ] Schema validates at schema.org/validator
[ ] All internal links return 200
[ ] Primary CTA destination loads correctly
[ ] og:image loads at full resolution
[ ] JSON-LD blocks contain no fabricated content

--- SHIP GATE ---
ship | ship-with-caveats | hold

Reason:
```

---

## 6. Company Override

This skill works for any company, product, or site — not only Suede. When
auditing a non-Suede surface, apply all seven lanes to the target company's
pages without Suede-specific vocabulary or brand requirements.

When a company brief is provided, read it before auditing and use:
- the company's actual entity names, not generic placeholders
- the company's stated product capabilities, not assumptions
- the company's approved claims, not surmised ones

If no brief is provided, derive entity names and capabilities from the live page
and note what could not be verified from available sources.

---

## 7. Workflow Steps

Follow these steps in order. Do not skip to findings before completing steps 1
through 3.

1. **Read the target.** Fetch the live URL or open the source file. If both
   are available, check both and note any divergence between source and rendered
   output.

2. **Run the Source Truth checks** from Section 1. Record every field exactly as
   found. Do not paraphrase tag values.

3. **Check robots.txt and sitemap.** Fetch `<domain>/robots.txt` and any
   listed sitemap. Confirm the target URL is not blocked and is listed.

4. **Scan all active lanes.** Lane 0 activates only when keyword discovery is
   requested. Lanes 1–9 run on every audit (Lane 9 is N/A for single-page
   audits — note the skip). Work through each checklist item. Mark each item
   pass, fail, or N/A. Note the location of each failure.

5. **Write ranked findings.** Use the finding format from Section 3. Group by
   lane. Put HIGH findings first within each lane.

6. **Write exact rewrites.** For every HIGH and MEDIUM finding involving copy,
   metadata, or schema: provide the literal replacement text or JSON-LD block.
   Do not describe what the fix should say — write it.

7. **Fill the output template** from Section 5. Every field must be filled.

8. **Score each lane** A-F using the criteria from Section 4. Apply hard caps.

9. **Set the ship gate.** `ship` only if no HIGH findings remain and all hard
   caps are met. `ship-with-caveats` if only MEDIUM or LOW findings remain and
   no claim is false. `hold` if any HIGH finding is unresolved, any claim is
   false, or the CTA destination is broken.

10. **State what was not checked.** List any lane items that could not be
    verified and why (e.g., "Core Web Vitals data not available without field
    data access", "sitemap not publicly accessible").

---

## 8. Boundaries

This skill does not:

- Invent traffic estimates, keyword search volume, ranking positions, or
  conversion rates
- Fabricate AI citation frequency or LLM mention counts
- Estimate ROI from SEO changes
- Claim a fix will produce a specific ranking outcome
- Mark an audit complete without inspecting current page source or live URL
- Report schema as valid without running it through a validator
- Include any partner name, stat, or pricing claim not present on the target
  page itself

When a data point is not available, say so. Do not estimate or interpolate.
Name what was checked, what was skipped, and what would require additional
tooling or access to verify.
