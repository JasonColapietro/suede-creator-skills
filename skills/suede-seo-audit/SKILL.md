---
name: suede-seo-audit
description: "Nine-lane SEO, AEO, and AI EO audit for any public page — technical access, search and answer intent, metadata, structure, schema, AI citation readiness, copy quality, E-E-A-T, and topic clusters — with exact rewrites, lane grades, and a ship gate. Use when asked to audit SEO, find out why a page is not ranking or not cited by AI answers, validate schema or metadata, run keyword or competitor gap research, or check discoverability before a launch. NOT FOR: a fast A-F promotion-readiness verdict (use suede-visibility-grader), conversion and CRO rewrites (use suede-site-alchemy), or writing fresh copy (use suede-copy)."
---

# Suede SEO Audit

This skill goes deeper than an inline copy audit. It inspects live page source,
validates schema, traces crawl access, checks AI EO signals, and produces exact
rewrites with a lane-by-lane grade. Use suede-copy for writing new copy. Use
this skill when the audit itself is the deliverable.

**Core principle:** never audit from memory. Every finding cites what was
actually fetched, and every fix is written out literally, not described.

---

## 1. Source Truth

Do not audit from memory. Before writing a single finding, verify the live
surface.

### Required pre-audit checks

- HTTP status code (200, 301, 404, 503): note exact code
- Final URL after all redirects (is the canonical URL the destination?)
- `robots.txt`: is the path allowed? Is `Disallow: /` blocking indexers?
- `<meta name="robots">` or `<meta name="googlebot">`: noindex? nofollow?
- `<link rel="canonical">`: does it match the intended URL exactly?
- Sitemap entry: is the URL present in any listed sitemap?
- `<title>` tag: exact text, character count
- `<meta name="description">`: exact text, character count
- Open Graph tags: og:title, og:description, og:image, og:url, og:type
- Twitter card tags: twitter:card, twitter:title, twitter:description,
  twitter:image
- JSON-LD presence: any `<script type="application/ld+json">` block present?
- Primary H1: exact text, position in document

If the URL is inaccessible, note that and audit from source files with caveats.
If the page is behind auth or a paywall, say so and limit the audit to what is
accessible.

---

## 2. Audit Lanes

Run all lanes. Score each A-F at the end. State explicitly when a check was
skipped and why. The detailed per-lane checklists live in this skill's
`references/` folder — read the relevant file when you run the lane:

| Lanes | Checklist file |
|---|---|
| Lane 0 (keyword research, optional) | `references/keyword-research.md` |
| Lanes 1–4, 6–9 | `references/lane-checklists.md` |
| Lane 5 (schema) | `references/schema-templates.md` |

### Lane 0: Keyword Research (optional mode)

Activate when keyword discovery is requested; skip for technical-only or
copy-only audits. When active, read `references/keyword-research.md` for the
full protocol: primary/secondary/LSI keyword classification, competitor
content gap, SERP feature targets, and the content brief.

Lane 0 is informational only. It produces a keyword brief and content brief,
not a grade. Incorporate the brief into Lanes 2–7 findings where relevant.

### Lane 1: Technical Access

**Goal:** confirm that crawlers, indexers, and AI scrapers can reach, parse,
and attribute the page. Run the Lane 1 checklist in
`references/lane-checklists.md`: status, redirects, canonical, robots, sitemap,
JS-free rendering, and the Core Web Vitals measurement protocol. Measure CWV
when tooling allows (PageSpeed Insights at pagespeed.web.dev; `curl` time is a
server-response proxy only); otherwise report each vital as "not measurable"
with the reason plus observed risk factors. Do not invent scores; do report
observable risks. CWV never enters the A-F grade.

Lane 1 grade drops to C or below if: any indexability block is present, if the
canonical is wrong, or if the page is JavaScript-only with no SSR/SSG fallback.

### Lane 2: Search and Answer Intent

**Goal:** confirm the page has a single coherent intent that matches real
queries and can earn a featured snippet or AI citation. Run the Lane 2
checklist in `references/lane-checklists.md`: primary reader, primary query
theme, the AI-answer-ready definition, one earned action, and cannibalization.
If the AI-answer-ready definition cannot be constructed from the first 200
words of the page, that is a HIGH finding.

Lane 2 grade drops to C or below if: the page has no clear primary reader, if
the intent conflicts with the title, or if the first screen answers a different
question than the URL implies.

### Lane 3: Metadata

**Goal:** every metadata field is populated, within safe limits, and tuned for
click-through from search results and social previews. Run the Lane 3 checklist
in `references/lane-checklists.md`: title tag, meta description, Open Graph,
Twitter/X card, alt text, author entity, and durable entity names.

