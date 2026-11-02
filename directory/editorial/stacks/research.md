# What is the best agent skill stack for research?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 2, 2026.

**Short answer:** for a company, [company-research](https://skills.suedeai.ai/directory/browserbase/skills/company-research/) from browserbase/skills (84/100) researches the product and ICP, discovers target companies through the Browserbase Search API and scores fit. For a market, [manus](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/manus/) from sanjay3290/ai-skills (87/100) delegates deep web research, market analysis and product comparisons to the Manus agent. For a paper, [deep-reader](https://skills.suedeai.ai/directory/tronghieu/agent-skills/deep-reader/) from tronghieu/agent-skills (90/100) reads it without loading the whole text into one context window, citation-management validates the references, and chat-history, the top score in the set, recovers research you have already done.

## The stack

Seven skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [chat-history](https://skills.suedeai.ai/directory/mblode/agent-skills/chat-history/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 91/100 | Recovers decisions, previous fixes and research from past AI conversations with source evidence, reading local Claude Code, Codex, Grok and Cursor history. |
| [youtube-full](https://skills.suedeai.ai/directory/zeropointrepo/youtube-skills/youtube-full/) | [ZeroPointRepo/youtube-skills](https://github.com/ZeroPointRepo/youtube-skills) | 90/100 | Provides YouTube access for transcripts, video and channel search, channel browsing, playlists and within-channel search, for summaries, quotes, translations and topic research. |
| [deep-reader](https://skills.suedeai.ai/directory/tronghieu/agent-skills/deep-reader/) | [tronghieu/agent-skills](https://github.com/tronghieu/agent-skills) | 90/100 | Reads and answers questions about long books and papers without loading the whole text into one context window, keeping page-anchored notes. |
| [citation-management](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/citation-management/) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 89/100 | Manages academic citations by searching OpenAlex, PubMed and Google Scholar, extracting metadata, validating references and generating formatted BibTeX entries. |
| [seo-dataforseo](https://skills.suedeai.ai/directory/agricidaniel/claude-seo/seo-dataforseo/) | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | 88/100 | Pulls live SEO data through the DataForSEO server, including SERP analysis, keyword research, backlink profiles, competitor analysis and AI visibility tracking. |
| [manus](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/manus/) | [sanjay3290/ai-skills](https://github.com/sanjay3290/ai-skills) | 87/100 | Delegates complex, long-running tasks to the Manus AI agent for autonomous execution, such as deep web research, market analysis, product comparisons and stock analysis. |
| [company-research](https://skills.suedeai.ai/directory/browserbase/skills/company-research/) | [browserbase/skills](https://github.com/browserbase/skills) | 84/100 | Researches a company's product and ICP, discovers target companies with the Browserbase Search API, researches each deeply and scores ICP fit. |

## How to use it

1. Check what you already know with **chat-history**. It recovers decisions, previous fixes and research from past AI conversations, with source evidence, by reading local Claude Code, Codex, Grok and Cursor history. A good share of the research I have paid for twice was sitting in an old session.
2. For a company, run **company-research**. It researches the product and ICP, discovers target companies with the Browserbase Search API, researches each one deeply and scores ICP fit. Scoring fit is the useful part: a list of two hundred companies is noise, a list of twenty with reasons is a plan.
3. For a market, hand the long job to **manus**, which delegates deep web research, market analysis, product comparisons and stock analysis to the Manus agent for autonomous execution. Add **seo-dataforseo** for the demand side: keyword research, SERP analysis, backlink profiles and competitor analysis.
4. For a paper, read it with **deep-reader**, which keeps page-anchored notes, then check the references with **citation-management**, which searches OpenAlex, PubMed and Google Scholar, validates references and produces formatted BibTeX.
5. When the best source is a talk or an interview, **youtube-full** pulls transcripts, searches videos and channels, and supports quotes and topic research. Transcripts are searchable; a two-hour interview is not, until it is text.
6. Write the brief with every claim pointing at a source from steps 2 to 5. A research note without sources is an opinion in a nicer font.

## Install the stack

```bash
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/chat-history
npx skills add https://github.com/ZeroPointRepo/youtube-skills/tree/main/clawhub/youtube-full
npx skills add https://github.com/tronghieu/agent-skills/tree/main/skills/deep-reader
npx skills add https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/skills/citation-management
npx skills add https://github.com/AgriciDaniel/claude-seo/tree/main/skills/seo-dataforseo
npx skills add https://github.com/sanjay3290/ai-skills/tree/main/skills/manus
npx skills add https://github.com/browserbase/skills/tree/main/skills/company-research
```

The [skills CLI](https://skills.sh/) works for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## What to check before you install

- Licenses: six of the seven are MIT; manus is Apache-2.0. Confirm the license file in each repository anyway.
- Services: company-research uses the Browserbase Search API, manus needs access to the Manus agent, seo-dataforseo needs the DataForSEO server, and youtube-full needs YouTube access, so read each SKILL.md for what it expects. chat-history reads your local AI conversation history, which is as sensitive as anything on your machine.
- Read each SKILL.md before you enable it. The directory has not security scanned any skill.

## FAQ

### Where should I start if I only install one?

chat-history, at 91/100 the top score here, because it costs nothing in outside services and it tells you what you already found. Start there even if the answer is nothing; a clean slate you can prove is worth the five minutes. The second install depends on the job: company-research for a company, manus for a market, deep-reader for a paper.

### Do these skills work in Codex and Cursor?

Yes. All seven use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Can the agent do the whole research job on its own?

manus is built for exactly that: its summary describes delegating complex, long-running tasks for autonomous execution. My rule is that an agent researches and a person decides. Read the sources it cites before you act on the conclusion, and keep citation-management in the loop for anything academic.
