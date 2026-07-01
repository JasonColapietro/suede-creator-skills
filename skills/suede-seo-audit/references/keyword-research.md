# Lane 0: Keyword Research Protocol

Full protocol for the optional keyword-research lane of suede-seo-audit.
Read this only when Lane 0 is active (keyword discovery was requested).
Lane 0 produces a brief, not a grade.

**Goal:** produce a keyword brief and content brief the page can be built or
optimized around.

## Protocol

1. **Primary keyword**: one phrase the page should be #1 for. Match search
   intent precisely. Classify as informational, navigational, commercial, or
   transactional. Classify volume by inference from query specificity and topic
   breadth: head terms like "music distribution" are high (>10K/mo); long-tail
   phrases like "how to register a song copyright with SoundExchange" are low
   (<1K/mo). Classify difficulty by competition density: head terms with
   Wikipedia/major-brand dominance are high; niche product terms are low.
   Agents must classify both. Do not skip.

2. **Secondary keywords**: 3–5 phrases the page should rank on page 1 for.
   Related but not synonymous with the primary keyword.

3. **LSI / supporting terms**: 5–10 phrases, entities, and related concepts
   that should appear naturally in the content. Group by subtopic.

4. **Competitor content gap**: when a competitor URL is provided or can be
   inferred from the niche, fetch the page and compare H2/H3 structure. For
   each competitor:

   a. List the H2/H3 headings the competitor covers that the target page does not.
   b. Identify the queries those sections are likely targeting.
   c. Classify each gap as: CRITICAL (directly on primary keyword intent),
      IMPORTANT (secondary keyword), or INFORMATIONAL (supporting LSI term).

   Output:
   ```
   Competitor: [URL]
   Gap topic: [H2/H3 text from competitor] — [query it targets] — [CRITICAL|IMPORTANT|INFORMATIONAL]
   Missing section recommended: [exact H2 to add] — [brief rationale]
   ```

   If no competitor URL is provided and none is inferable, name 2–3 queries
   competitor pages likely rank for that the target page does not address,
   derived from the keyword set and topic structure.

5. **SERP feature opportunities**: which SERP features is the target eligible
   for? Options: Featured snippet, People Also Ask, Image pack, Video carousel,
   Knowledge panel, Local pack, Site links. For each feature named, state the
   eligibility reason.

## Content brief

Generate when Lane 0 is active and a page is being built or significantly
revised:

| Field | Guidance |
|---|---|
| Target word count | Informational: 1,200–2,500 words. Commercial: 800–1,500 words. Transactional: 400–800 words. Match top 3 SERP competitors if estimable from URL structure. |
| Required H2 sections | Pull from People Also Ask for the primary keyword + competitor H2/H3 structure. List every sub-topic the page must cover to match SERP depth. |
| Schema type | State the exact `@type` value required (see references/schema-templates.md). |
| Internal links to include | Name anchor text + destination for at least 2 existing site pages the new content must link to. |
| External links to include | Name 1–3 authoritative sources (Wikipedia, official docs, standards body, peer-reviewed source) relevant to the primary keyword. |
| NLP term density targets | Primary: in H1, in first 100 words, 2–4 additional times per 1,000 words. Each secondary keyword: 1–2 times per 1,000 words. Flag if current content misses these targets. |

## Keyword brief output

Output the keyword brief in this format (output the content brief inline
before this block when generated):

```
Primary: [keyword] — [intent: info/nav/commercial/transactional] — [volume: low <1K/mo | medium 1K–10K | high >10K/mo] — [difficulty: low | medium | high]
Secondary: [k1 — intent — volume], [k2 — intent — volume], [k3 — intent — volume]
LSI terms: [list — grouped by subtopic]
Competitor gap queries: [query — competitor URL that ranks — content angle missing from target page]
SERP feature targets: [feature — eligibility reason]
Content brief: primary keyword appears in H1 + first 100 words + [N] times per 1,000 words; secondary keywords appear [1–2] times each
```

Incorporate the brief into Lanes 2–7 findings where relevant.
