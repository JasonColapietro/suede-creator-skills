#!/usr/bin/env bash
# Installs all skills from this repo into ~/.claude/skills/
set -euo pipefail
SKILLS_DIR="$(cd "$(dirname "$0")/skills" && pwd)"
TARGET="$HOME/.claude/skills"
mkdir -p "$TARGET"
# Merge into ~/.claude/skills without --delete: TARGET is the shared skills
# root, so mirroring would wipe the user's other (non-Suede) skills.
rsync -a "$SKILLS_DIR/" "$TARGET/"
echo "Installed $(ls "$SKILLS_DIR" | wc -l | tr -d ' ') skills to $TARGET"
