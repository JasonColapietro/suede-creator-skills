# Which agent skills make the best AI infographic and diagram generator?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** [archify](https://skills.suedeai.ai/directory/tt-a1i/archify/archify/) from tt-a1i/archify (87/100) is the AI diagram generator I would install first: architecture, workflow, sequence, state and data-flow diagrams as standalone HTML with SVG and WebM export, with about 186,000 installs recorded by skills.sh. [infographics](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#infographics) from K-Dense-AI/claude-scientific-skills (89/100) is the AI infographic generator, and [diagramming-code](https://skills.suedeai.ai/directory/trailofbits/skills/diagramming-code/) from trailofbits/skills (89/100) draws Mermaid diagrams from code graphs. Add scientific-visualization for publication-ready figures, crypto-protocol-diagram for protocol message flows, and hand-drawn-diagrams for Excalidraw sketches.

## The stack

Six skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [diagramming-code](https://skills.suedeai.ai/directory/trailofbits/skills/diagramming-code/) | [trailofbits/skills](https://github.com/trailofbits/skills) | 89/100 | Generates Mermaid diagrams from Trailmark code graphs, including call graphs, class hierarchies, module dependency maps, complexity heatmaps and attack surface data flow visualizations. |
| [infographics](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#infographics) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 89/100 | Creates and reviews infographics with Nano Banana 2 via OpenRouter, for statistical summaries, timelines, comparisons, processes and visual explanations. |
| [scientific-visualization](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#scientific-visualization) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 89/100 | Creates and audits truthful, accessible, publication-ready scientific figures with Matplotlib, Seaborn or Plotly. |
| [archify](https://skills.suedeai.ai/directory/tt-a1i/archify/archify/) | [tt-a1i/archify](https://github.com/tt-a1i/archify) | 87/100 | Creates validated architecture, workflow, sequence, data-flow, state and class diagrams as standalone HTML with inline SVG and image, SVG or WebM export. |
| [crypto-protocol-diagram](https://skills.suedeai.ai/directory/trailofbits/skills/crypto-protocol-diagram/) | [trailofbits/skills](https://github.com/trailofbits/skills) | 87/100 | Extracts protocol message flow from source code, RFCs, papers, pseudocode, or ProVerif and Tamarin models and generates Mermaid sequence diagrams with cryptographic annotations. |
| [hand-drawn-diagrams](https://skills.suedeai.ai/directory/muthuishere/hand-drawn-diagrams/hand-drawn-diagrams/) | [muthuishere/hand-drawn-diagrams](https://github.com/muthuishere/hand-drawn-diagrams) | 79/100 | Creates hand-drawn Excalidraw diagrams, flows, explainers, wireframes and page mockups, defaulting to monochrome sketch output. |

## Who this stack is for

This stack is for anyone who explains systems or data for a living. An engineer documenting a service before a design review. A security reviewer who needs the call graph and the attack surface on one page. A researcher assembling figures for a paper. A marketer turning a survey into a shareable infographic. A product manager sketching a flow before anyone builds it.

It covers two different jobs that share a word. Diagrams explain structure: what calls what, who sends which message, which state follows which. Infographics explain data and stories: a timeline, a comparison, a statistic with context. Four of the picks are diagram tools; [infographics](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#infographics) and [scientific-visualization](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#scientific-visualization) cover the data half. Knowing which job you have is most of the decision.

All six use the [Agent Skills](https://agentskills.io/) format, so they work as Claude diagram tools in Claude Code and the same folders run in Codex, Cursor and any other agent that reads a SKILL.md.

## The Suede AI skill built for this job

I built [suede-image](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-image) for exactly this job: turning a visual into a marketing asset that is sized, compressed and findable. Ask it to "create an Open Graph image" and it does. Point it at a marketing hero, a banner, a social graphic, a mockup or a whole image workflow and it makes the first decision for you: generation, editing, a template or a real screenshot. Then it specifies the layout, the rights, the export sizes, the compression and the image SEO.

Start with it whenever an infographic or diagram is headed for a public page or a feed. suede-image decides the route and the specs, and the stack below produces the content. An [archify](https://skills.suedeai.ai/directory/tt-a1i/archify/archify/) export becomes a social graphic at the right sizes. An [infographics](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#infographics) render gets a layout, a rights check and compression before it ships. Every visual leaves with its image SEO specified, so the diagram that took an hour to get right is ready for search as well as for people.

It is Suede AI's skill, so it stays out of the ranking on this page. It keeps to its lane: no paid-ad systems, video, app-store assets or social strategy. Install it before the rest of the stack:

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-image
```

## The skills, one by one

### diagramming-code: architecture diagrams from the code itself

[diagramming-code](https://skills.suedeai.ai/directory/trailofbits/skills/diagramming-code/) generates Mermaid diagrams from Trailmark code graphs: call graphs, class hierarchies, module dependency maps, containment diagrams, complexity heatmaps, and attack surface data flow visualizations. It comes from trailofbits/skills, which the directory marks as an official publisher.

The SKILL.md is disciplined: when to use it and when not to, prerequisites, a version gate, a quick start, the diagram types, a workflow, a script reference and customization. Two Python scripts ship with it, diagram.py and a test of the skill's commands, plus references on diagram types and Mermaid syntax. The directory's read found no network calls and no environment variables.

The value is that the diagram comes from the code graph, not from memory. A diagram drawn from memory goes stale as the code changes; one generated from the graph can be regenerated. It needs a Trailmark code graph to work from, so check the prerequisites first. It is licensed CC-BY-SA-4.0, an open license with share-alike terms, with about 4,000 installs recorded by skills.sh.

A prompt that asks for one diagram type:

```text
Generate a module dependency map and a complexity heatmap for the payments package as Mermaid diagrams, and flag the three modules with the most inbound edges.
```

### infographics: the AI infographic generator

[infographics](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#infographics) creates and reviews infographics with Nano Banana 2 via OpenRouter. It handles statistical summaries, timelines, comparisons, processes and visual explanations, working from data you supply or from optional Sonar research. It supports ten layouts, eight style presets, reference images and accessible palette starting points.

The directory has no full page for it yet, so its files are not summarized here; read the SKILL.md in the repository before you run it.

This is the pick for the half of the job that is about data and story rather than structure. The review half of its description matters as much as the creation half: generated infographics can misstate a number, so have it review the render against your source data before anyone shares it. Supply the data yourself whenever you can, and treat the research option as a starting point. Pick the layout to match the claim: a timeline for change over time, a comparison for two options, a process for steps. It is MIT licensed; skills.sh has no install count for it.

A prompt with the data attached:

```text
Make a comparison infographic from survey.csv: remote vs office satisfaction across five questions. Use an accessible palette and one of the ten layouts, then review it against the CSV.
```

### scientific-visualization: figures that hold up

[scientific-visualization](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#scientific-visualization) creates and audits truthful, accessible, publication-ready scientific figures with Matplotlib, Seaborn or Plotly. It covers figure design, multi-panel layouts, uncertainty and missing-data displays, color and contrast review, image metadata validation and journal export planning.

The directory has no full page for it yet, so its files are not summarized here; the repository holds its SKILL.md.

I include it because charts are where visual explanations most often go wrong. A truthful figure shows its uncertainty and its missing data; a decorative one hides both. Use it whenever the visual is a chart of real numbers, whether that is a paper, a board deck or a public report, and use its audit mode on figures someone else made. Skip it for diagrams of structure, which the other picks handle better. The journal export planning is useful beyond journals: it forces a decision about size and format before the figure is drawn, not after. It is MIT licensed; skills.sh has no install count for it.

A prompt that asks for honesty, not polish:

```text
Audit figure 3 in results/ for truthfulness and accessibility: check the axes, the uncertainty display and the color contrast, then redraw it in Matplotlib as a two-panel figure.
```

### archify: the all-round AI diagram generator

[archify](https://skills.suedeai.ai/directory/tt-a1i/archify/archify/) creates validated architecture, workflow, sequence, data-flow, lifecycle and state, ERD, class, tree, timeline and waterfall diagrams as explorable standalone HTML with dark and light themes, motion, and image, SVG or WebM export. It accepts plain requirements or Mermaid, and it inspects repository evidence for code-backed diagrams. It can also turn an answer into a one-page explainer with the conclusion first, structured panels, and native diagrams and charts.

Its SKILL.md routes by type and covers Mermaid input, delivery, setup and fallback, and output. It is the heaviest pick by code: 82 JavaScript files, including a CLI, a preview, a finalize step and a visual check, with a bundled template and third-party notices. The directory's read found no network calls and no environment variables.

This is the one I would install first. It covers the widest range of diagram types, it validates what it draws, and its one-page explainer mode is the fastest route from "explain this" to something shareable. Its description says it is not for dashboards. It is MIT licensed with about 186,000 installs recorded by skills.sh, the most in this stack.

A prompt that uses repository evidence:

```text
Read this repository and draw a code-backed sequence diagram of the checkout request, from the API handler to the payment provider, as standalone HTML with SVG export.
```

### crypto-protocol-diagram: message flow for protocols

[crypto-protocol-diagram](https://skills.suedeai.ai/directory/trailofbits/skills/crypto-protocol-diagram/) extracts protocol message flow from source code, RFCs, academic papers, pseudocode, informal prose, ProVerif (.pv) or Tamarin (.spthy) models, and generates Mermaid sequence diagrams with cryptographic annotations. Its description names TLS, Noise, Signal, X3DH, Double Ratchet, FROST, DH and ECDH.

The SKILL.md runs two workflows. The code workflow locates protocol entry points, identifies parties and roles, traces message flow, annotates cryptographic operations and identifies phases. The spec workflow ingests the spec, extracts parties, flow and operations, and flags spec ambiguities. A section on rationalizations to reject keeps the agent honest. One Python script ships with worked examples, including a simple handshake and a ProVerif model, and the directory's read found no network calls.

It is a specialist. Use it for security reviews, protocol design documents and audits; skip it for anything that is not a protocol. It comes from trailofbits/skills, an official publisher in the directory, under CC-BY-SA-4.0, with about 4,000 installs recorded by skills.sh.

A prompt that starts from a spec:

```text
Read section 4 of the attached RFC draft and produce a Mermaid sequence diagram of the handshake with cryptographic annotations. Flag any step where the spec is ambiguous.
```

### hand-drawn-diagrams: sketches that look like sketches

[hand-drawn-diagrams](https://skills.suedeai.ai/directory/muthuishere/hand-drawn-diagrams/hand-drawn-diagrams/) creates hand-drawn Excalidraw diagrams, flows, explainers, wireframes, mind maps, architecture overviews and page mockups. It defaults to monochrome sketch output and allows restrained color only for page mockups when you explicitly want webpage-like fidelity.

The SKILL.md is short (workflow, key rules, references, and an optional Chrome DevTools MCP section), but the files are substantial: 17 Python scripts and 2 shell scripts, with sample outputs that include an animated SVG. Its files reach esm.sh.

A sketch signals "this is a draft" in a way a polished diagram does not, which makes it the right tool early: whiteboard-style explainers, wireframes for a first review, a mind map for a workshop. Do not use it for documentation that needs to be precise; use [archify](https://skills.suedeai.ai/directory/tt-a1i/archify/archify/) or [diagramming-code](https://skills.suedeai.ai/directory/trailofbits/skills/diagramming-code/) there. Once the sketch has done its job, redraw it properly rather than polishing the sketch. It is MIT licensed with about 600 installs recorded by skills.sh.

A prompt that keeps it rough on purpose:

```text
Sketch a monochrome Excalidraw flow of our user onboarding, five steps with one branch for failed email verification. Keep it rough; this is for a workshop.
```

## How to use the stack together

1. Decide what you are explaining. Structure goes to the diagram skills; data and story go to [**infographics**](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#infographics) or [**scientific-visualization**](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#scientific-visualization).
2. Sketch first with [**hand-drawn-diagrams**](https://skills.suedeai.ai/directory/muthuishere/hand-drawn-diagrams/hand-drawn-diagrams/) when the idea is still moving. A rough Excalidraw flow gets honest feedback because nobody thinks it is finished.
3. Draw the real thing with [**archify**](https://skills.suedeai.ai/directory/tt-a1i/archify/archify/). Give it requirements or Mermaid, or let it read the repository for a code-backed diagram.
4. For code you own, generate the structure with [**diagramming-code**](https://skills.suedeai.ai/directory/trailofbits/skills/diagramming-code/). Call graphs and dependency maps from the code graph stay current because you can regenerate them.
5. For protocols, use [**crypto-protocol-diagram**](https://skills.suedeai.ai/directory/trailofbits/skills/crypto-protocol-diagram/). Read the ambiguities it flags before you trust the diagram.
6. Build charts of real numbers with **scientific-visualization**. Show the uncertainty and the missing data rather than hiding them.
7. Make the shareable version with **infographics**, then have it review the render against your source data. Export last, at the sizes each channel needs.

## Install the stack

```bash
npx skills add https://github.com/trailofbits/skills/tree/main/plugins/trailmark/skills/diagramming-code
npx skills add https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/skills/infographics
npx skills add https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/skills/scientific-visualization
npx skills add https://github.com/tt-a1i/archify/tree/main/archify
npx skills add https://github.com/trailofbits/skills/tree/main/plugins/trailmark/skills/crypto-protocol-diagram
npx skills add https://github.com/muthuishere/hand-drawn-diagrams
```

The [skills CLI](https://skills.sh/) installs each skill for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [markdown-mermaid-writing](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#markdown-mermaid-writing) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 87/100 | The diagram lives inside Markdown documentation and should stay text: Mermaid with syntax references and rendering checks. |
| [efcore-d2-db-diagram](https://skills.suedeai.ai/directory/github/awesome-copilot/#efcore-d2-db-diagram) | [github/awesome-copilot](https://github.com/github/awesome-copilot) | 84/100 | You need a database diagram from Entity Framework Core models, written as D2. |
| [cloud-monitoring-chart-generation](https://skills.suedeai.ai/directory/google/skills/#cloud-monitoring-chart-generation) | [google/skills](https://github.com/google/skills) | 84/100 | The chart belongs on a Google Cloud Monitoring dashboard, generated from PromQL or ListTimeSeries queries. |
| [dashmotion](https://skills.suedeai.ai/directory/csthink/dashmotion/dashmotion/) | [csthink/dashmotion](https://github.com/csthink/dashmotion) | 80/100 | The diagram should move: flowing connectors and requests traveling as light dots, as self-contained HTML and SVG. |
| [academic-plotting](https://skills.suedeai.ai/directory/orchestra-research/ai-research-skills/academic-plotting/) | [Orchestra-Research/AI-Research-SKILLs](https://github.com/Orchestra-Research/AI-Research-SKILLs) | 77/100 | You are writing an ML paper and want architecture diagrams via Gemini plus matplotlib or seaborn charts from results. |

[archify](https://skills.suedeai.ai/directory/tt-a1i/archify/archify/) against [markdown-mermaid-writing](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#markdown-mermaid-writing) is the choice most teams face. archify produces an explorable HTML artifact; markdown-mermaid-writing keeps the diagram as text that lives in the docs and diffs cleanly in review. I would use both: Mermaid in the repository, archify for the version people present.

## Common mistakes

- Using an infographic where a diagram belongs. Structure is a diagram job for [archify](https://skills.suedeai.ai/directory/tt-a1i/archify/archify/); data with a story is an [infographics](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#infographics) job.
- Drawing architecture from memory. [diagramming-code](https://skills.suedeai.ai/directory/trailofbits/skills/diagramming-code/) generates it from the code graph, so it can be regenerated when the code changes.
- Publishing a generated infographic without checking the numbers. infographics reviews as well as creates; use the review.
- Hiding uncertainty to make a chart cleaner. [scientific-visualization](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#scientific-visualization) treats uncertainty and missing data as part of the figure.
- Polishing too early. [hand-drawn-diagrams](https://skills.suedeai.ai/directory/muthuishere/hand-drawn-diagrams/hand-drawn-diagrams/) keeps first drafts rough so feedback stays about the idea.
- Ignoring spec ambiguities. [crypto-protocol-diagram](https://skills.suedeai.ai/directory/trailofbits/skills/crypto-protocol-diagram/) flags them for a reason; resolve them before the diagram goes in a review.

## Licenses, costs and checks before you install

Two picks carry a share-alike license. [diagramming-code](https://skills.suedeai.ai/directory/trailofbits/skills/diagramming-code/) and [crypto-protocol-diagram](https://skills.suedeai.ai/directory/trailofbits/skills/crypto-protocol-diagram/) are CC-BY-SA-4.0, an open license that requires attribution and the same license on adaptations. [infographics](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#infographics), [scientific-visualization](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#scientific-visualization), [archify](https://skills.suedeai.ai/directory/tt-a1i/archify/archify/) and [hand-drawn-diagrams](https://skills.suedeai.ai/directory/muthuishere/hand-drawn-diagrams/hand-drawn-diagrams/) are MIT. None is proprietary.

archify, diagramming-code and crypto-protocol-diagram read no environment variables and make no network calls, according to the directory's read of their files. hand-drawn-diagrams reaches esm.sh. infographics names OpenRouter in its description, and neither it nor scientific-visualization has a full directory page, so their files are not summarized. Among the alternatives, [academic-plotting](https://skills.suedeai.ai/directory/orchestra-research/ai-research-skills/academic-plotting/) documents a GEMINI_API_KEY.

The directory has not security scanned any listed skill; [read how it handles trust](https://skills.suedeai.ai/directory/trust/). Read each SKILL.md before you enable it, and read the scripts in archify and hand-drawn-diagrams, which ship the most code.

## Related topics and stacks

The picks span four directory topics: [Diagrams and Infographics](https://skills.suedeai.ai/directory/topics/diagrams-infographics/) (19 listed skills), [Data Visualization and Charts](https://skills.suedeai.ai/directory/topics/data-visualization/) (15), [Scientific Writing](https://skills.suedeai.ai/directory/topics/scientific-writing/) (13) and [Image Generation](https://skills.suedeai.ai/directory/topics/image-generation/) (16). Most sit in the [Video, Image, Audio and Creative](https://skills.suedeai.ai/directory/media-creative/) category.

Three stacks pair with this one: the [technical docs stack](https://skills.suedeai.ai/directory/stacks/technical-docs/) where most diagrams end up, the [motion graphics stack](https://skills.suedeai.ai/directory/stacks/motion-graphics/) for diagrams that animate, and the [security audits stack](https://skills.suedeai.ai/directory/stacks/security-audits/) for the review work [crypto-protocol-diagram](https://skills.suedeai.ai/directory/trailofbits/skills/crypto-protocol-diagram/) supports.

## FAQ

### What is the best AI infographic generator for Claude Code?

[infographics](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#infographics) from K-Dense-AI/claude-scientific-skills (89/100). It creates and reviews infographics with Nano Banana 2 via OpenRouter, for statistical summaries, timelines, comparisons, processes and visual explanations, with ten layouts, eight style presets and accessible palette starting points. Supply your own data when you can, and have it review the render against that data before you publish.

### What is the best AI diagram generator?

[archify](https://skills.suedeai.ai/directory/tt-a1i/archify/archify/) from tt-a1i/archify (87/100) covers the most ground: architecture, workflow, sequence, data-flow, state, ERD, class, tree, timeline and waterfall diagrams as standalone HTML, with image, SVG or WebM export. It accepts requirements or Mermaid and can read a repository for code-backed diagrams. With about 186,000 installs recorded by skills.sh, it is the most installed pick here.

### Can Claude draw diagrams from my codebase?

Yes. [diagramming-code](https://skills.suedeai.ai/directory/trailofbits/skills/diagramming-code/) from trailofbits/skills (89/100) generates Mermaid call graphs, class hierarchies, dependency maps, complexity heatmaps and attack surface data flow from Trailmark code graphs. [archify](https://skills.suedeai.ai/directory/tt-a1i/archify/archify/) also inspects repository evidence for code-backed diagrams. Both outputs can be regenerated when the code changes, which is the point.

### Do these skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Are these diagram skills free?

As software, yes: you can install and use all six at no cost. Four are MIT licensed and two, [diagramming-code](https://skills.suedeai.ai/directory/trailofbits/skills/diagramming-code/) and [crypto-protocol-diagram](https://skills.suedeai.ai/directory/trailofbits/skills/crypto-protocol-diagram/), are CC-BY-SA-4.0. [archify](https://skills.suedeai.ai/directory/tt-a1i/archify/archify/), diagramming-code and crypto-protocol-diagram read no environment variables and make no network calls, according to the directory's read of their files. The [infographics](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#infographics) skill works through OpenRouter, per its description.

### Which diagram skill should I install first?

[archify](https://skills.suedeai.ai/directory/tt-a1i/archify/archify/). It handles the widest range of diagram types, validates what it draws, and exports to image, SVG or WebM. Add [infographics](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#infographics) when the visual is about data rather than structure, and [hand-drawn-diagrams](https://skills.suedeai.ai/directory/muthuishere/hand-drawn-diagrams/hand-drawn-diagrams/) when you want a rough sketch for a workshop.
