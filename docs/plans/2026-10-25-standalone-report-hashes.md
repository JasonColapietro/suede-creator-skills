# Standalone report identity repair

The standalone builder rewrites report evidence URLs after the original directory generator has hashed the report. Its saved identity and HTML version therefore describe different content.

Recompute each copied report's `report_version` with the original algorithm: SHA-256 over UTF-8 `JSON.stringify(evidence)` in existing property order, omitting `report_version`. Preserve snapshot dataset hashes, scores, source revisions, and security status. Update the corresponding listing HTML version from that report. Leave source docs untouched.

Acceptance: build to a temporary directory; independently verify every report's full digest; verify listing, methodology and badge URLs point to the standalone host; verify each listing displays its transformed report's prefix; verify snapshot provenance and source reports remain unchanged. The regression must fail against the original builder. Run the existing standalone tests and `npm test`. No deployment, configuration, domain or publication changes.

## Verification evidence

The added regression failed on the original builder: algorithmic-art retained digest `3b3799efe29717b8ee6361995614bf6ee392d6a925377c865f82f68a130e9784` while transformed evidence verified as `ff759b4dffdee64b19d4a1c1bfbdc811e97cb94985633e5dc30f99314ab110f3`. After repair, all six standalone tests pass. Independent agent review approved after correcting prebuild source snapshots and respecting compact rows, which link reports but do not display versions. Full listing pages require and update their existing version prefixes. Snapshot dataset hashes remain unchanged because the source dataset is not transformed.
