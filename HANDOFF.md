# WILDS — Session Handoff

Last updated: 2026-05-26

> **Context for next Claude session:** read this top-to-bottom before
> doing anything. Then `cat CLAUDE_BRIEF.md` for technical baseline.

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

---

## Where we are

### Done (live in widget, all committed/pushed)
- Labeled needs chips (SVG icons, draining bars)
- Ambient atmosphere motes (cave dust, meadow pollen)
- Parallax depth layers (procedural silhouette bands)
- Procedural animation FX (squash/stretch on pet/feed/bathe/level-up)
- IBM Plex Mono typography + tabular numbers
- Grain/noise overlay (premium surface)
- Press states + cursor-tracked spotlight on food cards
- Frame blending (crossfade between sprite swaps) — **strobing bug FIXED**
- Per-anim FPS table (happy snappy, sad droopy, walk brisk)
- Web Audio sound system + mute toggle in Settings
- Emoji purge (chips, mood bubble, toasts, footer buttons)
- git initialized, pushed to https://github.com/MasterTuil/wilds-widget

### Generated but NOT wired (in `web/assets/vex2/`)
- 4 Vex Pixellab variants (`_pixellab_test_v2..v5.png`)
- v3 locked as `_vex_reference_LOCKED.png` (Claude's pick — chibi, big eyes)
- Rotation pipeline validated (`_vex_locked_east.png`)
- Animation pipeline validated (4-frame idle, some style drift noted)
- See `web/assets/vex2/VEX_PIXELLAB_NOTES.md` for full pipeline notes

### User's stated complaints (open)
- **Food emojis** — user doesn't like them. Need real pixel-art food
  sprites via Pixellab. Currently using emoji strings in `web/src/data/foods.js`.
- ~~Strobing on Vex~~ — **FIXED** last session, restart widget to confirm
- "Barely see a change" — fair feedback that incremental polish hit a
  ceiling. Need bigger moves: real sprites + real backgrounds.

---

## The Real Diagnosis

WILDS doesn't have a code problem, it has a **foundation problem**.
Current Vex is "a sprite I generated", not "the canonical Vex".
Current cave is "procedural ridges I coded", not "the cave I designed".
Every polish pass hits a ceiling because the bedrock isn't locked.

Every successful pet product nailed this first — Tamagotchi had ONE creature
with a perfect 16×16 silhouette before anything else. WILDS hasn't done that yet.

---

## The Plan When User Returns

### Phase 1 — Foundation (1-2 hrs, mostly Claude work)
1. **Write the WILDS Visual Bible** — locked decisions:
   palette hex codes, sprite canvas size, palette limit per char (12 max),
   outline rule, shading direction, character archetype system,
   world archetype system. Every future decision references this.
2. **Design character FAMILY** not character — 3-5 creatures with shared DNA:
   same head/body ratio, eye style, outline weight, accent rule.

### Phase 2 — Character Lock-in (2-3 hrs)
3. Switch from Pixflux to **Bitforge with style reference** for consistency.
4. Lock first creature via reference frame → rotations → anims (~60 sprites).
5. Replace current Vex completely. "Holy shit it looks different" moment.
6. Design Creature #2 from same bible. Proves pipeline produces a family.

### Phase 3 — World (next, 2-3 hrs)
7. Pixellab cave backdrop replacing procedural ridges (520×200).
8. Pixellab meadow backdrop.
9. Day/night that grades WHOLE scene, not just overlay tint.

### Phase 4 — Depth (later)
10. Personality drives visible behavior (stats currently inert).
11. Bond level separate from XP.
12. Ambient micro-events per habitat (yawns, finds shiny rocks, etc.)

### Phase 5 — Product (later still)
13. Onboarding (name creature, pick habitat).
14. Mobile PWA + desktop installer + app icon.
15. Monetization scope (free tier vs paid creatures).

---

## Open Strategic Questions

- **Pixellab dependence:** user open to non-Pixellab path if pipeline
  fails. Backup paths: hire a pixel artist on Fiverr for hero sprites,
  use Aseprite manually, lean on Higgsfield for style-locked gens.
  Decision: see if Bitforge with reference produces consistent enough
  sheets to commit. If yes, Pixellab is the path. If no, pivot.
- **Monetization model:** free Vex + paid creature unlocks (Tamagotchi On
  model) is the leading direction. Not decided.
- **Distribution:** Electron-builder is configured (DMG/exe), PWA needs
  manifest + service worker added.

---

## Technical Notes for Next Session

- Stack: vanilla JS + vanilla CSS + Electron + ES modules (no framework).
- Pixellab: `mcp__pixellab__*` tools. Generations cost $0 under user's
  active "Pixel Apprentice" tier (2000/month). Don't be cheap.
- Pixellab secret was exposed in a screenshot — user said they'd rotate it.
- User can't keep pressing permission prompts. Use sticky tool patterns
  where possible.
- Sound system in `widget/sfx.js` is self-contained Web Audio. Add new
  sounds by extending the `SOUNDS` object.

---

## Files of note

- `widget/widget.html` — main UI structure
- `widget/widget.css` — all styling
- `widget/widget.js` — game logic, render loop, all behavior
- `widget/sfx.js` — Web Audio sound module
- `web/src/data/creatures.js` — creature definitions (data-driven, add new = add entry)
- `web/src/data/foods.js` — food definitions (emoji icons here, need pixel sprites)
- `web/src/GameState.js` — needs decay, XP, level, save/load
- `electron/main.js` — Electron shell, IPC, save path
- `CLAUDE_BRIEF.md` — technical baseline (read after this file)
- `web/assets/vex2/VEX_PIXELLAB_NOTES.md` — Vex sprite iteration notes
