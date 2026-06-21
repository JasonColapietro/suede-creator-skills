#!/usr/bin/env bash
# Installs all skills from this repo into ~/.claude/skills/
set -euo pipefail
SKILLS_DIR="$(cd "$(dirname "$0")/skills" && pwd)"
TARGET="$HOME/.claude/skills"
mkdir -p "$TARGET"
rsync -a --delete "$SKILLS_DIR/" "$TARGET/"
echo "Installed $(ls "$SKILLS_DIR" | wc -l | tr -d ' ') skills to $TARGET"
