# Worked delivery contract

This synthetic scenario demonstrates the expected artifact shape; its numbers and outcomes are example inputs, not measured customer results.

## Input

A monorepo has web and worker jobs with path filters. Documentation-only PRs should pass the required aggregator; a selected web job failure must fail it. No protection-setting mutation is authorized.

## Expected output

Detect package managers, runtime pins and existing check names first. Return the changed workflow plus a truth table covering selected pass, selected fail, cancelled, unexpected skip, docs-only no-work, and a failed `changes` detector (its dependents skip, so `ci-success` must fail because `changes` is listed in its `needs`). Keep the aggregator on every relevant PR and evaluate selected upstream results under always(). Supply the exact required-check setting as a proposal.

## Failure case

The workflow is valid YAML but the gate is itself path-filtered. Treat the indefinitely pending required check as unresolved; move the condition into selected lanes and test the aggregator on a docs-only PR.

## Validation

Run project tests and workflow validation, then inspect actual CI job conclusions for representative PRs. A skipped unselected lane is acceptable; a failed/cancelled selected lane cannot be converted to success. Record final commit and check name.
