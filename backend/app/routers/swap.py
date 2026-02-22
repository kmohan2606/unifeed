import os

import httpx
from fastapi import APIRouter, HTTPException, Query, Request

from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/swap", tags=["swap"])

ONEINCH_BASE = "https://api.1inch.dev"
ONEINCH_API_KEY = os.environ.get("ONEINCH_API_KEY", "")
TIMEOUT = 15


def _auth_headers():
    return {
        "Authorization": f"Bearer {ONEINCH_API_KEY}",
        "Accept": "application/json",
    }


def _require_key():
    if not ONEINCH_API_KEY:
        raise HTTPException(503, "1inch API key not configured")


@router.get("/tokens")
async def swap_tokens(request: Request, chainId: int = Query(137)):
    get_current_user(request)
    _require_key()
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{ONEINCH_BASE}/token/v1.2/{chainId}",
            headers=_auth_headers(),
            timeout=TIMEOUT,
        )
    if r.status_code != 200:
        raise HTTPException(r.status_code, r.text)
    return r.json()


@router.get("/quote")
async def swap_quote(
    request: Request,
    chainId: int = Query(137),
    src: str = Query(...),
    dst: str = Query(...),
    amount: str = Query(...),
):
    get_current_user(request)
    _require_key()
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{ONEINCH_BASE}/swap/v6.0/{chainId}/quote",
            headers=_auth_headers(),
            params={
                "src": src,
                "dst": dst,
                "amount": amount,
                "includeTokensInfo": "true",
                "includeProtocols": "true",
            },
            timeout=TIMEOUT,
        )
    if r.status_code != 200:
        raise HTTPException(r.status_code, r.text)
    return r.json()


@router.get("/price")
async def swap_price(
    request: Request,
    chainId: int = Query(137),
    src: str = Query(...),
    dst: str = Query(...),
    amount: str = Query(...),
):
    """Lighter-weight pricing: returns just amounts and gas without routing details."""
    get_current_user(request)
    _require_key()
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{ONEINCH_BASE}/swap/v6.0/{chainId}/quote",
            headers=_auth_headers(),
            params={"src": src, "dst": dst, "amount": amount},
            timeout=TIMEOUT,
        )
    if r.status_code != 200:
        raise HTTPException(r.status_code, r.text)
    data = r.json()
    return {
        "srcAmount": data.get("srcAmount"),
        "dstAmount": data.get("dstAmount"),
        "gas": data.get("gas"),
    }
