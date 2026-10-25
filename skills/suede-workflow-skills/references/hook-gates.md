# Hook Recipes for Quality Gates (Claude Code)

Read this file only when the user asks to automate a Suede gate so it runs
every time, for example "always run the tests before you stop" or "check the
done signal automatically". It changes nothing about routing.

Pack gates stay advisory (see Gate policy in SKILL.md). A hook is a setting
the user owns. This skill never writes one on its own: show the recipe, name
the settings file, and let the user decide whether to install it and in which
mode.

Sources: https://code.claude.com/docs/en/hooks-guide and
https://code.claude.com/docs/en/hooks

## Where a hook lives

| File | Who it affects |
|---|---|
| `~/.claude/settings.json` | The user, in every project |
| `.claude/settings.json` | Everyone in the repo (committed) |
| `.claude/settings.local.json` | The user, in this repo only |
| Plugin `hooks/hooks.json` | Anyone with the plugin enabled |
| Skill or subagent frontmatter `hooks:` | Session after the skill runs, or while the subagent runs |

Recommend `.claude/settings.local.json` for a first trial so teammates are
not affected. Run `/hooks` in Claude Code to see every configured hook by
event. `"disableAllHooks": true` in a settings file turns them off.

This umbrella skill does not declare frontmatter hooks. Skill hooks stay
registered for the rest of the session once the skill is invoked, and a
router that loads on most requests should not leave gates running behind it.

## Two modes

- **Report mode (default advice):** the hook runs the check, writes the
  result to a file, and exits 0. Nothing blocks. This matches the pack's
  advisory policy.
- **Enforce mode (user opt-in):** the hook blocks Claude from stopping until
  the check passes. Exit code 2 on a `Stop` hook "prevents Claude from
  stopping, continues the conversation", and the hook's stderr becomes the
  reason Claude sees. Offer this only when the user asks for a hard gate.

## Recipe 1: done-signal check (prompt hook)

A `type: "prompt"` hook sends the hook input to a Claude model for one
decision. The model returns `{"ok": true}` or
`{"ok": false, "reason": "..."}`. On `Stop`, a false result feeds the
reason back so Claude keeps working. If the model also returns
`"impossible": true`, Claude Code allows the stop, which keeps an
unreachable condition from trapping the session.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Read the final assistant message in $ARGUMENTS. If it claims work is done but names no verification result (command output, test result, URL check, or screenshot), respond with {\"ok\": false, \"reason\": \"Name the done signal and the check that proved it, or state the open caveat.\"}. If the remaining check needs something only the user can provide, respond with {\"ok\": false, \"impossible\": true, \"reason\": \"<what is missing>\"}. Otherwise respond with {\"ok\": true}."
          }
        ]
      }
    ]
  }
}
```

`$ARGUMENTS` is replaced with the hook's JSON input. `Stop` and
`SubagentStop` input carries `last_assistant_message`, which is more current
than the transcript file. This is enforce mode by nature; mention that when
offering it.

## Recipe 2: test gate (command hook)

Runs the project's test command when Claude tries to stop.

`.claude/hooks/suede-test-gate.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
# Claude Code overrides a Stop hook after 8 consecutive blocks.
# Let the stop through once the hook has already forced a continuation.
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0
fi
cd "$CLAUDE_PROJECT_DIR" || exit 0
if npm test --silent > .claude/last-test-gate.log 2>&1; then
  exit 0
fi
# Report mode (default): keep the log, warn, and never block.
# Enforce mode is opt-in: set SUEDE_GATE_ENFORCE=1 to block the stop.
echo "Tests failed. See .claude/last-test-gate.log." >&2
if [ "${SUEDE_GATE_ENFORCE:-0}" = "1" ]; then
  exit 2
fi
exit 0
```

For enforce mode, prefix the hook command with `SUEDE_GATE_ENFORCE=1 `
only after the user asks for a hard gate.

Settings entry (`Stop` takes no matcher):

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/suede-test-gate.sh"
          }
        ]
      }
    ]
  }
}
```

Replace `npm test --silent` with the repo's real check. The script needs
`jq` and must be executable (`chmod +x`). Keep the `stop_hook_active` guard:
without it a failing suite re-blocks until the cap ends the turn with a
warning. `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` raises that cap when a loop
legitimately needs more passes.

This recipe pairs with the fix-loop cap in SKILL.md: the hook surfaces the
failure, and the agent still allows up to three genuinely different fixes,
then stops when the same root cause repeats.

## Recipe 3: verify against the codebase (agent hook, experimental)

A `type: "agent"` hook spawns a subagent that can read files and run
commands before it answers with the same `ok` / `reason` format (default
timeout 60 seconds, up to 50 tool-use turns). The docs mark agent hooks as
experimental and recommend command hooks for production.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verify that all unit tests pass. Run the test suite and check the results. $ARGUMENTS",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

Use a prompt hook when the hook input alone decides; use an agent hook only
when the answer depends on the current state of the repo.

## Subagent lanes

When a lane runs as a subagent (for example under `suede-agent-teams`), the
same recipes work on `SubagentStop`. A `Stop` hook declared in a subagent's
own frontmatter becomes `SubagentStop` and runs only while that subagent is
running, which scopes the gate to one lane.

## Not available in every surface

Hooks are a Claude Code feature. Codex and Hermes installs of this skill get
the gates as written guidance only (`references/no-missed-quality-gates.md`).
