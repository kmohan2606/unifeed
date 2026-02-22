import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNavActions } from "@/components/landing-nav-actions";
import {
  LandingHeroActions,
  LandingBottomActions,
} from "@/components/landing-cta-actions";
import { LandingStats } from "@/components/landing-stats";
import { SiteLogo } from "@/components/site-logo";

const features = [
  {
    icon: Layers,
    title: "Cross-Platform Aggregation",
    description:
      "View identical markets across Kalshi and Polymarket side-by-side. Instantly compare prices and spreads to find the best deal.",
  },
  {
    icon: Zap,
    title: "Smart Order Routing",
    description:
      "Place a single bet and our system routes it to whichever platform offers the best price. Override anytime to choose manually.",
  },
  {
    icon: Globe,
    title: "Unified Currency Handling",
    description:
      "Trade in USD everywhere. We handle USDC conversions, wallet management, and BTC/USD display automatically behind the scenes.",
  },
  {
    icon: Shield,
    title: "One Portfolio, All Platforms",
    description:
      "Track your positions across every exchange in a single dashboard. See real-time P&L, allocations, and performance metrics.",
  },
];

const marketPreviews = [
  {
    title: "Fed rate cut in March 2026?",
    yesKalshi: 62,
    yesPoly: 59,
    volume: "$5.5M",
    change: "+2.4%",
  },
  {
    title: "Bitcoin over $150K by Q2?",
    yesKalshi: 34,
    yesPoly: 37,
    volume: "$13.1M",
    change: "-1.8%",
  },
  {
    title: "Nvidia stock exceeds $200?",
    yesKalshi: 55,
    yesPoly: 52,
    volume: "$9.9M",
    change: "+4.1%",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-sm lg:px-8">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <SiteLogo className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              UniFeed
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#markets"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Markets
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </a>
          </nav>
        </div>
        <LandingNavActions />
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center px-4 pb-16 pt-20 text-center lg:px-8 lg:pt-32 lg:pb-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              Now aggregating <span className="text-kalshi">Kalshi</span> +{" "}
              <span className="text-polymarket">Polymarket</span>
            </span>
          </div>
          <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            One Platform.<br></br> Every Prediction Market.
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Compare prices across exchanges, route orders for the best deal, and
            manage your entire portfolio from a single dashboard. No more
            switching tabs.
          </p>
          <LandingHeroActions />
        </section>

        {/* Stats Bar */}
        <LandingStats />

        {/* Live Market Preview */}
        <section id="markets" className="px-4 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Live Market Prices
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Real-time price comparison across platforms
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border bg-secondary/50 px-5 py-3 text-xs font-medium text-muted-foreground">
                <span>Market</span>
                <span className="text-right">Kalshi YES</span>
                <span className="text-right">Polymarket YES</span>
                <span className="text-right">Volume</span>
                <span className="text-right">24h</span>
              </div>
              {marketPreviews.map((m, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border px-5 py-4 last:border-b-0"
                >
                  <span className="text-sm font-medium text-foreground">
                    {m.title}
                  </span>
                  <span className="text-right font-mono text-sm text-foreground">
                    {m.yesKalshi}c
                  </span>
                  <span className="text-right font-mono text-sm text-foreground">
                    {m.yesPoly}c
                  </span>
                  <span className="text-right font-mono text-sm text-muted-foreground">
                    {m.volume}
                  </span>
                  <span
                    className={`text-right font-mono text-sm ${m.change.startsWith("+")
                      ? "text-primary"
                      : "text-destructive"
                      }`}
                  >
                    {m.change}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  View All Markets
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="border-t border-border bg-card/30 px-4 py-16 lg:px-8 lg:py-24"
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Built for Smarter Trading
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Everything you need to trade prediction markets efficiently
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section
          id="how-it-works"
          className="border-t border-border px-4 py-16 lg:px-8 lg:py-24"
        >
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                How It Works
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Three steps to smarter prediction market trading
              </p>
            </div>
            <div className="flex flex-col gap-8">
              {[
                {
                  step: "01",
                  title: "Browse Aggregated Markets",
                  description:
                    "We pull markets from Kalshi and Polymarket in real-time, matching identical events so you can compare prices instantly.",
                  icon: BarChart3,
                },
                {
                  step: "02",
                  title: "Place Your Bet",
                  description:
                    "Choose YES or NO on any market. Our smart router automatically sends your order to the platform with the best price, or override and pick manually.",
                  icon: TrendingUp,
                },
                {
                  step: "03",
                  title: "Track & Manage",
                  description:
                    "Monitor all positions in a unified portfolio. See real-time P&L, manage open orders, and analyze your performance across platforms.",
                  icon: Shield,
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-sm font-bold text-primary">
                      {item.step}
                    </div>
                    <div className="mt-2 h-full w-px bg-border" />
                  </div>
                  <div className="pb-8">
                    <h3 className="text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-card/50 px-4 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Ready to Trade Smarter?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Join traders who save an average of 3.2% per trade by aggregating
              prediction markets.
            </p>
            <LandingBottomActions />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-8 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <SiteLogo className="h-6 w-6 rounded" />
            <span className="text-sm font-semibold text-foreground">
              UniFeed
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Prediction markets involve risk. This platform is for informational
            purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}
