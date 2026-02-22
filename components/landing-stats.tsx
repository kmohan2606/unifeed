"use client"

import { useEffect, useState } from "react"

const DURATION_MS = 1200

type FormatType = "markets" | "currency" | "percent" | "number"

function useAnimatedValue(target: number, duration: number, formatType: FormatType) {
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    const start = performance.now()
    const format = (n: number) => {
      switch (formatType) {
        case "markets":
          return `${Math.round(n).toLocaleString()}+`
        case "currency":
          return `$${Math.round(n).toLocaleString()}`
        case "percent":
          return `${n.toFixed(1)}%`
        case "number":
          return `${Math.round(n)}`
        default:
          return String(n)
      }
    }
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 2)
      const current = target * eased
      setDisplay(format(current))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, formatType])

  return display
}

function AnimatedStat({
  target,
  duration,
  formatType,
  label,
}: {
  target: number
  duration: number
  formatType: FormatType
  label: string
}) {
  const display = useAnimatedValue(target, duration, formatType)
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-6">
      <span className="text-2xl font-bold font-mono text-foreground">{display}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export function LandingStats() {
  return (
    <section className="border-y border-border bg-card/50">
      <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-border md:grid-cols-4">
        <AnimatedStat
          target={20000}
          duration={DURATION_MS}
          formatType="markets"
          label="Markets Aggregated"
        />
        <AnimatedStat
          target={600000000}
          duration={DURATION_MS}
          formatType="currency"
          label="Current Volume"
        />
        <AnimatedStat
          target={3.2}
          duration={DURATION_MS}
          formatType="percent"
          label="Avg. Savings per Trade"
        />
        <AnimatedStat
          target={2}
          duration={DURATION_MS}
          formatType="number"
          label="Platforms Connected"
        />
      </div>
    </section>
  )
}
