# Runtime Mapping: Claude Code and Codex

Use this file when the lane map is resolved and the lanes are about to run as
real agents instead of simulated roles. It maps the roster in `SKILL.md` onto
the agent primitives each host actually ships, so a lane's file ownership,
model, and review separation are enforced by configuration rather than by a
prompt the agent may drift from.

Every field and behavior below was checked against the official docs listed
under Sources. Version notes matter: several behaviors changed in 2026
releases, so check `claude --version` before relying on a flag that names a
minimum version.

## Contents

1. Pick the primitive per lane
2. Role definitions for Claude Code
3. Role definitions for Codex
4. Worktree isolation rules
5. Continuing a lane instead of re-spawning it
6. Hooks as gate reporters
7. Agent team limits that affect the ledger
8. Sources

## 1. Pick the primitive per lane

| Lane need | Claude Code primitive | Why |
|---|---|---|
| Read-only scout, grader, or reviewer that only returns a result | Subagent (`.claude/agents/<role>.md`) | Lowest token cost. The result returns to the orchestrator, which writes it to the ledger. |
| Builder that edits files in parallel with another builder | Subagent with `isolation: worktree` | Each builder gets its own checkout. Teammates do not get one by default, and the agent teams docs warn that two teammates editing the same file overwrite each other. |
| Reviewers that must challenge each other (consensus review, competing hypotheses) | Agent team teammates | Teammates message each other directly and share a task list with dependencies. |
| A human running several sessions by hand | `claude --worktree <name>` per session | No orchestration layer. The ledger is the only shared state. |

Agent teams are experimental and off by default. They need
`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` and an interactive session; with
`-p` and in Agent SDK sessions a named subagent runs as an ordinary subagent.
While teams are on, a subagent that Claude names launches as a teammate unless
the call is a fork or passes `isolation` on the call itself. Plan for that: a
builder lane that must stay isolated passes `isolation` or comes from a
definition that sets it, and the lane map records which primitive each lane
used.

In Codex, subagents are on by default (`agents.enabled` defaults to `true`).
Codex spawns them when asked for parallel agent work, and it can also delegate
when project or skill instructions request it, so naming the lanes in this
skill's plan is enough to trigger the fan-out.

## 2. Role definitions for Claude Code

Store reusable roles in `.claude/agents/` (project, check into version control)
or `~/.claude/agents/` (personal). On a name collision, managed settings win,
then the `--agents` CLI flag, then project, then user, then plugin agents.
Only `name` and `description` are required.

Scout or reviewer, read-only by construction:

```markdown
---
name: lane-reviewer
description: Reviews one lane's diff against its acceptance criteria. Use after a Lane Ready notice.
tools: Read, Grep, Glob, Bash
disallowedTools: Edit, Write, NotebookEdit
model: opus
effort: high
---

Review only the files named in the Lane Ready notice. Report findings with
file, line, failure scenario, and severity. Do not edit files.
```

Builder, isolated and capped:

```markdown
---
name: lane-builder
description: Implements one lane from the resolved lane map inside its own worktree.
isolation: worktree
model: sonnet
effort: medium
maxTurns: 40
color: green
---

Touch only the files the lane map assigns to you. Finish with one of the
four dispatch states: Done, Done with concerns, Needs context, or Blocked.
```

Fields worth using per role:

