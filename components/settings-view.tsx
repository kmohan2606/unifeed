"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Link2,
  Shield,
  Bell,
  Zap,
  DollarSign,
  CheckCircle2,
  Wallet,
  LogOut,
  Unplug,
} from "lucide-react"
import { clearToken, getToken } from "@/lib/api/auth"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useDisconnect } from "wagmi"
import { apiUrl } from "@/lib/api/config"

export function SettingsView() {
  const [routingPreference, setRoutingPreference] = useState("best-price")
  const [displayCurrency, setDisplayCurrency] = useState("usd")
  const [notifications, setNotifications] = useState(true)
  const [priceAlerts, setPriceAlerts] = useState(true)
  const [autoConvert, setAutoConvert] = useState(true)
  const [savedWallet, setSavedWallet] = useState<{ address: string; chain: string } | null>(null)

  const { address, chain, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const syncWalletToBackend = useCallback(async (addr: string, chainName: string) => {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch(apiUrl("/api/wallet"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ address: addr, chain: chainName }),
      })
      if (res.ok) {
        const w = await res.json()
        setSavedWallet(w)
      }
    } catch {}
  }, [])

  const disconnectWallet = useCallback(async () => {
    const token = getToken()
    if (token) {
      await fetch(apiUrl("/api/wallet"), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
    disconnect()
    setSavedWallet(null)
  }, [disconnect])

  useEffect(() => {
    const token = getToken()
    if (!token) return
    fetch(apiUrl("/api/wallet"), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((w) => { if (w && w.address) setSavedWallet(w) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isConnected && address) {
      syncWalletToBackend(address, chain?.name ?? "Ethereum")
    }
  }, [isConnected, address, chain, syncWalletToBackend])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your platform connections, routing preferences, and account settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Connections */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1.5">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">Platform Connections</h2>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-md border border-border bg-secondary/30 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-chart-3/10">
                  <span className="text-sm font-bold text-chart-3">K</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Kalshi</p>
                  <p className="text-[10px] text-muted-foreground">Regulated exchange (USD)</p>
                </div>
              </div>
              <Badge className="bg-success/10 text-success border-success/20 text-[10px]">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Connected
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border bg-secondary/30 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-chart-5/10">
                  <span className="text-sm font-bold text-chart-5">P</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Polymarket</p>
                  <p className="text-[10px] text-muted-foreground">Crypto-based (USDC)</p>
                </div>
              </div>
              <Badge className="bg-success/10 text-success border-success/20 text-[10px]">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Connected
              </Badge>
            </div>

            <Separator className="bg-border" />

            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">API Keys</Label>
              <div className="flex flex-col gap-1">
                <Label htmlFor="kalshi-key" className="text-[10px] text-muted-foreground">Kalshi API Key</Label>
                <Input
                  id="kalshi-key"
                  type="password"
                  value="kl_sk_live_****************************"
                  readOnly
                  className="h-8 border-border bg-secondary text-xs font-mono text-foreground"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Connection */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">Crypto Wallet</h2>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
              Connect your cryptocurrency wallet to place bets on Polymarket and other crypto-native platforms.
            </p>

            {isConnected && address ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-md border border-success/20 bg-success/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-success/10">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">Wallet Connected</p>
                      <p className="truncate text-[10px] font-mono text-muted-foreground">
                        {address}
                      </p>
                      {chain && (
                        <p className="text-[10px] text-muted-foreground">
                          Network: {chain.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={disconnectWallet}
                >
                  <Unplug className="mr-1.5 h-3.5 w-3.5" />
                  Disconnect Wallet
                </Button>
              </div>
            ) : savedWallet ? (
              <div className="flex flex-col gap-3">
                <div className="rounded-md border border-border bg-secondary/30 p-3">
                  <p className="text-xs font-medium text-foreground">Previously Connected</p>
                  <p className="truncate text-[10px] font-mono text-muted-foreground mt-1">
                    {savedWallet.address}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Chain: {savedWallet.chain}
                  </p>
                </div>
                <div className="flex gap-2">
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <Button size="sm" className="flex-1" onClick={openConnectModal}>
                        <Wallet className="mr-1.5 h-3.5 w-3.5" />
                        Reconnect
                      </Button>
                    )}
                  </ConnectButton.Custom>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={disconnectWallet}
                  >
                    <Unplug className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button size="sm" className="w-full" onClick={openConnectModal}>
                    <Wallet className="mr-1.5 h-3.5 w-3.5" />
                    Connect Wallet
                  </Button>
                )}
              </ConnectButton.Custom>
            )}

            <div className="rounded-md bg-secondary/50 p-3">
              <p className="text-[10px] text-muted-foreground">
                Supports MetaMask, Coinbase Wallet, WalletConnect, Rainbow, and other popular wallets.
                Your wallet is used for Polymarket transactions and USDC deposits.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Routing */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">Order Routing</h2>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Default Routing Strategy</Label>
              <Select value={routingPreference} onValueChange={setRoutingPreference}>
                <SelectTrigger className="h-9 border-border bg-secondary text-sm text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  <SelectItem value="best-price">Best Price (Recommended)</SelectItem>
                  <SelectItem value="kalshi-first">Prefer Kalshi</SelectItem>
                  <SelectItem value="poly-first">Prefer Polymarket</SelectItem>
                  <SelectItem value="split">Split Evenly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Smart routing will automatically send orders to the platform offering the best price.
              </p>
            </div>

            <Separator className="bg-border" />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Slippage Protection</p>
                  <p className="text-[10px] text-muted-foreground">Cancel if price moves more than 2%</p>
                </div>
                <Switch defaultChecked className="scale-90" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Confirmation on Large Orders</p>
                  <p className="text-[10px] text-muted-foreground">{"Require confirmation for orders > $500"}</p>
                </div>
                <Switch defaultChecked className="scale-90" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Show Routing Preview</p>
                  <p className="text-[10px] text-muted-foreground">Display cost breakdown before placing</p>
                </div>
                <Switch defaultChecked className="scale-90" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">Currency & Conversion</h2>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Display Currency</Label>
              <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
                <SelectTrigger className="h-9 border-border bg-secondary text-sm text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                  <SelectItem value="gbp">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-border" />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Auto-convert USDC</p>
                  <p className="text-[10px] text-muted-foreground">Automatically handle USDC/USD conversion for Polymarket</p>
                </div>
                <Switch checked={autoConvert} onCheckedChange={setAutoConvert} className="scale-90" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Live BTC/USD Rate</p>
                  <p className="text-[10px] text-muted-foreground">Show real-time Bitcoin conversion rates</p>
                </div>
                <Switch defaultChecked className="scale-90" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">Notifications</h2>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Order Confirmations</p>
                <p className="text-[10px] text-muted-foreground">Get notified when orders are filled</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} className="scale-90" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Price Alerts</p>
                <p className="text-[10px] text-muted-foreground">Alert when markets hit your target price</p>
              </div>
              <Switch checked={priceAlerts} onCheckedChange={setPriceAlerts} className="scale-90" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Arbitrage Opportunities</p>
                <p className="text-[10px] text-muted-foreground">{"Notify when spread exceeds 5%"}</p>
              </div>
              <Switch defaultChecked className="scale-90" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Market Resolution</p>
                <p className="text-[10px] text-muted-foreground">Get notified when your markets resolve</p>
              </div>
              <Switch defaultChecked className="scale-90" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">Security</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-success/10">
                <Shield className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">
                  Your account is protected with 2FA. All API keys are encrypted at rest.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent">
              Manage 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Separator className="bg-border" />

      <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-center gap-3">
          <LogOut className="h-5 w-5 text-destructive" />
          <div>
            <p className="text-sm font-medium text-foreground">Sign Out</p>
            <p className="text-xs text-muted-foreground">
              Sign out of your account on this device
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            clearToken()
            window.location.href = "/sign-in"
          }}
        >
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
