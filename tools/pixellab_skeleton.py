#!/usr/bin/env python3
"""
Pixellab skeleton-animation helper.

Bypasses the broken MCP wrapper that mangled validation errors and
exposed the wrong field names. Calls the v1 REST endpoint directly
with the correct `skeleton_keypoints` array<array> structure.

Usage:
    python3 tools/pixellab_skeleton.py walk south web/assets/_v2/meadow/ANCHOR_LOCKED_south.png

Outputs frames as <stem>_frame{0..N}.png next to the input.
"""
import base64
import json
import os
import sys
import urllib.request
import urllib.error

API = "https://api.pixellab.ai/v1/animate-with-skeleton"
TOKEN = os.environ.get("PIXELLAB_TOKEN") or "45a89bb4-9b6e-4110-9755-943a59b453f5"

# KEYFRAME LIBRARY
# ----------------
# Each animation = 3 keyframes (server interpolates to smooth).
# Coordinates normalized 0-1 within the sprite frame.
# Re-use these across creatures by swapping only the reference image.

# Walk: contact / passing / contact (mirror).
WALK_CYCLE = [
    # Frame 0 — right-foot-forward contact
    [
        {"label": "NOSE", "x": 0.44, "y": 0.54},
        {"label": "NECK", "x": 0.49, "y": 0.65},
        {"label": "LEFT HIP",   "x": 0.55, "y": 0.78},
        {"label": "RIGHT HIP",  "x": 0.42, "y": 0.77},
        {"label": "LEFT KNEE",  "x": 0.56, "y": 0.82},
        {"label": "RIGHT KNEE", "x": 0.41, "y": 0.78},
        {"label": "LEFT LEG",   "x": 0.57, "y": 0.86},
        {"label": "RIGHT LEG",  "x": 0.42, "y": 0.80},
    ],
    # Frame 1 — passing pose (legs together, body slightly lifted)
    [
        {"label": "NOSE", "x": 0.44, "y": 0.53},
        {"label": "NECK", "x": 0.49, "y": 0.64},
        {"label": "LEFT HIP",   "x": 0.51, "y": 0.77},
        {"label": "RIGHT HIP",  "x": 0.46, "y": 0.77},
        {"label": "LEFT KNEE",  "x": 0.50, "y": 0.81},
        {"label": "RIGHT KNEE", "x": 0.48, "y": 0.81},
        {"label": "LEFT LEG",   "x": 0.50, "y": 0.83},
        {"label": "RIGHT LEG",  "x": 0.48, "y": 0.83},
    ],
    # Frame 2 — left-foot-forward contact
    [
        {"label": "NOSE", "x": 0.44, "y": 0.54},
        {"label": "NECK", "x": 0.49, "y": 0.65},
        {"label": "LEFT HIP",   "x": 0.55, "y": 0.77},
        {"label": "RIGHT HIP",  "x": 0.42, "y": 0.78},
        {"label": "LEFT KNEE",  "x": 0.56, "y": 0.78},
        {"label": "RIGHT KNEE", "x": 0.41, "y": 0.82},
        {"label": "LEFT LEG",   "x": 0.57, "y": 0.80},
        {"label": "RIGHT LEG",  "x": 0.42, "y": 0.86},
    ],
]


