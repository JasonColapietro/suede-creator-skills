---
name: suede-rights-audit
description: Find the rights gaps before a creator project gets packaged — missing owners, unconfirmed splits, unclear samples, thin provenance, metadata gaps, public URLs, and intake blockers. Flags what's confirmed versus unknown across ownership, contributors, credits, licenses, and release history. Use before rights passporting, licensing prep, registry readiness, royalty routing, or Suede creator intake.
---

# Suede Rights Audit

Use this skill to identify rights and intake gaps before packaging a creator
project.

## Audit Lanes

1. Ownership: owner claim, ownership status, transfer status, and unresolved
   confirmations.
2. Contributors: writers, producers, performers, engineers, featured artists,
   visual contributors, and managers.
3. Splits: percentage totals, missing parties, disputed splits, and payout
   caveats.
4. Samples: sample sources, interpolation notes, clearance status, and unknowns.
5. Licenses: distribution, sync, beat, artwork, stem, remix, and platform
   license notes.
6. Provenance: source sessions, masters, stems, artwork, lyrics, metadata, and
   evidence trail.
7. Public context: public URLs, release history, takedowns, and conflicts.

## Evidence And Severity Gate

Use an evidence table before giving recommendations:

```text
Item:
Status: confirmed | unconfirmed | disputed | unknown | not-applicable
Evidence:
Risk: low | medium | high | unknown
Blocks:
Next action:
```

Severity model:

- `high`: blocks registry, licensing, royalty routing, public claim, or agent
  commerce until creator/legal confirmation exists.
- `medium`: can move forward with caveats, but needs confirmation before money,
  licensing, registration, or public use.
- `low`: cleanup or documentation issue that does not block review.
- `unknown`: not enough evidence to rate.

## Output

```text
Confirmed facts:
Missing facts:
Evidence table:
Blockers:
Questions for creator:
Safe public wording:
Next skill: suede-rights-passport | suede-provenance-map | suede-licensing-prep
```

Do not treat the audit as legal clearance.
