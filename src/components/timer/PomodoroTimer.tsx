import { useState } from "react"
import { Play, Pause, RotateCcw, SkipForward, Timer, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePomodoro } from "@/hooks/usePomodoro"
import { cn } from "@/lib/utils"

export function PomodoroTimer() {
  const [expanded, setExpanded] = useState(false)
  const timer = usePomodoro()

  const minutes = Math.floor(timer.timeRemaining / 60)
  const seconds = timer.timeRemaining % 60
  const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  const totalSeconds =
    timer.mode === "work"
      ? timer.workDuration * 60
      : timer.mode === "shortBreak"
        ? timer.breakDuration * 60
        : timer.longBreakDuration * 60
  const progress = ((totalSeconds - timer.timeRemaining) / totalSeconds) * 100

  const modeLabel = timer.mode === "work" ? "Focus" : timer.mode === "shortBreak" ? "Short Break" : "Long Break"
  const modeColor = timer.mode === "work" ? "text-red-500" : "text-green-500"

  if (!expanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          className="gap-2 shadow-lg bg-background"
          onClick={() => setExpanded(true)}
        >
          <Timer className="h-4 w-4" />
          <span className={cn("font-mono text-sm", modeColor)}>{timeStr}</span>
          <ChevronUp className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72">
      <Card className="shadow-xl">
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant={timer.mode === "work" ? "default" : "secondary"}>
              {modeLabel}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{timer.completedPomodoros} pomodoros</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setExpanded(false)}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Circular timer */}
          <div className="relative flex items-center justify-center">
            <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                strokeWidth="6"
                className="stroke-muted"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                className={timer.mode === "work" ? "stroke-red-500" : "stroke-green-500"}
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute text-center">
              <p className={cn("text-3xl font-mono font-bold", modeColor)}>{timeStr}</p>
              <p className="text-xs text-muted-foreground">{modeLabel}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={timer.reset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={timer.isRunning ? timer.pause : timer.start}
            >
              {timer.isRunning ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={timer.skipToNext}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
