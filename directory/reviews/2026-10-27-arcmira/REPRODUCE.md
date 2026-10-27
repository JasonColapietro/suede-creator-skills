# Reproduce this local review

Review only. Run from this directory. Nothing below invokes Arcmira, publishes directory data, or uses repository-owned scanner exceptions.

The compact evidence bundle omits wheel binaries, `.git` object stores, node_modules, and the expanded tooling checkout. To reconstruct its tooling, create `tooling/` and extract `evidence/directory-tooling.tar` there. To restore genuine parser commit metadata without checking out or executing the upstream service, run these local/read-only-fetch commands:

```sh
mkdir -p tooling
tar -xf evidence/directory-tooling.tar -C tooling
git -c core.hooksPath=/dev/null init source/arcmira__mcp
git -C source/arcmira__mcp -c core.hooksPath=/dev/null -c credential.helper= fetch --no-tags --depth=1 https://github.com/arcmira/mcp.git 557fc76b697a2eaf1fee3bbfae90f25181ae2e93
git -C source/arcmira__mcp update-ref --no-deref HEAD 557fc76b697a2eaf1fee3bbfae90f25181ae2e93
git -C source/arcmira__mcp config remote.origin.url https://github.com/arcmira/mcp.git
git -C source/arcmira__mcp config suede.directoryDefaultBranch master
```

Only the six named source folders and the eleven retained context files should be materialized. Verify `ARTIFACTS.sha256` before using the evidence. Python 3.12, PyYAML 6.0.3, and Node 22+ are required for the directory tooling; dependency versions from the actual run are recorded in the report environment evidence.

1. `python3 -I reproduce_quality.py`
2. From `tooling/`, run the four Python test files `test_directory_check.py`, `test_directory_inclusions.py`, `test_directory_install.py`, and `test_directory_citations.py` with `python3 -m unittest discover -s tests -p '<file>' -v`. Run `node --test tests/test_directory_badges.mjs tests/test_directory_reports.mjs`.
3. Check SHA256 of `security-tooling/scripts/security/requirements.txt` is `f7e58c92968673145d6f6f36f3d685c28e836851f5766dd349c3ff8a5b655769`. The lock, worker, profile and status evaluator are unchanged from Suede commit `fe5dc1757cd6c8ff63aee853564249c00151778d`; their hashes are in `evidence/tooling-hashes.json`.
4. The recorded `wheels/` holds all 93 exact artifacts. To reacquire only public scanner dependencies, use `python3 -I -m pip download --disable-pip-version-check --no-cache-dir --only-binary=:all: --require-hashes --dest wheels -r security-tooling/scripts/security/requirements.txt`. This downloads dependencies; it is not a remote scan. Do not install submitted source.
5. The minimal `scanner-build-context/` contains only `Dockerfile.offline` as `Dockerfile`, the unchanged trusted worker/profile/lock at their relative paths, and those wheels. Before building, set its directories to 0755 and files to 0444 so the unprivileged image user can read them. Build with `docker --config ./docker-config build --network=none --platform linux/amd64 --tag arcmira-review-cisco:f7e58c929686 scanner-build-context`.
6. `python3 -I prepare_scan.py` stages two three-skill batches, plus the exact trusted clean/exfiltration self-test literals as inert files. `python3 -I run_scan.py` runs the unchanged adapter in network-disabled, read-only, unprivileged containers. Submitted JavaScript snippets and synthetic attack fixtures are never executed.
7. `node evaluate_security.mjs` applies the unchanged reviewed security evaluator to raw scan records and writes `results/security-summary.json`. Raw findings remain in `results/security/`.

`evidence/github-files.json` contains connector responses for all eleven scope/context files. Every file's Git blob SHA was independently matched to the real Git tree at `557fc76b697a2eaf1fee3bbfae90f25181ae2e93`. `source/arcmira__mcp/.git` is a shallow object store, with the genuine pinned HEAD; only requested Markdown, licenses and context metadata are materialized. `evidence/upstream-skill-tree.txt` proves each of the six folders contains only SKILL.md. No service code is installed or executed.

The trusted directory code is an archive of `310520c242df79615b6837b59c85a11a392f6ff3`. Only the review copy's inclusions file is temporarily replaced during parsing, then restored. The original working repository and all published catalog files remain untouched. Empty local labels/citation lists do not award unverified adoption points. No score or security rule is edited.

The full `npm test` attempt did not pass: it reached `test_validator_runtime.mjs`, then was interrupted; the log retains an unresolved-Promise/cancelled-suite diagnostic and the command returned 130. Use the recorded 76 focused regressions as the completed checks. The broad refresh and first-party intake scripts were not run.
