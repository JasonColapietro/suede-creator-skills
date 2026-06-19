---
name: suede-visibility-grader
description: Suede website visibility and CTA grading workflow for public pages, GitHub Pages sites, launch pages, creator sites, docs surfaces, and campaign pages. Use when a user wants a clear A-F grade for whether a page can be found, understood, trusted, cited by AI systems, and acted on.
---

# Suede Visibility Grader

Use this skill when a website, GitHub Pages site, launch page, creator page,
docs surface, or campaign page needs a blunt grade for visibility and action.
The goal is not generic SEO advice. The goal is to answer one question:

```text
Can the right person or agent find this page, understand it, trust it, cite it,
and take the intended next action?
```

## Source Truth

Before grading, inspect the current page or source:

- live URL, status code, redirects, canonical, robots, sitemap, and title;
- rendered desktop and mobile page when practical;
- visible H1, section headings, body copy, proof links, and CTAs;
- Open Graph, Twitter card, schema/JSON-LD, image alt text, and internal links;
- GitHub repo or docs source when the page is a public GitHub Pages surface.

Do not grade from memory alone. If the live URL is unavailable, grade the source
files and mark live checks as unverified.

## Grade Lanes

Score each lane A-F, then give one overall grade:

- **Findability:** status, canonical, robots, sitemap, title, description,
  durable keywords, and duplicate URL risk.
- **First-screen clarity:** whether the first viewport says who it is for, what
  changes for them, and what to do next.
- **CTA pull:** primary action, secondary proof action, button text, link
  targets, and whether the visitor has a reason to click now.
- **Proof and trust:** screenshots, commands, docs, manifests, live routes,
  source files, receipts, authorship, and claim boundaries.
- **AI readability:** answer-ready summaries, schema fit, sourceable claims,
  internal links, citation-friendly headings, and AI EO surface area.
- **Design signal:** hierarchy, spacing, typography, image quality, responsive
  behavior, contrast, and whether the page looks intentional rather than
  generated.

Grade meaning:

- **A:** ship and use as a reference.
- **B:** strong, with specific improvements.
- **C:** usable, but leaks attention or trust.
- **D:** visible but weak; needs a focused pass before promotion.
- **F:** blocked by discoverability, broken CTA, false claim, broken render, or
  missing source truth.

## Output Format

```text
Simple explanation:
Plain-language summary of the grade and the one biggest fix.

Usual breakdown:
URL or source:
Primary reader:
Primary action:

Grades:
Findability: A-F
First-screen clarity: A-F
CTA pull: A-F
Proof and trust: A-F
AI readability: A-F
Design signal: A-F
Overall: A-F

Top fixes:
1. Highest-impact fix.
2. Second fix.
3. Third fix.

CTA rewrite:
Primary CTA:
Secondary CTA:
Final CTA:

Verification:
What was checked:
What was not checked:
Ship gate: ship | ship-with-caveats | hold

Cue Suede:
1. Change something - tell me what to revise and I will adjust it.
2. Preserve this - tell me what worked so I can mimic it later.
3. Keep as-is - say nothing and I will treat it as accepted.
```

## Boundaries

- Do not invent traffic, ranking, conversion, partner, legal, or payout claims.
- Do not treat an A-F grade as an audited business metric.
- Do not recommend fake urgency, fake testimonials, or unsupported proof.
- Do not bury the CTA behind vague brand language.
- Do not call a page fixed until the current live URL or source was inspected.
