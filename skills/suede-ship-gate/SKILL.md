---
name: suede-ship-gate
description: Wire any repo so CI actually gates the merge — path-aware builds, one required check that can't deadlock, and branch protection that holds. Runs in any folder: detects the stack, package managers, lockfiles, existing workflows, and deploy platform, then writes GitHub Actions that build only what changed. Use when adding CI, protecting main, fixing a duplicate or hanging pipeline, or auditing why a required check never passes.
---

# Suede Ship Gate

Set up CI and branch protection that actually block a bad merge — in any repo, any stack. The output is a working pipeline plus the exact protection settings, not advice.

Run this in whatever folder you point it at. **Detect first, never assume.** Nothing here is hardcoded to a specific project, monorepo layout, or package manager.

## Step 0 — Detect (before writing anything)

From the repo root, inventory:

- **Apps:** every top-level dir with a manifest — `package.json`, `requirements.txt` / `pyproject.toml`, `go.mod`, `Cargo.toml`, `Gemfile`. A repo may hold one app or many; build for what's actually there.
- **Package manager per app:** which lockfile is present — `package-lock.json` (npm), `pnpm-lock.yaml` (pnpm), `yarn.lock` (yarn), `bun.lockb` (bun). Two lockfiles in one app is a bug to fix first (Lane 3).
- **Existing CI:** read `.github/workflows/*`. Do **not** duplicate a job that already exists — extend or reconcile it.
- **Runtime versions:** `.nvmrc`, `package.json` `engines`, `.python-version`, `pytest.ini`/`pyproject`. Pin CI to these; never hardcode a guess.
- **Deploy platform:** `vercel.json` / `.vercel`, `netlify.toml`, a `Dockerfile`. If the platform skips non-prod builds (e.g. Vercel `ignoreCommand` kills previews), CI is the *only* pre-merge build signal — so a build job is mandatory.
- **Real scripts:** read each app's `scripts` / test config and use the real ones (`test`, `test:run`, `lint`, `build`). Don't invent commands.

## The gate (the part everyone gets wrong)

Path-filtered jobs **skip** when their paths aren't touched. A skipped job that is a *required* status check leaves the PR pending forever. So never require the path-filtered jobs directly. Instead add one **aggregator** that depends on all of them:

```yaml
  ci-success:
    if: always()
    needs: [<every app job>]
    runs-on: ubuntu-latest
    steps:
      - name: Gate on all jobs
        run: |
          for r in ${{ join(needs.*.result, ' ') }}; do
            [ "$r" = "success" ] || [ "$r" = "skipped" ] || { echo "blocked by: $r"; exit 1; }
          done
```

In branch protection, require **only `ci-success`** — never the individual jobs. This is the single thing that makes "protect main" work with change-based CI.

## Lanes

1. **Path-aware jobs** — one job per app, gated by a `changes` job (`dorny/paths-filter` or native `paths:`). Add an escape hatch so edits to the workflow file itself run everything.
2. **Aggregator gate** — as above. The only required check is `ci-success`.
3. **Lockfile hygiene** — exactly one lockfile per app, and the install command must match it (`npm ci`, `pnpm i --frozen-lockfile`, `yarn --immutable`, `bun install --frozen-lockfile`). Two lockfiles means CI can install a different tree than ships — resolve before wiring CI.
4. **Pin runtimes from the repo** — Node/Python/etc. read from `.nvmrc` / `engines` / `.python-version`, falling back to the platform default. Never a hardcoded guess that drifts from prod.
5. **Don't duplicate existing CI** — if a workflow already covers an app (e.g. a backend test workflow), extend it; never stack a second, weaker job on top.
6. **Least privilege** — `permissions: contents: read` unless a job genuinely needs more.
7. **Build is a gate when previews are off** — if the deploy platform skips non-prod builds, the CI build is your only pre-merge proof the app compiles. Keep it.
8. **Branch protection** — output the exact settings: require `ci-success`, require branches up to date before merge, optional required PR review, block force-push and deletion, optionally include administrators.

## Instant-fail patterns (CI that looks green but isn't)

- A required check that is a path-filtered job → deadlocks every unrelated PR. Use the aggregator.
- `npm ci` with no committed lockfile, or a lockfile for a different manager → fails or installs the wrong tree.
- A second job duplicating an existing workflow → wasted minutes and conflicting signal.
- Hardcoded `node-version` / `python-version` that doesn't match the app → green in CI, broken in prod.
- A job whose `paths:` never match → always skipped → a "green" check that tested nothing.

## Output

1. The workflow file(s) under `.github/workflows/`.
2. The exact branch-protection settings to apply (and the `gh api` calls, if asked).
3. A short report: apps detected, package manager per app, what each job runs, what is required, and anything to fix first (dual lockfiles, duplicate workflows, runtime mismatches).

End with a **Simple explanation (plain, for a 10-year-old)** — see the umbrella workflow — so a non-coder gets the gist.

## Safety

Generate; don't enforce. This skill writes workflow files and tells you the protection settings — it does **not** push, flip branch protection, or change repo access on its own. Verify the detected stack before applying. Works in any repo: it detects rather than assumes Suede or any specific project.
