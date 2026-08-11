"""Парсер подробной истории ЛУКОЙЛ по годам.

Источники:
  https://lukoil.ru/Company/history/
  https://lukoil.ru/Company/history/HistoryYYYY

Запуск:
    py -3 scripts/parse_lukoil_history.py
"""

from __future__ import annotations

import json
import re
import time
from html import unescape
from pathlib import Path

import httpx
from bs4 import BeautifulSoup

BASE = "https://lukoil.ru/Company/history"
OUT = Path(__file__).resolve().parents[1] / "data" / "history.json"
BRENT_PATH = Path(__file__).resolve().parents[1] / "data" / "brent_prices.json"
SIRIUS_PATH = Path(__file__).resolve().parents[1] / "data" / "sirius_events.json"
YEAR_IMAGES_PATH = Path(__file__).resolve().parents[1] / "data" / "year_images.json"
YEAR_FROM = 1991
YEAR_TO = 2025

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; LukoilHistoryBot/1.0; "
        "+educational timeline project)"
    ),
    "Accept-Language": "ru-RU,ru;q=0.9",
}

# Fallback, если data/brent_prices.json ещё не скачан
OIL_PRICES_FALLBACK = {
    1991: 20.10, 1992: 19.36, 1993: 17.08, 1994: 15.96, 1995: 17.20,
    1996: 20.81, 1997: 19.31, 1998: 13.13, 1999: 18.11, 2000: 28.85,
    2001: 24.71, 2002: 25.12, 2003: 28.78, 2004: 38.23, 2005: 54.68,
    2006: 65.60, 2007: 72.65, 2008: 97.33, 2009: 61.58, 2010: 79.81,
    2011: 111.54, 2012: 112.01, 2013: 108.96, 2014: 99.35, 2015: 53.02,
    2016: 45.08, 2017: 54.89, 2018: 71.61, 2019: 64.20, 2020: 43.33,
    2021: 70.83, 2022: 99.00, 2023: 82.32, 2024: 79.91, 2025: 68.32,
    2026: 68.32,
}


def load_oil_prices() -> dict[int, float]:
    if BRENT_PATH.exists():
        payload = json.loads(BRENT_PATH.read_text(encoding="utf-8"))
        return {int(k): float(v) for k, v in payload.get("prices", {}).items()}
    return dict(OIL_PRICES_FALLBACK)


OIL_PRICES = load_oil_prices()


def load_sirius_events() -> list[dict]:
    if not SIRIUS_PATH.exists():
        return []
    return json.loads(SIRIUS_PATH.read_text(encoding="utf-8"))


def load_year_images() -> dict[int, str]:
    if not YEAR_IMAGES_PATH.exists():
        return {}
    payload = json.loads(YEAR_IMAGES_PATH.read_text(encoding="utf-8"))
    result: dict[int, str] = {}
    for key, item in payload.items():
        image = item.get("image") if isinstance(item, dict) else None
        if image:
            result[int(key)] = image
    return result


def clean_text(value: str) -> str:
    value = unescape(value)
    value = value.replace("\xa0", " ").replace("\u200b", "")
    value = re.sub(r"[ \t\r\f\v]+", " ", value)
    value = re.sub(r"\n+", " ", value)
    return value.strip()


def dedupe_text(value: str) -> str:
    """Убирает полное удвоение текста."""
    value = clean_text(value)
    if not value:
        return value

    # Полный дубль: "AAA AAA"
    half = len(value) // 2
    if len(value) >= 80:
        left = clean_text(value[:half])
        right = clean_text(value[half:])
        if left and left == right:
            return left

    return value


def strip_title_prefix(title: str, desc: str) -> str:
    desc = clean_text(desc)
    title = clean_text(title)
    if title and desc.startswith(title):
        desc = desc[len(title) :].lstrip(" —–-.:,;")
    return desc


def tech_index_for(year: int) -> int:
    return max(5, min(100, round((year - 1991) / 35 * 95) + 5))


