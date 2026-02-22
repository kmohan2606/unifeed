import type { Market, Position, NewsItem, UserBalance, OrderbookData, OrderbookEntry, Platform } from "./types"

function generatePriceHistory(baseKalshi: number, basePoly: number) {
  const points = []
  let kPrice = baseKalshi - 0.15
  let pPrice = basePoly - 0.12
  const hours = ["12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "00:00", "02:00", "04:00", "06:00", "08:00", "Now"]
  for (let i = 0; i < 24; i++) {
    kPrice += (Math.random() - 0.45) * 0.03
    pPrice += (Math.random() - 0.45) * 0.03
    kPrice = Math.max(0.01, Math.min(0.99, kPrice))
    pPrice = Math.max(0.01, Math.min(0.99, pPrice))
    const best = Math.min(kPrice, pPrice)
    points.push({
      time: hours[i],
      kalshiYes: parseFloat(kPrice.toFixed(3)),
      polymarketYes: parseFloat(pPrice.toFixed(3)),
      bestYes: parseFloat(best.toFixed(3)),
    })
  }
  return points
}

export const markets: Market[] = [
  {
    id: "m1",
    title: "Will the Federal Reserve cut rates in March 2026?",
    category: "Economics",
    description: "Resolves YES if the Federal Reserve announces a rate cut at or before its March 2026 FOMC meeting.",
    endDate: "2026-03-19",
    status: "open",
    platforms: [
      { platform: "kalshi", yesPrice: 0.62, noPrice: 0.38, volume: 2450000, openInterest: 890000 },
      { platform: "polymarket", yesPrice: 0.59, noPrice: 0.41, volume: 3100000, openInterest: 1200000 },
    ],
    bestYes: { price: 0.59, platform: "polymarket" },
    bestNo: { price: 0.38, platform: "kalshi" },
    spread: 0.03,
    change24h: 2.4,
    totalVolume: 5550000,
    priceHistory: generatePriceHistory(0.62, 0.59),
    tags: ["Fed", "Interest Rates", "Macro"],
    rules: [
      "Resolves YES if the Federal Open Market Committee (FOMC) announces a reduction in the federal funds target rate at or before its March 18-19, 2026 meeting.",
      "The resolution source is the official FOMC press release published on federalreserve.gov.",
      "An emergency or unscheduled rate cut before the March meeting also qualifies for YES resolution.",
      "If the FOMC holds rates steady or raises rates, this market resolves NO.",
    ],
    platformUrls: {
      kalshi: "https://kalshi.com/markets/fed-rate-cut-march-2026",
      polymarket: "https://polymarket.com/event/fed-rate-cut-march-2026",
    },
  },
  {
    id: "m2",
    title: "Will Bitcoin exceed $150,000 by end of Q2 2026?",
    category: "Crypto",
    description: "Resolves YES if Bitcoin's price exceeds $150,000 at any point before June 30, 2026.",
    endDate: "2026-06-30",
    status: "open",
    platforms: [
      { platform: "kalshi", yesPrice: 0.34, noPrice: 0.66, volume: 4200000, openInterest: 1800000 },
      { platform: "polymarket", yesPrice: 0.37, noPrice: 0.63, volume: 8900000, openInterest: 3200000 },
    ],
    bestYes: { price: 0.34, platform: "kalshi" },
    bestNo: { price: 0.63, platform: "polymarket" },
    spread: 0.03,
    change24h: -1.8,
    totalVolume: 13100000,
    priceHistory: generatePriceHistory(0.34, 0.37),
    tags: ["Bitcoin", "Crypto", "Price"],
    rules: [
      "Resolves YES if the price of Bitcoin (BTC/USD) exceeds $150,000.00 at any point before 11:59 PM ET on June 30, 2026.",
      "Price is determined by the CoinGecko BTC/USD index, using the highest recorded price within the resolution window.",
      "Intraday wicks and flash crashes count -- only the peak matters for YES resolution.",
      "If BTC never exceeds $150,000 before the deadline, this market resolves NO.",
    ],
    platformUrls: {
      kalshi: "https://kalshi.com/markets/btc-150k-q2-2026",
      polymarket: "https://polymarket.com/event/btc-150k-q2-2026",
    },
  },
  {
    id: "m3",
    title: "Will the US GDP growth exceed 3% in Q1 2026?",
    category: "Economics",
    description: "Resolves YES if the Bureau of Economic Analysis reports Q1 2026 GDP growth above 3% annualized.",
    endDate: "2026-04-30",
    status: "open",
    platforms: [
      { platform: "kalshi", yesPrice: 0.28, noPrice: 0.72, volume: 1200000, openInterest: 450000 },
      { platform: "polymarket", yesPrice: 0.31, noPrice: 0.69, volume: 980000, openInterest: 340000 },
    ],
    bestYes: { price: 0.28, platform: "kalshi" },
    bestNo: { price: 0.69, platform: "polymarket" },
    spread: 0.03,
    change24h: 0.5,
    totalVolume: 2180000,
    priceHistory: generatePriceHistory(0.28, 0.31),
    tags: ["GDP", "Economy", "Growth"],
    rules: [
      "Resolves YES if the Bureau of Economic Analysis (BEA) advance estimate reports annualized real GDP growth above 3.0% for Q1 2026.",
      "Only the initial advance estimate is used for resolution, not subsequent revisions.",
      "The resolution source is the official BEA GDP release at bea.gov.",
    ],
    platformUrls: {
      kalshi: "https://kalshi.com/markets/gdp-q1-2026",
      polymarket: "https://polymarket.com/event/gdp-q1-2026",
    },
  },
  {
    id: "m4",
    title: "Will Tesla deliver over 500K vehicles in Q1 2026?",
    category: "Tech",
    description: "Resolves YES if Tesla reports Q1 2026 deliveries exceeding 500,000 vehicles.",
    endDate: "2026-04-02",
    status: "open",
    platforms: [
      { platform: "kalshi", yesPrice: 0.45, noPrice: 0.55, volume: 3400000, openInterest: 1100000 },
      { platform: "polymarket", yesPrice: 0.48, noPrice: 0.52, volume: 2800000, openInterest: 950000 },
    ],
    bestYes: { price: 0.45, platform: "kalshi" },
    bestNo: { price: 0.52, platform: "polymarket" },
    spread: 0.03,
    change24h: 3.2,
    totalVolume: 6200000,
    priceHistory: generatePriceHistory(0.45, 0.48),
    tags: ["Tesla", "EV", "Deliveries"],
    rules: [
      "Resolves YES if Tesla, Inc. reports total Q1 2026 vehicle deliveries exceeding 500,000 units.",
      "The resolution source is Tesla's official quarterly delivery report filed with the SEC or published on ir.tesla.com.",
      "Both new and refurbished vehicle deliveries count toward the total.",
    ],
    platformUrls: {
      kalshi: "https://kalshi.com/markets/tesla-deliveries-q1-2026",
      polymarket: "https://polymarket.com/event/tesla-deliveries-q1-2026",
    },
  },
  {
    id: "m5",
    title: "Will the Supreme Court rule on TikTok ban by June 2026?",
    category: "Politics",
    description: "Resolves YES if the Supreme Court issues a ruling on the TikTok divest-or-ban legislation by June 30, 2026.",
    endDate: "2026-06-30",
    status: "open",
    platforms: [
      { platform: "kalshi", yesPrice: 0.71, noPrice: 0.29, volume: 1800000, openInterest: 670000 },
      { platform: "polymarket", yesPrice: 0.68, noPrice: 0.32, volume: 2200000, openInterest: 780000 },
    ],
    bestYes: { price: 0.68, platform: "polymarket" },
    bestNo: { price: 0.29, platform: "kalshi" },
    spread: 0.03,
    change24h: -0.9,
    totalVolume: 4000000,
    priceHistory: generatePriceHistory(0.71, 0.68),
    tags: ["TikTok", "Supreme Court", "Regulation"],
    rules: [
      "Resolves YES if the Supreme Court of the United States issues a ruling (majority opinion, per curiam, or summary order) on the TikTok divest-or-ban legislation by June 30, 2026.",
      "Denial of certiorari does not count as a ruling for purposes of this market.",
      "The resolution source is the official Supreme Court opinion published on supremecourt.gov.",
    ],
    platformUrls: {
      kalshi: "https://kalshi.com/markets/scotus-tiktok-2026",
      polymarket: "https://polymarket.com/event/scotus-tiktok-2026",
    },
  },
  {
    id: "m6",
    title: "Will Nvidia stock price exceed $200 by March 2026?",
    category: "Tech",
    description: "Resolves YES if NVDA stock price closes above $200 on any trading day before March 31, 2026.",
    endDate: "2026-03-31",
    status: "open",
    platforms: [
      { platform: "kalshi", yesPrice: 0.55, noPrice: 0.45, volume: 5600000, openInterest: 2100000 },
      { platform: "polymarket", yesPrice: 0.52, noPrice: 0.48, volume: 4300000, openInterest: 1700000 },
    ],
    bestYes: { price: 0.52, platform: "polymarket" },
    bestNo: { price: 0.45, platform: "kalshi" },
    spread: 0.03,
    change24h: 4.1,
    totalVolume: 9900000,
    priceHistory: generatePriceHistory(0.55, 0.52),
    tags: ["Nvidia", "AI", "Stocks"],
    rules: [
      "Resolves YES if NVDA common stock closes above $200.00 per share on any regular trading day before March 31, 2026.",
      "After-hours and pre-market prices do not count. Only the official closing price on NYSE/NASDAQ is used.",
      "Stock splits are adjusted -- the threshold is equivalent to $200 on today's share basis.",
    ],
    platformUrls: {
      kalshi: "https://kalshi.com/markets/nvda-200-march-2026",
      polymarket: "https://polymarket.com/event/nvda-200-march-2026",
    },
  },
  {
    id: "m7",
    title: "Will Ukraine-Russia ceasefire be announced by April 2026?",
    category: "Geopolitics",
    description: "Resolves YES if an official ceasefire agreement is announced between Ukraine and Russia before April 30, 2026.",
    endDate: "2026-04-30",
    status: "open",
    platforms: [
      { platform: "kalshi", yesPrice: 0.18, noPrice: 0.82, volume: 2900000, openInterest: 1050000 },
      { platform: "polymarket", yesPrice: 0.21, noPrice: 0.79, volume: 4100000, openInterest: 1450000 },
    ],
    bestYes: { price: 0.18, platform: "kalshi" },
    bestNo: { price: 0.79, platform: "polymarket" },
    spread: 0.03,
    change24h: -2.1,
    totalVolume: 7000000,
    priceHistory: generatePriceHistory(0.18, 0.21),
    tags: ["Geopolitics", "War", "Peace"],
    rules: [
      "Resolves YES if an official ceasefire agreement between Ukraine and the Russian Federation is publicly announced by a credible state authority before April 30, 2026.",
      "A temporary humanitarian pause of less than 72 hours does not qualify.",
      "Resolution sources include official government press releases, UN Security Council statements, or verified major wire service reports (Reuters, AP, AFP).",
    ],
    platformUrls: {
      kalshi: "https://kalshi.com/markets/ukraine-ceasefire-2026",
      polymarket: "https://polymarket.com/event/ukraine-ceasefire-2026",
    },
  },
  {
    id: "m8",
    title: "Will Apple announce AR glasses at WWDC 2026?",
    category: "Tech",
    description: "Resolves YES if Apple officially announces AR glasses or a new AR wearable device at WWDC 2026.",
    endDate: "2026-06-15",
    status: "open",
    platforms: [
      { platform: "kalshi", yesPrice: 0.23, noPrice: 0.77, volume: 1500000, openInterest: 520000 },
      { platform: "polymarket", yesPrice: 0.26, noPrice: 0.74, volume: 1900000, openInterest: 680000 },
    ],
    bestYes: { price: 0.23, platform: "kalshi" },
    bestNo: { price: 0.74, platform: "polymarket" },
    spread: 0.03,
    change24h: 1.3,
    totalVolume: 3400000,
    priceHistory: generatePriceHistory(0.23, 0.26),
    tags: ["Apple", "AR", "WWDC"],
    rules: [
      "Resolves YES if Apple Inc. officially announces AR glasses or a new standalone AR wearable device during its WWDC 2026 keynote or related sessions.",
      "A software-only AR update (e.g., visionOS features) without new hardware does not qualify.",
      "The resolution source is Apple's official keynote presentation, press releases, or apple.com product pages.",
    ],
    platformUrls: {
      kalshi: "https://kalshi.com/markets/apple-ar-wwdc-2026",
      polymarket: "https://polymarket.com/event/apple-ar-wwdc-2026",
    },
  },
]

export const positions: Position[] = [
  {
    id: "p1",
    marketId: "m1",
    marketTitle: "Will the Federal Reserve cut rates in March 2026?",
    side: "yes",
    platform: "polymarket",
    quantity: 150,
    avgPrice: 0.52,
    currentPrice: 0.59,
    pnl: 10.50,
    pnlPercent: 13.46,
    timestamp: "2026-02-15T10:30:00Z",
  },
  {
    id: "p2",
    marketId: "m2",
    marketTitle: "Will Bitcoin exceed $150,000 by end of Q2 2026?",
    side: "no",
    platform: "kalshi",
    quantity: 200,
    avgPrice: 0.60,
    currentPrice: 0.66,
    pnl: 12.00,
    pnlPercent: 10.00,
    timestamp: "2026-02-10T14:15:00Z",
  },
  {
    id: "p3",
    marketId: "m6",
    marketTitle: "Will Nvidia stock price exceed $200 by March 2026?",
    side: "yes",
    platform: "kalshi",
    quantity: 100,
    avgPrice: 0.48,
    currentPrice: 0.55,
    pnl: 7.00,
    pnlPercent: 14.58,
    timestamp: "2026-02-18T09:00:00Z",
  },
  {
    id: "p4",
    marketId: "m5",
    marketTitle: "Will the Supreme Court rule on TikTok ban by June 2026?",
    side: "yes",
    platform: "polymarket",
    quantity: 75,
    avgPrice: 0.65,
    currentPrice: 0.68,
    pnl: 2.25,
    pnlPercent: 4.62,
    timestamp: "2026-02-19T11:45:00Z",
  },
]

export const newsItems: NewsItem[] = [
  {
    id: "n1",
    title: "Fed officials signal openness to March rate cut amid cooling inflation",
    source: "Reuters",
    url: "#",
    timestamp: "2026-02-21T08:30:00Z",
    sentiment: "positive",
    marketId: "m1",
  },
  {
    id: "n2",
    title: "January CPI data shows inflation dipping to 2.3%, bolstering rate cut bets",
    source: "Bloomberg",
    url: "#",
    timestamp: "2026-02-20T14:00:00Z",
    sentiment: "positive",
    marketId: "m1",
  },
  {
    id: "n3",
    title: "Fed Governor warns against premature rate cuts, cites labor market strength",
    source: "CNBC",
    url: "#",
    timestamp: "2026-02-19T16:20:00Z",
    sentiment: "negative",
    marketId: "m1",
  },
  {
    id: "n4",
    title: "Bitcoin ETF inflows hit record $2.1B in single day as institutional demand surges",
    source: "CoinDesk",
    url: "#",
    timestamp: "2026-02-21T10:00:00Z",
    sentiment: "positive",
    marketId: "m2",
  },
  {
    id: "n5",
    title: "Analyst: Bitcoin needs to break $120K resistance for $150K target",
    source: "The Block",
    url: "#",
    timestamp: "2026-02-20T09:15:00Z",
    sentiment: "neutral",
    marketId: "m2",
  },
  {
    id: "n6",
    title: "Tesla Cybertruck production ramp exceeds expectations, boosting delivery outlook",
    source: "Electrek",
    url: "#",
    timestamp: "2026-02-21T07:00:00Z",
    sentiment: "positive",
    marketId: "m4",
  },
  {
    id: "n7",
    title: "Nvidia data center revenue projected to double in 2026 amid AI spending boom",
    source: "TechCrunch",
    url: "#",
    timestamp: "2026-02-21T11:30:00Z",
    sentiment: "positive",
    marketId: "m6",
  },
  {
    id: "n8",
    title: "Peace talks between Ukraine and Russia stall over territorial disputes",
    source: "AP News",
    url: "#",
    timestamp: "2026-02-20T18:00:00Z",
    sentiment: "negative",
    marketId: "m7",
  },
  {
    id: "n9",
    title: "Apple patent filings reveal lightweight AR glasses with gesture control",
    source: "MacRumors",
    url: "#",
    timestamp: "2026-02-19T12:45:00Z",
    sentiment: "positive",
    marketId: "m8",
  },
  {
    id: "n10",
    title: "TikTok files emergency motion with Supreme Court challenging divestiture deadline",
    source: "Washington Post",
    url: "#",
    timestamp: "2026-02-21T09:00:00Z",
    sentiment: "neutral",
    marketId: "m5",
  },
]

export function generateOrderbook(market: Market, platformFilter?: Platform): OrderbookData {
  const kalshiData = market.platforms.find(p => p.platform === "kalshi")
  const polyData = market.platforms.find(p => p.platform === "polymarket")

  const baseMid = (market.bestYes.price + (1 - market.bestNo.price)) / 2
  // Slightly offset each platform's mid so their books differ realistically
  const midPrice = platformFilter === "kalshi"
    ? baseMid + 0.005
    : platformFilter === "polymarket"
      ? baseMid - 0.005
      : baseMid

  const bids: OrderbookEntry[] = []
  const asks: OrderbookEntry[] = []
  const platform = platformFilter ?? "kalshi"

  let bidTotal = 0
  for (let i = 0; i < 12; i++) {
    const offset = (i + 1) * 0.01
    const price = parseFloat((midPrice - offset).toFixed(2))
    if (price <= 0) break
    const quantity = Math.floor(500 + Math.random() * 4500)
    bidTotal += quantity
    bids.push({
      price,
      quantity,
      total: bidTotal,
      platform: platformFilter ?? (Math.random() > 0.5 ? "kalshi" : "polymarket"),
    })
  }

  let askTotal = 0
  for (let i = 0; i < 12; i++) {
    const offset = (i + 1) * 0.01
    const price = parseFloat((midPrice + offset).toFixed(2))
    if (price >= 1) break
    const quantity = Math.floor(500 + Math.random() * 4500)
    askTotal += quantity
    asks.push({
      price,
      quantity,
      total: askTotal,
      platform: platformFilter ?? (Math.random() > 0.5 ? "kalshi" : "polymarket"),
    })
  }

  const bestBid = bids[0]?.price ?? midPrice - 0.01
  const bestAsk = asks[0]?.price ?? midPrice + 0.01
  const spreadPercent = parseFloat((((bestAsk - bestBid) / midPrice) * 100).toFixed(2))

  return { bids, asks, midPrice: parseFloat(midPrice.toFixed(3)), spreadPercent }
}

export const userBalance: UserBalance = {
  total: 12480.50,
  available: 8230.25,
  inPositions: 4250.25,
  todayPnl: 31.75,
  todayPnlPercent: 0.26,
}
