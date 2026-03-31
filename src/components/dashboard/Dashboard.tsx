import { useNavigate } from "react-router-dom"
import { GraduationCap, Flame, Target, Clock, TrendingUp, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useDataStore } from "@/stores/dataStore"
import { useDueCards, useAllCards } from "@/hooks/useDueCards"
import { WeeklyHeatmap } from "./WeeklyHeatmap"
import { RecentActivity } from "./RecentActivity"
import { EmptyState } from "@/components/shared/EmptyState"

export function Dashboard() {
  const navigate = useNavigate()
  const { data } = useDataStore()
  const dueCards = useDueCards()
  const allCards = useAllCards()
  const { stats, settings } = data

  const todayStr = new Date().toISOString().split("T")[0]
  const todayReviews = stats.sessions
    .filter((s) => s.startTime.startsWith(todayStr))
    .reduce((sum, s) => sum + s.cardsReviewed, 0)

  const goalProgress = Math.min(100, (todayReviews / settings.dailyGoal) * 100)

  const matureCards = allCards.filter((c) => c.sm2.interval >= 21).length
  const learningCards = allCards.filter((c) => c.sm2.interval > 0 && c.sm2.interval < 21).length
  const newCards = allCards.filter((c) => c.sm2.repetitions === 0).length

  if (data.projects.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Welcome to FlashMind"
        description="Create your first project to start building flashcards and mastering new topics."
        action={{
          label: "Create First Project",
          onClick: () => navigate("/projects?new=true"),
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Your learning overview</p>
        </div>
        {dueCards.length > 0 && (
          <Button onClick={() => navigate("/study")} className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Study Now ({dueCards.length})
          </Button>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-2">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dueCards.length}</p>
                <p className="text-xs text-muted-foreground">Due Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalReviews}</p>
                <p className="text-xs text-muted-foreground">Total Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allCards.length}</p>
                <p className="text-xs text-muted-foreground">Total Cards</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Goal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              Daily Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{todayReviews} / {settings.dailyGoal} cards</span>
              <span className="text-muted-foreground">{Math.round(goalProgress)}%</span>
            </div>
            <Progress value={goalProgress} className="h-3" />
            {goalProgress >= 100 && (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Goal achieved! Great work!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Card Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Card Maturity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span>New</span>
                </div>
                <span className="font-medium">{newCards}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500" />
                  <span>Learning</span>
                </div>
                <span className="font-medium">{learningCards}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span>Mature</span>
                </div>
                <span className="font-medium">{matureCards}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <WeeklyHeatmap sessions={stats.sessions} />
        <RecentActivity sessions={stats.sessions} />
      </div>
    </div>
  )
}
