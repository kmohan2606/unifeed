"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, Wallet, BarChart3, DollarSign } from "lucide-react"
import { userBalance } from "@/lib/mock-data"

function formatUSD(val: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val)
}

const stats = [
  {
    label: "Total Balance",
    value: formatUSD(userBalance.total),
    icon: Wallet,
  },
  {
    label: "Available",
    value: formatUSD(userBalance.available),
    icon: DollarSign,
  },
  {
    label: "In Positions",
    value: formatUSD(userBalance.inPositions),
    icon: BarChart3,
  },
  {
    label: "Today's P&L",
    value: `${userBalance.todayPnl >= 0 ? "+" : ""}${formatUSD(userBalance.todayPnl)}`,
    icon: TrendingUp,
    highlight: true,
    positive: userBalance.todayPnl >= 0,
  },
]

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
        >
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
            <p className={cn(
              "truncate text-sm font-semibold font-mono",
              stat.highlight
                ? stat.positive ? "text-success" : "text-destructive"
                : "text-foreground"
            )}>
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
