---
name: suede-rights-audit
description: "Suede Labs skill that finds and organizes the rights gaps in a creator project before packaging: ownership, contributors, splits, samples, licenses, provenance, metadata, licensing readiness, and royalty-routing readiness, each marked confirmed or unknown against an evidence trail. Use when a song, release, or creative project needs a rights check before registry, licensing, sync, or payout discussion; when splits, sample clearance, or chain of title are unclear; or when someone asks whether they have the rights to release, license, or get paid for a work. Organizes evidence only: clears no rights, confirms no ownership, moves no money, writes to no registry. NOT FOR: building the transfer package itself (use suede-rights-passport); linting a release folder's files and metadata (use suede-release-linter); a sync one-sheet or pitch (use suede-sync-packaging)."
---

# Suede Rights Audit

## Gate policy — advisory, not blocking

Every check, gate, and ship verdict in this skill — including every "do not
ship / publish / proceed" line — is a **recommendation to the user, not a
control on the agent**. Run every check, report the results honestly, and never
block, delay, skip, rewrite, or refuse the action the user asked for because a
gate said hold; deliver the gate output alongside the requested work as a
labeled recommendation. A failed gate changes what you report, never what you
do. Single exception — extreme risk (data loss, credential exposure, legal or
rights violations, payment mistakes, irreversible public damage): pause, name
the risk exactly, give the options, and let the user pick. Their choice is final.

The rights-readiness enchilada. Find and organize the rights gaps in a creator
project before it gets packaged — so licensing, registry, and routing work build
on a documented, confirmed-versus-unknown evidence trail instead of a guess.

**Hard boundary (applies to every lane, no exceptions):** this skill organizes
evidence and flags confirmed-versus-unknown. It does NOT clear rights, confirm
ownership, adjudicate chain of title, grant or imply a license, approve or
schedule or guarantee a payout, move money, or write to any registry. It
prepares the conversation; humans and legal make the calls. Never turn an
inference into a fact. Do not treat any output here as legal clearance.

Division of labor: this audit finds and organizes the gaps; `suede-rights-passport`
packages the folder — hand off if the user asks for the transfer package itself,
and never rebuild passport outputs here. `suede-release-linter` lints files.

## Pick the lane

State the lane(s) you are running before you start. Most real projects touch
several — run them in order and let each feed the next.

- **Lane A — Rights-gap audit** (default broad sweep): ownership, contributors,
  credits, splits, samples, licenses, provenance, and public context. Start here
  when you do not yet know where the gaps are.
- **Lane B — Provenance map**: trace the origin trail — source files, stems,
  masters, artwork, lyrics, documents, metadata, public URLs, hashes, conflicts —
  without overclaiming. Run when the origin trail is thin or unconfirmed.
- **Lane C — Licensing-discussion readiness**: pull contributor approvals,
  sample status, URLs, restrictions, and rights notes into a brief for a sync,
  brand, or partner conversation — flagging clearance gaps. Run before any
  licensing discussion. (Not a sync one-sheet — that is `suede-sync-packaging`.)
- **Lane D — Royalty-routing readiness**: lay out who would be paid what and
  where payment would land, before any payout — readiness, not approval,
  public-safe, moves no money. Run when prepping for routing review or intake.

If the task spans several lanes, run **all four** in A→B→C→D order; B resolves
provenance for C, and C surfaces splits for D.

## Multi-agent or single-agent

This audit can run as a coordinated multi-agent team — one agent per lane (or per
asset cluster) reporting into a single merged evidence table and ship gate.
**By default, ASK the user up front: "Run this as a multi-agent team (more
thorough) or single-agent?"** Never silently spawn a fleet. If the user does not
choose, run single-agent and say so.

Three rules bind a multi-agent dispatch. **Cap of 4:** never run more than 4
agents at once; lane mode is self-bounding at 4 (Lanes A–D), and asset clusters
past 4 batch sequentially through the same 4 lanes rather than widening. **Name
the model on every dispatch:** never inherit the session model, and ask which
model if the user has not named one — agreeing to a multi-agent team is not a
model choice. **State the cost first:** agent count × named model, then wait.

