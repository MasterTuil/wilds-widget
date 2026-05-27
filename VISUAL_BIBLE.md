# WILDS — Visual Bible v1

> **The constitution.** Every visual decision references this doc.
> If a new sprite, color, or layout breaks a rule below, the rule wins.
> Updated only by explicit decision, never by vibes.

Reference anchors: Coromon, Cassette Beasts, Cult of the Lamb,
Stardew Valley. Pull principles, not designs.

---

## 1. CANVAS SIZES (locked)

| Use case | Size |
|---|---|
| Hero sprite (creature in widget) | **64×64** |
| Roster sprite (future creature picker) | **32×32** |
| Food / item icon | **32×32** |
| Habitat backdrop | **520×200** (full ground strip) |
| App icon | 512×512 (master), exports to 16–1024 |

No other sizes. Ever.

---

## 2. OUTLINE RULE (locked)

- **1 pixel solid outline**, never anti-aliased.
- Outline color = the character's darkest tone, tinted toward purple-black
  (`#1a1024` family). Never pure black `#000000`.
- **Selective outline only**: outer silhouette + major form breaks
  (limb separations, head/body, large features). No outline on every
  internal detail.
- No double outlines, no glow outlines, no rim lights.

---

## 3. PALETTE DISCIPLINE (locked)

