#!/usr/bin/env bash
# commit-dirt-scan.sh: Commit Dirt Score, executed instead of eyeballed.
#
# Scans the added (`+`) lines of a diff for content that should never reach git
# history and prints one verdict line per category, then an overall rating.
#
# Usage:
#   scripts/commit-dirt-scan.sh                 # scans `git diff HEAD`
#   scripts/commit-dirt-scan.sh main...HEAD     # scans that range
#   git diff main...HEAD | scripts/commit-dirt-scan.sh -
#
# Read-only and advisory: it never stages, reverts, writes, or fails the caller's
# command. It always exits 0; the verdict is reported, never enforced.

set -uo pipefail

if [ "${1:-}" = "-" ]; then
  DIFF=$(cat)
elif [ "$#" -gt 0 ]; then
  DIFF=$(git diff "$@" 2>/dev/null)
else
  DIFF=$(git diff HEAD 2>/dev/null)
fi

if [ -z "$DIFF" ]; then
  echo "COMMIT DIRT SCORE: no diff content to scan (empty range or not a git repo)."
  exit 0
fi

ADDED=$(printf '%s\n' "$DIFF" | grep -E '^\+' | grep -Ev '^\+\+\+')
PATHS=$(printf '%s\n' "$DIFF" | grep -E '^\+\+\+ b/' | sed 's|^+++ b/||')
DIRTY=0
SUSPECT=0

# $1 = label, $2 = pattern, $3 = corpus, $4 = severity when hit (dirty|suspicious),
# $5 = optional "case" to match case-sensitively (default is case-insensitive)
check() {
  local label="$1" pattern="$2" corpus="$3" sev="$4" flags="-Ein" hit
  [ "${5:-}" = "case" ] && flags="-En"
  hit=$(printf '%s\n' "$corpus" | grep "$flags" "$pattern" | head -3)
  if [ -n "$hit" ]; then
    printf '%-26s %s - %s\n' "$label" "$sev" "$(printf '%s' "$hit" | tr '\n' ';' | cut -c1-160)"
    [ "$sev" = "dirty" ] && DIRTY=1 || SUSPECT=1
  else
    printf '%-26s clean - none\n' "$label"
  fi
}

echo "COMMIT DIRT SCORE"
# A committed key is an Instant-F (SKILL.md Step 1), so known key shapes grade dirty.
check "Secrets (high-confidence):" '(AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY|gh[pousr]_[A-Za-z0-9]{36}|xox[baprs]-[A-Za-z0-9-]{10,}|sk_live_[A-Za-z0-9]{16,}|sk-(ant|proj)-[A-Za-z0-9_-]{20,})' "$ADDED" dirty case
check "Secrets (assignment):" '(pk_live|(password|passwd|secret|api_?key|token)[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"']{8,})' "$ADDED" suspicious
check "Debug artifacts:" '(console\.(log|debug)|[^a-z]debugger[^a-z]|binding\.pry|byebug|var_dump\(|pprint\(|TODO: ?remove|FIXME: ?before merge|HACK:)' "$ADDED" suspicious
# Real markers are exactly seven characters: `<<<<<<< label`, `||||||| label`,
# `>>>>>>> label`, and `=======` alone on its line. Markdown setext underlines and
# ASCII rules (eight or more `=`, or seven with trailing text) stay clean.
check "Conflict markers:" '^\+(<{7}( |$)|\|{7}( |$)|>{7}( |$)|={7}[[:space:]]*$)' "$(printf '%s\n' "$DIFF" | grep -E '^\+')" dirty
check "Accidentally staged:" '(^|/)(node_modules|\.next|dist|build|__pycache__)/|\.(pyc|DS_Store|log|sqlite|db)$' "$PATHS" dirty
check "WIP breadcrumbs:" '(\[WIP\]|DO NOT MERGE|TEMP:|SKIP CI|lorem ipsum|[^a-z]asdf[^a-z])' "$ADDED" suspicious
check "Exposed internals:" '(https?://(localhost|127\.0\.0\.1|10\.[0-9]+\.|192\.168\.)|https?://[a-z0-9.-]*(staging|internal)[a-z0-9.-]*/|[a-z0-9._%+-]+@(gmail|yahoo|hotmail|outlook)\.com)' "$ADDED" suspicious

# Oversized or binary blobs. A changed file over 500 KB is dirty. A smaller binary
# (favicon, test fixture) is only suspicious: SKILL.md flags blobs over 500 KB.
# Paths in the diff are repo-root-relative, so size them from the repo root.
BINARY_PATHS=$(printf '%s\n' "$DIFF" | sed -nE 's#^Binary files .* and b/(.*) differ$#\1#p')
BINARY_HITS=$(printf '%s\n' "$DIFF" | grep -E '^(Binary files|GIT binary patch)' | head -2)
ROOT=$(git rev-parse --show-toplevel 2>/dev/null) && cd "$ROOT"
BIG=""
while IFS= read -r p; do
  [ -n "$p" ] && [ -f "$p" ] || continue
  sz=$(wc -c < "$p" 2>/dev/null | tr -d ' ')
  [ -n "$sz" ] && [ "$sz" -gt 512000 ] && BIG="$BIG${BIG:+; }$p (${sz}B)"
done <<< "$(printf '%s\n%s\n' "$PATHS" "$BINARY_PATHS" | sort -u)"
if [ -n "$BIG" ]; then
  printf '%-26s dirty - %s\n' "Oversized / binary:" "$(printf '%s' "$BIG" | tr '\n' ';' | cut -c1-160)"
  DIRTY=1
elif [ -n "$BINARY_HITS" ]; then
  printf '%-26s suspicious - %s\n' "Oversized / binary:" "$(printf '%s' "$BINARY_HITS" | tr '\n' ';' | cut -c1-160)"
  SUSPECT=1
else
  printf '%-26s clean - none\n' "Oversized / binary:"
fi

if [ "$DIRTY" = 1 ]; then
  echo "Overall dirt rating:       DIRTY"
elif [ "$SUSPECT" = 1 ]; then
  echo "Overall dirt rating:       SUSPICIOUS"
else
  echo "Overall dirt rating:       CLEAN"
fi
echo "(Advisory. Confirm each hit against the diff before reporting it as a finding.)"
exit 0
