# Which agent skills should you stack for documents and data?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 2, 2026.

**Short answer:** [docx](https://skills.suedeai.ai/directory/anthropics/skills/docx/) from anthropics/skills (91/100), with about 211,000 installs recorded by skills.sh, handles Word documents end to end, and [deep-reader](https://skills.suedeai.ai/directory/tronghieu/agent-skills/deep-reader/) from tronghieu/agent-skills (90/100) reads long books and papers without loading the whole text into one context window. For data, [mssql](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/mssql/) from sanjay3290/ai-skills (83/100) runs read-only SQL against SQL Server, and dbt-sf-to-bq-translator moves dbt models from Snowflake to BigQuery. This stack has no spreadsheet editor; tabular work goes in through SQL and comes out as a document or a slide.

## The stack

Six skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [docx](https://skills.suedeai.ai/directory/anthropics/skills/docx/) | [anthropics/skills](https://github.com/anthropics/skills) | 91/100 | Creates, reads, edits and manipulates Word documents and templates, including formatting, tables of contents, tracked changes, comments, images and find-and-replace. |
| [deep-reader](https://skills.suedeai.ai/directory/tronghieu/agent-skills/deep-reader/) | [tronghieu/agent-skills](https://github.com/tronghieu/agent-skills) | 90/100 | Reads and answers questions about long books and papers without loading the whole text into one context window, keeping page-anchored notes. |
| [dbt-sf-to-bq-translator](https://skills.suedeai.ai/directory/google/skills/dbt-sf-to-bq-translator/) | [google/skills](https://github.com/google/skills) | 89/100 | Translates Snowflake dbt SQL models to BigQuery SQL, handling SQL compilation, Jinja macro masking, BigQuery Translation Service workflows, config transformations, type casting and deduplication. |
| [literature-review](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/literature-review/) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 89/100 | Conducts systematic, scoping and narrative literature reviews using sources such as PubMed, arXiv and bioRxiv, tracking search coverage and evidence limitations. |
| [presentation-creator](https://skills.suedeai.ai/directory/getsentry/skills/presentation-creator/) | [getsentry/skills](https://github.com/getsentry/skills) | 84/100 | Creates data-driven presentation slides with React, Vite and Recharts in Sentry branding, with charts, animations and single-file HTML output. |
| [mssql](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/mssql/) | [sanjay3290/ai-skills](https://github.com/sanjay3290/ai-skills) | 83/100 | Executes read-only SQL queries against multiple Microsoft SQL Server databases, supporting schema exploration, SELECT queries for data analysis, and checking database contents. |

## How to use it

1. Read with **deep-reader**. It answers questions about long books and papers without loading the whole text into one context window, and it keeps page-anchored notes, so every answer points back to a page you can check.
2. For a body of papers rather than one, use **literature-review**. It runs systematic, scoping and narrative reviews across sources such as PubMed, arXiv and bioRxiv, and it tracks search coverage and evidence limitations, which is the part most summaries skip.
3. Query with **mssql**. It runs read-only SQL against multiple Microsoft SQL Server databases: schema exploration, SELECT queries for analysis, and checking what a database holds. Read-only is the point.
4. If your dbt models live on Snowflake and are moving to BigQuery, **dbt-sf-to-bq-translator** handles the SQL compilation, Jinja macro masking, BigQuery Translation Service workflows, config transformations, type casting and deduplication.
5. Present with **presentation-creator**. It scaffolds data-driven slides with React, Vite and Recharts, with charts, animations and a single-file HTML output. It ships in Sentry branding, so check how much of that you can change before you commit to it.
6. Deliver with **docx**. It creates, reads, edits and manipulates Word documents and templates, including formatting, tables of contents, tracked changes, comments, images and find-and-replace. Tracked changes matter when a person has to approve the final text.

## Install the stack

```bash
npx skills add https://github.com/anthropics/skills/tree/main/skills/docx
npx skills add https://github.com/tronghieu/agent-skills/tree/main/skills/deep-reader
npx skills add https://github.com/google/skills/tree/main/skills/cloud/dbt-sf-to-bq-translator
npx skills add https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/skills/literature-review
npx skills add https://github.com/getsentry/skills/tree/main/skills/presentation-creator
npx skills add https://github.com/sanjay3290/ai-skills/tree/main/skills/mssql
```

The [skills CLI](https://skills.sh/) works for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## What to check before you install

- Licenses: the directory records docx under a Proprietary license, so read its terms before you use it in a commercial product. deep-reader and literature-review are MIT; dbt-sf-to-bq-translator, presentation-creator and mssql are Apache-2.0.
- Services: mssql needs connection details and credentials for each database. dbt-sf-to-bq-translator uses the BigQuery Translation Service. literature-review queries PubMed, arXiv and bioRxiv. A skill that connects to a database is one to read line by line before you give it a password.
- Read each SKILL.md before you enable it. The directory has not security scanned any skill.

## FAQ

### Is there a spreadsheet skill in this stack?

No. None of the six summaries covers spreadsheet files, and I would rather say so than pad the table. The route here is SQL in, document out: query with mssql, then write the result up with docx or presentation-creator. If you need to edit a workbook directly, look for a skill whose summary says so and read its SKILL.md first.

### Do these skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Why is docx proprietary when the rest are open?

I cannot tell you the reason; I can tell you what the directory records. docx is listed under a Proprietary license and the other five under MIT or Apache-2.0. That does not make it unusable. It means you read the terms rather than assume them, especially if the documents you produce are sold or redistributed.
