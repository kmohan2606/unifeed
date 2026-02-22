from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.db import place_bet, get_user_bets, get_balance
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/bets", tags=["bets"])


class PlaceBetBody(BaseModel):
    market_id: str
    market_title: str
    side: str
    shares: float
    price_per_share: float
    platform: str


@router.post("")
def create_bet(body: PlaceBetBody, request: Request):
    user = get_current_user(request)
    total_cost = round(body.shares * body.price_per_share, 2)
    bet = place_bet(
        user["id"],
        body.market_id,
        body.market_title,
        body.side,
        body.shares,
        body.price_per_share,
        total_cost,
        body.platform,
    )
    if bet is None:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    balance = get_balance(user["id"])
    return {"bet": bet, "balance": balance}


@router.get("")
def list_bets(request: Request):
    user = get_current_user(request)
    return get_user_bets(user["id"])
