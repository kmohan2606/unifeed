"""
Pydantic models matching the frontend TypeScript types (lib/types.ts).
Keep in sync when changing API contract.
"""
from pydantic import BaseModel, Field


class PlatformPrice(BaseModel):
    platform: str
    yes_price: float = Field(alias="yesPrice")
    no_price: float = Field(alias="noPrice")
    volume: int
    open_interest: int = Field(alias="openInterest")

    model_config = {"populate_by_name": True}


class PricePoint(BaseModel):
    time: str
    kalshi_yes: float | None = Field(None, alias="kalshiYes")
    polymarket_yes: float | None = Field(None, alias="polymarketYes")
    best_yes: float = Field(alias="bestYes")

    model_config = {"populate_by_name": True}


class BestPrice(BaseModel):
    price: float
    platform: str


class PlatformUrls(BaseModel):
    kalshi: str | None = None
    polymarket: str | None = None


class Market(BaseModel):
    id: str
    title: str
    category: str
    description: str
    end_date: str = Field(alias="endDate")
    status: str
    resolution: str | None = None
    platforms: list[PlatformPrice]
    best_yes: BestPrice = Field(alias="bestYes")
    best_no: BestPrice = Field(alias="bestNo")
    spread: float
    change24h: float = Field(alias="change24h")
    total_volume: int = Field(alias="totalVolume")
    price_history: list[PricePoint] = Field(alias="priceHistory")
    tags: list[str]
    rules: list[str]
    platform_urls: PlatformUrls = Field(alias="platformUrls")

    model_config = {"populate_by_name": True}


class Position(BaseModel):
    id: str
    market_id: str = Field(alias="marketId")
    market_title: str = Field(alias="marketTitle")
    side: str
    platform: str
    quantity: int
    avg_price: float = Field(alias="avgPrice")
    current_price: float = Field(alias="currentPrice")
    pnl: float
    pnl_percent: float = Field(alias="pnlPercent")
    timestamp: str

    model_config = {"populate_by_name": True}


class NewsItem(BaseModel):
    id: str
    title: str
    source: str
    url: str
    timestamp: str
    sentiment: str
    market_id: str = Field(alias="marketId")

    model_config = {"populate_by_name": True}


class UserBalance(BaseModel):
    total: float
    available: float
    in_positions: float = Field(alias="inPositions")
    today_pnl: float = Field(alias="todayPnl")
    today_pnl_percent: float = Field(alias="todayPnlPercent")

    model_config = {"populate_by_name": True}


class OrderbookEntry(BaseModel):
    price: float
    quantity: int
    total: int
    platform: str


class OrderbookData(BaseModel):
    bids: list[OrderbookEntry]
    asks: list[OrderbookEntry]
    mid_price: float = Field(alias="midPrice")
    spread_percent: float = Field(alias="spreadPercent")

    model_config = {"populate_by_name": True}
