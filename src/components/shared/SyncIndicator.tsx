import { CloudOff, Loader2, Check } from "lucide-react"
import { useDataStore } from "@/stores/dataStore"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDistanceToNow } from "date-fns"

export function SyncIndicator() {
  const { isSyncing, lastSyncedAt, isLoaded } = useDataStore()

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
        <CloudOff className="h-4 w-4" />
        <span className="hidden sm:inline">Not connected</span>
      </div>
    )
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Saving...</span>
      </div>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm cursor-default">
          <Check className="h-4 w-4" />
          <span className="hidden sm:inline">Saved</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {lastSyncedAt
          ? `Last saved ${formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })}`
          : "Not yet saved"}
      </TooltipContent>
    </Tooltip>
  )
}
