# What is the best agent skill stack for video, images and audio?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** [image](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#image) from coreyhaines31/marketingskills (88/100) turns your agent into an AI image generator for marketing work, creating and editing images with the generator you name. [remove-background](https://skills.suedeai.ai/directory/bria-ai/bria-skill/remove-background/) from Bria-AI/bria-skill (86/100) cuts them out with Bria RMBG 2.0, and [vox-director](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/) from Alisa0808/vox-director (85/100) is the AI video generator: one topic in, an explainer or ad video out. capcut-edit edits and cuts shorts, blog-audio narrates posts, creative-director supplies the concept, and claude-real-video-for-agents lets the agent watch what it made.

## The stack

Seven skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [image](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#image) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | Creates, edits and optimizes marketing images such as blog heroes, social graphics, product mockups, banners and OG images, with tools like Flux, GPT Image, Gemini and Recraft. |
| [remove-background](https://skills.suedeai.ai/directory/bria-ai/bria-skill/remove-background/) | [Bria-AI/bria-skill](https://github.com/Bria-AI/bria-skill) | 86/100 | Removes backgrounds from images to produce transparent PNGs, cutouts and masks by segmenting foreground from background, using Bria RMBG 2.0. |
| [capcut-edit](https://skills.suedeai.ai/directory/renezander030/capcut-cli/capcut-edit/) | [renezander030/capcut-cli](https://github.com/renezander030/capcut-cli) | 85/100 | Edits CapCut and JianYing video projects, including subtitles, timing, speed, volume, templates, animations, and cutting long-form video into shorts. |
| [vox-director](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/) | [Alisa0808/vox-director](https://github.com/Alisa0808/vox-director) | 85/100 | Turns one topic into a Vox-style paper-collage explainer or ad video, automating script, motion, voice-over, music and captions via Atlas Cloud and ffmpeg. |
| [blog-audio](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/blog-audio/) | [infrasity-labs/dev-gtm-claude-skills](https://github.com/infrasity-labs/dev-gtm-claude-skills) | 82/100 | Generates MP3 narration of blog posts with Google Gemini text-to-speech, including summaries, full read-alouds and two-speaker podcast mode, with HTML5 embed code. |
| [creative-director](https://skills.suedeai.ai/directory/smixs/creative-director-skill/creative-director/) | [smixs/creative-director-skill](https://github.com/smixs/creative-director-skill) | 81/100 | Generates creative concepts using SIT, TRIZ and lateral thinking, scores them against six weighted criteria, and refines them recursively to a 9+ threshold. |
| [claude-real-video-for-agents](https://skills.suedeai.ai/directory/huangchihhungleo/claude-real-video/claude-real-video-for-agents/) | [HUANGCHIHHUNGLeo/claude-real-video](https://github.com/HUANGCHIHHUNGLeo/claude-real-video) | 80/100 | Installs and uses the crv tool so an agent can watch videos by extracting deduplicated scene-aware keyframes and transcribing audio. |

## Who this stack is for

This stack is for small teams that make media without a studio. A founder who needs a launch explainer by Friday. A content marketer who wants every blog post to ship with a hero image, social cutouts and an audio version. A video editor tired of hand-timing subtitles in CapCut. An agency strategist who needs three campaign concepts before anyone opens an editor.

It suits people who already run Claude Code, Codex or Cursor and would rather describe a deliverable than click through five apps. All seven skills use the [Agent Skills](https://agentskills.io/) format, so the same folders work in each of those agents and any other that reads a SKILL.md.

It is not a substitute for a shoot. The picks generate, cut, narrate and review; they do not film anything. Several also call paid APIs, so it fits teams that can hold a few accounts and keep keys out of the repository.

## The Suede AI skill built for this job

I built [suede-video](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-video) for exactly this job: turning a demo, a launch or a topic into a marketing video you can ship, and turning that into a repeatable production pipeline. Ask it to "turn this demo into a short video" and it plans the whole piece: the script, the storyboard, the shot and asset lists, consent-aware choices about AI footage and avatars, the edit decisions and pacing, the export specs and the video-search metadata. It produces through programmatic rendering when the job calls for it.

Start with it. suede-video owns the plan, and the third-party skills below execute pieces of it. The concept from [creative-director](https://skills.suedeai.ai/directory/smixs/creative-director-skill/creative-director/) becomes a script and storyboard. The asset list tells [vox-director](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/) what to render and [capcut-edit](https://skills.suedeai.ai/directory/renezander030/capcut-cli/capcut-edit/) where to cut. The export specs decide the sizes of every short. Still images stay with [image](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#image) and [remove-background](https://skills.suedeai.ai/directory/bria-ai/bria-skill/remove-background/), and nothing publishes without approval.

It is Suede AI's skill, so it stays out of the ranking on this page. Install it before the rest of the stack:

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-video
```

## The skills, one by one

### image: marketing stills from the generator you choose

[image](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#image) creates, generates, edits and optimizes images for marketing: blog heroes, social graphics, product mockups, profile banners, listing visuals and brand assets. Its description names the tools it responds to, including Flux, Flux Kontext, Midjourney, DALL-E, GPT Image, Ideogram, Gemini image, Nano Banana, Recraft and Stable Diffusion, and it covers the unglamorous half of the job too: image optimization, compression, WebP and OG images.

It draws its own boundaries. Paid ad creative with platform-specific specs belongs to a sibling skill called ad-creative, and video production belongs to one called video. This skill is general-purpose marketing image work, which is most of what a content team needs. The directory has no full page for it yet, so its files are not summarized here; read the SKILL.md in the repository before you run it.

It is MIT licensed, with about 91,000 installs recorded by skills.sh, the most in this stack by a wide margin. That count is a reason to trust its shape, not a reason to skip reading it.

A prompt that names the output and the size:

```text
Create a blog hero for our post on pricing pages, 1600 by 900, in our brand colors, then export a compressed WebP and an OG image version.
```

### remove-background: transparent cutouts in one step

[remove-background](https://skills.suedeai.ai/directory/bria-ai/bria-skill/remove-background/) removes backgrounds from images to produce transparent PNGs, cutouts and masks, powered by Bria RMBG 2.0. Its description is emphatic that it should win over general image skills whenever the main task is a background: product cutouts for e-commerce, headshots, batch removal or isolating an object.

The SKILL.md routes between three modes, plain, guided and extract-object, and its guided removal lets you keep, drop or narrow what stays in the frame. Setup is a real step: check for existing credentials, authenticate through device authorization, then verify billing status and resolve an API key. Its files read BRIA_API_KEY and document BRIA_ACCESS_TOKEN and REFRESH_TOKEN, and it ships one shell script as a client example.

Reach for it the moment a still needs to sit on a new background, before the image goes into a video or a social layout. Do not use it to generate the image in the first place. It is MIT licensed with about 200 installs recorded by skills.sh.

A prompt for a batch job:

```text
Remove the backgrounds from the twelve product shots in assets/products and save transparent PNGs with the same filenames.
```

### capcut-edit: the AI video editor for CapCut projects

[capcut-edit](https://skills.suedeai.ai/directory/renezander030/capcut-cli/capcut-edit/) is the closest thing in this stack to an AI video editor. It reads and writes CapCut and JianYing project files (draft_content.json and draft_info.json): subtitles, timing, speed, volume, templates, animations such as fades and Ken Burns moves, and cutting long-form video into shorts. It responds in English or Chinese.

Its SKILL.md is built around one principle, deterministic scripts, with sections on project locations, output modes, batch writes and invariants. Seven shell scripts do the edits, including fade-in.sh, fade-out.sh, ken-burns.sh and anim.sh, and the directory's read found no network calls and no environment variables. Everything happens on your project files.

Use it after a render, not instead of one, and keep a copy of the draft before a batch write. It is at its best on the tedious parts: retiming subtitles, adjusting volume across clips, and cutting one long video into several shorts without opening the editor. It is MIT licensed with about 900 installs recorded by skills.sh.

A prompt for the tedious part:

```text
Open the CapCut draft for episode 12, cut three 45-second shorts from the strongest segments, burn in subtitles and add a fade-in to each.
```

### vox-director: one topic in, an explainer video out

[vox-director](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/) turns one topic into a Vox-style paper-collage explainer or ad video, end to end, on the Atlas Cloud API and local ffmpeg: script, collage keyframes, motion, voice-over, music and captions. It takes three kinds of input: a topic (B-roll), a talking-head video (A-roll mode), or a single photo of a person or product anchored into the collage (C-roll mode). A host mode puts a presenter on camera.

The SKILL.md covers prerequisites, a standard topic-to-film workflow, shot cadence, a beats.json schema, and model selection with the instruction to verify model IDs live. It bundles 22 Python scripts, reads ATLASCLOUD_API_KEY, and talks to api.atlascloud.ai and www.atlascloud.ai.

Use it when the format fits: collage explainers, scrapbook-style tributes and punchy narrated ads. It is an AI video generator built around one style, collage, not a general-purpose one. Treat the first render as a draft. It is MIT licensed with about 200 installs recorded by skills.sh.

A prompt that sets the length and the mode:

```text
Make a 60-second Vox-style collage explainer on why shipping containers changed trade. Use topic mode, captions on, and show me beats.json before rendering.
```

### blog-audio: narrated versions of every post

[blog-audio](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/blog-audio/) generates audio narration of blog posts with Google Gemini text-to-speech. It does three modes, a summary narration, a full read-aloud, and a two-speaker podcast or dialogue mode, with 30 voice options, and it outputs an MP3 plus HTML5 audio embed code.

The SKILL.md walks a six-step generation workflow (read the post, choose the mode, prepare the text, select a voice, generate, deliver) and an embedding guide for Hugo, Jekyll, static sites and MDX in Next.js or Gatsby. Four Python scripts do the work through a run.py wrapper, and it reads GOOGLE_AI_API_KEY or GEMINI_API_KEY. Per its description, it falls back gracefully when no key is configured.

I would add it to any blog that already publishes on a schedule; an audio version costs one command per post, and the embed code drops straight into the template. Skip it for fiction or anything where a synthetic voice would undercut the piece. It is MIT licensed with about 100 installs recorded by skills.sh.

A prompt in podcast mode:

```text
Turn content/posts/pricing-pages.md into a two-speaker podcast version, pick contrasting voices, and give me the MP3 and the embed code for our Hugo site.
```

### creative-director: the concept before the render

[creative-director](https://skills.suedeai.ai/directory/smixs/creative-director-skill/creative-director/) generates creative concepts with SIT, TRIZ, lateral thinking and bisociation, scores them against six weighted criteria with Cannes, D&AD and HumanKind calibration, and refines recursively until a concept clears a 9+ threshold. It accepts briefs as text, voice transcripts, PDFs or raw notes, and it calibrates against a library of 569 legendary campaigns to detect saturation.

The SKILL.md runs five phases: intake, insight, ideation, evaluate and refine, then articulate. Its references hold a creative constitution, an insight-mining guide and a campaign library indexed by budget, emotion, format and industry. Three Python scripts ship with it, and the directory's read found no network calls.

Use it at the very start, when the question is what to make, and give it a real brief rather than a single line. Its description rules out media planning, production budgeting, logo design, final copy and market research. It is licensed CC-BY-4.0, not MIT, with about 1,000 installs recorded by skills.sh.

A prompt with a real brief:

```text
Here is our brief for a spring campaign for a budgeting app. Run the full cycle and give me the three strongest concepts with their scores and the insight behind each.
```

### claude-real-video-for-agents: letting the agent watch its own output

[claude-real-video-for-agents](https://skills.suedeai.ai/directory/huangchihhungleo/claude-real-video/claude-real-video-for-agents/) installs and uses crv, a tool that lets an agent watch a video by extracting scene-aware keyframes, deduplicating them and transcribing the audio. Point it at a video URL or a file and the agent can analyze, summarize or discuss it.

The SKILL.md covers installing crv and its prerequisites, then usage: watching from a URL, a recommended mode with a grid and an intent, local files with transcripts, a frames-only mode that is much faster, login-gated video, slow-changing content such as animations and tutorials, and saving to a knowledge base. There are no bundled scripts; it runs pip install and brew install to set itself up.

This is the review step most media workflows skip. Have the agent watch the [vox-director](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/) render or the [capcut-edit](https://skills.suedeai.ai/directory/renezander030/capcut-cli/capcut-edit/) shorts and check them against the script before a person does. Skip the transcript when you only need to check the visuals. It is MIT licensed with about 500 installs recorded by skills.sh.

A prompt for a self-review:

```text
Watch renders/explainer-v1.mp4 in frames-only mode and list every scene where the captions do not match the script in script.md.
```

## How to use the stack together

1. Start with the idea in [**creative-director**](https://skills.suedeai.ai/directory/smixs/creative-director-skill/creative-director/). Let it score and refine concepts until one clears its 9+ threshold. A weak concept is an expensive render.
2. Make the stills with [**image**](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#image): heroes, social graphics, mockups and OG images, with the generator you already use. Optimize them to WebP in the same pass.
3. Cut out subjects with [**remove-background**](https://skills.suedeai.ai/directory/bria-ai/bria-skill/remove-background/). Transparent PNGs drop into social layouts and into the video as overlays.
4. Produce the video with [**vox-director**](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/). Check beats.json before you render, then treat the first render as a draft.
5. Edit with [**capcut-edit**](https://skills.suedeai.ai/directory/renezander030/capcut-cli/capcut-edit/): subtitles, timing, volume and fades. Cut the shorts from the long version rather than rendering each one separately.
6. Add the audio version with [**blog-audio**](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/blog-audio/). The companion post gets an MP3 and an embed in one step.
7. Review with [**claude-real-video-for-agents**](https://skills.suedeai.ai/directory/huangchihhungleo/claude-real-video/claude-real-video-for-agents/). Have the agent watch every render and short before you do.

## Install the stack

```bash
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/image
npx skills add https://github.com/Bria-AI/bria-skill/tree/dev/skills/remove-background
npx skills add https://github.com/renezander030/capcut-cli/tree/master/skills/capcut-edit
npx skills add https://github.com/Alisa0808/vox-director
npx skills add https://github.com/infrasity-labs/dev-gtm-claude-skills/tree/main/writing-skills/blog-audio
npx skills add https://github.com/smixs/creative-director-skill/tree/main/creative-director
npx skills add https://github.com/HUANGCHIHHUNGLeo/claude-real-video/tree/master/skills/claude-real-video-for-agents
```

The [skills CLI](https://skills.sh/) installs each skill for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [generate-image](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#generate-image) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 93/100 | You want one route to several models through the OpenRouter Image API, for illustrations, concept art and reference-based edits. |
| [infographics](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#infographics) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 89/100 | The still is data, not a scene: timelines, comparisons and statistical summaries with ten layouts. |
| [create-image-fal](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/create-image-fal/) | [gooseworks-ai/goose-skills](https://github.com/gooseworks-ai/goose-skills) | 86/100 | You generate through FAL models such as nano-banana edit, gpt-image and flux, billed through the fal-proxy. |
| [video-remove-background](https://skills.suedeai.ai/directory/bria-ai/bria-skill/video-remove-background/) | [Bria-AI/bria-skill](https://github.com/Bria-AI/bria-skill) | 86/100 | The subject is moving: it produces transparent video and alpha-channel clips without green-screen footage. |
| [render-hook-replacement](https://skills.suedeai.ai/directory/gooseworks-ai/goose-skills/render-hook-replacement/) | [gooseworks-ai/goose-skills](https://github.com/gooseworks-ai/goose-skills) | 86/100 | You want to test a new opening on a finished video while keeping and verifying the original body, audio and captions. |

[generate-image](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#generate-image) scores higher than the [image](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#image) pick, 93/100 against 88/100. I keep image in the stack because it is written for marketing deliverables, with optimization and OG images in scope; generate-image suits illustration and concept art. Pick by the deliverable, not the number.

## Common mistakes

- Rendering before the concept is settled. [creative-director](https://skills.suedeai.ai/directory/smixs/creative-director-skill/creative-director/) is cheap; a re-render is not.
- Generating a new image when a cutout would do. [remove-background](https://skills.suedeai.ai/directory/bria-ai/bria-skill/remove-background/) reuses the product shot you already have.
- Rendering every short separately. [capcut-edit](https://skills.suedeai.ai/directory/renezander030/capcut-cli/capcut-edit/) cuts them from one long version, so pacing and color stay consistent.
- Shipping the first render. [vox-director](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/) is a draft machine; review and cut before publishing.
- Skipping review. [claude-real-video-for-agents](https://skills.suedeai.ai/directory/huangchihhungleo/claude-real-video/claude-real-video-for-agents/) lets the agent catch caption and script mismatches first.
- Committing API keys. BRIA_API_KEY, ATLASCLOUD_API_KEY and the Gemini keys belong in your environment, never in the repository.

## Licenses, costs and checks before you install

Six of the seven picks are MIT licensed. [creative-director](https://skills.suedeai.ai/directory/smixs/creative-director-skill/creative-director/) is CC-BY-4.0, an open license that requires attribution. None is proprietary.

The costs sit in the services. [remove-background](https://skills.suedeai.ai/directory/bria-ai/bria-skill/remove-background/) reads BRIA_API_KEY and its setup verifies billing status. [vox-director](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/) reads ATLASCLOUD_API_KEY and calls the Atlas Cloud API. [blog-audio](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/blog-audio/) reads GOOGLE_AI_API_KEY or GEMINI_API_KEY. [claude-real-video-for-agents](https://skills.suedeai.ai/directory/huangchihhungleo/claude-real-video/claude-real-video-for-agents/) runs pip install and brew install on your machine. The [image](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#image) skill has no full directory page, so its files are not summarized; check which generator account it expects.

The directory has not security scanned any listed skill; [read how it handles trust](https://skills.suedeai.ai/directory/trust/). Read each SKILL.md before you enable it.

## Related topics and stacks

Browse the topics behind these picks: [Image Generation](https://skills.suedeai.ai/directory/topics/image-generation/) (16 listed skills), [AI Video Generation](https://skills.suedeai.ai/directory/topics/video-generation/) (18), [Video Editing](https://skills.suedeai.ai/directory/topics/video-editing/) (10), [Background Removal](https://skills.suedeai.ai/directory/topics/background-removal/) (5) and [Short-Form Clips and Reels](https://skills.suedeai.ai/directory/topics/short-form-clips/) (7), all in the [Video, Image, Audio and Creative](https://skills.suedeai.ai/directory/media-creative/) category.

For adjacent work, the [motion graphics stack](https://skills.suedeai.ai/directory/stacks/motion-graphics/) covers code-driven animation, the [content and social stack](https://skills.suedeai.ai/directory/stacks/content-and-social/) writes the posts these assets ride on, and the [infographics and diagrams stack](https://skills.suedeai.ai/directory/stacks/infographics-and-diagrams/) handles data visuals.

## FAQ

### What is the best AI image generator skill for Claude Code?

For marketing work, [image](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#image) from coreyhaines31/marketingskills (88/100). It creates and edits blog heroes, social graphics, mockups, banners and OG images, responds to tools such as Flux, GPT Image, Gemini and Recraft, and handles compression and WebP. It has about 91,000 installs recorded by skills.sh. For illustration or concept art, [generate-image](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#generate-image) (93/100) routes through the OpenRouter Image API.

### Can Claude Code be an AI video generator?

Yes, with [vox-director](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/) (85/100). It turns one topic into a Vox-style paper-collage explainer or ad video, automating the script, motion, voice-over, music and captions through the Atlas Cloud API and local ffmpeg. It is built around one style, collage, and its files read an ATLASCLOUD_API_KEY. Treat the first render as a draft.

### Will I get a finished video from one prompt?

[vox-director](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/)'s summary says it automates the script, motion, voice-over, music and captions from one topic. Whether what comes out is finished is a judgment you make after watching it, which is why [claude-real-video-for-agents](https://skills.suedeai.ai/directory/huangchihhungleo/claude-real-video/claude-real-video-for-agents/) and [capcut-edit](https://skills.suedeai.ai/directory/renezander030/capcut-cli/capcut-edit/) are in the stack: review, then cut.

### Is there an AI video editor skill?

[capcut-edit](https://skills.suedeai.ai/directory/renezander030/capcut-cli/capcut-edit/) (85/100) edits CapCut and JianYing projects directly: subtitles, timing, speed, volume, templates, fades, Ken Burns moves, and cutting long-form video into shorts. Its seven shell scripts work on your project files, and the directory found no network calls in them. It is MIT licensed.

### Do these skills work in Codex and Cursor?

Yes. All seven use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### What about music?

[vox-director](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/) adds music as part of its automated pipeline. None of the seven picks composes music on its own; bring a specific track to the edit in [capcut-edit](https://skills.suedeai.ai/directory/renezander030/capcut-cli/capcut-edit/), which handles volume and timing. The [image](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#image) skill is the most installed pick here; the video skills have far fewer installs recorded, so read their SKILL.md files with that in mind.
