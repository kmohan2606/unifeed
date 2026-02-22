from fastapi import APIRouter, Request

from app.db import get_balance, get_user_bets
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


@router.get("/balance")
def get_user_balance(request: Request):
    user = get_current_user(request)
    balance = get_balance(user["id"])
    bets = get_user_bets(user["id"])
    in_positions = sum(b["total_cost"] for b in bets)
    return {
        "total": round(balance + in_positions, 2),
        "available": round(balance, 2),
        "inPositions": round(in_positions, 2),
        "todayPnl": 0.0,
        "todayPnlPercent": 0.0,
    }


@router.get("/positions")
def list_positions(request: Request):
    user = get_current_user(request)
    bets = get_user_bets(user["id"])
    positions = []
    for b in bets:
        positions.append({
            "id": f"p{b['id']}",
            "marketId": b["market_id"],
            "marketTitle": b["market_title"],
            "side": b["side"],
            "platform": b["platform"],
            "quantity": b["shares"],
            "avgPrice": b["price_per_share"],
            "currentPrice": b["price_per_share"],
            "pnl": 0.0,
            "pnlPercent": 0.0,
            "timestamp": b["created_at"],
        })
    return positions
