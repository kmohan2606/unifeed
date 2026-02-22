import { Spinner } from "@/components/spinner"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface MarketSentimentProps {
  text: string
}

export function MarketSentiment({ text }: MarketSentimentProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium text-foreground">Market Sentiment</h3>
      </CardHeader>
      <CardContent className="pt-0">
        {text
          ? <p className="text-xs text-foreground leading-relaxed">{text}</p>
          : <Spinner />}
      </CardContent>
    </Card>
  )
}