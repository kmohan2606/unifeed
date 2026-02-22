"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, ArrowRight, Clock } from "lucide-react"
import type { Market } from "@/lib/types"

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
    setLabel(days > 0 ? `${days}d` : "Expired")
  }, [date])
  return label
}

function PlatformLabel({ platform }: { platform: string }) {
  return (
    <span
      className={cn(
        "text-[10px] font-medium uppercase tracking-wider",
        platform === "kalshi" ? "text-chart-3" : "text-chart-5"
      )}
    >
      {platform}
    </span>
  )
}

export function MarketCard({ market }: { market: Market }) {
  const isPositive = market.change24h >= 0
  const daysLabel = useDaysUntil(market.endDate)

  return (
    <Link href={`/market/${market.id}`}>
      <Card className="group cursor-pointer border-border bg-card transition-all hover:border-primary/30 hover:bg-accent/30">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px] font-medium">
                  {market.category}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-[10px]">{daysLabel}</span>
                </div>
              </div>
              <h3 className="text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors text-balance">
                {market.title}
              </h3>
            </div>
            <div className={cn(
              "flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium font-mono",
              isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? "+" : ""}{market.change24h.toFixed(1)}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1 rounded-md bg-success/5 p-2">
              <span className="text-[10px] font-medium text-muted-foreground">Best YES</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono text-success">
                  {formatPrice(market.bestYes.price)}
                </span>
                <span className="text-xs text-success/60">{'\u00A2'}</span>
              </div>
              <PlatformLabel platform={market.bestYes.platform} />
            </div>
            <div className="flex flex-col gap-1 rounded-md bg-destructive/5 p-2">
              <span className="text-[10px] font-medium text-muted-foreground">Best NO</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono text-destructive">
                  {formatPrice(market.bestNo.price)}
                </span>
                <span className="text-xs text-destructive/60">{'\u00A2'}</span>
              </div>
              <PlatformLabel platform={market.bestNo.platform} />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>Vol: {formatVolume(market.totalVolume)}</span>
              <span>Spread: {(market.spread * 100).toFixed(0)}{'\u00A2'}</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
