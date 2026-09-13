# Social cards

Deterministic HTML source for Suede social graphics, plus their exports.
Authored as HTML and screenshotted rather than generated, because these cards
are text-heavy and an image model garbles command strings like
`/suede-ai-seo`.

| Source | Export | Use |
| --- | --- | --- |
| `card-125.html` | `award-125-skills.png` | The pack — 125 skills, three sample commands |
| `card.html` | `award-ai-seo.png` | One skill — `/suede-ai-seo` as the hero |
| `card-3.html` | `award-three-pillars.png` | Structure / Authority / Presence, then the CTA |

Built for the Anthropic Skills Competition announcement. As an Instagram
carousel the order is 125 → ai-seo → three-pillars: the news, the thing to run,
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

Every figure is either counted or supplied by the owner. `125` is the count of
`suede-*` skills in the pack. `50k+` invocations and `40+` SEO firms are
Jason's figures. Update the HTML when any of them moves — two cards carry the
numbers and both need the edit.
