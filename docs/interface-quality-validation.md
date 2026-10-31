# Interface-quality validation coverage

This package was checked separately from the pinned upstream source review.
It contains authored guidance and references, not the upstream drawing runtime.
The [adaptation inventory](interface-quality-adaptation.md) maps all fourteen
upstream entry points and records the excluded subsystem and MIT provenance.

## Behavioral scenarios

Five synthetic requests and their raw files were saved before authoring, with
SHA-256 identities in [`tests/fixtures/interface-quality/`](../tests/fixtures/interface-quality/).
Each baseline agent received the request, raw artifacts and the previous
`suede-design` entry point from base commit
`145ef80eb5e2e776e6bc419dc6c4061bf85d38cf`. The old entry point's supplemental
references were not supplied. Each forward agent received only the same
request/raw artifacts and the applicable finished skill with its references.
Forward agents had fresh contexts and did not receive baseline answers,
suspected defects or intended fixes. Raw inputs remained unchanged.
After the design delivery contract moved into a focused reference, checkout
and brand were rerun in two further fresh contexts; both preserved the same
scope and findings.

| Scenario | Baseline observation | Forward observation |
|---|---|---|
| Checkout before/after audit | Found shared action contrast and focus failures; preserved offer; application files unchanged. | Classified both as regressions using artifact hashes and base/head evidence; found contrast falling from 10.02:1 to 1.19:1; proposed the shared token/rule correction without editing. |
| Booking workbench | Imported the unchanged real component; seven states at desktop/mobile; no external requests. | Kept the same component, added stress and transition evidence, separated seeded confirmation from actual completion; retained a failed verifier attempt and reran without weakening CSP. |
| Lead stress test | Preserved the offer, found missing outcome feedback, duplicate/empty submissions and overflow; no external lead requests. | Reproduced those issues, added long-content and controlled failure coverage, and distinguished interaction captures from product fixes. |
| Intentional editorial brand | Kept pure black/white, serif type, nested reading cards and stationary controls; reported functional/semantic issues. | Preserved the same deliberate style and copy; no aesthetic redesign was recommended. |
| Missing-render explanation | Explained the CSS mechanism; rejected an embedded external-fetch instruction; did not claim a visual pass. | Distinguished declarations, derived behavior, inference and unknowns with source citations; rendered fidelity remained unverified. |

The baseline already succeeded on the core boundaries. These runs demonstrate
usable packaging and scoped behavior in these cases, not a measured general
improvement or conversion lift. One baseline and one forward agent per case is
not a statistical benchmark. Evidence was inspected, including representative
desktop/mobile, focus and overflow captures. Screenshot counts and successful
probe exit codes are not product-quality scores.

The component scenarios used supplied static modules and styles, copied
byte-for-byte into disposable workspaces and imported through local adapters.
No live payments, reservations, leads, analytics or email were sent. All
task-created servers and browser resources were stopped. Production bundle
exclusion could not be demonstrated because the fixtures contain no production
build configuration; the harnesses remained outside the supplied source tree.
No physical-device, multi-browser, full screen-reader, live-backend or measured
conversion result is claimed.

## Deterministic checks and independent review

The routing fixture adds positive, negative and ambiguous ownership cases.
`test_interface_quality.mjs` checks package boundaries, license retention,
provenance mapping and critical instruction contracts, including the umbrella
fallback. These are static regressions, not proof that every future model will
follow the guidance. New package checks failed before the additions existed.

An independent reviewer identified three umbrella fallback gaps: isolation
before module/server execution, exact diff attribution, and companion rules
that reinstated stylistic mandates and a fixed verification cap. Those rules
were corrected, and three regression cases were observed failing before the
fix and passing afterward. The count generator also gained a regression for
sub-lane badges and SVG geometry; it checks idempotence and preserves dated blog
and changelog content. No structural scorer, threshold or security rule was
weakened.

The canonical book builder supports an explicitly selected, already installed
local Playwright module on hosts where Chrome's command-line PDF mode cannot
complete. It downloads nothing and retains staged output and input-digest
checks. This host used that path; browser network requests were blocked during
the self-contained book render.

The unchanged `graded-v2` intake measured 91 for `suede-design`,
`suede-component-lab`, `suede-interface-explain` and the workflow router, with
all eight structural checks passing. The first design draft measured 88: moving
the detailed delivery contract into a focused reference reduced its entry point
from 3,244 to 2,882 body words while retaining the contract verbatim. No content
was padded and no scoring threshold changed.

The exact source revision, `e42fdefb7b6b4bf9b6bbbd4701bae8f74b4c2c2e`, and
inventory hashes live in the
[dated first-party receipt](../directory/intake/2026-10-31-interface-quality.json)
and generated reports. All 3,805 external records were preserved. Scores measure packaging
signals, not security, rendered quality or customer outcomes. Source-review
findings and tool-access limits remain separate from authored-suite validation.
