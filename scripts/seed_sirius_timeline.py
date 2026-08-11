"""Синхронизировать события Сириуса из data/sirius_events.json в history.json.

Тот же формат данных, что и у parse_lukoil_history.py — без дублирования списка.

Запуск:
    py -3 scripts/seed_sirius_timeline.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HISTORY = ROOT / "data" / "history.json"
SIRIUS_PATH = ROOT / "data" / "sirius_events.json"
BRENT = ROOT / "data" / "brent_prices.json"
PROD = ROOT / "data" / "lukoil_production.json"


def load_oil() -> dict[int, float]:
    if not BRENT.exists():
        return {}
    payload = json.loads(BRENT.read_text(encoding="utf-8"))
    return {int(k): float(v) for k, v in payload.get("prices", {}).items()}


def load_prod() -> dict[int, float]:
    if not PROD.exists():
        return {}
    payload = json.loads(PROD.read_text(encoding="utf-8"))
    return {int(k): float(v["mt"]) for k, v in payload.get("production", {}).items()}


def main() -> None:
    history = json.loads(HISTORY.read_text(encoding="utf-8"))
    sirius_events = json.loads(SIRIUS_PATH.read_text(encoding="utf-8"))
    oil = load_oil()
    prod = load_prod()

    history = [e for e in history if e.get("source") != "sirius"]

    for item in sirius_events:
        year = int(item["year"])
        mt = prod.get(year)
        barrels = int(mt * 1_000_000) if mt is not None else year * 1000
        row = {
            "year": year,
            "title": item["title"],
            "desc": item["desc"],
            "source": "sirius",
            "url": item.get("url"),
            "oilPrice": oil.get(year, 70.0),
            "techIndex": item.get("techIndex", 50),
            "barrelsHint": barrels,
        }
        if mt is not None:
            row["productionMt"] = mt
        if item.get("image"):
            row["image"] = item["image"]
        if item.get("imageCaption"):
            row["imageCaption"] = item["imageCaption"]
        history.append(row)

    history.sort(key=lambda e: (e["year"], 0 if e["source"] == "lukoil" else 1, e["title"]))
    HISTORY.write_text(json.dumps(history, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    sirius_n = sum(1 for e in history if e["source"] == "sirius")
    print(f"Saved {len(history)} events ({sirius_n} sirius) -> {HISTORY}")


if __name__ == "__main__":
    main()
