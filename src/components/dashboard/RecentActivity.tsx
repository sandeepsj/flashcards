import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow, differenceInMinutes } from "date-fns"
import type { StudySession } from "@/types/models"
import { GraduationCap } from "lucide-react"

interface RecentActivityProps {
  sessions: StudySession[]
}

export function RecentActivity({ sessions }: RecentActivityProps) {
  const recent = sessions.slice(-5).reverse()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No study sessions yet
          </p>
        ) : (
          <div className="space-y-3">
            {recent.map((session) => {
              const duration = differenceInMinutes(
                new Date(session.endTime),
                new Date(session.startTime)
              )
              const accuracy =
                session.cardsReviewed > 0
                  ? Math.round((session.correctCount / session.cardsReviewed) * 100)
                  : 0

              return (
                <div key={session.id} className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-1.5">
                    <GraduationCap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {session.cardsReviewed} cards reviewed
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {accuracy}% correct &middot; {duration || 1} min
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
