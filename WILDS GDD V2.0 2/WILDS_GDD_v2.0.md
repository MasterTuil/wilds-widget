# WILDS — Game Design Document
### Version 2.0 | The Unified Source of Truth | Confidential
*Consolidates all design decisions from v1.0, v1.1, v1.2, and the Evolution Bible v1.0.*

---

## EXECUTIVE SUMMARY

**Title:** WILDS
**Tagline:** *"Something is alive in your phone."*
**Platform:** iOS (Beta target). Web prototype precedes native build.
**Genre:** Virtual Pet / RPG-Lite / Social Co-op
**Audience:** Primary 16–35 (nostalgic core), Secondary 9–15 (next generation)
**Rating:** 9+
**Visual Style:** Modern pixel art with nostalgic Tamagotchi DNA (locked v2.0)
**Monetization:** Free-to-play with cosmetic IAP + premium creature/habitat unlocks
**Differentiator:** A virtual pet game with real RPG depth — every choice shapes evolution, secret forms reward counterintuitive play, and the best moments are shared with a friend.

---

## 1. DESIGN PILLARS

| Pillar | Meaning |
|---|---|
| **Alive** | The Wild reacts, breathes, remembers, grows |
| **Intentional** | Every player choice visibly shapes the Wild |
| **Rewarding** | The more you invest, the more you get back |
| **Together** | The best content is shared with a friend |
| **Beautiful** | Pixel-perfect, every screen is wallpaper-worthy |

---

## 2. STORY & TONE

### Direction: *Warmth with Weight*

Two audiences served simultaneously without compromise.

**For 30s players:** The world has real stakes. *The Quieting* is silencing creatures across regions — not a villain, but a systemic environmental force. There is loss in this world. Subtle questions about responsibility and stewardship live underneath the game.

**For 9–15 players:** The surface is warm, colorful, adventurous. The Wild is your friend. Enemies are misunderstood, not evil. Every chapter ends with a small victory.

**Execution:**
- Hand-illustrated wordless cutscenes carry emotion visually
- NPC dialogue is short, plain, emotionally clear
- Deep lore lives in the **Wild Codex** for players who seek it
- The final chapter carries genuine emotional weight for long-term players

**Tone references:** Pokémon Mystery Dungeon (warmth) · Ori and the Blind Forest (visual storytelling) · Studio Ghibli (creature mythology)

---

## 3. ART DIRECTION (UPDATED v2.0)

### Visual Style: Modernized Pixel Nostalgia

**The Reference Mix:**
- **Tamagotchi** — pixel charm, simplicity, immediate readability
- **Stardew Valley** — warmth, lighting, environmental detail
- **Eastward** — modern pixel art with cinematic polish
- **Pokémon Mystery Dungeon** — creature personality through small animations

**Specifications:**
- Creatures: 64×64 base sprite, 4-direction idle animations, 8-frame action loops
- Habitats: 390×500 base resolution, 2-layer parallax background
- Color palette: 32-color limit per scene for cohesion (selected per habitat)
- Animation: 12fps for idle/breathing, 24fps for action
- UI: Pixel-style fonts and icons, but modern UX patterns underneath

**Why this works:**
- Faster to produce with AI tools (production-ready in days, not months)
- Smaller asset footprint = faster app, longer battery life
- Universal visual literacy (everyone knows pixel art)
- Ages slower than 3D or hand-illustrated styles
- Built-in shareability — pixel art screenshots are social-media native
- Lower cost barrier to ship a polished MVP

---

## 4. CORE SYSTEMS

### 4A. Stats (6 core)

| Stat | Description |
|---|---|
| **STR** | Raw power. Physical attacks, heavy evolutions |
| **SPD** | Quickness. Turn order, dodge, sprint evolutions |
| **END** | Stamina. Battle longevity, training duration |
| **INT** | Mental acuity. Special abilities, INT evolutions |
| **DEF** | Damage mitigation. Tank evolutions |
| **CHA** | Social power. Co-op synergy, NPC interactions |

**Rules:** Stats grow only — never decay. Caps increase per evolution stage. Natural species affinities give bonus growth on aligned stats.

### 4B. Stat Caps by Stage

