# Suede Creator Passport

A creator's portable proof of craft.

The Suede Creator Passport is a single, Suede-native identity that travels with
a creator across every Suede surface — the registry, the IP terminal, the
agentic commerce catalog, the social tier, and the rewards layer. It is owned
by the creator, recognized by Suede, and legible to agents.

This repository is its first set of working instruments.

For public positioning, launch copy, ambassador language, MCP language, Suedify
copy, social posts, emails, FAQ answers, and claim boundaries, use
[`PROMO.md`](PROMO.md).

---

## What the Passport actually is

Not an OAuth bingo card.

The Passport is a creator's accumulated, verifiable record of doing the work
that matters on Suede: registering IP, declaring credits, completing rights
intake, publishing releases, signing transfers, holding Suede tokens,
participating in the registry community. It is **Suede-native** — composed of
signals Suede already controls and verifies — so it cannot be cloned by a
sybil farm with a GitHub account and a Discord handle.

Two purposes drive every Passport decision:

1. **Sybil-resistant rewards readiness.** If Suede later uses Passport
   activity for rewards, perks, or NFTs, published rules should define
   eligibility and weighting. This repo does not allocate, guarantee, or gate
   rewards today.
2. **Author credibility on Suede Social.** A Passport tier shows up next to
   author handles, IP registry entries, and forum posts as the trust signal
   readers and buyers look for.

It is not an access gate. The Passport is positive surface — something a
creator earns, not a velvet rope.

---

## How these skills feed the Passport

This repo ships two skills that already produce Passport-shaped artifacts.
Each is a unit of provable craft.

### `suede-rights-passport`

Turns a messy creator folder into a Suede-ready transfer package. The
generated `RIGHTS_PASSPORT.md`, `suede-intake.json`, `provenance.md`,
`credits-and-splits.md`, and `license-notes.md` files are the raw material
of a Passport entry: who made what, with whom, under what rights, on what
provenance trail.

### `music-release-metadata-linter`

Audits releases for the metadata, splits, contributor, and provenance fields
the Passport expects. A clean lint report is itself a Passport signal — it
proves a creator runs disciplined release process.

---

## Stamps (forward-looking)

Stampable participation lives on the landing page today as a brand surface.
The actual stamping infrastructure — the registry of who has done what, the
nightly snapshot, the on-chain attestation roots on Base — ships in a later
phase. The skills here are designed so that when stamping comes online, every
artifact they produce can be retroactively recognized.

Anticipated stamp surface (subject to change):

- **Apple linked**, **EVM wallet linked**, **Solana wallet linked** — basic
  identity composition.
- **Rig Card verified**, **Studio Fingerprint computed** — Suede-native music
  identity primitives.
- **IP registered on Base** — provenance and ownership.
- **Rights Passport produced**, **Release Linter clean** — artifacts emitted
  by skills in this repo.
- **Suede Holder** — token-gated participation.
- **Forum standing** — durable community contribution.

The visual hierarchy is intentional: the most defensible stamps are the
Suede-native music-identity ones (Rig Card, Fingerprint, IP Trail). Generic
external stamps (OAuth, social handles) are secondary. Competitors can clone
an OAuth bingo card; they cannot clone a creator's verified rig, registered
catalog, or rights-cleared release history.

---

## What does not ship today

To keep the surface honest, the Passport explicitly **does not**:

- Issue or persist stamps in a database or on-chain registry.
- Compute or expose a numeric Passport score.
- Gate rewards, airdrops, or premium access.
- Track creator activity across sessions.

Those land when the registry stamping API lands. Until then, the skills
produce the artifacts; the Passport recognizes them later.

---

## Aesthetic

Institutional IP Terminal — Deep Ink `#050505`, Paper `#f5f1e8`, Registry
Cyan `#00b3c7`, Rights Red `#d4351c`, Hush `#1a1a1a`. Inter and IBM Plex
Mono. The Passport is registry surface, not gamification. Stamps read as
authoritative marks, not badges.

---

## Status

- **Concept**: ratified.
- **Surface (landing page, skills)**: shipped.
- **Stamping infrastructure**: deferred — see project tracker.
- **Reward allocation**: deferred — depends on future published rules and
  stamping.
- **On-chain attestation roots**: deferred — depends on stamping.
