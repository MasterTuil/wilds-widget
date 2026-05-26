# WILDS — v2.1 Addendum
### Final MVP-Lock Decisions | Confidential
*Read alongside GDD v2.0, Build Plan v1.0, and v2.1 Patch Notes.*

---

## A. THE SHIMMER SYSTEM (NEW)

### Concept

A rare visual variant that can appear on any Wild. Pure cosmetic — never affects stats, training, evolution probabilities, or battle outcomes. Protects the F2P "Fair" pillar absolutely.

### The Three Tiers

| Rarity | Base Odds | What Changes |
|---|---|---|
| **Bright** | 1 in 200 hatches | Saturated palette shift, gentle idle sparkle |
| **Lucent** | 1 in 1,000 hatches | Color inversion or alternate palette, light trails on movement, distinct ambient chime |
| **Mythbright** | 1 in 10,000 hatches | Custom-designed palette unique per creature, particle aura, custom ambient music track |

### Mythbright as Hand-Designed Content

Mythbright is not algorithmic — each one is a deliberate artistic concept per creature:

- *Glassmask Vex* — translucent body, mask appears to be made of cracked stained glass
- *Dawnveil Aura* — soft gold-into-pink gradient body, antlers wrapped in faint sunrise glow

Future Mythbright concepts created per creature on launch and per seasonal expansion. The first global owner of any Mythbright is permanently inscribed in the Codex with their trainer name.

### Discovery & Influence Mechanics

- Hatch shimmer chance is the base rate per the table above
- Login streak at 30+ days subtly boosts next hatch's shimmer odds (not advertised in UI; players discover via testing and lore)
- Echo Battles can drop **Shimmerstones** — stack 100 to apply Bright to an existing Wild (one-time per Wild)
- Lucent and Mythbright are hatch-only — cannot be applied to existing Wilds
- Shimmer status is visible everywhere: profile, co-op sessions, friend visits, social feed, leaderboards

### Why This Mechanic Fits WILDS

The Shimmer system serves the modern-nostalgia core gameplay independent of all other systems. A player who never enters the Arena, never co-ops, never battles — just raises their Wild as a phone companion — still has a collector hook. This protects the casual audience and creates organic viral moments that don't require players to engage with deeper systems.

The phrase that gets posted to social media is already written: *"my Aura hatched Mythbright."*

### MVP Status

Shimmer is **IN for MVP** at the Bright tier only. Bright variants for Vex and Aura ship at launch. Lucent and Mythbright unlock in Phase 1 with the full Codex system.

---

## B. THE PAUSE — CUT FROM MVP

### Decision

The Pause feature is removed from MVP entirely. No UI tease, no placeholder button, no preview. The full system ships in Phase 1.

### Reasoning

A non-functional UI element is a bug, not a tease. Showing players a prompt they can't interact with creates frustration, not intrigue. When the Pause launches in Phase 1, players who didn't see it before will discover it organically as a true new feature.

---

## C. FAREWELL SYSTEM IN MVP — PARTIAL

### What's IN

- Needs decay all the way to zero (no floor)
- Visible distress animations as needs critically low
- 48-hour mark: Wild's idle animation shifts to "sad" state (sits near door, quiet posture)
- In-app banner notification when needs hit critical zone (since web PWA push is unreliable)

### What's OUT

- No 72-hour permanent departure
- No cinematic farewell
- No memorial card
- No Ash Seed inheritance mechanic
- Friends cannot lose their save during testing

### Why

Friends need to feel the *pressure* of caring for the Wild without risking their save state during the testing period. The emotional weight is conveyed through distress animations and notifications. Full Farewell ships in Phase 1 once we have iOS push notifications and stable testing.

---

## D. SAVE SHARING — IN FOR MVP

### Implementation

Save state compressed (gzip), base64 encoded, appended to a sharable URL. One function call, persistent value.

### Use Cases

- Friends share build progress: "look at my Vex" sent as a link
- Bug reporting: friends paste their save URL into a message for instant reproduction
- Backup: players can save their own state externally if they're worried about browser data clearing

### Privacy

URLs only contain the receiving player's local game state. No account information, no friends list, no server data. Sharing a save URL means sharing a "snapshot" — receiver opens the link in incognito mode or new browser to view without overwriting their own save.

---

## E. UPDATED MVP SCOPE — FINAL

### IN

| System | Scope |
|---|---|
| **Creatures** | Vex + Aura (Hatchling + Juvenile sprite sets) |
| **Habitats** | The Meadow + The Cave |
| **Needs system** | Hunger, Mood, Energy, Hygiene |
| **Real-time decay** | Needs decay even when app closed |
| **Mini-game mechanic** | Hold-and-release, reskinned per discipline |
| **Disciplines** | One INT-flavored, one DEF-flavored |
| **Food system** | 6–8 food items across 3 categories |
| **Training cap** | 4-hour cooldown enforced |
| **Hatchling → Juvenile** | Full evolution stage with cinematic |
| **Evolution Path Screen** | Live probability for 3 known + 1 ??? per creature |
| **Save state** | localStorage + URL-based save sharing |
| **Shimmer system (Bright tier)** | 1-in-200 hatch chance for both creatures |
| **Distress animations** | 48-hour critical needs trigger sad state |
| **Pixel art** | Full Vex + Aura sprite sets, both habitats |
| **Music** | 2 tracks (Meadow, Cave ambient) |
| **Sound effects** | 8–10 essential SFX |

### OUT (Phase 1+)

- All other creatures (Lumi returns Phase 1)
- All other habitats
- PvE Arena and Echo Battles
- Adult evolution stage
- Co-op anything (including bonded forms)
- The Den, The Wandering
- Premium IAP
- Push notifications (web limitations)
- Wilder's Letter
- Full Codex
- Trainer's Quests
- The Pause feature
- Full Farewell System
- Lucent and Mythbright Shimmer tiers

---

## F. BUILD ORDER (3-WEEK TIMELINE)

### Week 1 — Assets + Foundation
- Days 1–2: Generate Vex + Aura sprite sets via Pixellab.ai (Hatchling + Juvenile, idle + reaction + training animations)
- Days 3–4: Generate Meadow + Cave habitat backgrounds with parallax layers
- Days 5–7: Build web app shell (state management, save system, needs decay loop, time-of-day logic)

### Week 2 — Core Loop
- Days 8–9: Implement feeding, food categories, mood/hygiene, training cap
- Days 10–11: Build hold-and-release mini-game with two skin variants
- Days 12–14: Build evolution tracking, Evolution Path Screen, stage-up cinematic, Shimmer hatch logic

### Week 3 — Polish + Ship
- Days 15–17: Sound integration, distress animation polish, save sharing
- Days 18–21: Deploy to Vercel, send link to friends

---

*WILDS v2.1 Addendum — Internal Use Only*
*MVP scope is now LOCKED. Production begins next message.*