| Stage | Stat Cap | Days | Avg Player Dominant Stat |
|---|---|---|---|
| Hatchling | 30 | 1–3 | 15–20 |
| Juvenile | 60 | 4–10 | 35–45 |
| Adult | 100 | 11–30 | 70–85 |
| Elder | 150 | 31+ | 130+ |

### 4C. Needs System

| Need | Decay Rate | If Ignored | Restored By |
|---|---|---|---|
| **Hunger** | Every 4 hrs | Lethargic, -10% training XP | Feeding |
| **Mood** | Every 6 hrs | Sulks, -CHA, reduced co-op synergy | Play, visits, favorite food |
| **Energy** | Per training/battle | Can't train or battle | Sleep, energy foods, time |
| **Hygiene** | Every 12 hrs | Visual grime, -CHA in visits | Bath mini-game |
| **Social** | Every 24 hrs | Stares at door, -Mood | Friend visits |

### 4D. Training System

**6 Disciplines** — each with 2–3 themed mini-games:
Strength · Speed · Endurance · Intelligence · Defense · Charisma

**Rules:**
- Hard cap: 1 session per discipline per 4 hours
- Energy cost: 1–2 bars per session
- Energy refills 1 bar per 2 hours, faster with energy foods
- Mood affects performance (+10–25% bonus XP for happy Wilds)
- Streak bonus: same discipline 3 consecutive days = stacking XP, max 3x

### 4E. Mini-Game Mechanic

**Core mechanic:** Hold-and-release timing bar with golden "sweet zone."
- Hold builds power
- Release in zone = Good/Perfect XP
- Release outside zone = partial XP
- Three input modes (set in Settings, no stat penalty for any):
  - **Full Mechanics** — all tap, swipe, hold, tilt active
  - **Tap Only** — accessibility mode, all interactions become taps
  - **Swipe Only** — directional swipes replace tap sequences

### 4F. Food System

Food shapes evolution as much as training does. Seven categories:

| Category | Icon | Primary | Secondary | Evolution Affinity |
|---|---|---|---|---|
| **Primal** | 🥩 | STR | END | Aggressive, physical |
| **Nature** | 🌿 | END | CHA | Gentle, grounded |
| **Arcane** | ✨ | INT | SPD | Intellectual, void-path |
| **Swift** | 💨 | SPD | INT | Agile, social |
| **Tempered** | 🛡️ | DEF | STR | Tank, fortress |
| **Crafted** | 🎭 | CHA | Social XP | Social, theatrical |
| **Ancient** | 🌟 | All stats | Elevated access | Legendary unlocks only |

Each category has Common / Uncommon / Rare / Legendary tiers.
Rare and Legendary items are habitat- or PvE-locked, not purchasable with soft currency.

### 4G. Habitats

| Habitat | Tier | Modifier | Evolution Affinity |
|---|---|---|---|
| The Meadow | Free | Neutral | Default paths |
| The Cave | Free | DEF+END | Tank, Arcane bonus |
| The Rooftop | Free | SPD+CHA | Social, agile |
| The Greenhouse | $1.99 | END+CHA, Nature bonus | Growth, gentle |
| The Deep | $2.99 | END+DEF, Arcane bonus | Deep-sea variants |
| The Ruins | $2.99 | STR, Primal bonus | Warrior paths |
| The Cloud | $3.99 | SPD+INT | Skyrift evolutions |
| The Void | $3.99 | INT+++ | Required for ??? secrets |

All habitats: real-time day/night, real-world weather sync, seasonal changes, hidden training areas.

---

## 5. EVOLUTION SYSTEM

### 5A. The Three Inputs

```
DOMINANT STAT TRAINING  +  FOOD DIET  +  HABITAT  =  ADULT FORM
```

### 5B. Diet Tracking — Rolling 14-Day Window

Tracks the most-fed food category over the past 14 days. Players can switch strategies and see probabilities update in real time. **The Refined Track** rewards players who maintain 75%+ of one diet category across the entire lifespan with a "Refined" variant of their final form (Codex badge, +3% to dominant stats, visible mark in social/battle UI).

### 5C. Stat Tie-Breaking
First stat to reach the threshold wins. Encourages decisive training.

### 5D. Evolution Path Visibility

| Stage | What's Shown |
|---|---|
| **Hatchling** | First/most-likely path teased ("Lumi seems to be heading toward...") |
| **Juvenile** | All known paths revealed with live probabilities |
| **Pre-Evolution** | Cryptic hint + Pause option (see 5E) |

