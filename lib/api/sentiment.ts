import type { MarketSentiment } from "@/lib/types"
import { useMockData, apiUrl } from "./config"

function mockSentiment(marketId: string): MarketSentiment {
  return {
    marketId,
    topic: "Mock market",
    status: "unavailable",
    newsSentimentText: "Sentiment is unavailable in mock mode.",
    discussionSentimentText: "Sentiment is unavailable in mock mode.",
    combinedSentimentText: "Sentiment is unavailable in mock mode.",
    error: "Mock mode enabled",
  }
}

export async function getMarketSentiment(marketId: string): Promise<MarketSentiment> {
  if (useMockData) {
    return Promise.resolve(mockSentiment(marketId))
  }
  const res = await fetch(apiUrl(`/api/markets/${marketId}/sentiment`))
  if (!res.ok) {
    return {
      marketId,
      topic: "",
      status: "unavailable",
      newsSentimentText: "Sentiment currently unavailable.",
      discussionSentimentText: "Sentiment currently unavailable.",
      combinedSentimentText: "Sentiment currently unavailable.",
      error: `Failed to fetch sentiment (${res.status})`,
    }
  }
  return res.json()
}
