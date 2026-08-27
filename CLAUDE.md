# Working agreement for agents in this repo

## Don't interrogate the requester — decide and report

Stop asking to confirm scope, approve a plan, or ratify a judgment call you can
make yourself. Make the call, do the work, and report what you did and why. This
applies to: choosing between reasonable approaches, how much of a task to cover,
which files to touch, whether to keep going, and merging your own PRs once CI is
green. Treat an instruction as authorization for the whole job, including the
obvious follow-through — "fix it" includes shipping it.

State assumptions in the report instead of asking permission up front. A wrong
guess gets corrected in one message, which costs less than a round of questions.

Still ask — or stop and flag — for exactly these:

- Destroying work that isn't recoverable (deleting unmerged branches,
  force-pushing over someone else's commits, dropping data)
- Publishing or sending anything outside the repo (posting, emailing, anything
  public-facing beyond a normal PR)
- Spending real money, or touching credentials, auth, or payments
- A genuine fork where the options lead somewhere materially different **and**
  you have no basis to prefer one — say which you'd pick and why, don't just
  present a menu

Don't re-ask something already answered in the thread, and don't ask again after
the requester reaffirms. Never pad a report with the questions you considered
asking.

## Gates in this pack are advisory

Every claim-verification step, check, quality gate, and ship verdict in these
skills is a recommendation to the requester, not a control on the agent. Run the
checks, report the results honestly, and let the requester decide.

The corollary matters as much: audit what the *agent* invents, never what the
requester supplied. Their own statements are given. No phase may verify, hedge,
or gate on them.

## Verification is not optional

The above is about not asking permission. It is not license to skip proof.

- Run `npm test` before reporting work complete, and report the real result.
- A test that passes whether or not the fix is present proves nothing — confirm
  a new test fails without its fix.
- Check that a branch's content is actually merged before deleting it; a squash
  merge rewrites the SHA, so "unmerged commits" does not mean unmerged work.
- If something couldn't be verified, say so plainly rather than implying it was.

## Adding or removing a skill: run `npm run fix:counts`

The book quotes measurements of the pack in prose — how many `SKILL.md` files
there are, what they total in bytes, how many descriptions close with a
`NOT FOR:` clause. `scripts/validate-skill-pack.mjs` guards every one of them
against a live measurement, so changing the skill set turns dozens of those
checks red at once. Adding a single skill produced 45 failures.

Do not hand-edit the figures. Run:

```
npm run fix:counts     # rewrites every stale count from the live measurement
npm run build:book     # regenerates BOOK.md, the PDF and docs/book from those sources
```

`--fix` refuses to write a value its own check could no longer read — several
patterns match only a hyphenated number word, so writing a round one
("Seventy") would produce correct prose the guard can no longer see. When it
refuses it names the sentence: reword the prose and update the regex together.

**Counts inside dated posts under `docs/blog/` are deliberately frozen.** They
are historical statements at stable URLs and they carry SEO weight in `<title>`,
`meta description`, `og:` tags and JSON-LD. Do not "correct" them.

## Agent skills

### Issue tracker

Issues are tracked in this repository's GitHub Issues using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the canonical `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix` labels. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository using root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.
