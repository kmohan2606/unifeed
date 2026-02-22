"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, Briefcase, Settings, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DepositModal } from "@/components/deposit-modal";
import { useAuth } from "@/lib/auth-context";
import { SiteLogo } from "@/components/site-logo";

const navItems = [
  { href: "/dashboard", label: "Markets", icon: BarChart3 },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
];

function formatUSD(val: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TopNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const balance = user?.balance ?? 0;
  const initials = user ? getInitials(user.name) : "?";

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-sm lg:px-6">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <SiteLogo className="h-8 w-8 rounded-lg" />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            UniFeed
          </span>
        </Link>
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="hidden flex-1 items-center justify-center px-8 lg:flex">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            className="h-8 border-border bg-secondary pl-9 text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-4 sm:flex">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Kalshi</p>
            <p className="text-sm font-semibold font-mono text-kalshi">
              {formatUSD(kalshiBalance)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Wallet</p>
            <p className="text-sm font-semibold font-mono text-polymarket">
              {address && walletBalanceUsd != null
                ? formatUSD(walletBalanceUsd)
                : "—"}
            </p>
          </div>
        </div>
        <SwapModal />
        <DepositModal />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
          {initials}
        </div>
      </div>
    </header>
  );
}
