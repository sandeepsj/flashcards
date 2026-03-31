import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { format, subDays, startOfDay } from "date-fns"
import type { StudySession } from "@/types/models"
import { cn } from "@/lib/utils"

interface WeeklyHeatmapProps {
  sessions: StudySession[]
}

export function WeeklyHeatmap({ sessions }: WeeklyHeatmapProps) {
  const today = startOfDay(new Date())
  const days = Array.from({ length: 84 }, (_, i) => subDays(today, 83 - i)) // 12 weeks

  // Count reviews per day
  const reviewsByDay = new Map<string, number>()
  for (const session of sessions) {
    const day = session.startTime.split("T")[0]
    reviewsByDay.set(day, (reviewsByDay.get(day) || 0) + session.cardsReviewed)
  }

  const maxReviews = Math.max(1, ...reviewsByDay.values())

  const getIntensity = (count: number): string => {
    if (count === 0) return "bg-muted"
    const ratio = count / maxReviews
    if (ratio < 0.25) return "bg-green-200 dark:bg-green-900"
    if (ratio < 0.5) return "bg-green-300 dark:bg-green-700"
    if (ratio < 0.75) return "bg-green-400 dark:bg-green-600"
    return "bg-green-500 dark:bg-green-500"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Study Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[repeat(12,1fr)] gap-1">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd")
            const count = reviewsByDay.get(key) || 0
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "aspect-square rounded-sm min-w-0",
                      getIntensity(count)
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {format(day, "MMM d")}: {count} cards
                  </p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
        <div className="flex items-center gap-1 mt-2 justify-end text-xs text-muted-foreground">
          <span>Less</span>
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <div className="h-3 w-3 rounded-sm bg-green-200 dark:bg-green-900" />
          <div className="h-3 w-3 rounded-sm bg-green-300 dark:bg-green-700" />
          <div className="h-3 w-3 rounded-sm bg-green-400 dark:bg-green-600" />
          <div className="h-3 w-3 rounded-sm bg-green-500" />
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}
