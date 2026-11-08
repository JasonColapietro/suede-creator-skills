---
name: suede-reverse-engineer
description: "Use when someone wants to reverse engineer how a brand, company, creator, product, or career went from 0 to 100 and copy the right moves at their own stage: 'how did X grow', 'what did Glossier do early', 'map a competitor's growth', 'get me from $8k/month to where Y is', 'how did this founder/creator get here', or 'what should I copy next'. Builds a dated, sourced growth map across signal lanes, finds the inflection points that bent the curve, diagnoses the user's stage on a 0-1-10-25-50-100 ladder, filters every move for transferability, and returns the next 3 moves with leading indicators and kill rules. NOT FOR: a competitor feature/pricing profile with no growth question (use a competitor-profiling skill), writing the comparison page (use suede-copy), or a full marketing plan with budgets (use a marketing-plan skill)."
---

# Suede Reverse Engineer

Turn anyone's 0 → 100 story into the next three moves for *you*.

**Core principle:** a growth story is only useful when every claim has a date and a source, the moves that actually bent the curve are separated from the ones that happened alongside it, and each move is checked against the user's stage, money, and era before it gets copied.

Most "how X grew" answers fail the same three ways. They retell the founder myth instead of the evidence. They list everything the company did instead of what changed right before growth sped up. And they hand a $8k/month shop the playbook of a company with $200M in funding. This skill exists to fix those three things.

## Inputs

Read what the user already gave you before asking anything. Ask only for what blocks the stage diagnosis:

```text
Target:        the brand, company, creator, or person to reverse engineer
You:           what you sell, to whom, and where you are now
Your numbers:  revenue/month, customers, audience size, or the closest proxy you have
Your limits:   cash, hours/week, team size, things you won't do
Goal:          the next milestone you actually care about (not "be Glossier")
```

If the user is reverse engineering for research only (no "me" side), skip the stage diagnosis and the copy plan and deliver the growth map and inflection analysis.

If the target is a private person who is not a public figure, use only what they've published about themselves professionally. Do not dig into personal life, family, or anything a reasonable person would consider private.

## The 0 → 100 Ladder

Place both the target (at each point in its history) and the user on this ladder. The numbers are stage names, not percentages.

