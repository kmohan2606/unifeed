import { notFound } from "next/navigation"
import { TopNav } from "@/components/top-nav"
import { MobileNav } from "@/components/mobile-nav"
import { MarketDetail } from "@/components/market-detail"
import { AuthGuard } from "@/components/auth-guard"
import { getMarketById, getNewsForMarket, getMarketSentiment } from "@/lib/api"

export default async function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const market = await getMarketById(id)

  if (!market) {
    notFound()
  }

  const relatedNews = await getNewsForMarket(market.id)
  const sentiment = await getMarketSentiment(market.id)

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-background">
        <TopNav />
        <main className="flex-1 px-4 py-6 pb-20 md:pb-6 lg:px-6">
          <div className="mx-auto max-w-7xl">
            <MarketDetail market={market} news={relatedNews} sentiment={sentiment} />
          </div>
        </main>
        <MobileNav />
      </div>
    </AuthGuard>
  )
}
