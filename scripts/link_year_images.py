"""Собрать прямые ссылки на фото со страниц истории ЛУКОЙЛ.

Не скачивает файлы — только URL с lukoil.ru.

Источники:
  https://lukoil.ru/Company/history/History
  https://lukoil.ru/Company/history/HistoryYYYY

Запуск:
    py -3 scripts/link_year_images.py
"""
from __future__ import annotations

import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
META_OUT = ROOT / "data" / "year_images.json"
HISTORY = ROOT / "data" / "history.json"

OVERVIEW = "https://lukoil.ru/Company/history/History"
BASE = "https://lukoil.ru/Company/history"
YEAR_FROM = 1991
YEAR_TO = 2025

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; LukoilHistoryBot/1.0; "
        "+educational timeline project)"
    ),
    "Accept-Language": "ru-RU,ru;q=0.9",
}

NOISE = {
    "5116.jpg",
    "5117.jpg",
    "5119.jpg",
    "22053.jpg",
    "logo",
    "icon",
    "sprite",
    "favicon",
    "pixel",
    "1x1",
    "blank",
}


def is_noise(url: str) -> bool:
    low = url.lower()
    name = Path(urlparse(url).path).name.lower()
    if name in NOISE:
        return True
    return any(token in low for token in NOISE if len(token) > 4)


def score(url: str) -> int:
    path = urlparse(url).path
    low = url.lower()
    points = 0
    if "/FileSystem/9/" in path:
        points += 50
    if "/FileSystem/4/" in path:
        points += 10
    if low.endswith((".jpg", ".jpeg", ".webp")):
        points += 8
    if low.endswith(".png"):
        points += 2
    return points


def collect_images(html: str, page_url: str) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    found: list[str] = []

    left = soup.select_one(".content-block-left") or soup.select_one(".content") or soup
    for img in left.select("img"):
        for attr in ("src", "data-src", "data-original", "data-lazy"):
            src = img.get(attr)
            if src:
                found.append(urljoin(page_url, src))

    for m in re.findall(
        r"""(?:src|href|content)=["']([^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)""",
        html,
        flags=re.I,
    ):
        found.append(urljoin(page_url, m))

    for m in re.findall(
        r"(/FileSystem/[^\"'\s>]+\.(?:jpg|jpeg|png|webp))",
        html,
        flags=re.I,
    ):
        found.append(urljoin(page_url, m))

    uniq: list[str] = []
    seen: set[str] = set()
    for u in found:
        u = u.strip()
        if not u or u in seen or is_noise(u):
            continue
        seen.add(u)
        uniq.append(u)

    uniq.sort(key=score, reverse=True)
    return uniq


def sync_history(mapping: dict[str, dict]) -> None:
    history = json.loads(HISTORY.read_text(encoding="utf-8"))
    by_year = {int(k): v["image"] for k, v in mapping.items() if v.get("image")}

    for event in history:
        if event.get("source") == "lukoil":
            event.pop("image", None)

    seen: set[int] = set()
    updated = 0
    for event in history:
        if event.get("source") != "lukoil":
            continue
        year = int(event["year"])
        if year in by_year and year not in seen:
            event["image"] = by_year[year]
            seen.add(year)
            updated += 1

    HISTORY.write_text(
        json.dumps(history, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Attached image links to {updated} year-leaders in history.json")


def main() -> None:
    mapping: dict[str, dict] = {}

    with httpx.Client(timeout=45.0, follow_redirects=True, headers=HEADERS) as client:
        print("=== overview", OVERVIEW)
        try:
            overview = client.get(OVERVIEW)
            print("  status", overview.status_code)
        except Exception as exc:  # noqa: BLE001
            print("  overview error", exc)

        for year in range(YEAR_FROM, YEAR_TO + 1):
            page = f"{BASE}/History{year}"
            print(f"=== {year}")
            try:
                resp = client.get(page)
                print(f"  status {resp.status_code}")
                if resp.status_code == 404:
                    mapping[str(year)] = {
                        "year": year,
                        "sourcePage": page,
                        "image": None,
                        "candidates": [],
                    }
                    continue
                resp.raise_for_status()
            except Exception as exc:  # noqa: BLE001
                print(f"  ERROR {exc}")
                mapping[str(year)] = {
                    "year": year,
                    "sourcePage": page,
                    "image": None,
                    "candidates": [],
                    "error": str(exc),
                }
                continue

            images = collect_images(resp.text, page)
            # 1991: historical decree scan is acceptable even if noisy-looking
            if year == 1991 and not images:
                images = ["https://lukoil.ru/FileSystem/4/2921.png"]

            chosen = images[0] if images else None
            print(f"  candidates {len(images)}")
            if chosen:
                print(f"  link {chosen}")
            else:
                print("  NO IMAGE LINK")

            mapping[str(year)] = {
                "year": year,
                "sourcePage": page,
                "image": chosen,
                "candidates": images[:12],
            }
            time.sleep(0.2)

    META_OUT.write_text(
        json.dumps(mapping, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {META_OUT}")
    sync_history(mapping)
    ok = sum(1 for v in mapping.values() if v.get("image"))
    print(f"Years with image links: {ok}/{YEAR_TO - YEAR_FROM + 1}")


if __name__ == "__main__":
    main()
