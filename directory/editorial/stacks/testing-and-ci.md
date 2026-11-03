# What is the best agent skill stack for testing and faster CI?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** The AI testing tools I would install first are [ci-speedup](https://skills.suedeai.ai/directory/mblode/agent-skills/ci-speedup/) from mblode/agent-skills (91/100), which measures the pipeline's critical path from run timestamps and then splits, shards and trims setup with a before and after ledger, and [manual-tester](https://skills.suedeai.ai/directory/tronghieu/agent-skills/manual-tester/) from tronghieu/agent-skills (92/100), which plans and runs manual sessions against the running app in five modes. Go teams add [go-ci](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/go-ci/) (95/100), the top score. For browser tests, pick one playwright-skill or cypress-tap, and add mirrord-chaos for chaos testing.

## The stack

Seven skills, in score order. Two of them share the name playwright-skill; the repository column tells them apart. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [go-ci](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/go-ci/) | [eduardo-sl/go-agent-skills](https://github.com/eduardo-sl/go-agent-skills) | 95/100 | Sets up continuous integration for Go projects with GitHub Actions, caching, golangci-lint, test and coverage gates, vulnerability scanning, SAST, Dependabot and build matrices. |
| [manual-tester](https://skills.suedeai.ai/directory/tronghieu/agent-skills/manual-tester/) | [tronghieu/agent-skills](https://github.com/tronghieu/agent-skills) | 92/100 | Plans and runs manual test sessions of the running app in five modes, including exploratory, smoke and assessment, and writes manual test plans. |
| [ci-speedup](https://skills.suedeai.ai/directory/mblode/agent-skills/ci-speedup/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 91/100 | Cuts CI wait by measuring a pipeline's critical path from run timestamps, then splitting, sharding and trimming setup, with a before and after ledger. |
| [playwright-skill](https://skills.suedeai.ai/directory/lambdatest/agent-skills/playwright-skill/) | [LambdaTest/agent-skills](https://github.com/LambdaTest/agent-skills) | 86/100 | Generates Playwright automation scripts and end-to-end tests in TypeScript, JavaScript, Python, Java or C#, run locally or on TestMu AI cloud. |
| [playwright-skill](https://skills.suedeai.ai/directory/lackeyjb/playwright-skill/playwright-skill/) | [lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill) | 85/100 | Automates browsers with Playwright, auto-detecting dev servers and writing reusable scripts for screenshots, responsive checks, UX validation, login flows and link checks. |
| [cypress-tap](https://skills.suedeai.ai/directory/cypress-io/ai-toolkit/cypress-tap/) | [cypress-io/ai-toolkit](https://github.com/cypress-io/ai-toolkit) | 85/100 | Drives a running Cypress open-mode session to run and rerun specs, wait for results, inspect logs, and query or rewind the app under test. |
| [mirrord-chaos](https://skills.suedeai.ai/directory/metalbear-co/skills/mirrord-chaos/) | [metalbear-co/skills](https://github.com/metalbear-co/skills) | 84/100 | Helps chaos test apps with mirrord by injecting artificial latency or connection errors into a session's outgoing traffic using per-session chaos rules. |

## Who this stack is for

This stack is for teams whose agent writes code faster than anyone can check it. If PRs wait fifteen minutes on CI, or a release ships with nobody clicking through the app, the gap is testing, not coding.

Concrete fits: a developer whose PRs queue behind slow CI, a QA lead who wants AI test automation for the end-to-end suite and a structured manual pass for what automation cannot judge, a Go team setting up GitHub Actions from scratch, and a platform engineer who wants to know what the app does when a database slows down.

You will not need all seven: pick one browser skill for your framework, add the CI and manual skills, and treat go-ci and mirrord-chaos as situational.

All seven use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and other agents that read a SKILL.md.

## The Suede AI skill built for this job

I built [suede-ci-gate](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-ci-gate) for exactly this job: turning CI into a gate a merge can trust. Ask it to "fix a required check stuck pending", or to set up branch protection and path-aware CI from the real repository, and it returns the workflows and settings themselves. It is my company's skill, so it stays out of this page's ranking.

It makes the pipeline decisions that usually stay vague. Which checks run on which paths. Which runtime and lockfile versions are pinned. And the one aggregator gate that branch protection requires, so the merge rule points at a single check.

Start with it before anyone tunes the pipeline. It owns the gate, and the third-party picks fill it: go-ci writes the Go jobs, the browser skills supply end-to-end tests, manual-tester and mirrord-chaos cover what automation misses, and ci-speedup cuts the time once the required checks are settled. Its description sends implementation review, AI eval design and release packaging elsewhere.

Put the gate in first:

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-ci-gate
```

## The skills, one by one

### go-ci: CI for Go projects

[go-ci](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/go-ci/) from eduardo-sl/go-agent-skills scores 95/100, grade A, the top of the stack. It sets up continuous integration for Go: GitHub Actions pipelines, caching, golangci-lint, test and coverage gates, vulnerability scanning, SAST with CodeQL and gosec, Dependabot, action pinning, build matrices and Makefile targets.

The SKILL.md runs in nine numbered parts: a baseline workflow, golangci-lint configuration, a build matrix only when you ship one, a coverage gate, a Makefile as a local mirror of CI, speed rules, security gates, dependency updates and action pinning, and workflow and repository hardening. A verification checklist closes it. There are no bundled scripts, environment variables, outside hosts or MCP.

Its triggers include "CI is slow", "coverage gate" and "run govulncheck in CI". I value the Makefile mirror most: the agent can reproduce a CI failure locally with the same targets. It scopes itself out of commit conventions, dependency audits, writing tests (go-test-quality) and releases (go-build-release). It is MIT licensed, with fewer than 1,000 installs recorded by skills.sh. Outside Go, skip it.

A prompt that fits it:

```text
Set up GitHub Actions for this Go module: cache modules, run golangci-lint and govulncheck, gate coverage at 70 percent, and add a matching Makefile.
```

### manual-tester: structured manual sessions

[manual-tester](https://skills.suedeai.ai/directory/tronghieu/agent-skills/manual-tester/) from tronghieu/agent-skills (92/100, grade A) plans and runs manual tests of the project's running app. A session runs in one of five modes: exploratory, verification, smoke, assessment (UX, localization, accessibility and improvement review) or AI probe, which tests an AI agent's answers. It also writes a manual test plan that holds only what automated tests cannot judge.

Each session follows numbered stages: preflight, mission, drive, verify, report and debrief. A project adapter in a project/testing/ folder holds per-project settings, and templates cover environment files and verification queries. The skill bundles four Python scripts; it reads no environment variables, names no outside hosts and does not use MCP. READMEs ship in English, Vietnamese and Chinese.

Its triggers work in any language, from "bug hunt" to "verify the bug fix", and it will execute test-case IDs you assign. It is explicitly not for writing automated tests. Use it before a release, after a bug fix, or when a screen needs a UX read. MIT licensed, with fewer than 100 installs recorded by skills.sh.

A prompt that fits it:

```text
Run a smoke session on the checkout flow of the app running at localhost:3000, then write a manual test plan for what our Playwright suite cannot judge.
```

### ci-speedup: measure, then cut CI time

[ci-speedup](https://skills.suedeai.ai/directory/mblode/agent-skills/ci-speedup/) from mblode/agent-skills (91/100, grade A) cuts the wait from push to green. It measures a pipeline's critical path from run timestamps, then splits, shards, trims setup and shares test module state, and keeps a before and after ledger.

The workflow has five steps: a baseline from timestamps, choosing levers, changing the pipeline and re-timing locally, pushing and reading the after-measurement, and a ledger with guardrails. References cover measuring, levers and the ledger. One bundled shell script, ci-timings.sh, does the timing work, and an evals file ships alongside. It reads no environment variables, names no outside hosts and uses no MCP.

Its triggers include "CI is slow" and "why does a PR take 15 minutes", and it names a case worth taking seriously: agents merging faster than checks finish. Measuring first is the point. A guess about the slow step is usually wrong, and the ledger shows which lever bought which minutes.

MIT licensed, with fewer than 1,000 installs recorded by skills.sh.

A prompt that fits it:

```text
Our PR checks take 18 minutes. Baseline the critical path from the last 20 runs, propose levers, and keep a before and after ledger.
```

### playwright-skill (LambdaTest): generated end-to-end suites

[playwright-skill](https://skills.suedeai.ai/directory/lambdatest/agent-skills/playwright-skill/) from LambdaTest/agent-skills (86/100, grade B) generates Playwright automation scripts and end-to-end tests in TypeScript, JavaScript, Python, Java or C#. It runs locally or on TestMu AI cloud across 3,000+ browser and OS combinations and real mobile devices. The directory marks the repository as an official publisher.

Its SKILL.md works through execution target, language and scope, then core TypeScript patterns: selector priority, web-first assertions, anti-patterns, the page object model, local configuration and cloud execution. A quick reference covers auth state reuse and built-in visual regression. References add flaky-test debugging, API mocking with visual checks, mobile testing, a playbook and Java, Python and C# patterns, and its scripts scaffold a project and validate the config.

It bundles two TypeScript scripts, one Python script and one shell script, runs npx, makes network calls and reads an LT_ACCESS_KEY environment variable for the cloud option. MIT licensed, with fewer than 1,000 installs recorded by skills.sh. Choose it for a maintained suite, cross-browser runs or real devices; for a quick look at one page, the lackeyjb version is lighter.

A prompt that fits it:

```text
Write Playwright tests in TypeScript for signup and password reset, using the page object model and web-first assertions. Run them locally first.
```

### playwright-skill (lackeyjb): quick browser checks

[playwright-skill](https://skills.suedeai.ai/directory/lackeyjb/playwright-skill/playwright-skill/) from lackeyjb/playwright-skill (85/100, grade B) is browser automation for checking a site fast. It auto-detects dev servers, writes reusable test scripts, and handles screenshots, responsive checks, UX validation, login flows, link checks and arbitrary browser automation.

The SKILL.md covers path resolution, the workflow, setup, a minimal example and current Playwright patterns, then common tasks: responsive checks, a login flow, saving scripts and artifacts, and connecting to an existing Chrome session. It ships a helpers library, a run.js entry point and an API reference. That means two bundled JavaScript scripts, and it makes network calls; it reads no environment variables and uses no MCP.

With about 7,000 installs recorded by skills.sh, it is the most installed skill in this stack, and the one I would hand to a developer who wants answers about a page in minutes rather than a suite to maintain. It is the wrong choice for a cross-browser matrix or real devices, which is the LambdaTest skill's job. MIT licensed.

A prompt that fits it:

```text
Find my dev server, screenshot the pricing page at mobile, tablet and desktop widths, and check every link on it.
```

### cypress-tap: drive a live Cypress session

[cypress-tap](https://skills.suedeai.ai/directory/cypress-io/ai-toolkit/cypress-tap/) from cypress-io/ai-toolkit (85/100, grade B) drives a running Cypress open-mode session through `cypress tap`. The agent can run and rerun specs, wait for fresh results, inspect reporter and command logs, and query or rewind the app under test through the DOM, accessibility, styles and snapshots. The directory marks it as an official publisher repository.

It is for authoring or debugging Cypress end-to-end and component specs, discovering selectors and diagnosing failures without GUI interaction. It is not for one-shot headless runs. It requires Cypress 15.21+, a Chromium-family browser and a running `cypress open` session.

The SKILL.md covers prerequisites, routing by task, core commands, a non-negotiable verdict rule, correctness rules, an output contract and performance defaults. References cover reading results, reading the app, recipes, session lifecycle and troubleshooting. No bundled scripts, environment variables, outside hosts or MCP. MIT licensed, with about 3,000 installs recorded by skills.sh. On Cypress, this replaces the Playwright skills. The gain is iteration speed: the agent reads the live session instead of rerunning the whole suite.

A prompt that fits it:

```text
My cypress open session is running. Rerun cart.cy.ts, read the command log for the failing step, and find a stable selector for the coupon field.
```

### mirrord-chaos: latency and failure injection

[mirrord-chaos](https://skills.suedeai.ai/directory/metalbear-co/skills/mirrord-chaos/) from metalbear-co/skills (84/100, grade B) helps you chaos test an app with mirrord. It injects artificial latency or connection errors (reset, timed out, refused) into a mirrord session's outgoing traffic, using per-session chaos rules managed with the `mirrord chaos` CLI. Its description says to use it instead of the deprecated experimental latency config.

The SKILL.md covers purpose, a security section marked must-follow, security boundaries, how chaos rules work, prerequisites, rule anatomy (selector fields, effects, output shape) and two modes: interactive and CI. Rules target outgoing connections or a single dependency, such as a slow database, through selector fields. Common issues and response guidelines close it. There are no bundled scripts, environment variables, outside hosts or MCP.

Use it when the app depends on a database or another service and you want to know what a slow dependency does to it, or to wire chaos rules into CI test runs. It needs mirrord. MIT licensed, with fewer than 100 installs recorded by skills.sh.

A prompt that fits it:

```text
Add 800 ms of latency to outgoing Postgres traffic in my mirrord session, run the order tests, and tell me which ones time out.
```

## How to use the stack together

1. Measure first with **ci-speedup**. Baseline the critical path from run timestamps before anyone touches the pipeline.
2. On a Go project, let **go-ci** lay down the baseline workflow, linting, coverage gate and security gates. Review the workflow diff like code.
3. Return to **ci-speedup** to choose levers, re-time locally and record the after-measurement. Merge only when the ledger shows the gain.
4. Pick one browser skill. **playwright-skill** from LambdaTest for a maintained suite or real devices, the lackeyjb **playwright-skill** for quick checks, or **cypress-tap** if you already run Cypress.
5. Before a release, run **manual-tester** in smoke or exploratory mode against the running app. Ask it for a test plan covering only what automation cannot judge.
6. When the app has external dependencies, add **mirrord-chaos** rules for latency and connection errors, first interactively, then in CI.
7. Turn what manual and chaos sessions find into automated tests, then rerun **ci-speedup** so new tests do not quietly slow CI again.

## Install the stack

```bash
npx skills add https://github.com/eduardo-sl/go-agent-skills/tree/main/skills/(workflow)/go-ci
npx skills add https://github.com/tronghieu/agent-skills/tree/main/skills/manual-tester
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/ci-speedup
npx skills add https://github.com/LambdaTest/agent-skills/tree/main/playwright-skill
npx skills add https://github.com/lackeyjb/playwright-skill/tree/main/skills/playwright-skill
npx skills add https://github.com/cypress-io/ai-toolkit/tree/main/skills/cypress-tap
npx skills add https://github.com/metalbear-co/skills/tree/main/skills/mirrord-chaos
```

The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [go-test-quality](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/go-test-quality/) | [eduardo-sl/go-agent-skills](https://github.com/eduardo-sl/go-agent-skills) | 93/100 | You need the Go tests themselves: subtests, fixtures, golden files, httptest, testcontainers or fuzzing. |
| [go-test-table-driven](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/#go-test-table-driven) | [eduardo-sl/go-agent-skills](https://github.com/eduardo-sl/go-agent-skills) | 93/100 | Your Go test tables have grown bloated and need restructuring. |
| [go-build-release](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/#go-build-release) | [eduardo-sl/go-agent-skills](https://github.com/eduardo-sl/go-agent-skills) | 93/100 | CI is green and the next job is reproducible, signed Go releases with SBOMs. |
| [pr-babysitter](https://skills.suedeai.ai/directory/mblode/agent-skills/pr-babysitter/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 91/100 | The pipeline is fine but open PRs keep failing CI, conflicting or collecting review threads. |
| [agentic-actions-auditor](https://skills.suedeai.ai/directory/trailofbits/skills/agentic-actions-auditor/) | [trailofbits/skills](https://github.com/trailofbits/skills) | 89/100 | Your workflows run AI agents such as Claude Code Action and you need prompt injection risks audited. |

go-test-quality partners go-ci: one writes the tests, the other runs them. pr-babysitter fits when the bottleneck is the PR, not the pipeline. agentic-actions-auditor belongs in any repository where an AI agent runs inside GitHub Actions.

## Common mistakes

- Optimizing CI by guesswork. ci-speedup baselines from run timestamps first, so you cut the step that is actually slow.
- Installing both playwright-skill listings in one project. Two skills with the same name invite confusion; pick one.
- Calling a suite done because it passes once. manual-tester's verification and smoke modes catch what the suite never asserted.
- Using cypress-tap for headless CI runs. It needs a live `cypress open` session and says it is not for one-shot headless runs.
- Chaos testing with mirrord's deprecated latency config. mirrord-chaos uses per-session rules through the `mirrord chaos` CLI instead.

## Licenses, costs and checks before you install

All seven picks are MIT licensed, an open license. Among the alternatives, agentic-actions-auditor is CC-BY-SA-4.0, a share-alike license; the rest are MIT.

The LambdaTest playwright-skill is the one to read closely. Its scripts run npx, make network calls and read an LT_ACCESS_KEY environment variable for TestMu AI cloud runs, so keep that key out of your repository. The lackeyjb playwright-skill also makes network calls. manual-tester bundles four Python scripts and ci-speedup one shell script; read them before the agent runs them.

The directory has not security scanned any listed skill. The [trust page](https://skills.suedeai.ai/directory/trust/) explains what it checks and what it does not. Read each SKILL.md and bundled script before you enable a skill, and review any workflow file an agent writes.

## Related topics and stacks

The [Test Automation](https://skills.suedeai.ai/directory/topics/test-automation/) topic lists 134 skills, [End-to-End and Browser Testing](https://skills.suedeai.ai/directory/topics/e2e-browser-testing/) lists 56, [CI/CD and DevOps](https://skills.suedeai.ai/directory/topics/ci-cd/) lists 39 and [Performance and Load Testing](https://skills.suedeai.ai/directory/topics/performance-testing/) lists 14. The [Testing and QA](https://skills.suedeai.ai/directory/testing-qa/) category holds the rest.

Testing pairs with the [code review stack](https://skills.suedeai.ai/directory/stacks/code-review/), which reads the diff your tests protect, and the [security audits stack](https://skills.suedeai.ai/directory/stacks/security-audits/) for the pipeline itself. Mobile teams should also see the [mobile apps stack](https://skills.suedeai.ai/directory/stacks/mobile-apps/).

## FAQ

### What are the best AI testing tools for Claude Code?

For Claude Code, I would start with ci-speedup (91/100) to measure and cut CI time and manual-tester (92/100) for structured manual sessions in five modes. Add one browser skill: a playwright-skill (86/100 or 85/100) or cypress-tap (85/100) if you use Cypress. Go teams add go-ci at 95/100, the top score in the set.

### How do I use Playwright with Claude Code?

Install one playwright-skill with the skills CLI, then ask Claude Code for the test in plain language. The LambdaTest version (86/100) generates end-to-end suites in five languages and can run on TestMu AI cloud. The lackeyjb version (85/100) auto-detects your dev server for screenshots, responsive checks, login flows and link checks.

### Which playwright-skill should I pick?

LambdaTest's (86/100) if you want generated end-to-end test suites in one of five languages, with the option to run them on TestMu AI cloud. lackeyjb's (85/100, about 7,000 installs recorded by skills.sh) if you want quick browser checks against a dev server. Install one, not both.

### Does ci-speedup change my pipeline on its own?

It measures the critical path, then splits, shards and trims setup, re-timing locally and recording a before and after ledger. Treat the ledger as the review artifact and read the pipeline diff before it merges. A faster pipeline that quietly dropped a job costs more later.

### Are these AI test automation skills free?

Yes, all seven are MIT licensed and free to install. The one cost to watch is the LambdaTest playwright-skill's cloud option, which reads an LT_ACCESS_KEY for TestMu AI runs; local runs need no key. Beyond that you pay for your agent's model usage.

### Do these skills work in Codex and Cursor?

Yes. All seven use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.
