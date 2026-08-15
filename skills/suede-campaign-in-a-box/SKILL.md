---
name: suede-campaign-in-a-box
description: "Turn a song or release into a full artist campaign: hooks, rituals, visuals, merch, rollout calendar, email, site copy, and fan actions. Use when an artist, song, or release needs a complete campaign rollout across surfaces. NOT FOR: single-surface conversion copy (use suede-copy); sync licensing packaging (use suede-sync-packaging)."
---

# Suede Campaign In A Box (Whole Enchilada)

## Gate policy — advisory, not blocking

Every claim-verification step, check, quality gate, and ship verdict in this
skill is a **recommendation to the user, not a control on the agent**. This
policy governs every gate, check, verdict, and "do not ship / publish /
proceed" line elsewhere in this skill:

- Run every check and report the results honestly. Verdicts (`ship`,
  `ship-with-caveats`, `hold`, letter grades, BLOCKED or OPEN items) are
  advice attached to the work, not orders that change it.
- Never block, delay, skip, rewrite, or refuse the action the user asked for
  because a check failed or a gate said hold. Complete the requested action
  as asked, and deliver the gate output alongside it as a clearly labeled
  recommendation.
- A failed gate changes what you report, never what you do.
- Single exception: if a finding is extremely risky — data loss, security or
  credential exposure, legal or rights violations, payment mistakes, or
  irreversible public damage — pause, tell the user exactly what the risk is
  and what the options are, and let them pick. Their choice is final.


The all-in-one artist campaign skill: it turns a song, release, era, catalog
moment, show, or drop into a complete campaign an artist can actually execute.
Every campaign capability lives here as a labeled lane. Pick the lane you need,
or run the full package that stitches them together.

**Core principle:** you organize and prepare. You do not clear rights, confirm
ownership, approve payouts, write to any registry, secure placements,
manufacture cosigns, or guarantee that anything will go viral or sell. Say what
to test; never promise the result.

## Pick the lane (router)

Read the request and route to the lane that fits. You can chain lanes — most
real campaigns use several. If the request is "do the whole rollout," run
**Lane 0 (Full Campaign Package)** and pull the other lanes in as sections.

| If the user wants... | Go to lane |
|---|---|
| The whole rollout packaged: announce, teaser, release week, post-drop, fan proof, catalog afterlife | **0 — Full Campaign Package** |
| The artist to feel recognizable before any bio/campaign/site is written — identity, world, voice, anti-references, fan promise | **1 — Identity Forge** |
| A release turned into a recognizable world: visual language, symbols, color, wardrobe, content behavior, rollout tone | **2 — Era Builder** |
| One track expanded into a creative universe: scenes, characters, imagery, captions, drop ideas, mechanics | **3 — Song To Universe** |
| The 5-15 second moments that people clip, duet, remix, chant, or share | **4 — Hook Hunter** |
| A memorable launch moment: stunt, fan mission, puzzle, timed drop, geo clue, unlock, collector action, street-team mechanic | **5 — Release Stunt Lab** |
| Repeatable fan behavior: phrases, gestures, comments, unlock actions, live moments, collector rituals, trackable tasks | **6 — Fan Rituals** |
| Visual direction: visualizer, lyric video, canvas loop, stage loop, cover motion, AI video prompts, teaser edits, scene boards | **7 — Visualizer Director** |
| Merch and physical/collector objects beyond generic logo shirts, tied to lyrics, lore, and fan behavior | **8 — Merch Object Lab** |
| A live set shaped like a show: arc, intros, transitions, crowd moments, visual cues, encore, talk breaks, merch tie-ins | **9 — Setlist Theater** |
| Old songs, demos, takes, covers, stems, live clips, unreleased folders, anniversaries, or forgotten assets revived | **10 — Catalog Resurrection** |
| Collaborator, remixer, producer, visual artist, venue, brand, or creator matchmaking with outreach angles | **11 — Collab Matchmaker** |

