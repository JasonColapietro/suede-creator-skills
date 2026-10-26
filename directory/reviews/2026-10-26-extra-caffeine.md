# Extra Caffeine ingestion and quality-shield follow-up

Reviewed October 26, 2026 for [request #259](https://github.com/JasonColapietro/suede-creator-skills/issues/259), following the [October 23 intake](2026-10-23-extra-caffeine.md) and [PR #261](https://github.com/JasonColapietro/suede-creator-skills/pull/261).

## Published source and completed directory work

The accepted scope remains one instruction-only skill, `extra-caffeine-workflow`,
in `skills/extra-caffeine-workflow`, from
[`cwong5/extra-caffeine-mcp` at `4e0ac32e685c5366ab487502173168470a42a178`](https://github.com/cwong5/extra-caffeine-mcp/tree/4e0ac32e685c5366ab487502173168470a42a178).
The MCPB adapter is outside the accepted scope. The upstream default branch still
points at that revision. Its proprietary LICENSE says all rights reserved;
no upstream instruction files enter Suede's MIT skill pack.

The standard parser and curator admit this source with checks `11110111`,
**69/99, D**, under unchanged `graded-v2`. This draft adds its catalog record,
repository-row listing, downloadable report and general listing badges. The
Featured card links to that scored row. At six of seven graded checks, this
source receives neither a full skill page nor an 80+ quality shield.

This is a scoped addition to the October 22 full-refresh snapshot, inspected on
October 26. The [intake receipt](../intake/extra-caffeine-2026-10-26.json) records
the actual review date, source hashes, unchanged-catalog digest and assessments.
The saved score is 69 using either date. Other listing records and repository
facts remain identical; the snapshot identifier rotates and generated reports
are rebuilt to bind them to the new dataset bytes. This does not claim a full
catalog refresh on October 26.

The maintainer confirmed the existing Featured website badge in
[#259](https://github.com/JasonColapietro/suede-creator-skills/issues/259#issuecomment-6404412343).
That website placement is not entered as rendered-README verification.

## Prepared source fix and exact remaining dependency

The upstream patch is prepared locally at commit
`1a1300e5254bd803782782aba75da6b3ccdfa8e3`, based on the published revision above.
It clarifies the use-when trigger, supplies a quoted request example and explicit
cloud-only/sleeping-Mac boundary, declares the existing macOS 14+/paid Extra
Caffeine 1.2+/trusted local MCP prerequisites, and calls the connection an MCP
server so the parser detects it. Existing authorization, bounded-session,
baseline, schedule and uncertain-retry safeguards remain intact.

Reparsing and curating that exact local commit gives checks `11111111` and
**86/99, B**: 56 structural + 5 description length + 4 boundary + 3 example +
7 depth + 9 recency + 2 compatibility. The gain is 17 points. No tool-permission,
script, reference or independent-citation credit is claimed. Those four absent
signals account for the remaining 14 raw rubric points and are not defects to
pad. This result qualifies for the existing quality-shield rule once the fixed
source is accepted and reviewed upstream.

Creating the intended `JasonColapietro/extra-caffeine-mcp` fork using
`POST /repos/cwong5/extra-caffeine-mcp/forks` returned **Forbidden**. The fork
action was denied, and no alternate route was attempted. Consequently there is
no upstream draft PR or upstream CI run for this local commit. Portable patch
and Git-bundle artifacts accompany the handoff; their patch hash is in the
intake receipt.

**Dependency:** upstream must accept the source fix. Then fetch the actual
default-branch commit (which may differ after a squash), re-run the unchanged
parser and curator for the single allowlisted skill, replace its record and
repository provenance, update this review/receipt and Featured source pin, rotate
the snapshot identifier, and rebuild the directory, sitemap and Awesome catalog.
At the verified 86/B result, the standard builders produce the full skill page,
numeric and grade shields, and qualifying report automatically. Do not substitute
the local proposal's commit or score into the published-source catalog.

## Setup and verification scope

Requires macOS 14+ and separately purchased Extra Caffeine 1.2+, open with AI
assistants enabled by the user and a trusted local MCP client configured from the
running app edition. No hosted endpoint or API key is required. The workflow
requires authorization for session duration and display behavior, preserves
pre-existing sessions and reconciles uncertain mutations before retries. It
prevents idle sleep; it cannot wake a sleeping Mac or override lid/manual/system
safety sleep. The pinned README corroborates these prerequisites. The live
publisher setup URL returned HTTP 403 during independent review.

No application or adapter was installed or exercised. Security status remains
`not_scanned`; the prepared quality result is structural, with runtime behavior
unverified. Independent source review confirmed the score arithmetic and scope.
Directory regressions cover the missing-record failure, exact accepted source,
report, fallback badges, working Featured link, restricted license, no generic
install command and preservation of all other catalog records. Final test and
CI results are recorded in the draft PR.
