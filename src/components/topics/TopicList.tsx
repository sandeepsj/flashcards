import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MoreHorizontal, Pencil, Trash2, GraduationCap, Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDataStore } from "@/stores/dataStore"
import { useDueCards } from "@/hooks/useDueCards"
import { TopicForm } from "./TopicForm"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import type { Topic } from "@/types/models"
import { toast } from "sonner"

interface TopicListProps {
  projectId: string
  topics: Topic[]
}

export function TopicList({ projectId, topics }: TopicListProps) {
  const navigate = useNavigate()
  const { deleteTopic } = useDataStore()
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [deletingTopic, setDeletingTopic] = useState<string | null>(null)
  const allDueCards = useDueCards(projectId)

  if (topics.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No topics yet"
        description="Add a topic to start organizing your flashcards."
      />
    )
  }

  return (
    <>
      <div className="grid gap-3">
        {topics.map((topic) => {
          const dueCount = allDueCards.filter((c) => c.topicId === topic.id).length
          const masteredCards = topic.cards.filter((c) => c.sm2.interval >= 21).length
          const mastery = topic.cards.length > 0
            ? Math.round((masteredCards / topic.cards.length) * 100)
            : 0

          return (
            <Card
              key={topic.id}
              className="cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => navigate(`/topics/${topic.id}`)}
            >
              <CardContent className="py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{topic.name}</h3>
                    {dueCount > 0 && (
                      <Badge variant="outline" className="text-orange-500 border-orange-200">
                        {dueCount} due
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <span>{topic.cards.length} cards</span>
                    <span>{mastery}% mastered</span>
                  </div>
                  <Progress value={mastery} className="h-1.5" />
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {dueCount > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => navigate(`/study/${topic.id}`)}
                    >
                      <GraduationCap className="h-4 w-4" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingTopic(topic)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingTopic(topic.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {editingTopic && (
        <TopicForm
          open={true}
          onOpenChange={() => setEditingTopic(null)}
          projectId={projectId}
          initialData={editingTopic}
        />
      )}

      <ConfirmDialog
        open={!!deletingTopic}
        onOpenChange={() => setDeletingTopic(null)}
        title="Delete Topic"
        description="This will permanently delete the topic and all its cards. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deletingTopic) {
            deleteTopic(projectId, deletingTopic)
            toast.success("Topic deleted")
          }
        }}
      />
    </>
  )
}
