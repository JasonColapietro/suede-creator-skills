# Recurring Workflows (Claude Code scheduling)

Read this file only when the user wants a Suede check or next-move digest to
run on a schedule, for example "check the PR every 20 minutes", "every
Monday, tell me what's next on this repo", or "re-grade the homepage
weekly". It changes nothing about routing.

Source: https://code.claude.com/docs/en/scheduled-tasks (compare table,
`/loop`) and https://code.claude.com/docs/en/routines (cloud scheduled
tasks, formerly routines).

## Pick the scheduler

| Need | Use | Key limits |
|---|---|---|
| Poll while the user is in the session | `/loop` | Session must stay open; recurring tasks expire after 7 days; 1-minute minimum |
| Run on the user's machine with local files | Desktop scheduled task | Machine must be on; set up from the Desktop app |
| Run with the laptop closed | Cloud scheduled task via `/schedule` | Fresh clone each run; 1-hour minimum; research preview; Pro, Max, Team, or Enterprise |

## Session polling with /loop

`/loop` takes an optional interval (`s`, `m`, `h`, `d`) and a prompt. The
prompt can be a skill, which re-runs that skill each iteration:

```text
/loop 20m /suede-workflow-skills what's next on this branch? read-only
/loop check whether CI passed on this PR and report the failing job
```

With no interval, Claude picks a delay between one minute and one hour
after each pass. When installed through the plugin, the skill is namespaced:
`/suede-skills:suede-workflow-skills`. A scheduled fire only runs skills
Claude may invoke on its own, which this skill allows.

To make a bare `/loop` run a Suede check by default, put the prompt in
`.claude/loop.md` (project) or `~/.claude/loop.md` (user). Content past
25,000 bytes is truncated.

Stop a fixed-interval loop by asking Claude to cancel it ("cancel the CI
check loop"); `Esc` stops a self-paced loop while it waits. Recurring tasks
fire one last time and delete themselves 7 days after creation.

## Unattended runs with /schedule

`/schedule` (alias `/routines`) creates a cloud scheduled task
conversationally, for example:

```text
/schedule every Monday at 9:07am, run the suede-workflow-skills next move on this repo and post the recommended action and quick prompt as a PR comment draft
```

What changes in the cloud:

- **Skills must be in the repo.** A cloud session loads skills committed to
  the cloned repository. It does not load plugins installed on the user's
  machine or plugins the repo's `.claude/settings.json` turns on. To give a
  scheduled task this skill, commit it under `.claude/skills/`, for example
  with `npx skills add JasonColapietro/suede-creator-skills --skill suede-workflow-skills -a claude-code`
  run inside the repo, then commit the result.
- **Permissions run in auto mode** by default, so write the prompt to keep
  the next-move pass read-only. The fired prompt is not live user input and
  cannot approve an action on the user's behalf.
- **Pushes land on `claude/`-prefixed branches** unless the prompt says
  otherwise. Branch protection still applies.
- **Hourly minimum.** Cron expressions that run more than once an hour are
  rejected. Pick a minute off the hour (9:07, not 9:00) for a closer start.

Manage tasks with `/schedule list`, `/schedule update`, and `/schedule run`,
or at https://claude.ai/code/routines. API and GitHub-event triggers are
added on the web.

## Good recurring Suede jobs

Keep each one read-only unless the user authorized a write in the task
prompt itself.

- Weekly next-move digest for a repo: the Next move output from SKILL.md,
  delivered as a comment draft or report.
- Visibility re-grade of one public URL with `suede-visibility-grader`,
  compared against last week's grade.
- CI watch during a release with `/loop`, reporting the first failing job
  and its log tail.

Hooks for per-turn gates are a separate tool; see `references/hook-gates.md`.
Codex and Hermes have no equivalent covered here.
