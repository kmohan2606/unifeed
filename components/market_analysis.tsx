import { Spinner } from "@/components/spinner"
import { Card, CardContent } from "@/components/ui/card"

interface MarketSentimentProps {
  text: string
}

export function MarketSentiment({ text }: MarketSentimentProps) {
  return (
    <Card className="border-border bg-card mb-2">
      <CardContent className="flex items-center gap-2 p-3">
        <span className="text-xs font-semibold text-muted-foreground">Market Sentiment:</span>
        {text
          ? <span className="text-sm text-foreground">{text}</span>
          : <Spinner />}
      </CardContent>
    </Card>
  )
}