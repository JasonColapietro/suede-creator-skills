# Chapter 9. Getting Found

A great product with no distribution surface is a private hobby. That is not a
moral judgment, it is an accounting one. You spent the compute, you passed the
gates, you shipped verified output, and the number of people who can act on it
is zero. The work is real. The reach is not.

Distribution used to be somebody else's department. You built, marketing
promoted, and the handoff was a Slack message with a link in it. That
arrangement broke when the thing doing the finding stopped being a person
scanning ten blue links and started being a model assembling an answer. The
model does not scan. It extracts. And what it can extract from your page is
decided by choices you make in the artifact, which puts distribution squarely
back on your side of the line.

## What actually changed

Ranking in a results page and being cited in an answer are different jobs with
different failure modes. Ranking rewards a page that a crawler can reach and a
human can be persuaded by. Citation rewards a page that a machine can lift a
paragraph out of without inventing anything.

Four things change in the artifact when you optimize for the second one.

Claims carry sources. A page that says "faster than the alternatives" gives a
model nothing to quote, because quoting it would be quoting an opinion with a
confident font. A page that says "the pack ships 73 skill folders, MIT
licensed" and links the repo gives the model a fact with a provenance trail
attached.

Structured data validates. Not "we added JSON-LD." Validates, at
schema.org/validator, with a type and property combination that is actually
eligible for the feature you think you are earning. Invalid schema is worse
than no schema, because it looks like a signal and behaves like noise.

Headings answer questions. "Getting started" is a filing label. "How to install
the pack in three commands" is an answer fragment a model can quote directly
and attribute to you. `suede-visibility-grader` states the spread plainly in
its AI readability sub-rubric: "Getting started" = F, "How to install X in 3
commands" = A.

Paragraphs stand alone. If the third paragraph of your docs page only makes
sense after reading the first two, an extractor will either take all three or
take none. Write the unit you want quoted.

## The nine lanes

`suede-seo-audit` runs the audit as lanes, each scored A through F, each with a
checklist that lives in the skill's `references/` folder so the body stays
routable. Its core principle is one line: never audit from memory. Every
finding cites what was actually fetched.

Lane 0 is keyword research, optional, informational only, and it produces a
brief rather than a grade. Numeric demand stays `unknown` unless a dated source
provides it, which is the skill declining to invent traffic estimates to make a
finding land harder.

Lane 1 is technical access. Status code, final URL after redirects, canonical,
`robots.txt`, sitemap presence, whether primary content survives without
JavaScript. The lane drops to C or below on an actual indexability block, a
wrong canonical, a failed redirect, or missing primary content. Using
JavaScript is not a failure. Core Web Vitals get measured when tooling allows
and never enter the grade.

Lane 2 is search and answer intent. One coherent intent, one primary reader,
one earned action, no cannibalization against your own other pages. The lane
drops to C or below when the opening section answers a different question than
the URL implies.

Lane 3 is metadata. Title, description, Open Graph, Twitter card, alt text,
author entity. Character counts are preview diagnostics, not limits, because
Google publishes no fixed limit and rewrites titles anyway. The lane drops to D
or below when the page's entity cannot be identified from title, description,
and H1 together. Length alone never causes a drop.

Lane 4 is structure. Heading hierarchy, section order that follows reader
intent, descriptive anchor text. No universal template, no word count quota, no
keyword density target.

Lane 5 is schema. Decide whether structured data is warranted at all, then
validate every block and confirm it matches visible content. When schema is
missing or broken, the skill requires the literal corrected JSON-LD inline in
the findings. Describing the fix in prose is explicitly not allowed. The lane
also carries an honest caveat most SEO advice skips: FAQ markup earns no
visibility promise, because Google generally limits FAQ rich results to
authoritative government and health sites.

Lane 6 is AI EO, answer engine optimization. Clear opening answer, plain
definitions, explicit subjects, accessible primary content, source links,
flagged hallucination risk. It also records that Google Search ignores
`llms.txt`, and tells you not to grade its presence as a search signal. That is
the lane refusing to sell you a ritual.

Lane 7 is copy and conversion quality. Lane 8 is E-E-A-T, treated as a human
trust lens rather than a ranking score Google exposes, graded on how many of
the four have real visible evidence. Lane 9 is topic cluster architecture,
skipped for single-page audits and marked N/A when a pillar model does not
serve the site.

