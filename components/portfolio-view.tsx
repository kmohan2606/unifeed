"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  DollarSign,
  ArrowUpRight,
  PieChart,
} from "lucide-react"
import { DepositModal } from "@/components/deposit-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useAuth } from "@/lib/auth-context"
import { getToken } from "@/lib/api/auth"
import { apiUrl } from "@/lib/api/config"
import type { Position, UserBalance } from "@/lib/types"

function formatUSD(val: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val)
}

function formatPrice(val: number) {
  return `${(val * 100).toFixed(1)}\u00A2`
}

function PieTooltipContent({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-card p-2 shadow-lg">
      <p className="text-xs font-medium text-foreground">{payload[0].name}</p>
      <p className="text-xs font-mono text-muted-foreground">{formatUSD(payload[0].value)}</p>
    </div>
  )
}

export function PortfolioView() {
  const { user } = useAuth()
  const [positions, setPositions] = useState<Position[]>([])
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(apiUrl("/api/portfolio/positions"), { headers }).then((r) => r.json()),
      fetch(apiUrl("/api/portfolio/balance"), { headers }).then((r) => r.json()),
    ])
      .then(([pos, bal]) => {
        setPositions(pos)
        setBalance(bal)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const userBalance = balance ?? {
    total: user?.balance ?? 0,
    available: user?.balance ?? 0,
    inPositions: 0,
    todayPnl: 0,
    todayPnlPercent: 0,
  }

  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0)
  const totalValue = positions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0)

  const pieData = [
    { name: "Available", value: userBalance.available, color: "oklch(0.72 0.19 145)" },
    { name: "In Positions", value: userBalance.inPositions, color: "oklch(0.70 0.15 250)" },
  ]

  const statCards = [
    {
      label: "Total Balance",
      value: formatUSD(userBalance.total),
      icon: Wallet,
      color: "text-foreground",
    },
    {
      label: "Available Cash",
      value: formatUSD(userBalance.available),
      icon: DollarSign,
      color: "text-foreground",
    },
    {
      label: "Positions Value",
      value: formatUSD(totalValue),
      icon: BarChart3,
      color: "text-foreground",
    },
    {
      label: "Total P&L",
      value: `${totalPnl >= 0 ? "+" : ""}${formatUSD(totalPnl)}`,
      icon: TrendingUp,
      color: totalPnl >= 0 ? "text-success" : "text-destructive",
      highlight: true,
      positive: totalPnl >= 0,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Portfolio</h1>
          <p className="text-sm text-muted-foreground">
            Unified view of all your positions across platforms
          </p>
        </div>
        <DepositModal
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Deposit
            </Button>
          }
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="flex items-center gap-3 p-3">
              <div className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                stat.highlight
                  ? stat.positive ? "bg-success/10" : "bg-destructive/10"
                  : "bg-accent"
              )}>
                <stat.icon className={cn(
                  "h-4 w-4",
                  stat.highlight
                    ? stat.positive ? "text-success" : "text-destructive"
                    : "text-muted-foreground"
                )} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
                <p className={cn("truncate text-sm font-semibold font-mono", stat.color)}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Positions */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Open Positions</h2>
              <Badge variant="secondary" className="text-[10px]">
                {positions.length} active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {positions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No positions yet. Place a bet on a market to get started.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {positions.map((position) => (
                  <Link
                    key={position.id}
                    href={`/market/${position.marketId}`}
                    className="group flex flex-col gap-2 rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:bg-accent/30 hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] py-0 px-1.5",
                            position.side === "yes"
                              ? "border-success/30 text-success"
                              : "border-destructive/30 text-destructive"
                          )}
                        >
                          {position.side.toUpperCase()}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] py-0 px-1.5 uppercase",
                            position.platform === "kalshi" ? "text-chart-3 border-chart-3/20" : "text-chart-5 border-chart-5/20"
                          )}
                        >
                          {position.platform}
                        </Badge>
                      </div>
                      <p className="truncate text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                        {position.marketTitle}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{position.quantity.toFixed(1)} shares</span>
                        <span>Avg: {formatPrice(position.avgPrice)}</span>
                        <span>Now: {formatPrice(position.currentPrice)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <div className={cn(
                        "flex items-center gap-1 text-sm font-semibold font-mono",
                        position.pnl >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {position.pnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {position.pnl >= 0 ? "+" : ""}{formatUSD(position.pnl)}
                      </div>
                      <span className={cn(
                        "text-[10px] font-mono",
                        position.pnlPercent >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {position.pnlPercent >= 0 ? "+" : ""}{position.pnlPercent.toFixed(2)}%
                      </span>
                      <ArrowUpRight className="hidden h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Allocation chart */}
        <div className="flex flex-col gap-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-1.5">
                <PieChart className="h-3.5 w-3.5 text-muted-foreground" />
                <h2 className="text-sm font-medium text-foreground">Allocation</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltipContent />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-mono font-medium text-foreground">{formatUSD(item.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <h2 className="text-sm font-medium text-foreground">Platform Breakdown</h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {(["kalshi", "polymarket"] as const).map((platform) => {
                  const platformPositions = positions.filter((p) => p.platform === platform)
                  const platformValue = platformPositions.reduce((s, p) => s + p.currentPrice * p.quantity, 0)
                  return (
                    <div key={platform} className="flex items-center justify-between rounded-md bg-secondary/50 p-2.5">
                      <div>
                        <span className={cn(
                          "text-[10px] font-medium uppercase tracking-wider",
                          platform === "kalshi" ? "text-chart-3" : "text-chart-5"
                        )}>{platform}</span>
                        <p className="text-[10px] text-muted-foreground">{platformPositions.length} positions</p>
                      </div>
                      <span className="text-sm font-semibold font-mono text-foreground">{formatUSD(platformValue)}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
