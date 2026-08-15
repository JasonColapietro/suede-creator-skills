---
name: suede-marketing-ideas
description: "Suede-affiliated marketing ideation using a structured tactic library organized by stage, budget, and timeline. Use when the user is stuck, wants options, or needs a shortlist of growth tactics before committing to a plan. NOT FOR: a comprehensive roadmap (use suede-marketing-plan), channel execution (use the relevant public Suede skill), or unattended recurring workflows (use suede-marketing-loops)."
metadata:
  version: 2.0.0
---

# Suede Marketing Idea Prioritizer

Suede turns a broad tactic library into a bounded shortlist scored against the user's audience, stage, evidence, capacity, cost, and risk. The goal is not to label the library's tactics "proven"; it is to identify which few deserve validation in this specific situation and which should be deferred or rejected.

## How to Use This Skill

Read `.agents/product-marketing.md` first if it exists and ask only for what it does not cover; see `suede-product-marketing` for path fallbacks.

When asked for marketing ideas:
1. Ask the Task-Specific Questions below until product, audience, stage, budget, owner capacity, and what has already been tried are on the record. Do not score against assumptions.
2. Pull candidates from the category index below (full descriptions in `references/ideas-by-category.md`). Score no more than 8 candidates.
3. Score every candidate with the rubric below and apply its decision rule.
4. Return the shortlist in the Output Format, including the required rejection.

---

## Ideas by Category (Quick Reference)

| Category | Ideas | Examples |
|----------|-------|----------|
| Content & SEO | 1-10 | Programmatic SEO, Glossary marketing, Content repurposing |
| Competitor | 11-13 | Comparison pages, Marketing jiu-jitsu |
| Free Tools | 14-22 | Calculators, Generators, Chrome extensions |
| Paid Ads | 23-34 | LinkedIn, Google, Retargeting, Podcast ads |
| Social & Community | 35-44 | LinkedIn audience, Reddit marketing, Short-form video |
| Email | 45-53 | Founder emails, Onboarding sequences, Win-back |
| Partnerships | 54-64 | Affiliate programs, Integration marketing, Newsletter swaps |
| Events | 65-72 | Webinars, Conference speaking, Virtual summits |
| PR & Media | 73-76 | Press coverage, Documentaries |
| Launches | 77-86 | Product Hunt, Lifetime deals, Giveaways |
| Product-Led | 87-96 | Viral loops, Powered-by marketing, Free migrations |
| Content Formats | 97-109 | Podcasts, Courses, Annual reports, Year wraps |
| Unconventional | 110-122 | Awards, Challenges, Guerrilla marketing |
| Platforms | 123-130 | App marketplaces, Review sites, YouTube |
| International | 131-132 | Expansion, Price localization |
| Developer | 133-136 | DevRel, Certifications |
| Audience-Specific | 137-139 | Referrals, Podcast tours, Customer language |

**For the complete list with descriptions**: See [references/ideas-by-category.md](references/ideas-by-category.md)

---

## Scoring Rubric

Score every candidate 0–3 on all six dimensions. 0 means "no evidence either way," not "probably fine."

| Dimension | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **Audience** | No evidence the ICP is reachable here | Plausible by category, unverified | ICP observed on this surface | Named communities/queries/accounts the user can point at |
| **Stage** | Preconditions absent | One precondition missing | Preconditions met, untested | Preconditions met and a comparable move already worked |
| **Evidence** | Support is "it's popular" | Third-party case studies only | Dated first-party signal from an adjacent channel | Dated first-party result for this audience |
| **Capacity** | No owner | Owner named, no hours | Owner + hours, displaces something | Owner + hours with no displaced commitment |
| **Cost** | Unknown total cost | Over the approved bounded amount | Within it, but consumes most of it | Within it with headroom |
| **Risk** | No stop condition definable | Reversible only at cost, gates unchecked | Reversible, gates identified | Reversible, cheap to stop, no legal/platform/brand exposure |

**Decision rule** — apply in order, first match wins:

1. Any dimension scored 0 → **Skip** or **Conditional**, never a test this cycle. Name the zeroed dimension.
2. Total ≥ 14/18 **and** Evidence ≥ 2 **and** Capacity ≥ 2 → **Approved test**. State the test, the success metric, the review date, and the stop condition.
3. Total ≥ 10 with a single named blocker → **Conditional**. State the exact unlock condition and who can clear it.
4. Total ≥ 10 with no capacity in this window → **Deferred**. State the review date.
5. Total < 10, or Risk ≤ 1 → **Skip**. State the disqualifying dimension.

A tactic the user is already running is **Current** — score it, but do not present it as a new idea. These five statuses are the same set `suede-marketing-plan` Section 12 uses, so a shortlist drops into a plan without relabeling.

**Caps.** Score at most 8 candidates; surface at most 5; at most 3 carry Approved test at once. If more than 3 clear rule 2, rank by Capacity then Cost and move the rest to Deferred — capacity, not enthusiasm, is the binding constraint.

**Required rejection.** Every shortlist must name at least one tactic that is *not* recommended, drawn from the record rather than invented: something the user named under Task-Specific Questions 3 or 4 (already tried, or a competitor tactic they admire), or the highest-scoring candidate that still fails a dimension. Do not construct a strawman the user never raised. If the user named nothing and every scored candidate clears, say that explicitly instead of manufacturing a rejection.

---

## Output Format

When recommending ideas, provide for each:

- **Idea name**: One-line description
- **Status**: Approved test / Conditional / Deferred / Skip, with the six dimension scores and the total
- **Why it fits**: Connection to their situation, citing the evidence that scored the Evidence dimension
- **How to start**: First 2-3 implementation steps
- **Expected outcome**: The success metric, its review date, and the stop condition
- **Resources needed**: Time, budget, skills required

Close every shortlist with the required rejection, in this form:

**Not recommended:** [tactic] — fails [dimension] because [current evidence, or the absence of it].

---

## Task-Specific Questions

1. What's your current stage and main growth goal?
2. What's your marketing budget and team size?
3. What have you already tried that worked or didn't?
4. What competitor tactics do you admire?

---

## Boundaries

- Do not claim a tactic fits, is proven, or will grow revenue without current evidence and explicit scoring.
- Do not launch campaigns, publish content, spend money, contact prospects, or create accounts without authorization.
- Do not treat brainstormed ideas as a plan, forecast, commitment, or completed experiment.
- Do not decide budget, risk tolerance, brand claims, or channel priority when required context is missing.

## Routing

- Use `suede-marketing-plan` to turn selected ideas into a sequenced roadmap.
- Use `suede-marketing-loops` for approved recurring workflows.
- Use `suede-programmatic-seo`, `suede-competitors`, or `suede-emails` for channel execution.
- Use `suede-free-tools` for engineering-as-marketing and `suede-referrals` for referral mechanics.
- Use `suede-marketing-council` when the shortlist is a coin-flip between two defensible directions and scoring does not separate them.
- Use `suede-marketing-psychology` for the behavioral mechanism behind a conversion tactic, stated as a testable hypothesis.
