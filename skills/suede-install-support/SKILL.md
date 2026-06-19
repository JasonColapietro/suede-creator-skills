---
name: suede-install-support
description: Suede public install support for Codex skills, Claude skills, GitHub skill folders, MCP setup, local plugin notes, installer command QA, marketplace confusion, raw GitHub checks, and ambassador-safe install instructions. Use when install commands fail, public users cannot add a skill, @personal appears in public copy, or docs need a simpler install path.
---

# Suede Install Support

Use this skill to make Suede install instructions accurate, public, and easy to
explain.

## Rules

- Lead with public GitHub skill installs.
- Treat `@personal` as a local operator note only.
- Explain that GitHub skill installs need a repo and path because one repo can
  contain many skills.
- Test installer commands from a temporary destination after pushing.
- For multiple paths, use one `--path` flag followed by all skill paths.
- Restart Codex after installing new skills.

## Workflow

1. Identify the target installer: Codex GitHub skill installer, Claude skill
   folder copy, local plugin alias, or MCP server.
2. Check whether the target skill folder exists publicly at `main`.
3. Run the exact install command from a temporary directory.
4. Fix docs, MCP catalog output, README commands, and ambassador copy together.
5. Keep local plugin commands available only under local operator setup.

## Output

```text
Public install:
Advanced installs:
Local-only notes:
What was tested:
Failure cause:
Corrected copy:
```
