#!/usr/bin/env bash
# Refreshes directory/skills.json from public GitHub repositories, then
# rebuilds docs/directory/. Reads only; it never runs code from a clone.
#
#   scripts/directory/refresh.sh [workdir]
#
# Steps:
#   1. shallow-clone the curated skill lists named in LISTS
#   2. collect every github.com/<owner>/<repo> they cite (repositories cited by
#      two or more lists, plus the official collections the lists name)
#   3. shallow-clone those repositories into their own directories
#   4. parse every SKILL.md (parse_skills.py), grade it (grade.py) and apply
#      the listing rules and editorial labels (curate.py)
#   5. rebuild the site pages and the sitemap
#
# New skills arrive without an editorial label: they get a keyword category
# and no page of their own until directory/labels.json gains a category and a
# one-sentence summary for them. curate.py prints how many are unlabeled.
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
for r in "${LISTS[@]}"; do
  d="$WORK/lists/${r/\//_}"
  [ -d "$d/.git" ] || GIT_TERMINAL_PROMPT=0 timeout 240 git clone --depth 1 -q "https://github.com/$r" "$d"
done

python3 -I "$TOOLS/extract_links.py" "$WORK/lists" "$WORK/candidates.json" > /dev/null
python3 -I "$TOOLS/select_repos.py" "$WORK/candidates.json" "$WORK/lists/VoltAgent_awesome-agent-skills/README.md" > "$WORK/repos.txt"

clone_one() {
  local r="$1" d="$2/src/${1/\//__}"
  [ -d "$d/.git" ] && return 0
  GIT_TERMINAL_PROMPT=0 timeout 150 git clone --depth 1 -q --filter=blob:limit=400k "https://github.com/$r" "$d" >/dev/null 2>&1 \
    || { rm -rf "$d"; echo "skipped $r (clone failed)" >&2; }
}
export -f clone_one
xargs -P 4 -I{} bash -c 'clone_one "$@"' _ {} "$WORK" < "$WORK/repos.txt"

python3 -I "$TOOLS/parse_skills.py" "$WORK/src" "$WORK/candidates.json" "$WORK/skills-raw.json"
python3 -I "$TOOLS/curate.py" --raw "$WORK/skills-raw.json" --labels "$REPO_ROOT/directory/labels.json" --out "$REPO_ROOT/directory/skills.json"

node "$REPO_ROOT/scripts/build-directory.mjs"
node "$REPO_ROOT/scripts/generate-sitemap.mjs"
echo "Refreshed from $WORK"
