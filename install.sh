#!/usr/bin/env bash
# Installs all skills from this repo into ~/.claude/skills/
# Syncs each pack skill folder exactly; skills in the target that are not part
# of this pack (personal skills, other packs) are never touched or deleted.
# Also refreshes other install surfaces when they exist on this machine:
# - If the target skills directory is itself a git checkout, it is pulled
#   (fast-forward only) before syncing so the pack lands on current state.
# - If this pack is installed as a Claude Code plugin, the marketplace clone
#   is pulled and the plugin is updated so sessions load the newest version.
# Both steps are best-effort: failures never break the file install.
set -euo pipefail
SKILLS_DIR="$(cd "$(dirname "$0")/skills" && pwd)"
TARGET="$HOME/.claude/skills"
mkdir -p "$TARGET"

if [ -e "$TARGET/.git" ]; then
  git -C "$TARGET" pull --ff-only -q 2>/dev/null \
    && echo "Pulled latest state of $TARGET before syncing" \
    || echo "Note: could not fast-forward $TARGET (offline, dirty, or diverged) — syncing pack skills anyway"
fi

count=0
for dir in "$SKILLS_DIR"/*/; do
  name="$(basename "$dir")"
  rsync -a --delete "$dir" "$TARGET/$name/"
  count=$((count + 1))
done
echo "Installed $count skills to $TARGET (non-pack skills left untouched)"

MARKETPLACE_CLONE="$HOME/.claude/plugins/marketplaces/suede"
if [ -e "$MARKETPLACE_CLONE/.git" ]; then
  git -C "$MARKETPLACE_CLONE" pull --ff-only -q 2>/dev/null \
    && echo "Refreshed plugin marketplace clone at $MARKETPLACE_CLONE" \
    || echo "Note: could not refresh marketplace clone (offline or diverged)"
fi
if command -v claude >/dev/null 2>&1; then
  if claude plugin list 2>/dev/null | grep -q "suede-skills@suede"; then
    claude plugin update suede-skills@suede 2>/dev/null \
      && echo "Updated plugin suede-skills@suede (restart sessions to apply)" \
      || echo "Note: plugin update did not complete — run 'claude plugin update suede-skills@suede' manually"
  fi
fi