| Stage | Name | Gate to pass (evidence that you're here) |
|---|---|---|
| **0** | Idea | A name and a hunch. No stranger has paid. |
| **1** | First sale | A stranger paid, without a discount from you personally. |
| **10** | Signal | Repeat purchase or retention is visible; some customers arrive by word of mouth. |
| **25** | Channel | One acquisition channel produces customers on demand at a cost the margin can carry. |
| **50** | Brand | People search for you by name; a meaningful share of growth is unpaid. |
| **100** | Category | Others copy you; you set the default in your niche. |

Rules that make the ladder honest:

- Diagnose the user from **evidence**, not ambition. A shop at $8k/month with mostly paid traffic and low repeat rate is a 10 at best, not a 25.
- If the user's numbers are missing, give the diagnosis as a range and say which number would settle it.
- The only part of the target's story that is directly copyable is the part from the user's current stage to the next one. Later stages are context, not instructions.

## Workflow

### 1. Build the evidence ledger

Research the target across the signal lanes below. Read `references/lanes-and-sources.md` for where to look in each lane and how to date a signal.

| Lane | What you're looking for |
|---|---|
| Product & offer | Launch dates, hero products, pricing changes, bundles, new lines |
| Content & social | The posts, formats, series, and creators that preceded spikes |
| Paid | Ad library volume over time, recurring hooks and formats |
| Search & AI answers | Pages that rank, branded search trend, what AI answers cite |
| Community | Owned groups, events, customer co-creation, referral loops |
| Distribution & partners | Retail, marketplaces, integrations, affiliates, collabs |
| Press & capital | Funding rounds, press moments, awards |

Log every claim in a ledger row:

```text
| Date | Lane | Claim | Source (URL or doc) | Type: FACT / INFERENCE / UNKNOWN |
```

- **FACT** has a dated, linkable source.
- **INFERENCE** is your reasoning from facts; say which facts.
- **UNKNOWN** is a gap worth naming ("revenue before 2016 is not public").

Numbers from memory with no source are UNKNOWN until verified. When you can't browse, say so at the top of the report and mark every number as unverified; never present a remembered figure as a fact.

### 2. Draw the growth curve

Pick the best available proxy for growth (revenue, traffic, followers, installs, headcount, branded search) and place it on a timeline. State the proxy and why it's the best one available. Mark where the target crossed each ladder stage.

### 3. Find the inflection points

An inflection point is a change in slope, not a famous moment. For each one:

1. Mark when the curve bent (the month or quarter).
2. List what changed in the 0–3 months **before** the bend, across all lanes.
3. Name the most likely cause and the runner-up, with the evidence for each.
4. Rate confidence: **High** (timing plus a direct statement or data), **Medium** (timing only), **Low** (story only).

Check for survivorship bias: if competitors did the same move without the same result, say so. That move was probably necessary but not sufficient.

Expect 2–4 inflection points. A story with ten "key moments" hasn't been analysed yet.

### 4. Filter for transferability

Score every candidate move before you recommend it:

| Filter | Question | Fail means |
|---|---|---|
| **Stage** | Did the target do this at the user's current stage or the next one? | It's context, not a move |
| **Capital** | Can the user fund it from current cash or revenue? | Shrink it or drop it |
| **Era** | Does the channel still work the way it did then (organic reach, CPMs, platform rules)? | Find today's equivalent |
| **Unfair advantage** | Did it depend on something the user lacks (an existing audience, a famous founder, a network)? | Name the substitute or drop it |
| **Fit** | Does it suit the user's product, buyer, and the things they won't do? | Drop it |

A move that passes all five is **COPY**. One that fails Era or Unfair advantage but has a workable substitute is **ADAPT** (name the substitute). Everything else is **SKIP**, with the reason in one line. Users learn as much from the SKIP list as from the COPY list.

### 5. Write the next 3 moves

Exactly three, ranked. Each one gets:

```text
Move:              what to do, in one sentence
Borrowed from:     which inflection point or ledger row it comes from
Why now:           why it fits the user's stage (cite the ladder gate it moves them toward)
First 14 days:     concrete actions, sized to the user's hours and cash
Leading indicator: the number that should move within 30 days, with a target
Kill rule:         the result at day 30–45 that means stop or change it
```

Three, not ten, because a small team that runs three moves well beats one that starts ten. Put any extras in a "Later" list with the stage they unlock at.

## Output

Use this order. Read `references/report-template.md` for the full template.

1. **Verdict** (3 lines): the one thing that actually drove the target's growth, the user's stage, and the single highest-leverage move.
2. **Growth map**: timeline of stages and inflection points, one line per lane per period.
3. **Inflection points**: each with before-the-bend changes, cause, runner-up, confidence.
4. **Your stage**: ladder diagnosis with the evidence and the gate to the next stage.
5. **COPY / ADAPT / SKIP** table.
6. **Next 3 moves** in the block format above.
7. **Evidence ledger** (can be an appendix).
8. **Unknowns** and what would resolve them.

## Modes

- **Brand / business** (default): as above.
- **Creator**: proxy is audience size and engagement; lanes weight content formats, collaborations, and the first product.
- **Career**: the target is a person's public professional path. Proxy is scope (role, team, revenue owned, audience). Ladder: 0 learning, 1 first paid work, 10 known for one thing, 25 repeatable demand for that thing, 50 inbound by reputation, 100 sets the standard in the field. Use only public, professional sources.
- **Head-to-head**: two targets at the same stage; the useful output is what one did that the other didn't before their curves split.

## Quick Reference

| Do | Because |
|---|---|
| Date and source every claim | Myth and memory are the main failure of growth stories |
| Look at what changed *before* each bend | Famous moments often come after growth, not before it |
| Diagnose the user from evidence | Over-staging leads to copying moves they can't afford yet |
| COPY / ADAPT / SKIP every move | It stops "Glossier raised $260M" advice reaching a $8k shop |
| Exactly 3 moves with kill rules | Focus, and a clear point to stop |

## Common Mistakes

- **The founder-myth retelling.** Origin story, no dates, no slope. Fix: ledger first, story last.
- **The everything list.** Twenty tactics with equal weight. Fix: 2–4 inflection points, then three moves.
- **Stage blindness.** Recommending a flagship store, a brand rebrand, or a $50k creator programme to a stage-10 business. Fix: the Stage and Capital filters.
- **Era blindness.** "Grow on Instagram organic like they did in 2014." Fix: the Era filter and a named modern substitute.
- **Unverified numbers presented as facts.** Fix: UNKNOWN until sourced; say when you couldn't browse.
- **Moves with no exit.** Fix: every move gets a leading indicator and a kill rule.
