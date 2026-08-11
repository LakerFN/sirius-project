"""Скачать фото с страниц истории ЛУКОЙЛ для каждого года.

Запуск:
    py -3 scripts/fetch_year_images.py
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
IMG_DIR = ROOT / "static" / "img" / "years"
META_OUT = ROOT / "data" / "year_images.json"
HISTORY = ROOT / "data" / "history.json"

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

SKIP = ("logo", "icon", "sprite", "pixel", "1x1", "blank", "favicon", "svg")

# Общие картинки сайдбара/футера, которые повторяются на всех страницах
GLOBAL_NOISE = {
    "5116.jpg",
    "5117.jpg",
    "5119.jpg",
    "22053.jpg",
    "2921.png",  # иногда шапка; для 1991 ок как документ, но не для других лет
}


def is_content_image(url: str) -> bool:
    low = url.lower()
    name = Path(urlparse(url).path).name.lower()
    if name in GLOBAL_NOISE:
        return False
    if not any(low.endswith(ext) or f".{ext}?" in low for ext in ("jpg", "jpeg", "png", "webp")):
        if "/FileSystem/" not in url and "/upload/" not in url.lower() and "/images/" not in low:
            return False
    return not any(s in low for s in SKIP)


def score_image(url: str) -> int:
    """Выше = лучше. Галереи /FileSystem/9/ обычно реальные фото."""
    score = 0
    low = url.lower()
    path = urlparse(url).path
    if "/FileSystem/9/" in path:
        score += 50
    if "/FileSystem/4/" in path:
        score += 10
    if low.endswith((".jpg", ".jpeg", ".webp")):
        score += 8
    if low.endswith(".png"):
        score += 2  # часто инфографика/баннер
    name = Path(path).name.lower()
    if name in GLOBAL_NOISE:
        score -= 100
    return score


def collect_images(html: str, page_url: str) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    found: list[str] = []

    og = soup.select_one('meta[property="og:image"]')
    if og and og.get("content"):
        found.append(urljoin(page_url, og["content"]))

    left = soup.select_one(".content-block-left") or soup.select_one(".content") or soup
    for img in left.select("img"):
        for attr in ("src", "data-src", "data-original", "data-lazy"):
            src = img.get(attr)
            if src:
                found.append(urljoin(page_url, src))

    for el in left.select("[style*='background']"):
        style = el.get("style") or ""
        for m in re.findall(r"url\(['\"]?([^'\")]+)", style):
            found.append(urljoin(page_url, m))

    for m in re.findall(
        r"""(?:src|href|content)=["']([^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)""",
        html,
        flags=re.I,
    ):
        found.append(urljoin(page_url, m))

    for m in re.findall(r'(/FileSystem/[^"\'\s>]+\.(?:jpg|jpeg|png|webp))', html, flags=re.I):
        found.append(urljoin(page_url, m))

    uniq: list[str] = []
    seen: set[str] = set()
    for u in found:
        u = u.strip()
        if not u or u in seen:
            continue
        if not is_content_image(u):
            continue
        seen.add(u)
        uniq.append(u)

    uniq.sort(key=score_image, reverse=True)
    return uniq


def ext_from_url(url: str) -> str:
    path = urlparse(url).path
    suffix = Path(path).suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp"}:
        return suffix
    return ".jpg"


def existing_local(year: int) -> str | None:
    for ext in (".jpg", ".jpeg", ".png", ".webp"):
        path = IMG_DIR / f"{year}{ext}"
        if path.exists() and path.stat().st_size > 3000:
            return f"/static/img/years/{path.name}"
    return None


def download(client: httpx.Client, url: str, dest: Path) -> bool:
    try:
        r = client.get(url)
        r.raise_for_status()
        ctype = (r.headers.get("content-type") or "").lower()
        if "image" not in ctype and len(r.content) < 2000:
            print(f"    skip non-image {url} ({ctype})")
            return False
        if len(r.content) < 4000:
            print(f"    skip tiny {url} ({len(r.content)} bytes)")
            return False
        dest.write_bytes(r.content)
        print(f"    saved {dest.name} ({len(r.content)} bytes)")
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"    FAIL {url}: {exc}")
        return False


