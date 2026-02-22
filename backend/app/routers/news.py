from fastapi import APIRouter

from app.data import news_items

router = APIRouter(prefix="/api/news", tags=["news"])


@router.get("")
def list_news():
    """List all news items (optionally filter by market later)."""
    return news_items
