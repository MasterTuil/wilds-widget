# WILDS — AI Handoff Brief
### For continuing this project with a different AI assistant
*Paste this entire document as your first message to a new AI session.*

---

Hi. I'm working on a project called **WILDS** — a desktop and mobile companion widget app, like a modern Tamagotchi. I've been developing it with another AI assistant and want to continue the work with you. This brief gives you everything you need to be helpful immediately.

---

## THE PRODUCT

WILDS is a small floating window on a desktop or phone that contains a living pixel-art creature. The user takes care of the creature throughout their day — feeding it, petting it, watching it react to the time of day, occasionally responding to its mood. It's nostalgic by inspiration but designed for modern devices and modern attention spans.

**What makes it different from Tamagotchi or other virtual pet apps:**
- Personality-driven behavior model (not just stat decay)
- Lives on your desktop, doesn't require a separate app to be opened
- Real-time mechanics tied to actual time of day
- Designed to be beautiful enough to keep visible while you work

**What it is NOT:**
- A turn-based RPG
- A game with battles or combat
- A multiplayer or social platform
- A complex world with exploration

Earlier versions of the design included all those elements. They've been deferred indefinitely. The widget IS the product.

---

## TECHNICAL FOUNDATION (ALREADY BUILT)

The project exists as a working Electron desktop app with this structure:

```
WILDS GAME/
├── electron/         # main.js, preload.js (Electron shell)
├── widget/           # widget.html, widget.js, widget.css (the app itself)
├── web/
│   ├── src/
│   │   ├── data/     # creatures.js, foods.js (creature & food definitions)
│   │   └── GameState.js  # core game logic
│   └── assets/
│       ├── vex2/     # Vex sprite frames
│       └── aura/     # Aura sprite frames (placeholder)
└── package.json      # entry point: electron .
```

**Stack:**
- Electron for desktop shell
- Vanilla JavaScript with ES modules (no React, no framework, no bundler — this is intentional)
- CSS for styling
- Web Audio API for future sound

**Run command:** `cd "WILDS GAME" && npm start`

**Save location:** `~/.config/WILDS/save.json` via Electron IPC, with localStorage as fallback for web context.

---

## CORE SYSTEMS BUILT

### GameState (web/src/GameState.js)

Manages four needs that decay over real time:
- `hunger` — decays over 4 hours
- `mood` — decays over 6 hours
- `energy` — decays over 8 hours
- `hygiene` — decays over 12 hours

All needs are 0–100. Player actions:
- `feed(food)` — restores hunger, food type affects which stats grow
- `pet()` — restores mood
- `train()` — costs energy, triggers a tap mini-game, grows experience
- `sleep()` — restores energy
- `bathe()` — restores hygiene

`getOverallMood()` returns one of: `'happy' | 'ok' | 'sad' | 'critical'`

Save/load via `window.wilds.save()` / `window.wilds.load()`.

### Behavior State Machine (widget.js → BEH object)

Runs alongside GameState every 1 second. Tracks:
- `primaryState`: idle | seeking | sleeping | distressed
- `subMood`: content | bored | curious | playful | tired | hungry
- `attention`: 0–100 (drains based on per-creature `patience` profile, resets on any user interaction)

Behavior rules:
- `seeking` triggers when attention hits 0 → creature drifts to center, particle effect fires to draw user back
- `sleeping` triggers between 23:00 and 06:00 when energy < 40 → head droops, dim overlay, 'z' particles
- `distressed` triggers when average needs < 20

This state machine is one of the project's strongest features. It gives the creature genuine personality timing instead of just decaying numbers.

### Creature Data Shape (web/src/data/creatures.js)

