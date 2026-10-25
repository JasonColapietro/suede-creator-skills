# Skill and Plugin Evals (Claude Code)

Read this when the AI surface under test is a Claude Code skill, plugin, subagent, or hook bundle, or when the user asks to eval a skill pack. These surfaces now have first-party eval tooling, so the eval plan should name a real runnable command instead of a hand-rolled harness.

Verified against official docs on 2026-10-25. Re-check flags with `claude plugin eval --help` before quoting them in a plan, since the command is new and still changing.

Sources:

- https://code.claude.com/docs/en/plugin-evals
- https://code.claude.com/docs/en/skills (sections "Run evals with skill-creator" and "Find unused skills")
- https://agentskills.io/skill-creation/evaluating-skills

## Pick the tool

| Situation | Tool | Case format |
|---|---|---|
| Skill ships inside a plugin, or the team wants a CI gate | `claude plugin eval` | `evals/<case>/prompt.md` plus `graders/*.md` (optionally `case.yaml`) |
| Iterating on one skill inside a Claude Code conversation | skill-creator plugin | `evals/evals.json` in the skill directory |
| Deciding which installed skills cost context and never fire | `/skill-doctor` | none; it is a usage report, not an eval |

The two case formats are not interchangeable. Neither tool reads the other's case files. If a repo already keeps `evals/evals.json` per skill (the skill-creator format), say so in the plan and do not claim those cases run under `claude plugin eval`.

## `claude plugin eval`

Requirements per the docs: Claude Code v2.1.269 or later, git 2.31 or later if git is installed, and a plugin directory with a manifest or a skills-directory plugin. Every run and every judge grader is a real model call billed to the user's plan or API account, so state the cost ceiling in the plan.

How it scores:

- Each case runs 3 times by default in a fresh, isolated `claude -p` session with only the plugin loaded. A run's score is the fraction of graders that passed (weighted if weights are set). A case's score is the mean across runs, and it passes at `--threshold` (default `1.0`).
- By default each case also runs with no plugin loaded. The report shows `WITH`, `W/OUT`, and `Δ`. A case that scores 1.0 in both arms proves the plugin is not what made it pass. Put that finding in the coverage audit: it is a case that measures the base model, not the skill.
- `tool_used` graders on `Skill` are excluded from the score in two-arm runs and shown as a "plugin-fired indicator" only. Set `arm: both` on a "must not invoke the skill" grader (`min: 0`, `max: 0`) so negative-trigger cases still count.

Grader types (no custom-code graders exist):

| Type | Cost | Use it for |
|---|---|---|
| `regex` | free | Required or forbidden text in the reply, the trace, or a produced file (`match: not_contains`, `match: "count:N"`) |
| `tool_used` | free | The skill fired; a tool was or was never called; call count bounds |
| `tool_order` | free | One tool call precedes another (for example a read before a write) |
| `file_exists` | free | A file was created during the run (not edited, not scaffolded) |
| `llm` | judge calls | Short outputs graded on a PASS/FAIL rubric; passes on 2 of 3 judge votes |
| `baseline` | judge calls | Run is at least as good as a reference transcript `.jsonl` |

Map the rubric's measurement approach onto these: code-based checks become `regex`, `tool_used`, `tool_order`, `file_exists`; LLM-judge checks become `llm` with concrete PASS and FAIL lines. The docs advise one grader on the result and one on the steps per case, and `regex` over long file output instead of an `llm` judge, because judge verdicts vary more as text gets longer.

Isolation facts that change case design:

- Each run starts in an empty workspace. Personal and project config (`CLAUDE.md`, `.claude/`, `.mcp.json`, user hooks, other plugins) never loads. Put fixtures in the prompt, in `context.add_dirs`, or in a `context.scaffold_script` that runs only with `--scaffold`.
- Only read-only tools are available unless granted with `--allow-tools`. Granted Bash runs under the OS sandbox.
- The plugin's real MCP servers do not start by default. Mock each tool under `evals/mocks/<server>/<tool>.md`; an `expect:` block aborts the run with score 0 when the skill sends bad input, which is a cheap privacy or tool-contract check. Grade the calls with `target: mock_calls`.
- The Artifact tool is off, so a skill that publishes an artifact can only be graded on what it produced before that step.
- The agent under test cannot read the eval directory, so cases cannot leak into the run.

CI command shape from the docs (pin both models so a model rollout is not mistaken for a skill regression):

```bash
claude plugin eval . \
  --trust-plugin \
  --json results.json \
  --threshold 0.8 \
  --model <pinned-agent-model> \
  --judge-model <pinned-judge-model> \
  --no-publish \
  --max-cost-usd 20
```

Exit codes: `0` pass; `1` a case below threshold, a load error, no cases, an untrusted directory without `--trust-plugin`, or a run that ended on an API error; `2` partial run (cost ceiling or rejected credential, JSON still written with `partial: true`); `130` interrupted; `143` terminated. `Δ` never changes the exit code. Hand this command and its expected exit status to suede-ci-gate.

Fields a gate script reads from `aggregate-result.json` (`schemaVersion: 1`): `partial`, `partialReason`, `aggregates.overallScore`, `aggregates.casesPassed`, `aggregates.casesTotal`, `aggregates.meanDelta`, `cases[].aggregates.score`, `cases[].aggregates.delta`, `cases[].arms.with[].error`, `cases[].arms.with[].skippedPaidGraders`, `costUsd`, `claudeVersion`. Leave `partial: true` runs and runs with `skippedPaidGraders` out of any trend line.

Useful commands while iterating:

- `claude plugin eval init`: interactive; proposes should-trigger and should-not-trigger prompts, writes graders, trial-runs them.
- `claude plugin eval init --bare <name>`: blank template, works in CI.
- `claude plugin eval . --case <name> --runs 1 --ablation none`: one cheap single-arm run. Confirm any change at the default 3 runs before trusting it.

## skill-creator loop (`evals/evals.json`)

The skill-creator plugin stores cases in `evals/evals.json` inside the skill directory. Each case has `id`, `prompt`, `expected_output`, optional `files`, and `assertions` added after the first run. It runs each case with and without the skill (or against a snapshot of the previous version), grades assertions with evidence into `grading.json`, and aggregates pass rate, time, and tokens per configuration into `benchmark.json`. It also runs blind A/B comparison between two skill versions and description tuning from should-trigger and should-not-trigger prompts.

When auditing a suite in this format, flag:

- assertions that pass in both configurations (they measure the base model and inflate the with-skill rate);
- assertions that fail in both (broken assertion or impossible case);
- assertions too vague to grade ("the output is good") or brittle to exact wording;
- no without-skill or previous-version baseline, which means no evidence the skill adds anything;
- a token or time delta that is not reported next to the pass-rate delta.

## `/skill-doctor`

Requires Claude Code v2.1.252 or later. It reports what each non-bundled skill costs in context and how often it is used, flags listed skills that were never invoked, and lists plugins not used recently. Treat it as a production signal for the trigger dimension: a skill that never fires in real sessions has a description problem that a should-trigger eval case should reproduce. It is not pass/fail coverage and does not count toward the coverage score.
