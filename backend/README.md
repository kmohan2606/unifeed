# UniFeed API (Python backend)

FastAPI backend that serves the same contract the Next.js frontend expects. Use this when you set `NEXT_PUBLIC_API_URL` in the frontend.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- OpenAPI docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Wire the frontend

1. In the project root (Next.js app), create or edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
2. The frontend has an API layer in `lib/api/` that uses this URL when set. Ensure pages and components call `getMarkets()`, `getMarketById()`, `getPositions()`, `getUserBalance()`, `getNewsForMarket()`, and `getOrderbook()` from `@/lib/api` (or `lib/api/index.ts`) instead of importing directly from `lib/mock-data`. When `NEXT_PUBLIC_API_URL` is set, those functions request the Python backend instead of returning mock data.
3. Run the frontend with `npm run dev`. With the env var set and components using the API layer, the app will use the Python backend.

## API contract (aligned with frontend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/markets` | List all markets |
| GET | `/api/markets/{id}` | Get one market |
| GET | `/api/markets/{id}/news` | News for a market |
| GET | `/api/markets/{id}/orderbook?platform=kalshi\|polymarket` | Orderbook for market + platform |
| GET | `/api/portfolio/positions` | User positions |
| GET | `/api/portfolio/balance` | User balance |
| GET | `/api/news` | All news |

Response shapes match the TypeScript types in the frontend (`lib/types.ts`). Keys are **camelCase** in JSON.

## Replacing mock data

- **Markets / news / orderbook**: Edit or replace `app/data/mock_data.py`. For production, swap in a DB (e.g. SQLAlchemy, asyncpg) or calls to Kalshi/Polymarket APIs and keep returning the same dict shapes.
- **Portfolio / balance**: Same idea; add auth (e.g. JWT or session) and resolve the current user before returning positions and balance.

## Project layout

```
backend/
  app/
    main.py           # FastAPI app, CORS, router includes
    schemas.py        # Pydantic models (mirror of frontend types)
    data/
      mock_data.py   # Mock data; replace with DB/API
    routers/
      markets.py     # /api/markets, /api/markets/{id}, orderbook, news
      portfolio.py   # /api/portfolio/positions, balance
      news.py        # /api/news
  requirements.txt
  README.md
```
