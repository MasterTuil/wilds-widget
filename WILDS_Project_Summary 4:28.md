# WILDS — Project Summary
### Where we are, what's locked, what's next
*Last updated: end of design + early build phase*

---

## THE PRODUCT (LOCKED)

**WILDS** is a desktop and mobile companion widget app — a living pixel-art creature that exists in a small floating window on the user's screen. Tamagotchi-modernized: nostalgic at heart, but designed for the way people actually use their devices today.

**The North Star:** A creature you take care of throughout your day. Lives on your desktop while you work, in your pocket on your phone, alongside your life. Beautiful, alive, full of personality.

**What it is NOT (anymore):** A turn-based RPG with battles, co-op multiplayer, complex evolution branches, or PvE story content. Those ideas are archived for potential future phases but are not active development targets.

---

## CURRENT BUILD STATE

### What's actually built
- **Electron desktop app** with full project structure (`electron/`, `widget/`, `web/src/`, `web/assets/`)
- **Vanilla JS + ES modules** — no framework, no bundler (intentionally lean)
- **GameState** with 4 needs (hunger, mood, energy, hygiene) decaying over real time
- **Behavior state machine** (`BEH` object) with primary states (idle/seeking/sleeping/distressed) and sub-moods (content/bored/curious/playful/tired/hungry)
- **Personality-driven timing** — `attention` drains based on per-creature `patience` profile, `seeking` triggers when attention hits zero
- **Sleep cycle** gated by real-world time (23:00–06:00 + low energy)
- **Save system** via Electron IPC with localStorage fallback
- **Two creatures defined:** Vex (developed) and Aura (placeholder)
- **Sprite assets** for Vex including 8-direction idle, walks, happy, eating, sad, training animations
- **Action bar** revealed on hover with feed/pet/sleep/train/stats/habitat
- **Needs dots** in top-left showing real-time need levels
- **Procedural breathing bob** layered on sprites for "alive" feel even between animation frames

### What's working well
- The behavior model is genuinely better than Tamagotchi — personality drives timing, not just visuals
- Procedural effects (breathing, particle systems) compensate for animation limitations
- The widget concept is the right product positioning
- Vex looks alive in the current build despite imperfect AI sprites

### What's known weak
- Pixellab AI tool produces decent sprites but cannot match hand-drawn animation quality
- Vex sprite consistency was off in earlier generations (currently being reworked)
- No sound system yet
- Settings panel is a stub, not real
- Mobile PWA not yet implemented
- Random encounter system not yet defined or built

---

## KEY DECISIONS MADE THIS SESSION

### Vision pivot
Original plan was a full RPG with PvE arena, co-op bosses, and 21 evolution forms. **Pivoted to companion-app-first:** the widget IS the product. Battles and depth come later, if at all. Random ambient encounters (peaceful/curious/aggressive visitors entering the habitat) replace turn-based combat conceptually.

### Art tooling
- **Bing Image Creator** generates hero concept art per creature
- **Pixellab Pro** ($12/mo) generates 8-direction sprites and basic animations
- **Procedural effects in code** fill the gap where AI animation falls short
- **Aseprite** ($20 one-time) available for manual sprite touch-ups if needed
- **Honest acceptance:** AI animation tools cannot match hand-pixeled artist quality. Quality of motion is achieved through procedural code layers, not just sprite frames.

### Creature roadmap simplification
- **Vex remains the MVP creature** — being reworked for visual consistency
- **Baby dog-dragon was attempted as second creature** — design wasn't satisfying, deferred
- **No second creature added until Vex experience is polished and complete**
- Polish trumps breadth

### Roadmap reorder
Priority is now (in order):
1. Make the Vex companion experience genuinely good
2. Polish UI, feel, sound, settings
3. Mobile PWA so friends can install on their phones
4. Then consider adding a second creature
5. Random encounters as ambient events (later)
6. Everything else (evolution, social, depth) deferred

