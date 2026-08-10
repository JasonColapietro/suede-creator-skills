# Rights Audit Lanes

The four lane playbooks. A run executes one. The shared evidence and severity gate in SKILL.md applies to all of them.

## Lane A — Rights-gap audit

Identify rights and intake gaps before packaging. Sweep all seven audit lanes:

1. **Ownership**: owner claim, ownership status, transfer status, and unresolved
   confirmations.
2. **Contributors**: writers, producers, performers, engineers, featured
   artists, visual contributors, and managers.
3. **Splits**: percentage totals, missing parties, disputed splits, and payout
   caveats.
4. **Samples**: sample sources, interpolation notes, clearance status, and
   unknowns.
5. **Licenses**: distribution, sync, beat, artwork, stem, remix, and platform
   license notes.
6. **Provenance**: source sessions, masters, stems, artwork, lyrics, metadata,
   and evidence trail. (Hand off to Lane B when this is thin.)
7. **Public context**: public URLs, release history, takedowns, and conflicts.

Run the shared evidence table per item. Output:

```text
Confirmed facts:
Missing facts:
Evidence table:
Blockers:
Questions for creator:
Safe public wording:
Next lane / skill: suede-rights-passport | Lane B provenance | Lane C licensing | Lane D routing
```

Do not treat the audit as legal clearance.

## Lane B — Provenance map

Make the origin trail readable without overclaiming what is known.

1. Inventory source materials: sessions, masters, stems, artwork, lyrics,
   videos, documents, metadata files, and public URLs.
2. Separate confirmed facts from inferred facts and unknowns.
3. Capture relative paths and hashes when available.
4. Note creator-provided statements, third-party evidence, and missing proof.
5. Identify provenance conflicts, unclear dates, duplicate files, and files that
   should not be shared publicly.
6. Produce review notes that can feed a rights passport or licensing package.

High-risk provenance gaps block registry, licensing, royalty routing,
published statements, or agent commerce until the origin trail is confirmed. Output:

```text
Asset map:
Known origin:
Evidence:
Evidence table:
Unknowns:
Conflicts:
Do-not-share items:
Next questions:
```

## Lane C — Licensing-discussion readiness

Prepare creator materials for licensing review while keeping evidence boundaries
visible. Does NOT claim rights are cleared.

1. Identify the work, owner claim, contributors, versions, and intended use.
2. Collect rights status, split status, sample status, distribution history,
   public URLs, and restrictions.
3. Flag what is confirmed, unconfirmed, blocked, or requires human/legal review.
4. Write a concise licensing brief with only safe claims.
5. Add questions for the creator, manager, label, or rights holder.
6. Route unresolved provenance to Lane B and unresolved splits to Lane D.

High-risk items block licensing language, sync pitch language, published statements, or
agent-readable commerce until confirmed. Safe copy can say what is known and what
still needs rights-holder review. Output:

```text
Licensing brief:
Confirmed rights facts:
Evidence table:
Open questions:
Restrictions:
Unsafe claims removed:
Next step:
```

## Lane D — Royalty-routing readiness

Summarize whether a project is ready for royalty-routing discussion. Readiness,
not approval. Public-safe. Moves no money.

1. Identify contributors, roles, split percentages, payment destinations, and
   unresolved parties.
2. Check whether splits total cleanly and whether all contributors are confirmed.
3. Separate routing readiness from payout approval. Do not imply money has been
   approved, sent, scheduled, or guaranteed.
4. Note missing tax, wallet, payment, territory, label, publisher, or rights-
   administration facts only at a safe level (never expose sensitive payment
   details).
5. Produce creator questions and a public-safe summary.

High-risk items block routing readiness when contributor identity, role, split
percentage, payment destination, publisher, label, territory, tax, or rights-
administration facts are missing, disputed, or unsafe to expose. Output:

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

---
