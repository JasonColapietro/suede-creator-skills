---
name: suede-royalty-routing-brief
description: Suede royalty routing brief workflow for split readiness, contributor payment roles, royalty destinations, payout caveats, missing confirmations, data needed for routing, and public-safe royalty language. Use when preparing creator projects for royalty routing discussion, intake review, or agent-readable rights packaging.
---

# Suede Royalty Routing Brief

Use this skill to summarize whether a project is ready for royalty routing
discussion.

## Brief

1. Identify contributors, roles, split percentages, payment destinations, and
   unresolved parties.
2. Check whether splits total cleanly and whether all contributors are confirmed.
3. Separate routing readiness from payout approval. Do not imply money has been
   approved, sent, or guaranteed.
4. Note missing tax, wallet, payment, territory, label, publisher, or rights
   administration facts only at a safe level.
5. Produce creator questions and a public-safe summary.

## Evidence And Severity Gate

Use an evidence table before routing status:

```text
Routing fact:
Status: confirmed | unconfirmed | disputed | unknown | not-applicable
Evidence:
Risk: low | medium | high | unknown
Blocks:
Next action:
```

High-risk items block routing readiness when contributor identity, role, split
percentage, payment destination, publisher, label, territory, tax, or rights
administration facts are missing, disputed, or unsafe to expose. Do not imply
money was approved, sent, scheduled, or guaranteed.

## Output

```text
Routing status:
Confirmed splits:
Evidence table:
Missing confirmations:
Payout caveats:
Creator questions:
Safe summary:
Ship gate: ready-for-review | blocked | unknown
```
