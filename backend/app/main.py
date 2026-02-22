from pathlib import Path

from dotenv import load_dotenv
import os
import json
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app.routers import markets, portfolio, news, auth, bets, wallet
from app.analysis import main as analyze_main

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
NEWSDATA_PATH = os.path.join(BASE_DIR, "newsdata.json")
REDDITDATA_PATH = os.path.join(BASE_DIR, "redditdata.json")

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
app.include_router(settings.router)
app.include_router(api_server.router)


@app.get("/")
def root():
    return {"service": "UniFeed API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


# ─── Analysis endpoints ───────────────────────────────────────────

@app.post("/analyze/")
def analyze_topic(topic: str = Query(...)):
    result = analyze_main(topic)
    return {"result": result}


@app.get("/newsdata/")
def get_newsdata(topic: str = Query(...)):
    try:
        with open(NEWSDATA_PATH, "r") as f:
            data = json.load(f)
            if data.get("topic") != topic:
                return {"status": "not ready", "newsdata": None}
        return {"status": "ready", "newsdata": data}
    except FileNotFoundError:
        return {"status": "not ready", "newsdata": None}


@app.get("/redditData/")
def get_redditdata(topic: str = Query(...)):
    try:
        with open(REDDITDATA_PATH, "r") as f:
            data = json.load(f)
            if data.get("topic") != topic:
                return {"status": "not ready", "redditdata": None}
        return {"status": "ready", "redditdata": data}
    except FileNotFoundError:
        return {"status": "not ready", "redditdata": None}