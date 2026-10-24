# vendorable

A neutral, standalone copy of one pack skill, kept for a third-party skill
directory that vendors a single skill folder and links to it rather than to the
whole collection.

It is not installed by the plugin and is not part of the catalog.

| Folder | Derived from | Why it stays |
| --- | --- | --- |
| `frontend-design-review` | `skills/suede-design` | Linked from the pending ComposioHQ/awesome-claude-skills submission (PR #1803). That README-only entry must resolve to this folder. |

Changes from the source: the description does not open with a brand name,
sibling-skill routing is removed, and the sections some directories require
(When to Use, What This Skill Does, How to Use, Example, Tips, Common Use
Cases) are present. Thresholds, checklists, rules, and worked examples match the
source.

This copy does not update itself. When `skills/suede-design` changes, update it
here before the next submission. Delete it once the submission closes without a
merge or the directory switches to linking the pack.

Copies of `site-to-ios-app` and `suede-deslop` (`voice-preserving-line-edit`)
were removed on 2026-10-23: no submission linked them, and they had drifted
from their sources. Recover them from git history if a directory needs one.
