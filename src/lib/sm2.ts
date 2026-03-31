import { addDays } from "date-fns"
import type { SM2Data } from "@/types/models"

export type Quality = 0 | 1 | 2 | 3 | 4 | 5

export interface SM2Result {
  repetitions: number
  interval: number
  easeFactor: number
  nextReview: string
  lastReview: string
}

export function sm2(quality: Quality, prev: SM2Data): SM2Result {
  let { repetitions, interval, easeFactor } = prev

  if (quality >= 3) {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)
    repetitions++
  } else {
    repetitions = 0
    interval = 1
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  const nextReview = addDays(new Date(), interval).toISOString()
  const lastReview = new Date().toISOString()

  return { repetitions, interval, easeFactor, nextReview, lastReview }
}

export function getIntervalPreview(quality: Quality, prev: SM2Data): string {
  const result = sm2(quality, prev)
  if (result.interval === 1) return "1d"
  if (result.interval < 30) return `${result.interval}d`
  if (result.interval < 365) return `${Math.round(result.interval / 30)}mo`
  return `${(result.interval / 365).toFixed(1)}y`
}

export const QUALITY_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: "Again", color: "text-red-500" },
  2: { label: "Hard", color: "text-orange-500" },
  3: { label: "Good", color: "text-blue-500" },
  5: { label: "Easy", color: "text-green-500" },
}
