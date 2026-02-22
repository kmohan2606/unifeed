export type Platform = "kalshi" | "polymarket"

export interface PlatformPrice {
  platform: Platform
  yesPrice: number
  noPrice: number
  volume: number
  openInterest: number
}

export interface PricePoint {
  time: string
  kalshiYes: number | null
  polymarketYes: number | null
  bestYes: number
}

export interface Market {
  id: string
  title: string
  category: string
  description: string
  endDate: string
  status: "open" | "closed" | "resolved"
  resolution?: "yes" | "no"
  platforms: PlatformPrice[]
  bestYes: { price: number; platform: Platform }
  bestNo: { price: number; platform: Platform }
  spread: number
  change24h: number
  totalVolume: number
  priceHistory: PricePoint[]
  tags: string[]
  rules: string[]
  platformUrls: {
    kalshi?: string
    polymarket?: string
  }
}

export interface Position {
  id: string
  marketId: string
  marketTitle: string
  side: "yes" | "no"
  platform: Platform
  quantity: number
  avgPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  timestamp: string
}

export interface NewsItem {
  id: string
  title: string
  source: string
  url: string
  timestamp: string
  sentiment: "positive" | "neutral" | "negative"
  marketId: string
}

export interface OrderPreview {
  side: "yes" | "no"
  amount: number
  recommendedPlatform: Platform
  prices: {
    kalshi: number
    polymarket: number
  }
  estimatedShares: number
  estimatedCost: number
  savings: number
}

export interface UserBalance {
  total: number
  available: number
  inPositions: number
  todayPnl: number
  todayPnlPercent: number
}

export interface OrderbookEntry {
  price: number
  quantity: number
  total: number
  platform: Platform
}

export interface OrderbookData {
  bids: OrderbookEntry[]
  asks: OrderbookEntry[]
  midPrice: number
  spreadPercent: number
}
