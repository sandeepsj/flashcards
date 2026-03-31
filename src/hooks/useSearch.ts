import { useMemo, useState } from "react"
import { useAllCards, type DueCard } from "./useDueCards"

export function useSearch() {
  const [query, setQuery] = useState("")
  const allCards = useAllCards()

  const results = useMemo(() => {
    if (!query.trim()) return []

    const q = query.toLowerCase()
    const scored: { card: DueCard; score: number }[] = []

    for (const card of allCards) {
      let score = 0
      const front = card.front.toLowerCase()
      const back = card.back.toLowerCase()
      const tags = card.tags.map((t) => t.toLowerCase())

      if (front === q || back === q) score = 3
      else if (front.startsWith(q) || back.startsWith(q)) score = 2
      else if (front.includes(q) || back.includes(q)) score = 1
      else if (tags.some((t) => t.includes(q))) score = 1

      if (score > 0) scored.push({ card, score })
    }

    return scored.sort((a, b) => b.score - a.score).map((s) => s.card)
  }, [query, allCards])

  return { query, setQuery, results }
}