| Field | Values | Use in this skill |
|---|---|---|
| `tools` / `disallowedTools` | tool names; the denylist applies first | Keep reviewers unable to edit, which makes "builder and reviewer stay separate" structural. Omit `Agent` from `tools` to stop a lane from spawning its own helpers. |
| `model` | `sonnet`, `opus`, `haiku`, `fable`, a full model ID, or `inherit` | Model Tiering. A model named on the spawn call outranks the frontmatter. |
| `effort` | `low`, `medium`, `high`, `xhigh`, `max` (availability depends on the model) | Second tiering knob. `CLAUDE_CODE_EFFORT_LEVEL` overrides it. |
| `isolation` | `worktree` | Parallel builders. See section 4. |
| `maxTurns` | integer | Hard stop for a runaway lane. Output at the limit is marked partial and can be resumed. |
| `permissionMode` | `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan` | Put RFC or planning lanes in `plan`. Ignored for plugin agents. |
| `memory` | `user`, `project`, `local` | Gives a recurring role (for example the contribution-program reviewer) a `MEMORY.md` that persists across runs. Project scope writes to `.claude/agent-memory/<name>/`. |
| `skills` | skill names | Preloads full skill content, for example `suede-code` on the grader. Teammates ignore this field. |
| `background` | `true` | Forces background runs. An in-process teammate cannot launch a subagent defined this way. |

Model resolution order for a subagent: the model named on the spawn call, then
frontmatter `model`, then `CLAUDE_CODE_SUBAGENT_MODEL`, then the session model.
Setting `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` with `CLAUDE_CODE_SUBAGENT_MODEL`
pins every subagent to one model and ignores the frontmatter (v2.1.257 or
later). Apply the Fable rule in `SKILL.md` to the resolved model, not to what
the frontmatter says.

