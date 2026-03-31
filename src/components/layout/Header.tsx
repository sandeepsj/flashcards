import { Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { SyncIndicator } from "@/components/shared/SyncIndicator"
import { UserMenu } from "@/components/auth/UserMenu"
import { useUIStore } from "@/stores/uiStore"

export function Header() {
  const { toggleSidebar, setCommandPaletteOpen } = useUIStore()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex items-center gap-2 text-muted-foreground w-64"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left text-sm">Search...</span>
          <kbd className="pointer-events-none text-xs text-muted-foreground border rounded px-1.5 py-0.5 bg-muted">
            Cmd+K
          </kbd>
        </Button>

        <div className="flex-1" />

        <SyncIndicator />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
