# Vex Pixellab Pipeline — Session Notes

Generated during autonomous session, 2026-05-26.

## Files in this folder

| File | What it is |
|---|---|
| `_pixellab_test_v1.png` | First test gen (generic, baseline) |
| `_pixellab_test_v2.png` | "Trickster" prompt — alert, sharp features |
| `_pixellab_test_v3.png` | **Chibi prompt — strongest personality, locked as reference** |
| `_pixellab_test_v4.png` | "Cult of the Lamb" prompt — elegant, gradient tail |
| `_pixellab_test_v5.png` | "Silhouette" prompt — stocky, solid creature |
| `_vex_reference_LOCKED.png` | Working canonical Vex (copy of v3) |
| `_vex_locked_east.png` | East-facing rotation from locked ref |
| `_vex_locked_idle_frame[0-3].png` | 4-frame idle-breathing anim |

## Recommendation

**v3 (chibi)** read strongest at small canvas sizes. Big eyes + teal collar
make personality legible at 64×64. v2 and v4 are also viable.

## Pipeline validation results

- `generate_image_pixflux` → **works perfectly**. Cost = $0 under subscription.
- `rotate` → **works well**. East rotation kept palette + silhouette consistent.
- `animate_with_text` → **partial drift**. Frames are coherent but reinterpret
  proportions from the reference. For a tighter lock, next session try:
  - Higher `init_image_strength` (try 700+)
  - Lower `text_guidance_scale` (try 4)
  - Use `bitforge` model with style_strength 90+ instead of `pixflux`

## When the user is back

1. **Pick the winner** (v2 / v3 / v4 / v5 — they're all sitting in this folder)
2. **Generate full sheet** from the chosen reference:
   - All 8 directional idle frames (rotate at 45° increments)
   - All 8 walk-cycle directions (animate_with_text "walking", 4 frames each)
   - Action anims (happy, eating, sad, training, shower) — 4 frames each
3. **Replace `creatures.js` animation paths** to point to new files
4. **Total expected**: ~60 frames + ~5 rotations. Budget: well within
   2000 generation/month tier.

## Non-decisions (left to user)

- Whether to commit to a full Vex rebuild (irreversible — touches whole anim set)
- Which of the 4 variants is the actual Vex
- Whether to do Aura next (placeholder creature, also needs treatment)
