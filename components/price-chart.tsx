"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import type { PricePoint } from "@/lib/types"

const timeRanges = ["1H", "6H", "24H", "7D", "30D"]

interface PriceChartProps {
  data: PricePoint[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-card p-2 shadow-lg">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.dataKey === "kalshiYes" ? "Kalshi" : entry.dataKey === "polymarketYes" ? "Polymarket" : "Best"}:
          </span>
          <span className="font-mono font-medium text-foreground">
            {(entry.value * 100).toFixed(1)}{'\u00A2'}
          </span>
        </div>
      ))}
    </div>
  )
}

export function PriceChart({ data }: PriceChartProps) {
  const [activeRange, setActiveRange] = useState("24H")

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Price History</h3>
        <div className="flex items-center gap-1">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                activeRange === range
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-6 rounded-sm" style={{ backgroundColor: "oklch(0.70 0.15 250)" }} />
          <span className="text-muted-foreground">Kalshi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-6 rounded-sm" style={{ backgroundColor: "oklch(0.65 0.15 300)" }} />
          <span className="text-muted-foreground">Polymarket</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-6 rounded-sm" style={{ backgroundColor: "oklch(0.72 0.19 145)" }} />
          <span className="text-muted-foreground">Best Price</span>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradKalshi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.70 0.15 250)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="oklch(0.70 0.15 250)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPoly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.65 0.15 300)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="oklch(0.65 0.15 300)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradBest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.72 0.19 145)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(0.72 0.19 145)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.27 0.005 260)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "oklch(0.60 0 0)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 10, fill: "oklch(0.60 0 0)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${(v * 100).toFixed(0)}`}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="kalshiYes"
              stroke="oklch(0.70 0.15 250)"
              strokeWidth={1.5}
              fill="url(#gradKalshi)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="polymarketYes"
              stroke="oklch(0.65 0.15 300)"
              strokeWidth={1.5}
              fill="url(#gradPoly)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="bestYes"
              stroke="oklch(0.72 0.19 145)"
              strokeWidth={2}
              fill="url(#gradBest)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
