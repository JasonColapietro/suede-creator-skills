# Package completeness and influencer workflow repair

## Evidence and scope

Main at 1047888ee includes the new influencer skill (#268), but VERSION still
names already released 0.19.3. Existing package builders already copy skill
folders; rebuilding under 0.19.3 would misidentify new contents as the immutable
old release. Three unique PR268 review findings remain in SKILL.md: unconditional
research of requester evidence, a mandatory angle approval turn, and a checklist
that withholds requested drafts. The first eval also expects the approval turn.

## Implementation

1. Accept supplied fit evidence as given. Research missing evidence and facts
   introduced by the agent; never invent personalization.
2. Select the best supported angle and draft autonomously; ask only where a
   genuinely unresolved fork materially changes the result.
3. Keep the editing pass and report unresolved checklist items honestly while
   preserving explicit requester choices. Preserve exact-recipient/message send
   authorization and legal/licensing facts.
4. Update eval expectations and cover complete-brief and intentionally formal
   cases. Protect the workflow contract with regression checks.
5. Prepare coherent 0.19.4 metadata with an explicitly unreleased changelog,
   regenerated release cards and no date-released claim. Preserve 0.19.3 release
   records and distribution URLs. Keep npm's recorded 0.19.0/login blocker.
6. Verify actual npm tarball and Python wheel/sdist contents against source,
   including influencer references/evals/agent config and upstream notices.

## Acceptance tests

- Each of the three old workflow instructions fails the regression checks.
- A complete supplied brief needs no independent fit confirmation or angle
  approval; formal wording is delivered with advisory check results.
- Every influencer runtime file is byte-identical in an extracted npm archive,
  wheel and sdist; catalogs list it and archives carry licenses and NOTICE.md.
- All versioned manifests identify 0.19.4; docs visibly say prepared/unreleased;
  0.19.3 historical receipt and links remain unchanged.
- Run focused tests, npm test, both package builder checks, actual local archive
  builds, and independent review before branch push. Required current-head CI
  and merge are coordinated by the parent.

## Held steps

Do not publish npm/PyPI/GitHub releases, create tags/credentials, change auth,
activate projects or domains, or change live database/config/DNS. Source metadata
preparation is not publication. Preserve meaningful upstream attribution and
licenses; add no generated attribution footer.

## Verification evidence

- Before repair, all three workflow regression tests failed against the three
  original instructions. The new-version check failed with `0.19.3 != 0.19.4`.
- After repair, focused tests passed 5/5, including a real npm tarball extracted
  and compared to the influencer source and license files.
- Local Python 0.19.4 wheel and sdist builds succeeded; strict twine checks passed
  for both. Archive verification compared every influencer file, catalog,
  VERSION and license/notice contents to source. A deliberately damaged wheel
  missing influencer SKILL.md was rejected by that independent checker.
- Independent reviewer found a future-release brittleness in the version test;
  fixed it to allow coherent future prepared/released states and advancement
  beyond 0.19.3. Re-review passed with no remaining findings.
- Initial npm test correctly failed for book corpus byte counts and stale PDF
  provenance after the skill edit. Regenerated counts, book Markdown and HTML
  are included. PDF regeneration is blocked: canonical file-URL rendering
  stalls, and independent local Chromium CDP navigation to the generated
  `file:///tmp/suede-book-NoHK5X/s-tier.print.html` returned
  `net::ERR_BLOCKED_BY_ADMINISTRATOR`. The PDF and its provenance remain
  unchanged; npm test remains blocked by the truthful stale PDF input digest.
  No alternate route was used after the explicit browser-policy denial.
  Package changes must remain unmerged until authorized PDF regeneration and
  required current-head CI pass.

## Follow-up: browser coverage for prepared releases

Draft PR271's directory-browser job (121094854764) failed because the SEO
artwork check assumes the SEO release is the first changelog item. The new
prepared item correctly precedes the historical release. The same test pins
0.19.3 and the old hero title. Repair the test to locate the historical SEO
entry by its artwork, preserve all seven desktop/mobile image checks, and
validate the newest entry against current VERSION and its prepared/released
state. Verify the hero title and state match that newest entry, without
hardcoding the current title. Run the real HTTP browser check and independent
review. This follow-up does not attempt PDF rendering or change its blocker.

Follow-up verification: the original browser check reproduced the CI failure
at test_seo_site.mjs:31 (`0 !== 1`). After the repair, the real local HTTP
Chromium check passed at 1440px and 390px, covering the six gallery images and
historical changelog artwork. Screenshots are under
`/tmp/package-seo-browser-final`. Focused workflow/package tests passed 5/5.
Independent follow-up review passed with no remaining findings. Full npm test
still has the previously confirmed stale PDF input-digest blocker; this test
repair does not change book inputs or retry the denied renderer.

## Reconciliation and smallest remaining unblock

Merged current main `6c4ae0a51b940ce5113871f408b84fa544b8c000` into
`fix/package-completeness` using an ordinary merge, preserving the now-landed
license evidence and standalone report repairs. Refreshed only the prepared
ship-log base/activity in the three existing public summaries; no skill, book
or PDF content changed during reconciliation.

The canonical `bookPdfInputDigest` explicitly hashes every `skills/*/SKILL.md`
file's path, byte length and contents. A local proof copied its complete inputs,
reproduced the current digest, then changed only the influencer SKILL.md back
to pre-repair content: the digest changed. Reverting generated book copies alone
cannot remove the required workflow edits from this hash contract. Stored PDF
input digest is `c894383d2a15ba8f5ee9712fdc6443e7920a51b33bc266c029b0230a5218d644`;
current input digest remains
`bff888cc4905938ae2311859a59fbedf81316d64f92b38c7b1abf2a29fa608b8`.
The PDF itself is unchanged and still matches its recorded SHA-256
`566b0e48a01375d040cb48e989a029e2348130e1206b0ad0dd9edc1e8f4e2919`.

Smallest unblock: in a policy-permitted environment, check out the latest
`fix/package-completeness`, run `node scripts/build-book-pdf.mjs` (or
`npm run build:book`), and commit the real `docs/book/s-tier.pdf` and
`docs/book/s-tier.pdf.provenance.json` artifacts. Then rerun `npm test`, required
current-head CI and review before merging the draft PR. Do not fabricate
provenance or bypass the denied browser navigation. Package publication remains
a separate held step even after source merge.

Reconciliation verification: focused workflow/package/standalone-builder tests
passed 11/11; desktop/mobile SEO browser QA passed with all seven image
placements intact. Independent review confirmed that the main repairs are
preserved unchanged and that all three summaries agree on base `6c4ae0a`,
498 commits and activity bars. PDF input/output digest evidence was independently
confirmed. Required npm validation remains subject to the documented unchanged
PDF blocker; no new rendering was attempted.
