# Agent, Trajectory, and Judge Evals

Read this when the surface is a tool-using or multi-agent system, when the plan relies on an LLM judge, or when deciding how many trials a case needs. It extends the rubric and case design; it does not replace them.

Verified against official docs on 2026-10-25.

Sources:

- https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents (Anthropic Engineering, January 9, 2026)
- https://www.promptfoo.dev/docs/configuration/expected-outputs/
- https://developers.openai.com/api/docs/guides/agent-evals
- https://developers.openai.com/api/docs/deprecations

## Vocabulary to use in the plan

From the Anthropic article: a **task** is one test with inputs and success criteria; a **trial** is one attempt at it; the **transcript** (also called trace or trajectory) is the full record of a trial, including tool calls and intermediate results; the **outcome** is the final state of the environment. A booking agent can say "booked" while the outcome check finds no reservation in the database. Grade the outcome whenever one exists.

## Grade the outcome first, then the path

- Prefer checks on what the agent produced or changed (database row, file, API state) over a rigid expected tool sequence. Agents find valid routes the case author did not plan, and a sequence check fails them.
- Use path checks for rules that are real constraints: a tool that must never be called, a permission check that must precede a write, a call budget. Those are safety and cost rows in the rubric, and the path is the thing being tested.
- Give partial credit on multi-step tasks. An agent that verifies the customer and then fails the refund is better than one that fails at step one, and a binary score hides that.

## Trials, pass@k, and pass^k

A single trial of a non-deterministic agent proves little. Run each case several times from a clean environment (shared state between trials produces correlated failures that look like model failures).

- **pass@k**: chance that at least one of k trials succeeds. Rises with k. Fits tools where a person picks the best of several attempts.
- **pass^k**: chance that all k trials succeed. Falls with k. Fits customer-facing agents where every request must work. The article's example: 75% per trial gives about 42% for pass^3.

State which one each gate uses. For severity 4 and 5 rows on customer-facing agents, use pass^k with k of at least 3, and write the per-trial rate next to it so the reader can see the math.

## Capability suites and regression suites

- **Capability suite**: tasks the agent cannot reliably do yet. A low pass rate is expected and is the point.
- **Regression suite**: tasks it already handles. Target near 100%; any drop is a gate failure.
- Promote capability tasks into the regression suite once they pass consistently. A suite sitting at 100% catches regressions but no longer measures improvement (saturation), so keep a capability suite alongside it.
- A 0% pass rate across many trials on a frontier model usually means a broken task or grader, not an incapable agent. Read the transcripts before reporting it as a model gap.

## Read transcripts before trusting a score

Record in the plan who reads a sample of transcripts and grades each iteration. Transcripts separate real agent mistakes from graders that reject valid answers. The article reports a CORE-Bench score moving from 42% to 95% after grading bugs and ambiguous specs were fixed, which is the size of error an unread grader can hide.

Case quality test from the same source: two domain experts should independently reach the same pass/fail verdict on a case. If they would not, rewrite the case before counting it. Each case should also have a reference solution known to pass every grader. Build balanced sets: cases where a behavior should happen and cases where it should not.

## LLM-as-judge calibration

The Hard Gate already says a judge score counts only after agreement with a human-reviewed sample. Make that concrete:

1. Have a human label a sample of real outputs pass/fail before the judge sees them.
2. Run the judge on the same sample and report the agreement rate, plus the disagreements by case id. Do not invent a target number; let the user set the bar and record it.
3. Give the judge an explicit "Unknown" or "cannot tell" option so it does not guess.
4. Use one judge per rubric dimension instead of one judge scoring everything at once.
5. Keep judged text short. For long artifacts, grade structure and required content with code checks and reserve the judge for the part that needs judgment.
6. Pin the judge model and version. A judge change is a grader change and invalidates trend comparisons.
7. Re-run the calibration sample when the rubric, judge model, or prompt changes.

## Tooling for trajectory checks

Promptfoo has trace and trajectory assertions (names verified on its expected-outputs page): `trajectory:tool-used`, `trajectory:tool-args-match`, `trajectory:tool-sequence`, `trajectory:step-count`, `trajectory:goal-success` (LLM judge), `trace-span-count`, `trace-span-duration`, `trace-error-spans`, `tool-call-f1`, and `is-valid-openai-tools-call`. Map rubric rows to them: required or forbidden tools to `trajectory:tool-used`, argument safety to `trajectory:tool-args-match`, loop or cost rows to `trajectory:step-count`, latency rows to `trace-span-duration`. Check that page for each assertion's exact config keys before writing YAML.

For Claude Code plugins, `claude plugin eval` covers the same ground with `tool_used`, `tool_order`, and `regex` over `target: trace`. See `references/skill-and-plugin-evals.md`.

OpenAI describes trace grading in its dashboard (Logs > Traces, create a grader, run it on selected traces) for traces from the Agents SDK. It is a dashboard workflow, not a CI command.

## OpenAI Evals platform shutdown

OpenAI's deprecations page lists the Evals platform as deprecated (announced June 3, 2026): existing evals become read-only on October 31, 2026, and the Evals dashboard and API are scheduled to shut down on November 30, 2026. Graders documented for eval workflows are part of that transition. OpenAI's cookbook points to Promptfoo as the migration path.

If the tooling scan finds the OpenAI Evals API in use (`client.evals`, `evals.create`, `evals.runs`, or grader configs with `string_check`, `text_similarity`, `score_model`), mark the CI/CD and tooling infrastructure items `partial` at best, add the shutdown date to Coverage gaps, and list migration as a required next step. The cookbook warns that recreated similarity and LLM-judge graders may not reproduce the same numbers, so re-run judge calibration after migrating instead of carrying old thresholds over.
