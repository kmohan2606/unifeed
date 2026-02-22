import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.db import create_user, get_user_by_email, get_user_by_id, verify_password, _user_dict

router = APIRouter(prefix="/api/auth", tags=["auth"])

JWT_SECRET = os.environ.get("JWT_SECRET", "unifeed-dev-secret-key-min-32-bytes!")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 7


def _make_token(user_id):
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return int(payload["sub"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, KeyError, ValueError):
        return None


def get_current_user(request: Request):
    """Reusable dependency: decode Bearer token -> return user dict or raise 401."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    user_id = _decode_token(auth[7:])
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    row = get_user_by_id(user_id)
    if not row:
        raise HTTPException(status_code=401, detail="User not found")
    return _user_dict(row)


class SignUpBody(BaseModel):
    name: str
    email: str
    password: str


class SignInBody(BaseModel):
    email: str
    password: str


@router.post("/signup")
def signup(body: SignUpBody):
    user = create_user(body.name, body.email, body.password)
    if not user:
        raise HTTPException(status_code=409, detail="Email already registered")
    token = _make_token(user["id"])
    return {"token": token, "user": user}


@router.post("/signin")
def signin(body: SignInBody):
    row = get_user_by_email(body.email)
    if not row or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = _user_dict(row)
    token = _make_token(user["id"])
    return {"token": token, "user": user}


@router.get("/me")
def me(request: Request):
    user = get_current_user(request)
    return {"user": user}
