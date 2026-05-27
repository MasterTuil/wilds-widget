# WILDS — Session Handoff

Last updated: 2026-05-27 (multi-session: foundation + visual bible + skeleton + MCP debug)

> **Context for next Claude session:** read this top-to-bottom **and**
> `VISUAL_BIBLE.md` before doing anything. Then `cat WILDS_BRIEF.md` for
> the technical baseline.

---

## What WILDS actually is

A **desktop/phone companion product**, not a game. Tamagotchi-style widget
that lives on your screen. Architecturally supports a creature family + add-on
economy (paid creatures, habitat skins, food packs).

- Real validation signal: user's 25-year-old sister keeps asking about it.
- This is a **side project under the TUIL Studios umbrella** — long-term,
  user loves games and may build a real one someday. WILDS is the warm-up.
- User is a **designer, not a programmer**. They direct, AI executes.
  They need things that LOOK designed, not just coded.
- Locked scope: **6 species, 6 habitats, 5 forms per species** (with optional
  hard-to-unlock 6th form reserved for monetization).

---

## ⚠️ READ THIS FIRST — the painful lessons

### The MCP wrapper trap (the #1 thing that wasted a whole session)

Claude Code's loaded MCP tools `mcp__pixellab__*` are a **low-level v1 REST
wrapper.** They expose 8 tools: `pixflux`, `bitforge`, `rotate`,
`animate_with_text`, `animate_with_skeleton`, `estimate_skeleton`, `inpaint`,
`get_balance`.

**The OFFICIAL Pixellab MCP at `api.pixellab.ai/mcp` exposes 38 tools**
including the ones you actually want: `create_character`, `animate_character`,
`get_character`, `list_characters`, `create_isometric_tile`,
`create_topdown_tileset`, etc. These are the *high-level character workflow*
tools that handle 8-direction consistency and proper skeleton animation
internally.

**Restarting Claude Code does NOT load the high-level tools** — the wrapper
stays. Even when `~/.claude/settings.json` correctly points at
`https://api.pixellab.ai/mcp`, the session loads the wrong subset.

**The fix:** use `tools/pixellab_mcp.py` — a Python JSON-RPC/SSE client that
hits the official MCP directly. It works perfectly. See "Pipeline" below.

### The "tier-locked" lie

I (previous Claude) repeatedly claimed `animate_with_skeleton` was Pro-tier
locked. **It is not.** Pixel Apprentice (Tier 1) supports it fully — cost $0
per generation under your subscription.

The actual failure was the MCP wrapper sending wrong field names. The wrapper:
- Sent `skeleton_frames` — API wants `skeleton_keypoints`
- Sent `reference_image_path` — API wants `reference_image: {type:"base64", base64:"..."}`
- Then mangled the validation errors into `[object Object],[object Object]...`
  so we couldn't see what was wrong

**Always curl the real API directly when MCP errors are unhelpful.** The user
pushed back on the tier-locked claim and that's what unblocked the session.

### Other discovered truths

- **`rotate` tool fails badly at 90° turns for chibi characters** — produces
  skinny half-turned views, not proper side profiles. Use Pixflux text-to-image
  with explicit "side profile, wide chunky stance" prompt instead. `rotate`
  works for 45° diagonals (NE, SE, etc.) but not pure E/W/N/S.
- **`generate_image_bitforge` with a single character ref produces garbage**
  (noise blobs). Bitforge needs a *style sheet* reference, not one character.
  Skip it until you have a sheet.
- **`animate_with_text` produces drift** — 4 vibes-similar frames that don't
  loop coherently. Use it sparingly. Skeleton animation is the right tool.
- **Procedural code beats generated cycles for subtle motion.** Single anchor
  + breathing bob (`idle`), single anchor + squash FX (`happy`) — these
  outperform any 4-frame Pixellab anim. Don't generate what code can do better.
- **Skeleton API expects EXACTLY 3 keyframes** per cycle. Server interpolates.
  Sending 4 errors with "Expected 3 pose images, got 4".

---

## The Pipeline (the WORKING way to make a creature)

