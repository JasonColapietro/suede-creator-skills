# What is the best agent skill stack for research?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** to turn Claude Code into an AI research assistant, start with [chat-history](https://skills.suedeai.ai/directory/mblode/agent-skills/chat-history/) (91/100), which recovers research you already did from past AI sessions. Add [deep-reader](https://skills.suedeai.ai/directory/tronghieu/agent-skills/deep-reader/) (90/100) to read long papers with page-anchored notes, and [citation-management](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/citation-management/) (89/100) to validate references and produce BibTeX. For a market, [manus](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/manus/) (87/100) delegates AI deep research to the Manus agent. For a company, [company-research](https://skills.suedeai.ai/directory/browserbase/skills/company-research/) (84/100) scores ICP fit. Add youtube-full when the source is a talk.

## The stack

Seven skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [chat-history](https://skills.suedeai.ai/directory/mblode/agent-skills/chat-history/) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 91/100 | Recovers decisions, previous fixes and research from past AI conversations with source evidence, reading local Claude Code, Codex, Grok and Cursor history. |
| [youtube-full](https://skills.suedeai.ai/directory/zeropointrepo/youtube-skills/youtube-full/) | [ZeroPointRepo/youtube-skills](https://github.com/ZeroPointRepo/youtube-skills) | 90/100 | Provides YouTube access for transcripts, video and channel search, channel browsing, playlists and within-channel search, for summaries, quotes, translations and topic research. |
| [deep-reader](https://skills.suedeai.ai/directory/tronghieu/agent-skills/deep-reader/) | [tronghieu/agent-skills](https://github.com/tronghieu/agent-skills) | 90/100 | Reads and answers questions about long books and papers without loading the whole text into one context window, keeping page-anchored notes. |
| [citation-management](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/citation-management/) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 89/100 | Manages academic citations by searching OpenAlex, PubMed and Google Scholar, extracting metadata, validating references and generating formatted BibTeX entries. |
| [manus](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/manus/) | [sanjay3290/ai-skills](https://github.com/sanjay3290/ai-skills) | 87/100 | Delegates complex, long-running tasks to the Manus AI agent for autonomous execution, such as deep web research, market analysis, product comparisons and stock analysis. |
| [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) | [mblode/agent-skills](https://github.com/mblode/agent-skills) | 87/100 | Audits and fixes technical SEO, researches search demand, creates content briefs, and measures SEO, AEO and GEO performance. |
| [company-research](https://skills.suedeai.ai/directory/browserbase/skills/company-research/) | [browserbase/skills](https://github.com/browserbase/skills) | 84/100 | Researches a company's product and ICP, discovers target companies with the Browserbase Search API, researches each deeply and scores ICP fit. |

## Who this stack is for

This stack is for anyone who asks an agent to find things out and then has to stand behind the answer. A founder sizing a market. A product manager comparing five competitors. A sales lead deciding which twenty accounts deserve a week of attention. A graduate student with a 300-page thesis to read and a bibliography to clean. A marketer checking search demand before a brief.

The common thread is evidence. Each pick either finds sources, reads them without losing the page reference, or checks that a citation is real. None of them asks you to trust a summary you cannot trace.

All seven are in the [Agent Skills](https://agentskills.io/) format, so the same folders work in Claude Code, Codex and Cursor. If you think of Claude research as one long chat, this stack breaks it into steps you can check: recall, discover, read, cite, write.

## The Suede AI skill built for this job

I built [suede-customer-research](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-customer-research) for exactly this job: finding out what a defined customer segment says, needs and resists, in words you can trace. Give it transcripts, surveys, tickets, reviews and forum threads, and it returns traceable voice-of-customer quotes, jobs to be done, personas and buyer questions. The quotes carry their source, which is the evidence rule this whole stack runs on.

Start with it when the research question is about people rather than papers: why a segment buys, what stops them, which words they use. Ask it to "synthesize these interviews" and it sorts the raw material into those four outputs before anyone writes a slide.

It makes the third-party picks below work harder. [company-research](https://skills.suedeai.ai/directory/browserbase/skills/company-research/) and [manus](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/manus/) tell you which companies and markets matter; this skill tells you what the buyers inside them say. Its buyer questions become the brief for [seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) demand research, and its quotes give [deep-reader](https://skills.suedeai.ai/directory/tronghieu/agent-skills/deep-reader/) and [youtube-full](https://skills.suedeai.ai/directory/zeropointrepo/youtube-skills/youtube-full/) something specific to hunt for in long reports and recorded interviews. It stays in its lane: competitor-only profiling, final copy and product prioritization the evidence does not support go to other skills.

It is my company's skill, so it stays out of the ranking. Install it first.

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-customer-research
```

## The skills, one by one

### chat-history: recover research you already did

[chat-history](https://skills.suedeai.ai/directory/mblode/agent-skills/chat-history/) recovers decisions, previous fixes, research and what followed a prompt from past AI conversations, with source evidence. It reads local Claude Code, Codex, Grok and Cursor history, plus explicit ChatGPT or Claude exports. Its description lists the phrases that should trigger it: "search past chats", "we fixed this before", "what followed this prompt" and "why did the plan change".

The SKILL.md has four sections: Workflow, Execute the primitives, Evidence and performance contracts, and Gotchas from real use. It bundles two Python scripts (the main one is `scripts/history.py`), an evals folder with routing tests, and reference notes on sources and verification. The directory's file summary lists no outside hosts and no credentials. It reads your history files on disk, and those files are as sensitive as anything on your machine.

It is MIT licensed, scores 91/100, the top score in this stack, and has fewer than 1,000 installs recorded by skills.sh. Reach for it before every new research job. Skip it only when the topic is genuinely new to you.

Here is how I open a project with it.

```text
Search my past Claude Code and Codex sessions for anything on EU battery
regulation. List each decision or source we found, with the session and date.
```

### youtube-full: research from talks, interviews and lectures

[youtube-full](https://skills.suedeai.ai/directory/zeropointrepo/youtube-skills/youtube-full/) gives the agent YouTube access: transcripts, video and channel search, channel browsing, playlists and search within a channel. Its description says to use it for video summaries, quotes, translations, topic research, talks, lectures, product reviews and announcements. It is not for uploads, account management or research that needs written sources only.

The SKILL.md reads like an API reference, and it prices every call. A transcript costs 1 credit, a search costs 1 credit per page, and resolving a handle or listing a channel's latest 15 videos is free. It documents a `TRANSCRIPT_API_KEY` environment variable and ships no scripts, just the SKILL.md and an auth setup note.

It is MIT licensed, scores 90/100 and has about 2,000 installs recorded by skills.sh. Use it when the best source is a person talking: a founder interview, a conference keynote, a lecture series. Transcripts are searchable; a two-hour interview is not, until it is text.

A typical request looks like this.

```text
Find the three most recent talks from this conference channel about vector
databases. Pull the transcripts and quote every claim about query latency.
```

### deep-reader: read long papers and books without losing the page

[deep-reader](https://skills.suedeai.ai/directory/tronghieu/agent-skills/deep-reader/) reads, studies and answers questions about long books and papers without loading the whole text into one context window. It keeps page-anchored notes as a reusable workspace, a `{slug}-notes/` folder beside the source, so a follow-up question next week starts from the notes instead of from zero. It covers PDFs, EPUBs, theses, dissertations and survey papers of roughly 50 pages or more, in any language.

The SKILL.md walks a multi-pass method: prepare, set a reading purpose, an inspectional pass, an analytical pass in study mode, synthesis and a verify step. It also has sections on critical judgment and syntopical reading across several books. Eight shell scripts do the mechanical work, including `prepare-text.sh`, `read-pages.sh` and `search-book.sh`. The file summary shows no network calls.

It is MIT licensed, scores 90/100 and has fewer than 1,000 installs recorded by skills.sh. Do not use it for anything under about 30 pages; its own description says to read short documents directly.

For a long paper, I ask like this.

```text
Read this 220-page dissertation in study mode. Summarize the method chapter
and cite the page for every claim about sample size.
```

### citation-management: check every reference before it ships

[citation-management](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/citation-management/) searches OpenAlex, PubMed and Google Scholar for papers, extracts metadata, validates citations and generates formatted BibTeX. It converts DOIs to BibTeX and checks reference accuracy in scientific writing.

Its SKILL.md runs in phases: paper discovery, metadata extraction, a metadata enrichment step via web search that it marks as mandatory, BibTeX formatting, citation validation and integration with your writing. It bundles eight Python scripts. The files read `OPENALEX_API_KEY` and `NCBI_API_KEY`, call doi.org, eutils.ncbi.nlm.nih.gov, api.crossref.org and arxiv.org, and run `pip install`. That network use is what lets it check a reference against the record rather than against memory.

It is MIT licensed and scores 89/100. skills.sh publishes no install count for it. Use it on anything with a bibliography: a paper, a grant, a white paper with footnotes. Skip it for an internal memo with three links.

A request I would make before submission.

```text
Validate every reference in refs.bib against Crossref and PubMed. Flag any
DOI that does not resolve and fix the author lists that do not match.
```

### manus: AI deep research handed to another agent

[manus](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/manus/) delegates complex, long-running tasks to the Manus AI agent for autonomous execution. Its description names deep web research, market analysis, product comparisons, stock analysis, competitive research, document generation and data analysis, plus multi-step workflows that benefit from parallel processing. It triggers on phrases like "use manus", "delegate to manus" and "check manus sessions".

The SKILL.md covers creating a task, checking status, listing tasks, multi-turn conversations, deleting a task, file attachments, projects and error handling, with research prompt examples near the top. There are no bundled scripts; it documents a `MANUS_API_KEY` and keeps an API reference in `references/api.md`. You need your own access to Manus.

It is Apache-2.0, scores 87/100 and has fewer than 1,000 installs recorded by skills.sh. Reach for it when the job is wide and slow, such as a twelve-company comparison, and you would rather check back than watch. Do not hand it a question you could answer from one document.

A delegation I would actually send.

```text
Delegate to manus: compare pricing, free tiers and data residency for the
top eight European email providers. Return a table with a source per cell.
```

### seo: research what people actually search for

[seo](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) audits and fixes technical SEO, researches search demand, creates content briefs, and measures SEO, AEO and GEO performance. Its description lists triggers like "check keyword volume", "write an SEO brief" and "why did organic traffic drop". It hands off on purpose: agent-ready for Mintlify Agent Score and similar reports, ghostwriter for writing the article, ui-design for visual redesign.

This skill has no full directory page yet, so I cannot tell you what its files contain, and I will not guess. Read its SKILL.md in the repository before you install it.

It is MIT licensed, scores 87/100 and has fewer than 1,000 installs recorded by skills.sh. In a research stack it covers the demand side: what people search for, how much, and how a topic performs in SEO, AEO and GEO terms. Use it when the research feeds a content plan. Skip it for academic or account research.

A demand question looks like this.

```text
Research search demand for "home battery storage" in the US. Group the
queries by intent and draft a content brief for the biggest cluster.
```

### company-research: find and score companies that fit your ICP

[company-research](https://skills.suedeai.ai/directory/browserbase/skills/company-research/), from Browserbase's own repository, researches a company's product and ICP, discovers target companies with the Browserbase Search API, researches each one with a plan, research, synthesize pattern and scores ICP fit. The output is a scored research report and a CSV. It has three depth modes, quick, deep and deeper, to trade scale for depth.

The SKILL.md is a pipeline: set up an output directory, research your own company, choose a depth mode, discover, research and score, then compile the report and CSV. It bundles three JavaScript scripts (`compile_report.mjs`, `extract_page.mjs` and `list_urls.mjs`), an example profile and an HTML report template. It documents a `BROWSERBASE_API_KEY`, so you need a Browserbase account.

It is MIT licensed, scores 84/100 and has about 2,000 installs recorded by skills.sh. Scoring fit is the useful part: a list of two hundred companies is noise, a list of twenty with reasons is a plan.

A first run I would try.

```text
Research our product at example.com, define the ICP, then find 25 target
companies in deep mode. Score fit and export the report and CSV.
```

## How to use the stack together

1. Check what you already know with [**chat-history**](https://skills.suedeai.ai/directory/mblode/agent-skills/chat-history/). A good share of the research I have paid for twice was sitting in an old session.
2. For a company, run [**company-research**](https://skills.suedeai.ai/directory/browserbase/skills/company-research/) in quick mode first, then deep. You finish with a ranked CSV of ICP fit rather than a pile of tabs.
3. For a market, hand the long job to [**manus**](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/manus/) and check back on the task. Ask for a source per claim in the prompt.
4. When the research feeds content, add [**seo**](https://skills.suedeai.ai/directory/mblode/agent-skills/#seo) for search demand and a content brief. It also measures AEO and GEO performance.
5. For a paper or a book, use [**deep-reader**](https://skills.suedeai.ai/directory/tronghieu/agent-skills/deep-reader/). Its page-anchored notes mean every answer points back to a page.
6. When the best source is a talk or an interview, pull it with [**youtube-full**](https://skills.suedeai.ai/directory/zeropointrepo/youtube-skills/youtube-full/). Search the channel, fetch the transcript and quote it with the video link.
7. Check every reference with [**citation-management**](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/citation-management/) before anything leaves your desk. Let it write the BibTeX too.
8. Write the brief with every claim pointing at a source from steps 2 to 7. A research note without sources is an opinion in a nicer font.

## Install the stack

```bash
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/chat-history
npx skills add https://github.com/ZeroPointRepo/youtube-skills/tree/main/clawhub/youtube-full
npx skills add https://github.com/tronghieu/agent-skills/tree/main/skills/deep-reader
npx skills add https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/skills/citation-management
npx skills add https://github.com/sanjay3290/ai-skills/tree/main/skills/manus
npx skills add https://github.com/mblode/agent-skills/tree/main/skills/seo
npx skills add https://github.com/browserbase/skills/tree/main/skills/company-research
```

The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [literature-review](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/literature-review/) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 89/100 | You need a systematic, scoping or narrative review of a whole field, with PRISMA reporting, not one paper. |
| [paper-lookup](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#paper-lookup) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 87/100 | You want 18 scholarly APIs at once, including Unpaywall for open-access PDFs. |
| [transcript](https://skills.suedeai.ai/directory/zeropointrepo/youtube-skills/transcript/) | [ZeroPointRepo/youtube-skills](https://github.com/ZeroPointRepo/youtube-skills) | 87/100 | You only need the spoken content of one video, not channel search or playlists. |
| [research-grants](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#research-grants) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 87/100 | The research feeds an NSF, NIH, DOE, DARPA or Taiwan NSTC grant proposal. |

Choose by scope. deep-reader reads one long source; literature-review covers a field. youtube-full searches and browses; transcript fetches one video. When the job is narrow, the narrower tool is easier to read before you trust it.

## Common mistakes

- Starting from zero. Run chat-history first; the answer you need may already sit in a session from last month.
- Treating a delegated report as finished. manus runs autonomously, but a person still reads the cited sources before acting.
- Loading a whole book into one prompt. deep-reader builds page-anchored notes and answers from those.
- Shipping unverified references. citation-management validates references and verifies citation metadata, which catches the invented citation before a reviewer does.
- Running paid lookups without a budget. youtube-full prices calls in credits, and manus, company-research and citation-management call outside services; set limits before a long job.

## Licenses, costs and checks before you install

Six of the seven picks are MIT licensed and manus is Apache-2.0, all open licenses. Confirm the license file in each repository anyway.

According to their files, several picks touch keyed services. company-research documents a `BROWSERBASE_API_KEY`. manus documents a `MANUS_API_KEY` and needs access to the Manus agent. youtube-full documents a `TRANSCRIPT_API_KEY` and lists credit costs per call. citation-management reads `OPENALEX_API_KEY` and `NCBI_API_KEY`, calls four outside hosts and runs `pip install`. chat-history's files list no outside host, but it reads your conversation history. The directory has not summarized seo's files.

The directory has not security scanned any listed skill; its [trust page](https://skills.suedeai.ai/directory/trust/) explains what is and is not checked, and the [methodology page](https://skills.suedeai.ai/directory/methodology/) explains the scores. Read each SKILL.md before you enable it, and read the scripts of any skill that holds a key.

## Related topics and stacks

The [Research](https://skills.suedeai.ai/directory/topics/research/) topic lists 46 skills, [Context Engineering and Agent Memory](https://skills.suedeai.ai/directory/topics/context-memory/) lists 31, [Summarizer](https://skills.suedeai.ai/directory/topics/summarizer/) lists 16, [Subagents and Multi-Agent Orchestration](https://skills.suedeai.ai/directory/topics/subagents/) lists 40, and [Sales](https://skills.suedeai.ai/directory/topics/sales/) lists 64. The [Science and Research](https://skills.suedeai.ai/directory/science-research/) category holds the academic side.

Research rarely ends as research. The [documents and data stack](https://skills.suedeai.ai/directory/stacks/documents-and-data/) turns findings into Word files and slides, the [SEO and AI search stack](https://skills.suedeai.ai/directory/stacks/seo-and-ai-search/) turns demand research into pages, and the [sales prospecting stack](https://skills.suedeai.ai/directory/stacks/sales-prospecting/) turns a scored company list into outreach.

## FAQ

### What is the best AI research assistant skill for Claude Code?

chat-history, at 91/100 the top score in this stack. It recovers research you already did from local Claude Code, Codex, Grok and Cursor history, with source evidence. Start there even if the answer is nothing; a clean slate you can prove is worth the five minutes. Then pick by job: deep-reader (90/100) for a paper, manus (87/100) for a market, company-research (84/100) for accounts.

### Can Claude Code do AI deep research with these skills?

Yes, in two ways. manus delegates deep web research, market analysis and product comparisons to the Manus agent, which runs the task autonomously while you check its status. company-research runs discovery and deep research through the Browserbase Search API, in quick, deep and deeper modes. Both need their own service keys.

### Do these skills work in Codex and Cursor?

Yes. All seven use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them. chat-history even reads Codex and Cursor history, so it recovers research across tools.

### Are these research skills free?

The skills are open source: six are MIT and manus is Apache-2.0. Some services behind them need keys. company-research needs a Browserbase API key, manus needs Manus access, and youtube-full prices its calls in credits. citation-management reads keys for OpenAlex and NCBI. chat-history and deep-reader list no outside service in their files; the seo skill's files have not been summarized.

### Can the agent do the whole research job on its own?

manus is built for exactly that: its summary describes delegating complex, long-running tasks for autonomous execution. My rule is that an agent researches and a person decides. Read the sources it cites before you act on the conclusion, and keep citation-management in the loop for anything academic.

### How do I install a research stack in Claude Code?

Run one `npx skills add` command per skill, copied from the install section above. Then set the keys each skill documents, such as `BROWSERBASE_API_KEY` for company-research and `MANUS_API_KEY` for manus, and read each SKILL.md before the first run.