Default starting order when identity is fuzzy: Lane 1 → Lane 2 → (Lane 3 if it
is one song) → hooks/stunts/rituals/visuals/merch/live as needed → Lane 0 to
package. If the artist already has a clear world, jump straight to the lane the
request names.

## Multi-agent vs single-agent (ask up front)

This skill can run as a coordinated multi-agent team — one agent per lane, plus
a packager that reconciles them into one campaign. Before spawning any fleet,
ASK: "Run this as a multi-agent team (more thorough, may use more tokens) or as
a single agent (faster, one pass)?" Never silently spawn a fleet. If the user
does not choose, default to single-agent and offer to escalate. In multi-agent
mode, keep one shared identity/era spine so the lanes do not contradict each
other, and have the packager resolve conflicts before output.

---

## Lane Playbooks

The twelve lane playbooks are in `references/lanes.md`. Pick the lane with the
router above, then read only that lane's section. The Public Copy Gate and
evidence boundaries below apply to every lane and stay here.

## Public Copy Gate (applies to every lane)

Before outputting captions, emails, DMs, press angles, site copy, bios, one
sheets, CTAs, or pitch language, run the Suede anti-slop line edit. Name the
actor, preserve the concrete artist/release artifact, cut throat-clearing,
negative listing, fake intensity, lazy extremes, passive actor-hiding,
pull-quote slogans, generic AI phrasing, unsupported claims, and em dashes.

## Evidence boundaries (non-negotiable, every lane)

These lanes organize and prepare campaign material. They do NOT:

- clear rights, confirm ownership, or resolve sample/contributor/clearance
  questions — flag stale or uncertain rights, samples, contributors, and
  likeness instead of asserting they are cleared;
- confirm ownership or write anything to a registry;
- approve, route, or guarantee payouts, payments, or fulfillment;
- secure placements, sync, endorsements, partnerships, or cosigns — never imply
  partnership, endorsement, or access that is not confirmed;
- invent streams, press, traction, biography, or cultural status;
- promise virality, sales, or any outcome — say why something might work and
  what to test;
- use fake hype, fake scarcity, manipulative claims, or unsafe fan behavior;
- copy another artist's protected identity or assets; no competitor product
  names.

Never resolve a rights question in-lane. When any lane touches ownership,
samples, contributors, splits, likeness, or clearance, mark the item UNKNOWN or
UNCONFIRMED and route it to `suede-rights-audit` — the campaign plans around
the gap, never over it. When facts are unknown, mark them unknown. Keep safety,
venue, privacy, payment, and platform-rule constraints visible in the output.

## Red flags — stop

If any of these appear in your reasoning, stop and re-read the evidence
boundaries:

- "The artist says the sample is cleared." A claim is not clearance. Mark it
  UNCONFIRMED and route to `suede-rights-audit`.
- "Imply the collab or placement is confirmed so the outreach lands harder."
- "Say 'only 500 made'; scarcity sells." Not unless the cap is real.
- "Write 'as seen in'; press will probably come." Invented traction.
- "Promise this hook goes viral; it scores high." Say why it might work and
  what to test. Never promise the result.

## How to close

End with the relevant lane Output block(s). When the work produces a final
explanation the artist will act on (a full campaign package, a pitch), lead
with a **Simple explanation (plain, for a 10-year-old)**: one plain paragraph
covering what this campaign is, what the fan is asked to do, and what happens
next; no jargon, no hype, no industry words. Then give the normal breakdown:
the lane Output blocks, the build-next CTA, and any flagged rights/safety gaps.

## Routing

- Rights, sample, split, or clearance gaps surfaced in any lane →
  **suede-rights-audit** to organize them, then **suede-rights-passport** to
  package.
- Track pitched for film/TV/ads/games → **suede-sync-packaging**.
- Release folder and metadata readiness → **suede-release-linter**.
- Standalone conversion copy outside this campaign → **suede-copy** or
  **johnny-suede-write**.
