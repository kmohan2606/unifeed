"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Clock, TrendingUp, TrendingDown } from "lucide-react"
import { PriceChart } from "@/components/price-chart"
import { OrderForm } from "@/components/order-form"
import { NewsPanel } from "@/components/news-panel"
import { MarketAnalytics } from "@/components/market-analytics"
import { Orderbook } from "@/components/orderbook"
import { MarketDescription } from "@/components/market-description"
import { MarketSentiment } from "@/components/market_analysis"
import { AnalysisNewsPanel } from "@/components/analysis-news-panel"
import type { Market, NewsItem } from "@/lib/types"
import type { AnalysisNewsItem, AnalysisDiscussion } from "@/lib/api"

function formatVolume(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`
  return `$${val}`
}

function formatPrice(val: number) {
  return `${(val * 100).toFixed(0)}`
}

function useDaysUntil(date: string) {
  const [label, setLabel] = useState<string>("")
  useEffect(() => {
    const diff = new Date(date).getTime() - Date.now()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    setLabel(days > 0 ? `${days} days` : "Expired")
  }, [date])
  return label
}

interface MarketDetailProps {
  market: Market
  news: NewsItem[]
  sentiment: string
  analysisNews: AnalysisNewsItem[]
  analysisDiscussions: AnalysisDiscussion[]
}

export function MarketDetail({ market, news, sentiment, analysisNews, analysisDiscussions }: MarketDetailProps) {
  const isPositive = market.change24h >= 0
  const daysLabel = useDaysUntil(market.endDate)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Markets
        </Link>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{market.category}</Badge>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="text-[10px]">{daysLabel ? `${daysLabel} remaining` : ""}</span>
              </div>
              <Badge variant="outline" className="text-[10px]">{market.status.toUpperCase()}</Badge>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl text-balance">
              {market.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{market.description}</p>
          </div>

          <div className="flex items-center gap-4 lg:ml-6">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">24h Change</p>
              <div className={cn(
                "flex items-center justify-end gap-1 text-sm font-semibold font-mono",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {isPositive ? "+" : ""}{market.change24h.toFixed(1)}%
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Total Volume</p>
              <p className="text-sm font-semibold font-mono text-foreground">{formatVolume(market.totalVolume)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick price summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col gap-0.5 p-3">
            <span className="text-[10px] text-muted-foreground">Best YES</span>
            <span className="text-xl font-bold font-mono text-success">{formatPrice(market.bestYes.price)}{'\u00A2'}</span>
            <span className={cn(
              "text-[10px] font-medium uppercase",
              market.bestYes.platform === "kalshi" ? "text-chart-3" : "text-chart-5"
            )}>{market.bestYes.platform}</span>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col gap-0.5 p-3">
            <span className="text-[10px] text-muted-foreground">Best NO</span>
            <span className="text-xl font-bold font-mono text-destructive">{formatPrice(market.bestNo.price)}{'\u00A2'}</span>
            <span className={cn(
              "text-[10px] font-medium uppercase",
              market.bestNo.platform === "kalshi" ? "text-chart-3" : "text-chart-5"
            )}>{market.bestNo.platform}</span>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col gap-0.5 p-3">
            <span className="text-[10px] text-muted-foreground">Spread</span>
            <span className="text-xl font-bold font-mono text-warning">{(market.spread * 100).toFixed(0)}{'\u00A2'}</span>
            <span className="text-[10px] text-muted-foreground">between platforms</span>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col gap-0.5 p-3">
            <span className="text-[10px] text-muted-foreground">Platforms</span>
            <span className="text-xl font-bold font-mono text-foreground">{market.platforms.length}</span>
            <span className="text-[10px] text-muted-foreground">sources aggregated</span>
          </CardContent>
        </Card>
      </div>

      {/* Market Sentiment - above chart */}
      <MarketSentiment text={sentiment} />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          {/* Price chart */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <PriceChart data={market.priceHistory} />
            </CardContent>
          </Card>

          {/* Analytics */}
          <MarketAnalytics market={market} />

          {/* Description & Rules */}
          <MarketDescription market={market} />

          {/* Live Orderbook */}
          <Orderbook market={market} />

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            {market.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] text-muted-foreground">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <OrderForm market={market} />
          <AnalysisNewsPanel news={analysisNews} discussions={analysisDiscussions} />
        </div>
      </div>
    </div>
  )
}
