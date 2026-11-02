# Frametell: editorial feature

Reviewed source: [`sitor-ai/frametell@63d598fa9aed1e6fe0cf8ef37a32a5a8eb437e74`](https://github.com/sitor-ai/frametell/tree/63d598fa9aed1e6fe0cf8ef37a32a5a8eb437e74), committed November 1, 2026. The feature is published at `/featured/#frametell` with a feature date of November 2, 2026, and carries the featured README badge for that section.

## What it does

Frametell is a local app that turns an idea or a user's material into a narrated explainer video. One sentence is enough to start, or the user can supply notes, documents, PDFs, slides, images and Markdown. A director agent drafts a storyboard of pages and story beats for the user to approve or edit. It then writes the narration, voices it with ElevenLabs (or Volcengine TTS for Chinese), draws each page in a chosen style and checks each one with lint and screenshots. A final check on the full video precedes a 1080p MP4 render with subtitles and publishing notes. The app shows what the agent is doing, with cost and time on screen at every step. Built-in styles are `warm-story`, `study`, `chalkboard`, `whiteboard` and `tech-dark`.

## Platform and setup

- The desktop app is published for macOS on Apple Silicon as a signed and notarized `.dmg` on the repository's releases page. Chrome, Edge or Chromium must be installed; Frametell uses it to draw and render pages.
- The user adds a key for a model provider under Settings (Anthropic, OpenAI, Google, DeepSeek, OpenRouter and other providers, or any OpenAI- or Anthropic-compatible endpoint) and an ElevenLabs key for the voiceover.
- Windows and Intel Macs run Frametell from source with Node.js 22.19 or later, pnpm and a Chromium-family browser; FFmpeg is bundled.
- The app runs locally with the user's own keys. Requests go to the model and voice providers the user configures.

## License and scope

The repository's [`LICENSE`](https://github.com/sitor-ai/frametell/blob/63d598fa9aed1e6fe0cf8ef37a32a5a8eb437e74/LICENSE) is the GNU Affero General Public License v3.0 (AGPL-3.0), and it covers the local app in this repository. The README permits use, modification and commercial use under those terms, requires a network-offered modified version to make its source available under the same license, and offers a separate commercial license by email. `THIRD_PARTY_NOTICES.md` records that bundled components such as FFmpeg keep their own licenses.

This feature covers the local app source at the pin. Any separately hosted Sitor AI service is outside this review; the AGPL-3.0 terms and the capabilities described here are those of the local app.

## Review method

The README, license and third-party notices at the pin were read as data. The app was not downloaded, no repository code was executed and no provider key was used.

## Outcome

Accepted for an editorial feature at `/featured/#frametell` with the featured README badge snippet. Frametell is an app rather than a scored skill, so the feature carries no catalog score or grade. Editorial selection is independent of quality scoring and README-badge verification; no promotion verification record is created.
