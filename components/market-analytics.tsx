"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Market } from "@/lib/types";

function formatVolume(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

function formatPrice(val: number) {
  return `${(val * 100).toFixed(1)}\u00A2`;
}

interface MarketAnalyticsProps {
  market: Market;
}

export function MarketAnalytics({ market }: MarketAnalyticsProps) {
  const kalshi = market.platforms.find((p) => p.platform === "kalshi")!;
  const poly = market.platforms.find((p) => p.platform === "polymarket")!;

  const rows = [
    {
      label: "YES Price",
      kalshi: formatPrice(kalshi.yesPrice),
      poly: formatPrice(poly.yesPrice),
      best: kalshi.yesPrice <= poly.yesPrice ? "kalshi" : "polymarket",
    },
    {
      label: "NO Price",
      kalshi: formatPrice(kalshi.noPrice),
      poly: formatPrice(poly.noPrice),
      best: kalshi.noPrice <= poly.noPrice ? "kalshi" : "polymarket",
    },
    {
      label: "Volume",
      kalshi: formatVolume(kalshi.volume),
      poly: formatVolume(poly.volume),
      best: kalshi.volume >= poly.volume ? "kalshi" : "polymarket",
    },
    {
      label: "Open Interest",
      kalshi: formatVolume(kalshi.openInterest),
      poly: formatVolume(poly.openInterest),
      best: kalshi.openInterest >= poly.openInterest ? "kalshi" : "polymarket",
    },
  ];

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <h3 className="text-sm font-medium text-foreground">
          Platform Comparison
        </h3>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" role="table">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 pr-4 text-left font-medium text-muted-foreground">
                  Metric
                </th>
                <th className="pb-2 px-2 text-right font-medium text-kalshi">
                  Kalshi
                </th>
                <th className="pb-2 pl-2 text-right font-medium text-polymarket">
                  Polymarket
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-2 pr-4 text-muted-foreground">
                    {row.label}
                  </td>
                  <td
                    className={cn(
                      "py-2 px-2 text-right font-mono font-medium",
                      row.best === "kalshi"
                        ? "text-primary"
                        : "text-foreground",
                    )}
                  >
                    {row.kalshi}
                    {row.best === "kalshi" && (
                      <span className="ml-1 text-primary">*</span>
                    )}
                  </td>
                  <td
                    className={cn(
                      "py-2 pl-2 text-right font-mono font-medium",
                      row.best === "polymarket"
                        ? "text-primary"
                        : "text-foreground",
                    )}
                  >
                    {row.poly}
                    {row.best === "polymarket" && (
                      <span className="ml-1 text-primary">*</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          * indicates best available price for the metric
        </p>
      </CardContent>
    </Card>
  );
}
