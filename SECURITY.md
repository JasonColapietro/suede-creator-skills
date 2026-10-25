# Security Policy

## Supported versions

Security reports are evaluated against the current `main` branch and the latest published release. Older versions may not receive fixes.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Email `info@suedeai.ai` with:

- the affected version or commit;
- a concise impact description;
- reproducible steps or a minimal proof of concept; and
- any suggested mitigation.

Do not include live credentials, personal data, or third-party secrets. Use synthetic test data and redact sensitive values from logs and screenshots.

This project does not promise a response time, remediation timeline, bounty, or embargo period. Please keep the report private while it is being evaluated unless disclosure is required by law or a disclosure plan is agreed in writing.

## Scope

Security reports may cover plugin manifests and installation paths, bundled executable helpers, and the local read-only MCP servers. For usage questions or non-security defects, use the repository's normal issue tracker.

## Reviewed scanner exceptions

`.plugin-scanner.toml` contains exact-path exceptions for findings that were manually reviewed in the current source tree. It deliberately uses no wildcard paths, so new files remain visible. Scanner findings on an excepted path are hidden and that path must be manually re-reviewed after any change.

- `skills/suede-agent-teams/scripts/contribution-ledger.mjs` performs local ledger reads and atomic writes behind path, lock, authorization, and content-hash checks. It has no network or credential-store sink.
- `skills/suede-graph-flo-xr/workflows/helpers/apply-patch.cjs` validates its worktree and private temporary roots. `diff-digest.cjs` canonicalizes its worktree and each existing reported file, rejects paths that resolve outside the worktree, and rejects symlinks and non-regular files. Both invoke Git with explicit argument arrays and no shell interpolation.
- The four listed WAV files under `skills/suede-release-linter/scripts/fixtures/sample-clean-project/` are identical 16,044-byte PCM test fixtures (SHA-256 `56d4af65701c26df20bd4021eda95b6e830348ce3a746086079fe89285548dc9`). The exact skill-directory exception accounts only for the scanner's aggregate analyzability finding; each binary path is also listed explicitly.

These exceptions are not a security certification. Changes to an excepted path require renewed review, and reports about those paths remain in scope.

## Explicit source scans and evidence

The HOL workflow uses the pinned action's hash-locked `plugin-scanner` 3.51.0 runtime, with Cisco auto-detection and hosted analysis explicitly disabled. It retains SARIF for 14 days (the repository retention limit) even when the gate fails. Its score-80 and HIGH-severity gates do not imply zero findings. Repository-owned exceptions are not trusted by this workflow; the historical exception notes above describe reviewed source, not active suppression or certification.

`Skill source security` independently runs official [Cisco AI Defense Skill Scanner](https://github.com/cisco-ai-defense/skill-scanner) **2.3.1** on every first-party skill package at the exact PR head and on two representative external skills at the directory snapshot's pinned revisions. This bounded sample is not a whole-directory scan. JSON artifacts retain source revision and folder, scanner version and dependency-lock digest, timestamps, the file inventory and SHA256 hashes, analyzer execution, diagnostics, coverage gaps and every finding. HIGH/CRITICAL findings and incomplete/error states fail the source-scan job. Lower findings remain visible and require review.

The [October 25 first-party triage](security/reviews/2026-10-25-first-party.md) retains the original 64 scan records and narrowly reviews the ten CRITICAL process-execution signatures and incomplete fixture coverage. No finding is suppressed or converted to an approval by that review.

The runtime uses the built-in strict policy, CEL shadow mode (no CEL suppression), static, bytecode, shell-pipeline, correlation and behavioral analyzers. Behavioral alignment verification is explicitly disabled. It runs as an unprivileged user in a read-only, resource-limited container with no network, no credentials and a read-only source mount. No submitted skill, script, hook, installer or repository policy executes. Source is downloaded from GitHub at an exact commit, checked against the pinned Git tree and blob hashes, and copied as regular non-executable files. Symlinks, submodules, path escapes, missing files and oversized source fail acquisition.

Scanner coverage is limited: source patterns and Python/Bash dataflow do not prove a skill benign. Python parse failures, opaque files/archives, analysis warnings, analyzer failures and coverage-limit findings prevent a clean pass. Dependency API deprecation warnings are retained separately as maintenance diagnostics; they do not suppress findings or indicate missing target analysis. Hosted LLM, AI Defense, OSV and VirusTotal routes are unused; those upstream opt-in routes can send data if enabled elsewhere.

## Dependency updates

`scripts/security/requirements.txt` pins all 93 Python dependencies with SHA256 hashes; only wheels install. The official Python 3.12 Linux/amd64 base image is pinned by digest. Cisco 2.3.1 excludes the hijacked `litellm==1.107.0`; this lock explicitly uses `litellm==1.89.7`. It also uses `certifi==2026.10.19`, correcting the older certifi in Cisco's attached release lock. On 2026-10-25, independent PyPI metadata and OSV queries reported no known advisories for this exact graph. That dated check is not a guarantee about future advisories or package behavior. No evidence establishes that Suede previously installed a compromised dependency.

To update, deliberately regenerate the lock from `requirements.in` for Python 3.12 Linux/amd64 using `uv pip compile --generate-hashes --only-binary :all:`, review all resolved versions/advisories and hashes, update the profile's lock digest, and run the synthetic detector checks and pinned representative scans. A profile change invalidates old pass evidence. Never weaken the severity gate or add blanket suppressions to make an update green.

## Directory security status

Quality scores and badges measure structural quality only. They never grant security approval. `directory/security-scans.json` points to reviewed, SHA256-verified records under `directory/security/`; the site derives status from these records rather than accepting a publisher's status field. A pass requires complete current-profile evidence for the exact skill folder and snapshot revision, all configured analyzers, valid scan times and zero findings. Nonblocking findings, blocking findings, errors, skipped scans, evidence older than 30 days, source changes and absent scans have distinct states. Retained findings remain available even when evidence is stale. Status is assessed when the static site builds: reports carry `evaluated_on` and `valid_until`, and evidence panels show both dates. Consumers must reject expired evidence even before the next site rebuild; a saved `passed` value is not a timeless approval or a fresh check of upstream HEAD.

Run `python3 scripts/security/scan.py --external owner/repo/skill-slug --record` for a bounded batch of one to four accepted listings, then rebuild the directory and review the evidence diff in a PR. The command records errors too, replacing any earlier pass pointer. It never updates scores. Successful CI artifacts can be inspected before committing evidence; no bot writes or approves the directory automatically. Without a working isolated container runtime, the command emits explicit error evidence and exits nonzero.
