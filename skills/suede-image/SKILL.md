---
name: suede-image
description: "Use when asked \"create an Open Graph image\" or to produce marketing heroes, banners, social graphics, mockups or image workflows. Suede AI chooses generation, editing, templates or real screenshots, then specifies layout, rights, export sizes, compression and image SEO. NOT FOR: paid-ad systems (use suede-ad-creative), video (use suede-video), app-store assets (use suede-aso), or social strategy (use suede-social)."
metadata:
  display-name: "Suede AI Image Skills"
  version: 2.1.0
---

# Suede AI Image Skills

Produce marketing imagery as a rights-aware, placement-specific system: choose the right production method, protect canonical brand assets, preserve real product truth, and verify the exported result. Use generation models and design tools to create efficient hero, social, mockup, banner, and preview workflows without fabricating interfaces or provenance.

## Compatibility

An agent with visual inspection and access to supplied brand assets. Image production requires an available generation or editing tool; local export commands require their named utilities. Prompt-only delivery remains available when production tools are absent.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task. If its Status line says `partial`, ask for the listed missing sections before using them and never infer them; treat `[unverified]` fields as absent.

Gather this context (ask if not provided):

### 1. Image Goal
- What type of image? (Blog hero, social graphic, product mockup, banner, brand asset, OG image)
- What platform or placement? (Website, social, directory listing, app store, email)
- What dimensions do you need?

### 2. Production Approach
- Do you have existing brand assets? (Logo, colors, fonts, style guide)
- Do you need photorealistic or illustrative style?
- Is this a one-off or a template for repeated use?

### 3. Technical Context
- Which image, browser, design, or local conversion tools are currently callable?
- What is the approved maximum cost and data-handling boundary?
- Do you need the image optimized for web performance?

Do not ask the user to paste API keys or secrets into the conversation.

---

## Choosing Your Approach

First discover the current production surface. Inspect callable tools and connected
accounts; do not assume a named model, provider, API, plugin, or design app is
available. Then choose among these methods:

| Approach | Best For | Candidate surface |
|----------|----------|-------------------|
| **Generation** | Original concepts and scenes | A callable image-generation tool |
| **Editing** | Authorized changes to supplied images | A callable editor with image-input support |
| **Template design** | Brand-consistent recurring assets | An authorized design app or local template |
| **Screenshot + overlay** | Truthful product showcases | Callable browser capture plus local layout |
| **Licensed media** | Existing photography or illustration | User-owned library or verified license source |

---

## AI Image Generation

Use generation only after the current tool and authority gates pass.

### Capability and authority gate

1. Confirm a generation or editing tool is callable in the current session.
2. Check its current official documentation for model availability, accepted
   inputs, output sizes, editing/reference support, safety restrictions, retention,
   commercial-use terms, and pricing. Record the source and check date.
3. Confirm rights to every uploaded logo, screenshot, photo, font, and reference
   image. Do not upload confidential or personal material outside its approved
   boundary.
4. Calculate the maximum cost for the requested attempts and get explicit approval
   before using a paid account or exceeding an already approved budget.
5. Confirm whether the user's request authorizes generation only, editing of
   supplied files, overwriting a source, or publication. These are separate gates.

Provider names and model versions are volatile. Examples such as OpenAI, Google,
Black Forest Labs, Ideogram, Midjourney, Recraft, and self-hosted diffusion are
research candidates, not routing instructions or capability claims.

### Selection criteria

- For text-heavy assets, prefer a deterministic overlay or design template; test
  any verified in-image text capability before committing to it.
- For repeated brand work, prefer locked templates and approved assets over a
  claimed consistency feature.
- For edits, use a tool whose current documentation and callable schema confirm
  image input and the required edit mode.
- For vectors, require a real vector export and inspect its paths; a raster image
  labeled as vector is not sufficient.
- For product UI, capture the live authorized interface rather than generating it.
- For volume, compare verified cost, rate limits, review time, and output quality
  on a small test batch.

If no suitable renderer or editor is callable, deliver a production-ready prompt,
layout spec, asset manifest, rights checklist, and export checklist. State clearly
that no image was generated; do not route the user to an unavailable tool as
though execution occurred. Use these exact headings:

```markdown
## Prompt
<Subject + Setting + Style + Lighting + Composition + Technical, one block,
ready to paste; note any text that must be a deterministic overlay instead>

## Layout Spec
Canvas WxH + ratio | safe margins | focal point | text zones with max character
counts | logo placement and clear space | color values

## Asset Manifest
Asset | origin (owned / licensed / captured / to be generated) | rights basis
and holder | attribution or expiry | file path or "to source"

## Rights Checklist
- [ ] Every uploaded or referenced asset has a confirmed rights basis
- [ ] No real person, endorsement, or product interface is fabricated
- [ ] Brand mark is the approved file, unmodified, or omitted
- [ ] Paid-tool cost approved, or no paid tool used

## Export Checklist
Destination | dimensions | format | quality target | file-size budget | alt text
Then apply the Optimization Checklist in references/image-optimization.md before delivery.

## Not Done
No image was generated. What would unblock production: <tool, authority, asset>
```

### Prompting Basics

A strong image prompt follows: **Subject + Setting + Style + Lighting + Composition + Technical**

```
A laptop on a minimal white desk with an abstract analytics motif,
soft directional lighting from the left, shallow depth of field,
clean commercial photography style, 16:9 aspect ratio, 4K
```

**Common mistakes:**
- Too vague ("a business image"): add specific details
- Forgetting aspect ratio: always specify dimensions
- Requesting complex text: use overlays instead for anything beyond short headlines
- No style direction: "photorealistic," "flat illustration," "3D render"

