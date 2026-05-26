# WILDS — Build Plan v1.0
### From design doc to friends-testable in 2–3 weeks

---

## THE STRATEGY

**Build the web version first. Validate the loop. Port to native iOS once mechanics are proven.**

Why web before iOS for the first version with friends:
- Faster to ship (days vs. weeks)
- No App Store, no TestFlight, no Apple Developer account needed
- Friends play by clicking a link
- Mechanics can be torn apart and rebuilt the same day
- All the logic (needs, evolution, food, training, save state) translates 1:1 to Swift later
- Pixel art assets work in both environments without modification
- We protect the iOS launch from being the "trying things out" version

The web version is not a throwaway. It's a vertical slice that proves the game is fun before we invest in a native build.

---

## ART DIRECTION — WHY PIXEL IS THE RIGHT CALL

Three reasons this is genuinely better than going hand-illustrated:

**1. AI tools handle pixel art exceptionally well.**
Pixel art has clean constraints — limited palettes, fixed resolutions, low frame counts. Modern AI image tools produce pixel sprites that need only minimal cleanup. Hand-illustrated creatures require significantly more refinement to look professional.

**2. The aesthetic is built for nostalgia and shareability.**
A 64×64 pixel Lumi is instantly recognizable as "from a virtual pet game." That recognition is marketing. Tamagotchi-coded design signals to the audience exactly what they're looking at without explanation.

**3. The constraint forces good design.**
Pixel art demands clarity in silhouette, color, and animation. There's nowhere to hide bad design behind detail. When the pixel version of a creature looks great, the creature works. That's a useful filter.

### Visual Style Anchors

| Reference | What to take from it |
|---|---|
| **Tamagotchi** | Compact creatures, expressive within tiny constraints |
| **Stardew Valley** | Warm habitat lighting, environmental life |
| **Eastward** | Modern pixel art with cinematic polish |
| **Kingdom: Two Crowns** | Atmosphere through limited palette |
| **Owlboy** | High-detail pixel work as aspirational ceiling |

---

## AI TOOL STACK

### For Pixel Art Creatures

| Tool | What it does | Honest verdict |
|---|---|---|
| **Pixellab.ai** | Purpose-built for game pixel art, character generation, animation frames | **Best fit.** Designed for exactly this use case. Has skeletal animation tools. Subscription-based. |
| **Scenario.gg** | Train custom models on a style reference | **Best for consistency.** Higher learning curve but produces studio-quality unified style across many assets. Worth it if we get serious. |
| **Retro Diffusion** | Pixel-art-trained Stable Diffusion model | Powerful but technical setup. Only if you have a local GPU. |
| **Midjourney** | General image gen with `--style raw` and pixel prompts | Inconsistent for character design. Good for concept ideation only. |
| **Aseprite** | The pixel art editor | Manual cleanup. Not AI but essential downstream tool. ~$20 one-time. |

**Recommended starter stack:** Pixellab.ai for creatures, Aseprite for cleanup, Scenario.gg later if we want to lock in a unified house style.

### For Habitats / Backgrounds

Same tools as above. Habitats are larger sprites (390×500ish) and benefit from layered output for parallax. Pixellab and Scenario both handle this.

### For Sound

| Tool | Purpose | Cost |
|---|---|---|
| **ElevenLabs Sound Effects** | Text-to-SFX for game effects (food crunch, bath splash, level up) | Subscription |
| **Suno or Udio** | Ambient music tracks per habitat | Subscription |
| **Free chiptune libraries** | Authentic 8/16-bit music | Free (OpenGameArt, Freesound) |

For a first build: free chiptune libraries cover music, ElevenLabs for a handful of distinct effects.

### For Code

| Tool | Use Case |
|---|---|
| **Claude Code** (terminal) | My recommendation. Same model talking to you with persistent project context. Can directly edit code files, run commands, debug. |
| **Cursor** | Visual IDE with AI built in. Good if you prefer an editor over terminal. |
| **Direct development** | Just SwiftUI for iOS or HTML/JS for web, no AI assist |

For Phase 0 web build: I can write the code directly here in conversation, you copy-paste or download. For Phase 1 iOS native: Claude Code in your terminal is the move.

---

## PHASE 0 MVP SCOPE — WHAT FRIENDS WILL PLAY

Lean ruthlessly. The goal is to validate the core loop, not show off every feature.

### What's IN

| Feature | Scope |
|---|---|
| **1 creature** | Lumi only |
| **2 habitats** | The Meadow + The Cave |
| **Needs system** | Hunger, Mood, Energy, Hygiene (skip Social — no friends in MVP) |
| **Real-time decay** | Needs decay even when app is closed |
| **2 mini-games** | Boulder Lift (STR) + Puzzle Solve (INT), hold-and-release mechanic |
| **Food system** | 6 food items across Primal/Nature/Arcane categories |
| **Training cap** | 4-hour cooldown enforced |
| **Evolution to Juvenile** | Hatchling → Juvenile transition with stage-up cinematic |
| **Evolution to Adult** | All 4 known Lumi paths reachable (Luminos, Deep Lumi, Ghost Lumi, Prism Lumi) |
| **Evolution path screen** | Live probability display |
| **The Pause** | Implemented for one secret form hint |
| **Save state** | localStorage + URL-based save backup |
| **Pixel art** | Lumi (4-direction idle + 6 reaction animations), 2 habitats |
| **Music** | 2 tracks (Meadow ambient, Cave ambient) |
| **Sound effects** | 8–10 essential SFX |

### What's OUT for MVP

