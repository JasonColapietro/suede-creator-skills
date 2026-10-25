# First-party source-scan triage, October 25, 2026

Exact source: `fe5dc1757cd6c8ff63aee853564249c00151778d`. Original run: [40232990904](https://github.com/JasonColapietro/suede-creator-skills/actions/runs/40232990904). Original artifact SHA256: `8a346313b645535bc150b690638da76384fe22b744949e4164a7e2e62720f6c4`.

Actual coverage was 64 first-party skill packages: 60 completed with nonblocking findings, three failed with ten CRITICAL findings, and one reported incomplete binary coverage. The separate synthetic clean/attack checks passed. Two external samples completed with zero findings across six files. These are source-review observations, not security certifications or a whole-catalog pass.

The original JSON records are retained under `security/evidence/fe5dc1757/`, including findings, source inventory, analyzer execution, diagnostics, time and runtime image. No original severity or finding has been changed, suppressed or promoted into an approval. This review does not make the source gate green.

## Blocking process-execution findings

Independent read-only review compared all nine distinct matched source-file hashes with the CI inventory. Eight matches identify a `child_process` import or require and two identify a `spawnSync(` call. The rule establishes process-execution capability; the matched text alone does not establish a tainted shell command.

| Matched path under `skills/` | Source review and disposition |
| --- | --- |
| `suede-agent-teams/scripts/contribution-ledger.mjs:8` | Calls at 252 and 1042 use `execFileSync("ps", [...])` and `execFileSync("git", ["check-ref-format", "--branch", branch])`. PID recovery checks a positive integer; branch input rejects empty/multiline values. Import-pattern match; no shell interpolation established. |
| `suede-graph-flo-xr/workflows/helpers/apply-patch.cjs:10` | Fixed Git argv; patch bytes enter stdin. Worktree is canonicalized and staging root restricted. Import-pattern match; no shell interpolation demonstrated. |
| `suede-graph-flo-xr/workflows/helpers/candidate-audit.cjs:9` | Explicit Git argv, `--` and literal pathspecs; candidate paths have containment and symlink checks. Import-pattern match. |
| `suede-graph-flo-xr/workflows/helpers/diff-digest.cjs:4` | Explicit Git argv; orchestrator supplies a validated hexadecimal base SHA. Reported paths have containment, realpath and regular-file checks. Import-pattern match; no source-to-shell injection established. |
| `suede-graph-flo-xr/workflows/helpers/scout-setup.cjs:4` | Fixed programs with argv arrays for sandbox probing, Git and `lsof`; the workflow constructs the absolute worktree prefix. Import-pattern match. |
| `suede-graph-flo-xr/workflows/helpers/gate-sandbox.cjs:5` | **Intentional shell-execution boundary:** sandbox-exec launches `/bin/sh -c payload`. Keep this finding as an execution-boundary review, not an import-only dismissal. Workflow lines 1487–1530 whitelist local acceptance commands and reject shell metacharacters; 1611 enforces eligibility; 2846 shell-quotes the payload. Helper checks roots/write paths and denies network in its sandbox. No concrete policy bypass established in this bounded review. |
| `suede-graph-flo-xr/workflows/tests/test_plan_path_safety.mjs:16` | Git/Node calls use explicit argv against temporary test repositories and fixed helpers. Test/import-pattern match; injection not established. |
| `suede-seo-audit/scripts/tests/cli.test.mjs:7,12` | Two findings on one file. `spawnSync(process.execPath, [cli, ...args], ...)` invokes a fixed local CLI with test arguments and no shell. Import/API-pattern matches. |
| `suede-seo-audit/scripts/tests/serp-overlap.test.mjs:84` | Fixed Node executable with `-e` and a constructed test script. Inserted module URL/input use `JSON.stringify`; locale values are fixed literals. API-pattern match; no unescaped source-to-code path established. |

No confirmed exploitable command injection emerged from this bounded source review. No product-code change is justified solely to evade these capability signatures. The three packages remain failed under the unchanged strict scanner policy; any future exception needs a separate exact-source decision and must preserve the raw finding.

Matched-file SHA256 values (the original records carry the complete inventory):

```text
contribution-ledger.mjs   00f920794abe36d111e549d879d00db61d3082e441c4dc41ec39415e95f22966
apply-patch.cjs           44cbd66003b79facb6c2f28856dddb8257d106f943a6686bd9ffeab14ec497ea
candidate-audit.cjs       522f9057a59b0aa4df37875472b26f00935c90d7340fab770c4e2595962b5761
diff-digest.cjs           dcdc9971f19116c2fe6abe8cd90892a9651bb88d1c2177cd7ae4145a6cdd4fff
scout-setup.cjs           b5837eb777d07f8639c9f9090890e31fe36d4e64a20053fdeb9f131ee075191e
gate-sandbox.cjs          70bd6f4c6efee27fbe56110827b5bed74a86e2b7fad8e07f200da233e1d2dba0
test_plan_path_safety.mjs 867319abbcb526fdd18326f39de1021b578407e27f8838cb2f9bc2c8c8d6caaf
cli.test.mjs             11ca36ccaf5e96a99f82d1229201e40c8120dc3dbd60f8a42f9dde73ff0862a0
serp-overlap.test.mjs     3d83e76c401d0db97a26f79f3dfaf234122ed9cf694dc05cb0336e23862483ab
```

## Incomplete release-linter fixture coverage

The four WAVs are identical 16,044-byte RIFF/WAVE fixtures: mono, 8,000 Hz, 16-bit PCM, 8,000 zero-valued samples. Each SHA256 is `56d4af65701c26df20bd4021eda95b6e830348ce3a746086079fe89285548dc9`. `artwork/cover-art.jpg` is a 40,628-byte baseline JFIF JPEG, 1600 by 1600, with no trailing bytes; SHA256 `cf4255d03f8ff60e7e408b1cffe529175fa84134af425ec7edf559cb7af7ba80`.

Their signatures and hashes match the CI inventory and documented synthetic-fixture purpose. Signature inspection does not supply complete source analysis. Retain the release-linter's incomplete-coverage/error state and original binary findings.
