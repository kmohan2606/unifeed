"""
Mock data matching the frontend (lib/mock-data.ts). Replace with DB or external APIs.
"""
import random


def _price_history(base_kalshi, base_poly):
    points = []
    k_price = base_kalshi - 0.15
    p_price = base_poly - 0.12
    hours = [
        "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "00:00", "02:00",
        "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00",
        "20:00", "22:00", "00:00", "02:00", "04:00", "06:00", "08:00", "Now",
    ]
    for i in range(24):
        k_price += (random.random() - 0.45) * 0.03
        p_price += (random.random() - 0.45) * 0.03
        k_price = max(0.01, min(0.99, k_price))
        p_price = max(0.01, min(0.99, p_price))
        best = min(k_price, p_price)
        points.append({
            "time": hours[i],
            "kalshiYes": round(k_price, 3),
            "polymarketYes": round(p_price, 3),
            "bestYes": round(best, 3),
        })
    return points


def _market(
    id,
    title,
    category,
    description,
    end_date,
    k_yes,
    k_no,
    p_yes,
    p_no,
    k_vol,
    p_vol,
    best_yes_platform,
    best_no_platform,
    spread,
    change24h,
    tags,
    rules,
    k_url,
    p_url,
):
    total_vol = k_vol + p_vol
    return {
        "id": id,
        "title": title,
        "category": category,
        "description": description,
        "endDate": end_date,
        "status": "open",
        "platforms": [
            {"platform": "kalshi", "yesPrice": k_yes, "noPrice": k_no, "volume": k_vol, "openInterest": k_vol // 2},
            {"platform": "polymarket", "yesPrice": p_yes, "noPrice": p_no, "volume": p_vol, "openInterest": p_vol // 2},
        ],
        "bestYes": {"price": p_yes if best_yes_platform == "polymarket" else k_yes, "platform": best_yes_platform},
        "bestNo": {"price": k_no if best_no_platform == "kalshi" else p_no, "platform": best_no_platform},
        "spread": spread,
        "change24h": change24h,
        "totalVolume": total_vol,
        "priceHistory": _price_history(k_yes, p_yes),
        "tags": tags,
        "rules": rules,
        "platformUrls": {"kalshi": k_url, "polymarket": p_url},
    }


MARKETS_RAW = [
    _market(
        "m1",
        "Will the Federal Reserve cut rates in March 2026?",
        "Economics",
        "Resolves YES if the Federal Reserve announces a rate cut at or before its March 2026 FOMC meeting.",
        "2026-03-19",
        0.62, 0.38, 0.59, 0.41,
        2_450_000, 3_100_000,
        "polymarket", "kalshi",
        0.03, 2.4,
        ["Fed", "Interest Rates", "Macro"],
        ["Resolves YES if the FOMC announces a reduction in the federal funds target rate at or before its March 18-19, 2026 meeting.", "Resolution source: federalreserve.gov."],
        "https://kalshi.com/markets/fed-rate-cut-march-2026",
        "https://polymarket.com/event/fed-rate-cut-march-2026",
    ),
    _market(
        "m2",
        "Will Bitcoin exceed $150,000 by end of Q2 2026?",
        "Crypto",
        "Resolves YES if Bitcoin's price exceeds $150,000 at any point before June 30, 2026.",
        "2026-06-30",
        0.34, 0.66, 0.37, 0.63,
        4_200_000, 8_900_000,
        "kalshi", "polymarket",
        0.03, -1.8,
        ["Bitcoin", "Crypto", "Price"],
        ["Resolves YES if BTC/USD exceeds $150,000 before 11:59 PM ET June 30, 2026.", "Price from CoinGecko BTC/USD index."],
        "https://kalshi.com/markets/btc-150k-q2-2026",
        "https://polymarket.com/event/btc-150k-q2-2026",
    ),
    _market(
        "m3",
        "Will the US GDP growth exceed 3% in Q1 2026?",
        "Economics",
        "Resolves YES if the BEA reports Q1 2026 GDP growth above 3% annualized.",
        "2026-04-30",
        0.28, 0.72, 0.31, 0.69,
        1_200_000, 980_000,
        "kalshi", "polymarket",
        0.03, 0.5,
        ["GDP", "Economy", "Growth"],
        ["Resolves YES if BEA advance estimate reports annualized real GDP growth above 3.0% for Q1 2026."],
        "https://kalshi.com/markets/gdp-q1-2026",
        "https://polymarket.com/event/gdp-q1-2026",
    ),
    _market(
        "m4",
        "Will Tesla deliver over 500K vehicles in Q1 2026?",
        "Tech",
        "Resolves YES if Tesla reports Q1 2026 deliveries exceeding 500,000 vehicles.",
        "2026-04-02",
        0.45, 0.55, 0.48, 0.52,
        3_400_000, 2_800_000,
        "kalshi", "polymarket",
        0.03, 3.2,
        ["Tesla", "EV", "Deliveries"],
        ["Resolves YES if Tesla reports total Q1 2026 vehicle deliveries exceeding 500,000 units."],
        "https://kalshi.com/markets/tesla-deliveries-q1-2026",
        "https://polymarket.com/event/tesla-deliveries-q1-2026",
    ),
    _market(
        "m5",
        "Will the Supreme Court rule on TikTok ban by June 2026?",
        "Politics",
        "Resolves YES if the Supreme Court issues a ruling on the TikTok divest-or-ban legislation by June 30, 2026.",
        "2026-06-30",
        0.71, 0.29, 0.68, 0.32,
        1_800_000, 2_200_000,
        "polymarket", "kalshi",
        0.03, -0.9,
        ["TikTok", "Supreme Court", "Regulation"],
        ["Resolves YES if the Supreme Court issues a ruling on the TikTok divest-or-ban legislation by June 30, 2026."],
        "https://kalshi.com/markets/scotus-tiktok-2026",
        "https://polymarket.com/event/scotus-tiktok-2026",
    ),
    _market(
        "m6",
        "Will Nvidia stock price exceed $200 by March 2026?",
        "Tech",
        "Resolves YES if NVDA stock price closes above $200 on any trading day before March 31, 2026.",
        "2026-03-31",
        0.55, 0.45, 0.52, 0.48,
        5_600_000, 4_300_000,
        "polymarket", "kalshi",
        0.03, 4.1,
        ["Nvidia", "AI", "Stocks"],
        ["Resolves YES if NVDA common stock closes above $200.00 on any regular trading day before March 31, 2026."],
        "https://kalshi.com/markets/nvda-200-march-2026",
        "https://polymarket.com/event/nvda-200-march-2026",
    ),
    _market(
        "m7",
        "Will Ukraine-Russia ceasefire be announced by April 2026?",
        "Geopolitics",
        "Resolves YES if an official ceasefire agreement is announced between Ukraine and Russia before April 30, 2026.",
        "2026-04-30",
        0.18, 0.82, 0.21, 0.79,
        2_900_000, 4_100_000,
        "kalshi", "polymarket",
        0.03, -2.1,
        ["Geopolitics", "War", "Peace"],
        ["Resolves YES if an official ceasefire is publicly announced by a credible state authority before April 30, 2026."],
        "https://kalshi.com/markets/ukraine-ceasefire-2026",
        "https://polymarket.com/event/ukraine-ceasefire-2026",
    ),
    _market(
        "m8",
        "Will Apple announce AR glasses at WWDC 2026?",
        "Tech",
        "Resolves YES if Apple officially announces AR glasses or a new AR wearable device at WWDC 2026.",
        "2026-06-15",
        0.23, 0.77, 0.26, 0.74,
        1_500_000, 1_900_000,
        "kalshi", "polymarket",
        0.03, 1.3,
        ["Apple", "AR", "WWDC"],
        ["Resolves YES if Apple announces AR glasses or a new standalone AR wearable during WWDC 2026 keynote."],
        "https://kalshi.com/markets/apple-ar-wwdc-2026",
        "https://polymarket.com/event/apple-ar-wwdc-2026",
    ),
]

markets = MARKETS_RAW

positions = [
    {
        "id": "p1",
        "marketId": "m1",
        "marketTitle": "Will the Federal Reserve cut rates in March 2026?",
        "side": "yes",
        "platform": "polymarket",
        "quantity": 150,
        "avgPrice": 0.52,
        "currentPrice": 0.59,
        "pnl": 10.50,
        "pnlPercent": 13.46,
        "timestamp": "2026-02-15T10:30:00Z",
    },
    {
        "id": "p2",
        "marketId": "m2",
        "marketTitle": "Will Bitcoin exceed $150,000 by end of Q2 2026?",
        "side": "no",
        "platform": "kalshi",
        "quantity": 200,
        "avgPrice": 0.60,
        "currentPrice": 0.66,
        "pnl": 12.00,
        "pnlPercent": 10.00,
        "timestamp": "2026-02-10T14:15:00Z",
    },
    {
        "id": "p3",
        "marketId": "m6",
        "marketTitle": "Will Nvidia stock price exceed $200 by March 2026?",
        "side": "yes",
        "platform": "kalshi",
        "quantity": 100,
        "avgPrice": 0.48,
        "currentPrice": 0.55,
        "pnl": 7.00,
        "pnlPercent": 14.58,
        "timestamp": "2026-02-18T09:00:00Z",
    },
    {
        "id": "p4",
        "marketId": "m5",
        "marketTitle": "Will the Supreme Court rule on TikTok ban by June 2026?",
        "side": "yes",
        "platform": "polymarket",
        "quantity": 75,
        "avgPrice": 0.65,
        "currentPrice": 0.68,
        "pnl": 2.25,
        "pnlPercent": 4.62,
        "timestamp": "2026-02-19T11:45:00Z",
    },
]

news_items = [
    {"id": "n1", "title": "Fed officials signal openness to March rate cut amid cooling inflation", "source": "Reuters", "url": "#", "timestamp": "2026-02-21T08:30:00Z", "sentiment": "positive", "marketId": "m1"},
    {"id": "n2", "title": "January CPI data shows inflation dipping to 2.3%, bolstering rate cut bets", "source": "Bloomberg", "url": "#", "timestamp": "2026-02-20T14:00:00Z", "sentiment": "positive", "marketId": "m1"},
    {"id": "n3", "title": "Fed Governor warns against premature rate cuts, cites labor market strength", "source": "CNBC", "url": "#", "timestamp": "2026-02-19T16:20:00Z", "sentiment": "negative", "marketId": "m1"},
    {"id": "n4", "title": "Bitcoin ETF inflows hit record $2.1B in single day as institutional demand surges", "source": "CoinDesk", "url": "#", "timestamp": "2026-02-21T10:00:00Z", "sentiment": "positive", "marketId": "m2"},
    {"id": "n5", "title": "Analyst: Bitcoin needs to break $120K resistance for $150K target", "source": "The Block", "url": "#", "timestamp": "2026-02-20T09:15:00Z", "sentiment": "neutral", "marketId": "m2"},
    {"id": "n6", "title": "Tesla Cybertruck production ramp exceeds expectations, boosting delivery outlook", "source": "Electrek", "url": "#", "timestamp": "2026-02-21T07:00:00Z", "sentiment": "positive", "marketId": "m4"},
    {"id": "n7", "title": "Nvidia data center revenue projected to double in 2026 amid AI spending boom", "source": "TechCrunch", "url": "#", "timestamp": "2026-02-21T11:30:00Z", "sentiment": "positive", "marketId": "m6"},
    {"id": "n8", "title": "Peace talks between Ukraine and Russia stall over territorial disputes", "source": "AP News", "url": "#", "timestamp": "2026-02-20T18:00:00Z", "sentiment": "negative", "marketId": "m7"},
    {"id": "n9", "title": "Apple patent filings reveal lightweight AR glasses with gesture control", "source": "MacRumors", "url": "#", "timestamp": "2026-02-19T12:45:00Z", "sentiment": "positive", "marketId": "m8"},
    {"id": "n10", "title": "TikTok files emergency motion with Supreme Court challenging divestiture deadline", "source": "Washington Post", "url": "#", "timestamp": "2026-02-21T09:00:00Z", "sentiment": "neutral", "marketId": "m5"},
]

user_balance = {
    "total": 12480.50,
    "available": 8230.25,
    "inPositions": 4250.25,
    "todayPnl": 31.75,
    "todayPnlPercent": 0.26,
}


def get_market_by_id(market_id):
    for m in markets:
        if m["id"] == market_id:
            return m
    return None


def get_news_for_market(market_id):
    return [n for n in news_items if n["marketId"] == market_id]


def generate_orderbook(market, platform_filter=None):
    """Generate synthetic orderbook for a market. Matches frontend logic."""
    platform = platform_filter or "kalshi"
    best_yes = market["bestYes"]["price"]
    best_no = market["bestNo"]["price"]
    base_mid = (best_yes + (1 - best_no)) / 2
    mid_price = base_mid + 0.005 if platform == "kalshi" else base_mid - 0.005

    bids = []
    bid_total = 0
    for i in range(12):
        price = round(mid_price - (i + 1) * 0.01, 2)
        if price <= 0:
            break
        qty = random.randint(500, 5000)
        bid_total += qty
        bids.append({"price": price, "quantity": qty, "total": bid_total, "platform": platform})

    asks = []
    ask_total = 0
    for i in range(12):
        price = round(mid_price + (i + 1) * 0.01, 2)
        if price >= 1:
            break
        qty = random.randint(500, 5000)
        ask_total += qty
        asks.append({"price": price, "quantity": qty, "total": ask_total, "platform": platform})

    best_bid = bids[0]["price"] if bids else mid_price - 0.01
    best_ask = asks[0]["price"] if asks else mid_price + 0.01
    spread_percent = round(((best_ask - best_bid) / mid_price) * 100, 2)

    return {
        "bids": bids,
        "asks": asks,
        "midPrice": round(mid_price, 3),
        "spreadPercent": spread_percent,
    }
