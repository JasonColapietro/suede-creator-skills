# Lane Checklists

Detailed checklists for suede-seo-audit Lanes 1–4 and 6–9. Read the checklist
for each lane as you run it. Lane 5 (Schema Markup) lives in
references/schema-templates.md. Grade-drop rules and scoring live in SKILL.md.

---

## Lane 1: Technical Access

- [ ] HTTP status is 200 on the canonical URL
- [ ] Redirects reach the intended canonical without loops or avoidable chains;
      record every hop and its status rather than claiming a fixed equity loss
- [ ] Canonical URL is self-referencing and matches the intended URL
- [ ] Trailing slash is consistent across all internal links to this page
- [ ] www and non-www resolve to the same canonical (no duplicate indexing)
- [ ] http redirects to https (no mixed-content split)
- [ ] `robots.txt` permits the intended Google crawler. Record `*` and
      `Googlebot` rules separately. Check other named crawlers only when the
      audit asks for them; one crawler's rule does not represent another's.
- [ ] `<meta name="robots">` is absent or set to `index, follow`
- [ ] If the site publishes a sitemap, the canonical URL is represented where
      appropriate; `<lastmod>` is present only when it accurately reflects a
      significant page update. A sitemap is a discovery aid, not a guarantee.
- [ ] Compare raw HTML with the rendered DOM. If primary content depends on
      JavaScript, verify the rendered result with an appropriate browser and,
      when available, Google URL Inspection rather than failing it merely for
      using JavaScript.
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
      reason, and record implementation signals to investigate without turning
      them into invented CWV scores: render-blocking work, hero-resource
      priority, image dimensions/compression, font loading, main-thread work,
      long tasks, third-party code, and layout shifts. Do not lazy-load the LCP
      image by rote or prescribe `preconnect`, a format, or code splitting
      without a trace showing the bottleneck.

Do not invent scores; do report observable risks. CWV never enters the lane's
A-F grade.

---

## Lane 2: Search and Answer Intent

