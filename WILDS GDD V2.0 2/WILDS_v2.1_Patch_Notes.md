# WILDS — v2.1 Patch Notes
### Decisions locked since GDD v2.0 | Confidential
*Read this alongside GDD v2.0 and Build Plan v1.0. These supersede where conflicting.*

---

## 1. F2P GRIND PHILOSOPHY — NEW CORE PILLAR

**Principle:** Every reward is achievable through play. Premium pricing buys speed, never exclusivity.

This becomes the sixth design pillar:

| Pillar | Meaning |
|---|---|
| Alive | The Wild reacts, breathes, remembers |
| Intentional | Every choice shapes the Wild |
| Rewarding | Investment is always returned |
| Together | Best content is shared |
| Beautiful | Pixel-perfect, wallpaper-worthy |
| **Fair** *(new)* | **Free players can earn anything paid players buy** |

### Implementation

| Premium Item | Cash Price | Gem Price | F2P Time Estimate |
|---|---|---|---|
| Premium habitat (e.g. Greenhouse) | $1.99 | ~200 Gems | 3–4 weeks |
| Premium habitat (e.g. The Deep) | $2.99 | ~300 Gems | 4–6 weeks |
| Premium habitat (e.g. The Void) | $3.99 | ~400 Gems | 6–8 weeks |
| Premium creature | $4.99 | ~600 Gems | 8–10 weeks |

### Wilds Gem Earning Sources (F2P Path)

- Region completion: 50–100 Gems per region
- Daily login streak: 5 Gems baseline, doubles every 7 days, caps at 20
- Codex milestones: 25–100 Gems per Codex tier filled
- Achievement chains: 10–50 Gems per chain completed
- Season Pass free track: ~150 Gems per season + cosmetics
- First-time Echo Battle clears: 5–10 Gems each

### Trainer's Quests (NEW SYSTEM)

Multi-week questlines that grant a free premium creature on completion. Provides a non-currency F2P path to creature unlocks.

- One active Trainer's Quest at a time
- Each quest takes 2–4 weeks of regular play to complete
- Tasks include: clearing regions with a specific Wild, raising a creature to Adult, completing co-op activities, evolving into a specific path
- Reward: one specific premium creature of the player's choosing from the quest's available pool
- Cooldown: 7 days between quests (prevents back-to-back grinding)

---

## 2. MVP CREATURE PIVOT — VEX + AURA

**Lumi removed from MVP. Vex and Aura become the launch creatures.** Lumi remains in the Free Tier roadmap for Phase 1 with strengthened evolution paths.

### Why
A blob doesn't sell first impressions. Vex (trickster-illusionist) and Aura (nurturer-healer) have immediate visual personality and offer two distinct play fantasies on first launch. The pick-one-or-the-other moment becomes the onboarding hook.

### MVP Scope Adjustments to Absorb Doubled Work

| What Was | What Is Now |
|---|---|
| 2 mini-games (Boulder Lift + Puzzle Solve) | 1 mini-game mechanic, reskinned per discipline (Boulder Lift → Aura's Garden Tend, Vex's Mask Carve, etc.) |
| 4 known evolution paths per creature | 3 known paths per creature for MVP (4th unlocks Phase 1) |
| Hatchling → Juvenile → Adult full path | Hatchling → Juvenile only at MVP (Adult evolution Phase 1) |
| Full Pause system | Pause shown as teased UI element only at MVP |

Net result: roughly equivalent build effort to the original Lumi-only scope, with two creatures instead of one.

---

## 3. VEX — EVOLUTION SKETCH

**Type:** Mask-faced trickster · Fox/owl hybrid silhouette
**Affinities:** INT, DEF
**Personality:** Clever, mischievous, observes before acting
**Lore:** Vex's mask isn't worn. It grew there. Trainers say the creature beneath has never been seen, even by them.

**Natural affinity bonus:** +15% INT and DEF training XP

### Known Adult Forms

| Form | Trigger | Stat Result | Battle Passive |
|---|---|---|---|
| **Sage** (default, ~58%) | INT dominant + Arcane diet + any habitat | INT+++ DEF++ SPD+ | *Foresight* — once per battle, see and counter the enemy's next move |
| **Ironveil** (~22%) | DEF + Tempered diet + Cave | DEF+++ INT++ STR+ | *Mystic Wall* — first attack against Vex per battle deals 0 damage |
| **Showmaster** (~18%) | CHA + Crafted diet + Rooftop | CHA+++ INT++ DEF— | *Misdirection* — once per battle, force enemy to attack the wrong target |

### Elevated

**Loom** — *"Names patterns the universe forgot."*
- INT cap + The Void habitat + Ancient food fed 2× + Day 20+
- INT++++ DEF+++ unique
- *Threadweaver* — at battle start, all enemy attacks for the entire fight have their accuracy reduced 20%

### Secret

**??? "Unmasked"** — *"What was hidden, has nothing left to hide."*
- STR dominant (counter-intuitive — Vex has no STR affinity)
- Primal diet exclusively for 5 consecutive days during Juvenile
- Ruins habitat
- INT++ STR++++ DEF—
- *True Form* — all stat-disguising effects fail. All Vex's attacks always crit.
- *Visual:* The mask is gone. The creature beneath is something raw, animal, and quietly devastating.

