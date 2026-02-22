from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure the backend always reads project-root .env
load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")

from app.routers import markets, portfolio, news, auth, bets, wallet, swap
from app import api_server

app = FastAPI(
    title="UniFeed API",
    description="Prediction market aggregator backend. Replace mock data in app.data with your DB or external APIs.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(markets.router)
app.include_router(portfolio.router)
app.include_router(news.router)
app.include_router(bets.router)
app.include_router(wallet.router)
app.include_router(swap.router)
app.include_router(api_server.router)


@app.get("/")
def root():
    return {"service": "UniFeed API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
