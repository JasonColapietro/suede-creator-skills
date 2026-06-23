---
name: suede-ai-eval
description: "Design AI evaluation strategy, failure-mode rubrics, AI-SPEC artifacts, prompt and retrieval test cases, acceptance gates, and retroactive eval coverage audits for AI-powered product surfaces. Use when a feature uses an LLM, classifier, recommender, agent workflow, RAG/search, media generation, or other AI behavior that needs measurable quality, safety, and regression checks."
---

# Suede AI Eval

Use this skill to make AI behavior testable before it becomes a vague product promise.

The deliverable is an eval plan or coverage audit, not a model benchmark leaderboard. Keep it grounded in the actual product surface, user promise, data sources, prompts, tools, logs, tests, and failure modes available now.

## Source Truth

Inspect the current target before writing the eval. Do not evaluate from memory or product copy alone.

Read or verify:

- repo, branch, remote, dirty state, local instructions, and touched files;
- the AI surface: route, API, worker, prompt, system message, tool call, model config, retrieval path, classifier, agent loop, generated media path, or recommendation logic;
- user-facing promise, allowed claims, forbidden claims, safety boundaries, fallback behavior, and support path;
- input data, retrieval corpus, schemas, tool contracts, metadata, logs, telemetry, and persisted outputs;
- existing tests, fixtures, eval scripts, prompt snapshots, golden examples, analytics, bug reports, screenshots, or live/API readbacks.

When the surface is already live, sample real behavior with safe inputs and record exact commands or URLs. When live checks are not appropriate, mark the eval as source-only and name the missing runtime evidence.

## Workflow

1. **Define the AI-SPEC.** State the AI job in one paragraph: user, trigger, input, output, allowed sources, disallowed behavior, fallback, latency/cost expectation, and success signal.
2. **Map the failure modes.** List the ways the AI can harm the user, product truth, rights/provenance, security, privacy, brand trust, cost, or workflow completion.
3. **Build the rubric.** Score each failure mode with severity, likelihood, detectability, owner, gate, and required evidence.
4. **Write eval cases.** Produce concrete pass/fail cases with inputs, setup data, expected output traits, forbidden output traits, and the reason the case exists.
5. **Set acceptance gates.** Decide what blocks ship, what allows ship-with-caveats, and what can become follow-up work.
6. **Audit coverage.** Compare existing tests, logs, metrics, and manual checks against the failure-mode map. Name every uncovered high-risk behavior.
7. **Return the artifact.** Give the AI-SPEC, rubric, eval table, coverage gaps, required tests, and next implementation step.

## Eval Case Design

Prefer small, reviewable eval suites over theatrical giant scorecards.

Each case should include:

- **case id:** stable name, e.g. `rights-claim-refusal-001`;
- **scenario:** why this input matters;
- **input:** prompt, API body, file, metadata, or retrieval query;
- **setup:** fixtures, user state, permissions, corpus state, or tool mocks;
- **expected pass traits:** observable traits, not hidden intent;
- **forbidden traits:** claims, sources, actions, or outputs that fail the case;
- **grade lane:** correctness, safety, rights/provenance, privacy, security, UX, cost, latency, or retrieval truth;
- **gate:** block, warn, monitor, or informational.

Use adversarial and mundane cases. Include at least:

- happy path that proves the intended value;
- ambiguous input that should ask a clarifying question or choose a safe fallback;
- forbidden claim or unsafe instruction that should be refused or rewritten;
- stale, missing, or conflicting source data;
- permissions or privacy boundary;
- expensive or looping behavior;
- regression case from a real bug, support note, or observed failure when available.

## Rubric

Use this table shape:

| Failure mode | Severity | Likelihood | Detectability | Evidence now | Ship gate | Required fix |
|---|---:|---:|---:|---|---|---|
| Hallucinates a rights claim | 5 | 3 | 2 | none | block | add refusal eval + source citation check |

Scoring:

- **Severity 5:** legal, financial, rights/provenance, privacy, security, payment, irreversible user harm, or public trust collapse.
- **Severity 4:** user-visible wrong outcome on a core workflow, broken agent action, major cost spike, or misleading public claim.
- **Severity 3:** recoverable user confusion, incomplete answer, or degraded workflow quality.
- **Severity 2:** minor formatting, tone, or non-core quality miss.
- **Severity 1:** cosmetic or informational.

Gate defaults:

- Any uncovered severity 5 behavior blocks release.
- Severity 4 requires an eval case, fallback behavior, and named owner before release.
- Regressions from real observed failures require a fixture or scripted check.
- Product copy cannot claim eval coverage that does not exist.

## AI-SPEC Template

```text
AI-SPEC: [surface/name]
Date:
Target repo/route/API:
Owner:

User promise:
Inputs:
Outputs:
Allowed sources:
Disallowed behavior:
Fallback behavior:
Privacy/security boundaries:
Rights/provenance boundaries:
Latency/cost budget:
Success metrics:
Known non-goals:

Failure modes:
Eval suite:
Acceptance gates:
Coverage gaps:
Next implementation step:
```

## Output

Return:

```text
Target:
AI-SPEC:
Failure-mode rubric:
Eval cases:
Existing coverage:
Missing coverage:
Ship gate: ship | ship-with-caveats | hold
Required next step:
Commands or evidence checked:
```

## Boundaries

- Do not claim legal, rights, licensing, medical, financial, or compliance clearance.
- Do not invent private datasets, logs, scores, or customer outcomes.
- Do not upload data, call private services, or run destructive workflows unless the user explicitly asks and the repo/tooling supports it.
- Do not treat a model's self-judgment as sufficient evidence.
- Do not mark eval coverage complete when only prompt review or happy-path manual testing exists.
