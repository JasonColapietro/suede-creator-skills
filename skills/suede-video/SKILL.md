---
name: suede-video
description: "Suede AI Video Skills. Plan or produce marketing video with scripts, storyboards, shot and asset lists, consent-aware AI or avatar choices, programmatic rendering, edit decisions, pacing, export specs, and video-search metadata. Use when asked to \"turn this demo into a short video\" or build a repeatable production pipeline. NOT FOR: social calendars or clip-to-guide bridges (use suede-social), paid ad concepts (use suede-ad-creative), still images (use suede-image), or unapproved publishing."
metadata:
  display-name: "Suede AI Video Skills"
  version: 2.2.0
---

# Suede AI Video Skills

## Compatibility

Planning works from supplied media and product evidence. Rendering, generation, avatars, and frame inspection depend on discovered authorized tools; otherwise return the documented manual editor handoff.

For a concrete input, expected handoff, and failure check, read
[the worked handoff](references/worked-handoff.md).

This skill turns an approved message and rights-cleared source material into
scripts, storyboards, generation plans, edit systems, and reusable production
pipelines. It keeps likeness, licensing, brand assets, render cost, and
publishing as explicit gates rather than assumptions.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):

### 1. Video Goal
- What type of video? (Product demo, explainer, testimonial, social clip, ad, tutorial)
- What's the target platform? (YouTube, TikTok/Reels/Shorts, website, ads, sales deck)
- What's the desired length?

### 2. Production Approach
- Do you need a human presenter? (AI avatar vs. voiceover vs. screen recording)
- Do you have existing footage or assets? (Screenshots, logos, product UI)
- Do you need generated footage? (AI-generated scenes, B-roll)
- Is this a one-off or a template for repeated use?

### 3. Tool and Budget Context
- Which video, renderer, generator, avatar, or editor tools are currently
  callable and authorized? Discover them; do not ask the user to list keys.
- What is the approved maximum cost and data-handling boundary?
- Do not ask the user to paste API keys or secrets into the conversation.

---

## Choosing Your Approach

Choose the production method from the job, available evidence, rights, and
currently callable tools:

| Approach | Candidate fit | Tools to evaluate | Use when |
|----------|---------------|-------------------|----------|
| **Programmatic** | Templated, data-driven, batch video | An installed HTML/CSS or React renderer | The format repeats and deterministic output matters |
| **AI generation** | Original footage from text/image prompts | Any currently authorized generation model | The scene cannot be filmed practically and output rights are verified |
| **AI avatars** | Approved presenter without filming | Any currently authorized avatar platform | Consent, likeness, voice, localization, and output rights are documented |
| **Editing/repurposing** | Cutting long-form into short clips | Any installed transcript or timeline editor | Source media and derivative-use rights are available |

---

## Programmatic Video

Programmatic video is a candidate for repeatable, templated, or data-driven
work; verify fit against the current stack, edit needs, cost, and review burden.

### HTML/CSS renderer candidate

Hyperframes may fit an HTML/CSS workflow. First check whether it is installed.
If it is, read the installed version's documentation, inspect its license, and
confirm the renderer and export path. If it is not installed, use a
renderer-neutral handoff or request explicit installation authorization after
showing the current package source, version, lockfile impact, and cost. These
commands download and run the package; none may run without that authorization:

```bash
npx hyperframes init my-video        # scaffold a project (Node 22 or later)
npx hyperframes preview              # local studio for the HTML composition
npx hyperframes render -c ./my-composition.html -o output.mp4
```

**Key concept:** The composition is an HTML document driven by the
`hyperframes` CLI; the package exposes no `render()` import. Edit the HTML,
preview it, then render to MP4. Run `npx hyperframes lint` before a render.

**Candidate fit:** Product announcements, changelogs, data-driven reports, and
approved personalized outreach videos. Verify determinism with a repeat-render
test instead of assuming it.

### React renderer candidate

Remotion may fit a React-based workflow. Verify the installed or callable
version, current documentation, license, rendering path, and hosting cost. The
scaffold command may install packages or create files; run it only with explicit
authorization for that change, otherwise provide a renderer-neutral plan:

