# Deep pass (`--deep` only)

Read from `SKILL.md` Step 4 only when the depth is `--deep`.

- **Reverse dependencies:** find every caller of a changed function, type,
  route, or constant across the repo. Name the call sites you checked.
- **Shared assumptions:** for a changed schema, env var, default, or
  invariant, find other places that assume the old value.
- **History:** `git log -L` or `git blame` the touched lines. A change that
  reintroduces a previously fixed shape is a regression; cite the prior commit.
- **Sibling pattern:** compare to the nearest analog (other handlers, other
  migrations). A lone handler skipping the shared auth wrapper is P1 even if
  it works.
- **Critic lanes** for auth, payments, migrations, or public APIs: a change
  mapper, runtime critic, security critic, product critic, and test critic,
  each reporting separately. Collect consensus. If a high-severity concern
  survives a fix cycle, keep `hold` and name the smallest next check.

A whole-repo claim with no named symbols is not evidence.