The grade is mechanical, derived from finding counts and nothing else. A means
no HIGH or MEDIUM findings in the lane. F means four or more HIGH findings, or
the lane is absent or actively harmful. Lanes 1, 3, and 6 count 1.5x. Overall A
requires 38 of 42 weighted points, and is capped outright if you never verified
a live URL, if the primary CTA is broken, or if any published statement is
false, unverifiable, or invented.

## The blunt grade

The full audit is a deliverable. Sometimes you want a verdict. That is
`suede-visibility-grader`, which answers one question:

```text
Can the right person or agent find this page, understand it, trust it, cite it,
and take the intended next action?
```

Six lanes, A through F: findability, first-screen clarity, CTA pull, proof and
trust, AI readability, and design signal. First-screen clarity grades the
rendered first viewport, not the document structure, because a visitor does not
read your DOM. AI readability has that six-item sub-rubric, ending in a test
worth stealing: if a model were asked "what is this?" right now, would this
page produce a correct, non-hallucinated answer? If no, the lane caps at C.

The caps are where the skill earns its keep. No live inspection caps the
overall at C. A broken primary CTA caps at D. A false published statement caps
at D, or F if the statement is central to the product promise. Mobile not
inspected blocks A outright. Quick grade mode, the fast gut-check read of the
first viewport only, cannot assign A at all. Its maximum is B.

Surface type changes the standards, which is the part generic SEO advice never
does. On a README, findability barely matters because GitHub handles it, but AI
readability is elevated, because models cite READMEs constantly, and one broken
install command caps Proof at D. On a product page, proof is the primary gate
and vague next steps like "learn more" cap CTA pull at D. On a docs page, CTA
pull is graded leniently, because docs exist to inform.

## Proof outranks adjectives

Both audiences punish the same thing. A human reads "industry-leading" and
discounts it, because everyone writes that. A model reads it and cannot cite
it, because there is nothing there to attribute. `suede-site-alchemy` states
the check directly: remove or rewrite "used by thousands" without a number,
"industry-leading" without a comparison, "fast" without a metric.

The replacement is not better adjectives. It is a number with a source, a
command with output, a screenshot of the thing working. `suede-seo-audit` has a
Lane 7 failure condition that reads like a dare: the lane drops to C or below
if the copy could belong to any competing product without changing a word.

## The funnel side

Being found and being acted on are separate problems, and
`suede-site-alchemy` handles the second. It starts by naming the funnel stage
before optimizing anything, because a page that serves the wrong stage fails no
matter how polished it is. Top of funnel makes the problem vivid and does not
ask for commitment. Middle of funnel differentiates and handles objections.
Bottom of funnel removes doubt with proof, pricing clarity, and real risk
reversal.

Then the friction audit, which counts three kinds. Cognitive: how many
decisions before the primary CTA, how many value propositions compete on the
first screen. Physical: how many form fields before any value is delivered, how
many clicks, whether a mobile visitor scrolls past anything before seeing a
CTA. Trust: whether an objection goes unanswered before the ask, whether proof
arrives before the request, whether the guarantee sits near the button or is
buried in a footer.

The audit is explicitly an inventory, not a score. Each item records affected
population, evidence, severity, and the event that would show improvement. A
raw count proves nothing.

The conversion math is honest about what it is. The model reads
`observed_revenue = eligible_visitors × observed_CTA_rate × observed_close_rate
× observed_order_value`, and the skill labels it descriptive, not a causal
forecast. Unmeasured fields stay `unknown` rather than silently absorbing an
industry benchmark. If someone needs a planning range, it goes out as a
sensitivity table with every assumption labeled, called a scenario, never an
expected lift.

Ranked quick wins come out of that, at most three hypotheses after the friction
audit, ranked by evidence strength, affected population, decision value,
effort, and risk. Never by invented projected lift. Broken paths and missing
conversion events get fixed before anything visual, because a beautiful page
with a dead CTA is a page with a dead CTA.

There is one rule in the urgency section that generalizes past marketing:
before adding a deadline, ask whether the claim would still be accurate if a
visitor came back in 30 days. If not, it is a dark pattern, and you cut it.

## The rule

A page that cannot be quoted will not be cited. Read your own page looking for
one paragraph a stranger could paste into an argument without adding context or
a caveat. If you cannot find it, the model will not either, and it will go
quote someone who wrote one.

### The move

Take your most important public page, open the first viewport only, and write
down the one sentence a model would return if asked "what is this?" If that
sentence is not already on the page, verbatim, put it there.