### Bonded Form (Co-op Specific) — see §6

---

## 4. AURA — EVOLUTION SKETCH

**Type:** Antlered nurturer · Deer/bird hybrid silhouette
**Affinities:** CHA, END
**Personality:** Gentle, protective, ancient warmth
**Lore:** Aura's species was once thought extinct. They reappeared in regions where The Quieting was strongest. They were healing the world before anyone asked.

**Natural affinity bonus:** +15% CHA and END training XP

### Known Adult Forms

| Form | Trigger | Stat Result | Battle Passive |
|---|---|---|---|
| **Tender** (default, ~55%) | CHA dominant + Crafted diet + Greenhouse | CHA+++ END++ INT+ | *Restore* — heal 10% HP per turn for self or co-op partner |
| **Verdant** (~25%) | END + Nature diet + Greenhouse/Meadow | END+++ CHA++ DEF+ | *Grove* — all allies (including co-op partner) gain +15% to all stats |
| **Oracle** (~20%) | INT + Arcane diet + Cave | INT+++ CHA++ END+ | *Vision* — at start of each turn, preview enemy's stat changes for the next 2 turns |

### Elevated

**Communion** — *"The forest itself remembers her name."*
- CHA at cap + Bond Level 5 with any friend + Ancient food fed 2×
- CHA++++ END+++ unique
- *Sanctuary* — full HP heal for self AND co-op partner once per battle, plus immunity to all debuffs for 3 turns

### Secret

**??? "Sentinel"** — *"She decided no one else would carry it."*
- STR dominant (counter-intuitive)
- Tempered diet exclusively for 7 consecutive days
- Ruins habitat
- Cleared Region 3 solo (no co-op assistance)
- STR++++ END+++ CHA—
- *Last Stand* — when at 1 HP, all damage dealt is multiplied by 3 for the rest of the battle
- *Visual:* Antlers grown into something warlike. Body scarred, alert, magnificent. The healer who chose to fight so others didn't have to.

### Bonded Form (Co-op Specific) — see §6

---

## 5. ECHO BATTLES — THE ARENA ECONOMY

**Mechanic:** After clearing a region's story battles, repeatable "Echo" versions of those battles unlock. Same enemies, randomized loot pools, region-themed rare drops.

### Drop Tables by Region

| Region | Common Drops | Rare Drops | Legendary Drops |
|---|---|---|---|
| Meadowlands | Forest Berries, Wild Jerky | Mossweed Stew | — |
| Thornwood | Iron Root, Wild Jerky | Fortress Leaf, Stoneback Broth | — |
| Crystal Caverns | Glowshrooms, Stardust Pellets | **Void Crystal** (Arcane) | — |
| Ashplains | Raw Haunch, Wild Jerky | Apex Cut | **Ancient Bone Marrow** |
| Skyrift | Sunseeds, Wind Nectar | Storm Kernel | **Skyrift Fruit** |
| The Origin | All categories | All categories | **First Light**, season exclusives |

### Why This Works

- Auto-Resolve makes grinding non-tedious (10 Echo Battles in a coffee break)
- F2P players have a clear repeatable loop to grind for evolution items
- Premium players who skip with gems still want to play the Arena for the actual battles
- Each region drops items thematically tied to its evolutions (Crystal Caverns gives you what you need for Arcane-path forms, etc.)
- The Origin (final region) drops everything but gates this with significant story progression

### Drop Rate Targets

