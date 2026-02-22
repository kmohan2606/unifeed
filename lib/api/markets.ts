import type { Market } from "@/lib/types"
import { useMockData, apiUrl } from "./config"
import { markets as mockMarkets } from "@/lib/mock-data"

export interface MarketsPage {
  markets: Market[]
  total: number
  page: number
  totalPages: number
}

// In-memory cache — survives client-side navigation (module is a singleton in the browser bundle)
const _cache = new Map<string, { data: MarketsPage; ts: number }>()
const CACHE_TTL_MS = 60_000 // 1 minute

export async function getMarkets(
  category?: string,
  page = 1,
  limit = 25,
  q?: string
): Promise<MarketsPage> {
  if (useMockData) {
    let filtered = mockMarkets
    if (category && category !== "All") {
      filtered = filtered.filter((m) => m.category === category)
    }
    if (q) {
      const ql = q.toLowerCase()
      filtered = filtered.filter(
        (m) => m.title.toLowerCase().includes(ql) || (m.description ?? "").toLowerCase().includes(ql)
      )
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
  const cacheKey = `${category ?? "All"}|${page}|${limit}|${q ?? ""}`
  const hit = _cache.get(cacheKey)
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.data

  const params = new URLSearchParams()
  if (category && category !== "All") params.set("category", category)
  if (q) params.set("q", q)
  params.set("page", String(page))
  params.set("limit", String(limit))
  const res = await fetch(apiUrl(`/api/markets?${params}`))
  if (!res.ok) throw new Error("Failed to fetch markets")
  const data: MarketsPage = await res.json()
  _cache.set(cacheKey, { data, ts: Date.now() })
  return data
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

export async function getMarketSentiment(slug: string): Promise<string> {
  if (useMockData) {
    return "Sentiment analysis is not available in mock mode."
  }
  try {
    const res = await fetch(apiUrl(`/analyze/?topic=${encodeURIComponent(slug)}`), {
      method: "POST",
      cache: "no-store",
    })
    if (!res.ok) return "Sentiment analysis unavailable."
    const data = await res.json()
    return data.result ?? "No analysis available."
  } catch {
    return "Sentiment analysis unavailable."
  }
}

export interface AnalysisNewsItem {
  title: string
  link: string
  source_name: string
  pubDate: string
  description: string
}

export interface AnalysisDiscussion {
  title: string
  url: string
  description: string
  age: string
  forum_name: string
  score: string
  num_answers: number
}

async function pollUntilReady<T>(
  url: string,
  extract: (data: any) => T | null,
  maxAttempts = 15,
  interval = 2000
): Promise<T | null> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, interval))
        continue
      }
      const data = await res.json()
      if (
        (data.status === "ready" || data.status === "success") &&
        extract(data)
      ) {
        return extract(data)
      }
    } catch {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, interval))
  }
  return null
}

export async function getAnalysisNews(topic: string): Promise<AnalysisNewsItem[]> {
  if (useMockData) return []
  const url = apiUrl(`/newsdata/?topic=${encodeURIComponent(topic)}`)
  const results = await pollUntilReady<AnalysisNewsItem[]>(
    url,
    (data) => {
      const raw = data.results ?? []
      if (raw.length > 0) {
        return raw.map((item: any) => ({
          title: item.title,
          link: item.link,
          source_name: item.source_name,
          pubDate: item.pubDate,
          description: item.description,
        }))
      }
      return null
    }
  )
  return results ?? []
}

export async function getAnalysisDiscussions(topic: string): Promise<AnalysisDiscussion[]> {
  if (useMockData) return []
  const url = apiUrl(`/redditData/?topic=${encodeURIComponent(topic)}`)
  const results = await pollUntilReady<AnalysisDiscussion[]>(
    url,
    (data) => {
      const raw = data.discussions?.results ?? []
      if (raw.length > 0) {
        return raw.map((r: any) => ({
          title: r.title,
          url: r.url,
          description: r.description,
          age: r.age,
          forum_name: r.data?.forum_name ?? "",
          score: r.data?.score ?? "0",
          num_answers: r.data?.num_answers ?? 0,
        }))
      }
      return null
    }
  )
  return results ?? []
}
