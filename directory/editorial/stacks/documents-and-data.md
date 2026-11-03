# Which agent skills should you stack for documents and data?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** for Claude Excel work, [xlsx](https://skills.suedeai.ai/directory/anthropics/skills/xlsx/) from anthropics/skills (85/100) opens, edits, creates and converts .xlsx and .csv files with formulas, formatting and charts, and [docx](https://skills.suedeai.ai/directory/anthropics/skills/docx/) (91/100) does the same for Word documents. [deep-reader](https://skills.suedeai.ai/directory/tronghieu/agent-skills/deep-reader/) (90/100) reads long PDFs and books without loading the whole text into one context window. For data in a database, mssql (83/100) runs read-only SQL against SQL Server, and dbt-sf-to-bq-translator (89/100) moves dbt models from Snowflake to BigQuery. Add literature-review for a body of papers and presentation-creator for data slides.

## The stack

Seven skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [docx](https://skills.suedeai.ai/directory/anthropics/skills/docx/) | [anthropics/skills](https://github.com/anthropics/skills) | 91/100 | Creates, reads, edits and manipulates Word documents and templates, including formatting, tables of contents, tracked changes, comments, images and find-and-replace. |
| [deep-reader](https://skills.suedeai.ai/directory/tronghieu/agent-skills/deep-reader/) | [tronghieu/agent-skills](https://github.com/tronghieu/agent-skills) | 90/100 | Reads and answers questions about long books and papers without loading the whole text into one context window, keeping page-anchored notes. |
| [dbt-sf-to-bq-translator](https://skills.suedeai.ai/directory/google/skills/dbt-sf-to-bq-translator/) | [google/skills](https://github.com/google/skills) | 89/100 | Translates Snowflake dbt SQL models to BigQuery SQL, handling SQL compilation, Jinja macro masking, BigQuery Translation Service workflows, config transformations, type casting and deduplication. |
| [literature-review](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/literature-review/) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 89/100 | Conducts systematic, scoping and narrative literature reviews using sources such as PubMed, arXiv and bioRxiv, tracking search coverage and evidence limitations. |
| [xlsx](https://skills.suedeai.ai/directory/anthropics/skills/xlsx/) | [anthropics/skills](https://github.com/anthropics/skills) | 85/100 | Opens, edits, creates and converts spreadsheet files such as .xlsx and .csv, including formulas, formatting, charts and cleaning messy tabular data. |
| [presentation-creator](https://skills.suedeai.ai/directory/getsentry/skills/presentation-creator/) | [getsentry/skills](https://github.com/getsentry/skills) | 84/100 | Creates data-driven presentation slides with React, Vite and Recharts in Sentry branding, with charts, animations and single-file HTML output. |
| [mssql](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/mssql/) | [sanjay3290/ai-skills](https://github.com/sanjay3290/ai-skills) | 83/100 | Executes read-only SQL queries against multiple Microsoft SQL Server databases, supporting schema exploration, SELECT queries for data analysis, and checking database contents. |

## Who this stack is for

This stack is for people whose work starts in a file or a database and ends in a document someone else signs. An analyst who pulls numbers from SQL Server every Monday and writes them up in Word. A consultant who has to read a 200-page PDF report before a client call. A finance lead with a messy CSV export who needs a clean workbook whose formulas recalculate. A data engineer moving dbt models from Snowflake to BigQuery. A researcher who needs a defensible literature review, not a list of abstracts.

The shape is the same each time: read or query, check, then deliver a file. The picks split cleanly along that line. deep-reader and literature-review read. xlsx, mssql and dbt-sf-to-bq-translator handle the data. docx and presentation-creator deliver.

All seven are in the [Agent Skills](https://agentskills.io/) format, so the same folders work in Claude Code, Codex and Cursor. If you came here for an AI spreadsheet tool, xlsx is the pick: it works on the workbook itself.

## The Suede AI skill built for this job

I built [suede-analytics](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-analytics) for exactly this job: making sure the numbers you query, chart and write up were measured correctly before anyone reports them. It sets up GA4 and Google Tag Manager, key events, consent, UTMs, and search and AI channels, and it closes with readback proof, so the setup is confirmed rather than assumed. When the request is "fix our analytics events", this is the skill that takes it.

Start with it before the first report. Every pick below turns data into a file someone reads, and none of them can tell you that an event fired twice, a consent setting dropped sessions or a UTM was mistyped. A Word report built on a broken event is a well-formatted mistake.

It makes the third-party stack work harder. Once events, UTMs and channels are set and read back, the analytics numbers you pull are numbers you can defend, [xlsx](https://skills.suedeai.ai/directory/anthropics/skills/xlsx/) models them in a workbook, [presentation-creator](https://skills.suedeai.ai/directory/getsentry/skills/presentation-creator/) charts them and [docx](https://skills.suedeai.ai/directory/anthropics/skills/docx/) delivers them with tracked changes. It stays in its lane: experiment decisions, campaign optimization, attribution reconciliation and revenue operations belong to other skills.

It is my company's skill, so it stays out of the ranking. Set up measurement with it first, then let the rest of the stack report.

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-analytics
```

## The skills, one by one

### docx: Word documents, templates and tracked changes

[docx](https://skills.suedeai.ai/directory/anthropics/skills/docx/) creates, reads, edits and manipulates Word documents (.docx) and Word templates (.dotx). Its description covers tables of contents, headings, page numbers, letterheads, images, find-and-replace, tracked changes and comments, and turning content into a polished Word file. If you ask for a report, memo, letter or template as a .docx, this is the skill that should fire. It is explicitly not for PDFs, spreadsheets or Google Docs.

The SKILL.md has five sections: gotchas when creating with docx-js, verifying the output, editing existing documents, comments, and dependencies. It bundles 15 Python scripts, including `accept_changes.py`, `comment.py` and `merge_runs.py`, plus Office XML schema files. The file summary lists no environment variables and no network calls.

It scores 91/100, the top score here, and has about 211,000 installs recorded by skills.sh. The directory records its license as Proprietary, which I cover in the checks section. Reach for it whenever a person has to review, redline or sign the output. Tracked changes matter when someone has to approve the final text.

A typical request.

```text
Turn findings.md into a Word report with a table of contents, page numbers
and our letterhead template. Keep my edits as tracked changes.
```

### deep-reader: long PDFs in Claude, with page-anchored notes

[deep-reader](https://skills.suedeai.ai/directory/tronghieu/agent-skills/deep-reader/) reads, studies and answers questions about long books and papers without loading the whole text into one context window. It handles PDFs, EPUBs, textbooks, theses and survey papers of roughly 50 pages or more, in any language, and keeps page-anchored notes in a reusable `{slug}-notes/` workspace beside the source. That workspace is what makes it useful for Claude PDF work: next week's follow-up question starts from the notes.

The SKILL.md is a multi-pass method: prepare, set a reading purpose, an inspectional pass, an analytical pass in study mode, synthesis and verify. It also covers answering from existing notes and syntopical reading across several books. Eight shell scripts do the mechanical work, including `prepare-text.sh`, `read-pages.sh` and `search-book.sh`. The file summary shows no network calls.

It is MIT licensed, scores 90/100 and has fewer than 1,000 installs recorded by skills.sh. Do not use it for documents under about 30 pages; its own description says to read those directly.

How I would start with a long report.

```text
Read annual-report.pdf in study mode. List every figure about operating
margin with its page number, then summarize the risk section.
```

### dbt-sf-to-bq-translator: move dbt models from Snowflake to BigQuery

[dbt-sf-to-bq-translator](https://skills.suedeai.ai/directory/google/skills/dbt-sf-to-bq-translator/), from Google's own repository, translates Snowflake dbt SQL models to standardized BigQuery SQL. It handles SQL compilation, Jinja macro placeholder masking, BigQuery Translation Service migration workflows, AST-based config transformations, explicit type casting, JSON extraction standardization and deduplication. Its description is clear about scope: not for generic BigQuery queries or non-Snowflake migrations.

The SKILL.md reads as six rules: a mandatory file header, standardized JSON and array extraction, explicit type safety, prescriptive string and date functions, mandatory deduplication and joins, and preserving Jinja constructs. It bundles two Python scripts, `dbt_translator.py` and `bulk_translate_via_gcloud.py`, plus a reference on dbt migration patterns. Read the bulk script before the first run; as its name says, it works through gcloud, so check which Google Cloud project gcloud points at.

It is Apache-2.0, scores 89/100 and has about 3,000 installs recorded by skills.sh. Use it for a real migration with many models. Skip it if your warehouse is not Snowflake on one side and BigQuery on the other.

A migration request looks like this.

```text
Translate the models in models/marts/finance from Snowflake to BigQuery.
Preserve the Jinja, cast types explicitly and list anything you could not map.
```

### literature-review: systematic reviews across a field

[literature-review](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/literature-review/) conducts systematic, scoping and narrative literature reviews using PubMed, arXiv, bioRxiv, Semantic Scholar and other sources. It covers research synthesis, reproducible searches, screening, citation checking, and Markdown and PDF output. It tracks search coverage, records versus studies, and evidence limitations. It supports meta-analysis planning but, in its own words, does not supply a meta-analysis engine.

The SKILL.md has sections on figures and PRISMA reporting, search strategy, screening and selection, synthesis, and quality and reproducibility. It bundles five Python scripts, including `search_databases.py`, `verify_citations.py` and `generate_pdf.py`, plus references on citation styles and database strategies and a review template. The PRISMA section is the one to read first if the review is headed for publication. The files read `OPENROUTER_API_KEY`, document `PARALLEL_API_KEY`, call doi.org, api.crossref.org and openrouter.ai, and run `brew install`.

It is MIT licensed and scores 89/100; skills.sh publishes no install count for it. Use it when the question covers a field. For one paper, deep-reader is the better tool.

A scoping request.

```text
Run a scoping review on remote patient monitoring for heart failure since
2020. Track search coverage and export the review as Markdown and PDF.
```

### xlsx: Claude Excel work on real spreadsheet files

[xlsx](https://skills.suedeai.ai/directory/anthropics/skills/xlsx/) is for any task where a spreadsheet file is the main input or output. It opens, reads, edits and fixes .xlsx, .xlsm, .xltx, .csv and .tsv files: adding columns, computing formulas, formatting, charting and cleaning messy data. It creates new spreadsheets from scratch or from other sources, converts between tabular formats, and restructures messy files with malformed rows, misplaced headers or junk data. It should fire when you mention a file casually, such as "the xlsx in my downloads".

The SKILL.md is strict where it counts. It sets requirements for every output, makes recalculation mandatory whenever a file contains formulas, explains how to choose formulas that survive verification, lists openpyxl gotchas and has a section on financial models. It bundles 12 Python scripts plus Office XML helper and schema files like the ones in docx. The file summary lists no environment variables and no network calls.

It scores 85/100 and has about 192,000 installs recorded by skills.sh. Like docx, the directory records its license as Proprietary. The deliverable must be a spreadsheet file: its description rules out Word documents, HTML reports, standalone Python scripts, database pipelines and Google Sheets API integrations, even when tabular data is involved.

A workbook request.

```text
Open budget_2027.xlsx, add a variance column against actuals.csv using
formulas, recalculate, and chart variance by department on a new sheet.
```

### presentation-creator: data slides as one HTML file

[presentation-creator](https://skills.suedeai.ai/directory/getsentry/skills/presentation-creator/), from Sentry's repository, creates data-driven slides using React, Vite and Recharts with Sentry branding. It scaffolds a complete slide-based app with charts, animations and single-file HTML output.

The SKILL.md walks six steps: gather requirements (with a data assessment it marks as critical), scaffold the project, build the slide system and navigation, create charts only when data exists, style with the Sentry design system, and use common slide patterns such as title, problem and data comparison. There are no bundled scripts; the references cover chart patterns and the design system, plus Sentry logo files.

It is Apache-2.0, scores 84/100 and has about 3,000 installs recorded by skills.sh. The "charts only when data exists" rule is the right instinct for a data deck. It ships in Sentry branding, so check how much of that you can change before you commit to it. For decks beyond one HTML file, the [presentations stack](https://skills.suedeai.ai/directory/stacks/presentations/) covers building slide decks.

A deck request.

```text
Build a six-slide deck from q3_metrics.csv: one title slide, one problem
slide, and four Recharts charts comparing regions. Output one HTML file.
```

### mssql: read-only SQL against SQL Server

[mssql](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/mssql/) executes read-only SQL queries against multiple Microsoft SQL Server databases: schema exploration, SELECT queries for analysis, and checking what a database holds. It supports several connections, each with a description, so a prompt can say "the sales database" and the agent selects the matching connection. It blocks all write operations, including INSERT, UPDATE, DELETE and DROP.

The SKILL.md covers requirements, setup and config fields, listing databases, querying, listing tables, showing a schema, limiting results, database selection, safety features, troubleshooting and exit codes. It bundles one Python script, `scripts/query.py`, a `requirements.txt` and a `connections.example.json` for your connection details.

It is Apache-2.0, scores 83/100 and has about 1,000 installs recorded by skills.sh. Read-only is the point: an agent exploring a production database should not be able to change it. Use it for analysis and reporting. Skip it if your data lives in Postgres or BigQuery; for a spreadsheet file, xlsx is the tool.

A Monday-morning query.

```text
Using the sales database, show the schema for the orders table, then total
revenue by region for last month. Limit results to 50 rows.
```

## How to use the stack together

1. Read the source with [**deep-reader**](https://skills.suedeai.ai/directory/tronghieu/agent-skills/deep-reader/). Every answer points back to a page, so the facts you carry forward can be checked.
2. For a body of papers rather than one, run [**literature-review**](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/literature-review/). It tracks search coverage and evidence limitations, which is the part most summaries skip.
3. Query the numbers with [**mssql**](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/mssql/). Start with the schema, then the SELECT, and keep the query text with the result.
4. Shape the numbers in a workbook with [**xlsx**](https://skills.suedeai.ai/directory/anthropics/skills/xlsx/). Clean the export, add formulas and recalculate, since its SKILL.md makes recalculation mandatory whenever a file has formulas.
5. If the models behind those numbers are moving from Snowflake to BigQuery, translate them with [**dbt-sf-to-bq-translator**](https://skills.suedeai.ai/directory/google/skills/dbt-sf-to-bq-translator/). Run the old and new models side by side before you trust the new totals.
6. Present with [**presentation-creator**](https://skills.suedeai.ai/directory/getsentry/skills/presentation-creator/) when the audience needs charts. It builds charts only when data exists, which keeps decorative slides out.
7. Deliver with [**docx**](https://skills.suedeai.ai/directory/anthropics/skills/docx/). Attach the workbook, put the query text and page references in an appendix, and keep reviewer edits as tracked changes.

## Install the stack

```bash
npx skills add https://github.com/anthropics/skills/tree/main/skills/docx
npx skills add https://github.com/tronghieu/agent-skills/tree/main/skills/deep-reader
npx skills add https://github.com/google/skills/tree/main/skills/cloud/dbt-sf-to-bq-translator
npx skills add https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/skills/literature-review
npx skills add https://github.com/anthropics/skills/tree/main/skills/xlsx
npx skills add https://github.com/getsentry/skills/tree/main/skills/presentation-creator
npx skills add https://github.com/sanjay3290/ai-skills/tree/main/skills/mssql
```

The [skills CLI](https://skills.sh/) works for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [liteparse](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#liteparse) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 89/100 | You need text with bounding boxes, OCR on scans or layout-preserved JSON for RAG, parsed locally. |
| [dask](https://skills.suedeai.ai/directory/k-dense-ai/claude-scientific-skills/#dask) | [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 87/100 | Your pandas or NumPy work no longer fits in memory and needs partitioned or cluster processing. |
| [bigquery-bigframes](https://skills.suedeai.ai/directory/google/skills/#bigquery-bigframes) | [google/skills](https://github.com/google/skills) | 87/100 | Your data already lives in BigQuery and you want Python DataFrames instead of SQL. |
| [google-analytics-data-api-basics](https://skills.suedeai.ai/directory/google/skills/#google-analytics-data-api-basics) | [google/skills](https://github.com/google/skills) | 87/100 | The numbers you report come from Google Analytics, through the Analytics Data API. |
| [kaggle](https://skills.suedeai.ai/directory/shepsci/kaggle-skill/kaggle/) | [shepsci/kaggle-skill](https://github.com/shepsci/kaggle-skill) | 90/100 | The dataset, notebook or competition is on Kaggle and you say so explicitly. |

Choose by where the data lives. mssql fits SQL Server; bigquery-bigframes fits BigQuery; google-analytics-data-api-basics fits GA reports; xlsx fits a workbook, and dask fits data that outgrew one. For reading, deep-reader answers questions about a long text, while liteparse extracts the text itself, with layout, for another tool to use.

## Common mistakes

- Pasting a whole PDF into one prompt. deep-reader reads in passes and keeps page-anchored notes, so answers stay traceable to a page.
- Giving an agent write access to a production database. mssql blocks INSERT, UPDATE, DELETE and DROP by design.
- Shipping translated SQL without comparing totals. dbt-sf-to-bq-translator handles type casting and deduplication rules, and you still check that old and new models agree.
- Calling a pile of abstracts a literature review. literature-review tracks search coverage and evidence limitations so the gaps are written down.
- Delivering a final Word file without tracked changes. docx keeps edits and comments visible for the person who has to approve them.
- Sending a workbook with stale formula values. xlsx makes recalculation mandatory whenever a file contains formulas.
- Assuming the license. docx and xlsx are recorded as Proprietary; the rest are open.

## Licenses, costs and checks before you install

The directory records docx and xlsx under a Proprietary license, so read their terms before you use them in a commercial product. deep-reader and literature-review are MIT. dbt-sf-to-bq-translator, presentation-creator and mssql are Apache-2.0.

Services and credentials, from the files: mssql needs connection details for each database you configure. dbt-sf-to-bq-translator works with the BigQuery Translation Service and bundles a script for bulk translation through gcloud. literature-review reads `OPENROUTER_API_KEY`, documents `PARALLEL_API_KEY`, calls doi.org, api.crossref.org and openrouter.ai, and runs `brew install`. docx, xlsx, deep-reader and presentation-creator list no network calls. A skill that connects to a database is one to read line by line before you give it a password.

The directory has not security scanned any listed skill; its [trust page](https://skills.suedeai.ai/directory/trust/) explains what is and is not checked. Read each SKILL.md before you enable it.

## Related topics and stacks

The [Documents](https://skills.suedeai.ai/directory/topics/documents/) topic lists 19 skills, [PDF](https://skills.suedeai.ai/directory/topics/pdf/) lists 12, [Spreadsheets](https://skills.suedeai.ai/directory/topics/spreadsheets/) lists 14, and [SQL and Databases](https://skills.suedeai.ai/directory/topics/sql/) lists 116. The [Documents and Office Files](https://skills.suedeai.ai/directory/documents-office/) category holds the rest.

The [research stack](https://skills.suedeai.ai/directory/stacks/research/) finds and checks sources before they reach a document, the [presentations stack](https://skills.suedeai.ai/directory/stacks/presentations/) covers slide decks beyond HTML, and the [technical docs stack](https://skills.suedeai.ai/directory/stacks/technical-docs/) covers documentation that lives with code.

## FAQ

### Can Claude work with Excel files using these skills?

Yes, through xlsx (85/100) from anthropics/skills, with about 192,000 installs recorded by skills.sh. For Claude Excel work it opens, reads, edits and fixes .xlsx, .xlsm, .xltx, .csv and .tsv files, adds columns and formulas, formats, charts, cleans messy data and creates new workbooks. Its SKILL.md makes recalculation mandatory whenever a file contains formulas. The directory records its license as Proprietary, so read the terms first.

### What is the best skill for reading a PDF in Claude?

For a long PDF, deep-reader (90/100). It reads documents of roughly 50 pages or more in passes, without loading the whole text into one context window, and keeps page-anchored notes you can reuse. For short PDFs, read them directly. If you need the raw text with layout, bounding boxes or OCR on scans, liteparse (89/100) is the alternative.

### What is the best AI spreadsheet skill for Claude Code?

xlsx (85/100), when the deliverable is a spreadsheet file. It creates workbooks, converts between tabular formats and restructures messy files with malformed rows or misplaced headers. Its description rules out Word documents, HTML reports, standalone scripts, database pipelines and Google Sheets API integrations. For data in SQL Server, query it with mssql first; for data too large for memory, dask is the alternative.

### Do these skills work in Codex and Cursor?

Yes. All seven use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Why are docx and xlsx proprietary when the rest are open?

I cannot tell you the reason; I can tell you what the directory records. docx and xlsx are listed under a Proprietary license and the other five under MIT or Apache-2.0. That does not make it unusable. It means you read the terms rather than assume them, especially if the documents or workbooks you produce are sold or redistributed.

### Which document skill should I install first?

docx (91/100) if your work ends in a Word file, or xlsx (85/100) if it ends in a workbook; read their Proprietary terms first. If your work starts with a long PDF, install deep-reader (90/100) first instead. Add mssql when the numbers live in SQL Server, and literature-review when one paper becomes a field.

### Are these document and data skills free?

Five are open source: deep-reader and literature-review under MIT, and dbt-sf-to-bq-translator, presentation-creator and mssql under Apache-2.0. docx and xlsx are recorded as Proprietary, so read their terms before commercial use. The costs sit in services: literature-review reads an `OPENROUTER_API_KEY`, mssql needs your own SQL Server databases, and dbt-sf-to-bq-translator works with the BigQuery Translation Service on Google Cloud.
