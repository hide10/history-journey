#!/usr/bin/env python3
"""138億年の旅 — 章扉絵の生成（ComfyUI API）。

comfyui-image-gen スキルの comfyui_gen.py を本プロジェクト向けに調整:
- ネガティブから "dark background" を除外（宇宙・夜のシーンが主役のため）
- seed を引数で固定可能（再現・差し替えのため）

使用法:
  python3 gen_art.py "プロンプト" 出力パス [幅] [高さ] [seed]
"""
from __future__ import annotations

import json
import os
import random
import sys
import time
import urllib.request
from pathlib import Path

HOST = os.environ.get("COMFYUI_HOST", "localhost:8188")
MODEL = "epicrealismXL_pureFix.safetensors"
NEGATIVE = (
    "text, watermark, logo, signature, blurry, low quality, "
    "distorted, deformed, cartoon, anime, nsfw"
)


def build_workflow(prompt: str, width: int, height: int, seed: int) -> dict:
    return {
        "3": {
            "class_type": "KSampler",
            "inputs": {
                "cfg": 7,
                "denoise": 1,
                "latent_image": ["5", 0],
                "model": ["4", 0],
                "negative": ["7", 0],
                "positive": ["6", 0],
                "sampler_name": "euler",
                "scheduler": "normal",
                "seed": seed,
                "steps": 24,
            },
        },
        "4": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": MODEL}},
        "5": {
            "class_type": "EmptyLatentImage",
            "inputs": {"batch_size": 1, "height": height, "width": width},
        },
        "6": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["4", 1], "text": prompt}},
        "7": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["4", 1], "text": NEGATIVE}},
        "8": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["4", 2]}},
        "9": {
            "class_type": "SaveImage",
            "inputs": {"filename_prefix": "history_journey", "images": ["8", 0]},
        },
    }


def api(path: str, data: dict | None = None) -> dict:
    url = f"http://{HOST}{path}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(
        url, data=body,
        headers={"Content-Type": "application/json"} if body else {},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def generate(prompt: str, out_path: str, width: int, height: int, seed: int) -> None:
    result = api("/prompt", {"prompt": build_workflow(prompt, width, height, seed)})
    prompt_id = result["prompt_id"]
    print(f"prompt_id: {prompt_id} seed: {seed}")

    for _ in range(180):  # 最大6分
        time.sleep(2)
        hist = api(f"/history/{prompt_id}")
        if prompt_id in hist:
            for node_out in hist[prompt_id].get("outputs", {}).values():
                for img in node_out.get("images", []):
                    params = (
                        f"filename={img['filename']}"
                        f"&subfolder={img.get('subfolder', '')}"
                        f"&type={img.get('type', 'output')}"
                    )
                    out = Path(out_path)
                    out.parent.mkdir(parents=True, exist_ok=True)
                    with urllib.request.urlopen(f"http://{HOST}/view?{params}") as r:
                        out.write_bytes(r.read())
                    print(f"saved: {out}")
                    return
    print("timeout", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    w = int(sys.argv[3]) if len(sys.argv) > 3 else 1344
    h = int(sys.argv[4]) if len(sys.argv) > 4 else 768
    seed = int(sys.argv[5]) if len(sys.argv) > 5 else random.randint(0, 2**31)
    generate(sys.argv[1], sys.argv[2], w, h, seed)