### 5E. The Pause

Triggers on the final day of Juvenile when the system detects the Wild is within 12% probability of a rare, elevated, or secret form.

**Sequence:**
1. Wild's idle animation shifts — looks contemplative, different posture
2. Prompt: *"Lumi feels like it's becoming something specific... but something's missing. Want to wait?"*
3. Player chooses [Continue] or [Wait a week]
4. Choosing wait: stage frozen for 7 days, hint mail arrives within an hour
5. After 7 days, evolution triggers regardless of player choice
6. **One Pause per Wild** — cannot stack

### 5F. The Wilder's Letter (In-Game Mail)

Inbox lives in the Friends tab. Six letter types:

| Type | Content |
|---|---|
| **Personal Analytics** | Weekly summary of your Wild's progress |
| **Discovery Rumors** | Anonymized hints from other players' combinations |
| **First Global Discovery** | Announcement when a ??? form is unlocked worldwide |
| **Friend Evolution** | Notification when a friend's Wild evolves |
| **Season Story** | Story chapter unlocks and event invitations |
| **Close Calls** | "You were close" feedback when secret evolution conditions were nearly met |

**Discovery Rumors are the experimentation engine** — real anonymized hints from real players drive the discovery economy without spoiling specifics.

### 5G. Evolution Tiers

| Tier | Visibility | How |
|---|---|---|
| **Common** | Full name + stats | Default play paths |
| **Uncommon** | Name + hint shown | Intentional 2-input combination |
| **Rare** | Name + cryptic hint | Rare food + specific habitat + stats |
| **Elevated** | ??? until first global unlock | Very specific combos |
| **Secret/Legendary** | Silhouette only | Counterintuitive triggers |

When the first player globally unlocks a Secret form, the Codex updates for everyone. Their name is permanently inscribed.

---

## 6. CREATURE ROSTER

### Free Tier (Beta)

| Creature | Type | Affinities | Personality |
|---|---|---|---|
| **Lumi** | Bioluminescent blob | INT, SPD | Curious, bright, playful |
| **Moss** | Plant-lizard | END, STR | Patient, grounded, stubborn |
| **Cinder** | Ember spirit | STR, SPD | Bold, impulsive, intense |

### Premium Tier (Phase 2+)

| Creature | Affinities | Price | Angle |
|---|---|---|---|
| Vex | INT/DEF | $2.99 | Trickster/illusionist |
| Rune | INT/CHA | $2.99 | Scholar/ancient |
| Pip | SPD/CHA | $3.99 | Performer/acrobat |
| Aura | CHA/END | $4.99 | Healer/co-op support |
| Kael | STR/DEF | $4.99 | Warrior/fortress |

*All names are working placeholders for Beta.*

---

## 7. EVOLUTION PATHS — FREE TIER

### LUMI (8 forms total)

**Known:**
- **Luminos** — INT/SPD focus, default path (60% start probability)
- **Deep Lumi** — END/DEF, requires Cave or Deep habitat (25%)
- **Ghost Lumi** — SPD/CHA, requires CHA training + Rooftop or Void (18%)
- **Prism Lumi** — Balanced all-stats, requires Greenhouse (8%)

**Elevated:** Aurelius — INT cap + Arcane diet + Void habitat + Day 20+ (~5%)

**Secret:**
- **??? Nullform** — INT cap + Void Crystal 3× + Bond Lvl 4+ + no Farewell history
- **??? Tideform** — END+INT + diet switch mid-Juvenile + Deep habitat + Region 3 solo

### MOSS (8 forms total)

**Known:**
- **Thornmoss** — STR + Primal diet + Ruins/Meadow (55%)
- **Bloomoss** — CHA+END + Nature/Crafted + Greenhouse/Meadow (20%)
- **Ironmoss** — DEF+STR + Tempered + Cave (22%)
- **Wildbark** — SPD+END + Swift diet (15%, counterintuitive)

**Elevated:** Ancient Root — END cap + Root of Ages 3× + Old Growth + Ruins + Elder stage (~4%)

**Secret:**
- **??? Sporeform** — INT+STR + Arcane food during Juvenile only + Void + Region 3
- **??? Ashroot** — Requires Farewell history + Ash Seed inheritance + Ruins/Greenhouse

