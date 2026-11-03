# What is the best agent skill stack for Claude Code security audits?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** For Claude Code security audits, I would start with [semgrep](https://skills.suedeai.ai/directory/trailofbits/skills/semgrep/) from trailofbits/skills (92/100), which plans a Semgrep scan, waits for your approval and merges the results to SARIF, and [codeql](https://skills.suedeai.ai/directory/trailofbits/skills/codeql/) from the same repository (92/100) for interprocedural data flow and taint tracking. Then run [trailmark-finding-triage](https://skills.suedeai.ai/directory/trailofbits/skills/trailmark-finding-triage/) (91/100) on each finding to test reachability before anyone writes a proof of concept. For CI, add agentic-actions-auditor and gha-security-review, and run skill-scanner on any skill before you install it.

## The stack

Six skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [semgrep](https://skills.suedeai.ai/directory/trailofbits/skills/semgrep/) | [trailofbits/skills](https://github.com/trailofbits/skills) | 92/100 | Runs a Semgrep security scan over a codebase, detecting languages, selecting rulesets, requiring approval of the plan and merging output to SARIF. |
| [codeql](https://skills.suedeai.ai/directory/trailofbits/skills/codeql/) | [trailofbits/skills](https://github.com/trailofbits/skills) | 92/100 | Scans a codebase for security vulnerabilities using CodeQL's interprocedural data flow and taint tracking, with run-all and important-only modes. |
| [trailmark-finding-triage](https://skills.suedeai.ai/directory/trailofbits/skills/trailmark-finding-triage/) | [trailofbits/skills](https://github.com/trailofbits/skills) | 91/100 | Triages a single security finding, SARIF result or suspicious function with Trailmark reachability, taint, privilege-boundary and blast-radius evidence. |
| [agentic-actions-auditor](https://skills.suedeai.ai/directory/trailofbits/skills/agentic-actions-auditor/) | [trailofbits/skills](https://github.com/trailofbits/skills) | 89/100 | Audits GitHub Actions workflows where attacker-controlled input reaches AI agents such as Claude Code Action, Gemini CLI or Codex. |
| [skill-scanner](https://skills.suedeai.ai/directory/getsentry/skills/skill-scanner/) | [getsentry/skills](https://github.com/getsentry/skills) | 88/100 | Scans agent skills for prompt injection, malicious scripts, excessive permissions, secret exposure and supply chain risks before installation. |
| [gha-security-review](https://skills.suedeai.ai/directory/getsentry/skills/gha-security-review/) | [getsentry/skills](https://github.com/getsentry/skills) | 86/100 | Reviews GitHub Actions workflows for pwn requests, expression injection, credential theft and supply chain attacks, with concrete proof-of-concept scenarios. |

## Who this stack is for

This stack is for teams that want an AI security audit with evidence behind every finding, not a list of maybes. It fits a developer about to open-source a repository, a lead preparing for an outside audit who wants the obvious issues gone first, and a security engineer who needs scanner output triaged before it reaches a ticket queue.

It also covers a newer problem: the pipeline itself. If your GitHub Actions workflows run Claude Code Action, Codex or another AI agent on pull requests, two of the six skills audit exactly that. And if your team installs agent skills freely, skill-scanner checks a skill before it runs on your machine.

The stack splits cleanly. semgrep and codeql find, trailmark-finding-triage decides, and the two GitHub Actions reviewers cover CI. Every pick comes from an official publisher repository, four from trailofbits/skills and two from getsentry/skills.

All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md.

## The Suede AI skill built for this job

I built [suede-code](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-code) for exactly this job: turning a diff, a branch or a commit range into evidence-backed findings ranked P0 to P3, each with a fix path, and an A to F ship grade. It is my company's skill, so it stays out of this page's ranking.

Security checks are one of its seven review lanes, alongside deploy safety and commit dirt, so a security finding arrives in the same report as the deploy risk. The severity order is the decision it makes for you: every finding is ranked P0 to P3 with a fix path, so the team stops arguing about what to fix first. It runs findings-only when you want the list, grade-only when you need a ship call, and fix mode when you want the repairs made.

Start with it on every pull request, then let the scanners go deep where they are strongest. semgrep and codeql sweep the whole codebase, trailmark-finding-triage proves reachability on the findings that matter, and the two GitHub Actions reviewers own the workflow files. Its description sends automatic CI enforcement, agent evaluations and parallel fix coordination to other skills, so it stays on the review.

Put it on your next pull request:

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-code
```

## The skills, one by one

### semgrep: the approved, batched scan

[semgrep](https://skills.suedeai.ai/directory/trailofbits/skills/semgrep/) from trailofbits/skills (92/100, grade A) runs a Semgrep security scan over a codebase. It detects languages, selects rulesets and presents the plan for explicit approval. Then it runs every approved ruleset through scripts/run-scans.sh, which batches the semgrep processes and writes scans.json, and merges the output to SARIF. It uses Semgrep Pro for cross-file taint analysis when that is available.

There are two scan modes: "run all" for full ruleset coverage, and "important only" for security findings at medium-to-high confidence and impact. The SKILL.md covers principles, prerequisites, scan modes, the orchestration architecture, the workflow and its agents, rationalizations to reject and success criteria.

It bundles two Python scripts (a SARIF merger and its test) and one shell script, makes network calls and names one outside host, json.schemastore.org. It reads no environment variables and uses no MCP.

The approval gate is why I start with it: you see the rulesets before the scan runs. Its license is CC-BY-SA-4.0, with about 10,000 installs recorded by skills.sh.

A prompt that fits it:

```text
Run a Semgrep scan on this repo in important-only mode. Show me the ruleset plan first, then merge the results to one SARIF file.
```

### codeql: data flow and taint tracking

[codeql](https://skills.suedeai.ai/directory/trailofbits/skills/codeql/) from trailofbits/skills (92/100, grade A) scans a codebase with CodeQL's interprocedural data flow and taint tracking. It covers Python, JavaScript/TypeScript, Go, Java/Kotlin, C/C++, C#, Ruby and Swift. "Run all" uses the security-and-quality and security-experimental suites, and "important only" is high precision. It can also create data extension models for project-specific sources and sinks.

The SKILL.md notes that each Bash call is a fresh shell, then covers database discovery, a quick start, rationalizations to reject and workflow selection, including unattended builds and auto-detection. References cover build fixes, diagnostic query templates, extension YAML, language details, performance tuning and a macOS arm64e workaround.

It is the largest pick by files: twelve Python and three shell scripts, and it runs `brew install`. It makes no network calls, reads no environment variables and uses no MCP.

Its description draws the line with semgrep clearly: for fast single-file pattern matching, or a compiled language with no working build, use semgrep instead. CC-BY-SA-4.0, with about 9,000 installs recorded by skills.sh.

A prompt that fits it:

```text
Build a CodeQL database for this Go service and run the important-only suite. Add a data extension model for our custom request parser as a source.
```

### trailmark-finding-triage: is this finding reachable

[trailmark-finding-triage](https://skills.suedeai.ai/directory/trailofbits/skills/trailmark-finding-triage/) from trailofbits/skills (91/100, grade A) performs graph-assisted triage of one candidate: a security finding, a SARIF result, a weAudit annotation, a suspicious function or a report excerpt. It weighs Trailmark evidence on reachability, entrypoint paths, taint, privilege boundaries, blast radius, callers and callees, and the surrounding code.

The workflow has five steps: normalize the candidate, build or reuse the graph, bind the candidate, analyze the graph evidence, then decide and hand off. File and line findings get a shortcut through the middle steps. References cover input normalization, output format and query recipes, and two Python scripts build and test an evidence packet. No environment variables, network calls or MCP.

This is the skill that makes the scanners worth running. A SARIF file with hundreds of results is noise until someone asks which ones an attacker can reach. Use it to prioritize a finding before proof-of-concept work, to prepare evidence for exploit validation, or to decide whether a static-analysis result is actionable at all. CC-BY-SA-4.0, with about 1,000 installs recorded by skills.sh.

A prompt that fits it:

```text
Triage the SQL injection result at api/orders.py:212 from our SARIF file. Is it reachable from an unauthenticated entrypoint, and what is the blast radius?
```

### agentic-actions-auditor: AI agents inside CI

[agentic-actions-auditor](https://skills.suedeai.ai/directory/trailofbits/skills/agentic-actions-auditor/) from trailofbits/skills (89/100, grade B) audits GitHub Actions workflows for vulnerabilities in AI agent integrations, including Claude Code Action, Gemini CLI, OpenAI Codex and GitHub AI Inference. It looks for paths where attacker-controlled input reaches an AI agent running in CI/CD: env var intermediary patterns, direct expression injection, dangerous sandbox configurations and wildcard user allowlists.

The audit methodology starts at step 0, choosing the analysis mode, then discovers workflow files, identifies AI action steps, captures security context, analyzes for attack vectors and reports findings. Six vector references cover env var intermediaries, direct expression injection, CLI data fetch, pull_request_target checkout, error log injection and subshell expansion. It also carries the "Rationalizations to Reject" section that appears in all four trailofbits/skills picks, a list of excuses the audit should not accept. The skill bundles no scripts, reads no environment variables and uses no MCP.

If a pull request comment can trigger an agent with write access, this is the first skill I would run on that repository. CC-BY-SA-4.0, with about 7,000 installs recorded by skills.sh.

A prompt that fits it:

```text
Audit .github/workflows for every step that runs Claude Code Action or Codex. Flag any path where issue or PR text reaches the agent's prompt.
```

### skill-scanner: check a skill before it runs

[skill-scanner](https://skills.suedeai.ai/directory/getsentry/skills/skill-scanner/) from getsentry/skills (88/100, grade B) scans agent skills for prompt injection, malicious scripts, excessive permissions, secret exposure and supply chain risks before installation. Use it when asked to scan or audit a skill, validate a SKILL.md, or check a skill for injection.

Its workflow runs in eight phases: input and discovery, an automated static scan with its bundled Python script, frontmatter validation, prompt injection analysis, behavioral analysis, script analysis, supply chain assessment and permission analysis. It reports with confidence levels in a set output format. References cover dangerous code patterns, permission analysis and prompt injection patterns.

It bundles one Python script and makes network calls. It reads no environment variables and uses no MCP.

I include it because every skill in this stack runs with your agent's permissions, and the directory has not security scanned any of them. Run skill-scanner on each of them before you enable it. Treat its report as evidence for your own read, not a verdict. Apache-2.0, with about 4,000 installs recorded by skills.sh.

A prompt that fits it:

```text
Scan the skills in .claude/skills/codeql before I enable it. Report prompt injection, script behavior and permission findings with confidence levels.
```

### gha-security-review: workflow exploitation review

[gha-security-review](https://skills.suedeai.ai/directory/getsentry/skills/gha-security-review/) from getsentry/skills (86/100, grade B) reviews GitHub Actions workflows for exploitation: pwn requests, expression injection, credential theft and supply chain attacks. It is exploitation-focused and writes concrete proof-of-concept scenarios.

The SKILL.md defines scope (which files to review and what is out of scope), a threat model and confidence levels, then classifies triggers and loads references. Eight checks follow: pwn request, expression injection, unauthorized command execution, credential escalation, config file poisoning, supply chain, permissions and secrets, and runner infrastructure. A "Safe Patterns (Do Not Flag)" section keeps noise down. References cover each attack class plus comment-triggered commands, real-world attacks and AI prompt injection via CI. No scripts, environment variables, network calls or MCP.

Run it on every repository with .github/workflows, not only those with AI agents. Hand it to a reviewer who wants exploit scenarios rather than style notes. It complements agentic-actions-auditor: one covers the general workflow attack surface, the other the agent-specific paths. Apache-2.0, with about 5,000 installs recorded by skills.sh.

A prompt that fits it:

```text
Review .github/workflows for pwn requests and expression injection. For each finding, write the proof-of-concept scenario and the minimal fix.
```

## How to use the stack together

1. Run **skill-scanner** on every skill you are about to enable, this stack included. Read the report next to each SKILL.md.
2. Start the code sweep with **semgrep** in important-only mode. Approve the ruleset plan, let it batch the scans and keep the merged SARIF.
3. Run **codeql** for interprocedural data flow and taint tracking. Add data extension models for your own sources and sinks so the scan sees your framework.
4. Feed each high-impact result to **trailmark-finding-triage**. Keep only what is reachable, with the evidence packet attached.
5. Review every workflow file with **gha-security-review**. Fix pwn requests and expression injection first, using its proof-of-concept scenarios.
6. Where a workflow runs an AI agent, run **agentic-actions-auditor**. Remove wildcard allowlists and env var intermediaries before the next pull request.
7. After fixes land, rerun **semgrep** in run-all mode and **codeql** on the changed code. A fix is done when the finding is gone from the SARIF.

## Install the stack

```bash
npx skills add https://github.com/trailofbits/skills/tree/main/plugins/static-analysis/skills/semgrep
npx skills add https://github.com/trailofbits/skills/tree/main/plugins/static-analysis/skills/codeql
npx skills add https://github.com/trailofbits/skills/tree/main/plugins/trailmark/skills/trailmark-finding-triage
npx skills add https://github.com/trailofbits/skills/tree/main/plugins/agentic-actions-auditor/skills/agentic-actions-auditor
npx skills add https://github.com/getsentry/skills/tree/main/skills/skill-scanner
npx skills add https://github.com/getsentry/skills/tree/main/skills/gha-security-review
```

The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [fp-check](https://skills.suedeai.ai/directory/trailofbits/skills/#fp-check) | [trailofbits/skills](https://github.com/trailofbits/skills) | 93/100 | You need a TRUE POSITIVE or FALSE POSITIVE verdict with documented evidence on a suspected bug. |
| [vulnerability-triage-brocards](https://skills.suedeai.ai/directory/trailofbits/skills/#vulnerability-triage-brocards) | [trailofbits/skills](https://github.com/trailofbits/skills) | 90/100 | Incoming reports, CVEs or bug bounty submissions need accepting, dismissing or a request for more information. |
| [semgrep-rule-creator](https://skills.suedeai.ai/directory/trailofbits/skills/#semgrep-rule-creator) | [trailofbits/skills](https://github.com/trailofbits/skills) | 89/100 | The stock rulesets miss a pattern specific to your codebase and you need a custom Semgrep rule. |
| [security-review](https://skills.suedeai.ai/directory/getsentry/skills/security-review/) | [getsentry/skills](https://github.com/getsentry/skills) | 86/100 | You want a manual-style review of a diff for injection, XSS, authentication, authorization and cryptography. |
| [django-access-review](https://skills.suedeai.ai/directory/getsentry/skills/django-access-review/) | [getsentry/skills](https://github.com/getsentry/skills) | 86/100 | The app is Django or DRF and the worry is IDOR, object permissions or tenant isolation. |

fp-check and trailmark-finding-triage overlap most. trailmark-finding-triage gathers graph evidence on reachability and blast radius; fp-check returns a true or false positive verdict and is not for hunting new bugs. security-review reads code like a reviewer, where semgrep and codeql scan it, so pair it with them rather than replacing them.

## Common mistakes

- Starting with every ruleset. semgrep's important-only mode keeps the first pass to medium-to-high confidence and impact.
- Running CodeQL on a compiled language with no working build. codeql's own description sends that case to semgrep.
- Filing scanner output as vulnerabilities. trailmark-finding-triage checks reachability first, so the queue holds findings an attacker can reach.
- Auditing the code and skipping .github/workflows. gha-security-review's eight checks cover pwn requests, credential escalation and runner infrastructure.
- Letting PR text reach an AI agent in CI. agentic-actions-auditor flags expression injection, env var intermediaries and wildcard allowlists.
- Installing security skills without reading them. skill-scanner checks scripts and permissions before a skill runs with your agent's access.

## Licenses, costs and checks before you install

All six licenses are open, but two kinds. semgrep, codeql, trailmark-finding-triage and agentic-actions-auditor are CC-BY-SA-4.0, a share-alike license, so check its terms before you copy their references into anything you distribute. skill-scanner and gha-security-review are Apache-2.0.

None of the six reads an environment variable, according to the directory's read of their files. semgrep makes network calls, names json.schemastore.org as an outside host and uses Semgrep Pro only when available. codeql bundles fifteen scripts and runs `brew install`, so expect it to install tooling with Homebrew. skill-scanner makes network calls. agentic-actions-auditor and gha-security-review are reference files only.

The directory has not security scanned any listed skill, and that applies to security skills too. The [trust page](https://skills.suedeai.ai/directory/trust/) explains what it checks and what it does not. Read each SKILL.md and every bundled script before you enable a skill, and run skill-scanner as a second opinion, not a substitute for reading.

## Related topics and stacks

The [Security Auditing and Review](https://skills.suedeai.ai/directory/topics/security-auditing/) topic lists 108 skills, [Vulnerability Scanning](https://skills.suedeai.ai/directory/topics/vulnerability-scanning/) lists 55, [CI/CD and DevOps](https://skills.suedeai.ai/directory/topics/ci-cd/) lists 39 and [Agent Safety and Guardrails](https://skills.suedeai.ai/directory/topics/agent-safety/) lists 27. The [Security](https://skills.suedeai.ai/directory/security/) category holds the rest.

Security audits pair with the [code review stack](https://skills.suedeai.ai/directory/stacks/code-review/) for the per-PR pass, the [testing and CI stack](https://skills.suedeai.ai/directory/stacks/testing-and-ci/) for the pipeline these workflows run in, and the [agent-building stack](https://skills.suedeai.ai/directory/stacks/agent-building/) if you are building the agents that run in CI.

## FAQ

### What is the best Claude Code security skill?

For a full audit, semgrep from trailofbits/skills (92/100) is where I would start: it plans a Semgrep scan, waits for your approval, batches the rulesets and merges the output to SARIF. codeql ties it at 92/100 and adds interprocedural data flow and taint tracking. trailmark-finding-triage (91/100) then decides which findings are reachable.

### Should I use the semgrep or codeql skill?

Use both if you can. semgrep is fast pattern matching with an approval gate and works without a build. codeql traces data flow and taint across functions, but compiled languages need a working build. codeql's own description says to use semgrep for single-file pattern matching or when no build is available.

### How do I audit GitHub Actions workflows that run AI agents?

Run agentic-actions-auditor (89/100) on any workflow that invokes Claude Code Action, Gemini CLI, OpenAI Codex or GitHub AI Inference. It looks for attacker-controlled input reaching the agent through env var intermediaries, expression injection, dangerous sandbox settings or wildcard allowlists. Add gha-security-review (86/100) for pwn requests, credential theft and supply chain risks across every workflow.

### Which security skill should I install first?

skill-scanner, because it checks other skills for prompt injection, malicious scripts, excessive permissions and secret exposure before you enable them. Then install semgrep for the first code sweep. The directory has not security scanned any listed skill, so a scan plus your own read of each SKILL.md is the minimum before anything runs.

### Is an AI security audit with these skills enough on its own?

No. These skills scan, triage and review, and they produce evidence a person can check. They do not replace a human security review or an outside audit. Treat their SARIF files, evidence packets and proof-of-concept scenarios as the input to that review, and keep a person in charge of what counts as fixed.

### Are these security skills free?

Yes, all six are free to install under open licenses: four are CC-BY-SA-4.0 and two are Apache-2.0. None reads an API key, according to the directory's read of their files. semgrep uses Semgrep Pro for cross-file taint analysis only when it is available, and codeql runs `brew install` for its tooling.

### Do these skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.