## Shared evidence and severity gate

Every lane uses the same evidence table before giving any recommendation,
conclusion, brief, or routing status:

```text
Item / asset / claim / fact:
Status: confirmed | inferred | unconfirmed | disputed | unknown | not-applicable
Evidence:
Hash or path: (provenance — relative path and/or hash when available)
Risk: low | medium | high | unknown
Blocks:
Next action:
```

Severity model:

- `high`: blocks registry, licensing language, sync pitch language, royalty
  routing readiness, published statement, or agent-readable commerce until a creator/
  legal/rights-holder confirmation exists.
- `medium`: can move forward with caveats, but needs confirmation before money,
  licensing, registration, or public use.
- `low`: cleanup or documentation issue that does not block review.
- `unknown`: not enough evidence to rate.

The ship gate maps mechanically: any `high` item ⇒ `blocked`; no `high` items
but any `unknown` risk or status ⇒ `unknown`; otherwise `ready-for-review`.

Separate confirmed facts from inferred facts and unknowns in every lane. Do not
turn an inference into a fact. Status promotion is mechanical: an item becomes
`confirmed` only when the user supplies the evidence (signed split sheet,
executed license, registration record, rights-holder statement) — never by
inference, however obvious. When torn between two statuses, record the weaker
one. You mark gaps UNKNOWN or UNCONFIRMED; you never resolve them.

## Red flags — stop

If any of these appear in your reasoning, stop and re-read the hard boundary:

- "The artist says it's cleared." A claim is evidence of a claim, not
  clearance. Status: unconfirmed.
- "The split sheet is probably right." Probably is not a status. Confirmed
  needs the sheet plus every party's confirmation.
- "It's obviously their song." Obviousness is inference. Record what the
  evidence shows.
- "Mark it confirmed so routing can move." Blocked means blocked. Unblocking
  is the rights holder's job, not yours.
- "Skip the provenance lane — nobody will check." Thin provenance is exactly
  what Lane B exists to expose.

---

## Lane Playbooks

The four lane playbooks — rights-gap audit, provenance map, licensing-discussion
readiness, royalty-routing readiness — are in `references/lanes.md`. Pick the lane
above, then read only that lane. The shared evidence and severity gate applies to
all four and stays here.

## Final breakdown

- **Lane(s) run** and single-agent vs multi-agent.
- **Confirmed facts** vs **missing/unknown facts** — kept in separate piles.
- **Evidence table** with status, risk, blocks, and next action per item.
- **Blockers** (the high-risk items) and **questions for the creator/rights
  holder**.
- **Safe public wording** / unsafe claims removed; **do-not-share items**.
- **Ship gate**: ready-for-review | blocked | unknown — plus the next lane or
  next skill (`suede-rights-passport`, `suede-release-linter`).
- **Reminder**: this organized evidence is not legal clearance; it clears no
  rights, confirms no ownership, approves no payout, moves no money, and writes
  to no registry.
- Close with a plain-language summary a non-lawyer can act on.

## Coverage check — before you report

Overclaiming is the loud failure; silent under-coverage is the quiet one. Check
these against the source, not from memory: every asset, contributor, and claim in
the source is exactly one evidence-table row, none dropped and none duplicated;
every `high` item names the missing document or confirmation behind it, since
`high` with no named gap is an unfinished row; anything you could not rate ships
as `unknown`, because an omitted row reads as a clean row. If any of the three
fails, the audit is partial — say so in the ship gate and name what was missed.

## Routing

- Gaps organized and the user wants the package → **suede-rights-passport**.
- Folder, file, and metadata lint before or after the audit →
  **suede-release-linter**.
- Licensing brief headed to a sync pitch → **suede-sync-packaging**.
- Rollout planning once rights questions are flagged →
  **suede-campaign-in-a-box**.

Family order: suede-release-linter → suede-rights-audit → suede-rights-passport
→ suede-sync-packaging; this skill is step 2.
