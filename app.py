"""Машина времени-35 — FastAPI + uvicorn backend."""

from __future__ import annotations

import json
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "history.json"

with DATA_PATH.open(encoding="utf-8") as f:
    HISTORY: list[dict] = json.load(f)

app = FastAPI(title="Машина времени-35")
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")


def event_for_year(year: int) -> dict | None:
    """Return the latest event with year <= selected year."""
    match = None
    for event in HISTORY:
        if event["year"] <= year:
            match = event
        else:
            break
    return match


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(request, "index.html")


@app.get("/api/data")
async def api_data(year: int | None = Query(default=None)):
    if year is None:
        return HISTORY

    event = event_for_year(year)
    if event is None:
        raise HTTPException(status_code=404, detail="no event for this year")
    return event


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=5000, reload=True)
