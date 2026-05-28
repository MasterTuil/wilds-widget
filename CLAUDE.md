# WILDS — Auto-loaded session context

> **⚠️ THIS REPO IS LEGACY (2026-05-27).** Production codebase moved to
> `../WILDS_godot/` (Godot 4.6.3). Do not edit the Electron `widget/` here
> unless explicitly asked. Open the Godot folder in a new session for
> active work — it has its own auto-loading `CLAUDE.md`.
>
> **Locked mandate:** "We do nothing else but get one good character going
> and make sure the new godot looks and feels amazing." Stay in scope.

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

- ~~Use `mcp__pixellab__*` tools for new creature creation — they're a
  low-level wrapper missing the character workflow. **Use
  `tools/pixellab_mcp.py` instead.** Full explanation in `WILDS_HANDOFF.md`.~~
  **(2026-05-27)** Workflow is now split. **User** designs characters in the
  **Pixellab dashboard "image copier"** (uploads reference images, generates
  the character with their visual eye, hands back a `character_id`).
  **Claude** runs the bulk via `python3 tools/pixellab_mcp.py`
  (`template` / `status` / download) — that script still works and is the
  right tool. The low-level `mcp__pixellab__*` wrapper tools for sprite
  creation (`generate_image_pixflux`, `generate_image_bitforge`,
  `animate_with_text`, `rotate`) are **mechanically blocked** by
  `.claude/hooks/block-pixellab-creation.sh`. Do not bypass; ask the user.
  Allowed wrapper tools: `animate_with_skeleton`, `estimate_skeleton`,
  `inpaint`, `get_balance` — though `tools/pixellab_mcp.py` is generally
  preferred since the wrapper has documented field-name bugs (see HANDOFF).
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

Now **automatic** via `.claude/hooks/session-start.sh` (SessionStart hook).
The hook prints `git log --oneline -5` and `head -100 WILDS_HANDOFF.md` into
context at every new/resumed/cleared session. No need to run manually.

## The pipeline

~~```bash
python3 tools/pixellab_mcp.py create "<description>" "<name>"
python3 tools/pixellab_mcp.py walk <character_id>
python3 tools/pixellab_mcp.py action <character_id> "<action_desc>" "<anim_name>"
python3 tools/pixellab_mcp.py status <character_id>
python3 tools/pixellab_mcp.py download <character_id> web/assets/_v3/<creature>/
```~~

**(2026-05-27)** The `create` step is gone — user builds sprites manually.
Animation-only pipeline:

```bash
# User provides sprite + reference. Claude animates:
python3 tools/pixellab_mcp.py action <character_id> "<action_desc>" "<anim_name>"
python3 tools/pixellab_mcp.py status <character_id>
python3 tools/pixellab_mcp.py download <character_id> web/assets/_v3/<creature>/
```

Generations cost $0 under Pixel Apprentice tier. Don't be cheap.

## Enforced hooks (`.claude/settings.json`)

- **PreToolUse** — blocks `mcp__pixellab__{generate_image_pixflux,generate_image_bitforge,animate_with_text,rotate}`. Allows `animate_with_skeleton`, `estimate_skeleton`, `inpaint`, `get_balance`.
- **SessionStart** — auto-prints recent commits + handoff head.
- **Stop** — soft commit/push reminder if working tree is dirty.