Lane 3 grade drops to D or below if: title is over 70 characters and truncates
the entity name, meta description is missing, og:image is missing, or any entity
name is absent from all three (title + description + H1).

### Lane 4: Structure

**Goal:** the page's heading hierarchy, section order, internal link network,
and FAQ placement serve both human readers and AI citation engines. Run the
Lane 4 checklist in `references/lane-checklists.md`: headings, section order
(hero → proof → how → FAQ → CTA), links, FAQ quality, and keyword density
(including the density check output format).

Lane 4 grade drops to C or below if: H1 is missing, section order puts the FAQ
or proof below the fold without any in-page anchor, or internal links use
non-descriptive anchor text throughout. Lane 4 drops an additional letter grade
if primary keyword density is 0 in the body or any secondary keyword is
completely absent from the page.

### Lane 5: Schema Markup

**Goal:** every JSON-LD block is valid, typed correctly for the page, and
matches visible content. Run the Lane 5 checklist in
`references/schema-templates.md`, which also holds the page-type → `@type`
mapping and minimum JSON-LD templates (Organization, SoftwareApplication,
FAQPage, Article).

When schema is missing or broken, provide the exact corrected JSON-LD block
inline in the findings. Do not describe it in prose.

Lane 5 grade drops to D or below if: no schema is present on a page making
factual product claims, or if FAQ schema items do not match visible text.

### Lane 6: AI EO (Answer Engine Optimization)

**Goal:** the page is structured so that LLMs, answer engines, and AI overviews
can extract, quote, and cite it accurately without inventing facts. Run the
Lane 6 checklist in `references/lane-checklists.md`: citable first-200-words
answer, plain definitions, prose FAQ answers with explicit subjects, entity
signals (`sameAs`, name placement), `llms.txt` consideration, AI-accessible
content, and hallucination-risk claims.

Lane 6 grade drops to C or below if: the primary answer is not in the first 200
words, FAQ answers use "it" as the subject, or primary content is
JavaScript-only.

### Lane 7: Copy and Conversion Quality

**Goal:** copy earns action. Every sentence either moves the reader toward the
primary CTA or proves the claim that does. Run the Lane 7 checklist in
`references/lane-checklists.md`: directness, proof, claims, CTA, trust, and
filler removal.

Lane 7 grade drops to C or below if: the primary CTA is absent above the fold,
any public claim is unverifiable, or the copy could belong to any competing
product without changing a word.

### Lane 8: E-E-A-T Signals

**Goal:** confirm that Experience, Expertise, Authoritativeness, and
Trustworthiness signals are present and verifiable on the page. Run the Lane 8
checklist in `references/lane-checklists.md` for what counts as evidence for
each of the four signals.

Grade: A (all four strong), B (3 strong), C (2 strong), D/F (1 or 0).

Lane 8 grade drops to C or below if: no real proof of experience or expertise
is visible, contact or privacy information is absent, or misleading UI patterns
are present.

### Lane 9: Topic Cluster Architecture

**Goal:** for sites with multiple pages, confirm the content is organized into
pillar and cluster pages with complete internal linking. Skip for single-page
audits and note the skip. Run the Lane 9 audit questions and cluster-map
output format in `references/lane-checklists.md`.

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

Grade each lane A-F. Grades are mechanical — derived from finding counts, not
impression:

| Grade | Rule |
|-------|------|
| A | No HIGH or MEDIUM findings in the lane |
| B | No HIGH findings; one or two MEDIUM findings |
| C | Exactly one HIGH finding, or three or more MEDIUM findings |
| D | Two or three HIGH findings |
| F | Four or more HIGH findings, or the lane is absent or actively harmful |

Hard caps:
- Cannot earn A overall without verifying a live URL
- Cannot earn A if primary CTA is broken or absent
- Cannot earn A if any public claim is false, unverifiable, or invented
- Cannot earn A in Lane 5 if schema does not validate
- Cannot earn A in Lane 6 if primary content is paywalled or JavaScript-only
- Cannot earn A in Lane 8 if contact, privacy policy, or HTTPS is absent
- Cannot earn A in Lane 9 if two or more pages compete for the same primary keyword

Overall grade: convert letter grades to points (A=4, B=3, C=2, D=1, F=0).
Lanes 1, 3, and 6 count 1.5x. Lanes 2, 4, 5, 7, 8, 9 count 1x. Lane 0
excluded. Max weighted score = (3 × 1.5 + 6 × 1) × 4 = 42. Overall letter:
≥38 = A, ≥30 = B, ≥22 = C, ≥14 = D, <14 = F.

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
Primary: [keyword] — [intent: info/nav/commercial/transactional] — [volume: low <1K/mo | medium 1K–10K | high >10K/mo] — [difficulty: low | medium | high]
Secondary: [k1 — intent — volume], [k2 — intent — volume], [k3 — intent — volume]
LSI terms: [list — grouped by subtopic]
Competitor gap queries: [query — competitor URL that ranks — content angle missing from target page]
SERP feature targets: [feature — eligibility reason]
Content brief: primary keyword appears in H1 + first 100 words + [N] times per 1,000 words; secondary keywords appear [1–2] times each