- [ ] Name the primary reader in one phrase (e.g., "a creator who wants to
      register a music release")
- [ ] Name the primary query theme (what someone types or asks to land here)
- [ ] Write a standalone definition from the opening section: "[Entity] is
      [what it does] for [who] by [how]." If the page cannot support one,
      report the ambiguity and reader impact. This is a Suede clarity
      diagnostic, not a Google ranking requirement.
- [ ] Name one action the page should earn (install, sign up, read docs, fork
      repo, contact)
- [ ] Check for keyword cannibalization: are there three or more other pages on
      the same site targeting the same primary term? If yes, flag which URL
      should be the canonical topic owner
- [ ] Does the page answer a question a person would plausibly ask aloud?
- [ ] Is the primary intent clear in the opening section without relying on a
      universal word-count cutoff?

---

## Lane 3: Metadata

**Title tag**
- [ ] Present, concise, descriptive, and specific to this page
- [ ] Primary subject or entity is identifiable without forced front-loading
- [ ] Brand naming and separators are accurate and consistent; no separator is
      treated as a ranking requirement
- [ ] Accurately matches the page and visible main heading
- [ ] Does not start with "Welcome to" or the domain name
- [ ] Character count recorded as a preview diagnostic only. Google has no
      fixed title character limit and truncates to fit the result context.

**Meta description**
- [ ] Present and accurately summarizes this page
- [ ] Contains the primary outcome or action, not a feature list
- [ ] Does not duplicate the title
- [ ] Does not contain structured data markup or JSON
- [ ] Character count recorded as a preview diagnostic only. Google has no
      fixed meta-description character limit and may use page content instead.

**Open Graph**
- [ ] og:title and og:description are accurate and preview-tested on the target
      social surfaces; no unsupported universal character cutoff is applied
- [ ] og:image: set and preview-tested at the target platform's current
      recommended dimensions/crop; meaningful content survives cropping
- [ ] og:url: matches canonical URL
- [ ] og:type: set to `website`, `article`, or appropriate type

**Twitter/X card**
- [ ] twitter:card: `summary_large_image` for pages with a hero image
- [ ] twitter:title and twitter:description: set and distinct from OG when
      appropriate
- [ ] twitter:image: set and accessible without authentication

**Other**
- [ ] Informative images have contextual alt text; decorative images use empty
      alt text or equivalent semantics instead of redundant descriptions
- [ ] Author or publisher entity name appears in metadata or schema (not just
      visible copy)
- [ ] Durable entity names are consistent across relevant metadata and visible
      content without requiring repetition in every field

---

## Lane 4: Structure

**Headings**
- [ ] One clear page-level heading or equivalent semantic main heading matches
      the title intent. Multiple H1 elements are not failed solely by count;
      judge hierarchy and accessibility in the actual document.
- [ ] H2s cover the primary sub-topics a searcher would expect
- [ ] H3s are optional but used consistently if present
- [ ] Headings are concise enough to scan and specific enough to identify their
      section; no universal word cutoff is applied

**Section coverage and order**
- [ ] Opening: what the page is and who it serves
- [ ] Evidence appears near the claims it supports
- [ ] Instructions or explanation follow the reader's natural task order
- [ ] Objections or common questions are addressed when they materially help
- [ ] CTA placement matches the page's funnel stage and does not hide the answer

**Links**
- [ ] Internal links use descriptive anchor text (not "click here" or "read more")
- [ ] Internal links connect to relevant destinations where they help the user
      or discovery; no arbitrary link quota is applied
- [ ] No internal links are broken (verify with fetch or curl)
- [ ] External links go to authoritative sources when making factual claims
- [ ] Link behavior is accessible and predictable. Opening a new tab is a UX
      decision, not an SEO requirement; warn users when a new context opens.

**FAQ (only when useful to the reader)**
- [ ] FAQ section is present only when distinct recurring questions warrant it
- [ ] Each FAQ item is a real question a user or searcher would ask
- [ ] Each FAQ answer is self-contained (the answer makes sense without reading
      the question)
- [ ] Each answer is as short as clarity permits and as long as accuracy needs;
      no unsupported universal word limit is applied

**Topic and entity coverage**
- [ ] The title, H1, and opening make the primary subject unambiguous using
      natural language; exact-match repetition is not required
- [ ] Supporting subjects and entities needed for a complete answer are covered
      where they help the reader
- [ ] No term is repeated unnaturally or inserted solely to manipulate ranking
- [ ] Synonyms and related language are used for clarity, not to satisfy a quota

Coverage check output format:
```
Primary subject "[subject]": title [clear/unclear] | H1 [clear/unclear] | opening [clear/unclear]
Supporting subject/entity "[name]": [covered/missing/not needed] | evidence: [section or selector]
Natural-language check: [clear | repetitive | stuffed] | evidence: [quoted text]
```

---

## Lane 6: AI EO (Answer Engine Optimization)

**Summary and definitions**
- [ ] The opening section contains a clear answer to the page's primary
      question. The answer can stand alone without surrounding context.
- [ ] The product, skill, or service is defined plainly in the first section,
      not assumed
- [ ] No jargon is used without an inline definition on first use
- [ ] Definitions are written as `[Term] is [concise definition].` not buried in
      nested clauses

**Answer and source quality**
- [ ] Answers use the format that best serves the content: prose, steps, table,
      or list. Do not claim one format receives automatic citation preference.
- [ ] Ambiguous pronouns do not obscure the subject
- [ ] Material factual claims link to a current primary or authoritative source

**Entity signals**
- [ ] Company/product identity is explicit and consistent in the places where
      readers and parsers need it; schema is included only when warranted
- [ ] Any `sameAs` links identify the same entity and point only to verified
      external profiles. Omit the property when no verified profile exists.
- [ ] URL is stable and descriptive where practical; an opaque legacy URL is
      not treated as a ranking failure by itself

**Accessible content and optional machine-readable files**
- [ ] Record `llms.txt` or another AI-specific file only when a named consumer
      documents support. State explicitly that Google Search ignores
      `llms.txt`, so it neither helps nor harms Google visibility.
- [ ] Primary content is present in the tested rendered output. Record raw-HTML
      dependence as a cross-client/latency risk, not an automatic Google block.
- [ ] Any paywall or auth gate is documented so the audit does not claim that
      inaccessible content was evaluated
- [ ] Headings identify their subject clearly for readers and assistive
      technology; no unverified citation advantage is claimed

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
- [ ] The primary action is discoverable at the point the target reader is
      ready for it; no fixed fold placement is assumed
- [ ] CTA text is an action + object ("Install the skill", not "Get started")
- [ ] CTA hierarchy is understandable in rendered desktop/mobile tests; do not
      impose a universal count without observing task confusion

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

Use E-E-A-T as a human quality and trust lens. Google describes E-E-A-T as a
concept used by search quality raters, not a standalone score exposed by its
ranking systems. Do not translate this checklist into a ranking promise.

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

Skip for single-page audits. Also mark N/A when the site's user journeys do not
benefit from a pillar/cluster model; a site is not required to adopt this
content architecture.

**Pillar page**: one comprehensive page that owns the site's core topic and
routes readers to deeper supporting material. Do not promise that it will rank
for a broad query.

**Cluster pages**: specific, narrow pages that support the pillar by covering
sub-topics in depth. Each links back to the pillar.

When a cluster strategy is warranted, ask:

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