```
Step 1: Create the character (8 directions, 1 call)
  python3 tools/pixellab_mcp.py create "<description>" "<name>"
  → returns character_id (UUID). ~3-5 min processing.

Step 2: Queue animations (each ~30-60s/direction)
  python3 tools/pixellab_mcp.py walk <id>
  python3 tools/pixellab_mcp.py action <id> "<description>" "<anim_name>"
  Animations queue immediately and run after rotation is ready.

Step 3: Poll until everything ready
  python3 tools/pixellab_mcp.py status <id>

Step 4: Download all assets
  python3 tools/pixellab_mcp.py download <id> web/assets/_v3/<creature>/

Step 5: Wire into creatures.js, relaunch
```

**Cost: $0 per generation** under Pixel Apprentice tier (2000/month limit).
Don't be cheap with retries.

---

## Where we are right now

### Live in widget (committed/pushed to MasterTuil/wilds-widget)
- Labeled needs chips (SVG icons, colored per need: yellow energy, red mood, blue hygiene)
- Ambient atmosphere motes (cave dust, meadow pollen)
- Parallax depth layers (procedural; skipped when habitat has Pixellab backdrop)
- Procedural animation FX (squash/stretch on pet/feed/bathe/level-up)
- IBM Plex Mono typography + tabular numbers
- Grain/noise overlay (premium surface)
- Press states + cursor-tracked spotlight on food cards
- Frame blending (crossfade between sprite swaps; walks skip blending)
- Per-anim FPS table (happy snappy, sad droopy, walk brisk)
- Procedural walk-bob synced to frame index (real stepping motion)
- Web Audio sound system + mute toggle in Settings
- Emoji purge (chips, mood bubble, toasts, footer buttons)
- Creature switcher in Settings (cycles Vex / Leafy / Aura)
- Habitat-aware chrome via CSS color-mix (Leafy → sky blue UI, Vex → purple)
- Pixellab meadow backdrop (v2 image) + drifting clouds layer
- Expanded wander zone (creatures use full canvas vertical range)
- Reduced foods to 3 (one per category) maps to 3 evolution branches

### ⚡ MAJOR SHIFT: project moved to Godot

