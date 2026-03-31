import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Settings,
  GraduationCap,
  Plus,
  Search,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useUIStore } from "@/stores/uiStore"
import { useDataStore } from "@/stores/dataStore"
import { useSearch } from "@/hooks/useSearch"

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const navigate = useNavigate()
  const projects = useDataStore((s) => s.data.projects)
  const { query, setQuery, results } = useSearch()

  const go = (path: string) => {
    navigate(path)
    setCommandPaletteOpen(false)
    setQuery("")
  }

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput
        placeholder="Search cards, navigate..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {results.length > 0 && (
          <CommandGroup heading="Cards">
            {results.slice(0, 5).map((card) => (
              <CommandItem
                key={card.id}
                onSelect={() => go(`/topics/${card.topicId}`)}
              >
                <Search className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm">{card.front.slice(0, 60)}</span>
                  <span className="text-xs text-muted-foreground">
                    {card.projectName} / {card.topicName}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => go("/")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go("/projects")}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Projects
          </CommandItem>
          <CommandItem onSelect={() => go("/study")}>
            <GraduationCap className="mr-2 h-4 w-4" />
            Study Now
          </CommandItem>
          <CommandItem onSelect={() => go("/stats")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Statistics
          </CommandItem>
          <CommandItem onSelect={() => go("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/projects?new=true")}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </CommandItem>
        </CommandGroup>

        {projects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Projects">
              {projects.map((p) => (
                <CommandItem key={p.id} onSelect={() => go(`/projects/${p.id}`)}>
                  <span className="mr-2">{p.icon}</span>
                  {p.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
