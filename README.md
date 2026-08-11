# Машина времени-35

Интерактивная лента времени: как менялись технологии в нефтянке и в Сириусе за 35 лет (1991–2026).

Слайдер года обновляет карточку события и график Chart.js (цена нефти + индекс технологий).

## Стек

- **Backend:** FastAPI + uvicorn
- **Frontend:** HTML / CSS / Chart.js
- **Данные:** `data/history.json`

## Быстрый старт

```bash
py -3 -m pip install -r requirements.txt
py -3 -m uvicorn app:app --reload --host 127.0.0.1 --port 5000
```

Откройте http://127.0.0.1:5000

## API

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/` | Главная страница |
| `GET` | `/api/data` | Все события |
| `GET` | `/api/data?year=2010` | Последнее событие с годом ≤ указанного |

Документация OpenAPI: http://127.0.0.1:5000/docs

<<<<<<< Updated upstream
=======
## Данные

События ленты лежат в `data/history.json`.

Подробные новости парсятся со страниц годов:
[история](https://lukoil.ru/Company/history/) → `History1991` … `History2025`
(например [History2010](https://lukoil.ru/Company/history/History2010)).

```bash
py -3 -m pip install -r requirements.txt
py -3 scripts/parse_lukoil_history.py
```

В одном году может быть несколько новостей — слайдер показывает все за выбранный год.

<<<<<<< Updated upstream
Фото по годам (с страниц истории lukoil.ru):

```bash
py -3 scripts/fetch_year_images.py
```

Файлы: `static/img/years/` и `data/year_images.json` (поле `image` у первой новости года в `history.json`).
Если у года нет своего фото (например 1992, 2009), показывается ближайшее предыдущее.
=======
Фото по годам — прямые ссылки с [истории ЛУКОЙЛ](https://lukoil.ru/Company/history/History):

```bash
py -3 scripts/link_year_images.py
```

Ссылки пишутся в `data/year_images.json` и в поле `image` у первой новости года в `history.json`.
Если у года нет своего фото (1992, 2009), показывается ближайшее предыдущее.
>>>>>>> Stashed changes

Цены Brent ($/баррель) — среднегодовые из [FRED POILBREUSDA](https://fred.stlouisfed.org/series/POILBREUSDA):

```bash
py -3 scripts/fetch_brent_prices.py
```

Файл: `data/brent_prices.json` (также обновляет `oilPrice` в `history.json`).

Добыча нефти ЛУКОЙЛ (млн т/год) — `data/lukoil_production.json`:

```bash
py -3 scripts/apply_lukoil_production.py
```

>>>>>>> Stashed changes
## Структура

```
LukoilHistory/
├── app.py                 # FastAPI-приложение
├── requirements.txt
├── data/
│   └── history.json       # События ленты
├── static/
│   ├── css/style.css
│   ├── js/app.js
│   └── audio/tick.wav
└── templates/
    └── index.html
```

## Формат события

```json
{
  "year": 1991,
  "title": "Создание концерна ЛУКОЙЛ",
  "desc": "Краткое описание…",
  "source": "lukoil",
  "oilPrice": 20.0,
  "techIndex": 8,
  "barrelsHint": 1991000
}
```

`source`: `lukoil` | `sirius` | `industry`

## Управление

- Тяните слайдер внизу экрана — меняются год, карточка и график.
- На графике остаются все точки до выбранного года.
- Фон плавно «теплеет» к 2026; при смене года играет короткий щелчок.
