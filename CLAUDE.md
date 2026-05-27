# WILDS — Auto-loaded session context

You are working on **WILDS**, a Tamagotchi-style desktop/phone companion
product. This is one of several projects under the **TUIL Studios** umbrella
(siblings: Bad Nonno, etc.) — make sure you are looking at WILDS files, not
sibling-project files.

## CRITICAL — Read in this order before doing ANY work

1. **`WILDS_HANDOFF.md`** — current state, what's done, what's queued,
   security notes, and **the painful lessons** about which Pixellab tools
   to use (and which trap to avoid).
2. **`VISUAL_BIBLE.md`** — locked visual decisions: palette, sprite specs,
   character DNA, evolution model, Pixellab pipeline. Every visual
   decision MUST reference this.
3. **`WILDS_BRIEF.md`** — technical baseline (stack, file structure, game state).

## DO NOT

- Use `mcp__pixellab__*` tools for new creature creation — they're a
  low-level wrapper missing the character workflow. **Use
  `tools/pixellab_mcp.py` instead.** Full explanation in `WILDS_HANDOFF.md`.
- Claim things are "tier-locked" without proof. The wrapper's
  validation errors lie. Curl the real API to debug.
- Generate cycles via `animate_with_text` — produces drift, not loops.
- Rotate to 90° via the `rotate` tool — produces skinny output for
  chibi characters. Use Pixflux text-to-image with explicit "side
  profile" instead.
- Edit `VISUAL_BIBLE.md` silently. To change a rule, strike through
  the old one with `~~text~~` and add the new with date.
- Touch sibling projects in `TUIL Studios/`. Stay within `WILDS GAME/`.

## DO

- Reference the user as the designer/director. AI executes, user directs.
- Prefer procedural code over generated sprites for subtle motion
  (idle bob, happy squash) — code beats Pixellab at that scale.
- Always commit + push to https://github.com/MasterTuil/wilds-widget
  after meaningful changes.
- When the user pushes back on a claim you made, **investigate** rather
  than restate. Previous Claudes were wrong about tier-locking and only
  the user's pushback unblocked the session.
- Be honest about what you don't know. Don't speculate as fact.

## Quick state check on session start

```bash
# Last commit + open tasks
cd "$(pwd)"
git log --oneline -5
cat WILDS_HANDOFF.md | head -100
```

## The pipeline (memorize this)

```bash
python3 tools/pixellab_mcp.py create "<description>" "<name>"
python3 tools/pixellab_mcp.py walk <character_id>
python3 tools/pixellab_mcp.py action <character_id> "<action_desc>" "<anim_name>"
python3 tools/pixellab_mcp.py status <character_id>
python3 tools/pixellab_mcp.py download <character_id> web/assets/_v3/<creature>/
```

Generations cost $0 under Pixel Apprentice tier. Don't be cheap.