### Per-character palette
- **Max 10 colors.** Counted including outline.
- Required slots:
  - 1× outline (dark, tinted, never black)
  - 2× shadow tones (cool side)
  - 2–3× base tones (the creature's color)
  - 1–2× highlight tones (warm side)
  - 1× accent (the "memorable" color — eye color, marking, tail tip)

### Launch scope (locked)
- **6 species at v1.0** (one per habitat)
- **6 habitats** — one per species, each with its own palette family
- Each species has 5 forms (see §9). Total launch sprite budget:
  6 species × 5 forms × ~30 sprites = ~900 sprites. Well within
  Pixellab tier.

### Per-habitat palette (the family rule)
Habitat picks the colorway. Creatures from a habitat share its temperature.

| Habitat | Base hue | Accent hue | Vibe |
|---|---|---|---|
| **Cave** | Deep violet `#3d2c5e` → `#9b7fd4` | Teal `#5cd4c8` | Mischievous, hidden |
| **Meadow** | Sage green `#6b8e5a` → `#b4d49b` | Coral `#ff9a8c` | Gentle, curious |
| **Shore** | Slate blue `#3a5c7c` → `#9bc4e0` | Sand gold `#f0d49b` | Calm, drifty |
| **Forest** | Pine `#2d4a3a` → `#7ba888` | Amber `#d4a85c` | Wise, watchful |
| **Storm** | Charcoal `#2a2a3e` → `#6b6b8e` | Electric blue `#5cb4f0` | Wild, alive |

(Only Cave + Meadow exist in code today. Others are reserved.)

### Background palette
- Widget UI surfaces: `#0a0818` family (existing, locked).
- In-widget habitat scene: tinted dark based on habitat.
- Marketing / portrait shots: warm cream `#f4ecd8` (matches Coromon convention).

---

## 4. CHARACTER DNA (locked)

Every WILDS creature must share these traits — this is what makes them
read as a family, not a collection.

### Proportions
- **Head-to-body ratio: 1:1 to 1.2:1.** Big-headed chibi proportions.
  No tall realistic anatomy.
- **Total height in canvas: 36–52px** within the 64×64 frame (room
  for ears, tails, accessories without clipping).
- **Stance**: feet planted, weight visible, 3/4 view facing south
  (toward camera, slightly angled).

### Face
- **Eyes**: large, oval or round, 2-color (sclera + iris+pupil combined
  block). Iris color = the character's accent color.
- **Mouth**: simple — 1–3 pixels, optional. Personality through eyes, not mouth.
- **Expression at rest**: alert and friendly, never sleepy or stupid.

### Silhouette test
- Hold the sprite up at 24×24, all black. You should still know who
  it is. If you can't, the silhouette failed and the design is rejected.

### Forbidden
- Anime-style sparkle eyes with 5+ highlight dots.
- Realistic anatomy.
- Human clothing or accessories that don't fit a creature.
- Wings unless the creature CAN fly (no decorative wings).

---

## 5. POSE LIBRARY (the sprite sheet spec)

Every creature ships with these and only these animations:

| Anim | Frames | FPS | Notes |
|---|---|---|---|
| `idle_south` | 4 | 8 | Default, breathing |
| `idle_east` | 4 | 8 | Profile, breathing |
| `idle_west` | (flip east) | — | Never re-generated, always mirrored |
| `walk_east` | 4 | 10 | Side-on walk cycle |
| `walk_west` | (flip east) | — | Mirrored |
| `walk_northeast` | 4 | 10 | 3/4 back walk |
| `walk_northwest` | (flip northeast) | — | Mirrored |
| `walk_southeast` | 4 | 10 | 3/4 forward walk |
| `walk_southwest` | (flip southeast) | — | Mirrored |
| `happy` | 4 | 6 | Bouncy, snappy |
| `eating` | 4 | 7 | Chomp + swallow |
| `sad` | 4 | 4 | Droop, slow |
| `sleeping` | 4 | 4 | Curled, breathing |
| `training` | 4 | 10 | Action burst |

**Total per creature: 9 generated sets × 4 frames = 36 unique sprites.**
West variants are flips, not regens. This is the budget.

---

## 6. HABITAT WORLD RULES

### Backdrop construction
3-layer parallax, always:
1. **Sky/back wall** — single color or soft gradient, no detail.
2. **Midground silhouettes** — Pixellab-generated, blurred 1px,
   dimmed to 70% brightness. Slow pan.
3. **Foreground props** — sharp, full color, no pan (locked to scene).

Plus:
- Ambient mote layer (already coded — dust in cave, pollen in meadow).
- Day/night color grade (whole-scene LUT shift, not just overlay).

### Ground line
- Always at `y ≈ 0.88` in canvas. Creatures stand on this line.
- Subtle ground texture (existing scanline + grain stays).

---

## 7. UI / TYPOGRAPHY (locked, already in code)

- **Font**: IBM Plex Mono, weights 400/500/600/700, tabular figures on.
- **Accent**: per-habitat primary (drives chrome glow, panel borders, buttons).
- **Surfaces**: `rgba(10, 8, 24, 0.55–0.88)` glass with `backdrop-filter: blur(6–12px)`.
- **Grain overlay**: 6% opacity SVG noise, fixed, full-widget. Already shipped.
- **No emojis anywhere.** Use inline SVG glyphs or pixel-art sprites only.

---

## 8. THE BITFORGE WORKFLOW (Pixellab discipline)

To enforce the bible across all generations:

1. **Generate one "anchor" character** (Vex final) with Pixellab Pixflux,
   iterate until it nails every rule above.
2. **Save anchor as the locked style reference.**
3. **All future creatures use Pixellab Bitforge** with the anchor as
   `style_image_path`, `style_strength: 85+`. This forces palette
   discipline, outline rule, proportion match.
4. **Rotations**: use `rotate` tool, never re-generate.
5. **Animations**: use `animate_with_text` with `init_image_strength: 700+`
   to prevent drift.
6. **Reject any output that fails the silhouette test** (rule 4).

---

## 9. EVOLUTION MODEL (locked)

**5 forms per species. Hard cap. (1 optional secret 6th form reserved.)**

- **Stage 1** — base form (what you start with)
- **Stage 2** — mid evolution (triggered by time + bond + needs balance)
- **Stage 3 — Default** — triggered when no dominant food category emerged
- **Stage 3 — Food-dominant** — when one food category dominated feeding window
- **Stage 3 — Food + Training combo** — dominant food + training-stat threshold

**Optional secret 6th form**: very hard to unlock (specific condition combos).
This is the "perk" tier — premium feeling for committed players, future
monetization candidate. **Not built day-one. Reserved.**

The default form is intentionally the "you didn't optimize" path — still
desirable, looks like the base species' truest form. The food and combo
variants reward intentional play.

### Asset budget per species
- 5 forms × ~30 sprite animations each = ~150 sprites
- Well within 2000/month Pixellab tier
- Each form derives from the previous via Bitforge with strong style
  reference — silhouette evolves but family DNA holds

### Why 3 finals, not 7
Earlier brainstorm allowed 7 forms. **Rejected.** 5 forms is the cap.
Anything more dilutes the moment of evolution. Tamagotchi got mileage from
2 stages. Pokémon overused branching. WILDS hits the sweet spot.

---

## 10. WHAT WE EXPLICITLY DO NOT DO

- No Pokémon-style typing/elemental affinity wars. WILDS is a *companion*
  product, not a battler. Affinities exist in data for training stat
  scaling, not for combat against other creatures.
- No evolution by stat-grinding alone — evolutions are *story* moments,
  triggered by interaction patterns + time + needs balance.
- No purchasing through gambling/loot mechanics. Direct unlock only.
- No competitive multiplayer. WILDS is calm, slow, personal.

---

## 11. DECISIONS STILL OPEN (need user lock-in)

These are NOT locked yet. Mark with date when decided.

- [ ] **Anchor character**: is Vex v3 (`_pixellab_test_v3.png`) the
      final anchor, or do we generate a new one *from this bible*?
      Strong case for the latter — v3 was generated before the rules.
- [ ] **Number of starter creatures at v1.0**: 3 or 5?
- [ ] **Habitat order to ship**: Cave (done), Meadow (placeholder),
      then what?
- [ ] **Monetization model**: 1 free creature + paid unlocks?
      Or all free + paid cosmetics (hats, habitat skins)?
- [ ] **Creature name convention**: real-sounding (Vex, Pip, Bolt) vs
      coined (Mewtwo-style)?

---

*Document version: v1, drafted by Claude based on Coromon-class reference
images and the existing WILDS brief. To revise, mark sections explicitly
with a strikethrough + new decision + date.*
