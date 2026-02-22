from fastapi import APIRouter, HTTPException

from app.analysis import analyze_market_sentiment
from app.data import get_market_by_id
from app.schemas import MarketSentimentResponse

router = APIRouter(prefix="/api/markets", tags=["sentiment"])


@router.get("/{market_id}/sentiment", response_model=MarketSentimentResponse)
def get_market_sentiment(market_id):
    market = get_market_by_id(market_id)
    if not market:
        raise HTTPException(status_code=404, detail="Market not found")

    topic = market.get("title", "").strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Market has no analyzable title")

    return analyze_market_sentiment(topic=topic, market_id=market_id)
