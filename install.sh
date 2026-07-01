#!/usr/bin/env bash
# Installs all skills from this repo into ~/.claude/skills/
# Syncs each pack skill folder exactly; skills in the target that are not part
# of this pack (personal skills, other packs) are never touched or deleted.
set -euo pipefail
SKILLS_DIR="$(cd "$(dirname "$0")/skills" && pwd)"
TARGET="$HOME/.claude/skills"
mkdir -p "$TARGET"
count=0
for dir in "$SKILLS_DIR"/*/; do
  name="$(basename "$dir")"
  rsync -a --delete "$dir" "$TARGET/$name/"
  count=$((count + 1))
done
echo "Installed $count skills to $TARGET (non-pack skills left untouched)"
