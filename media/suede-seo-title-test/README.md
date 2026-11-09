# Suede SEO: title-testing explainer video

A 36-second vertical video (1080×1920, 30fps, with an original synthesized music bed) that walks through a 14-day title-testing cycle.
It is styled after suedeai.directory: black canvas, Geist / Geist Mono / Pixelify Sans, and the grade colors.

- `suede-seo-title-test.mp4`: the rendered video
- `index.html`: the animation source. Each frame is drawn by `render(t)`
- `render.js`: renders the frames with Playwright and pipes them into ffmpeg
- `logo.png`: the approved Suede S mark (copy of `docs/assets/suede-ai-logo-transparent.png`)


## Re-render

Requires Node with Playwright (Chromium), ffmpeg, and network access to load the Google Fonts.

```bash
node render.js "$PWD" "$PWD/suede-seo-title-test.mp4"
# stills only, at chosen seconds:
node render.js "$PWD" "$PWD/still" "3.6,12,26.5"
```

## Music

`music.py` synthesizes the original 120 BPM bed (numpy only). To rebuild the soundtrack:

```bash
python3 music.py music.wav
ffmpeg -i suede-seo-title-test.mp4 -i music.wav -map 0:v -map 1:a -c:v copy -c:a aac -shortest out.mp4
```