def sync_history(mapping: dict[str, dict]) -> None:
    if not HISTORY.exists():
        return
    history = json.loads(HISTORY.read_text(encoding="utf-8"))
    by_year_img = {int(k): v["image"] for k, v in mapping.items() if v.get("image")}

    # Сначала сбрасываем image у lukoil, чтобы не остались устаревшие пути
    for event in history:
        if event.get("source") == "lukoil":
            event.pop("image", None)

    updated = 0
    seen_years: set[int] = set()
    for event in history:
        if event.get("source") != "lukoil":
            continue
        y = int(event["year"])
        if y in by_year_img and y not in seen_years:
            event["image"] = by_year_img[y]
            seen_years.add(y)
            updated += 1

    HISTORY.write_text(
        json.dumps(history, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Updated {updated} lukoil year-leaders with image in history.json")


def main() -> None:
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    mapping: dict[str, dict] = {}
    if META_OUT.exists():
        try:
            mapping = json.loads(META_OUT.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            mapping = {}

    with httpx.Client(timeout=45.0, follow_redirects=True, headers=HEADERS) as client:
        for year in range(YEAR_FROM, YEAR_TO + 1):
            page = f"{BASE}/History{year}"
            print(f"=== {year}")

            # Если уже есть локальный файл — оставляем, но всё равно обновим meta
            already = existing_local(year)
            if already and str(year) in mapping and mapping[str(year)].get("image"):
                # Перекачиваем только если в meta нет image или файла нет
                pass

            try:
                resp = client.get(page)
                print(f"  status {resp.status_code}")
                if resp.status_code == 404:
                    mapping[str(year)] = {
                        "year": year,
                        "sourcePage": page,
                        "image": already,
                        "candidates": [],
                    }
                    continue
                resp.raise_for_status()
            except Exception as exc:  # noqa: BLE001
                print(f"  ERROR {exc}")
                mapping[str(year)] = {
                    "year": year,
                    "sourcePage": page,
                    "image": already,
                    "candidates": [],
                    "error": str(exc),
                }
                continue

            images = collect_images(resp.text, page)
            # Для 1991 разрешим документ-скан, даже если в GLOBAL_NOISE
            if year == 1991 and not images:
                images = ["https://lukoil.ru/FileSystem/4/2921.png"]

            print(f"  found {len(images)} candidates")
            for i, u in enumerate(images[:5]):
                print(f"   [{i}] ({score_image(u)}) {u}")

            local = None
            for idx, img_url in enumerate(images[:8]):
                ext = ext_from_url(img_url)
                dest = IMG_DIR / (f"{year}{ext}" if idx == 0 else f"{year}_{idx}{ext}")
                # Пишем итог всегда как YEAR.ext — первый успешный
                final_dest = IMG_DIR / f"{year}{ext}"
                if download(client, img_url, final_dest):
                    # Удалим другие расширения того же года, чтобы не путаться
                    for other in IMG_DIR.glob(f"{year}.*"):
                        if other != final_dest:
                            other.unlink(missing_ok=True)
                    local = f"/static/img/years/{final_dest.name}"
                    break

            if not local:
                local = already
                if local:
                    print(f"  keep existing {local}")
                else:
                    print("  NO IMAGE")

            mapping[str(year)] = {
                "year": year,
                "sourcePage": page,
                "image": local,
                "candidates": images[:10],
            }
            time.sleep(0.22)

    META_OUT.write_text(json.dumps(mapping, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {META_OUT}")
    sync_history(mapping)

    ok = sum(1 for v in mapping.values() if v.get("image"))
    print(f"Years with photos: {ok}/{YEAR_TO - YEAR_FROM + 1}")


if __name__ == "__main__":
    main()