The Electron prototype (this repo's `widget/`) is **frozen as legacy**.
Production codebase is `../WILDS_godot/` — Godot 4.6.3.

Why: Electron canvas means hand-rolled animation timing → endless polish loops.
Godot's `AnimatedSprite2D` handles all of that natively. Pixellab's docs
specifically recommend Godot + Claude.

**Auto-loading docs for new sessions in Godot folder:**
- `../WILDS_godot/CLAUDE.md` — bootstrap context
- This file (WILDS_HANDOFF.md) — full history

### THE BREAKTHROUGH (user-discovered)

User cracked the workflow themselves:
1. **Pixellab dashboard "image copier"** — upload reference image(s), generate
   a character that matches the visual you actually want. This bypasses the
   text-only limitation of the MCP `create_character` tool.
2. User designs creatures in the dashboard with their visual eye, gets a
   `character_id` back.
3. AI side runs the bulk pipeline (queue all animations, poll, download bundle).

**Time per creature with this split: ~30 min.** User controls design, AI
controls volume. Division of labor that works.

### Active character roster on user's Pixellab account

(Run `python3 tools/pixellab_mcp.py list` to refresh.)

| character_id | Description | Size | Status |
|---|---|---|---|
| `53cc71e7-9ed3-4b25-a32e-fa5223dc3022` | **Vex v3** — currently wired in Godot | 124×124 | 19 anims, complete |
| `81450494-61fb-4b4e-bd46-1eeb6d154ca9` | Masked fox Vex — purple/black, white mask, lore-accurate ("Vex's mask isn't worn. It grew there") | 92×92 | 11 anims |
| `bee86ef9-f12f-484c-9e6d-618669f67214` | Giant monkey with big arms and long hair — the breakthrough character | 128×128 | rotations only |
| `2504dfea-a099-4f5e-8717-f94e540b6387` | Baby dog-dragon hybrid, teal+lavender scales, oversized head | 124×124 | 4 anims |
| `d65f0145-fd1f-49dd-82e5-844ef14e1db1` | Leafy cat (boring per user, but functional) | 92×92 | 8 anims |
| `0be7704b-be7e-41ab-b5e9-7e359604f521` | Baby tadpole monster with tongue out | 64×64 | creating (~2%) |

### Leafy character iterations — three attempts (CONTEXT ONLY, superseded by Vex)

| # | character_id | body_type / template | Result | State |
|---|---|---|---|---|
| 1 | `4232a9d5-7244-4a5e-b361-568c4d4d2fb7` | humanoid | **DELETED.** "String bean E.T." — tall green alien, wrong vibe entirely. | Removed from Pixellab dashboard. Stale files in `web/assets/_v3/leafy/4232a9d5/` |
| 2 | `d65f0145-fd1f-49dd-82e5-844ef14e1db1` | quadruped + template=cat | Cute green cat with leaf on head. User: **"boring, I wanted a CREATURE not a cat"** | Still on Pixellab; animations were processing when session ended; rotations in `web/assets/_v3/leafy_cat/d65f0145/` |
| 3 | (next session) | TBD | Aim for fantasy-creature feel, not domestic pet | Queued |

### Critical lesson: body_type and template DOMINATE the description

- `humanoid` → upright human/alien shape no matter the prompt words
- `quadruped` + `cat` → housepet shape no matter the prompt words
- The description influences markings/color/features, NOT silhouette/posture

### Next session — Leafy attempt 3 options (ranked)

1. **`body_type=quadruped` with template=`bear`** — bigger, more imposing silhouette. Reads "wild beast" not "house pet".
2. **`body_type=quadruped` with template=`horse`** — elegant 4-legged, less domestic.
3. **`body_type=humanoid` + explicit chibi `proportions` JSON** — preset chibi (big head, tiny body) might fix the string-bean issue. Check `create_character` schema for proportion presets.
4. **Skip create_character entirely.** Use low-level Pixflux text-to-image for a hand-prompted anchor, then `create_character_state` for evolutions. Loses the 8-direction one-shot but lets us fully control silhouette.
5. **Available templates worth trying:** `bear`, `cat`, `dog`, `horse`. Probably more (probe the API or check docs).

### Old fallback (still wired in widget right now)

- `web/assets/_v2/meadow/ANCHOR_LOCKED_*.png` + `SKEL_*_frame*.png` — the chibi fox-spirit Leafy from the low-level v1 REST workflow. Looks "OK", walks via skeleton frames + procedural bob.
- This is what runs if you `npm start` today. Keep it as the v2 base until v3 Leafy lands.

### User mood at session end

Tired. Frustrated by:
- Wasted hours on the wrapper trap (mcp__pixellab__* vs official MCP)
- My false "tier-locked" claim
- The cat template producing a "boring" output when they wanted a creature

The pipeline is now PROVEN and the user CAN see characters being created in the Pixellab dashboard in real-time (they shared a screenshot). Iteration cost per character is ~3-5 min + maybe 1 retry. So Leafy attempt 3 can land quickly if we pick a better template upfront.

### User's stated complaints (open)
- **Food emojis** still in `foods.js` — need pixel-art sprites via
  `create_map_object` (high-level MCP tool) or similar
- **Sleeping pose** weak — skeleton can't fold a standing sprite. Needs
  a separately-generated lying anchor (or use `create_character_state`
  on the high-level MCP)
- **Vex still unchanged** — locked in queue to do *after* Leafy v3 lands

---

## Visual Bible — see `VISUAL_BIBLE.md`

Locked decisions on palette, canvas sizes, character DNA, evolution model,
habitat list, and the **Pixellab pipeline** (section 8). The bible is the
constitution — every visual decision references it. Update with strikethrough
+ new decision + date, never edit silently.

---

## Open Strategic Questions

- **Monetization model:** free Vex + paid creature unlocks (Tamagotchi On
  style) is the leading direction. The optional 6th evolution form per
  species is the hook for premium tier.
- **Distribution:** Electron-builder configured for DMG. PWA needs
  manifest + service worker.
- **Habitat list (6 needed):** Cave (Vex), Meadow (Leafy), Shore, Forest,
  Storm, ??? — sixth not yet picked. Bible has palette suggestions for 5.

---

## Files of Note

| Path | Purpose |
|---|---|
| `widget/widget.html` | Main UI structure |
| `widget/widget.css` | All styling — chrome vars cascade from `--habitat-primary` |
| `widget/widget.js` | Game logic, render loop, behavior FSM, draw loop |
| `widget/sfx.js` | Web Audio sound module |
| `web/src/data/creatures.js` | Creature definitions (data-driven) |
| `web/src/data/foods.js` | Food definitions (3 items, 3 categories) |
| `web/src/GameState.js` | Needs decay, XP, level, save/load |
| `electron/main.js` | Electron shell, IPC, save path |
| `tools/pixellab_mcp.py` | **High-level MCP client — USE THIS** |
| `tools/pixellab_skeleton.py` | Low-level skeleton helper (fallback) |
| `VISUAL_BIBLE.md` | Locked design rules — constitution |
| `WILDS_BRIEF.md` | Technical baseline |
| `WILDS_HANDOFF.md` | This file |
| `web/assets/_v2/meadow/` | Old Leafy assets (v1 REST workflow) |
| `web/assets/_v3/leafy/` | New Leafy assets (high-level MCP workflow) — POPULATING |

---

## Permissions

`.claude/settings.local.json` allow-list has 133 entries covering common
patterns: all Pixellab MCP tools, `Bash(git *)`, `Bash(pkill *)`,
`Bash(curl ... pixellab.ai/*)`, `Bash(python3 tools/*)`,
`Bash(cd ... npm start)`, Read/Edit/Write across the project.

If new operations prompt for permission, add them to that file's
`permissions.allow` array.

---

## Security

⚠ **Pixellab Bearer token (`45a89bb4-9b6e-4110-9755-943a59b453f5`) is
exposed multiple times**:
- In screenshots the user shared during the session
- In `.claude/settings.local.json` curl patterns (plain text)
- In `claude_desktop_config.json` npx wrapper args
- In `~/.claude/settings.json` mcpServers.pixellab.headers

**Rotate this token from the Pixellab dashboard** when you have 5 minutes.
After rotating, update:
1. `~/.claude/settings.json` → `mcpServers.pixellab.headers.Authorization`
2. `tools/pixellab_mcp.py` → `TOKEN` fallback default
3. `tools/pixellab_skeleton.py` → `TOKEN` fallback default
4. Remove old token references from `.claude/settings.local.json`

---

## Current Godot project state (`../WILDS_godot/`)

### What's working
- `project.godot` — 520×380 viewport, **resizable=true**, canvas_items stretch,
  integer scale mode (preserves pixel-art crispness on resize)
- `scenes/main.tscn` — Backdrop (meadow.png) + GameState + Vex + HUD
- `scenes/hud.tscn` — needs chips, day/lvl labels, action bar
- `scripts/game_state.gd` — 4 needs decay over real time, XP/level, action methods
- `scripts/main.gd` — routes HUD button signals → game_state + creature animations
- `scripts/vex.gd` — wires all 19 Vex animations, 8-direction walk, direction-aware idle, action lock for one-shots
- `scripts/hud.gd` — ProgressBar refresh, action bar hover-reveal (alpha lerp)
- Vex's full 19-animation sheet downloaded at `assets/characters/vex/53cc71e7/`
- Meadow backdrop copied from Electron version
- Buttons functional: FEED → eat anim, PET → wave_hello, CLEAN → shower, TRAIN → jab

### What's UGLY (Electron parity polish needed)
- Default Godot button/label styling — no custom theme, no glass, no fonts
- Needs chips are just `ProgressBar` nodes with `HUN`/`EGY`/`MOD`/`HYG` text;
  Electron had SVG icons + colored bars in styled glass containers
- DAY/LVL pills are bare labels, not the glass-pill chrome from Electron
- Action bar is default-style buttons, not the pill chrome with hover lift
- No grain overlay, no chrome `color-mix` tinting per habitat
- IBM Plex Mono font from Electron is not loaded yet — using Godot default
- Cloud drift layer not wired (we have the `clouds.png` ready)

### Window resize support (just added — verify)
- `window/size/resizable=true`
- `stretch/mode="canvas_items"` + `aspect="keep"` + `scale_mode="integer"`
- This means: drag window corner → content scales at integer multiples
  (1×, 2×, 3×) which keeps pixels crisp. No blurry stretching.

## What's Next When User Returns

**Immediate priorities in the Godot project:**

1. **Theme/polish the HUD** to match Electron quality:
   - Apply a `Theme` resource with custom font (IBM Plex Mono — can use
     `theme_override_fonts`) and StyleBoxFlat for buttons/panels with
     glass + tinted borders.
   - Color the needs chip labels per state (yellow energy ⚡, red mood ♥, blue hygiene 💧)
   - Style the day/lvl labels as glass pills with the habitat-tinted border
2. **Test window resize** — drag corner. Should integer-scale crisply.
   If blurry, adjust `texture_filter` on the AnimatedSprite2D and Backdrop.
3. **Wire drifting clouds layer** — `assets/habitats/clouds.png` is there,
   needs a TextureRect with horizontal drift (Tween or AnimationPlayer).
4. **Build the panels** — STATS / HABITAT / SETTINGS buttons currently just
   `print()`. Need slide-up Panel scenes with content (needs detail, evolution
   paths, etc.).
5. **Creature switcher** — user has multiple characters. Build a Settings
   row that cycles through character IDs.

**Then:**
6. Wire **the monkey** (`bee86ef9`) — has rotations, no animations yet.
   Either generate animations via `animate_character` template calls,
   or use as a static-rotations-only character with procedural motion.
7. Wire **masked-fox Vex** (`81450494`) — lore-accurate alternate. Could
   be Stage-2 evolution of Vex via `create_character_state` derivation.
8. Wire **dog-dragon** (`2504dfea`) — fits "Storm" habitat in bible palette.
9. Wire **tadpole** (`0be7704b`) once it finishes generating — possible Shore creature.

**Cleanup tasks (any time):**
- Delete `web/assets/_v3/leafy/4232a9d5/` (humanoid abomination)
- Delete the cat-Leafy character on Pixellab dashboard if user doesn't want it
- Decide whether to keep the v2 fallback assets

**Then (queued from prior plan):**
7. Same pipeline for Vex — likely body_type=quadruped + cat or fox-like template
8. Cave habitat backdrop (Pixflux text-to-image, 256×128, deep violet palette)
9. Wire cave backdrop
10. Pick remaining 4 habitats + design 4 more creatures
11. Evolution form generation via `create_character_state` (Stage 2 first, then
    Stage 3 variants for the most polished species only)

**Later (post-MVP):**
12. Food sprites via `create_map_object` (high-level MCP)
13. Sound polish, settings polish, onboarding flow
14. Monetization model decision + paywall scaffolding
15. PWA manifest + service worker for mobile
16. App icon, marketing assets, store prep

## Strategic principles to keep (from session-end discussion)

- **Don't iterate template animations to perfection.** Use what works, skip
  what doesn't. Time spent on Pixellab's `eating` template tuning ≠ time
  building product features.
- **Procedural code beats generated frames for subtle motion.** Idle bob,
  happy squash, walk-bob — all live in code. Skeleton or template anims
  are for *poses* not subtleties.
- **For weak anims, use `create_character_state` to lock a pose, then
  animate procedurally.** Single-pose + code > bad 4-frame loop.
- **Reserve state budget for evolutions** — that's where it matters.
- **"5 forms per species" cap exists for cost reasons** (~2700 generations
  if every species gets full state coverage; cap keeps it tractable).
- **Pick 3 hero animations per creature that MUST look great** (idle/walk/happy).
  Accept "good enough" on the rest.
- **Sell the MVP. Don't perfect it.**
