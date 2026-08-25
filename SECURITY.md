# Security Policy

## Supported versions

Security reports are evaluated against the current `main` branch and the latest published release. Older versions may not receive fixes.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Email `info@suedeai.org` with:

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
