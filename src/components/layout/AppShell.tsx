import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useUIStore } from "@/stores/uiStore"
import { useIsMobile } from "@/hooks/useMediaQuery"
import { useGlobalShortcuts } from "@/hooks/useKeyboardShortcuts"
import { CommandPalette } from "./CommandPalette"
import { PomodoroTimer } from "@/components/timer/PomodoroTimer"

export function AppShell() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const isMobile = useIsMobile()

  useGlobalShortcuts()

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="w-64 border-r bg-sidebar flex-shrink-0 hidden md:block">
          <div className="sticky top-0 h-screen overflow-hidden">
            <Sidebar />
          </div>
        </aside>
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <CommandPalette />
      <PomodoroTimer />
    </div>
  )
}
