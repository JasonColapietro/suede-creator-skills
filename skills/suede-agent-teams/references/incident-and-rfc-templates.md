# RFC, Rollback, and Post-Mortem Templates

The stationery for the documents this skill occasionally asks a lane to write, plus
the rollback decision tree and post-mortem rules. The RFC-required list and the
`accepted`-before-any-builder gate stay in the `suede-agent-teams` SKILL.md next to
their triggers. Read this file when a deploy goes wrong or you are about to author
an RFC or post-mortem, and fill every section.

## Rollback Decision Tree

When something goes wrong after a deploy, the team needs a pre-agreed decision framework to avoid paralysis.

```
Is there active data loss or corruption? → ROLLBACK IMMEDIATELY. Don't investigate first.
Is there a security exposure (PII, auth bypass, payment data)? → ROLLBACK IMMEDIATELY. Notify security.
Is a primary user path broken (login, checkout, core workflow)? → ROLLBACK unless fix is <15 minutes away.
Is performance degraded but functional? → Hold and investigate. Set a 30-minute timer.
Is it a cosmetic issue? → Hot-fix forward. No rollback.
```

After rollback:
1. Write an immediate summary: what rolled back, what was affected, who was notified.
2. Leave rollback notes in the PR and open a follow-up issue.
3. Run a lightweight post-mortem (see the template below) before re-shipping.

## When to write a post-mortem

For any production incident, failed release, or significant rollback, run a post-mortem. Keep it blameless: focus on systems, not individuals.

Severity: P0 (total outage) / P1 (primary path broken) / P2 (degraded) / P3 (cosmetic).

Post-mortems are required for P0 and P1 incidents. Optional but encouraged for P2. Skip for P3.
When one is required, write it from the post-mortem template below
and fill every section: timeline, impact, root cause, contributing factors, what went
well, and action items with owners and due dates.

## RFC template

```
RFC: [Title]
Date: [date]
Status: draft | accepted | superseded | withdrawn
Deciders: [who has final say]

## Problem Statement
One paragraph: what is broken, missing, or suboptimal? Include the user or system impact.

## Proposed Solution
What we will build or change. Be specific about interfaces, data shapes, and behavioral contracts.

## Alternatives Considered
2–3 alternatives with the reason each was not chosen.

## Risks
What could go wrong with the proposed solution? How is each risk mitigated?

## Success Criteria
How will we know this worked? Observable, measurable signals.

## Decision Record
[filled in after consensus] Accept / Modify / Reject + reason.
```

## Post-mortem template

Keep it blameless: focus on systems, not individuals.

```
Post-Mortem: [Brief title]
Date of incident:
Duration:
Severity: P0 (total outage) / P1 (primary path broken) / P2 (degraded) / P3 (cosmetic)
Author(s):

## Timeline
[time]: [event]
[time]: [detection]
[time]: [first response]
[time]: [resolution]

## Impact
Users affected:
Revenue impact (if known):
Data integrity: affected / not affected

## Root Cause
One sentence: the direct technical cause.

## Contributing Factors
The systemic conditions that made this possible. (What allowed the root cause to reach production?)

## What Went Well
Things that helped detect or contain the incident faster.

## Action Items
| Action | Owner | Due |
|---|---|---|
| ... | ... | ... |

Status: open / closed
```
