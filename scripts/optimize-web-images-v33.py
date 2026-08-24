"""Genera variantes WebP responsivas sin modificar los originales comerciales.

Uso:
  python scripts/optimize-web-images-v33.py
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "img"
OUTPUT = SOURCE / "optimized-v33"
WIDTHS = (480, 960)
QUALITY = 78


def optimize(source: Path, width: int) -> dict[str, int | str]:
    target = OUTPUT / f"{source.stem}-{width}.webp"
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        target_width = min(width, image.width)
        target_height = max(1, round(image.height * target_width / image.width))
        if image.size != (target_width, target_height):
            image = image.resize((target_width, target_height), Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=QUALITY, method=4, optimize=True)
    return {
        "source": source.relative_to(ROOT).as_posix(),
        "target": target.relative_to(ROOT).as_posix(),
        "width": target_width,
        "height": target_height,
        "bytes": target.stat().st_size,
    }


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    sources = sorted(path for path in SOURCE.glob("*.webp") if path.is_file())
    variants = [optimize(source, width) for source in sources for width in WIDTHS]
    manifest = {
        "build": "2026-08-24-images-v33",
        "quality": QUALITY,
        "widths": WIDTHS,
        "source_count": len(sources),
        "source_bytes": sum(path.stat().st_size for path in sources),
        "variants": variants,
    }
    (OUTPUT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    by_width = {
        width: sum(item["bytes"] for item in variants if item["target"].endswith(f"-{width}.webp"))
        for width in WIDTHS
    }
    print(
        f"Optimized {len(sources)} originals into {len(variants)} variants; "
        f"source={manifest['source_bytes']} bytes, 480={by_width[480]} bytes, "
        f"960={by_width[960]} bytes"
    )


if __name__ == "__main__":
    main()
