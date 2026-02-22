"""
Loads real markets from JSON files, enriches with random pricing data,
and exposes paginated/filtered access for the API.
"""
import json
import math
import random
import re
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"

KALSHI_CATEGORIES = ["Economics", "General Affairs", "Companies", "Science and Technology"]
POLYMARKET_CATEGORIES = ["Weather", "Health", "Mentions", "Sports"]
CATEGORIES = KALSHI_CATEGORIES + POLYMARKET_CATEGORIES

HOURS = [
    "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "00:00", "02:00",
    "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00",
    "20:00", "22:00", "00:00", "02:00", "04:00", "06:00", "08:00", "Now",
]


def _price_history(base_kalshi, base_poly):
    points = []
    k = base_kalshi - 0.15
    p = base_poly - 0.12
    for i in range(24):
        k += (random.random() - 0.45) * 0.03
        p += (random.random() - 0.45) * 0.03
        k = max(0.01, min(0.99, k))
        p = max(0.01, min(0.99, p))
        points.append({
            "time": HOURS[i],
            "kalshiYes": round(k, 3),
            "polymarketYes": round(p, 3),
            "bestYes": round(min(k, p), 3),
        })
    return points


def _slugify(text):
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:80]


def _build_market(raw_id, title, description, category, source):
    k_yes = round(random.uniform(0.10, 0.90), 2)
    p_yes = round(k_yes + random.uniform(-0.05, 0.05), 2)
    p_yes = max(0.05, min(0.95, p_yes))

    k_no = round(1 - k_yes, 2)
    p_no = round(1 - p_yes, 2)

    k_vol = random.randint(50_000, 15_000_000)
    p_vol = random.randint(50_000, 15_000_000)

    spread = round(abs(k_yes - p_yes), 3)
    best_yes_price = min(k_yes, p_yes)
    best_yes_platform = "kalshi" if k_yes <= p_yes else "polymarket"
    best_no_price = min(k_no, p_no)
    best_no_platform = "kalshi" if k_no <= p_no else "polymarket"

    return {
        "id": raw_id,
        "title": title,
        "category": category,
        "description": description,
        "endDate": "2027-12-31",
        "status": "open",
        "platforms": [
            {
                "platform": "kalshi",
                "yesPrice": k_yes,
                "noPrice": k_no,
                "volume": k_vol,
                "openInterest": k_vol // 3,
            },
            {
                "platform": "polymarket",
                "yesPrice": p_yes,
                "noPrice": p_no,
                "volume": p_vol,
                "openInterest": p_vol // 3,
            },
        ],
        "bestYes": {"price": best_yes_price, "platform": best_yes_platform},
        "bestNo": {"price": best_no_price, "platform": best_no_platform},
        "spread": spread,
        "change24h": round(random.uniform(-5.0, 5.0), 1),
        "totalVolume": k_vol + p_vol,
        "priceHistory": _price_history(k_yes, p_yes),
        "tags": [],
        "rules": [],
        "platformUrls": {},
        "source": source,
    }


def _load_all():
    all_markets = []
    seen_ids = set()

    kalshi_path = DATA_DIR / "kalshi_markets.json"
    poly_path = DATA_DIR / "polymarket_markets.json"

    if kalshi_path.exists():
        with open(kalshi_path) as f:
            kalshi_data = json.load(f)
        for cat in KALSHI_CATEGORIES:
            for entry in kalshi_data.get(cat, []):
                ticker, title, desc = entry[0], entry[1], entry[2]
                if ticker in seen_ids:
                    continue
                seen_ids.add(ticker)
                all_markets.append(_build_market(ticker, title, desc, cat, "kalshi"))

    if poly_path.exists():
        with open(poly_path) as f:
            poly_data = json.load(f)
        for cat in POLYMARKET_CATEGORIES:
            for entry in poly_data.get(cat, []):
                title, desc = entry[0], entry[1]
                mid = _slugify(title)
                if mid in seen_ids:
                    mid = mid + "-" + str(random.randint(1000, 9999))
                seen_ids.add(mid)
                all_markets.append(_build_market(mid, title, desc, cat, "polymarket"))

    all_markets.sort(key=lambda m: m["totalVolume"], reverse=True)
    return all_markets


# Loaded once at import time
all_markets = _load_all()
_index = {m["id"]: m for m in all_markets}

print(f"[market_loader] Loaded {len(all_markets)} markets across {len(CATEGORIES)} categories")


def get_market_by_id(market_id):
    return _index.get(market_id)


def get_markets_page(category=None, page=1, limit=25):
    if category and category != "All":
        filtered = [m for m in all_markets if m["category"] == category]
    else:
        filtered = all_markets

    total = len(filtered)
    total_pages = math.ceil(total / limit) if total > 0 else 1
    start = (page - 1) * limit
    end = start + limit

    return {
        "markets": filtered[start:end],
        "total": total,
        "page": page,
        "totalPages": total_pages,
    }
