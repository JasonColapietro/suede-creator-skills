# Output Formats

Delivery shapes for every mode. Every bracketed value comes from the client's inputs; nothing in an example is a number to reuse. Run the pre-delivery self-check in SKILL.md before handing any of these over.

### Standard Output

Organize by angle, with character counts:

```
## Angle: [Pain Point: Manual Reporting]

### Headlines (30 char max)
1. "Stop Building Reports by Hand" (29)
2. "Automate Your Weekly Reports" (28)
3. "Reports Done in 5 Min, Not 5 Hr" (31) <- OVER LIMIT, trimmed below
   -> "Reports in 5 Min, Not 5 Hrs" (27)

### Descriptions (90 char max)
1. "Marketing teams save [verified hours]/week with automated reporting. Start free." (bracketed values come from inputs or reviews)
2. "Connect your data sources once. Get automated reports forever. No code required." (80)
```

### Bulk CSV Output

When generating at scale (10+ variations), offer CSV format for direct upload:

```csv
headline_1,headline_2,headline_3,description_1,description_2,platform
"Stop Manual Reporting","Automate in 5 Minutes","Join [verified count] Teams","Save [verified hrs]/week on reports. Start free.","Connect data sources once. Reports forever.","google_ads"
```

### Static Batch Output (Mode 3)

For scaled static batches, save to a dated folder with an index:

```
outputs/YYYY-MM-DD/
  INDEX.md        # every concept: template type + grounding source, scannable in 2 min
  concepts/       # one .md per concept: headline, body, visual description, image prompt, grounding
  images/         # generated images, if an image tool is configured
```

Per-concept format is defined in [references/static-ad-templates.md](static-ad-templates.md). The human workflow this supports: open the folder, scan INDEX.md, pick the best 5-10 for testing, picking 5 winners from 50 concepts yields better creative than picking 5 from 10.

### Creative Review Page (client / stakeholder approval)

When a person who isn't you needs to review and pick, a client, a partner, a stakeholder, produce a **creative review page**: a self-contained HTML artifact that presents each concept as an in-feed platform mockup (Instagram/Facebook, with a whitelist-handle toggle), breaks carousels into a labeled frame-by-frame storyboard, lets them toggle headline/copy variations, and discloses what's grounded in real assets. It's the visual upgrade to INDEX.md, a decision made off one link instead of by reading markdown. The template ships at [assets/creative-review-template.html](../assets/creative-review-template.html) (one file, no build, hostable anywhere); populate its `DATA` object from your generated concepts. Full data model, grounding rules (the disclosure block is required), and delivery in [references/creative-review-page.md](creative-review-page.md).

### Iteration Report

When iterating, include a summary:

```
## Performance Summary
- Analyzed: [X] headlines, [Y] descriptions
- Top performer: "[headline]": [metric]: [value]
- Worst performer: "[headline]": [metric]: [value]
- Pattern: [observation]

## New Creative
[organized variations]

## Recommendations
- [What to pause, what to scale, what to test next]
```
