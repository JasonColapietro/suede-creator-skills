# What is the best agent skill stack for code review?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 2, 2026.

**Short answer:** [tidy](https://skills.suedeai.ai/directory/mblode/agent-skills/tidy/) from mblode/agent-skills (87/100) is the reviewer: it reads a local diff, a branch diff or a PR and returns file and line findings in confirmed and plausible tiers, and it can apply the fixes. Pair it with [security-review](https://skills.suedeai.ai/directory/getsentry/skills/security-review/) from getsentry/skills (86/100) for a separate pass on injection, XSS, authentication, authorization and cryptography, and with [verification-before-completion](https://skills.suedeai.ai/directory/obra/superpowers/verification-before-completion/) from obra/superpowers (84/100) so nothing gets called done without a verification command actually run. If you write Go, add go-coding-standards, the highest-scoring skill in the set.

## The stack

Five skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [go-coding-standards](https://skills.suedeai.ai/directory/eduardo-sl/go-agent-skills/go-coding-standards/) | [eduardo-sl/go-agent-skills](https://github.com/eduardo-sl/go-agent-skills) | 95/100 | Applies Go coding standards from Effective Go and Go Code Review Comments, including import ordering, struct initialization, receivers and formatting rules. |
| [tidy](https://skills.suedeai.ai/directory/mblode/agent-skills/tidy/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 87/100 | Reviews a local diff, branch diff or PR with file and line findings in confirmed and plausible tiers, and can apply the fixes. |
| [security-review](https://skills.suedeai.ai/directory/getsentry/skills/security-review/) | [getsentry/skills](https://github.com/getsentry/skills) | 86/100 | Reviews code for security vulnerabilities including injection, XSS, authentication, authorization and cryptography issues, with a systematic process and confidence-based reporting. |
| [verification-before-completion](https://skills.suedeai.ai/directory/obra/superpowers/verification-before-completion/) | [obra/superpowers](https://github.com/obra/superpowers) | 84/100 | Requires running verification commands and confirming their output before claiming work is complete, fixed or passing, and before committing or creating pull requests. |
| [unslop-review](https://skills.suedeai.ai/directory/mohamedabdallah-14/unslop/unslop-review/) | [MohamedAbdallah-14/unslop](https://github.com/MohamedAbdallah-14/unslop) | 84/100 | Rewrites code review comments to read like a human teammate wrote them, so each states location, issue and a concrete fix. |

## How to use it

1. Put **verification-before-completion** in place before any reviewer. It requires the agent to run verification commands and confirm their output before claiming work is complete, fixed or passing, and before committing or creating a pull request. That changes the agent's default behavior, and it is the cheapest quality gain on this list.
2. Run **tidy** on the diff. Deal with the confirmed tier first. Treat the plausible tier as questions, not orders, and let tidy apply fixes only after you have read each one. It takes a local diff, a branch diff or a PR, so it fits wherever your review happens.
3. Run **security-review** as its own pass. It uses a systematic process with confidence-based reporting across injection, XSS, authentication, authorization and cryptography. Keep it separate from the general review so the security findings do not get buried under style notes.
4. If the code is Go, add **go-coding-standards**. It applies the conventions from Effective Go and Go Code Review Comments: import ordering, struct initialization, receivers and formatting rules. For other languages, skip it.
5. Before anything is posted, pass the comments through **unslop-review**. It rewrites review comments so each one states the location, the issue and a concrete fix, with the throat-clearing cut. A short, specific comment gets fixed; a paragraph gets argued with.

## Install the stack

```bash
npx skills add https://github.com/eduardo-sl/go-agent-skills/tree/main/skills/(code-quality)/go-coding-standards
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/tidy
npx skills add https://github.com/getsentry/skills/tree/main/skills/security-review
npx skills add https://github.com/obra/superpowers/tree/main/skills/verification-before-completion
npx skills add https://github.com/MohamedAbdallah-14/unslop/tree/main/skills/unslop-review
```

The [skills CLI](https://skills.sh/) works for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## What to check before you install

- Licenses: go-coding-standards, tidy, verification-before-completion and unslop-review are MIT. security-review is CC-BY-SA-4.0, a share-alike license, so check what that means before you fold it into something you distribute.
- Services: none of the five summaries names an outside service or API. tidy can apply fixes to your working tree, so run it on a branch you can throw away until you trust it.
- Read each SKILL.md before you enable it. The directory has not security scanned any skill, and a skill that reviews code for security is still a text file you should read yourself.

## FAQ

### Can tidy replace a human reviewer?

No. It finds, tiers and can fix. A person still decides what merges, and verification-before-completion exists because an agent's claim that something passes is not the same as it passing. Use the stack to make the human review shorter and better informed, not to remove it.

### Do these skills work in Codex and Cursor?

Yes. All five use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Why include a Go-only skill in a general stack?

Because at 95/100 it is the highest score in the set, and the other four are language-agnostic, so the stack costs nothing extra for a team that does not write Go: drop it. For a team that does, it is the most specific reviewer here. It has about 210 installs recorded by skills.sh against about 261,000 for verification-before-completion and about 22,000 for security-review, which tells you where adoption sits today.