def enrich(event: dict, year_images: dict[int, str] | None = None) -> dict:
    year = int(event["year"])
    row = {
        "year": year,
        "title": event["title"],
        "desc": event["desc"],
        "source": event.get("source", "lukoil"),
        "url": event.get("url"),
        "image": event.get("image"),
        "oilPrice": OIL_PRICES.get(year, 70.0),
        "techIndex": event.get("techIndex", tech_index_for(year)),
        "barrelsHint": event.get("barrelsHint", year * 1000),
    }
    if event.get("productionMt") is not None:
        row["productionMt"] = event["productionMt"]
    if event.get("image"):
        row["image"] = event["image"]
    if event.get("imageCaption"):
        row["imageCaption"] = event["imageCaption"]
    return row


def attach_lukoil_images(history: list[dict], year_images: dict[int, str]) -> list[dict]:
    seen: set[int] = set()
    for event in history:
        if event.get("source") != "lukoil":
            continue
        year = int(event["year"])
        if year in year_images and year not in seen:
            event["image"] = year_images[year]
            seen.add(year)
    return history


def parse_year_page(html: str, year: int, page_url: str) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    left = soup.select_one(".content-block-left") or soup.select_one(".content")
    if not left:
        return []

    events: list[dict] = []
    blocks = left.select(".htmlContent")
    if not blocks:
        text = dedupe_text(left.get_text(" ", strip=True))
        text = re.sub(r"(?is)^.*?История\.?\s*" + str(year), "", text, count=1)
        text = re.split(r"Всегда в движении", text)[0].strip()
        if len(text) > 40:
            events.append(
                {
                    "year": year,
                    "title": text.split(".")[0][:120],
                    "desc": text[:2000],
                    "source": "lukoil",
                    "url": page_url,
                }
            )
        return events

    for block in blocks:
        title = ""
        for title_el in block.find_all("strong"):
            candidate = clean_text(title_el.get_text(" ", strip=True))
            if candidate:
                title = candidate
                break
        # Иногда <strong> захватывает слишком много — берём первое предложение
        if title and len(title) > 120:
            title = re.split(r"(?<=[.!?])\s+", title, maxsplit=1)[0][:120]

        clone = BeautifulSoup(str(block), "lxml")
        for tag in clone.find_all("strong"):
            tag.decompose()
        for tag in clone.find_all(["script", "style"]):
            tag.decompose()

        desc = dedupe_text(clone.get_text(" ", strip=True))
        desc = strip_title_prefix(title, desc)
        desc = dedupe_text(desc)

        if not title:
            title = (desc[:90] + "…") if len(desc) > 90 else desc

        if len(desc) < 20 and len(title) < 8:
            continue

        events.append(
            {
                "year": year,
                "title": title[:140],
                "desc": desc[:2000],
                "source": "lukoil",
                "url": page_url,
            }
        )

    return events


def fetch_year(client: httpx.Client, year: int) -> list[dict]:
    url = f"{BASE}/History{year}"
    response = client.get(url)
    if response.status_code == 404:
        print(f"  {year}: 404")
        return []
    response.raise_for_status()
    events = parse_year_page(response.text, year, url)
    print(f"  {year}: {len(events)} news")
    return events


def main() -> None:
    all_events: list[dict] = []
    with httpx.Client(timeout=40.0, follow_redirects=True, headers=HEADERS) as client:
        for year in range(YEAR_FROM, YEAR_TO + 1):
            try:
                all_events.extend(fetch_year(client, year))
            except Exception as exc:  # noqa: BLE001
                print(f"  {year}: ERROR {exc}")
            time.sleep(0.25)

    all_events.extend(load_sirius_events())
    year_images = load_year_images()

    history = [enrich(e, year_images) for e in all_events]
    history = attach_lukoil_images(history, year_images)
    history.sort(key=lambda e: (e["year"], 0 if e["source"] == "lukoil" else 1, e["title"]))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(history, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lukoil_n = sum(1 for e in history if e["source"] == "lukoil")
    sirius_n = sum(1 for e in history if e["source"] == "sirius")
    print(f"Saved {len(history)} events ({lukoil_n} lukoil, {sirius_n} sirius) -> {OUT}")


if __name__ == "__main__":
    main()