```javascript
{
  id, name, type, personality, lore, color,
  affinities: ['INT', 'DEF'],
  affinityBonus: { INT: 1.15, DEF: 1.15 },
  behaviorProfile: {
    patience: 6,    // minutes idle before seeking attention
    curiosity: 8,   // wander frequency 1-10
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

### Widget Canvas

- Ground strip canvas: 520×160px
- Vex drawn at `posX * canvas.width`, `posY * canvas.height`
- Sprite scale: 2× (`SCALE = 2`)
- Breathing bob formula: `Math.sin(performance.now() / 900 * Math.PI) * 2.5` added to Y position
- Wander Y clamped to 0.84–0.92 to keep creature grounded

### Action Bar

Hover-revealed UI containing six actions: Feed (opens food grid), Pet, Sleep, Train, Stats, Habitat. Each opens a panel or triggers a creature animation.

### Needs Dots

Four colored dots in the top-left corner showing current need levels. Color shifts green → yellow → red as needs deplete.

---

## CREATURES

**Vex** (the primary creature)
- Trickster fox-like creature with a white mask covering its face
- Cave habitat
- Purple/teal color theme
- Affinities: INT, DEF
- Has full sprite set: 8-frame idle, directional walks, 4-frame action animations
- Currently being reworked for visual consistency

**Aura** (placeholder — not currently being developed)
- Calm spirit creature
- Meadow habitat
- Green theme
- Defined in code but not visually developed

The current development focus is making Vex's experience excellent before adding any other creature.

---

## ART PIPELINE (HOW SPRITES GET MADE)

1. Concept art generated in **Bing Image Creator** (free, DALL-E 3 based)
2. 8-direction sprite sheets generated in **Pixellab Pro** ($12/month)
3. Animations generated in **Pixellab's "Animate with text" tool**
4. Manual cleanup (if needed) in **Aseprite** ($20 one-time)
5. **Procedural effects in code** layer on top to compensate for AI animation limitations (breathing bobs, particles, parametric movements, blink timing, etc.)

**Honest acceptance:** AI tools cannot match hand-pixeled artist quality for animation. Quality of motion is achieved through procedural code layers more than perfect sprite frames. This is fine. Many indie games do this.

---

## CURRENT PRIORITIES (IN ORDER)

1. **Finalize Vex sprite rework** — get a clean, consistent 8-direction sprite set into the codebase
2. **Sound system** — Web Audio API synthesized sounds per action with mute toggle
3. **Real settings panel** — sound toggle, always-on-top toggle, possibly opacity slider
4. **Needs dots upgrade** — add labels or icons so users know which dot maps to which need
5. **UI polish** — action bar visual refinement, better panel transitions, habitat panel improvement
6. **Attention-seek animation** — decide between sprite version or procedural-only version
7. **Mobile PWA** — manifest.json, service worker, viewport tuning so friends can install on phones
8. **Ship to small friend group** for real feedback

After friends have tested, decide between:
- Adding a second creature
- Implementing random encounters (peaceful/curious/aggressive visitors entering the habitat as ambient events)
- Building an evolution system
- Or something else based on user feedback

---

## DEFERRED FEATURES (DESIGNED BUT NOT BEING BUILT)

These features were designed in detail in earlier project documents. They are NOT current priorities and may never be built. Do not propose them as next steps unless explicitly asked:

- Full evolution system with 21 forms across 3 creatures
- Turn-based PvE arena and battle system
- Co-op multiplayer training and boss raids
- Bond Level system between friends
- Bonded forms (species-specific co-op evolutions)
- Multi-pet system (The Den)
- Casual mode (The Wandering)
- Full Farewell System with inheritance items
- Shimmer rare variants
- Season Pass system
- In-game mail (Wilder's Letter)
- Trainer's Quests
- Echo Battles in 6 regions

---

## DESIGN PRINCIPLES (PERMANENT)

When proposing solutions or features, optimize for these:

1. **Widget-first** — The companion experience IS the product
2. **Personality over features** — Depth in one creature beats breadth across many
3. **Polish before breadth** — Make existing things excellent before adding new things
4. **Procedural over generated** — Fill animation gaps with code, not more AI calls
5. **Ship to friends fast** — Real users teach more than design documents
6. **Free path always exists** — Any future monetization must allow F2P access to all content
7. **Warmth with weight** — Cute and approachable, but with emotional resonance

---

## HOW I'D LIKE YOU TO WORK WITH ME

- I'm not a senior software engineer. I can read and modify code with help. Walk me through changes step by step when relevant.
- I appreciate honesty about tool and tech limitations. Don't pretend AI animation is at hand-drawn quality if it isn't.
- I value direct opinions over hedging. If I propose something that won't work, tell me clearly.
- One step at a time when something is technical or unfamiliar.
- Match my energy: if I'm exploring, explore with me; if I'm executing, help me execute.

---

## WHAT I MIGHT ASK YOU FOR

Likely areas where I'll need help:
- Writing or modifying JavaScript code in the existing files
- Designing the sound system
- Building the settings panel
- Configuring the PWA manifest and service worker
- Generating sprite prompts for Pixellab
- Polishing CSS and UI feel
- Debugging Electron quirks
- Strategic product decisions about what to build next

---

## STARTING POINT

When I'm ready to work, I'll typically tell you what I'm trying to accomplish. Confirm you've read this brief, then ask me what I'm working on right now and we can dive in.

If you have questions about anything in this brief — clarifications about the design, the codebase, or the priorities — ask before starting work. It's better to verify understanding than to make assumptions.

---

*End of handoff brief.*
