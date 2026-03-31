import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Plus, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDataStore } from "@/stores/dataStore"
import { useDueCards } from "@/hooks/useDueCards"
import { ProjectCard } from "./ProjectCard"
import { ProjectForm } from "./ProjectForm"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { toast } from "sonner"

export function ProjectList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [deletingProject, setDeletingProject] = useState<string | null>(null)

  const { data, addProject, updateProject, deleteProject } = useDataStore()
  const dueCards = useDueCards()

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setFormOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const getDueCount = (projectId: string) =>
    dueCards.filter((c) => c.projectId === projectId).length

  const editProject = data.projects.find((p) => p.id === editingProject)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Organize your flashcards by subject</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {data.projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Create your first project to start organizing flashcards by subject."
          action={{
            label: "Create Project",
            onClick: () => setFormOpen(true),
          }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              dueCount={getDueCount(project.id)}
              onEdit={() => setEditingProject(project.id)}
              onDelete={() => setDeletingProject(project.id)}
            />
          ))}
        </div>
      )}

      <ProjectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={({ name, description, color, icon }) => {
          addProject(name, description, color, icon)
          toast.success("Project created")
        }}
      />

      {editProject && (
        <ProjectForm
          open={true}
          onOpenChange={() => setEditingProject(null)}
          title="Edit Project"
          initialData={editProject}
          onSubmit={(updates) => {
            updateProject(editProject.id, updates)
            setEditingProject(null)
            toast.success("Project updated")
          }}
        />
      )}

      <ConfirmDialog
        open={!!deletingProject}
        onOpenChange={() => setDeletingProject(null)}
        title="Delete Project"
        description="This will permanently delete the project and all its topics and cards. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deletingProject) {
            deleteProject(deletingProject)
            toast.success("Project deleted")
          }
        }}
      />
    </div>
  )
}
