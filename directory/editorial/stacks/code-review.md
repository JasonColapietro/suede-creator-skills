# What is the best agent skill stack for code review?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** For Claude Code review, start with [tidy](https://skills.suedeai.ai/directory/mblode/agent-skills/tidy/) from mblode/agent-skills (87/100): it reads a local diff, a branch diff or a PR and returns file and line findings in confirmed and plausible tiers, and it can apply the fixes. Pair it with [security-review](https://skills.suedeai.ai/directory/getsentry/skills/security-review/) from getsentry/skills (86/100) for a separate pass on injection, XSS, authentication, authorization and cryptography, and with [verification-before-completion](https://skills.suedeai.ai/directory/obra/superpowers/verification-before-completion/) from obra/superpowers (84/100) so nothing gets called done until a verification command has run. If you write Go, add [go-coding-standards](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/go-coding-standards/) (95/100), the top score in the set, and run [unslop-review](https://skills.suedeai.ai/directory/mohamedabdallah-14/unslop/unslop-review/) over the comments before you post them.

## The stack

Five skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [go-coding-standards](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/go-coding-standards/) | [eduardo-sl/go-agent-skills](https://github.com/eduardo-sl/go-agent-skills) | 95/100 | Applies Go coding standards from Effective Go and Go Code Review Comments, including import ordering, struct initialization, receivers and formatting rules. |
| [tidy](https://skills.suedeai.ai/directory/mblode/agent-skills/tidy/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 87/100 | Reviews a local diff, branch diff or PR with file and line findings in confirmed and plausible tiers, and can apply the fixes. |
| [security-review](https://skills.suedeai.ai/directory/getsentry/skills/security-review/) | [getsentry/skills](https://github.com/getsentry/skills) | 86/100 | Reviews code for security vulnerabilities including injection, XSS, authentication, authorization and cryptography issues, with a systematic process and confidence-based reporting. |
| [verification-before-completion](https://skills.suedeai.ai/directory/obra/superpowers/verification-before-completion/) | [obra/superpowers](https://github.com/obra/superpowers) | 84/100 | Requires running verification commands and confirming their output before claiming work is complete, fixed or passing, and before committing or creating pull requests. |
| [unslop-review](https://skills.suedeai.ai/directory/mohamedabdallah-14/unslop/unslop-review/) | [MohamedAbdallah-14/unslop](https://github.com/MohamedAbdallah-14/unslop) | 84/100 | Rewrites code review comments to read like a human teammate wrote them, so each states location, issue and a concrete fix. |

## Who this stack is for

This stack is for anyone who wants AI code review that a human can act on in minutes, not a wall of suggestions. It fits a solo developer shipping with Claude Code who has no second pair of eyes, a team lead who wants every pull request pre-reviewed before a person opens it, and a maintainer triaging outside contributions who needs the security questions asked every time.

It also fits a less obvious case: the team whose agent keeps reporting "all tests pass" when it never ran them. Two of the five skills change how the agent behaves rather than what it reviews, which is often where review quality is lost.

Go teams get the most from it, because go-coding-standards and every alternative below are Go-specific. Everyone else can drop that skill and keep four.

All five use the [Agent Skills](https://agentskills.io/) format, a folder with a SKILL.md and reference files, so the same install works in Claude Code, Codex, Cursor and any agent that reads the format.

## The Suede AI skill built for this job

I built [suede-code](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-code) for exactly this job: you ask it to "review this PR", or to grade a diff, a branch or a commit range, and it returns evidence-backed findings ranked P0 to P3, a fix path for each, and an A to F ship grade. It is my company's skill, so it stays out of this page's ranking.

The grade is the decision it makes for you. Instead of a pile of comments, you get a severity order and a ship call you can act on. It runs in three modes: findings-only when you want the list, grade-only when you need a merge decision, and fix mode when you want the repairs made. Its seven review lanes include security checks, deploy safety and commit dirt.

Start with it whenever a pull request needs a verdict, not only notes. It owns the first review of the diff and the ship grade a person reads before merging, which are steps 2 and 8 in the workflow below. The third-party picks then go deeper where they are strongest: security-review for the full security process, verification-before-completion to prove each fix with command output, and unslop-review for the comments you post. Its description sends CI enforcement, agent evaluations and parallel fix coordination elsewhere.

Put it in first:

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-code
```

## The skills, one by one

### go-coding-standards: Go style and conventions

[go-coding-standards](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/go-coding-standards/) from eduardo-sl/go-agent-skills scores 95/100, grade A, the highest in this stack. It applies Go coding standards grounded in Effective Go, Go Code Review Comments and production-proven idioms, for writing or reviewing Go.

Its SKILL.md reads like a numbered rulebook: import ordering, variable declarations (top-level and local), struct initialization, reducing nesting, grouping and ordering, line length, defer usage, enums, using the time package properly, receivers, struct tags and function shape. It closes with a verification checklist worth asking the agent to report against. Two reference files cover file organization, and receivers and tags.

The files are guidance only. There are no bundled scripts, it reads no environment variables, names no outside hosts and does not use MCP.

The description draws its borders clearly. It is not for naming (go-naming), concurrency (go-concurrency-review) or performance tuning (go-performance-review), which are separate skills from the same publisher and appear in the alternatives below. If you do not write Go, skip it.

It is MIT licensed, with fewer than 1,000 installs recorded by skills.sh, so adoption is early despite the top score.

A prompt that fits it:

```text
Review internal/billing/*.go against Go conventions. Flag import ordering, struct initialization and receiver problems, then report against the verification checklist.
```

### tidy: the diff reviewer

[tidy](https://skills.suedeai.ai/directory/mblode/agent-skills/tidy/) from mblode/agent-skills (87/100, grade B) is the general reviewer and the center of the stack. It reviews a local diff, a branch diff or a PR and reports file:line findings in two tiers, confirmed and plausible. It also gates any test the diff adds or changes, and in apply mode it lands the fixes plus simplifications scoped to the diff.

The SKILL.md is organized around that choice: report or apply, mode dispatch, the workflow, the apply step, high-signal criteria, the output format and gotchas. The reference folder carries the depth: performance and security checklists, severity and structural-quality rubrics, a test gate, notes on context errors and a catalog of AI slop patterns. No bundled scripts, environment variables, outside hosts or MCP.

Its triggers include "review my changes", "simplify my diff" and "audit these tests in my PR". It also says what it hands off: pr-creator opens the PR, pr-babysitter handles CI and review threads, and test-audit prunes a whole suite. I like a reviewer that knows its boundary, because it stays on the diff.

Use report mode first; move to apply mode on a branch you can throw away. It is MIT licensed, with fewer than 1,000 installs recorded by skills.sh.

A prompt that fits it:

```text
Review my branch against main in report mode. Confirmed findings first with file:line, then plausible ones, and gate the tests this diff adds.
```

### security-review: the dedicated security pass

[security-review](https://skills.suedeai.ai/directory/getsentry/skills/security-review/) from getsentry/skills (86/100, grade B) is a security code review for vulnerabilities: injection, XSS, authentication, authorization and cryptography, with a systematic process and confidence-based reporting. The directory marks getsentry/skills as an official publisher repository. With about 22,000 installs recorded by skills.sh, it is the most adopted security reviewer in this set.

Its SKILL.md separates research from reporting, defines confidence levels and has a "Do Not Flag" section covering server-controlled values that are not attacker-controlled and framework-mitigated patterns. The review process runs in six steps: detect context, load a language guide, load an infrastructure guide if one applies, research before flagging, verify exploitability, and report high-confidence findings only. Severity classification and a quick patterns reference, including an always-flag critical list, round it out.

The bundled guides cover JavaScript, Python and Docker, plus references on API security, authentication, authorization, business logic, cryptography, CSRF and data protection. There are no scripts and no network calls. Its docs name AWS_SECRET_ACCESS_KEY, but no file reads an environment variable.

Its license is CC-BY-SA-4.0, a share-alike license, which I cover in the checks section below.

A prompt that fits it:

```text
Run a security review on the files changed in this PR. Load the JavaScript guide, verify exploitability before flagging, and report high-confidence findings only.
```

### verification-before-completion: the evidence gate

[verification-before-completion](https://skills.suedeai.ai/directory/obra/superpowers/verification-before-completion/) from obra/superpowers (84/100, grade B) is not a reviewer. It is a rule for the agent: before claiming work is complete, fixed or passing, and before committing or creating a PR, run the verification commands and confirm their output. Its own phrase is "evidence before assertions always".

That makes it the cheapest quality gain on this list. Most bad reviews I see start with an agent that said a fix worked without running the test.

The SKILL.md is short and pointed: an overview, the Iron Law, the Gate Function, common failures, a "Red Flags - STOP" list, rationalization prevention, key patterns and when to apply it. The whole skill is that one file. There are no scripts, environment variables, outside hosts or MCP.

It is also by far the most installed skill here: about 261,000 installs recorded by skills.sh, about 8,000 of them in the last week. It is MIT licensed. Install it even if you skip the rest, and keep it on for all work, not only review.

A prompt that fits it:

```text
Before you tell me the null-check fix works, run the failing test and the full package suite, paste the output, and only then summarize.
```

### unslop-review: comments a teammate would write

[unslop-review](https://skills.suedeai.ai/directory/mohamedabdallah-14/unslop/unslop-review/) from MohamedAbdallah-14/unslop (84/100, grade B) rewrites code review comments so they read like a human teammate wrote them. It cuts the corporate-AI throat-clearing ("I noticed...", "I was wondering if perhaps...", "It might be worth considering...") so each comment is direct: the location, the issue and a concrete fix.

The SKILL.md covers purpose, trigger, format, rules (what to drop, what to keep, tone, and when to use full prose instead of one-liners), worked bad-to-good examples, how to write an approval, and boundaries. The auto-clarity rule allows full prose when a one-liner would hide a subtle bug. The skill is a single SKILL.md with no scripts, environment variables, outside hosts or MCP.

Two things to know before you install it. Its description says it auto-triggers when reviewing PRs, so expect it to shape review output even when you did not ask for it. And it rewrites tone, not substance: it will not find bugs tidy missed.

It is MIT licensed, with fewer than 100 installs recorded by skills.sh.

A prompt that fits it:

```text
Rewrite these six review comments so each states the file and line, the problem and the fix in two sentences or fewer. Keep the approval note short.
```

## How to use the stack together

1. Enable **verification-before-completion** before anything else. Every later step that claims a fix works now has to show command output first.
2. Run **tidy** in report mode on the diff, the branch or the PR. Read the confirmed tier first and treat the plausible tier as questions, not orders.
3. If the diff is Go, run **go-coding-standards** on the changed files and ask for its verification checklist. Keep its style notes apart from tidy's correctness findings.
4. Run **security-review** as its own pass on the same diff, so injection or authorization findings never get buried under style notes.
5. Decide which findings to fix, then let **tidy** apply them on a disposable branch. Review its diff like a colleague's.
6. Have **verification-before-completion** run the tests and paste the output before anything is committed. No output, no commit.
7. Pass every comment you plan to post through **unslop-review**. Short comments with a location and a fix get fixed; paragraphs get argued with.
8. A person still merges. Use **tidy**'s confirmed tier and the security pass as the brief for that human review, not a replacement for it.

## Install the stack

```bash
npx skills add https://github.com/eduardo-sl/go-agent-skills/tree/main/skills/(code-quality)/go-coding-standards
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/tidy
npx skills add https://github.com/getsentry/skills/tree/main/skills/security-review
npx skills add https://github.com/obra/superpowers/tree/main/skills/verification-before-completion
npx skills add https://github.com/MohamedAbdallah-14/unslop/tree/main/skills/unslop-review
```

The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [go-concurrency-review](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/go-concurrency-review/) | [eduardo-sl/go-agent-skills](https://github.com/eduardo-sl/go-agent-skills) | 95/100 | The diff touches goroutines, channels, mutexes or context cancellation, or you are chasing a race condition or a goroutine leak. |
| [go-performance-review](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/go-performance-review/) | [eduardo-sl/go-agent-skills](https://github.com/eduardo-sl/go-agent-skills) | 95/100 | You are reviewing a hot path and need allocations, benchmarks, pprof, GC tuning or HTTP client reuse checked. |
| [go-naming](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/go-naming/) | [eduardo-sl/go-agent-skills](https://github.com/eduardo-sl/go-agent-skills) | 95/100 | The review keeps stalling on names: stuttering packages, Get prefixes, acronym casing or receiver names. |
| [go-ci](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/go-ci/) | [eduardo-sl/go-agent-skills](https://github.com/eduardo-sl/go-agent-skills) | 95/100 | You want golangci-lint, coverage gates and vulnerability scanning to catch issues in CI before a reviewer sees them. |
| [go-refactoring](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/#go-refactoring) | [eduardo-sl/go-agent-skills](https://github.com/eduardo-sl/go-agent-skills) | 95/100 | Review findings turn into a larger cleanup that needs behavior-preserving steps behind green tests. |

Every alternative here is a Go skill from the same publisher, each scoped to a narrower question than go-coding-standards. Pick by the question the diff raises: concurrency, performance, naming, pipeline or refactor. None replaces tidy, which reviews any language.

## Common mistakes

- Trusting "tests pass" without output. verification-before-completion requires the agent to run the command and show the result before it claims anything.
- Treating every finding as an order. tidy separates confirmed from plausible findings for a reason, and the plausible tier deserves a second look before anyone acts on it.
- Running apply mode on a shared branch. Let tidy land fixes on a disposable branch first, then read the diff it produced.
- Folding security into the general review. security-review has its own process and reports high-confidence findings only, so it stays readable when it runs alone.
- Posting comments that sound machine-written. unslop-review cuts the hedging so each comment names the location, the issue and the fix.
- Installing several overlapping Go reviewers at once. go-coding-standards excludes naming, concurrency and performance by design, so add the specific alternative only when the diff needs it.

## Licenses, costs and checks before you install

Four of the five picks are MIT licensed: go-coding-standards, tidy, verification-before-completion and unslop-review. security-review is CC-BY-SA-4.0, an open but share-alike license, so check what that means before you copy its guides into something you distribute. All five alternatives are MIT.

None of the picks bundles a script, calls the network, reads an environment variable or uses MCP, according to the directory's read of their files. security-review mentions AWS_SECRET_ACCESS_KEY in its documentation, but nothing in it reads that variable. The real cost is model usage: a full pass with tidy, security-review and go-coding-standards on a large diff takes time, so run it on pull requests, not every save.

The directory has not security scanned any listed skill, and a skill that reviews code for security is still a set of text files you should read yourself. The [trust page](https://skills.suedeai.ai/directory/trust/) explains what the directory checks and what it does not, and the [methodology](https://skills.suedeai.ai/directory/methodology/) explains how scores are built. Open each SKILL.md before you enable it, and remember that tidy's apply mode writes to your working tree.

## Related topics and stacks

The [Code Review](https://skills.suedeai.ai/directory/topics/code-review/) topic lists 50 skills, [Security Auditing and Review](https://skills.suedeai.ai/directory/topics/security-auditing/) lists 108, [Code Quality and Linting](https://skills.suedeai.ai/directory/topics/code-quality-linting/) lists 22 and [Go](https://skills.suedeai.ai/directory/topics/golang/) lists 34. The full [Code Review and Code Quality](https://skills.suedeai.ai/directory/code-review-quality/) category holds the rest.

Code review pairs naturally with the [testing and CI stack](https://skills.suedeai.ai/directory/stacks/testing-and-ci/), which makes the checks tidy relies on faster and more complete, and the [security audits stack](https://skills.suedeai.ai/directory/stacks/security-audits/), which goes deeper than a per-PR pass. If you are building the agents that do the reviewing, see the [agent-building stack](https://skills.suedeai.ai/directory/stacks/agent-building/).

## FAQ

### What is the best Claude Code review skill?

tidy from mblode/agent-skills, at 87/100, is the best general reviewer for Claude Code in this stack. It reviews a local diff, a branch diff or a PR, reports file:line findings in confirmed and plausible tiers, gates the tests the diff adds and can apply the fixes. go-coding-standards scores higher, at 95/100, but it only covers Go style, so it complements tidy rather than replacing it.

### Can tidy replace a human reviewer?

No. It finds, tiers and can fix. A person still decides what merges, and verification-before-completion exists because an agent's claim that something passes is not the same as it passing. Use the stack to make the human review shorter and better informed, not to remove it.

### Is an AI code review tool built from skills free to use?

The skills themselves are free to install. Four are MIT licensed and security-review is CC-BY-SA-4.0, both open licenses. None of the five calls an outside service or reads an API key, according to the directory's read of their files. You pay only for the model usage of whichever agent runs them, such as Claude Code, Codex or Cursor.

### Which code review skill should I install first?

verification-before-completion. It has about 261,000 installs recorded by skills.sh, more than any other skill here, and it changes the agent's behavior everywhere: no claim that work is complete, fixed or passing without running the verification command and showing the output. Add tidy second for the review itself, then security-review as a separate pass.

### Do these skills work in Codex and Cursor?

Yes. All five use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands and the manual copy routes.

### How is security-review different from tidy's security checklist?

tidy carries a security checklist as one reference file inside a general review. security-review is a dedicated process: it loads language and infrastructure guides, researches before flagging, verifies exploitability and reports high-confidence findings only, with a "Do Not Flag" list to cut noise. Run tidy for everything, and security-review when the change touches input handling, authentication, authorization or cryptography.

### Why include a Go-only skill in a general stack?

At 95/100 it is the highest score in the set, and the other four are language-agnostic, so a team that does not write Go can simply drop it. For a team that does, it is the most specific reviewer here. It has fewer than 1,000 installs recorded by skills.sh against about 261,000 for verification-before-completion and about 22,000 for security-review, which shows where adoption sits today.
