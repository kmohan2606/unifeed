"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, FileText, Scale, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Market } from "@/lib/types";

export function MarketDescription({ market }: { market: Market }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-border bg-card py-0 gap-0">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between px-4 text-left transition-colors hover:bg-accent/30",
          isExpanded ? "py-3.5" : "py-1.5",
        )}
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Description & Rules
          </h3>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <CardContent className="flex flex-col gap-5 px-4 pb-4 pt-0">
            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Description
              </h4>
              <p className="text-sm leading-relaxed text-foreground/90">
                {market.description}
              </p>
            </div>

            {/* Rules */}
            {market.rules && market.rules.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                  <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Resolution Rules
                  </h4>
                </div>
                <ul className="flex flex-col gap-2">
                  {market.rules.map((rule, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-sm leading-relaxed text-foreground/80"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Platform links */}
            {market.platformUrls && (
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Trade directly on the exchange
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  {market.platformUrls.kalshi && (
                    <a
                      href={market.platformUrls.kalshi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-kalshi/30 bg-kalshi/10 px-3.5 py-2 text-xs font-medium text-kalshi transition-colors hover:bg-kalshi/20"
                    >
                      <span className="h-2 w-2 rounded-full bg-kalshi" />
                      Trade on Kalshi
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {market.platformUrls.polymarket && (
                    <a
                      href={market.platformUrls.polymarket}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-polymarket/30 bg-polymarket/10 px-3.5 py-2 text-xs font-medium text-polymarket transition-colors hover:bg-polymarket/20"
                    >
                      <span className="h-2 w-2 rounded-full bg-polymarket" />
                      Trade on Polymarket
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
