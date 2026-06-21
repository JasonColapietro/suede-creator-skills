---
name: suede-launch-packaging
description: Ship Suede work as a launch, not a loose drop, and make sure people can actually install it — GitHub Pages updates, README and docs launches, skill-pack releases, social and email copy, proof links, install commands, QA, handoff notes, plus public-first install support that fixes failing Codex and Claude installs, GitHub repo-and-path and raw-URL commands, MCP setup, local plugin notes, and marketplace confusion while keeping the local @personal path out of public docs. Use when a skill, repo, site, MCP server, feature, or docs update is ready to share, when an install fails, when a public user cannot add a skill, when @personal leaks into public copy, or when a README, docs, or ambassador step needs a simpler path.

---

# Suede Launch Packaging

Ship Suede work as a launch, not a loose drop. This skill turns finished work into a clean public package AND makes sure a stranger can actually install and run it. Packaging a public release and proving the install both live here, because a release nobody can install is not a launch.

This skill organizes and prepares a public release. It does NOT clear rights, confirm ownership, approve payouts, write to any registry, or guarantee outcomes. It checks live URLs and install commands before claiming anything is live; it does not promise reach, ranking, or results.

## Pick the lane

Most launches use both lanes in order: package the release, then prove the install. Pick what the request is asking for.

- **Lane A — Package the launch.** Work is ready to leave the local machine and needs a clean public package: a repo, live URL, docs page, README section, install command, release note, GitHub Pages update, skill-pack release, MCP server, feature, or social/email copy. Start here for "ship this," "write the release," "package this drop."
- **Lane B — Install support.** An install fails, a public user cannot add a skill, `@personal` leaks into public copy, or a README, docs, MCP catalog, or ambassador step needs a simpler, public-first path. Start here for "the install is broken," "fix the install command," "why can't they add this skill," "the marketplace is confusing." Lane A always runs Lane B's command-test step before publishing.

When both apply (most full launches), run Lane A to assemble the package, then run Lane B to verify and correct every install path inside it before you ship.

---

## Lane A — Package the launch

Use this lane when Suede work is ready to leave the local machine and needs a clean public package.

### Package steps

1. Identify the public surface: repo, live URL, docs page, README section, install command, release note, or social/email copy.
2. Confirm the source truth: current branch, remote, commit, live build status, and exact public URLs.
3. Write the public explanation around the outcome, not the implementation.
4. Add proof links: source files, docs pages, scripts, MCP tools, screenshots, build output, live route, or raw GitHub URL.
5. Check install commands from a temporary destination, not only the local repo. (This is the handoff into Lane B — see Install support.)
6. Run copy, SEO, link, and claim-boundary checks before publishing.
7. Write a short handoff when another agent or computer may need the result.
8. End meaningful launches with a simple non-coder explanation (the simple explanation below), the usual breakdown, and `Cue Suede` so the operator can request a change, preserve what worked, or say nothing to keep it as-is.

### Lane A output

```text
Launch surface:
Reader:
Primary action:
Public copy:
Install or access path:
Proof links:
Simple explanation:
Usual breakdown:
Verification:
Caveats:
Status: ship | ship-with-caveats | hold
Cue Suede:
```

Never claim a public launch is live until the live URL or public artifact was checked.

---

## Lane B — Install support

Use this lane to make Suede install instructions accurate, public, and easy to explain — and to fix them when they fail. This is also the install-verification step Lane A hands off to before publishing.

### Rules

- Lead with public GitHub skill installs.
- Treat `@personal` as a local operator note only — keep it out of public docs, READMEs, MCP catalog output, and ambassador copy.
- Explain that GitHub skill installs need a repo and path because one repo can contain many skills.
- Test installer commands from a temporary destination after pushing.
- For multiple paths, use one `--path` flag followed by all skill paths.
- Restart Codex after installing new skills.

### Workflow

1. Identify the target installer: Codex GitHub skill installer, Claude skill folder copy, local plugin alias, or MCP server.
2. Check whether the target skill folder exists publicly at `main`.
3. Run the exact install command from a temporary directory.
4. Fix docs, MCP catalog output, README commands, and ambassador copy together.
5. Keep local plugin commands available only under local operator setup.

### Lane B output

```text
Public install:
Advanced installs:
Local-only notes:
What was tested:
Failure cause:
Corrected copy:
```

---

## Claim safety (applies to both lanes)

- This skill organizes and prepares a release and its install paths. It does NOT clear rights, confirm ownership, approve payouts, write to any registry, or guarantee outcomes (reach, ranking, results).
- Never claim a public launch is live until the live URL or public artifact was checked.
- Never claim an install works until the exact command ran from a temporary destination after pushing.
- Keep `@personal` and any local-only plugin commands out of all public copy. They are local operator notes.
- No competitor product names in any public copy.

## Simple explanation (plain, for a 10-year-old)

Think of it like putting out a record instead of leaving a demo tape on the floor. First you make sure the song is really finished and you know where the master copy lives. Then you write the back-of-the-album note so a fan gets what the song is about, not how you wired the amps. Then you hand people the exact way to actually play it — the real link, the real install steps — and you try those steps yourself on a clean machine first, so nobody gets a broken download. You keep the messy backstage notes (like the private `@personal` shortcut) off the public sleeve. And you only say "it's out now" once you've clicked the link yourself and heard it play.

End every meaningful launch with the simple explanation above, then the usual breakdown (Lane A output and, when an install is involved, Lane B output), then `Cue Suede` so the operator can request a change, preserve what worked, or say nothing to keep it as-is.