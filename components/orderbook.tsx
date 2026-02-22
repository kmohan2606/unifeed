"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import type {
  Market,
  OrderbookData,
  OrderbookEntry,
  Platform,
} from "@/lib/types";
import { generateOrderbook } from "@/lib/mock-data";

function formatPrice(val: number) {
  return (val * 100).toFixed(0);
}

function formatQty(val: number) {
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toString();
}

function OrderbookRow({
  entry,
  maxTotal,
  side,
  showPlatform = false,
}: {
  entry: OrderbookEntry;
  maxTotal: number;
  side: "bid" | "ask";
  showPlatform?: boolean;
}) {
  const fillPercent = (entry.total / maxTotal) * 100;

  return (
    <div className="group relative flex items-center px-3 py-[5px] font-mono text-xs transition-colors hover:bg-accent/40">
      <div
        className={cn(
          "absolute inset-y-0 pointer-events-none opacity-15",
          side === "bid" ? "right-0 bg-success" : "left-0 bg-destructive",
        )}
        style={{ width: `${fillPercent}%` }}
      />
      <span
        className={cn(
          "relative z-10 w-[72px] tabular-nums font-medium",
          side === "bid" ? "text-success" : "text-destructive",
        )}
      >
        {formatPrice(entry.price)}
        {"\u00A2"}
      </span>
      <span className="relative z-10 w-[72px] text-right tabular-nums text-foreground">
        {formatQty(entry.quantity)}
      </span>
      <span className="relative z-10 w-[72px] text-right tabular-nums text-muted-foreground">
        {formatQty(entry.total)}
      </span>
      {showPlatform && (
        <span
          className={cn(
            "relative z-10 ml-auto text-[10px] font-medium uppercase",
            entry.platform === "kalshi" ? "text-kalshi" : "text-polymarket",
          )}
        >
          {entry.platform === "kalshi" ? "KAL" : "POLY"}
        </span>
      )}
    </div>
  );
}

function SpreadBar({ book }: { book: OrderbookData }) {
  return (
    <div className="flex items-center justify-between border-y border-border bg-accent/30 px-3 py-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold font-mono text-foreground">
          {formatPrice(book.midPrice)}
          {"\u00A2"}
        </span>
        <span className="text-[10px] text-muted-foreground">Mid</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Spread</span>
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px] font-mono",
            book.spreadPercent < 3
              ? "text-success"
              : book.spreadPercent < 5
                ? "text-warning"
                : "text-destructive",
          )}
        >
          {book.spreadPercent.toFixed(2)}%
        </Badge>
      </div>
    </div>
  );
}

function ColumnHeaders() {
  return (
    <div className="flex items-center border-b border-border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      <span className="w-[72px]">Price</span>
      <span className="w-[72px] text-right">Size</span>
      <span className="w-[72px] text-right">Total</span>
    </div>
  );
}

function BookSummaryBar({ book }: { book: OrderbookData }) {
  const maxBidTotal = book.bids[book.bids.length - 1]?.total ?? 0;
  const maxAskTotal = book.asks[book.asks.length - 1]?.total ?? 0;
  return (
    <div className="flex items-center justify-between border-t border-border px-3 py-1.5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm bg-success" />
          <span className="text-[10px] text-muted-foreground">
            Bids: {formatQty(maxBidTotal)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm bg-destructive" />
          <span className="text-[10px] text-muted-foreground">
            Asks: {formatQty(maxAskTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface SingleBookProps {
  title: string;
  platform: Platform | "aggregated";
  book: OrderbookData;
  isExpanded: boolean;
  onToggle: () => void;
  showPlatformLabels?: boolean;
  accentColor: string;
}

function SingleBook({
  title,
  platform,
  book,
  isExpanded,
  onToggle,
  showPlatformLabels = false,
  accentColor,
}: SingleBookProps) {
  const maxBidTotal = book.bids[book.bids.length - 1]?.total ?? 1;
  const maxAskTotal = book.asks[book.asks.length - 1]?.total ?? 1;
  const reversedAsks = [...book.asks].reverse();

  return (
    <Card className="border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between px-4 text-left transition-colors hover:bg-accent/30",
          isExpanded ? "py-3" : "py-2",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className={cn("h-2.5 w-2.5 rounded-full", accentColor)} />
          <h4
            className={cn(
              "text-sm font-semibold",
              platform === "kalshi"
                ? "text-kalshi"
                : platform === "polymarket"
                  ? "text-polymarket"
                  : "text-foreground",
            )}
          >
            {title}
          </h4>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            <span className="text-[10px] text-muted-foreground">LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span>
              Mid:{" "}
              <span className="text-foreground font-medium">
                {formatPrice(book.midPrice)}
                {"\u00A2"}
              </span>
            </span>
            <span>
              Spread:{" "}
              <span
                className={cn(
                  "font-medium",
                  book.spreadPercent < 3
                    ? "text-success"
                    : book.spreadPercent < 5
                      ? "text-warning"
                      : "text-destructive",
                )}
              >
                {book.spreadPercent.toFixed(2)}%
              </span>
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-180",
            )}
          />
        </div>
      </button>

      {isExpanded && (
        <CardContent className="p-0">
          <ColumnHeaders />

          {/* Asks */}
          <div className="border-b border-border">
            {reversedAsks.map((entry, i) => (
              <OrderbookRow
                key={`ask-${i}`}
                entry={entry}
                maxTotal={maxAskTotal}
                side="ask"
                showPlatform={showPlatformLabels}
              />
            ))}
          </div>

          <SpreadBar book={book} />

          {/* Bids */}
          <div>
            {book.bids.map((entry, i) => (
              <OrderbookRow
                key={`bid-${i}`}
                entry={entry}
                maxTotal={maxBidTotal}
                side="bid"
                showPlatform={showPlatformLabels}
              />
            ))}
          </div>

          <BookSummaryBar book={book} />
        </CardContent>
      )}
    </Card>
  );
}

export function Orderbook({ market }: { market: Market }) {
  const [kalshiBook, setKalshiBook] = useState<OrderbookData | null>(null);
  const [polyBook, setPolyBook] = useState<OrderbookData | null>(null);

  const [expandedKalshi, setExpandedKalshi] = useState(false);
  const [expandedPoly, setExpandedPoly] = useState(false);

  const refreshBooks = useCallback(() => {
    setKalshiBook(generateOrderbook(market, "kalshi"));
    setPolyBook(generateOrderbook(market, "polymarket"));
  }, [market]);

  useEffect(() => {
    refreshBooks();
    const interval = setInterval(refreshBooks, 3000);
    return () => clearInterval(interval);
  }, [refreshBooks]);

  if (!kalshiBook || !polyBook) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Order Books</h3>
        <span className="text-[10px] text-muted-foreground font-mono">
          Refreshes every 3s
        </span>
      </div>

      <SingleBook
        title="Kalshi"
        platform="kalshi"
        book={kalshiBook}
        isExpanded={expandedKalshi}
        onToggle={() => setExpandedKalshi((prev) => !prev)}
        accentColor="bg-chart-3"
      />

      <SingleBook
        title="Polymarket"
        platform="polymarket"
        book={polyBook}
        isExpanded={expandedPoly}
        onToggle={() => setExpandedPoly((prev) => !prev)}
        accentColor="bg-chart-5"
      />
    </div>
  );
}
