"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, TrendingUp, Minus, TrendingDown } from "lucide-react"
import type { NewsItem } from "@/lib/types"

function useTimeAgo(timestamp: string) {
  const [label, setLabel] = useState<string>("")
  useEffect(() => {
    function compute() {
      const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
      return `${Math.floor(seconds / 86400)}d ago`
    }
    setLabel(compute())
  }, [timestamp])
  return label
}

function TimeAgoLabel({ timestamp }: { timestamp: string }) {
  const label = useTimeAgo(timestamp)
  return <span className="text-[10px] text-muted-foreground">{label}</span>
}

const sentimentConfig = {
  positive: {
    icon: TrendingUp,
    label: "Positive",
    className: "bg-success/10 text-success border-success/20",
  },
  neutral: {
    icon: Minus,
    label: "Neutral",
    className: "bg-secondary text-muted-foreground border-border",
  },
  negative: {
    icon: TrendingDown,
    label: "Negative",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
}

interface NewsPanelProps {
  news: NewsItem[]
}

export function NewsPanel({ news }: NewsPanelProps) {
  if (news.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-medium text-foreground">Related News</h3>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">No related news articles found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Related News</h3>
          <Badge variant="secondary" className="text-[10px]">
            {news.length} articles
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {news.map((item) => {
          const sentiment = sentimentConfig[item.sentiment]
          const SentimentIcon = sentiment.icon
          return (
            <a
              key={item.id}
              href={item.url}
              className="group flex flex-col gap-1.5 rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:bg-accent/30 hover:border-primary/20"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="flex-1 text-xs font-medium leading-snug text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{item.source}</span>
                <TimeAgoLabel timestamp={item.timestamp} />
                <Badge
                  variant="outline"
                  className={cn("ml-auto text-[9px] gap-0.5 py-0 px-1.5", sentiment.className)}
                >
                  <SentimentIcon className="h-2.5 w-2.5" />
                  {sentiment.label}
                </Badge>
              </div>
            </a>
          )
        })}
      </CardContent>
    </Card>
  )
}
