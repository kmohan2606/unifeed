import type { Market } from "@/lib/types"
import { useMockData, apiUrl } from "./config"
import { markets as mockMarkets } from "@/lib/mock-data"

export interface MarketsPage {
  markets: Market[]
  total: number
  page: number
  totalPages: number
}

export async function getMarkets(
  category?: string,
  page = 1,
  limit = 25
): Promise<MarketsPage> {
  if (useMockData) {
    let filtered = mockMarkets
    if (category && category !== "All") {
      filtered = filtered.filter((m) => m.category === category)
    }
    const total = filtered.length
    const start = (page - 1) * limit
    return {
      markets: filtered.slice(start, start + limit),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }
  const params = new URLSearchParams()
  if (category && category !== "All") params.set("category", category)
  params.set("page", String(page))
  params.set("limit", String(limit))
  const res = await fetch(apiUrl(`/api/markets?${params}`))
  if (!res.ok) throw new Error("Failed to fetch markets")
  return res.json()
}

export async function getMarketById(id: string): Promise<Market | null> {
  if (useMockData) {
    return Promise.resolve(mockMarkets.find((m) => m.id === id) ?? null)
  }
  const res = await fetch(apiUrl(`/api/markets/${id}`))
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Failed to fetch market")
  return res.json()
}
