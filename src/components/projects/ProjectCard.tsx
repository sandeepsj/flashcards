import { useNavigate } from "react-router-dom"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Project } from "@/types/models"

interface ProjectCardProps {
  project: Project
  dueCount: number
  onEdit: () => void
  onDelete: () => void
}

export function ProjectCard({ project, dueCount, onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate()
  const totalCards = project.topics.reduce((sum, t) => sum + t.cards.length, 0)

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow group"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: project.color + "20" }}
          >
            {project.icon}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="font-semibold mb-1">{project.name}</h3>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{project.topics.length} topics</span>
          <span>&middot;</span>
          <span>{totalCards} cards</span>
          {dueCount > 0 && (
            <>
              <span>&middot;</span>
              <span className="text-orange-500 font-medium">{dueCount} due</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
