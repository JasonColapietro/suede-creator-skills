# Social cards

Deterministic HTML source for Suede social graphics, plus their exports.
Authored as HTML and screenshotted rather than generated, because these cards
are text-heavy and an image model garbles command strings like
`/suede-ai-seo`.

| Source | Export | Use |
| --- | --- | --- |
| `card-125.html` | `award-76-skills.png` | The pack — skill count, three sample commands |
| `card.html` | `award-ai-seo.png` | One skill — `/suede-ai-seo` as the hero |
| `card-3.html` | `award-three-pillars.png` | Structure / Authority / Presence, then the CTA |

Built for the Anthropic Skills Competition announcement. As an Instagram
carousel the order is pack → ai-seo → three-pillars: the news, the thing to run,
then the ask.

## Rendering

All three are 1080×1350 (Instagram 4:5). From this directory:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1080,1350 --screenshot=out.png "file://$PWD/card-125.html"
```

## House rules baked in

- **The mark is checksum-gated.** Each card loads
  `../suede-ai-logo-transparent.png`, SHA-256
  `83a7ee0317e4debe2e7b076c20ba067feb76a587f9e829dc6310ae4be4b44dfa`. Never
  redraw, recolor, or substitute it; if the checksum changes, stop.
- **Palette is Anthropic's** (clay `#D97757`, kraft `#D4A27F`, manilla
  `#EBDBBC`, gold `#F5D69A`, ivory `#F0EEE6`) on a slate ground. It runs dark
  rather than Anthropic cream because the Suede S is a light chrome mark and
  disappears on `#F0EEE6`.
- **Edit the HTML, not the PNG.** Re-render after any text change.
- **Don't patch these with regex** across `<div class="grp">` boundaries — a
  non-greedy match silently eats sibling blocks. Edit the markup directly.

## Claims on the cards

The skill count is the pack's `totalSkillCount`, the number of `SKILL.md`
packages under `skills/`. Do **not** count `~/.claude/skills/suede-*` — that
lists installed skills from every source and is a much larger, wrong number.
All three count occurrences are registered in `countChecks` in
`scripts/validate-skill-pack.mjs`, so adding or removing a skill fails
validation; re-render both PNGs when it does.

`50k+` invocations and `40+` SEO firms are owner-supplied and are not
validated.
