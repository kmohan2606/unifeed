"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MarketCard } from "@/components/market-card"
import { MarketFilters } from "@/components/market-filters"
import { getMarkets } from "@/lib/api/markets"
import type { Market } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 25

export function Dashboard() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [markets, setMarkets] = useState<Market[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const initialLoad = useRef(true)

  const fetchPage = useCallback(async (cat: string, pg: number, append: boolean) => {
    setIsLoading(true)
    try {
      const data = await getMarkets(cat, pg, PAGE_SIZE)
      setMarkets((prev) => (append ? [...prev, ...data.markets] : data.markets))
      setTotalPages(data.totalPages)
      setTotal(data.total)
      setPage(pg)
    } catch (e) {
      console.error("Failed to fetch markets:", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPage(activeCategory, 1, false)
  }, [activeCategory, fetchPage])

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat)
    setPage(1)
    setMarkets([])
  }

  function handleLoadMore() {
    if (page < totalPages && !isLoading) {
      fetchPage(activeCategory, page + 1, true)
    }
  }

  const hasMore = page < totalPages

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Markets</h1>
        <p className="text-sm text-muted-foreground">
          {total.toLocaleString()} aggregated prediction markets across Kalshi and Polymarket
        </p>
      </div>

      <MarketFilters
        activeCategory={activeCategory}
        setActiveCategory={handleCategoryChange}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {markets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>

      {isLoading && markets.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && markets.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16">
          <p className="text-sm text-muted-foreground">No markets found for this category.</p>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