--- METADATA ---
SEO title (suggested):
Meta description (suggested):
H1 (suggested):
Subhead (suggested):

--- CONVERSION ---
Primary CTA (text and destination):
Secondary CTA (text and destination):

--- CONTENT ADDITIONS ---
Content brief (from Lane 0 — omit if not requested):
  Target word count: [N] words (based on [intent] + SERP competition)
  Required H2 sections: [list — derived from PAA and competitor H2 structure]
  NLP term density check:
    Primary "[keyword]": appears in H1 [yes/no], first 100 words [yes/no], [N] times per 1,000 words (target: 2–4)
    Secondary "[keyword]": [N] times per 1,000 words (target: 1–2 each)
FAQ additions:
  Q: [real searcher question — match PAA wording]
  A: [≤100 words, subject named explicitly, no pronouns as subject]
Internal links to add (anchor text → destination URL):
External links to add (anchor text → destination URL):
Competitor content gap:
  Competitor: [URL or "derived from niche"]
  Missing sections: [H2 text — target query — priority: CRITICAL|IMPORTANT|INFORMATIONAL]

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

--- CORE WEB VITALS (never part of the A-F grade) ---
LCP: [score or "not measurable" — reason]
CLS: [score or "not measurable" — reason]
INP: [score or "not measurable" — reason]
Lighthouse score (if available): Performance [N] | Accessibility [N] | Best Practices [N] | SEO [N]
CWV Risk: low / medium / high
CWV risk factors observed: [list or "none"]
Note: scores come only from PageSpeed Insights or Lighthouse. Do not invent scores; do report observable risks. curl time_total is a server-response proxy, not a CWV score.

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
  Lane 1 (Technical Access):
  Lane 2 (Search and Answer Intent):
  Lane 3 (Metadata):
  Lane 4 (Structure):
  Lane 5 (Schema Markup):
  Lane 6 (AI EO):
  Lane 7 (Copy and Conversion Quality):
  Lane 8 (E-E-A-T Signals):
  Lane 9 (Topic Cluster Architecture):

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

## 6. Workflow Steps

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
   audits; note the skip). Read the lane's checklist file from `references/`
   and work through each item. Mark each item pass, fail, or N/A. Note the
   location of each failure.

5. **Write ranked findings.** Use the finding format from Section 3. Group by
   lane. Put HIGH findings first within each lane.

6. **Write exact rewrites.** For every HIGH and MEDIUM finding involving copy,
   metadata, or schema: provide the literal replacement text or JSON-LD block.
   Do not describe what the fix should say. Write it.

7. **Fill the output template** from Section 5. Every field must be filled.

8. **Score each lane** A-F using the rules from Section 4. Apply hard caps.

9. **Set the ship gate.** `ship` only if no HIGH findings remain and all hard
   caps are met. `ship-with-caveats` if only MEDIUM or LOW findings remain and
   no claim is false. `hold` if any HIGH finding is unresolved, any claim is
   false, or the CTA destination is broken. Name any lane items that could not
   be verified and why (e.g., "Core Web Vitals: no field data access",
   "sitemap not publicly accessible").

---

## Red Flags — Stop

If you catch yourself thinking any of these, stop and run the check for real:

- "I know this page; I can grade it from memory." — Fetch it. Source Truth first.
- "curl was fast, that covers Core Web Vitals." — curl is a server-response proxy; CWV scores come only from PageSpeed Insights or Lighthouse, or they are "not measurable" with a reason.
- "I'll describe the schema fix; they can write the JSON." — Write the literal JSON-LD block.
- "The meta description is close enough to the limit." — Count the characters. Report the exact number.
- "A traffic estimate will make this finding land harder." — Never invent traffic, rankings, or ROI.
- "The lane mostly passes; I'll skip the rest of the checklist." — Every item gets pass, fail, or N/A.

---

## 7. Boundaries

Do not invent traffic estimates, ranking positions, citation frequency, or ROI
from SEO changes. Name what was checked, what was skipped, and what requires
additional tooling.

---

## Routing

- Need a fast A-F promotion-readiness verdict instead of a full audit → `suede-visibility-grader`.
- Findings point at conversion problems (CTA, friction, offer) → `suede-site-alchemy` for the rewrite pass.
- Findings require fresh copy, not fixes → `suede-copy`.
- Audit passed and the page is part of a release → `suede-launch-packaging` to package the launch.
