#!/usr/bin/env bash
# Stop hook: soft reminder to commit + push if there are uncommitted changes.
# Outputs a system message via stdout (does not block).

set -euo pipefail
cd "/Users/tuil/Desktop/TUIL Studios/WILDS GAME"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  exit 0
fi

# Any uncommitted changes (staged, unstaged, or untracked)?
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  cat <<EOF
REMINDER: uncommitted changes in WILDS GAME. Per CLAUDE.md, commit + push
to https://github.com/MasterTuil/wilds-widget after meaningful changes.
Do NOT auto-push without user confirmation — just remind, then ask.

  git status
  git add -A && git commit -m "..." && git push
EOF
fi

exit 0
