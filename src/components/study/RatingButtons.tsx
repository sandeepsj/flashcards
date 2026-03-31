import { Button } from "@/components/ui/button"
import { getIntervalPreview, QUALITY_LABELS, type Quality } from "@/lib/sm2"
import type { SM2Data } from "@/types/models"
import { cn } from "@/lib/utils"

interface RatingButtonsProps {
  sm2: SM2Data
  onRate: (quality: Quality) => void
}

const ratings: Quality[] = [0, 2, 3, 5]

const ratingStyles: Record<number, string> = {
  0: "border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400",
  2: "border-orange-300 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950 text-orange-600 dark:text-orange-400",
  3: "border-blue-300 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400",
  5: "border-green-300 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950 text-green-600 dark:text-green-400",
}

export function RatingButtons({ sm2, onRate }: RatingButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {ratings.map((quality) => {
        const { label } = QUALITY_LABELS[quality]
        const preview = getIntervalPreview(quality, sm2)

        return (
          <Button
            key={quality}
            variant="outline"
            className={cn("flex flex-col gap-0.5 h-auto py-3 px-5 min-w-[80px]", ratingStyles[quality])}
            onClick={() => onRate(quality)}
          >
            <span className="font-medium text-sm">{label}</span>
            <span className="text-xs opacity-70">{preview}</span>
          </Button>
        )
      })}
    </div>
  )
}
