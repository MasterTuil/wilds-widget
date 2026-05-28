#!/usr/bin/env bash
# Stop hook: soft reminder to commit + push if there are uncommitted changes.
# Outputs a system message via stdout (does not block).

set -euo pipefail
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  exit 0
fi

if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  REMOTE="$(git remote get-url origin 2>/dev/null || echo '(no origin remote)')"
  cat <<EOF
REMINDER: uncommitted changes in $(basename "$PROJECT_DIR").
Per CLAUDE.md, commit + push after meaningful changes.
Origin: $REMOTE
Do NOT auto-push without user confirmation — just remind, then ask.

  git status
  git add -A && git commit -m "..." && git push
EOF
fi

exit 0
