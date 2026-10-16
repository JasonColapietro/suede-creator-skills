#!/usr/bin/env bash
# Refreshes directory/skills.json from public GitHub repositories, then
# rebuilds docs/directory/. Reads only; it never runs code from a clone.
#
#   scripts/directory/refresh.sh [workdir]
#
# Steps:
#   1. shallow-clone or update the curated skill lists named in LISTS
#   2. collect every github.com/<owner>/<repo> they cite (repositories cited by
#      two or more lists, plus the official collections the lists name, plus
#      accepted listing requests in directory/inclusions.json)
#   3. shallow-clone or update those repositories to their remote default branch
#   4. parse every SKILL.md (parse_skills.py), grade it (grade.py) and apply
#      the listing rules and editorial labels (curate.py)
#   5. rebuild the site pages and the sitemap
#
# New skills arrive without an editorial label: they get a keyword category
# and no page of their own until directory/labels.json gains a category and a
# one-sentence summary for them. curate.py prints how many are unlabeled.
# Reused checkouts must be clean. A failed update aborts before parsing or
# publishing; cached repositories no longer selected are kept but not parsed.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TOOLS="$REPO_ROOT/scripts/directory"
WORK="${1:-$(mktemp -d)}"
export SUEDE_DIRECTORY_DATE="${SUEDE_DIRECTORY_DATE:-$(date +%F)}"

LISTS=(
  travisvn/awesome-claude-skills
  ComposioHQ/awesome-claude-skills
  VoltAgent/awesome-agent-skills
  hesreallyhim/awesome-claude-code
  BehiSecc/awesome-claude-skills
  karanb192/awesome-claude-skills
  heilcheng/awesome-agent-skills
  skillmatic-ai/awesome-agent-skills
)

mkdir -p "$WORK/lists" "$WORK/src"
WORK="$(cd "$WORK" && pwd)"
export GIT_TERMINAL_PROMPT=0

sync_checkout() {
  local r="$1" d="$2" limit="$3" head branch dirty
  shift 3
  if [ ! -d "$d/.git" ]; then
    if [ -e "$d" ]; then
      echo "refusing non-checkout cache path: $d" >&2
      return 1
    fi
    timeout "$limit" git -c core.hooksPath=/dev/null clone --depth 1 -q "$@" "https://github.com/$r" "$d" || {
      echo "failed to clone $r; refresh aborted" >&2
      return 1
    }
    branch="$(git -C "$d" symbolic-ref --short HEAD)" || return 1
    git -C "$d" config suede.directoryDefaultBranch "$branch" || return 1
    return 0
  fi

  # Caches are read-only snapshots, but do not discard someone's local work.
  dirty="$(git -C "$d" status --porcelain --untracked-files=all --ignored)" || return 1
  if [ -n "$dirty" ]; then
    echo "refusing dirty checkout: $d" >&2
    return 1
  fi
  # A shallow clone's fetch refspec and origin/HEAD may still name an old
  # default branch. Ask the remote on every run, then fetch that explicit ref.
  head="$(timeout "$limit" git -C "$d" ls-remote --symref origin HEAD)" || return 1
  branch="$(printf '%s\n' "$head" | sed -n 's|^ref: refs/heads/\(.*\)[[:space:]]HEAD$|\1|p')"
  if [ -z "$branch" ] || ! git check-ref-format --branch "$branch" >/dev/null; then
    echo "cannot determine default branch for $r" >&2
    return 1
  fi
  # FETCH_HEAD avoids ref namespace collisions after renames such as
  # main -> main/current, and leaves any old local branch commits intact.
  timeout "$limit" git -C "$d" -c core.hooksPath=/dev/null fetch --depth 1 --refmap= -q origin \
    "refs/heads/$branch" || return 1
  git -C "$d" -c core.hooksPath=/dev/null checkout -q --detach FETCH_HEAD || return 1
  git -C "$d" config suede.directoryDefaultBranch "$branch" || return 1
}
export -f sync_checkout

for r in "${LISTS[@]}"; do
  d="$WORK/lists/${r/\//_}"
  sync_checkout "$r" "$d" 240
done

python3 -I "$TOOLS/extract_links.py" "$WORK/lists" "$WORK/candidates.json" > /dev/null
python3 -I "$TOOLS/select_repos.py" "$WORK/candidates.json" "$WORK/lists/VoltAgent_awesome-agent-skills/README.md" "$REPO_ROOT/directory/inclusions.json" "$REPO_ROOT/directory/exclusions.json" > "$WORK/repos.txt"

clone_one() {
  local r="$1" d="$2/src/${1/\//__}"
  sync_checkout "$r" "$d" 150 --filter=blob:limit=400k || {
    echo "failed to refresh $r; refresh aborted" >&2
    return 1
  }
}
export -f clone_one
xargs -r -P 4 -I{} bash -c 'clone_one "$@"' _ {} "$WORK" < "$WORK/repos.txt"

# Only expose this run's selections to the parser. Old caches are not deleted
# and cannot reintroduce repositories removed from the curated source lists.
SELECTED="$(mktemp -d "$WORK/selected.XXXXXX")"
trap 'rm -rf "$SELECTED"' EXIT
while IFS= read -r r; do
  [ -n "$r" ] || continue
  ln -s "$WORK/src/${r/\//__}" "$SELECTED/${r/\//__}"
done < "$WORK/repos.txt"
python3 -I "$TOOLS/parse_skills.py" "$SELECTED" "$WORK/candidates.json" "$WORK/skills-raw.json"
python3 -I "$TOOLS/curate.py" --raw "$WORK/skills-raw.json" --labels "$REPO_ROOT/directory/labels.json" --out "$REPO_ROOT/directory/skills.json"

node "$REPO_ROOT/scripts/build-directory.mjs"
node "$REPO_ROOT/scripts/generate-sitemap.mjs"
echo "Refreshed from $WORK"