- Cinder and Moss (add post-validation)
- All other habitats
- PvE Arena (add Phase 1)
- Co-op anything (add Phase 2)
- The Den, The Wandering (add Phase 1+)
- Premium IAP (no monetization in MVP — friends are testers)
- Push notifications (web limitations, add in iOS native)
- Wilder's Letter (add Phase 1)
- Codex (add Phase 1)
- Farewell System (technically simpler to skip in 2-week build, but if we have time, it's emotionally critical and worth including)

### Why this MVP works

A friend who plays this for 1 week experiences:
1. The hatch moment
2. Real-time needs that make them check the app
3. The choice tension of training vs. feeding
4. Two genuinely different mini-games with the hold-release mechanic
5. The decision-making behind food choices
6. The evolution path screen with shifting probabilities
7. The first real evolution from Hatchling to Juvenile (visual stage-up moment)
8. Multiple potential adult forms based on their choices

That's enough to know if the game is fun.

---

## ASSET PRODUCTION PLAN

### Lumi sprite set (week 1)

| Asset | Size | Frames | Tool |
|---|---|---|---|
| Lumi idle (Hatchling) | 32×32 | 8-frame breathing loop | Pixellab.ai |
| Lumi idle (Juvenile) | 48×48 | 8-frame breathing loop | Pixellab.ai |
| Lumi idle (Adult) — 4 paths | 64×64 each | 8-frame breathing loop | Pixellab.ai |
| Lumi happy reaction | 48×48 | 6 frames | Pixellab.ai → Aseprite |
| Lumi sad reaction | 48×48 | 6 frames | Pixellab.ai → Aseprite |
| Lumi eating | 48×48 | 8 frames | Pixellab.ai → Aseprite |
| Lumi training (boulder) | 48×48 | 12 frames | Pixellab.ai → Aseprite |
| Lumi training (puzzle) | 48×48 | 12 frames | Pixellab.ai → Aseprite |

### Habitats (week 1)

| Asset | Size | Layers |
|---|---|---|
| The Meadow | 390×500 | Sky + midground + foreground (parallax) |
| The Cave | 390×500 | Backwall + crystals + floor (parallax) |

### UI elements (week 1)

| Asset | Notes |
|---|---|
| Pixel font | Use a free pixel font like "Press Start 2P" or "Pixel Operator" |
| Needs icons | 16×16 pixel icons for each need |
| Food items | 32×32 sprite per food item (6 total in MVP) |
| Action buttons | Custom pixel-style buttons matching the aesthetic |

---

## TIMELINE — 2 TO 3 WEEKS TO FRIENDS

### Week 1: Assets + Foundation
- **Days 1–2:** Generate Lumi sprite set via Pixellab. Iterate until the creature feels alive at 64×64.
- **Days 3–4:** Generate The Meadow and The Cave habitat backgrounds. Layered for parallax.
- **Days 5–7:** Build the web app shell — game state management, save system, needs decay loop, time-of-day logic.

### Week 2: Core Loop
- **Days 8–9:** Implement feeding, food categories, mood/hygiene systems.
- **Days 10–11:** Build the two mini-games with hold-and-release mechanic.
- **Days 12–14:** Build evolution tracking system, Evolution Path screen, stage-up cinematic.

### Week 3 (buffer + polish): Ship
- **Days 15–17:** Polish, sound integration, bug fixes, friend save sharing.
- **Days 18–21:** Deploy to Vercel/Netlify. Send link to friends.

This is realistic if we focus. Two weeks if asset generation goes well, three weeks with normal life happening.

---

## DEPLOYMENT

**Web hosting:** Vercel (free tier, instant deploy from a Git repo, custom domain optional)
**Save state:** localStorage with optional Firebase backup if we want cross-device
**Distribution:** Send a link. That's it. Friends open it on their phone, add to home screen for fullscreen mode.

**Phone install as PWA:**
1. Friend opens the link in Safari (iOS) or Chrome (Android)
2. Taps "Add to Home Screen"
3. Game runs fullscreen, looks like a real app
4. Saves persist in browser storage

This is genuinely indistinguishable from a native app for the test phase.

---

## COST ESTIMATE FOR PHASE 0

| Item | Cost |
|---|---|
| Pixellab.ai subscription (2 months) | ~$40 |
| Aseprite (one-time) | ~$20 |
| ElevenLabs (1 month) | ~$22 |
| Vercel hosting | Free |
| Domain (optional) | ~$12/yr |
| **Total minimum** | **~$80–95** |

If we use entirely free tools (Stable Diffusion locally, free pixel art editors, free chiptune libraries) cost can drop to $0 with more setup time.

---

## DECISION POINTS BEFORE WE START

I need three decisions from you to start production:

**1. Web first, or push directly to iOS?**
My strong recommendation: web first. But if you want to skip directly to iOS native and have an Apple Developer account ready, that's a valid path — just adds 4–5 weeks to the timeline.

**2. Which creature for MVP — Lumi only, or all three?**
My strong recommendation: Lumi only. Asset budget triples with three creatures, and friends only need to test the loop with one.

**3. Tool stack — Pixellab.ai or do we explore alternatives first?**
My recommendation: Pixellab.ai for speed. If you want to compare against Scenario.gg or Retro Diffusion before committing, we can spend a day on bake-off tests.

---

## WHAT I'LL DO ONCE YOU GREENLIGHT

The moment you say go, I will:

1. Generate first-pass Lumi sprite prompts you can paste into Pixellab.ai
2. Write the complete web app code (HTML/CSS/JS, single file deployable)
3. Build the save system, needs decay, food system, training mini-games end-to-end
4. Set up the project for Vercel deployment
5. Provide a step-by-step guide for getting it live
6. Help you iterate on art direction as Pixellab outputs come back

This is a real, shippable plan. The only question is when we start.

---

*WILDS Build Plan v1.0 — Internal Use Only*
