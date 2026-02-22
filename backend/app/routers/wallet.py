from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.db import save_wallet, get_wallet, remove_wallet
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/wallet", tags=["wallet"])


class ConnectWalletBody(BaseModel):
    address: str
    chain: str


@router.post("")
def connect_wallet(body: ConnectWalletBody, request: Request):
    user = get_current_user(request)
    wallet = save_wallet(user["id"], body.address, body.chain)
    return wallet


@router.get("")
def read_wallet(request: Request):
    user = get_current_user(request)
    wallet = get_wallet(user["id"])
    return wallet


@router.delete("")
def disconnect_wallet(request: Request):
    user = get_current_user(request)
    remove_wallet(user["id"])
    return {"ok": True}