### CINDER (8 forms total)

**Known:**
- **Inferno** — STR+SPD + Primal + Ruins/Ashplains (58%)
- **Ember Knight** — STR+DEF + Tempered + Cave (22%)
- **Smoke Dancer** — SPD+CHA + Crafted/Swift + Rooftop (18%)
- **Flare** — INT+SPD + Arcane + Void/Crystal Caverns (12%, counterintuitive)

**Elevated:** Eternal Flame — STR+SPD near cap + Ancient foods + Ruins + first Co-op Boss completed (~5%)

**Secret:**
- **??? Void Flame** — INT cap + Arcane only for 7 days + Void + Bond Lvl 5
- **??? Ash Phoenix** — Requires Farewell history + Ash Seed + Region 3

### Rebirth Mechanic — The Ash Seed

Both **Ashroot** and **Ash Phoenix** require the player to have lost a previous Wild and received the Ash Seed inheritance item. These forms cannot be earned by new players. They visibly mark the trainer as someone who has experienced loss in the game.

*Full evolution details, requirements, stat results, and battle passives are in **WILDS Evolution Bible v1.0**.*

---

## 8. PvE — THE WILDS WORLD

### 8A. Battle System

Turn-based with player timing skill expression per turn.

**Per Turn:**
1. Player chooses from 3 unlocked moves (gated by stat thresholds)
2. Each move has a timing window — tap at the right moment for crit or full block
3. Enemy telegraphs next move, player responds
4. Turn resolves with species-specific animations

**Move Types:**
| Type | Stat | Effect |
|---|---|---|
| Physical Strike | STR | High damage, slow window |
| Speed Burst | SPD | Two rapid hits, tight window |
| Endure | END | Skip attack, recover HP |
| Smart Strike | INT | Reveals enemy weakness |
| Guard | DEF | Reduce damage 60% |
| Rally | CHA | Boost all stats 3 turns |

### 8B. Auto-Resolve

Available when win probability ≥95%, or manually triggered mid-battle.
- Condensed 5–8 second outcome animation
- Full coin rewards
- 85% XP (small penalty for skipping engagement)
- **Never available for boss encounters**
- Win % always shown before entry

### 8C. World Structure

| Region | Theme | Focus | Unlocks |
|---|---|---|---|
| The Meadowlands | Soft hills, warm | Tutorial, STR+SPD | Hatchling |
| The Thornwood | Dark forest | DEF+END | Juvenile |
| The Crystal Caverns | Underground glow | INT puzzles | Early Adult |
| The Ashplains | Scorched earth | STR+SPD extremes | Mid Adult |
| The Skyrift | Wind, lightning | Multi-phase bosses | Late Adult |
| The Origin | ??? | All stats, story end | Elder |

### 8D. Story — *The Quieting*

*Something is silencing the Wilds. Creatures that filled regions have disappeared — not hunted, just gone. The land they left is eerily beautiful: overgrown, still, haunted. As you move through regions, you find echoes — fragments of lost creatures embedded in the world. They're trying to tell you something. The Quieting is not random.*

Told through wordless cutscenes, short NPC dialogue, environmental storytelling, and Wild Codex entries.

---

## 9. CO-OP SOCIAL SYSTEM

### 9A. Friend Visits (All Stages)
Add by username/code. Visit habitats. Leave gifts. Earn CHA XP per visit.

### 9B. Co-op Training (Juvenile+)
Both players online → shared mini-game session → synergy meter → bonus round if high → +15–20% XP each. Species combinations unlock unique co-op animations. Builds Bond Level.

### 9C. Co-op Boss Raids (Adult+)

**Unlock Requirements:**
- Both Wilds at Adult stage
- Both cleared Region 3 (Crystal Caverns)
- Bond Level 3+ between the two Wilds

**Design:**
- 2 phases — one favors each Wild's strengths
- Players coordinate in real time (defend/attack swaps)
- Shared HP pool — succeed or fail together
- **Impossible solo** — design enforces cooperation

**Exclusive Rewards:**
- Rare evolution accelerator items
- Co-op-only accessories (permanently visible)
- "Proof of Battle" habitat monument
- Bonus stat XP
- Lore fragments from The Quieting story