```bash
npx create-video@latest
```

**Key concept to verify:** React components express timed visuals and props
drive content. Confirm whether rendering is local or uses an authorized hosted
renderer.

Read
[references/programmatic-renderers.md](references/programmatic-renderers.md)
when the repo already uses React, or when the choice between the HTML/CSS and
React paths has to be justified: it carries the React component sample and the
renderer selection table.

---

## AI Video Generation

Generate original footage from text or image prompts. Use for B-roll, hero visuals, and scenes you can't practically film.

Discover currently callable and authorized models before recommending one; the
comparison criteria and the generation-vs-stock tests are in
[references/tool-evaluation.md](references/tool-evaluation.md). If no model is
callable and authorized, return a shot list, prompt set, reference-frame brief,
and manual vendor-evaluation checklist.

### Prompting for Video Models

Good video prompts specify: **subject + action + camera + style + mood**

```
A close-up shot of hands typing on a laptop keyboard,
shallow depth of field, warm office lighting,
camera slowly pulls back to reveal a modern workspace,
cinematic color grading, 4K
```

**Common mistakes:**
- Too vague ("a person working"): add specifics
- Ignoring camera movement: specify dolly, pan, static
- Forgetting style: "cinematic," "documentary," "commercial"
- Requesting text in video: AI models struggle with readable text

**For detailed prompting guides**: See [references/ai-video-prompting.md](references/ai-video-prompting.md)

---

## Avatars, Editing Tools, and Production Workflows

Read [references/tool-evaluation.md](references/tool-evaluation.md) once an
approach is chosen and before naming or recommending any vendor: it holds the
model comparison criteria, the generation-vs-stock tests, avatar evaluation and
consent tests, the editing and repurposing tool checks, the repurposing
workflow, and the reverse-engineer-a-viral-edit method (full method in
[references/edit-anatomy.md](references/edit-anatomy.md)). Read
[references/production-workflows.md](references/production-workflows.md) for
the step lists for a product demo, an explainer, or batch social clips.

---

## Tool-Aware Video Pipeline

Use automation only after discovering currently callable, authenticated, and
authorized tools. Otherwise produce the same artifacts as a manual handoff.

```
Approved script (from product context)
    ↓
Available renderer/avatar/generator, if authorized
    or manual editor with timecoded instructions
    ↓
Review cut, rights, captions, and brand assets
    ↓
Output: Approved export candidate, not automatically published
```

When no production tool is available, return the script, shot list, asset
manifest, beat sheet, captions, edit decision list, and export settings so the
user can execute the cut manually, in these exact headings:

```markdown
## Script
<scene or beat> | on-camera or VO line | duration target

## Shot List
Shot # | source (screen capture / owned footage / licensed / generated) | framing | notes

## Asset Manifest
Asset | origin | rights basis and holder | expiry or attribution required | file path

## Beat Sheet
Use the row schema in references/edit-anatomy.md (Beat | Time | Shot |
On-screen text | Caption style | Transition/motion | Audio) plus its style
summary. Do not invent a second beat-sheet format.

## Captions
Full caption text with timecodes; state the accuracy check performed.

## Edit Decision List
Clip # | source file | in TC | out TC | placement | transition | audio bed

## Export Settings
Destination | ratio | resolution | frame rate | codec | max duration | verified
against (current spec source + date)

## Open Gates
<missing rights, consent, cost approval, or brand asset; use the halt contract>
```

For the beat sheet and its style summary, read
[references/edit-anatomy.md](references/edit-anatomy.md) before writing the
handoff: it owns that row schema.

---

## Export Specs and Video Search

Verified platform facts (October 2026):

