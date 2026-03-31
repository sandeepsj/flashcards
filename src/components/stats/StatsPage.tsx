import { useMemo } from "react"
import { BarChart3 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useDataStore } from "@/stores/dataStore"
import { useAllCards } from "@/hooks/useDueCards"
import { EmptyState } from "@/components/shared/EmptyState"
import { format, subDays, startOfDay } from "date-fns"

export function StatsPage() {
  const { data } = useDataStore()
  const allCards = useAllCards()
  const { stats } = data

  // Study time per day (last 30 days)
  const studyTimeData = useMemo(() => {
    const days: { date: string; cards: number; minutes: number }[] = []
    const today = startOfDay(new Date())

    for (let i = 29; i >= 0; i--) {
      const day = subDays(today, i)
      const dateStr = format(day, "yyyy-MM-dd")
      const daySessions = stats.sessions.filter((s) => s.startTime.startsWith(dateStr))
      const cards = daySessions.reduce((sum, s) => sum + s.cardsReviewed, 0)
      const minutes = daySessions.reduce((sum, s) => {
        const dur = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000
        return sum + Math.max(1, Math.round(dur))
      }, 0)

      days.push({ date: format(day, "MMM d"), cards, minutes })
    }
    return days
  }, [stats.sessions])

  // Retention over time (7-day rolling)
  const retentionData = useMemo(() => {
    const points: { date: string; retention: number }[] = []
    const today = startOfDay(new Date())

    for (let i = 29; i >= 0; i--) {
      const windowEnd = subDays(today, i)
      const windowStart = subDays(windowEnd, 6)
      const windowSessions = stats.sessions.filter((s) => {
        const d = new Date(s.startTime)
        return d >= windowStart && d <= windowEnd
      })
      const totalReviewed = windowSessions.reduce((sum, s) => sum + s.cardsReviewed, 0)
      const totalCorrect = windowSessions.reduce((sum, s) => sum + s.correctCount, 0)
      const retention = totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : 0

      points.push({ date: format(windowEnd, "MMM d"), retention })
    }
    return points
  }, [stats.sessions])

  // Card maturity distribution
  const maturityData = useMemo(() => {
    const newCards = allCards.filter((c) => c.sm2.repetitions === 0).length
    const learning = allCards.filter((c) => c.sm2.repetitions > 0 && c.sm2.interval < 21).length
    const mature = allCards.filter((c) => c.sm2.interval >= 21).length

    return [
      { name: "New", value: newCards, color: "#3b82f6" },
      { name: "Learning", value: learning, color: "#f97316" },
      { name: "Mature", value: mature, color: "#22c55e" },
    ]
  }, [allCards])

  // Mastery by project
  const masteryData = useMemo(() => {
    return data.projects.map((project) => {
      const cards = project.topics.flatMap((t) => t.cards)
      const avgEase = cards.length > 0
        ? cards.reduce((sum, c) => sum + c.sm2.easeFactor, 0) / cards.length
        : 2.5
      const mastery = Math.round(((avgEase - 1.3) / (2.5 - 1.3)) * 100)
      return { name: project.name, mastery: Math.max(0, Math.min(100, mastery)) }
    })
  }, [data.projects])

  if (stats.sessions.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No statistics yet"
        description="Complete some study sessions to see your learning analytics."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground">Track your learning progress</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{stats.totalReviews}</p>
            <p className="text-xs text-muted-foreground">Total Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{stats.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{stats.sessions.length}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{allCards.length}</p>
            <p className="text-xs text-muted-foreground">Total Cards</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="mastery">Mastery</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cards Reviewed per Day</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studyTimeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="cards" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">7-Day Rolling Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [`${value}%`, "Retention"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="retention"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Card Maturity Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={maturityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {maturityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mastery" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mastery by Project</CardTitle>
            </CardHeader>
            <CardContent>
              {masteryData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No projects yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={masteryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={100} className="text-xs" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`${value}%`, "Mastery"]}
                    />
                    <Bar dataKey="mastery" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
