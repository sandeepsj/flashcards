import { useNavigate } from "react-router-dom"
import { Trophy, Target, Clock, ArrowLeft, RotateCcw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { differenceInMinutes } from "date-fns"

interface SessionSummaryProps {
  cardsReviewed: number
  correctCount: number
  startTime: string
  endTime: string
  onStudyAgain?: () => void
}

export function SessionSummary({
  cardsReviewed,
  correctCount,
  startTime,
  endTime,
  onStudyAgain,
}: SessionSummaryProps) {
  const navigate = useNavigate()
  const accuracy = cardsReviewed > 0 ? Math.round((correctCount / cardsReviewed) * 100) : 0
  const duration = Math.max(1, differenceInMinutes(new Date(endTime), new Date(startTime)))

  return (
    <div className="max-w-md mx-auto space-y-6 py-8">
      <div className="text-center space-y-2">
        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
          <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold">Session Complete!</h2>
        <p className="text-muted-foreground">Great work on your study session</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <Target className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{cardsReviewed}</p>
            <p className="text-xs text-muted-foreground">Reviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Trophy className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Clock className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{duration}</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        {onStudyAgain && (
          <Button className="flex-1" onClick={onStudyAgain}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Study More
          </Button>
        )}
      </div>
    </div>
  )
}