### 9D. Bond Level System

| Level | Requirement | Bonus |
|---|---|---|
| 1 | Visit 3 times | +5% co-op XP |
| 2 | Train together 5 times | +10% XP, co-op emotes |
| 3 | Train together 10 times | Co-op boss access, +15% |
| 4 | First co-op boss together | Bond accessory, +20% |
| 5 | All co-op bosses | Permanent "Bonded" marker on profiles |

### 9E. Privacy Controls

| Mode | Visitors | Feed | Co-op |
|---|---|---|---|
| **Public** | Anyone | Yes | Yes |
| **Friends Only** | Friends | Friends | Yes |
| **Private** | None | No | No |

Switching to Private mid-session ends visits gracefully without notifying visitors.

### 9F. Social Feed
Friends' evolutions, milestones, Arena wins, co-op victories. Defaults to Friends Only. Tap any post to visit. Players can disable individual entries.

---

## 10. THE DEN — MULTI-PET SYSTEM

**Unlocks:** First Wild reaches Adult stage.

| Slot | Free | Premium ($4.99) |
|---|---|---|
| Featured Wilds | 1 | 1 |
| In Den | 1 | Up to 5 |

**Featured Wild rules:**
- Only Wild that does battles, co-op, social interactions
- Only Wild that progresses through life stages

**Den rules:**
- Wilds in Den have 50% needs decay
- No life stage progression while in Den
- Swap Featured/Den anytime (no cooldown)
- Never at risk of Farewell while in Den

**Why this works:** Preserves single-Wild emotional core for new players. Gives veterans parallel experimentation paths. Creates real reason to keep playing past first Adult.

---

## 11. THE WANDERING — CASUAL MODE

For busy players who don't want to be punished for life happening.

**Mechanic:** Send Wild Wandering for 1–14 days.
- All needs frozen, no decay
- No Farewell System risk
- Cannot be visited or co-op'd
- No life stage progression
- No XP or training during Wandering

**Returns with:**
- 200–500 coins (scaled to Wandering length)
- 1 random food item
- "Tale" memory token if 10+ day Wander (permanent +3 to one random stat)

**Limits:**
- 72-hour cooldown between Wanderings
- Wandering days don't count toward Refined Track
- Can't Wander during active co-op or PvE chapter

**Balance philosophy:** Active players still progress faster overall. The Wandering removes the punishment for being absent without rewarding absence over presence.

---

## 12. FAREWELL SYSTEM (Death/Restart)

After **72 hours of zero interaction**, the Wild leaves.

| Time | Event |
|---|---|
| 48 hrs | Wild shows distress, sits near door, animations quiet |
| 60 hrs | Push notification: *"[Name] is thinking about leaving... come back."* |
| 72 hrs | Hand-illustrated cutscene: Wild walks to edge, looks back once, disappears |
| Post | Memorial card generated. Inheritance item left for next Wild. |

**Carry-over:** Coins, habitats, accessories, Wild History (permanent log of all past Wilds), inheritance item.

**The Ash Seed:** Only inheritance item that unlocks specific evolution paths (Ashroot, Ash Phoenix). Unobtainable any other way.

---

## 13. ACCESSIBILITY

Three input modes available in all training mini-games, switchable mid-session:
- **Full Mechanics** — all inputs active
- **Tap Only** — accessibility mode, all inputs become taps
- **Swipe Only** — directional swipes replace tap sequences

All modes produce identical stat rewards. Performance scores tracked separately per mode for fair leaderboards.

---

## 14. CURRENCY & ECONOMY

| Currency | Earned | Spent |
|---|---|---|
| **Wilds Coins** (soft) | Care, training, battles, visits, Wandering | Food, accessories, habitat items |
| **Wilds Gems** (hard) | IAP, rare events | Premium creatures, habitats, cosmetics |

**IAP Packages:**
- Starter Pack: $1.99 — 200 Gems + Greenhouse Habitat
- Explorer Pack: $4.99 — 600 Gems + one premium creature
- Collector Pack: $9.99 — 1500 Gems + two premium creatures + accessory
- Den Expansion: $4.99 — Up to 5 Wilds in Den
- Season Pass: $4.99/season — exclusive cosmetics + bonus gems + extra daily training slot

---

