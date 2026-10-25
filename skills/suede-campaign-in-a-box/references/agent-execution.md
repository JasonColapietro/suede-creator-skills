# Running Campaign Lanes With Agents

How to run this skill as parallel lane agents, keep a campaign on a recurring
check-in, and hand the team a campaign board they can open in a browser. Read
this only after the user picks multi-agent mode or asks for automation. The
evidence boundaries and Public Copy Gate in SKILL.md still apply to every
agent and every run.

Facts below were checked against vendor docs on 2026-10-25. Agent features
change fast, so re-check the linked page before quoting a limit to the user.

## 1. Parallel lane mode

### Wave plan

The SKILL.md cap of 4 concurrent lane agents is a pack policy, not a platform
limit. Claude Code allows up to 20 concurrent subagents by default, but every
lane report lands back in the main context, and 4 keeps the packager's input
readable. Run in waves:

| Wave | Agents | Why this order |
|---|---|---|
| 0 | Main session only | Write the campaign spine (below). No agents yet. |
| 1 | Lane 1 Identity Forge, Lane 2 Era Builder | Skip if the artist already has a clear world. Every later lane reads their output. |
| 2 | Up to 4 of Lanes 3 to 11 | Pick the lanes the request needs. Hooks (4) and Stunts (5) usually go first because the calendar depends on them. |
| 3 | Up to 4 more lanes, if needed | Same spine, plus Wave 2 outputs attached. |
| 4 | Packager (Lane 0) | Reconciles conflicts, builds the calendar, runs the Public Copy Gate once on all copy. |

### The campaign spine

Every lane agent gets the same spine in its brief so the lanes cannot drift
apart. Keep it under one screen:

```text
Artist name (exact spelling):
Release / moment and date:
Era thesis (from Lane 2, or "pending"):
Language rules and banned words:
Primary fan action the campaign must earn:
Known facts (supplied by the user):
Known gaps (rights, samples, credits, budget) marked UNKNOWN:
Channels in scope:
```

### Lane agent brief

Each dispatch names the model explicitly (SKILL.md rule) and returns the lane's
Output block from `references/lanes.md`, nothing else. Give each agent only
read tools unless it must write files. No lane agent posts, sends, schedules,
or spends; those actions belong to the human after review.

```text
You are running Lane <N> (<name>) of suede-campaign-in-a-box.
Model: <named model>.
Read references/lanes.md, section "Lane <N>" only.
Campaign spine: <paste>.
Return the Lane <N> Output block. Mark unknown facts UNKNOWN. Route rights
questions to suede-rights-passport instead of answering them. Do not post,
send, schedule, or create anything in a connected tool.
```

### Claude Code specifics

- Project subagents live in `.claude/agents/<name>.md` with YAML frontmatter.
  `name` and `description` are required; `tools` and `model` are optional. Set
  `model` explicitly in each lane file so it does not inherit the session
  model silently.
- Subagents spawned from the main conversation start in the background by
  default, and permission prompts from a background agent surface in the main
  session with the agent's name.
- Subagents can spawn their own subagents up to three levels deep by default.
  Lane agents do not need that: leave `Agent` out of their `tools` list.
- Source: https://code.claude.com/docs/en/sub-agents

### Codex specifics

- Custom agents are TOML files in `.codex/agents/` (project) or
  `~/.codex/agents/` (personal). Required fields: `name`, `description`,
  `developer_instructions`. Set `model` in each file.
- Codex spawns subagents when the user asks or when AGENTS.md or skill
  instructions request it, so this skill's "ask first" rule is what keeps a
  fleet from launching without consent.
- `agents.max_concurrent_threads_per_session` caps concurrent spawned threads.
  Set it to 4 to match the pack cap.
- Source: https://developers.openai.com/codex/subagents

## 2. Recurring campaign check-ins

A release campaign runs for weeks. A scheduled check-in reads the plan and the
connected tools, then reports what slipped. It drafts; it never sends.

### Pick the scheduler

| Need | Use | Notes |
|---|---|---|
| Runs with the laptop closed | Claude Code cloud scheduled task (`/schedule` or claude.ai/code/routines) | Pro, Max, Team, Enterprise. Research preview. Minimum interval 1 hour. Fresh repo clone each run, connectors chosen per task. |
| Needs local files (stems, artwork folders) | Claude Code Desktop scheduled task | Machine must be on. |
| Quick polling inside a working session | `/loop` | Ends when the session closes; recurring loops expire after 7 days. |
| Codex user | Codex automations | Local automations run best when the laptop is awake and Codex is open. |

Sources: https://code.claude.com/docs/en/web-scheduled-tasks,
https://code.claude.com/docs/en/scheduled-tasks,
https://openai.com/academy/codex-automations

### Approval posture for scheduled runs

Cloud scheduled-task runs start in auto mode, and every connector you leave on
the task is callable, including writes. So:

1. Remove every connector the check-in does not need to read.
2. Prefer read-only connections. Klaviyo's remote server accepts
   `?read-only=true`; Google Ads' official server is read-only today.
3. Put "draft only, never send, publish, schedule, or change spend" in the
   saved prompt itself.
4. Add a permission ask rule for any write tool that stays connected.

### Check-in prompt template

Write the saved prompt so it stands alone. Each run starts fresh.

```text
Weekly campaign check-in for <artist> / <release>, release date <date>.
Read campaign/plan.md in the repo. Using the connected tools (read only):
1. List scheduled social posts for the next 7 days and flag gaps against
   the content calendar.
2. Pull last week's email and post metrics. Compare to the KPI in the plan.
3. List asset requests in the plan that are past due.
Write a dated status note to campaign/checkins/<date>.md. Draft any fixes
as suggestions in that note. Do not send, publish, schedule, delete, or
change ad spend. A human approves every outbound action.
```

Good cadences: weekly from announce to release week, daily during release
week, then weekly for four weeks of post-drop.

## 3. Campaign board as an artifact

In Claude Code with a claude.ai login (Pro, Max, Team, Enterprise), the
packager can publish the Lane 0 package as an artifact: a private page on
claude.ai that the user can share with their team from the page header.

- Useful pages: the phase calendar, the asset request tracker with owners and
  due dates, side-by-side hook or teaser options, the rights gap list.
- An artifact can call claude.ai connectors each time someone opens it, so a
  board can show live Buffer queue or email metrics. Each viewer's own
  connector account is used, and each viewer approves access first.
- The page starts private. Sharing it with the artist's team or publicly is
  the user's call.
- Teammates on Team and Enterprise plans can comment on a shared artifact;
  comments sent to Claude come back to the session for revision.
- Source: https://code.claude.com/docs/en/artifacts

## 4. What stays human

Whatever the mode, these never run without explicit approval from the user in
the conversation: sending an email or SMS, publishing or scheduling a post,
creating or editing an ad or changing a budget, deleting anything in a
connected tool, and sharing an artifact outside the workspace. A scheduled
prompt is not approval; Claude Code's own docs say a fired prompt cannot act
as consent for actions during the run.
