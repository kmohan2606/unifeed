from fastapi import APIRouter, HTTPException

from app.data import get_market_by_id, get_markets_page, generate_orderbook, CATEGORIES

router = APIRouter(prefix="/api/markets", tags=["markets"])


@router.get("")
def list_markets(category=None, page=1, limit=25):
    """List markets with pagination and optional category filter."""
    return get_markets_page(category=category, page=int(page), limit=int(limit))


@router.get("/categories")
def list_categories():
    """Return available category names."""
    return CATEGORIES


@router.get("/{market_id}")
def get_market(market_id):
    """Get a single market by ID."""
    market = get_market_by_id(market_id)
    if not market:
        raise HTTPException(status_code=404, detail="Market not found")
    return market


@router.get("/{market_id}/news")
def get_market_news(market_id):
    """Get news items for a market."""
    from app.data import get_news_for_market
    return get_news_for_market(market_id)


@router.get("/{market_id}/orderbook")
def get_market_orderbook(market_id, platform="kalshi"):
    """Get orderbook for a market on a given platform."""
    if platform not in ("kalshi", "polymarket"):
        raise HTTPException(status_code=400, detail="platform must be kalshi or polymarket")
    market = get_market_by_id(market_id)
    if not market:
        raise HTTPException(status_code=404, detail="Market not found")
    return generate_orderbook(market, platform)
