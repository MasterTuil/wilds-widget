#!/usr/bin/env bash
# PreToolUse hook: block low-level Pixellab MCP sprite-creation tools.
# Reads JSON from stdin: { tool_name, tool_input, ... }
# Exit 2 + stderr = block & feed message back to Claude.

set -euo pipefail
payload="$(cat)"
tool_name="$(printf '%s' "$payload" | /usr/bin/python3 -c 'import sys,json; print(json.load(sys.stdin).get("tool_name",""))')"

case "$tool_name" in
  mcp__pixellab__generate_image_pixflux|mcp__pixellab__generate_image_bitforge)
    cat >&2 <<EOF
BLOCKED: $tool_name is the low-level Pixellab REST wrapper for sprite creation.

Per WILDS_HANDOFF.md and CLAUDE.md, the user now builds reference-based
sprites manually. Claude does NOT generate new creature sprites.

If this is animation work, use:
  - mcp__pixellab__animate_with_skeleton  (the right tool)
  - mcp__pixellab__estimate_skeleton
  - or python3 tools/pixellab_mcp.py action <id> "<desc>" "<name>"

If the user explicitly asked for sprite generation, ask them to confirm —
do not bypass this block silently.
EOF
    exit 2
    ;;
  mcp__pixellab__animate_with_text)
    cat >&2 <<EOF
BLOCKED: animate_with_text produces drift (4 vibes-similar frames that don't
loop coherently). Per WILDS_HANDOFF.md, use animate_with_skeleton instead,
or python3 tools/pixellab_mcp.py action.
EOF
    exit 2
    ;;
  mcp__pixellab__rotate)
    cat >&2 <<EOF
BLOCKED: the rotate tool produces skinny half-turned views at 90° for chibi
characters (WILDS_HANDOFF.md). For pure E/W/N/S, use Pixflux text-to-image
with explicit "side profile, wide chunky stance" — but per the new workflow,
the user builds reference sprites manually. Ask the user before unblocking.
EOF
    exit 2
    ;;
esac

exit 0
