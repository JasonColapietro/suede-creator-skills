# Worked delivery contract

This synthetic scenario demonstrates the expected artifact shape; its numbers and outcomes are example inputs, not measured customer results.

## Input

Two changes are requested: API validation in src/api.ts and UI empty states in src/view.tsx. Both need src/types.ts. The goal is a draft PR, not deployment.

## Expected output

Return a Team Contract and ownership table. Assign src/types.ts to a serialized interface lane first; record its exported type and test before dispatching API and UI builders. Give each builder exclusive paths, acceptance criteria, dependencies, branch/worktree and done evidence. Name a reviewer and rollback point. Record draft-PR authority separately from merge/deploy authority.

## Failure case

A UI builder requests a change to src/api.ts while the API lane is active. Mark the dependency, route the request to its owner and sequence any transfer. Do not allow both lanes to edit the same file to meet a deadline.

## Validation

Compare actual changed paths with the ownership table, inspect the interface contract consumed by both lanes, and run the integrated tests at the final commit. A worker summary is not proof that the combined branch passes.
