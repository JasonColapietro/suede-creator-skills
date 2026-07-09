#!/usr/bin/env python3
"""Render the social card with the exact approved Suede S asset."""

from __future__ import annotations

import hashlib
import subprocess
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SVG = ROOT / "docs/assets/og-image-v2.svg"
OUTPUT = ROOT / "docs/assets/og-image-v2.png"
APPROVED_MARK = ROOT / "docs/assets/suede-ai-logo-transparent.png"
APPROVED_SHA256 = "83a7ee0317e4debe2e7b076c20ba067feb76a587f9e829dc6310ae4be4b44dfa"
MARK_BOX = (76, 70, 64, 64)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    actual_hash = sha256(APPROVED_MARK)
    if actual_hash != APPROVED_SHA256:
        raise SystemExit(
            "Refusing to render: approved Suede mark hash mismatch "
            f"({actual_hash})."
        )

    subprocess.run(
        ["sips", "-s", "format", "png", str(SVG), "--out", str(OUTPUT)],
        check=True,
        stdout=subprocess.DEVNULL,
    )

    card = Image.open(OUTPUT).convert("RGBA")
    mark = Image.open(APPROVED_MARK).convert("RGBA")
    x, y, width, height = MARK_BOX
    mark = mark.resize((width, height), Image.Resampling.LANCZOS)
    card.paste((17, 17, 17, 255), (x, y, x + width, y + height))
    card.alpha_composite(mark, (x, y))
    card.convert("RGB").save(OUTPUT, format="PNG", optimize=True)


if __name__ == "__main__":
    main()
