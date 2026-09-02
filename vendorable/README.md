# vendorable

Neutral, standalone copies of pack skills, prepared for third-party skill
directories that vendor a single skill folder into their own repository rather
than linking out to a collection.

These are not installed by the plugin and are not part of the catalog. They
exist so a submission can be made without asking a curator to accept branding
or references to sibling skills they do not have.

| Folder | Derived from | Notes |
| --- | --- | --- |
| `site-to-ios-app` | `skills/site-to-ios-app` | `CARD.md` omitted (release metadata, repo-relative links) |
| `voice-preserving-line-edit` | `skills/suede-deslop` | Renamed. Leads on the voice-preserving and audit-mode differentiators |

What was changed in each: the frontmatter description no longer opens with a
brand name, routing to sibling skills is removed, and the sections some
directories require (When to Use, What This Skill Does, How to Use, Example,
Tips, Common Use Cases) are present. Thresholds, checklists, rules, and worked
examples are unchanged from the source.

`voice-preserving-line-edit/LICENSE` keeps the original copyright line. That is
attribution, not branding.

These do not update automatically. If the source skill changes, update the copy
here before submitting it anywhere.
