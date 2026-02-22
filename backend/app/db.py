"""
SQLite store. DB file lives at backend/app/data/data/users.db.
Tables: users, bets, wallets.
"""
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

import bcrypt

DB_PATH = Path(__file__).parent / "data" / "data" / "users.db"


def _connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _init_db():
    conn = _connect()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            balance REAL NOT NULL DEFAULT 500.0,
            created_at TEXT NOT NULL
        )
    """)

    # Migrate: add balance column to existing users tables that lack it
    cols = [r["name"] for r in conn.execute("PRAGMA table_info(users)").fetchall()]
    if "balance" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN balance REAL NOT NULL DEFAULT 500.0")

    conn.execute("""
        CREATE TABLE IF NOT EXISTS bets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            market_id TEXT NOT NULL,
            market_title TEXT NOT NULL,
            side TEXT NOT NULL,
            shares REAL NOT NULL,
            price_per_share REAL NOT NULL,
            total_cost REAL NOT NULL,
            platform TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS wallets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
            address TEXT NOT NULL,
            chain TEXT NOT NULL,
            connected_at TEXT NOT NULL
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS user_settings (
            user_id INTEGER PRIMARY KEY REFERENCES users(id),
            kalshi_api_key TEXT,
            kalshi_api_secret TEXT,
            preferred_payment_token TEXT,
            preferred_payment_chain_id INTEGER,
            kalshi_balance REAL NOT NULL DEFAULT 500.0
        )
    """)

    conn.commit()
    conn.close()


_init_db()


# ── User helpers ──────────────────────────────────────────────

def _user_dict(row):
    if row is None:
        return None
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "balance": row["balance"],
    }


def create_user(name, email, password):
    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    now = datetime.now(timezone.utc).isoformat()
    conn = _connect()
    try:
        conn.execute(
            "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (name, email, pw_hash, now),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        return _user_dict(row)
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()


def get_user_by_email(email):
    conn = _connect()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_id(user_id):
    conn = _connect()
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def verify_password(plain, hashed):
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def get_balance(user_id):
    conn = _connect()
    row = conn.execute("SELECT balance FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return row["balance"] if row else 0.0


def add_balance(user_id, amount):
    if amount <= 0:
        return get_balance(user_id)
    conn = _connect()
    try:
        conn.execute("UPDATE users SET balance = balance + ? WHERE id = ?", (amount, user_id))
        conn.commit()
        row = conn.execute("SELECT balance FROM users WHERE id = ?", (user_id,)).fetchone()
        return row["balance"] if row else 0.0
    finally:
        conn.close()


# ── Bet helpers ───────────────────────────────────────────────

def place_bet(user_id, market_id, market_title, side, shares, price_per_share, total_cost, platform):
    conn = _connect()
    try:
        row = conn.execute("SELECT balance FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row or row["balance"] < total_cost:
            return None
        conn.execute("UPDATE users SET balance = balance - ? WHERE id = ?", (total_cost, user_id))
        now = datetime.now(timezone.utc).isoformat()
        conn.execute(
            "INSERT INTO bets (user_id, market_id, market_title, side, shares, price_per_share, total_cost, platform, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (user_id, market_id, market_title, side, shares, price_per_share, total_cost, platform, now),
        )
        conn.commit()
        bet_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        bet_row = conn.execute("SELECT * FROM bets WHERE id = ?", (bet_id,)).fetchone()
        return dict(bet_row)
    finally:
        conn.close()


def get_user_bets(user_id):
    conn = _connect()
    rows = conn.execute("SELECT * FROM bets WHERE user_id = ? ORDER BY created_at DESC", (user_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── Wallet helpers ────────────────────────────────────────────

def save_wallet(user_id, address, chain):
    conn = _connect()
    now = datetime.now(timezone.utc).isoformat()
    try:
        conn.execute(
            "INSERT OR REPLACE INTO wallets (user_id, address, chain, connected_at) VALUES (?, ?, ?, ?)",
            (user_id, address, chain, now),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM wallets WHERE user_id = ?", (user_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def get_wallet(user_id):
    conn = _connect()
    row = conn.execute("SELECT * FROM wallets WHERE user_id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def remove_wallet(user_id):
    conn = _connect()
    conn.execute("DELETE FROM wallets WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()
