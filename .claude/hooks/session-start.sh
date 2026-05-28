#!/usr/bin/env bash
# SessionStart hook: print quick state check (recent commits + handoff head).
# stdout is injected into the new session's context.

set -euo pipefail
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR"

# Find WILDS_HANDOFF.md — in this dir or in sibling "WILDS GAME"
HANDOFF=""
if [ -f WILDS_HANDOFF.md ]; then
  HANDOFF="$PROJECT_DIR/WILDS_HANDOFF.md"
elif [ -f "../WILDS GAME/WILDS_HANDOFF.md" ]; then
  HANDOFF="../WILDS GAME/WILDS_HANDOFF.md"
fi

echo "=== WILDS — auto state check (SessionStart hook) ==="
echo "Project dir: $PROJECT_DIR"
echo

if git rev-parse --git-dir >/dev/null 2>&1; then
  echo "--- Recent commits (git log --oneline -5) ---"
  git log --oneline -5
else
  echo "--- (not a git repo — no commit log) ---"
fi
echo
echo "--- WILDS_HANDOFF.md (first 200 lines: lessons + Godot mandate + roster) ---"
if [ -n "$HANDOFF" ]; then
  echo "(source: $HANDOFF)"
  head -200 "$HANDOFF"
else
  echo "(WILDS_HANDOFF.md not found in project or ../WILDS GAME/)"
fi
echo
echo "--- REMINDER: production codebase is ../WILDS_godot/ (Godot 4.6.3). ---"
echo "--- The Electron 'WILDS GAME/' repo is FROZEN AS LEGACY (2026-05-27). ---"
echo
echo "=== end auto state check — read CLAUDE.md for rules ==="