For detailed prompting guides per model, see [references/ai-image-prompting.md](references/ai-image-prompting.md).

---

## Design Tools

- **Canva:** a candidate for template-driven social graphics and banners once
  the connected account, export rights, and callable integration are verified.
- **Figma:** a candidate when an authorized design file exists; verify whether
  the integration can read, edit, export, or only inspect.

The full notes and the design-tool vs. AI-generation table are in
[references/platform-image-specs.md](references/platform-image-specs.md).

---

## Marketing Image Workflows

### Blog & Article Hero Images

The image at the top of every post. Sets tone, improves shareability, required for OG/social previews.

1. **Define the concept**: what visual metaphor represents the topic?
2. **Choose the verified method**: callable generator, approved media, or a
   deterministic local/design template
3. **Confirm dimensions** from the actual site component and current social
   preview requirements
4. **Optimize to a measured quality and performance budget**

**Prompt pattern:**
```
[Visual metaphor for topic], clean modern style,
bright natural lighting, shallow depth of field,
professional blog header aesthetic, [verified width]x[verified height]
```

### Social Graphics, Banners, and Brand Assets

Read [references/platform-image-specs.md](references/platform-image-specs.md)
before sizing or exporting any social graphic, profile or listing banner, or
brand asset: it carries the planning-size tables, safe-zone notes, workflows,
and the brand-asset method table. Verify every size against the platform's
current official spec on the work date.

### Product Mockups & Screenshots

Showcase your product UI in context. AI models hallucinate UI: don't use them for this.

1. **Capture real screenshots** of your product at 2x resolution
2. **Frame in device mockups**: use browser frame, laptop, or phone templates
3. **Add context**: callout arrows, verified feature labels, before/after comparisons
4. **Annotate deterministically**: use a callable local layout workflow or an
   authorized design tool

Possible capture surfaces include browser tooling or an installed OS capture
utility. Discover what is currently callable, confirm authorization for the live
surface, and omit tools that are not available.

---

## Image Optimization

Read [references/image-optimization.md](references/image-optimization.md)
before exporting any web asset: it holds the format guide, the optimization
checklist, local conversion commands, and the safe page-inspection rule.

The largest above-the-fold image is usually the Largest Contentful Paint
element. Do not lazy-load it; give it `fetchpriority="high"` and explicit
dimensions. Core Web Vitals and image-indexing audits route to
`suede-seo-audit`.

---

## OG & Social Preview Images

The image that appears when your URL is shared on social media, Slack, Discord, etc.

### Common Meta Tags

Verify the current crawler/platform specification and use absolute public URLs.
The values below are a starting template, not proof of platform compliance.

```html
<meta property="og:image" content="https://yoursite.com/og/page-name.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://yoursite.com/og/page-name.jpg" />
```

### Dynamic OG Images

For dynamic pages, see the template options in
[references/image-optimization.md](references/image-optimization.md); verify the
framework, installed packages, and runtime first.

---

## Common Mistakes

1. **Skipping image optimization**: oversized images can materially hurt page performance
2. **No preview image**: platforms may fall back to a less useful preview
3. **Inconsistent brand visuals**: use locked, approved templates for consistency

---

## Halt Contract

Use this exact format when a callable tool, cost approval, rights confirmation,
or the approved brand asset blocks the requested result:

```text
HALT: <one-line blocker>
Why it blocks: <specific missing authority or evidence>
Resolve with:
1. <option>
2. <option>
3. <option, when useful>
Waiting for: <the exact item or approval>
```

Continue with the no-tool handoff artifacts above only when they remain useful
and do not imply an image was produced.

---

## Boundaries

- Brand mark: for Suede AI visuals, use only `docs/assets/suede-ai-logo-transparent.png`
  from `JasonColapietro/suede-creator-skills` (SHA-256
  `83a7ee0317e4debe2e7b076c20ba067feb76a587f9e829dc6310ae4be4b44dfa`). Outside that checkout,
  fetch the same file from
  `https://raw.githubusercontent.com/JasonColapietro/suede-creator-skills/cbd192309580a32da375881e0eeb4b2450a554c2/docs/assets/suede-ai-logo-transparent.png`
  and verify its SHA-256 before use. Never redraw, trace, typeset, recolor,
  distort, or generate a replacement S. `suede-skill-icon.png` is a Passport
  icon, not the brand mark. Omit the mark and halt for the approved file only
  if the fetch fails or the checksum differs.
- Do not claim an image is licensed, rights-cleared, authentic, accessible, optimized, or platform-compliant without verifying the relevant source or output.
- Do not use a paid provider, upload protected material, or cross an approved
  account or data boundary without explicit authority and a verified maximum cost.
- Do not publish, overwrite source assets, or replace real product screenshots without explicit authorization.
- Do not invent people, endorsements, product interfaces, performance results, or provenance, and do not decide rights or brand exceptions for the user.

## Routing

- Use `suede-ad-creative` for paid-ad production and `suede-video` for motion.
- Use `suede-social` for channel strategy and `suede-site-alchemy` for conversion placement.
- Use `suede-social` for platform format contracts (Reel covers, carousel slide counts, Story frames) before producing those assets here.
- Use `suede-seo-audit` for image-search checks and `suede-aso` for app-store screenshots.
- Use `suede-directory-submissions` for directory gallery planning.

## Worked contract

[Worked contract](references/usage-contract.md) gives a bounded input, expected output and failure check for this workflow.
