"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DollarSign,
  CreditCard,
  Landmark,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Info,
  Plus,
} from "lucide-react"

const fundingMethods = [
  {
    id: "bank",
    label: "Bank Transfer",
    description: "ACH transfer from your bank",
    icon: Landmark,
    fee: "Free",
    time: "1-3 business days",
    minDeposit: 10,
  },
  {
    id: "card",
    label: "Debit / Credit Card",
    description: "Instant deposit via card",
    icon: CreditCard,
    fee: "2.9% + $0.30",
    time: "Instant",
    minDeposit: 5,
  },
  {
    id: "crypto",
    label: "Crypto (USDC / ETH / BTC)",
    description: "Send from any wallet",
    icon: Wallet,
    fee: "Network gas only",
    time: "~5 min confirmations",
    minDeposit: 1,
  },
] as const

type FundingMethod = (typeof fundingMethods)[number]["id"]

const presetAmounts = [25, 50, 100, 250, 500, 1000]

function calculateFee(method: FundingMethod, amount: number): number {
  if (method === "bank") return 0
  if (method === "card") return parseFloat((amount * 0.029 + 0.3).toFixed(2))
  return 0 // crypto gas handled externally
}

function formatUSD(val: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val)
}

export function DepositModal({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState<FundingMethod>("bank")
  const [amount, setAmount] = useState("")
  const [step, setStep] = useState<"form" | "confirm" | "success">("form")

  const numericAmount = parseFloat(amount) || 0
  const selectedMethod = fundingMethods.find((m) => m.id === method)!
  const fee = calculateFee(method, numericAmount)
  const total = numericAmount + fee
  const isValid = numericAmount >= selectedMethod.minDeposit

  function handleConfirm() {
    setStep("confirm")
  }

  function handleDeposit() {
    setStep("success")
  }

  function handleClose() {
    setOpen(false)
    setTimeout(() => {
      setStep("form")
      setAmount("")
      setMethod("bank")
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true) }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Deposit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {step === "form" && "Deposit Funds"}
            {step === "confirm" && "Confirm Deposit"}
            {step === "success" && "Deposit Initiated"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === "form" && "Add funds to your UnifAI account"}
            {step === "confirm" && "Review your deposit details below"}
            {step === "success" && "Your deposit is being processed"}
          </DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <div className="flex flex-col gap-5 pt-2">
            {/* Funding method */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Funding Method</label>
              <div className="flex flex-col gap-1.5">
                {fundingMethods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                      method === m.id
                        ? "border-primary/50 bg-primary/5"
                        : "border-border bg-secondary/30 hover:bg-accent/30"
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                      method === m.id ? "bg-primary/10" : "bg-accent"
                    )}>
                      <m.icon className={cn(
                        "h-4 w-4",
                        method === m.id ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground">{m.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className="text-[9px] text-muted-foreground border-border">
                        {m.fee}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Amount (USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-border bg-secondary pl-9 text-lg font-mono text-foreground placeholder:text-muted-foreground"
                  min={0}
                  step="0.01"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-mono transition-colors",
                      parseFloat(amount) === preset
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
              {amount && numericAmount < selectedMethod.minDeposit && (
                <p className="flex items-center gap-1 text-[10px] text-destructive">
                  <Info className="h-3 w-3" />
                  Minimum deposit: {formatUSD(selectedMethod.minDeposit)}
                </p>
              )}
            </div>

            {/* Summary */}
            {numericAmount > 0 && (
              <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-secondary/50 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Deposit</span>
                  <span className="font-mono text-foreground">{formatUSD(numericAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-mono text-foreground">{fee === 0 ? "Free" : formatUSD(fee)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Est. time</span>
                  <span className="font-mono text-foreground">{selectedMethod.time}</span>
                </div>
                <div className="my-1 border-t border-border" />
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-foreground">Total charged</span>
                  <span className="font-mono text-foreground">{formatUSD(total)}</span>
                </div>
                {method === "crypto" && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Auto-converted to USD at current market rate. USDC deposits credited 1:1.
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handleConfirm}
              disabled={!isValid}
              className="w-full gap-2"
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {step === "confirm" && (
          <div className="flex flex-col gap-5 pt-2">
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/50 p-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <selectedMethod.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedMethod.label}</p>
                  <p className="text-[10px] text-muted-foreground">{selectedMethod.time}</p>
                </div>
              </div>
              <div className="border-t border-border pt-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Deposit amount</span>
                <span className="font-mono text-foreground">{formatUSD(numericAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Processing fee</span>
                <span className="font-mono text-foreground">{fee === 0 ? "Free" : formatUSD(fee)}</span>
              </div>
              <div className="border-t border-border pt-1 mt-1" />
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-foreground">You pay</span>
                <span className="font-mono text-primary">{formatUSD(total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-foreground">You receive</span>
                <span className="font-mono text-foreground">{formatUSD(numericAmount)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-border text-foreground" onClick={() => setStep("form")}>
                Back
              </Button>
              <Button className="flex-1 gap-1.5" onClick={handleDeposit}>
                <DollarSign className="h-3.5 w-3.5" />
                Deposit {formatUSD(numericAmount)}
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{formatUSD(numericAmount)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your deposit of {formatUSD(numericAmount)} via {selectedMethod.label.toLowerCase()} is being processed.
                {method === "bank" && " Funds will arrive in 1-3 business days."}
                {method === "card" && " Funds are available instantly."}
                {method === "crypto" && " Funds will be available after network confirmations."}
              </p>
            </div>
            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
