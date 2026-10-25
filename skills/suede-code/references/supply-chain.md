# Supply Chain Lane (A03:2025)

Load this file when the diff changes a lockfile, a dependency manifest, a
`.github/workflows/` file, a release or publish script, `.npmrc`, or a
Dockerfile. Cite findings as **A03:2025 Software Supply Chain Failures** (or
A08 for an integrity check that is skipped). Last checked against the sources
below in October 2026.

## Dependencies

- **Manifest moved, lockfile did not.** A `package.json` dependency change with
  no lockfile change means CI and production resolve different trees. P2; P1 on
  a release review.
- **Lockfile changed with no manifest reason.** A lockfile diff that rewrites
  resolved URLs or integrity hashes for packages nobody upgraded deserves a
  line-by-line look. Name the packages. A `resolved` URL pointing away from
  the registry the repo uses is P1.
- **New install-time code.** A new dependency with a `preinstall`,
  `install`, or `postinstall` script runs on every developer machine and CI
  runner. Name it in the finding and ask whether it is needed.
- **Known-vulnerable versions.** Run `npm audit` (or the repo's equivalent)
  only when deps changed, and only cite advisories that are reachable from the
  changed code. Severity mapping is in SKILL.md.

## Publishing (packages this repo ships)

From npm's trusted publishing docs:

- Trusted publishing uses OIDC from GitHub Actions (GitHub-hosted runners),
  GitLab CI/CD (GitLab.com shared runners), or CircleCI cloud. It needs npm CLI
  11.5.1 or later and Node 22.14.0 or later. Self-hosted runners are not
  supported.
- On GitHub Actions and GitLab CI/CD, provenance attestations are generated
  automatically for public packages from public repos; `--provenance` is not
  needed. CircleCI does not generate provenance.
- npm recommends, once trusted publishing works, setting the package to
  "Require two-factor authentication and disallow tokens" and revoking old
  automation tokens.

Review findings: a publish workflow that still reads `NPM_TOKEN` from secrets
when the repo could use trusted publishing (P3, note it); `provenance=false`
added to a public package (P2, A08); a publish job on a self-hosted runner
expecting OIDC to work (P1, it will fail).

## GitHub Actions

- **Unpinned third-party actions.** `uses: owner/action@v3` follows a mutable
  tag. Pin to a full 40-character commit SHA, with the tag in a comment.
  GitHub's allowed-actions policy can require SHA pinning at the enterprise,
  organization, and repository level, and workflows using unpinned actions
  then fail (changelog, August 15, 2025). Unpinned in a job that holds
  secrets or write tokens: P2. First-party `actions/*` unpinned: P3.
- **`pull_request_target`.** Since December 8, 2025, `pull_request_target`
  always runs the workflow file and checkout commit from the default branch,
  and `GITHUB_REF` resolves to the default branch. Environment branch rules
  for this event evaluate against the default branch. A workflow that checks
  out `github.event.pull_request.head.sha` and then runs its code with
  secrets in scope is still a P0; the change does not stop a workflow from
  checking out fork code on purpose. A workflow that relied on environment
  branch filters matching the PR branch now behaves differently; flag it.
- **Token scope.** A new workflow with no `permissions:` block inherits the
  repo default. Ask for the least the job needs. `id-token: write` belongs
  only on jobs that mint OIDC tokens (publishing, attestations, cloud login).
- **Script injection.** `${{ github.event.issue.body }}`,
  `${{ github.event.comment.body }}`, and similar user-controlled event
  fields expanded inside a `run:` or `script:` step are code injection (A05).
  Set the value on an intermediate `env:` variable and read it with the
  shell's own syntax (`"$BODY"`); `${{ env.BODY }}` inside `run:` is still
  injectable. P0 when the job has secrets.
- **`curl ... | sh` in CI or a Dockerfile** with no checksum or pinned
  version: P2.

## Build provenance (artifacts this repo releases)

GitHub artifact attestations: the workflow uses `actions/attest` with
`id-token: write`, `contents: read`, and `attestations: write`
(`packages: write` for container images). Consumers verify with:

```
gh attestation verify PATH/TO/ARTIFACT -R OWNER/REPO
```

A release review on a repo that already attests should confirm the new
artifact path is still covered. A removed attestation step is P2 (A08).

## Secrets pushed to the host

GitHub secret scanning push protection blocks Anthropic API keys
(`anthropic_service_api_key`, `anthropic_user_api_key`) by default on repos
with secret scanning enabled, including free public repos (changelog,
October 13, 2026). Push protection is a backstop, not a review result. A
committed key is still an Instant-F, and the fix is rotation, not only
removal from history.

GitHub token prefixes the commit-dirt scanner matches: `ghp_` (classic PAT),
`github_pat_` (fine-grained PAT), `gho_`, `ghu_`, `ghs_`, `ghr_`. npm tokens
start with `npm_`.

Sources:
- https://owasp.org/Top10/2025/
- https://docs.npmjs.com/trusted-publishers
- https://github.blog/changelog/2025-08-15-github-actions-policy-now-supports-blocking-and-sha-pinning-actions/
- https://github.blog/changelog/2025-11-07-actions-pull_request_target-and-environment-branch-protections-changes/
- https://codeql.github.com/codeql-query-help/actions/actions-code-injection-medium/
- https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations
- https://github.blog/changelog/2026-10-13-secret-scanning-blocks-anthropic-keys-by-default-adds-salesforce
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github
- https://github.blog/security/announcing-npms-new-access-token-format