Nesting: a subagent can spawn its own subagents up to three layers below the
main conversation by default (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` changes
it). Count nested agents toward the roster size and the cost-spike threshold.

## 3. Role definitions for Codex

Codex custom agents are standalone TOML files in `~/.codex/agents/` (personal)
or `.codex/agents/` (project). Each file must define `name`, `description`, and
`developer_instructions`. A file may set `model` and `model_reasoning_effort`,
and those values win over the parent session.

```toml
name = "lane-reviewer"
description = "Reviews one lane's diff against its acceptance criteria."
model_reasoning_effort = "high"
developer_instructions = """
Review only the files named in the Lane Ready notice. Report findings with
file, line, failure scenario, and severity. Do not edit files.
"""
```

Differences that change the lane plan:

- `sandbox_mode`, `approval_policy`, `model_provider`, and `mcp_servers` in an
  agent file do not override the parent. Subagents inherit the parent's
  sandbox policy and permission mode, so a read-only reviewer is read-only by
  instruction, not by sandbox. Set sandbox and approval controls on the parent
  session, and keep the WIP collision check mandatory for Codex lanes.
- Built-in roles are `default`, `worker` (implementation and fixes), and
  `explorer` (read-heavy exploration). Map Scout to `explorer` and Builder to
  `worker` when no custom file exists.
- `agents.max_concurrent_threads_per_session` caps open spawned threads,
  excluding the primary (`agents.max_threads` is the legacy alias). Set it to
  the number of parallel lanes the lane map allows.
- Project rules still come from `AGENTS.md`; the contribution program's rule
  lookup applies unchanged.

## 4. Worktree isolation rules

- A subagent with `isolation: worktree` branches from the repository's
  **default branch**, not from the orchestrator's current `HEAD`. A builder
  lane that must see unpushed commits or a feature branch needs
  `"worktree": { "baseRef": "head" }` in settings. `baseRef` accepts only
  `"fresh"` (default) or `"head"`; for a named branch, create the worktree with
  `git worktree add` and point the lane at it.
- A worktree with no changes is removed when the subagent finishes. One with
  changes stays on disk until a periodic sweep can remove it without losing
  work, and Claude Code holds a `git worktree lock` on it while the agent runs.
  Record each lane's worktree path and branch in the ledger at Lane Ready time,
  because the integrating lane needs them.
- Gitignored files such as `.env` are absent from a fresh worktree. List them
  in a `.worktreeinclude` file (gitignore syntax) at the project root so
  builders can run tests. Check that list against the secrets rules in the
  Team Contract before adding anything.
- Worktrees isolate edits, not merges. Two lanes that change the same file
  still conflict when their branches integrate, so WIP collision detection and
  the sequencing rules in `SKILL.md` still apply.
- `claude -p --worktree` runs leave their worktrees in place. Clean them up
  with `git worktree remove` only after the ledger shows the branch is merged
  or abandoned.

## 5. Continuing a lane instead of re-spawning it

Claude Code resumes a subagent through `SendMessage`, addressed by the agent's
ID or name, and the resumed agent keeps its full conversation history. This
works without agent teams enabled. Use it for the dispatch states in
`SKILL.md`:

- **Needs context:** send the missing facts to the same agent by name rather
  than starting a fresh builder that must re-read the repo.
- **Done with concerns:** ask the same builder to resolve a correctness
  concern before review starts.
- **Blocked** for a reasoning gap still means a new agent spawned with a more
  capable model named on the call. (The agent teams docs state a teammate's
  model is fixed when it spawns.)

Explore and Plan built-ins are one-shot and cannot be resumed, and an agent
you stopped yourself from `/tasks` refuses new messages. Give every lane agent
a predictable name in the spawn instruction so the orchestrator can address it
later.

A message from another agent is never the user's approval. Claude Code labels
`SendMessage` content as coming from another Claude session, and a teammate
cannot approve a permission prompt or consent on the user's behalf. Escalation
thresholds still go to the human.

## 6. Hooks as gate reporters

Claude Code hooks can attach the Quality/eval gate to lane events:

| Event | Fires when | Exit code 2 |
|---|---|---|
| `SubagentStop` | a subagent finishes; input carries `last_assistant_message` | keeps the subagent working |
| `TaskCreated` | a task is created through `TaskCreate` | cancels the task and returns the message |
| `TaskCompleted` | a task is marked complete | keeps the task open and feeds stderr back |
| `TeammateIdle` | a teammate is about to go idle | keeps the teammate working with stderr as feedback |

`SubagentStart` and `SubagentStop` matchers filter on agent type, and tool
events inside a subagent include `agent_id` and `agent_type`. Subagent
frontmatter can carry its own `hooks`; a `Stop` hook there becomes
`SubagentStop`. Project frontmatter hooks run only after the user accepts the
workspace trust dialog for that folder.

Gate policy still governs. The default hook for this skill reports: it runs
the lane's check, appends the result to `.suede-team/<slug>/ledger.md`, and
exits 0. Wire exit code 2 only when the user explicitly asks for enforced
gates, and say in the handoff which hooks block.

## 7. Agent team limits that affect the ledger

From the agent teams docs, each limit and the ledger response:

- `/resume` and `/rewind` do not restore in-process teammates. The ledger,
  not the team, is the recovery point: re-spawn teammates from it.
- Task status can lag when a teammate forgets to mark completion. The
  Status Vocabulary in the ledger is the source of truth for lane state.
- One team per session, no nested teams, and the lead is fixed. A
  multi-repo program runs one lead per repo session and joins results through
  the contribution ledger.
- Teammates start with the lead's permission mode (except `dontAsk`), and
  permission prompts surface in the lead session. Pre-approve the lane's
  routine commands before spawning to avoid prompt pileups.
- The docs suggest starting with 3 to 5 teammates and 5 to 6 tasks per
  teammate. Token cost scales with each active teammate, which feeds the
  Fable cap and the cost-spike threshold.
- Teammates load CLAUDE.md, MCP servers, and skills, but not the lead's
  conversation. Put the lane's slice of the Team Contract in the spawn prompt.

## 8. Sources

Checked 2026-10-25.

- Claude Code subagents: https://code.claude.com/docs/en/sub-agents
- Claude Code agent teams: https://code.claude.com/docs/en/agent-teams
- Claude Code worktrees: https://code.claude.com/docs/en/worktrees
- Claude Code hooks reference: https://code.claude.com/docs/en/hooks
- Codex subagents: https://learn.chatgpt.com/docs/agent-configuration/subagents
  (redirected from https://developers.openai.com/codex/subagents)