def animate(reference_path: str, direction: str, view: str = "side",
            size: int = 64, out_stem: str | None = None) -> list[str]:
    """Run skeleton walk animation against a reference image. Returns saved paths."""
    with open(reference_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")

    payload = {
        "image_size": {"width": size, "height": size},
        "reference_image": {"type": "base64", "base64": b64},
        "view": view,
        "direction": direction,
        "skeleton_keypoints": WALK_CYCLE,
    }

    req = urllib.request.Request(
        API,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            data = json.load(r)
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode("utf-8", "replace"), file=sys.stderr)
        sys.exit(1)

    if "detail" in data:
        print("API error:", json.dumps(data["detail"], indent=2), file=sys.stderr)
        sys.exit(1)

    out_dir = os.path.dirname(reference_path)
    stem = out_stem or f"SKEL_walk_{direction.replace('-', '')}"
    saved = []
    for i, im in enumerate(data.get("images", [])):
        b = im.get("base64") if isinstance(im, dict) else im
        if not b:
            continue
        p = os.path.join(out_dir, f"{stem}_frame{i}.png")
        with open(p, "wb") as f:
            f.write(base64.b64decode(b))
        saved.append(p)
        print(f"  saved {p}")

    cost = data.get("usage", {}).get("usd", 0)
    print(f"  cost: ${cost}")
    return saved


# Eating: lean forward / chomp down / lift head back. South-facing.
EATING_CYCLE = [
    [
        {"label": "NOSE", "x": 0.49, "y": 0.55},
        {"label": "NECK", "x": 0.49, "y": 0.66},
        {"label": "LEFT HIP",   "x": 0.55, "y": 0.78}, {"label": "RIGHT HIP",  "x": 0.42, "y": 0.78},
        {"label": "LEFT KNEE",  "x": 0.55, "y": 0.83}, {"label": "RIGHT KNEE", "x": 0.42, "y": 0.83},
        {"label": "LEFT LEG",   "x": 0.55, "y": 0.87}, {"label": "RIGHT LEG",  "x": 0.42, "y": 0.87},
    ],
    [   # chomp down — head dips
        {"label": "NOSE", "x": 0.49, "y": 0.62},
        {"label": "NECK", "x": 0.49, "y": 0.70},
        {"label": "LEFT HIP",   "x": 0.55, "y": 0.79}, {"label": "RIGHT HIP",  "x": 0.42, "y": 0.79},
        {"label": "LEFT KNEE",  "x": 0.55, "y": 0.83}, {"label": "RIGHT KNEE", "x": 0.42, "y": 0.83},
        {"label": "LEFT LEG",   "x": 0.55, "y": 0.87}, {"label": "RIGHT LEG",  "x": 0.42, "y": 0.87},
    ],
    [   # lift back up — slight overshoot
        {"label": "NOSE", "x": 0.49, "y": 0.51},
        {"label": "NECK", "x": 0.49, "y": 0.63},
        {"label": "LEFT HIP",   "x": 0.55, "y": 0.78}, {"label": "RIGHT HIP",  "x": 0.42, "y": 0.78},
        {"label": "LEFT KNEE",  "x": 0.55, "y": 0.83}, {"label": "RIGHT KNEE", "x": 0.42, "y": 0.83},
        {"label": "LEFT LEG",   "x": 0.55, "y": 0.87}, {"label": "RIGHT LEG",  "x": 0.42, "y": 0.87},
    ],
]

# Sad: progressive head droop. South-facing.
SAD_CYCLE = [
    [
        {"label": "NOSE", "x": 0.49, "y": 0.58},
        {"label": "NECK", "x": 0.49, "y": 0.67},
        {"label": "LEFT HIP",   "x": 0.54, "y": 0.79}, {"label": "RIGHT HIP",  "x": 0.43, "y": 0.79},
        {"label": "LEFT KNEE",  "x": 0.54, "y": 0.84}, {"label": "RIGHT KNEE", "x": 0.43, "y": 0.84},
        {"label": "LEFT LEG",   "x": 0.54, "y": 0.88}, {"label": "RIGHT LEG",  "x": 0.43, "y": 0.88},
    ],
    [   # deeper droop
        {"label": "NOSE", "x": 0.49, "y": 0.64},
        {"label": "NECK", "x": 0.49, "y": 0.71},
        {"label": "LEFT HIP",   "x": 0.54, "y": 0.80}, {"label": "RIGHT HIP",  "x": 0.43, "y": 0.80},
        {"label": "LEFT KNEE",  "x": 0.54, "y": 0.84}, {"label": "RIGHT KNEE", "x": 0.43, "y": 0.84},
        {"label": "LEFT LEG",   "x": 0.54, "y": 0.88}, {"label": "RIGHT LEG",  "x": 0.43, "y": 0.88},
    ],
    [   # tiny recovery (breathing)
        {"label": "NOSE", "x": 0.49, "y": 0.61},
        {"label": "NECK", "x": 0.49, "y": 0.69},
        {"label": "LEFT HIP",   "x": 0.54, "y": 0.79}, {"label": "RIGHT HIP",  "x": 0.43, "y": 0.79},
        {"label": "LEFT KNEE",  "x": 0.54, "y": 0.84}, {"label": "RIGHT KNEE", "x": 0.43, "y": 0.84},
        {"label": "LEFT LEG",   "x": 0.54, "y": 0.88}, {"label": "RIGHT LEG",  "x": 0.43, "y": 0.88},
    ],
]

# Sleeping: curled, slight breath rise. South-facing, body low.
SLEEP_CYCLE = [
    [
        {"label": "NOSE", "x": 0.50, "y": 0.78},
        {"label": "NECK", "x": 0.50, "y": 0.82},
        {"label": "LEFT HIP",   "x": 0.55, "y": 0.85}, {"label": "RIGHT HIP",  "x": 0.45, "y": 0.85},
        {"label": "LEFT KNEE",  "x": 0.58, "y": 0.88}, {"label": "RIGHT KNEE", "x": 0.42, "y": 0.88},
        {"label": "LEFT LEG",   "x": 0.60, "y": 0.90}, {"label": "RIGHT LEG",  "x": 0.40, "y": 0.90},
    ],
    [   # breath in — slight rise
        {"label": "NOSE", "x": 0.50, "y": 0.76},
        {"label": "NECK", "x": 0.50, "y": 0.80},
        {"label": "LEFT HIP",   "x": 0.55, "y": 0.84}, {"label": "RIGHT HIP",  "x": 0.45, "y": 0.84},
        {"label": "LEFT KNEE",  "x": 0.58, "y": 0.88}, {"label": "RIGHT KNEE", "x": 0.42, "y": 0.88},
        {"label": "LEFT LEG",   "x": 0.60, "y": 0.90}, {"label": "RIGHT LEG",  "x": 0.40, "y": 0.90},
    ],
    [   # exhale — settle back
        {"label": "NOSE", "x": 0.50, "y": 0.78},
        {"label": "NECK", "x": 0.50, "y": 0.82},
        {"label": "LEFT HIP",   "x": 0.55, "y": 0.85}, {"label": "RIGHT HIP",  "x": 0.45, "y": 0.85},
        {"label": "LEFT KNEE",  "x": 0.58, "y": 0.88}, {"label": "RIGHT KNEE", "x": 0.42, "y": 0.88},
        {"label": "LEFT LEG",   "x": 0.60, "y": 0.90}, {"label": "RIGHT LEG",  "x": 0.40, "y": 0.90},
    ],
]

# Training: ready stance / strike / recovery. South-facing, arms engaged.
TRAINING_CYCLE = [
    [   # ready, slight crouch
        {"label": "NOSE", "x": 0.49, "y": 0.56},
        {"label": "NECK", "x": 0.49, "y": 0.66},
        {"label": "LEFT HIP",   "x": 0.55, "y": 0.79}, {"label": "RIGHT HIP",  "x": 0.42, "y": 0.79},
        {"label": "LEFT KNEE",  "x": 0.57, "y": 0.83}, {"label": "RIGHT KNEE", "x": 0.40, "y": 0.83},
        {"label": "LEFT LEG",   "x": 0.58, "y": 0.87}, {"label": "RIGHT LEG",  "x": 0.39, "y": 0.87},
    ],
    [   # strike / extend — body forward
        {"label": "NOSE", "x": 0.49, "y": 0.50},
        {"label": "NECK", "x": 0.49, "y": 0.61},
        {"label": "LEFT HIP",   "x": 0.53, "y": 0.77}, {"label": "RIGHT HIP",  "x": 0.44, "y": 0.77},
        {"label": "LEFT KNEE",  "x": 0.54, "y": 0.81}, {"label": "RIGHT KNEE", "x": 0.43, "y": 0.81},
        {"label": "LEFT LEG",   "x": 0.55, "y": 0.85}, {"label": "RIGHT LEG",  "x": 0.42, "y": 0.85},
    ],
    [   # recovery — back to ready
        {"label": "NOSE", "x": 0.49, "y": 0.56},
        {"label": "NECK", "x": 0.49, "y": 0.66},
        {"label": "LEFT HIP",   "x": 0.55, "y": 0.79}, {"label": "RIGHT HIP",  "x": 0.42, "y": 0.79},
        {"label": "LEFT KNEE",  "x": 0.57, "y": 0.83}, {"label": "RIGHT KNEE", "x": 0.40, "y": 0.83},
        {"label": "LEFT LEG",   "x": 0.58, "y": 0.87}, {"label": "RIGHT LEG",  "x": 0.39, "y": 0.87},
    ],
]

CYCLES = {
    "walk":     WALK_CYCLE,
    "eating":   EATING_CYCLE,
    "sad":      SAD_CYCLE,
    "sleeping": SLEEP_CYCLE,
    "training": TRAINING_CYCLE,
}


def animate_action(reference_path: str, action: str, direction: str = "south",
                   view: str = "side", size: int = 64,
                   out_stem: str | None = None) -> list[str]:
    """Run any action from the keyframe library."""
    if action not in CYCLES:
        raise ValueError(f"Unknown action: {action}. Options: {list(CYCLES)}")
    cycle = CYCLES[action]

    with open(reference_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")

    payload = {
        "image_size": {"width": size, "height": size},
        "reference_image": {"type": "base64", "base64": b64},
        "view": view,
        "direction": direction,
        "skeleton_keypoints": cycle,
    }
    req = urllib.request.Request(
        API, data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            data = json.load(r)
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode("utf-8", "replace"), file=sys.stderr)
        sys.exit(1)

    if "detail" in data:
        print("API error:", json.dumps(data["detail"], indent=2), file=sys.stderr)
        sys.exit(1)

    out_dir = os.path.dirname(reference_path)
    stem = out_stem or f"SKEL_{action}_{direction.replace('-', '')}"
    saved = []
    for i, im in enumerate(data.get("images", [])):
        b = im.get("base64") if isinstance(im, dict) else im
        if not b:
            continue
        p = os.path.join(out_dir, f"{stem}_frame{i}.png")
        with open(p, "wb") as f:
            f.write(base64.b64decode(b))
        saved.append(p)
        print(f"  saved {p}")
    print(f"  cost: ${data.get('usage', {}).get('usd', 0)}")
    return saved


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(f"Usage: pixellab_skeleton.py <action> <direction> <reference.png> [out_stem]")
        print(f"Actions: {list(CYCLES)}")
        sys.exit(2)
    _, action, direction, ref = sys.argv[:4]
    out_stem = sys.argv[4] if len(sys.argv) > 4 else None
    animate_action(ref, action, direction, out_stem=out_stem)
