"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Newspaper, MessageSquare } from "lucide-react"
import type { AnalysisNewsItem, AnalysisDiscussion } from "@/lib/api"

// ── Date filter helpers ──────────────────────────────────────────

type RecencyOption = "24h" | "3d" | "7d" | "30d" | "all"

const RECENCY_OPTIONS: { value: RecencyOption; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "3d", label: "3 days" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "all", label: "All" },
]

function cutoffDate(option: RecencyOption): Date | null {
  if (option === "all") return null
  const now = Date.now()
  const ms: Record<Exclude<RecencyOption, "all">, number> = {
    "24h": 24 * 60 * 60 * 1000,
    "3d": 3 * 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  }
  return new Date(now - ms[option])
}

/** Parse the "age" field from Brave API — can be a full date ("August 8, 2025"),
 *  a relative string ("2 hours ago"), or missing entirely. */
function parseAgeToDate(age: string | undefined): Date | null {
  if (!age) return null

  // Try parsing as an absolute date first (most common from Brave)
  const abs = new Date(age)
  if (!isNaN(abs.getTime())) return abs

  // Fallback: relative strings like "2 hours ago"
  const match = age.match(/(\d+)\s*(second|minute|hour|day|week|month|year)/i)
  if (!match) return null
  const n = parseInt(match[1], 10)
  const unit = match[2].toLowerCase()
  const multipliers: Record<string, number> = {
    second: 1000,
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 604_800_000,
    month: 2_592_000_000,
    year: 31_536_000_000,
  }
  const ms = multipliers[unit]
  if (!ms) return null
  return new Date(Date.now() - n * ms)
}

// ──────────────────────────────────────────────────────────────────

interface AnalysisNewsPanelProps {
  news: AnalysisNewsItem[]
  discussions: AnalysisDiscussion[]
}

export function AnalysisNewsPanel({ news, discussions }: AnalysisNewsPanelProps) {
  const [tab, setTab] = useState<"news" | "discussions">("news")
  const [recency, setRecency] = useState<RecencyOption>("all")

  // Filter news by pubDate
  const filteredNews = useMemo(() => {
    const cutoff = cutoffDate(recency)
    if (!cutoff) return news
    return news.filter((item) => {
      const d = new Date(item.pubDate)
      return !isNaN(d.getTime()) && d >= cutoff
    })
  }, [news, recency])

  // Filter discussions by age string
  const filteredDiscussions = useMemo(() => {
    const cutoff = cutoffDate(recency)
    if (!cutoff) return discussions
    return discussions.filter((item) => {
      const d = parseAgeToDate(item.age)
      return d ? d >= cutoff : false // exclude items with unparseable/missing age
    })
  }, [discussions, recency])

  const hasNews = news.length > 0
  const hasDiscussions = discussions.length > 0

  if (!hasNews && !hasDiscussions) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-medium text-foreground">Research</h3>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">No research data available yet.</p>
        </CardContent>
      </Card>
    )
  }

  const activeItems = tab === "news" ? filteredNews : filteredDiscussions

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Research</h3>
            <div className="flex gap-1">
              <button
                onClick={() => setTab("news")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                  tab === "news"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <Newspaper className="h-3 w-3" />
                News ({filteredNews.length})
              </button>
              <button
                onClick={() => setTab("discussions")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                  tab === "discussions"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <MessageSquare className="h-3 w-3" />
                Discussions ({filteredDiscussions.length})
              </button>
            </div>
          </div>

          {/* Recency filter pills */}
          <div className="flex items-center gap-1">
            {RECENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRecency(opt.value)}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                  recency === opt.value
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {tab === "news" && (
          <>
            {filteredNews.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-1.5 rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:bg-accent/30 hover:border-primary/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="flex-1 text-xs font-medium leading-snug text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                {item.description && (
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{item.source_name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(item.pubDate).toLocaleDateString()}
                  </span>
                </div>
              </a>
            ))}
            {filteredNews.length === 0 && (
              <p className="text-xs text-muted-foreground">
                {hasNews ? "No news articles in this time range." : "No news articles found."}
              </p>
            )}
          </>
        )}

        {tab === "discussions" && (
          <>
            {filteredDiscussions.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-1.5 rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:bg-accent/30 hover:border-primary/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="flex-1 text-xs font-medium leading-snug text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                {item.description && (
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                    {item.forum_name}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{item.age}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    ↑{item.score} · {item.num_answers} replies
                  </span>
                </div>
              </a>
            ))}
            {filteredDiscussions.length === 0 && (
              <p className="text-xs text-muted-foreground">
                {hasDiscussions ? "No discussions in this time range." : "No discussions found."}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}