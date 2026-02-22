from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.db import get_user_settings, upsert_user_settings
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/settings", tags=["settings"])


class SettingsUpdateBody(BaseModel):
    kalshi_api_key: str | None = None
    kalshi_api_secret: str | None = None
    preferred_payment_token: str | None = None
    preferred_payment_chain_id: int | None = None


@router.get("")
def get_settings(request: Request):
    user = get_current_user(request)
    settings = get_user_settings(user["id"])
    if not settings:
        return {
            "kalshi_api_key": None,
            "kalshi_api_secret": None,
            "preferred_payment_token": None,
            "preferred_payment_chain_id": None,
        }
    return {
        "kalshi_api_key": (settings["kalshi_api_key"][:20] + "...") if settings.get("kalshi_api_key") else None,
        "kalshi_api_secret": "***" if settings.get("kalshi_api_secret") else None,
        "preferred_payment_token": settings["preferred_payment_token"],
        "preferred_payment_chain_id": settings["preferred_payment_chain_id"],
    }


@router.get("/full")
def get_settings_full(request: Request):
    user = get_current_user(request)
    settings = get_user_settings(user["id"])
    if not settings:
        return {
            "kalshi_api_key": None,
            "kalshi_api_secret": None,
            "preferred_payment_token": None,
            "preferred_payment_chain_id": None,
        }
    return settings


@router.patch("")
def update_settings(body: SettingsUpdateBody, request: Request):
    user = get_current_user(request)
    result = upsert_user_settings(
        user["id"],
        kalshi_api_key=body.kalshi_api_key,
        kalshi_api_secret=body.kalshi_api_secret,
        preferred_payment_token=body.preferred_payment_token,
        preferred_payment_chain_id=body.preferred_payment_chain_id,
    )
    return result
