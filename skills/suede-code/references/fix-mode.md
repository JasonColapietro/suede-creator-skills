# Fix mode (`--fix` or an explicit request)

Read from `SKILL.md` only when fixes are requested. Boundaries in `SKILL.md` still apply: preserve WIP and never auto-apply to auth, payment, or migration code without confirmation.

1. Auto-apply local P2 and P3 fixes (single file, no contract change), one
   commit per finding ID.
2. Present P0 and P1 as fix briefs first: failing behavior and evidence, files
   to open, expected change, acceptance criteria, verification command, WIP to
   preserve. Never auto-apply to auth, payment, or migration code without
   explicit confirmation.
3. Re-run the relevant mode on changed files and mark each finding resolved or
   escalated.
4. Stop after 3 cycles on the same finding and escalate it as a design issue.
