"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  ArrowRightLeft,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Market, Platform } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth-context";
import { getToken } from "@/lib/api/auth";
import { apiUrl } from "@/lib/api/config";

function formatUSD(val: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val);
}

function formatPrice(val: number) {
  return `${(val * 100).toFixed(1)}`;
}

interface OrderFormProps {
  market: Market;
}

export function OrderForm({ market }: OrderFormProps) {
  const { user, refreshUser } = useAuth();
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const [manualRouting, setManualRouting] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null,
  );
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const balance = user?.balance ?? 0;

  const orderPreview = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) return null;

    const kalshi = market.platforms.find((p) => p.platform === "kalshi");
    const poly = market.platforms.find((p) => p.platform === "polymarket");

    const kalshiPrice =
      side === "yes" ? (kalshi?.yesPrice ?? 0.5) : (kalshi?.noPrice ?? 0.5);
    const polyPrice =
      side === "yes" ? (poly?.yesPrice ?? 0.5) : (poly?.noPrice ?? 0.5);

    const bestPlatform: Platform =
      kalshiPrice <= polyPrice ? "kalshi" : "polymarket";
    const activePlatform =
      manualRouting && selectedPlatform ? selectedPlatform : bestPlatform;
    const activePrice = activePlatform === "kalshi" ? kalshiPrice : polyPrice;
    const shares = amt / activePrice;
    const savings =
      manualRouting && selectedPlatform
        ? 0
        : Math.abs(kalshiPrice - polyPrice) * shares;

    return {
      side,
      amount: amt,
      recommendedPlatform: bestPlatform,
      activePlatform,
      prices: { kalshi: kalshiPrice, polymarket: polyPrice },
      estimatedShares: shares,
      estimatedCost: amt,
      activePrice,
      savings,
    };
  }, [amount, side, manualRouting, selectedPlatform, market]);

  const requiredUsd = parseFloat(amount) || 0;
  const insufficientFunds = requiredUsd > balance;

  const handleSubmit = async () => {
    if (!orderPreview || insufficientFunds) return;
    setError("");
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(apiUrl("/api/bets"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          market_id: market.id,
          market_title: market.title,
          side: orderPreview.side,
          shares: parseFloat(orderPreview.estimatedShares.toFixed(2)),
          price_per_share: orderPreview.activePrice,
          platform: orderPreview.activePlatform,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Order failed");
      }
      setSubmitted(true);
      setAmount("");
      await refreshUser();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Place Order</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] bg-card text-card-foreground border-border">
                <p className="text-xs">
                  Orders are automatically routed to the platform with the best
                  price. Toggle manual routing to override.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
          <span className="text-[10px] text-muted-foreground">Available</span>
          <span className="text-xs font-semibold font-mono text-foreground">
            {formatUSD(balance)}
          </span>
        </div>

        {/* Side selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSide("yes")}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-md border py-2.5 text-sm font-medium transition-all",
              side === "yes"
                ? "border-success bg-success/10 text-success"
                : "border-border text-muted-foreground hover:border-success/30",
            )}
          >
            <span className="text-xs font-normal">YES</span>
            <span className="font-mono text-lg font-bold">
              {formatPrice(
                side === "yes"
                  ? market.bestYes.price
                  : (market.platforms[0]?.yesPrice ?? 0.5),
              )}
              {"\u00A2"}
            </span>
          </button>
          <button
            onClick={() => setSide("no")}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-md border py-2.5 text-sm font-medium transition-all",
              side === "no"
                ? "border-destructive bg-destructive/10 text-destructive"
                : "border-border text-muted-foreground hover:border-destructive/30",
            )}
          >
            <span className="text-xs font-normal">NO</span>
            <span className="font-mono text-lg font-bold">
              {formatPrice(
                side === "no"
                  ? market.bestNo.price
                  : (market.platforms[0]?.noPrice ?? 0.5),
              )}
              {"\u00A2"}
            </span>
          </button>
        </div>

        {/* Amount input */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount" className="text-xs text-muted-foreground">
            Amount (USD)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-10 border-border bg-secondary pl-7 font-mono text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-1.5">
            {[10, 25, 50, 100].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(String(val))}
                className="flex-1 rounded-md bg-secondary py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                ${val}
              </button>
            ))}
          </div>
          {insufficientFunds && (
            <p className="flex items-center gap-1 text-[10px] text-destructive">
              <AlertCircle className="h-3 w-3" />
              Insufficient balance
            </p>
          )}
        </div>

        <Separator className="bg-border" />

        {/* Routing */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">
                Smart Routing
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">
                {manualRouting ? "Manual" : "Auto"}
              </span>
              <Switch
                checked={manualRouting}
                onCheckedChange={setManualRouting}
                className="scale-75"
              />
            </div>
          </div>

          {manualRouting && (
            <div className="grid grid-cols-2 gap-2">
              {(["kalshi", "polymarket"] as Platform[]).map((platform) => {
                const p = market.platforms.find(
                  (pl) => pl.platform === platform,
                );
                const price =
                  side === "yes" ? (p?.yesPrice ?? 0.5) : (p?.noPrice ?? 0.5);
                return (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-md border px-2 py-2 transition-all",
                      selectedPlatform === platform
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/30",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-medium uppercase tracking-wider",
                        platform === "kalshi" ? "text-kalshi" : "text-polymarket",
                      )}
                    >
                      {platform}
                    </span>
                    <span className="font-mono text-sm font-medium">
                      {formatPrice(price)}
                      {"\u00A2"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Separator className="bg-border" />

        {/* Order preview */}
        {orderPreview && orderPreview.amount > 0 && (
          <div className="flex flex-col gap-2 rounded-md bg-secondary/50 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Routing to</span>
              <div className="flex items-center gap-1">
                <ArrowRightLeft className="h-3 w-3 text-primary" />
                <span
                  className={cn(
                    "font-medium uppercase",
                    orderPreview.activePlatform === "kalshi"
                      ? "text-kalshi"
                      : "text-polymarket",
                  )}
                >
                  {orderPreview.activePlatform}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  orderPreview.activePlatform === "kalshi"
                    ? "text-kalshi"
                    : "text-polymarket",
                )}
              >
                {orderPreview.activePlatform === "kalshi"
                  ? "Kalshi account"
                  : "Wallet (preferred token)"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Price per share</span>
              <span className="font-mono font-medium text-foreground">
                {formatPrice(orderPreview.activePrice)}
                {"\u00A2"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Est. shares</span>
              <span className="font-mono font-medium text-foreground">
                {orderPreview.estimatedShares.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total cost</span>
              <span className="font-mono font-medium text-foreground">
                {formatUSD(orderPreview.estimatedCost)}
              </span>
            </div>
            {orderPreview.savings > 0.01 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Smart routing savings
                </span>
                <span className="font-mono font-medium text-success">
                  {formatUSD(orderPreview.savings)}
                </span>
              </div>
            )}
          </div>
        )}

        <Button
          className={cn(
            "w-full font-medium transition-all",
            side === "yes"
              ? "bg-success text-success-foreground hover:bg-success/90"
              : "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            submitted && "pointer-events-none",
          )}
          disabled={
            !amount || parseFloat(amount) <= 0 || insufficientFunds || loading
          }
          onClick={handleSubmit}
        >
          {submitted ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Order Submitted
            </span>
          ) : loading ? (
            "Placing order..."
          ) : (
            "Place Bet"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