| Destination | Fact | Source |
|---|---|---|
| YouTube Shorts | Up to 3 minutes for square or vertical uploads made on or after Oct 15, 2024. Over 1 minute with an active Content ID claim, the Short is blocked worldwide. | https://support.google.com/youtube/answer/15424877 |
| Instagram Reels | Up to 3 minutes; profile grid previews crop to 3:4, so keep the subject inside a 3:4 safe area of the 9:16 frame | Instagram announcement, January 2025 |
| Performance Max | Supply your own 16:9, 1:1, and 9:16 videos of 10 seconds or more, or Google may auto-generate one | https://support.google.com/google-ads/answer/17091269 |

For other destinations, read the current upload spec and preview the
authenticated composer before choosing ratio, resolution, or duration.

**Make the video findable.** A video that answers a question people search can
earn views for years on YouTube and in Google's video results. For any video
meant to be found:

1. **Title:** the search phrase and the promise, phrase first, under about 70
   characters so it is not truncated in results.
2. **Description:** the first two lines restate the answer in plain words; the
   rest adds links and context.
3. **Chapters:** timestamps starting at 0:00 with descriptive names, which
   Google can show as key moments.
4. **Captions and transcript:** upload accurate captions instead of relying on
   auto-captions, and publish the transcript on the page that embeds the video.
5. **Embed on an owned page** with `VideoObject` JSON-LD (name, description,
   thumbnailUrl, uploadDate, duration, contentUrl or embedUrl) and the video
   visible on load, so the page itself can rank and be cited in AI answers.
6. **Thumbnail:** one readable idea at small size; real product UI, never a
   fabricated one.

When the video must lead viewers to a written guide, route to
`suede-social` (Clip-to-Guide mode). For site-level video indexing and schema audits, route to
`suede-seo-audit`.

---

## Common Mistakes

1. **Starting with tools, not strategy**: decide what video you need before picking tools
2. **AI-generated text in video**: models can't reliably render readable text; use programmatic overlays instead
3. **Unverified avatar quality**: test a short consented sample before paying
   for or producing a batch
4. **Inaccessible cut**: provide accurate captions without asserting a
   universal sound-off viewing rate
5. **Unverified export spec**: read current destination requirements and
   preview the actual composer before choosing ratio, resolution, or duration
6. **Unsupported production-style claim**: compare polished and informal
   treatments on the current account instead of claiming one universally wins

---

## Halt Contract

Use this exact format when tool authorization, cost approval, rights, consent,
or an approved brand asset blocks the requested result, including the install
and scaffold gates above and the brand-mark gate in Boundaries:

```text
HALT: <one-line blocker>
Why it blocks: <specific missing authority or evidence>
Resolve with:
1. <option>
2. <option>
3. <option, when useful>
Waiting for: <the exact item or approval>
```

Continue with the manual-handoff artifacts above only when they remain useful
and do not imply the blocker was resolved or that a render occurred.

---

## Boundaries

- Do not generate, render, purchase, upload, or publish media without approval
  of scope, tool cost, rights, and destination.
- Do not clone a real person's voice or likeness, use unlicensed source media,
  or promise an exact copy of a reference style or edit.
- Brand mark: for Suede AI-branded visuals, use only
  `docs/assets/suede-ai-logo-transparent.png` from
  `JasonColapietro/suede-creator-skills` (SHA-256
  `83a7ee0317e4debe2e7b076c20ba067feb76a587f9e829dc6310ae4be4b44dfa`). Outside that checkout,
  fetch the same file from
  `https://raw.githubusercontent.com/JasonColapietro/suede-creator-skills/cbd192309580a32da375881e0eeb4b2450a554c2/docs/assets/suede-ai-logo-transparent.png`
  and verify its SHA-256 before use. Never redraw, trace, typeset, recolor,
  distort, or generate a replacement S. `suede-skill-icon.png` is a Passport
  icon, not the brand mark. Omit the mark and halt for the approved file only
  if the fetch fails or the checksum differs.

## Routing

- Use `suede-social` to choose channel strategy, cadence, and distribution.
- Use `suede-social` (Clip-to-Guide mode) when a clip has to bridge to an
  article, newsletter, or guide.
- Use `suede-ad-creative` for paid video ad concepts and variants.
- Use `suede-image` for still-image generation and editing.
- Use `suede-copy` for source-verified script and messaging polish.