## 15. MONETIZATION PHILOSOPHY

| Allowed | Forbidden |
|---|---|
| Cosmetic creature/habitat unlocks | Pay-to-win stats |
| Convenience (Den expansion, Season Pass) | Loot boxes |
| Premium creatures with unique evolution paths | Energy bypass purchases |
| Seasonal limited drops | Time-skip purchases |

The 9+ rating is preserved. Children cannot purchase irresponsibly because IAP requires parent approval at this rating tier.

---

## 16. MARKETING / VIRALITY

Five built-in viral moments designed for screenshot/clip sharing:

| Moment | Trigger | Shareable Element |
|---|---|---|
| **Evolution Reveal** | Stage transition | 5-second cinematic, screenshot prompt at peak |
| **Memorial Card** | Wild departs (Farewell) | Auto-generated card with name, lifespan, top stat |
| **Codex First-Unlock** | First global ??? unlock | Permanent Codex inscription |
| **Bond Marker** | Bond Level 5 | Visible "Bonded" mark on both profiles |
| **Day 1 vs Day 30** | Elder stage reached | Auto-generated comparison reel |

---

## 17. TECHNICAL ARCHITECTURE

### iOS (Phase 2 — Native Production)
| Layer | Technology |
|---|---|
| UI | SwiftUI |
| Game | SpriteKit (pixel art rendering) |
| Backend | Firebase (auth, RTDB, co-op sessions) |
| Storage | StoreKit 2 (iOS 15+) |
| Notifications | APNS (hunger/mood/farewell/co-op) |
| Live Activity (Phase 3) | Lock Screen / Dynamic Island |
| Widgets (Phase 3) | Home Screen |

### Web (Phase 1 — Friends Beta)
| Layer | Technology |
|---|---|
| UI | HTML/CSS/Vanilla JS or React |
| Game | PixiJS (pixel art rendering) |
| Backend | Firebase or Supabase |
| Storage | localStorage + cloud sync |
| Hosting | Vercel or Netlify (free tier) |
| Distribution | Direct URL, installable as PWA |

---

## 18. PHASE ROADMAP

### Phase 0 — Web Prototype (NEXT, 2–3 weeks)
**Goal:** Friends-testable build, core mechanics validated
- 1 creature (Lumi) with 4 known evolution paths + 1 secret hinted
- 2 habitats (Meadow, Cave)
- Needs system + 2 mini-games (STR + INT)
- Basic evolution to Juvenile stage
- Save state (localStorage)
- Pixel art assets generated via AI tools
- No co-op, no PvE, no premium content

### Phase 1 — iOS Beta (TestFlight, 6–10 weeks after Phase 0 validation)
- 3 free creatures, 2 premium
- 3 free habitats, 2 premium
- Full needs system
- 4 of 6 training disciplines, 2 mini-games each, all 3 input modes
- PvE Regions 1–2 + base story
- Auto-Resolve system
- Evolution path screen with ??? display
- Friend visits + gifts + privacy
- Basic Bond Level tracking
- The Den (up to 2 Wilds)

### Phase 2 — Social Depth
- All 6 disciplines
- Co-op Training + Co-op Boss Raids (first 2 bosses)
- Full Bond Level system
- PvE Regions 3–4
- Social feed
- Season Pass
- The Wandering (casual mode)

### Phase 3 — World Complete
- PvE Regions 5–6 + story conclusion
- All co-op bosses
- Wild History + memorial system
- Live Activity / Lock Screen creature
- Home screen widget
- Den expansion to 5 slots

---

## 19. OPEN QUESTIONS — POST-BETA

1. **Mini-game difficulty scaling** — ramp within a session or fixed per life stage?
2. **Co-op boss count at launch** — 2 or 3?
3. **Species-specific bond perks** — should Cinder + Moss have a unique synergy bonus different from Lumi + Cinder?
4. **Season Pass content design** — duration, exclusives, whether old rewards return?
5. **Failed secret evolution attempts** — silent fall-through to nearest known form, or "you were close" letter?
6. **Global first-unlock notification** — push notification to all players, or quiet Codex update?

---

*WILDS GDD v2.0 — Internal Use Only*
*All names, mechanics, and lore are working drafts for Beta.*
*Premium creature evolution paths in Evolution Bible v2.0 (pending).*
