# Lane Checklists

Detailed checklists for suede-seo-audit Lanes 1–4 and 6–9. Read the checklist
for each lane as you run it. Lane 5 (Schema Markup) lives in
references/schema-templates.md. Grade-drop rules and scoring live in SKILL.md.

---

## Lane 1: Technical Access

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
- [ ] Core Web Vitals measurement protocol (see below — never enters the A-F
      grade)

### Core Web Vitals (measure when possible — never part of the A-F grade)

Measurement protocol:

- [ ] Run `curl -o /dev/null -s -w "%{time_total}" <URL>` as a proxy for server
      response time. curl measures server response, not browser rendering — on
      its own it is never a CWV score.
- [ ] If PageSpeed Insights is accessible at pagespeed.web.dev, fetch it.
      Report LCP, CLS, INP against these thresholds:
      LCP ≤ 2.5s = Good, 2.5–4s = Needs Improvement, >4s = Poor.
      CLS ≤ 0.1 = Good, 0.1–0.25 = Needs Improvement, >0.25 = Poor.
      INP ≤ 200ms = Good, 200–500ms = Needs Improvement, >500ms = Poor.
- [ ] If tooling is unavailable, report each vital as "not measurable" with the
      reason, and check these risk factors instead (report overall CWV risk as
      low/medium/high):
      - Render-blocking scripts above the fold (→ high LCP risk)
      - Unoptimized images: no `loading="lazy"`, no `width`/`height`
        attributes, no next-gen formats (→ high CLS/LCP risk)
      - Missing `font-display:swap` on web fonts (→ medium LCP risk)
      - Large JS bundles without code-splitting (→ high INP risk)
      - No preconnect for third-party origins (→ medium LCP risk)

Do not invent scores; do report observable risks. CWV never enters the lane's
A-F grade.

---

## Lane 2: Search and Answer Intent

- [ ] Name the primary reader in one phrase (e.g., "a creator who wants to
      register a music release")
- [ ] Name the primary query theme (what someone types or asks to land here)
- [ ] Write the AI-answer-ready definition: the sentence(s) an LLM would quote
      if asked about this page's subject. Format: "[Entity] is [what it does]
      for [who] by [how]. It [primary differentiator]." If this definition
      cannot be constructed from the first 200 words of the page, that is a
      HIGH finding.
- [ ] Name one action the page should earn (install, sign up, read docs, fork
      repo, contact)
- [ ] Check for keyword cannibalization: are there three or more other pages on
      the same site targeting the same primary term? If yes, flag which URL
      should be the canonical topic owner
- [ ] Does the page answer a question a person would plausibly ask aloud?
- [ ] Is the primary intent clear within the first 200 words?

---

## Lane 3: Metadata

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
- [ ] og:title: set, under 88 characters
- [ ] og:description: set, under 200 characters
- [ ] og:image: set, image is 1200x630px minimum, no text near edges
- [ ] og:url: matches canonical URL
- [ ] og:type: set to `website`, `article`, or appropriate type

**Twitter/X card**
- [ ] twitter:card: `summary_large_image` for pages with a hero image
- [ ] twitter:title and twitter:description: set and distinct from OG when
      appropriate
- [ ] twitter:image: set and accessible without authentication

**Other**
- [ ] Image alt text on all visible images (not empty, not "image", not
      filename)
- [ ] Author or publisher entity name appears in metadata or schema (not just
      visible copy)
- [ ] Durable entity names (product name, company name, skill name) appear in
      title, description, and H1; at least one each

---

## Lane 4: Structure

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
- [ ] Each FAQ answer is self-contained (the answer makes sense without reading
      the question)
- [ ] FAQ answers are under 100 words each (AI citation sweet spot)

**Keyword density**
- [ ] Primary keyword appears in: H1 (required), first 100 words (required),
      title tag (required), meta description (recommended), and 2–4 additional
      times per 1,000 words of body content
- [ ] Each secondary keyword appears 1–2 times per 1,000 words; not zero
      (invisible to search), not more than 3 (triggers keyword stuffing signals)
- [ ] Primary keyword is not crammed into headings unnaturally. Every H2
      containing the keyword must make grammatical and editorial sense without it
- [ ] LSI/supporting terms are distributed across the body, not clustered in
      one section

Density check output format:
```
Primary "[keyword]": H1 ✓/✗ | first 100 words ✓/✗ | body density [N per 1,000 words] (target: 2–4) | status: OK | THIN | OVER
Secondary "[keyword]": [N per 1,000 words] (target: 1–2) | status: OK | MISSING | OVER
```

---

## Lane 6: AI EO (Answer Engine Optimization)

**Summary and definitions**
- [ ] First 200 words contain a clear, citable answer to the page's primary
      question. The answer can stand alone without surrounding context.
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
      "used by thousands" without evidence. State the real proof or remove it.)
- [ ] No stat, partner name, or pricing claim is present without a verification
      source

---

## Lane 7: Copy and Conversion Quality

**Directness**
- [ ] First sentence names the outcome, not the feature (outcome: "Register a
      music release with rights and provenance"; feature: "A platform for music
      metadata")
- [ ] No throat-clearing openers ("Welcome to", "In today's digital landscape")
- [ ] Active voice with a named actor in each key sentence
- [ ] Subhead adds proof, audience, or workflow, not a restatement of the hero

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

**Filler removal**: the test — if a sentence can be deleted without the reader
losing information, delete it. Apply to transitions, throat-clearing, hedging,
adverb softeners, and exclamation marks.

Flag and remove:
- [ ] Filler transitions ("Additionally", "Furthermore", "It is worth noting")
- [ ] Exclamation points in body copy
- [ ] Em dashes in public copy (use a comma, period, or recast the sentence)
- [ ] Adverb softeners ("simply", "just", "easily", "seamlessly")

---

## Lane 8: E-E-A-T Signals

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

- [ ] First-person or company-specific proof present (E: Experience)
- [ ] Accurate technical claims with no puffery (E: Expertise)
- [ ] Author name and credentials visible when relevant (A: Authoritativeness)
- [ ] Privacy policy, contact page, and HTTPS present (T: Trustworthiness)
- [ ] No misleading UI patterns or dark patterns (T: Trustworthiness)
- [ ] Claims are verifiable and sourced (T: Trustworthiness)

---

## Lane 9: Topic Cluster Architecture

Skip for single-page audits and note the skip.

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
