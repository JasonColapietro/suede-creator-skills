# Which agent skills make the best AI animation generator for motion graphics?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** For AI motion graphics built as code, start with three HyperFrames skills from heygen-com/hyperframes: [hyperframes-core](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-core) (83/100) sets the composition contract, [hyperframes-animation](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-animation) (80/100) supplies the motion rules and runtime adapters such as GSAP and Lottie, and [hyperframes-keyframes](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-keyframes) (84/100) handles camera moves. Together they turn your agent into an AI animation generator for video. Add ui-animation (86/100) when the motion lives in a product interface, slack-gif-creator (87/100) for Slack GIFs, and dashmotion for animated technical diagrams.

## The stack

Six skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [slack-gif-creator](https://skills.suedeai.ai/directory/anthropics/skills/slack-gif-creator/) | [anthropics/skills](https://github.com/anthropics/skills) | 87/100 | Provides constraints, validation tools and animation concepts for creating animated GIFs sized and optimized for Slack. |
| [ui-animation](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 86/100 | Builds, reviews and measures UI motion, including springs, gestures, scroll effects, curve fitting from recordings and sparse interface sound. |
| [hyperframes-keyframes](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-keyframes) | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | 84/100 | Adds seek-safe 2D and 3D keyframes to a HyperFrames composition: punch-ins, zooms, reframes, Ken Burns, camera moves and match or whip handoffs. |
| [hyperframes-core](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-core) | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | 83/100 | Defines the HyperFrames composition contract for one renderable project: timing attributes, clips, tracks, sub-compositions, variables and deterministic-render rules. |
| [hyperframes-animation](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-animation) | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | 80/100 | Holds the HyperFrames animation knowledge: motion rules, scene blueprints, transitions and seven runtime adapters, from GSAP to Lottie and Three.js. |
| [dashmotion](https://skills.suedeai.ai/directory/csthink/dashmotion/dashmotion/) | [csthink/dashmotion](https://github.com/csthink/dashmotion) | 80/100 | Creates dark-themed animated technical diagrams as self-contained HTML and SVG files, including flowcharts with flowing connectors and architecture diagrams with traveling light dots. |

## Who this stack is for

This stack is for people who want motion without opening After Effects. A product marketer who needs a launch teaser built from the brand's real fonts and colors. A frontend engineer asked to make an interface feel less stiff. A developer advocate who wants an animated architecture diagram on the README. A team lead who wants a custom GIF in Slack by lunch.

What ties it together is that the motion is code. HyperFrames compositions are HTML with timing attributes, [ui-animation](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/) writes interface motion, [dashmotion](https://skills.suedeai.ai/directory/csthink/dashmotion/dashmotion/) writes SVG, and [slack-gif-creator](https://skills.suedeai.ai/directory/anthropics/skills/slack-gif-creator/) draws frames in Python. That means the agent can read, diff and revise the motion like any other code, and you can keep the source in a repository.

All six use the [Agent Skills](https://agentskills.io/) format, so they work in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. Claude Code animation work is the obvious fit, but nothing here is tied to one agent.

## The Suede AI skill built for this job

I built [suede-video](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-video) for exactly this job: turning a product, a demo or a launch into a marketing video, and turning that video into a repeatable production pipeline. Ask it to "turn this demo into a short video" and it plans the piece end to end: the script, the storyboard, the shot and asset lists, consent-aware choices about AI footage and avatars, the edit decisions, the pacing, the export specs and the video-search metadata. It produces through programmatic rendering, which is exactly where motion graphics live.

Start with it. suede-video decides what the motion is for, and the HyperFrames skills below execute it. The storyboard becomes the scene list for [hyperframes-core](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-core). The pacing decides which blueprints [hyperframes-animation](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-animation) loads and where [hyperframes-keyframes](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-keyframes) places each camera move. The export specs set the sizes for every cut, and nothing publishes without approval.

It is Suede AI's skill, so it stays out of the ranking on this page. It keeps still images and paid ad concepts out of its lane. Install it before the rest of the stack:

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-video
```

## The skills, one by one

### slack-gif-creator: animated GIFs that fit Slack

[slack-gif-creator](https://skills.suedeai.ai/directory/anthropics/skills/slack-gif-creator/) comes from anthropics/skills, which the directory marks as an official publisher. It provides the knowledge and utilities for animated GIFs optimized for Slack: the constraints, validation tools and animation concepts. Its trigger is plain: "make me a GIF of X doing Y for Slack".

The SKILL.md starts with Slack's requirements, then a core workflow, then drawing: working with uploaded images, drawing from scratch, and making graphics look good. Four Python modules do the work, a GIF builder, validators, easing functions and frame helpers, and the skill runs pip install for its requirements. The animation concepts section covers shake and vibrate, pulse and heartbeat, bounce, and spin and rotate. The directory's read found no network calls.

It is narrow on purpose, and that is its strength. Use it for reaction GIFs, launch-day celebrations and team in-jokes. Do not use it for video; a GIF built to Slack's limits is the wrong format for a product teaser. It is Apache-2.0 licensed with about 77,000 installs recorded by skills.sh.

A prompt that names the motion:

```text
Make a Slack GIF of our logo doing a pulse-heartbeat loop, starting from the uploaded logo.png. Validate it against Slack's requirements before you hand it over.
```

### ui-animation: motion inside the product

[ui-animation](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/) builds, reviews and measures UI motion: springs, gestures, scroll effects, curve fitting from recordings, and sparse interface sound. It answers "add animation", "match this easing", "reverse engineer this motion" and "add a click sound", and it can look for animation opportunities you missed.

Its SKILL.md covers core rules, motion design principles, what to animate, easing defaults, transition decision rules, spatial and sequencing, accessibility, performance and anti-patterns, with separate discovery and reverse-engineer workflows. References cover choreography, clip-path techniques, curve fitting and debugging symptoms. It bundles three Python scripts and ships evals, and the directory's read found no network calls.

This is the stack's answer to motion that lives in an interface rather than a video. The reverse-engineer workflow is the part I use most: hand it a recording of an interaction you admire and it fits the curve, so you match the feel instead of guessing. Do not reach for it to build a video; that is the HyperFrames side of the stack. It is MIT licensed with about 11,000 installs recorded by skills.sh.

A prompt for the discovery workflow:

```text
Review the checkout flow in src/checkout and list the three places where motion would clarify state. Implement the first one with springs and a reduced-motion fallback.
```

### hyperframes-keyframes: camera moves and seek-safe keyframes

[hyperframes-keyframes](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-keyframes) is for the moment a HyperFrames composition needs a camera. It covers punch-ins, punch-outs, zooms, reframes, Ken Burns treatments, camera moves, visual match and whip handoffs, and other seek-safe 2D and 3D keyframes. It also covers the techniques underneath: GSAP, CSS keyframes, Anime.js, WAAPI, FLIP, paths, masks, SVG morph and draw, text trails and 3D depth, plus `hyperframes keyframes` diagnostics.

"Seek-safe" is the property that matters. A keyframe that only works when the timeline plays from the start breaks the moment someone scrubs; this skill is written to avoid that. Its description is also clear about what it is not for: broad scene strategy, brand design, media sourcing, captions and general video planning.

The directory has no full page for it yet, so its files are not summarized here. It comes from heygen-com/hyperframes, which the directory marks as an official publisher, under Apache-2.0, with about 755,000 installs recorded by skills.sh. Reach for it after the composition exists and the scenes are blocked out.

A prompt for a single, specific move:

```text
In compositions/launch.html, add a slow punch-in on the product shot in scene 3 and a whip handoff into scene 4. Keep both seek-safe and run the keyframes diagnostics.
```

### hyperframes-core: the composition contract

[hyperframes-core](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-core) is the rulebook for building one renderable HyperFrames project. It covers composition structure, the `data-*` timing attributes, `class="clip"`, tracks, sub-compositions, variables, framework-owned media playback, deterministic-render rules and validation. Its description says to read it before writing composition HTML, and I agree.

Every other HyperFrames skill assumes this contract. If a composition breaks that contract, no amount of good animation will render correctly. Deterministic rendering is the reason the approach works at all: the same composition should produce the same frames every time, which is what lets an agent revise a video the way it revises code.

The directory has no full page for it yet, so its files are not summarized here. It is Apache-2.0 licensed from heygen-com/hyperframes, an official publisher in the directory, with about 931,000 installs recorded by skills.sh. Install it first among the HyperFrames skills, and go back to it whenever you start a new composition or a render does something you did not expect.

A prompt that starts a project the right way:

```text
Set up a new HyperFrames composition for a 20-second product teaser: three scenes as sub-compositions, a music track, and variables for the product name and color. Validate it before adding any animation.
```

### hyperframes-animation: the motion library

[hyperframes-animation](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-animation) holds all of the HyperFrames animation knowledge: atomic motion rules, multi-phase scene blueprints, scene transitions, broader motion-design techniques, and seven runtime adapters, with GSAP as the default plus Lottie, Three.js, Anime.js, CSS keyframes, the Web Animations API and TypeGPU. It also audits an existing composition's choreography with an animation map, and it names 24 text-animation effects.

The working method is in its description: pick two to four rules and compose them, or load a blueprint, or look up a runtime-specific API such as GSAP eases, the Lottie player or the Three.js mixer. Everything is HyperFrames-native: a single paused timeline, seek-safe and deterministic.

This is the skill that makes the stack feel like an AI animation generator rather than a code template. Use the animation map on any composition before you call it finished; choreography problems are easier to see on a map than on a playback. The directory has no full page for it yet, so its files are not summarized. It is Apache-2.0 licensed with about 1,005,000 installs recorded by skills.sh, the most in this stack.

A prompt that uses rules, not adjectives:

```text
Animate the title card in scene 1 with two motion rules and one of the named text-animation effects, using the GSAP adapter. Then produce an animation map for the whole composition.
```

### dashmotion: diagrams that move

[dashmotion](https://skills.suedeai.ai/directory/csthink/dashmotion/dashmotion/) creates dark-themed, animated technical diagrams as self-contained HTML and SVG files. It has two modes: flowcharts whose connectors visibly flow, and architecture diagrams where requests travel as light dots through the system. It also converts Mermaid source into an animated diagram.

The SKILL.md is a six-step contract: pick the mode, apply the two animation contracts (flowing dashed connectors with stroke-dashoffset, and traveling dots with SVG `animateMotion`), use the shared design tokens, meet the accessibility and motion rules it calls non-negotiable, produce the file, and run a structural self-check. GIF or MP4 export happens only if you ask. Three Python scripts handle layout, diagram checks and fidelity checks, and the directory's read found no network calls.

Use it when the thing being explained moves: requests, events, jobs, messages or control flow. Use a static diagram when nothing does. Its output is made for a landing page, a README, docs or a product demo, and the file opens in any browser with nothing else to install. It is MIT licensed with about 200 installs recorded by skills.sh.

A prompt that starts from Mermaid:

```text
Animate this Mermaid flowchart of our order pipeline with dashmotion in flow mode. Keep the default tokens, respect reduced motion, and run the structural self-check.
```

## How to use the stack together

1. Set up the project with [**hyperframes-core**](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-core). Get the scenes, tracks and variables right and validate before you animate anything.
2. Block the motion with [**hyperframes-animation**](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-animation). Pick two to four rules per scene or load a blueprint, and choose the runtime adapter once for the whole piece.
3. Add the camera with [**hyperframes-keyframes**](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-keyframes): punch-ins, reframes and handoffs between scenes. Keep every keyframe seek-safe and run its diagnostics.
4. Make the system diagram with [**dashmotion**](https://skills.suedeai.ai/directory/csthink/dashmotion/dashmotion/). Its self-contained HTML and SVG goes on the landing page, README or docs next to the video, and it exports GIF or MP4 when you ask.
5. Audit the choreography with **hyperframes-animation**'s animation map. Fix collisions and dead air before you render the final cut.
6. Carry the same motion language into the product with [**ui-animation**](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/). Fit its curves to a recording of the video's best transition so the teaser and the interface feel related.
7. Cut a Slack-sized loop with [**slack-gif-creator**](https://skills.suedeai.ai/directory/anthropics/skills/slack-gif-creator/) for the launch announcement, and validate it before posting.

## Install the stack

```bash
npx skills add https://github.com/anthropics/skills/tree/main/skills/slack-gif-creator
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/ui-animation
npx skills add https://github.com/heygen-com/hyperframes/tree/main/skills/hyperframes-keyframes
npx skills add https://github.com/heygen-com/hyperframes/tree/main/skills/hyperframes-core
npx skills add https://github.com/heygen-com/hyperframes/tree/main/skills/hyperframes-animation
npx skills add https://github.com/csthink/dashmotion/tree/main/skills/dashmotion
```

The [skills CLI](https://skills.sh/) installs each skill for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [vox-director](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/) | [Alisa0808/vox-director](https://github.com/Alisa0808/vox-director) | 85/100 | You want a narrated paper-collage explainer from one topic, with voice-over, music and captions automated through Atlas Cloud and ffmpeg. |
| [general-video](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#general-video) | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | 83/100 | The piece is longer or multi-scene: brand and sizzle reels, montages, footage remixes and freeform HyperFrames builds. |
| [hyperframes-creative](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-creative) | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | 82/100 | You need the non-animation direction: palettes, typography, narration, beat planning and audio-reactive visuals. |
| [remotion-to-hyperframes](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#remotion-to-hyperframes) | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | 77/100 | You have an existing Remotion composition and want to port its source to HyperFrames HTML. |
| [gif-sticker-maker](https://skills.suedeai.ai/directory/minimax-ai/skills/gif-sticker-maker/) | [MiniMax-AI/skills](https://github.com/MiniMax-AI/skills) | 75/100 | You want four captioned GIF stickers from a photo of a person, pet, object or logo, in cartoon styles. |
| [remotion](https://skills.suedeai.ai/directory/google-labs-code/stitch-skills/#remotion) | [google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills) | 69/100 | You design in Stitch and want walkthrough videos with transitions, zooms and text overlays. |

The closest call is [hyperframes-creative](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-creative) against [hyperframes-animation](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-animation). They split the job: creative handles look and narration, animation handles motion. I would add creative alongside the stack rather than swap it in, once a piece has a brand to follow. [gif-sticker-maker](https://skills.suedeai.ai/directory/minimax-ai/skills/gif-sticker-maker/) and [slack-gif-creator](https://skills.suedeai.ai/directory/anthropics/skills/slack-gif-creator/) both make GIFs, but the first generates through MiniMax models from a photo while the second draws frames locally in Python.

## Common mistakes

- Animating before the composition validates. [hyperframes-core](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-core) comes first because broken timing attributes break everything above them.
- Stacking every motion rule in one scene. [hyperframes-animation](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-animation) says to pick two to four and compose.
- Keyframes that only work from frame zero. [hyperframes-keyframes](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-keyframes) is built around seek-safe moves; check with its diagnostics.
- Ignoring reduced motion. [ui-animation](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/) and [dashmotion](https://skills.suedeai.ai/directory/csthink/dashmotion/dashmotion/) both treat accessibility as part of the job.
- Animating diagrams where nothing moves. dashmotion's own description reserves it for requests, events, data, jobs, messages or control flow.
- Posting GIFs Slack will reject. [slack-gif-creator](https://skills.suedeai.ai/directory/anthropics/skills/slack-gif-creator/) ships validators; run them.

## Licenses, costs and checks before you install

All six licenses are open. The three HyperFrames skills and [slack-gif-creator](https://skills.suedeai.ai/directory/anthropics/skills/slack-gif-creator/) are Apache-2.0; [ui-animation](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/) and [dashmotion](https://skills.suedeai.ai/directory/csthink/dashmotion/dashmotion/) are MIT. None is proprietary.

None of the picks with full directory pages reads an environment variable or calls an outside host, according to the directory's read of their files: ui-animation, dashmotion and slack-gif-creator run locally, and slack-gif-creator runs pip install for its Python requirements. The three HyperFrames skills have no full directory page, so their files are not summarized; read them in the heygen-com/hyperframes repository. Among the alternatives, [vox-director](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/) reads ATLASCLOUD_API_KEY and [gif-sticker-maker](https://skills.suedeai.ai/directory/minimax-ai/skills/gif-sticker-maker/) reads MINIMAX_API_KEY, so those two bring paid services with them.

The directory has not security scanned any listed skill; [read how it handles trust](https://skills.suedeai.ai/directory/trust/). Read each SKILL.md before you enable it.

## Related topics and stacks

Two directory topics cover this ground: [Animation and Motion Graphics](https://skills.suedeai.ai/directory/topics/animation-motion/) (23 listed skills) and [Diagrams and Infographics](https://skills.suedeai.ai/directory/topics/diagrams-infographics/) (19), both inside the [Video, Image, Audio and Creative](https://skills.suedeai.ai/directory/media-creative/) category.

Three stacks pair with this one: the [video and creative stack](https://skills.suedeai.ai/directory/stacks/video-and-creative/) for footage, stills and narration, the [UI design stack](https://skills.suedeai.ai/directory/stacks/ui-design/) for the interface your motion lives in, and the [infographics and diagrams stack](https://skills.suedeai.ai/directory/stacks/infographics-and-diagrams/) for static visuals.

## FAQ

### What is the best AI animation generator for Claude Code?

For video-style motion graphics, the HyperFrames skills from heygen-com/hyperframes: [hyperframes-core](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-core) (83/100) for the composition, [hyperframes-animation](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-animation) (80/100) for motion rules and runtime adapters, and [hyperframes-keyframes](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-keyframes) (84/100) for camera moves. For motion inside an app, [ui-animation](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/) (86/100). All four are open source Agent Skills.

### Can AI make motion graphics in Claude Code?

Yes, as code. HyperFrames compositions are HTML with timing attributes, and [hyperframes-animation](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-animation) animates them with GSAP by default, or Lottie, Three.js, Anime.js, CSS keyframes, the Web Animations API or TypeGPU. Because rendering is deterministic, the agent can revise a scene and get the same frames every time. AI motion graphics built this way live in a repository, not a project file.

### Which motion graphics skill should I install first?

[hyperframes-core](https://skills.suedeai.ai/directory/heygen-com/hyperframes/#hyperframes-core), if you are making video. Every other HyperFrames skill assumes its composition contract, and its description says to read it before writing composition HTML. If your motion lives in a product interface instead, start with [ui-animation](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/), which builds, reviews and measures UI motion and can fit easing curves from a screen recording.

### Do these skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Are these animation skills free?

Yes, as software. The three HyperFrames skills and [slack-gif-creator](https://skills.suedeai.ai/directory/anthropics/skills/slack-gif-creator/) are Apache-2.0, and [ui-animation](https://skills.suedeai.ai/directory/mblode/agent-skills/ui-animation/) and [dashmotion](https://skills.suedeai.ai/directory/csthink/dashmotion/dashmotion/) are MIT. The three picks with full directory pages read no API keys and call no outside hosts. Paid services enter only if you swap in alternatives such as [vox-director](https://skills.suedeai.ai/directory/alisa0808/vox-director/vox-director/) or [gif-sticker-maker](https://skills.suedeai.ai/directory/minimax-ai/skills/gif-sticker-maker/), which read API keys.

### Can I animate a Mermaid diagram?

Yes, with [dashmotion](https://skills.suedeai.ai/directory/csthink/dashmotion/dashmotion/) (80/100). It converts Mermaid source, from a code block or an .mmd file, into a dark-themed animated diagram as self-contained HTML and SVG: flowcharts with flowing connectors, or architecture diagrams where requests travel as light dots. It exports GIF or MP4 only when you ask, and it runs a structural self-check before delivering.
