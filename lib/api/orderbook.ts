import type { Market, OrderbookData, Platform } from "@/lib/types"
import { useMockData, apiUrl } from "./config"
import { markets as mockMarkets, generateOrderbook as mockGenerateOrderbook } from "@/lib/mock-data"

export async function getOrderbook(
  marketId: string,
  platform: Platform
): Promise<OrderbookData> {
  if (useMockData) {
    const market = mockMarkets.find((m) => m.id === marketId)
    if (!market) throw new Error("Market not found")
    return Promise.resolve(mockGenerateOrderbook(market, platform))
  }
  const res = await fetch(apiUrl(`/api/markets/${marketId}/orderbook?platform=${platform}`))
  if (!res.ok) throw new Error("Failed to fetch orderbook")
  return res.json()
}

/** Build orderbook from a Market in hand (e.g. when backend is not used). */
export function buildOrderbookFromMarket(
  market: Market,
  platform: Platform
): OrderbookData {
  return mockGenerateOrderbook(market, platform)
}