- Common rare items: 1-in-5 Echo Battle clears
- Rare items: 1-in-15 to 1-in-25 clears
- Legendary items: 1-in-50 to 1-in-100 clears
- Modifier: Daily first 3 Echo Battles per region get +50% drop rate (rewards return play, doesn't punish grind sessions)

---

## 6. SPECIES-BOND EVOLUTIONS — NEW MECHANIC

**Concept:** Some secret evolution forms are *only* obtainable through a specific co-op bond with a specific other species. These cannot be earned in solo play. They mark friendships.

### Why This Matters

- Friends actively recruit each other to play specific creatures ("pick Vex, I want us both to unlock our bonded forms")
- Codex tracks bonded form completion as its own achievement category
- The visible marker on these forms makes them shareable status
- Creates real reasons to coordinate species choices in friend groups
- Adds genuine lore relationships between species

### Beta Bonded Forms (Vex + Aura)

These two are MVP creatures — their bonded forms are the system's launch demonstration.

#### VEX bonded with AURA → "Revelation"
*The illusionist who finally trusted someone enough to drop the mask.*

**Requirements:**
- Vex evolved to any Adult form
- Bonded friend has an Aura at any Adult form
- Bond Level 5 between the two Wilds
- Both Wilds present in shared co-op session at the moment of evolution trigger

**Stat Result:** INT++++ CHA++++ DEF+
**Battle Passive:** *Truthful Strike* — all attacks bypass enemy DEF entirely. Cannot be blocked, dodged, or reduced.
**Visual:** The mask is removed and held in Vex's paws like a relic. Eyes, finally visible, glow soft gold. Solemn and beautiful.

#### AURA bonded with VEX → "Veil"
*The nurturer who learned that some protection requires concealment.*

**Requirements:**
- Aura evolved to any Adult form
- Bonded friend has a Vex at any Adult form
- Bond Level 5 between the two Wilds
- Both Wilds present in shared co-op session at the moment of evolution trigger

**Stat Result:** CHA++++ INT+++ END++
**Battle Passive:** *Hidden Healing* — Aura is invisible to enemy targeting for the first 2 turns of every battle. Healing during this period restores 50% extra HP.
**Visual:** Antlers wrapped in shadow-silk patterns. Body partially concealed in soft mist. The protector who became unseen so others would be safe.

### Future Bonded Pairs (Phase 1+ Roadmap)

| Pair | Theme | To Be Designed |
|---|---|---|
| Cinder + Moss | Fire & growth | Cinder: "Wildfire" / Moss: "Phoenix Bloom" |
| Lumi + Vex | Light & shadow | Lumi: "Mirage" / Vex: "Beacon" |
| Cinder + Aura | Warrior & healer | Cinder: "Guardian Flame" / Aura: "Forge Mother" |
| Moss + Aura | Two nurturers | Both: shared garden form |

Bonded forms for premium creatures (Pip, Rune, Kael) designed in Phase 2.

---

## 7. OPEN QUESTIONS — RESOLVED

| Question | Decision |
|---|---|
| Mini-game difficulty scaling | **Ramps per life stage** (gentler at Hatchling, harder at Elder) |
| Co-op boss launch count | **2 bosses at launch** for testing, expand based on data |
| Species-specific bond perks | **Yes — bonded forms** (see §6) plus unique co-op animations and Codex lore fragments per pair |
| Season Pass | **Seasonal cadence (~3 months)** with free + premium tracks, mixed rewards (cosmetics, gems, Trainer's Quest tokens, exclusive accessories) |
| Failed secret evolution | **"You Were Close" letter** sent within 24 hours of evolution, gives the cryptic hint of what was missing without naming the form |
| Global Codex first-unlock | **Push notification to all players** + permanent Codex inscription with the player's name |

---

## 8. STORY TONE PRINCIPLE — REINFORCED

The "Warmth with Weight" principle from GDD v2.0 deserves a specific application note for the bonded forms system:

The two bonded forms above (Revelation and Veil) are emotionally inverse. Both depict creatures who *changed who they were* because of who they bonded with. This is the kind of design moment where the 30s audience feels something real — quiet questions about whether we become different versions of ourselves around the people we love. The 9–15 audience just sees a cool secret form unlocked through teamwork. Both layers serve the design.

This principle should guide all bonded form design: **the bonded form should depict a transformation that feels emotionally true about the bond between species**, not just a stat-power-up.

---

## 9. UPDATED MVP SCOPE — WHAT FRIENDS WILL PLAY

### IN

| Feature | Scope |
|---|---|
| **2 creatures** | Vex + Aura |
| **2 habitats** | The Meadow + The Cave |
| **Needs system** | Hunger, Mood, Energy, Hygiene |
| **Real-time decay** | Needs decay even when app closed |
| **1 mini-game mechanic** | Hold-and-release, reskinned per discipline |
| **2 disciplines** | One INT-flavored, one DEF-flavored (matching Vex/Aura affinities) |
| **Food system** | 6–8 food items across 3 categories |
| **Training cap** | 4-hour cooldown enforced |
| **Hatchling → Juvenile** | Full evolution stage with cinematic |
| **Evolution Path Screen** | Live probability display showing 3 known + 1 ??? per creature |
| **Pause UI tease** | Visible but not yet functional |
| **Save state** | localStorage + URL backup |
| **Pixel art** | Full sprite sets for Vex + Aura at Hatchling and Juvenile, both habitats |
| **Music** | 2 tracks (Meadow, Cave ambient) |
| **Sound effects** | 8–10 essential SFX |

### OUT (Phase 1+)

- All other creatures (Lumi returns Phase 1 with strengthened paths)
- All other habitats
- PvE Arena and Echo Battles
- Adult evolution stage
- Co-op anything (including bonded forms)
- The Den, The Wandering
- Premium IAP (no monetization in MVP)
- Push notifications
- Wilder's Letter
- Full Codex
- Trainer's Quests
- Farewell System (still considering for MVP if time allows — high emotional value)

---

## 10. WHAT THIS DOES NOT CHANGE

Everything else from GDD v2.0 stands. This patch only adjusts:
- The MVP creature roster (Lumi → Vex + Aura)
- The F2P philosophy (now elevated to a pillar)
- The Arena economy (Echo Battles formalized)
- Bonded forms (new mechanic)
- The six open questions (now resolved)

All other systems — needs, training, food categories, habitats, life stages, Bond Level mechanics, Co-op Boss design, accessibility, monetization caps, marketing principles, technical architecture — remain as defined in v2.0.

---

*WILDS v2.1 Patch Notes — Internal Use Only*
*Read alongside WILDS GDD v2.0 and WILDS Build Plan v1.0*
