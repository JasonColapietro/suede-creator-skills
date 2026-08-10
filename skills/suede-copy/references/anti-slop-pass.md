# Anti-Slop Pass

The line-edit pass: the patterns to cut, and the scored dimensions that decide whether copy is publishable.

## Anti-Slop Pass

Run this as a line-edit gate before delivery, not a vibe check.

### Word Substitution List

Make these swaps. Non-negotiable.

| Cut | Replace with |
|-----|-------------|
| utilize | use |
| leverage (as verb) | use, apply, run |
| seamless | remove or prove it: "no export step", "one command" |
| powerful | prove it: "processes 10k records in 4 seconds" |
| innovative | cut; name the innovation instead |
| revolutionary | cut entirely |
| game-changing | cut entirely |
| solution | name what it actually does |
| ecosystem | platform, system, toolchain (pick the accurate one) |
| empower | cut; say what the person now controls |
| unlock | cut; say what was blocked and is now accessible |
| streamline | speed up, cut the step, reduce from X to Y |
| intuitive | cut; prove it with a UX detail |
| robust | cut; name the specific capability |
| best-in-class | cut; or supply the benchmark |
| next-generation | cut; name what changed |
| cutting-edge | cut entirely |
| world-class | cut; or name the credential |
| end-to-end | name the actual start and end |
| holistic | cut; describe the scope instead |
| scalable | prove it: "handles X at Y load" |
| simple / simply / just / easy | cut or prove it with a step count |
| we believe / we think | cut; make the assertion directly |
| in order to | to |
| due to the fact that | because |
| at this point in time | now |
| going forward | cut; state the new behavior directly |
| synergy / synergistic | cut entirely |
| value-add | name the value |
| best practices | name the practice |

### Readability Gate

Aim for Flesch-Kincaid Grade Level 8-10 for B2B general audiences, Grade 6-8 for consumer audiences and onboarding, Grade 10-14 for technical/developer audiences where precision requires complexity.

Average sentence length under 18 words for consumer; under 22 words for B2B. Flag paragraphs over 4 sentences.

### Structure Gate

Rewrite:

- binary setup lines
- negative listing that defines the product by what it is not
- formulaic "not X, but Y" pivots
- false transformation arcs
- dramatic fragments
- rhetorical questions that answer themselves
- three-item cadence when two items work
- repeated punchy paragraph endings
- Wh-starter crutches when a direct actor and verb work better

### Actor Gate

Name who does the action. Prefer the creator, operator, buyer, agent, page, repo, workflow, file, command, route, or proof artifact.

- Weak: `The page converts traffic.`
- Better: `The page routes visitors to the audit, the proof link, or the build request.`
- Weak: `The market rewards provenance.`
- Better: `Licensing teams can inspect the provenance trail before they ask for the split sheet.`

### Rhythm Gate

- Keep one idea per sentence.
- Vary sentence length without using em dashes.
- Do not stack slogans where a concrete sentence would build more trust.
- Cut lazy extremes such as `always`, `never`, `everything`, and `nothing` unless the claim is literally true.

### Pull-Quote Gate

If a line sounds manufactured for a quote card, rewrite it with a real artifact, action, or proof point.

- Weak: `The future of creator ownership is here.`
- Better: `Suede turns a release folder into rights, provenance, split, and licensing evidence an agent can read.`
- Weak: `We're changing how music rights work.`
- Better: `Paste a folder path. Suede returns your ISRC status, missing fields, and a split-ready JSON file.`
- Weak: `Built for the next generation of creators.`
- Better: `A sync licensing team can open your release folder and read every rights claim without calling you.`

Score the copy before handoff:

```text
Directness: /10
Rhythm: /10
Trust: /10
Specificity: /10
Authenticity: /10
Density: /10
Search/AI readability: /10
Total: /70
```

Revise below 58/70. For public launch, homepage, GitHub, App Store, investor-adjacent, or public explainer copy, aim for 62/70 or higher.
