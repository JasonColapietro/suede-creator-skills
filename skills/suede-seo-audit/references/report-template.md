# SEO audit report template

Read this before writing the report for `suede-seo-audit`. Fill every field;
write "none found" or "not applicable" rather than leaving one blank.

```
=== SEO AUDIT REPORT ===
Audited URL:            Audit date:            Source checked: [live | source | both]

--- TARGET QUERY THEME (Lane 2) ---
Primary query theme: [query family], [intent], [evidence source/date]
Keyword or topic discovery: [routed to suede-content-strategy | not requested]

--- METADATA ---
SEO title (suggested):            Meta description (suggested):
H1 (suggested):                   Subhead (suggested):

--- CONVERSION ---
Primary CTA (text -> destination):   Secondary CTA:

--- CONTENT ADDITIONS ---
Required subjects: [from intent and verified gaps]
Question headings to add: [H2 text -> answer summary]
Internal links to add (anchor -> destination):
External sources to cite (claim -> source URL):
Competitor gap: [URL checked, date] -> [missing subject, priority]

--- SCHEMA ---
[Corrected or new JSON-LD block]
Entity @id used: [Organization / Person @id] | consistent with site: [yes/no]
Retrievability: [property], [prose-backed | indexable-only | decorative | unclassified], evidence
Schema-only claims: [property = value | none]
Structure claim vs prose: [@type] declares [N] | visible headings [N] | [match/mismatch]

--- ANSWER EXTRACTABILITY (Lane 6) ---
Opening answer: [quoted | absent]
Extractability checks passing: [N of 9, per suede-ai-seo]
Hallucination risk claims: [quoted | none]
llms.txt: [named consumer and use | none warranted]; Google Search effect: none

--- E-E-A-T NOTES ---
Experience / Expertise / Authoritativeness / Trust gaps:

--- ARCHITECTURE (omit for single pages) ---
Pillar -> clusters map | Orphans | Pages deeper than 4 clicks | Cannibalization

--- CORE WEB VITALS (never graded) ---
LCP / INP / CLS: [field value (source) | lab value | not measurable: reason]
Risk: low | medium | high      Risk factors observed:

--- SCORES ---
Lane 1-9 grades:                Overall:

--- KPI WATCHLIST ---
[KPI | source | baseline | re-check date] for each HIGH and MEDIUM fix

--- EVIDENCE BOUNDARIES ---
Safe to publish: | Hold until verified (user's call): | Remove:

--- VERIFICATION CHECKLIST ---
[ ] Status 200 and canonical confirmed  [ ] robots.txt allows path
[ ] Schema validates (Schema.org Validator) and Rich Results Test where a Google feature applies
[ ] Internal links return 200           [ ] Primary CTA loads
[ ] og:image loads                      [ ] JSON-LD contains no invented content
[ ] Declared schema structure matches visible structure

--- SHIP GATE ---
ship | ship-with-caveats | hold        Reason:
```