---

## IMMEDIATE NEXT STEPS

### Phase: "Make Vex Excellent"

**1. Vex sprite rework (in progress)**
Generate consistent 8-direction sprite set in Pixellab. Match this back into the codebase replacing current Vex assets in `web/assets/vex2/`.

**2. Sound system**
Web Audio API synthesized sounds per action — feed click, pet purr, attention chirp, training thud, distress whimper. Mute toggle in settings. No external audio files needed; everything synthesized in-code.

**3. Settings panel (real, not stub)**
- Sound on/off toggle
- Always-on-top toggle (Electron native)
- Optional: window opacity slider, position lock
- Save preferences to user config

**4. Needs dots upgrade**
Currently 4 unlabeled colored dots. Add tiny icons or labels (🍖 hunger, 💜 mood, ⚡ energy, 🚿 hygiene) so user knows which dot maps to which need without opening stats panel.

**5. UI/button polish**
Action bar visual refinement — better hover states, smoother reveal animation, cleaner panel transitions. Habitat panel is currently underdeveloped, gets a visual upgrade.

**6. Attention-seek animation**
Currently uses a procedural particle as fallback. Either generate a sprite for it or commit to the procedural version permanently. Decision depends on Pixellab output quality.

### Phase: "Get It in Friends' Hands"

**7. Mobile PWA**
Web app already runs in browsers. Add `manifest.json` for installability, service worker for offline, viewport tuning for mobile. Goal: friend opens link on iPhone, taps "Add to Home Screen," now has Vex living on their phone.

**8. Friend distribution**
Share PWA link to a small group of friends. Real user feedback before any further feature work.

### Phase: "Decide What Comes Next"
Based on friend feedback, decide between:
- Adding a second creature
- Implementing random encounters
- Building the evolution system
- Or something else entirely we haven't thought of yet

---

## ARCHIVED FOR LATER (NOT ACTIVE WORK)

These were designed in detail in earlier docs but are NOT current priorities:
- Full evolution system (21 forms across 3 creatures with food + habitat triggers)
- The Pause feature
- Wilder's Letter / in-game mail
- Trainer's Quests
- Echo Battles
- Co-op training, co-op boss raids
- Bond Level system
- Bonded forms (species-specific co-op evolutions)
- The Den (multi-pet system)
- The Wandering (casual mode)
- Full Farewell System with Ash Seed inheritance
- Shimmer rare variants (Bright/Lucent/Mythbright)
- PvE Arena with 6 regions
- Season Pass system

These remain as design philosophy reference but are not implementation targets.

---

## TECHNICAL FACTS TO REMEMBER

- **No bundler, no framework** — vanilla ES modules only, this is intentional
- **Widget canvas:** 520×160px ground strip
- **Sprite scale:** 2× (`SCALE = 2`)
- **Breathing bob formula:** `Math.sin(performance.now() / 900 * Math.PI) * 2.5` added to Y
- **Wander Y clamp:** 0.84–0.92 to keep creature on ground
- **Save location:** `~/.config/WILDS/save.json` (Electron) or localStorage fallback
- **Run command:** `cd "WILDS GAME" && npm start`

---

## DESIGN PHILOSOPHY (PERMANENT)

These principles guide all decisions:

1. **Widget-first** — The companion experience IS the product. Everything serves that.
2. **Personality over features** — Better to have one creature with deep personality than ten shallow creatures.
3. **Polish before breadth** — Make existing things excellent before adding new things.
4. **Procedural over generated** — When AI animation falls short, fill the gap with code-driven motion.
5. **Ship to friends fast** — Real users teach more than design documents.
6. **Free path always exists** — Whatever monetization eventually appears, F2P players can earn anything paid players buy.
7. **Warmth with weight** — Cute on the surface, emotionally resonant underneath, accessible to both kids and adults.

---

*This is the canonical project state as of this session. Supersedes all earlier GDD versions for active development purposes.*
