# What is the best agent skill stack for testing and faster CI?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 2, 2026.

**Short answer:** [ci-speedup](https://skills.suedeai.ai/directory/mblode/agent-skills/ci-speedup/) from mblode/agent-skills (91/100) measures the pipeline's critical path from run timestamps, then splits, shards and trims setup with a before and after ledger, and [manual-tester](https://skills.suedeai.ai/directory/tronghieu/agent-skills/manual-tester/) from tronghieu/agent-skills (92/100) plans and runs manual sessions against the running app in five modes. Go teams get [go-ci](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/go-ci/) from eduardo-sl/go-agent-skills (95/100), the top score in the set. For browser tests, pick one of the two playwright-skill listings or cypress-tap if you are on Cypress, and add mirrord-chaos for chaos testing.

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

## How to use it

1. Measure before you optimize. **ci-speedup** reads the critical path from run timestamps, then splits, shards and trims setup, and keeps a before and after ledger. Read the ledger before you merge the pipeline change. In my experience the setup, not the tests, is where the minutes go.
2. If the project is Go, let **go-ci** set up GitHub Actions with caching, golangci-lint, test and coverage gates, vulnerability scanning, SAST, Dependabot and build matrices. Everything else in this stack is language-agnostic.
3. For end-to-end tests, choose one playwright-skill. The LambdaTest version generates Playwright scripts and tests in TypeScript, JavaScript, Python, Java or C#, run locally or on TestMu AI cloud. The lackeyjb version auto-detects dev servers and writes reusable scripts for screenshots, responsive checks, UX validation, login flows and link checks. Generated suites or quick checks: decide which you need.
4. On Cypress, **cypress-tap** drives a running open-mode session: run and rerun specs, wait for results, inspect logs, and query or rewind the app under test.
5. Before a release, run **manual-tester**. It plans and runs manual sessions of the running app in five modes, including exploratory, smoke and assessment, and it writes the manual test plan so the next person can repeat it.
6. When the app depends on other services, **mirrord-chaos** injects artificial latency or connection errors into a session's outgoing traffic with per-session chaos rules. Find out what breaks before a customer does.

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

The [skills CLI](https://skills.sh/) works for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## What to check before you install

- Licenses: all seven are MIT. Confirm the license file in each repository anyway.
- Services: the LambdaTest playwright-skill can run on TestMu AI cloud, which is an account. cypress-tap needs a Cypress open-mode session already running. mirrord-chaos needs mirrord. go-ci writes GitHub Actions workflows into your repository, so review that diff like any other.
- Read each SKILL.md before you enable it. The directory has not security scanned any skill.

## FAQ

### Which playwright-skill should I pick?

LambdaTest's (86/100) if you want generated end-to-end test suites in one of five languages, with the option to run them on TestMu AI cloud. lackeyjb's (85/100, about 7,200 installs recorded by skills.sh) if you want quick browser checks against a dev server: screenshots, responsive checks, login flows, link checks. Install one; two skills with the same name in one project invites confusion.

### Do these skills work in Codex and Cursor?

Yes. All seven use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Does ci-speedup change my pipeline on its own?

Its summary describes measuring the critical path, then splitting, sharding and trimming setup, with a before and after ledger. Treat the ledger as the review artifact and read the pipeline diff before it merges. A faster pipeline that quietly dropped a job is slower in the end, because you find out in production.
