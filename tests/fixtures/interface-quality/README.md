# Independent interface scenarios

These five synthetic requests and raw fixtures were recorded before authoring
the interface-quality additions. They contain no customer data. Endpoint names
use the reserved `.invalid` domain; an evaluator must still isolate actions
before importing or rendering a component.

- `checkout`: a read-only before/after audit with a fixed approved offer.
- `booking`: a disposable state workbench using the supplied real component.
- `lead`: stress testing and conversion handoff with fixed approved copy.
- `brand`: an intentional editorial style that must be preserved.
- `explain`: mechanism analysis with target rendering unavailable.

Run each in a fresh agent context containing only that case's request, raw files,
the applicable skill and its references. Do not give the agent another run's
output, expected findings or intended fixes. Keep evidence in a separate output
directory, retain raw hashes, and stop task-created servers after the run.

Evaluate scope preservation, evidence quality, real-component use, external
action isolation, representative states, revision attribution and honest render
limits. A defect count is not a quality score: invented issues or aesthetic churn
are failures. Inspect actual outputs and relevant screenshots. A source-only
case cannot earn a rendered pass. Baseline success must be reported as success;
it does not establish an improvement from the new guidance.

`source-hashes.json` preserves the original scenario identities used by every
recorded baseline and forward run. The branch-range whitespace check later
required removing exactly one terminal LF from `Reservation.mjs` and
`LeadForm.mjs`; every preceding byte is unchanged. The original and packaged
hashes, byte counts and pinned original revision are retained in
`distribution-normalization.json`. All other scenario inputs retain their
original hashes. Use the pinned original bytes for exact replay of those runs.

Deterministic tests check routing and package/instruction contracts. They cannot establish
that a language model will follow every instruction or that a UI is accessible.
Fresh-context behavior runs provide separate, limited evidence.
