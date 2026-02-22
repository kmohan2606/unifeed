import type { NewsItem } from "@/lib/types"
import { useMockData, apiUrl } from "./config"
import { newsItems as mockNewsItems } from "@/lib/mock-data"

export async function getNews(): Promise<NewsItem[]> {
  if (useMockData) {
    return Promise.resolve(mockNewsItems)
  }
  const res = await fetch(apiUrl("/api/news"))
  if (!res.ok) throw new Error("Failed to fetch news")
  return res.json()
}

export async function getNewsForMarket(marketId: string): Promise<NewsItem[]> {
  if (useMockData) {
    return Promise.resolve(mockNewsItems.filter((n) => n.marketId === marketId))
  }
  const res = await fetch(apiUrl(`/api/markets/${marketId}/news`))
  if (!res.ok) throw new Error("Failed to fetch news for market")
  return res.json()
}
