"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Newspaper, MessageSquare } from "lucide-react"
import type { AnalysisNewsItem, AnalysisDiscussion } from "@/lib/api"

interface AnalysisNewsPanelProps {
  news: AnalysisNewsItem[]
  discussions: AnalysisDiscussion[]
}

export function AnalysisNewsPanel({ news, discussions }: AnalysisNewsPanelProps) {
  const [tab, setTab] = useState<"news" | "discussions">("news")

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

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
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
              News ({news.length})
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
              Discussions ({discussions.length})
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {tab === "news" && (
          <>
            {news.map((item, i) => (
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
            {!hasNews && (
              <p className="text-xs text-muted-foreground">No news articles found.</p>
            )}
          </>
        )}

        {tab === "discussions" && (
          <>
            {discussions.map((item, i) => (
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
            {!hasDiscussions && (
              <p className="text-xs text-muted-foreground">No discussions found.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}