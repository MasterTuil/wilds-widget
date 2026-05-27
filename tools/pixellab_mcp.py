#!/usr/bin/env python3
"""
Direct client for Pixellab's high-level MCP — the one with `create_character`,
`animate_character`, etc. Bypasses Claude Code's broken wrapper that only
exposes the low-level v1 REST endpoints.

Usage:
    python3 tools/pixellab_mcp.py create  "<description>"  [name]
    python3 tools/pixellab_mcp.py status  <character_id>
    python3 tools/pixellab_mcp.py walk    <character_id>
    python3 tools/pixellab_mcp.py action  <character_id>  "<action>"  "<anim_name>"
    python3 tools/pixellab_mcp.py download <character_id>  <out_dir>
    python3 tools/pixellab_mcp.py list

Workflow:
    1. create → returns character_id (save it)
    2. status until done (polls)
    3. walk / action / etc. → queues animations
    4. status until all done
    5. download → pulls every sprite to disk
"""
import base64
import json
import os
import sys
import time
import urllib.request
import urllib.error

MCP_URL = "https://api.pixellab.ai/mcp"
TOKEN = os.environ.get("PIXELLAB_TOKEN") or "45a89bb4-9b6e-4110-9755-943a59b453f5"

_session_id_holder = {"id": None}
_rpc_id = {"n": 0}


def _next_id():
    _rpc_id["n"] += 1
    return _rpc_id["n"]


def _rpc(method: str, params: dict, expect_response: bool = True) -> dict | None:
    """JSON-RPC over HTTP/SSE to Pixellab MCP."""
    body = json.dumps({
        "jsonrpc": "2.0",
        "id": _next_id(),
        "method": method,
        "params": params,
    }).encode("utf-8")
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
    }
    if _session_id_holder["id"]:
        headers["Mcp-Session-Id"] = _session_id_holder["id"]
    req = urllib.request.Request(MCP_URL, data=body, headers=headers, method="POST")
    try:
        resp = urllib.request.urlopen(req, timeout=300)
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:500]}", file=sys.stderr)
        sys.exit(1)

    # Capture session id from initialize
    sid = resp.headers.get("Mcp-Session-Id")
    if sid and not _session_id_holder["id"]:
        _session_id_holder["id"] = sid

    if not expect_response:
        return None

    raw = resp.read().decode("utf-8")
    # SSE: lines like "event: message\ndata: {...}"
    last_result = None
    for line in raw.splitlines():
        if line.startswith("data: "):
            try:
                j = json.loads(line[6:])
                if "result" in j or "error" in j:
                    last_result = j
            except Exception:
                pass
    return last_result


def initialize():
    r = _rpc("initialize", {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {"name": "wilds-client", "version": "0.1"},
    })
    # Notify that we're ready (some servers need this)
    _rpc("notifications/initialized", {}, expect_response=False)
    return r


def tool_call(name: str, arguments: dict) -> dict:
    r = _rpc("tools/call", {"name": name, "arguments": arguments})
    if r and "error" in r:
        print(f"TOOL ERROR ({name}):", json.dumps(r["error"], indent=2)[:1000], file=sys.stderr)
        sys.exit(1)
    content = (r or {}).get("result", {}).get("content", [])
    # Tool results are usually text blocks containing JSON or human text
    for block in content:
        if block.get("type") == "text":
            text = block.get("text", "")
            # Try to parse as JSON
            try:
                return json.loads(text)
            except Exception:
                return {"text": text}
    return r.get("result", {}) if r else {}


# ── High-level ops ──────────────────────────────────────────────────────────

def cmd_create(description: str, name: str | None = None,
               body_type: str = "quadruped", template: str = "cat"):
    """
    Default body_type=quadruped, template=cat. Use for Tamagotchi-style pets.
    For tall bipedal characters override with body_type=humanoid.
    """
    initialize()
    args = {
        "description": description,
        "body_type": body_type,
        "n_directions": 8,
        "mode": "standard",
        "size": 64,
        "view": "side",
    }
    if body_type == "quadruped":
        args["template"] = template
    if name:
        args["name"] = name
    res = tool_call("create_character", args)
    print(json.dumps(res, indent=2))


def cmd_status(character_id: str):
    initialize()
    res = tool_call("get_character", {"character_id": character_id, "include_preview": False})
    print(json.dumps(res, indent=2))


def cmd_walk(character_id: str):
    initialize()
    res = tool_call("animate_character", {
        "character_id": character_id,
        "template_animation_id": "walk",
        "directions": ["south", "south-east", "east", "north-east", "north"],
    })
    print(json.dumps(res, indent=2))


def cmd_template(character_id: str, template_id: str, dirs: str = "south"):
    """Queue any template animation by ID. dirs is comma-separated list."""
    initialize()
    directions = [d.strip() for d in dirs.split(",")]
    res = tool_call("animate_character", {
        "character_id": character_id,
        "template_animation_id": template_id,
        "directions": directions,
    })
    print(json.dumps(res, indent=2))


def cmd_action(character_id: str, action: str, anim_name: str):
    initialize()
    res = tool_call("animate_character", {
        "character_id": character_id,
        "action_description": action,
        "animation_name": anim_name,
        "directions": ["south"],
        "frame_count": 4,
    })
    print(json.dumps(res, indent=2))


def cmd_list():
    initialize()
    res = tool_call("list_characters", {"limit": 20})
    print(json.dumps(res, indent=2))


def cmd_download(character_id: str, out_dir: str):
    initialize()
    os.makedirs(out_dir, exist_ok=True)
    data = tool_call("get_character", {"character_id": character_id, "include_preview": False})

    # Print the raw response so we can see the structure first
    print(json.dumps(data, indent=2)[:3000])

    # Try to extract image URLs / data — structure TBD until first response observed
    rotations = data.get("rotations") or data.get("directions") or {}
    saved = 0
    for direction, info in (rotations.items() if isinstance(rotations, dict) else []):
        url = info if isinstance(info, str) else info.get("url") or info.get("download_url")
        if not url:
            continue
        path = os.path.join(out_dir, f"rotation_{direction.replace('-','')}.png")
        try:
            urllib.request.urlretrieve(url, path)
            print(f"  saved {path}")
            saved += 1
        except Exception as e:
            print(f"  FAIL {direction}: {e}")
    print(f"\n{saved} files downloaded")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    cmd = sys.argv[1]
    if cmd == "create":
        cmd_create(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)
    elif cmd == "status":
        cmd_status(sys.argv[2])
    elif cmd == "walk":
        cmd_walk(sys.argv[2])
    elif cmd == "template":
        cmd_template(sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else "south")
    elif cmd == "action":
        cmd_action(sys.argv[2], sys.argv[3], sys.argv[4])
    elif cmd == "list":
        cmd_list()
    elif cmd == "download":
        cmd_download(sys.argv[2], sys.argv[3])
    else:
        print(__doc__)
        sys.exit(2)
