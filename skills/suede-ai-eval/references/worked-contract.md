# Worked delivery contract

This synthetic scenario demonstrates the expected artifact shape; its numbers and outcomes are example inputs, not measured customer results.

## Input

A support RAG assistant may answer only from a supplied refund-policy corpus and must escalate missing policy. An existing runner accepts JSONL cases with question, documents, required traits and forbidden traits.

## Expected output

Write an AI-SPEC, then cases for a supported refund request, missing policy and an instruction embedded inside a retrieved document. For the missing-policy case require an explicit escalation and forbid an invented refund period. Attach the actual project runner command, dataset path, counts and failure evidence. Mark coverage MISSING until an implementation actually runs.

## Failure case

The runner is absent or model access fails. Deliver the case dataset and command/setup gap, mark execution not run, and keep runtime coverage unproved. A planned suite does not count as passing cases.

## Validation

Validate dataset fields and case independence, run against the exact prompt/model/config revision, and inspect failures by dimension. A judge needs calibration evidence before its quality labels become acceptance evidence.
