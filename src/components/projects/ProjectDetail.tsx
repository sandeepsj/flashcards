import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, GraduationCap, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDataStore } from "@/stores/dataStore"
import { useDueCards } from "@/hooks/useDueCards"
import { TopicList } from "@/components/topics/TopicList"
import { TopicForm } from "@/components/topics/TopicForm"
import { ProjectForm } from "./ProjectForm"

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, updateProject } = useDataStore()
  const [topicFormOpen, setTopicFormOpen] = useState(false)
  const [editFormOpen, setEditFormOpen] = useState(false)

  const project = data.projects.find((p) => p.id === id)
  const dueCards = useDueCards(id)

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
        <Button variant="link" onClick={() => navigate("/projects")}>
          Back to Projects
        </Button>
      </div>
    )
  }

  const totalCards = project.topics.reduce((sum, t) => sum + t.cards.length, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: project.color + "20" }}
            >
              {project.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-muted-foreground">{project.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditFormOpen(true)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          {dueCards.length > 0 && (
            <Button size="sm" onClick={() => navigate(`/study?project=${id}`)}>
              <GraduationCap className="h-4 w-4 mr-1" />
              Study
              <Badge variant="secondary" className="ml-1">
                {dueCards.length}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{project.topics.length} topics</span>
        <span>&middot;</span>
        <span>{totalCards} cards</span>
        {dueCards.length > 0 && (
          <>
            <span>&middot;</span>
            <span className="text-orange-500 font-medium">{dueCards.length} due</span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Topics</h2>
        <Button size="sm" onClick={() => setTopicFormOpen(true)} className="gap-1">
          <Plus className="h-4 w-4" />
          Add Topic
        </Button>
      </div>

      <TopicList projectId={project.id} topics={project.topics} />

      <TopicForm
        open={topicFormOpen}
        onOpenChange={setTopicFormOpen}
        projectId={project.id}
      />

      <ProjectForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        title="Edit Project"
        initialData={project}
        onSubmit={(updates) => {
          updateProject(project.id, updates)
          setEditFormOpen(false)
        }}
      />
    </div>
  )
}
