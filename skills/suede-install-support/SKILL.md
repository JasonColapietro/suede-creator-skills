---
name: suede-install-support
description: Get installs working public-first and keep the @personal path out of public docs. Fixes failing Codex and Claude installs, GitHub repo-and-path commands, raw GitHub checks, MCP setup, local plugin notes, and marketplace confusion. Use when an install fails, a public user cannot add a skill, @personal leaks into public copy, or a README, docs, or ambassador step needs a simpler path.
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
