"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const categories = [
  "All",
  "Economics",
  "General Affairs",
  "Companies",
  "Science and Technology",
  "Weather",
  "Health",
  "Mentions",
  "Sports",
]

interface MarketFiltersProps {
  activeCategory: string
  setActiveCategory: (cat: string) => void
}

export function MarketFilters({
  activeCategory,
  setActiveCategory,
}: MarketFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            activeCategory === cat
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
