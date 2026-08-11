"""Дозагрузить фото для лет без картинки / с подозрительным размером."""
from __future__ import annotations

import hashlib
import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin

import httpx

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "static" / "img" / "years"
META = ROOT / "data" / "year_images.json"
HISTORY = ROOT / "data" / "history.json"
BASE = "https://lukoil.ru/Company/history"
NOISE = {"5116.jpg", "5117.jpg", "5119.jpg", "22053.jpg"}
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; LukoilHistoryBot/1.0; +educational timeline project)"
}


def extract(html: str, page: str) -> list[str]:
    found: list[str] = []
    for m in re.findall(
        r"(/FileSystem/[^\"'\s>]+\.(?:jpg|jpeg|png|webp))", html, flags=re.I
    ):
        u = urljoin(page, m)
        name = u.rsplit("/", 1)[-1].lower()
        if name in NOISE:
            continue
        if u not in found:
            found.append(u)
    found.sort(key=lambda u: (0 if "/FileSystem/9/" in u else 1, len(u)))
    return found


def sync_history(meta: dict) -> None:
    history = json.loads(HISTORY.read_text(encoding="utf-8"))
    by = {int(k): v["image"] for k, v in meta.items() if v.get("image")}
    for e in history:
        if e.get("source") == "lukoil":
            e.pop("image", None)
    seen: set[int] = set()
    n = 0
    for e in history:
        if e.get("source") != "lukoil":
            continue
        y = int(e["year"])
        if y in by and y not in seen:
            e["image"] = by[y]
            seen.add(y)
            n += 1
    HISTORY.write_text(json.dumps(history, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"history leaders with image: {n}")


def main() -> None:
    meta = json.loads(META.read_text(encoding="utf-8"))
    # годы без фото + крупные одинаковые по размеру
    size_groups: dict[int, list[str]] = {}
    for p in IMG_DIR.glob("*"):
        size_groups.setdefault(p.stat().st_size, []).append(p.stem)

    suspicious = set()
    for size, stems in size_groups.items():
        if size > 900_000 and len(stems) >= 2:
            suspicious.update(int(s) for s in stems if s.isdigit())

    missing = [y for y in range(1991, 2026) if not meta.get(str(y), {}).get("image")]
    years = sorted(set(missing) | suspicious | {2016, 2022, 2023, 2024, 2025, 1992, 2009})
    print("fix years:", years)

    seen_hashes: set[str] = set()
    for p in IMG_DIR.glob("*"):
        if p.stem.isdigit() and int(p.stem) not in years:
            seen_hashes.add(hashlib.md5(p.read_bytes()).hexdigest())

    with httpx.Client(timeout=45.0, follow_redirects=True, headers=HEADERS) as client:
        for year in years:
            page = f"{BASE}/History{year}"
            info = meta.get(str(year), {})
            cands = list(info.get("candidates") or [])
            if len(cands) < 3:
                resp = client.get(page)
                print(year, "page", resp.status_code)
                if resp.status_code == 200:
                    cands = extract(resp.text, page)
            print(year, "candidates", len(cands))

            ok = False
            for url in cands[:15]:
                try:
                    r = client.get(url)
                    r.raise_for_status()
                    ctype = (r.headers.get("content-type") or "").lower()
                    if "image" not in ctype or len(r.content) < 4000:
                        continue
                    digest = hashlib.md5(r.content).hexdigest()
                    if digest in seen_hashes:
                        print("  skip duplicate hash", url)
                        continue
                    ext = "." + url.rsplit(".", 1)[-1].lower().split("?")[0]
                    if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
                        ext = ".jpg"
                    dest = IMG_DIR / f"{year}{ext}"
                    dest.write_bytes(r.content)
                    for other in IMG_DIR.glob(f"{year}.*"):
                        if other != dest:
                            other.unlink(missing_ok=True)
                    seen_hashes.add(digest)
                    meta[str(year)] = {
                        "year": year,
                        "sourcePage": page,
                        "image": f"/static/img/years/{dest.name}",
                        "candidates": cands[:12],
                    }
                    print("  saved", dest.name, len(r.content))
                    ok = True
                    break
                except Exception as exc:  # noqa: BLE001
                    print("  fail", url, exc)
            if not ok:
                print("  STILL EMPTY", year)
            time.sleep(0.2)

    META.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    sync_history(meta)
    with_img = sum(1 for y in range(1991, 2026) if meta.get(str(y), {}).get("image"))
    print(f"years with photos: {with_img}/35")


if __name__ == "__main__":
    main()
