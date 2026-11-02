# What is the best agent skill stack for video, images and audio?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 2, 2026.

**Short answer:** [seo-image-gen](https://skills.suedeai.ai/directory/agricidaniel/claude-seo/seo-image-gen/) from AgriciDaniel/claude-seo (88/100) generates images through Gemini via the nanobanana server, [remove-background](https://skills.suedeai.ai/directory/bria-ai/bria-skill/remove-background/) from Bria-AI/bria-skill (86/100) cuts them out with Bria RMBG 2.0, and [vox-director](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/) from Alisa0808/vox-director (85/100) turns one topic into an explainer or ad video with script, motion, voice-over, music and captions. capcut-edit edits the result and cuts long-form into shorts, blog-audio narrates posts, creative-director supplies the concept, and claude-real-video-for-agents lets the agent watch what it made.

## The stack

Seven skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [seo-image-gen](https://skills.suedeai.ai/directory/agricidaniel/claude-seo/seo-image-gen/) | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | 88/100 | Generates AI images for SEO assets such as social preview images, blog hero images, product photos and infographics, using Gemini through the nanobanana server. |
| [remove-background](https://skills.suedeai.ai/directory/bria-ai/bria-skill/remove-background/) | [Bria-AI/bria-skill](https://github.com/Bria-AI/bria-skill) | 86/100 | Removes backgrounds from images to produce transparent PNGs, cutouts and masks by segmenting foreground from background, using Bria RMBG 2.0. |
| [vox-director](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/) | [Alisa0808/vox-director](https://github.com/Alisa0808/vox-director) | 85/100 | Turns one topic into a Vox-style paper-collage explainer or ad video, automating script, motion, voice-over, music and captions via Atlas Cloud and ffmpeg. |
| [capcut-edit](https://skills.suedeai.ai/directory/renezander030/capcut-cli/capcut-edit/) | [renezander030/capcut-cli](https://github.com/renezander030/capcut-cli) | 85/100 | Edits CapCut and JianYing video projects, including subtitles, timing, speed, volume, templates, animations, and cutting long-form video into shorts. |
| [blog-audio](https://skills.suedeai.ai/directory/infrasity-labs/dev-gtm-claude-skills/blog-audio/) | [infrasity-labs/dev-gtm-claude-skills](https://github.com/infrasity-labs/dev-gtm-claude-skills) | 82/100 | Generates MP3 narration of blog posts with Google Gemini text-to-speech, including summaries, full read-alouds and two-speaker podcast mode, with HTML5 embed code. |
| [creative-director](https://skills.suedeai.ai/directory/smixs/creative-director-skill/creative-director/) | [smixs/creative-director-skill](https://github.com/smixs/creative-director-skill) | 81/100 | Generates creative concepts using SIT, TRIZ and lateral thinking, scores them against six weighted criteria, and refines them recursively to a 9+ threshold. |
| [claude-real-video-for-agents](https://skills.suedeai.ai/directory/huangchihhungleo/claude-real-video/claude-real-video-for-agents/) | [HUANGCHIHHUNGLeo/claude-real-video](https://github.com/HUANGCHIHHUNGLeo/claude-real-video) | 80/100 | Installs and uses the crv tool so an agent can watch videos by extracting deduplicated scene-aware keyframes and transcribing audio. |

## How to use it

1. Start with the idea, using **creative-director**. It generates concepts with SIT, TRIZ and lateral thinking, scores them against six weighted criteria and refines them until they clear a 9+ threshold. A weak concept is an expensive render, so spend the time here; every later step multiplies whatever you decide now.
2. Make the stills with **seo-image-gen**: social preview images, blog hero images, product photos and infographics, generated with Gemini through the nanobanana server. Then run **remove-background** for transparent PNGs, cutouts and masks with Bria RMBG 2.0.
3. Produce the video with **vox-director**. One topic in; a Vox-style paper-collage explainer or ad out, with the script, motion, voice-over, music and captions automated through Atlas Cloud and ffmpeg. Treat the first render as a draft, not a deliverable.
4. Edit with **capcut-edit**: subtitles, timing, speed, volume, templates and animations in CapCut and JianYing projects, and cutting long-form video into shorts for each platform. Cut the shorts from the long version rather than rendering each one separately.
5. Add the audio version with **blog-audio**. It generates MP3 narration of blog posts with Google Gemini text-to-speech, as summaries, full read-alouds or two-speaker podcast mode, with HTML5 embed code. A post people can listen to is a post people finish.
6. Review with **claude-real-video-for-agents**. It installs the crv tool so the agent can watch a video by extracting deduplicated scene-aware keyframes and transcribing the audio. Have the agent check its own output before you do.

## Install the stack

```bash
npx skills add https://github.com/AgriciDaniel/claude-seo/tree/main/skills/seo-image-gen
npx skills add https://github.com/Bria-AI/bria-skill/tree/dev/skills/remove-background
npx skills add https://github.com/Alisa0808/vox-director
npx skills add https://github.com/renezander030/capcut-cli/tree/master/skills/capcut-edit
npx skills add https://github.com/infrasity-labs/dev-gtm-claude-skills/tree/main/writing-skills/blog-audio
npx skills add https://github.com/smixs/creative-director-skill/tree/main/creative-director
npx skills add https://github.com/HUANGCHIHHUNGLeo/claude-real-video/tree/master/skills/claude-real-video-for-agents
```

The [skills CLI](https://skills.sh/) works for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## What to check before you install

- Licenses: six of the seven are MIT; creative-director is CC-BY-4.0, which requires attribution.
- Services: seo-image-gen uses Gemini through the nanobanana server, blog-audio uses Google Gemini text-to-speech, remove-background uses Bria RMBG 2.0, vox-director uses Atlas Cloud and ffmpeg, and capcut-edit works on CapCut and JianYing projects. That is several accounts and at least a few metered APIs, so budget for them and keep the keys out of the repository.
- Read each SKILL.md before you enable it. claude-real-video-for-agents installs a tool on your machine, and the directory has not security scanned any skill.

## FAQ

### Will I get a finished video from one prompt?

vox-director's summary says it automates the script, motion, voice-over, music and captions from one topic. Whether what comes out is finished is a judgment you make after watching it, which is why claude-real-video-for-agents and capcut-edit are in the stack: review, then cut.

### Do these skills work in Codex and Cursor?

Yes. All seven use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### What about music?

vox-director adds music as part of its automated pipeline. None of the seven picks composes music on its own, so if you need a specific track, bring it to the edit in capcut-edit, which handles volume and timing. seo-image-gen, at about 6,400 installs recorded by skills.sh, is the most installed pick here; the video skills have far fewer installs recorded, so read their SKILL.md files with that in mind.
