import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Settings,
  GraduationCap,
  Plus,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useDataStore } from "@/stores/dataStore"
import { useDueCards } from "@/hooks/useDueCards"
import { Badge } from "@/components/ui/badge"

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/projects", icon: FolderOpen, label: "Projects" },
  { path: "/stats", icon: BarChart3, label: "Statistics" },
  { path: "/settings", icon: Settings, label: "Settings" },
]

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const projects = useDataStore((s) => s.data.projects)
  const dueCards = useDueCards()

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-lg"
          onClick={onNavigate}
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          FlashMind
        </Link>
      </div>

      {dueCards.length > 0 && (
        <div className="px-3 mb-2">
          <Button
            className="w-full justify-start gap-2"
            size="sm"
            onClick={() => {
              navigate("/study")
              onNavigate?.()
            }}
          >
            <GraduationCap className="h-4 w-4" />
            Study Now
            <Badge variant="secondary" className="ml-auto text-xs">
              {dueCards.length}
            </Badge>
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                location.pathname === path
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <Separator className="my-3" />

        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Projects
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => {
                navigate("/projects?new=true")
                onNavigate?.()
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                location.pathname === `/projects/${project.id}`
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <span className="text-base">{project.icon}</span>
              <span className="truncate flex-1">{project.name}</span>
              <ChevronRight className="h-3 w-3 opacity-50" />
            </Link>
          ))}

          {projects.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              No projects yet
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
