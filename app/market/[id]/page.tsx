"use client"

import React, { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { TopNav } from "@/components/top-nav"
import { MobileNav } from "@/components/mobile-nav"
import { MarketDetail } from "@/components/market-detail"
import { AuthGuard } from "@/components/auth-guard"
import { getMarketById, getNewsForMarket } from "@/lib/api"
import type { NewsItem } from "@/lib/types"

// Simple spinner component
function Spinner() {
  return (
    <div className="flex items-center justify-center h-16">
      <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  )
}

export default function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)

  const [market, setMarket] = useState<any>(null)
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMarket() {
      const marketData = await getMarketById(id)
      if (!marketData) {
        notFound()
        return
      }
      setMarket(marketData)
      setRelatedNews(await getNewsForMarket(marketData.id))
      setLoading(false)

    }
    fetchMarket()
  }, [id])


  if (loading || !market) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
        <span className="ml-2 text-muted-foreground">Loading market...</span>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-background">
        <TopNav />
        <main className="flex-1 px-4 py-6 pb-20 md:pb-6 lg:px-6">
          <div className="mx-auto max-w-7xl">
            <MarketDetail
              market={market}
              news={relatedNews}
            />
          </div>
        </main>
        <MobileNav />
      </div>
    </AuthGuard>
  )
}
