# WILDS — Project Brief for Claude

## What It Is
A desktop/phone companion widget pet app — think Tamagotchi meets always-on desktop pet.
Phase 1 focus is entirely the **widget** (Electron on desktop, PWA on mobile).
The full game (exploration, combat, world map) is deferred.

## Tech Stack
- **Electron** — desktop shell (`electron/main.js`, `electron/preload.js`)
- **Vanilla JS + CSS, ES modules** — no framework, no bundler
- **Widget** lives in `widget/` — `widget.html`, `widget.js`, `widget.css`
- **Shared data** in `web/src/data/` — `creatures.js`, `foods.js`
- **Game logic** in `web/src/GameState.js`
- **Sprite assets** in `web/assets/vex2/` (Vex) and `web/assets/aura/` (Aura)

## Folder Structure
```
WILDS GAME/
├── electron/         main.js, preload.js (Electron shell)
├── widget/           widget.html, widget.js, widget.css (the app)
├── web/
│   ├── src/
│   │   ├── data/     creatures.js, foods.js
│   │   └── GameState.js
│   └── assets/
│       ├── vex2/     Vex sprite frames (idle, walk, happy, eating, sad, training)
│       └── aura/     Aura sprite frames
└── package.json      entry: electron .
```

## Current Creatures
- **Vex** — trickster fox-like, cave habitat, purple/teal theme. 8-frame idle, directional walks, 4-frame action anims.
- **Aura** — calm spirit creature, meadow habitat, green theme. Placeholder, less developed.

## Creature Data Shape (`creatures.js`)
```js
{
  id, name, type, personality, lore, color,
  affinities: ['INT', 'DEF'],
  affinityBonus: { INT: 1.15, DEF: 1.15 },
  behaviorProfile: {
    patience: 6,    // minutes idle before seeking attention
    curiosity: 8,   // wander frequency 1–10
    affection: 6,
    mischief: 9,
    energy: 7,
  },
  habitat: { id, name, background, theme: { '--habitat-primary': ... } },
  animations: {
    idle, idle_east, idle_west,
    walk_east, walk_northeast, walk_northwest, walk_southeast, walk_southwest,
    happy, eating, sad, training
  },
  evolutionPaths: [{ name, prob, hint }],
  foods: ['berry', 'mushroom', ...],
}
```

## GameState (`GameState.js`)
- 4 needs: `hunger`, `mood`, `energy`, `hygiene` (0–100, decay over real time)
- Decay rates: hunger 4h, mood 6h, energy 8h, hygiene 12h
- Actions: `feed(food)`, `pet()`, `train()`, `sleep()`, `bathe()`
- `getOverallMood()` → `'happy' | 'ok' | 'sad' | 'critical'`
- Save/load via `window.wilds.save()` / `window.wilds.load()` (Electron IPC) or localStorage fallback

## Behavior State Machine (`widget.js` — `BEH` object)
Runs every 1 second alongside GameState tick.
```
primaryState: idle | seeking | sleeping | distressed
subMood:      content | bored | curious | playful | tired | hungry
attention:    0–100 (drains based on patience profile, resets on any interaction)
```
- `seeking` triggers when attention hits 0 → creature drifts to center, attention-seek particle fires
- `sleeping` triggers between 23:00–06:00 when energy < 40 → head droop, dim, zzz particles
- `distressed` triggers when avg needs < 20

## Widget Canvas
- Ground strip canvas: 520×160px, Vex drawn at `posX * canvas.width`, `posY * canvas.height`
- SCALE = 2 (sprites drawn at 2×)
- Breathing bob: `Math.sin(performance.now() / 900 * Math.PI) * 2.5` added to Y
- Wander Y clamped to 0.84–0.92 to prevent floating

## Action Bar (hover to reveal)
- Feed → opens food grid panel
- Pet → `gs.pet()`, happy anim + particles
- Sleep → `gs.sleep()`, energy restore
- Train → tap minigame, exp gain
- Stats → needs bars panel
- Habitat → habitat info panel

## Needs Dots
4 dots in top-left corner indicate need levels (color changes: green → yellow → red).
**Planned upgrade**: add labels/icons so player knows which dot = which need without opening stats.

## What's Planned Next (priority order)
1. **Needs dots upgrade** — label each dot (🍖 hunger, 💜 mood, ⚡ energy, 🚿 hygiene)
2. **Sound system** — Web Audio API synth sounds per action (feed, pet, attention, train, distress) + mute toggle in settings
3. **Settings panel** — currently just a link; needs real panel with sound toggle, maybe always-on-top toggle
4. **UI/button polish** — action bar redesign, habitat panel visual upgrade
5. **Attention-seek animation** — new sprite or confirmed procedural fallback
6. **Vex art rebuild** — current sprites are AI-generated (92px, inconsistent); target: Pixellab web app character creator for proper locked-model sprite sheet
7. **Mobile PWA** — web app already works in browser; needs manifest + service worker
8. **Evolution system** — stat thresholds unlock evolutions (data shape exists, UI not built)

## Key Design Principles
- Widget-first: must feel great as a floating desktop/phone companion
- No bundler/framework — keep it simple, everything is vanilla ES modules
- Procedural effects over new sprites where possible (sleep droop, bob, particles)
- Personality per creature drives behavior timing, not just visuals

## Run It
```bash
cd "WILDS GAME"
npm start
```
DevTools opens detached automatically. Saves to `~/.config/WILDS/save.json` (Electron) or localStorage.
