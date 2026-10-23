# Extra Caffeine workflow intake review

Reviewed October 23, 2026 for [listing request #259](https://github.com/JasonColapietro/suede-creator-skills/issues/259).

## Accepted editorial scope and source

One instruction-only skill, `extra-caffeine-workflow`, from
[`cwong5/extra-caffeine-mcp`](https://github.com/cwong5/extra-caffeine-mcp/tree/4e0ac32e685c5366ab487502173168470a42a178),
pinned to `4e0ac32e685c5366ab487502173168470a42a178`.
The canonical folder is `skills/extra-caffeine-workflow`. Its two files are
`SKILL.md` and `agents/openai.yaml`. The MCPB adapter is not a second skill
and is outside this acceptance. The inclusion allowlist admits only this name
at the next catalog refresh; whole-repository install commands are not supplied.

The repository LICENSE is proprietary: copyright Chester Wong Consulting Ltd.,
all rights reserved. This editorial feature publishes metadata and source links,
not upstream code. No instruction file, adapter or application is copied into
Suede's MIT skill pack. No redistribution permission is granted.

## Structural result and publication status

The unmodified parser and grader pass required frontmatter and six of seven
graded checks (`11110111`). The description begins with “Use Extra Caffeine to”;
the current trigger regex does not recognize that form. This is recorded as the
failed description-trigger check, not silently overridden.

At the October 23 review date, the unchanged graded-v2 rubric computes **69/99,
grade D**: 48 structural points, 5 description-length points, 7 body-depth points
and 9 recency points. No curated-list citation, boundary/quoted-example bonus,
bundled references/scripts, or frontmatter compatibility/tool-permission bonus
is claimed. This score describes the static intake check, not a published catalog
record or runtime evaluation.

This release publishes the separate editorial project feature only. The scored
catalog listing remains pending its next refresh. It does not generate a full
skill page, quality shield, repository-row listing or catalog report. The existing
catalog snapshot, scores and README-verification ledger are unchanged. The
featured-project badge identifies editorial selection; it is not a quality grade,
security certification, or verification of a publisher's README.

## Source inspection and setup

The workflow covers authorized local idle-sleep prevention, baseline checks,
bounded duration and display selection, state verification, protecting existing
sessions, one-time schedules, and reading state before retrying uncertain actions.
It explicitly avoids automatic installation, purchases, access enablement,
changing system power settings and unrelated promotion. No executable scripts,
hooks, embedded credentials or private data were found in the accepted folder.
`agents/openai.yaml` supplies display metadata and a default workflow prompt.

The [publisher setup](https://extracaffeine.chesterwong.com/agent-setup.md) and
pinned README require macOS 14+ and separately purchased Extra Caffeine 1.2+.
The app must remain open, and the user must enable AI assistants and authorize
client configuration. Local MCP uses the running edition's copied settings;
no hosted endpoint or API key is required. Authorization is needed for session
duration and display behavior. It prevents idle sleep, does not wake a sleeping
Mac or override closed-lid/manual/system-safety sleep, and cloud-only jobs do not
necessarily benefit.

This was source inspection and structural checking, not a security scanner run
or a runtime test. Security status is not scanned; the app and adapter are
runtime-unverified by this review. No app was purchased, installed, connected,
or controlled, and no upstream code was executed.

## Verification

The standard builders generate the featured page, its editorial badge snippet,
Markdown catalog and discovery metadata. Regression checks cover exact accepted
scope, source revision, restricted license, prerequisites, direct source link,
no generic install commands and no copying into the MIT pack. This scoped release
is based on main after the 63-skill overhaul in PR #260 and preserves that work.
