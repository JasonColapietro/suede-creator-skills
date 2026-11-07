# Directory growth surfaces

The directory build now publishes:

- 500 additional assessment pages selected in `full-pages.json`, with source,
  licensing, score components, install routes and portable reports. Selection
  does not grant an editorial feature or imply a full dependency review.
- 50 static comparisons drawn from shared topics and recorded installs. This
  is a reproducible selection heuristic, not measured comparison search volume.
- `/state-of-agent-skills/`, including a downloadable SVG, CSV and JSON report.
  All figures and rankings exclude Suede AI’s own skills.
- `/finder/`, with the installable source in `directory/suede-directory/`.
- `/rising/`, a readable issue and reusable Markdown draft from the saved weekly
  install history. Its dates stay tied to the source snapshot.

Regenerate through `npm run build:directory`. The normal Vercel build rehomes
the generated output to suedeai.directory. Existing editorial pages, scores,
licenses and repository anchors remain available. The full-page manifest is
retained across data refreshes so a ranking change does not retire a public URL.

## Email connection

Set `signup_url` in `newsletter.json` to the newsletter provider’s public HTTPS
signup page. The directory will then show an email CTA on the home, Top 100,
topic, category and check pages, and on Rising Skills. The provider owns the
email form, consent, confirmation, subscriber storage and unsubscribe process.
No credentials belong in this file.

Until a provider is connected, the site offers the actual RSS feed and clearly
states that email signup is not open. It does not collect addresses or claim to
have subscribed anyone. The generated issue is a draft for the provider; no
scheduled email campaign or automatic delivery is configured.

Before launching email, configure sender identity, confirmation and unsubscribe
handling with the provider, test the signup end to end, refresh the install
snapshot, and add an editorial pick to the issue. Do not send an old snapshot
as this week’s movement.

## Outreach and launch copy

Run `node scripts/build-directory-outreach.mjs` to regenerate the first 25 badge
outreach drafts; `--check` detects stale output. Review the existing
`directory/DISTRIBUTION.md` ledger before contacting anyone. The queue includes
an actual skill, score, report URL and copyable badge for every repository.
No message, social post or upstream submission is sent by these scripts.

Launch draft:

> Show HN: A graded agent-skills directory with open reports and in-agent search
>
> We built Suede AI Skills Directory to help developers inspect an agent skill
> before installing it. Each listing links to its publisher and license, with a
> 0–99 score computed from the published files. The score breakdown and dated
> evidence are available as JSON.
>
> The new State of Agent Skills report compares grade distribution, common
> unearned rubric points, and install popularity against quality. It excludes
> our own skills. There are also static skill comparisons and a read-only finder
> for Claude Code, Codex and Cursor.
>
> Try it: https://suedeai.directory/
> Report: https://suedeai.directory/state-of-agent-skills/
> Finder: https://suedeai.directory/finder/
>
> What evidence would most help you choose between two skills for the same job?

Awesome-list entry, to adapt only after checking each list’s rules and existing
submissions:

> [Suede AI Skills Directory](https://suedeai.directory/) — A graded index of
> agent skills for Claude Code, Codex and Cursor, with source links, license
> details, per-skill score reports and an open JSON API.
