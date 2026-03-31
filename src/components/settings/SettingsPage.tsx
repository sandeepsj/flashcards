import { Download, Upload, Sun, Moon, Monitor } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDataStore } from "@/stores/dataStore"
import { useUIStore } from "@/stores/uiStore"
import { useTimerStore } from "@/stores/timerStore"
import { applyTheme } from "@/lib/theme"
import { toast } from "sonner"

export function SettingsPage() {
  const { data, updateSettings } = useDataStore()
  const { theme, setTheme } = useUIStore()
  const timerStore = useTimerStore()
  const settings = data.settings

  const handleTheme = (t: "light" | "dark" | "system") => {
    setTheme(t)
    applyTheme(t)
    updateSettings({ theme: t })
  }

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `flashmind-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Data exported")
  }

  const handleExportCSV = () => {
    const rows = [["Front", "Back", "Type", "Tags", "Topic", "Project"]]
    for (const project of data.projects) {
      for (const topic of project.topics) {
        for (const card of topic.cards) {
          rows.push([
            card.front.replace(/"/g, '""'),
            card.back.replace(/"/g, '""'),
            card.type,
            card.tags.join(";"),
            topic.name,
            project.name,
          ])
        }
      }
    }
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `flashmind-cards-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Cards exported as CSV")
  }

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string)
        if (imported.projects && imported.settings && imported.stats) {
          const { setData } = useDataStore.getState()
          const { fileId } = useDataStore.getState()
          setData(imported, fileId || "")
          useDataStore.getState().triggerSync()
          toast.success("Data imported successfully")
        } else {
          toast.error("Invalid file format")
        }
      } catch {
        toast.error("Failed to parse file")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Customize your learning experience</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={(v) => handleTheme(v as "light" | "dark" | "system")}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" /> Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" /> Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" /> System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Study */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Study</CardTitle>
          <CardDescription>Configure your daily study goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Daily review goal</Label>
            <Input
              type="number"
              className="w-20 text-center"
              value={settings.dailyGoal}
              min={1}
              max={500}
              onChange={(e) => updateSettings({ dailyGoal: parseInt(e.target.value) || 20 })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>New cards per day</Label>
            <Input
              type="number"
              className="w-20 text-center"
              value={settings.newCardsPerDay}
              min={0}
              max={100}
              onChange={(e) => updateSettings({ newCardsPerDay: parseInt(e.target.value) || 10 })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pomodoro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pomodoro Timer</CardTitle>
          <CardDescription>Configure focus and break durations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Focus duration (min)</Label>
            <Input
              type="number"
              className="w-20 text-center"
              value={settings.pomodoroWork}
              min={1}
              max={120}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 25
                updateSettings({ pomodoroWork: val })
                timerStore.setDurations(val, settings.pomodoroBreak, settings.pomodoroLongBreak, settings.pomodorosBeforeLongBreak)
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Short break (min)</Label>
            <Input
              type="number"
              className="w-20 text-center"
              value={settings.pomodoroBreak}
              min={1}
              max={30}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 5
                updateSettings({ pomodoroBreak: val })
                timerStore.setDurations(settings.pomodoroWork, val, settings.pomodoroLongBreak, settings.pomodorosBeforeLongBreak)
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Long break (min)</Label>
            <Input
              type="number"
              className="w-20 text-center"
              value={settings.pomodoroLongBreak}
              min={1}
              max={60}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 15
                updateSettings({ pomodoroLongBreak: val })
                timerStore.setDurations(settings.pomodoroWork, settings.pomodoroBreak, val, settings.pomodorosBeforeLongBreak)
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data</CardTitle>
          <CardDescription>Import and export your flashcard data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import JSON
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJSON}
                />
              </label>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your data is automatically synced to Google Drive. Use export for local backups.
          </p>
        </CardContent>
      </Card>

      {/* Keyboard shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            {[
              ["Cmd + K", "Open command palette"],
              ["Space", "Flip card during study"],
              ["1", "Rate: Again"],
              ["2", "Rate: Hard"],
              ["3", "Rate: Good"],
              ["4", "Rate: Easy"],
              ["Escape", "Exit current view"],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">{desc}</span>
                <kbd className="px-2 py-0.5 rounded bg-muted text-xs font-mono">{key}</kbd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
