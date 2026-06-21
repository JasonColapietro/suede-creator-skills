---
name: suede-sync-packaging
description: Package songs for sync pitching with scene-fit angles, one-sheet copy, clean and instrumental asset checklist, lyric flags, mood tags, rights status, clearance questions, supervisor-safe notes, public links, and next review steps. Use when an artist, manager, publisher, label, or agent wants music prepared for film, TV, ads, games, trailers, creator campaigns, or brand briefs without claiming clearance or turning sync prep into a promo funnel.
---

# Suede Sync Package

Use this skill to make a song easier to evaluate for sync without pretending
rights are cleared when they are not.

## Input Contract

Provide at minimum:
- **Track**: title, artist, featuring credits if any
- **Target world**: film / TV / ads / games / trailers / creator campaigns / brand brief (or "general sync")
- **Available assets**: which of master, instrumental, clean, stems, lyrics, credits, splits currently exist
- **Rights status**: what is confirmed vs. unknown (sample clearance, ownership splits, publishing assignment)

Optional but useful: reference sync placements you admire, mood or scene keywords, existing pitches or supervisor feedback.

If no rights status is provided, treat all clearance questions as open.

## Package

1. Identify the track, artist, genre, mood, tempo, lyric themes, versions,
   existing assets, and target sync world.
2. Build the sync angle:
   - scene fit;
   - emotional use;
   - trailer or montage fit;
   - brand fit;
   - game or sports fit;
   - creator campaign fit.
3. Check package readiness:
   - master file;
   - instrumental;
   - clean version;
   - stems if available;
   - lyrics;
   - credits;
   - splits;
   - sample status;
   - contact path;
   - public/private links.
4. Separate confirmed facts from clearance questions.
5. Stop at a clean review package. Do not turn sync prep into a Suede promo CTA,
   placement promise, clearance claim, or outreach claim.

## Failure Modes

- **Missing master or instrumental**: flag in Asset checklist as blocker. Do not complete the sync angle without at minimum a master file path confirmed.
- **Unresolved sample**: mark sample status as "OPEN — do not pitch until cleared." Do not generate pitch copy for tracks with unresolved samples.
- **Unknown splits or ownership**: flag in Clearance questions. The package can be built but must include the caveat: "Rights holder confirmation required before placement."
- **No contact path**: the package is complete but note: "No contact path identified — supervisor cannot follow up."
- **Scope creep**: if the request becomes a Suede promo funnel, placement promise, or clearance claim, stop and restate the boundary: "This skill prepares review-ready materials. It does not clear rights, confirm placement, or generate outreach."

## Public Copy Gate

Before outputting one-sheet copy, pitch email, captions, DMs, press angles,
site copy, bios, CTAs, or review language, run the Suede anti-slop line edit.
Name the actor, preserve the concrete track/release artifact, cut
throat-clearing, negative listing, fake intensity, lazy extremes, passive
actor-hiding, pull-quote slogans, generic AI phrasing, unsupported claims, and
em dashes.

## Output

```text
Sync positioning:
Best scenes:
Mood tags:
Lyric flags:
Asset checklist:
Confirmed rights facts:
Clearance questions:
One-sheet copy:
Pitch email:
Next review step:
```

## Routing

After completing a sync package:
- Rights gaps or missing provenance → **suede-rights-audit**, then **suede-rights-passport** for a full transfer package
- Full artist campaign needed → **suede-campaign-in-a-box**
- Release metadata gaps → **suede-release-linter**
- Public copy for the package → **suede-copy** or **johnny-suede-write**
