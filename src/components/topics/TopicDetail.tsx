import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, GraduationCap, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDataStore } from "@/stores/dataStore"
import { useDueCards } from "@/hooks/useDueCards"
import { CardList } from "@/components/cards/CardList"
import { CardForm } from "@/components/cards/CardForm"

export function TopicDetail() {
  const { id: topicId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data } = useDataStore()
  const [cardFormOpen, setCardFormOpen] = useState(false)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  // Find topic across all projects
  const found = useMemo(() => {
    for (const project of data.projects) {
      const topic = project.topics.find((t) => t.id === topicId)
      if (topic) return { project, topic }
    }
    return null
  }, [data.projects, topicId])

  const dueCards = useDueCards(found?.project.id, topicId)

  if (!found) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Topic not found</p>
        <Button variant="link" onClick={() => navigate("/projects")}>
          Back to Projects
        </Button>
      </div>
    )
  }

  const { project, topic } = found

  const filteredCards = topic.cards.filter((card) => {
    const matchesSearch =
      !searchQuery ||
      card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = filterType === "all" || card.type === filterType

    return matchesSearch && matchesType
  })

  const editingCard = editingCardId
    ? topic.cards.find((c) => c.id === editingCardId)
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/projects/${project.id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-0.5">
            <span>{project.icon}</span>
            <span>{project.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{topic.name}</h1>
          {topic.description && (
            <p className="text-sm text-muted-foreground">{topic.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {dueCards.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/study/${topic.id}`)}
            >
              <GraduationCap className="h-4 w-4 mr-1" />
              Study
              <Badge variant="secondary" className="ml-1">
                {dueCards.length}
              </Badge>
            </Button>
          )}
          <Button size="sm" onClick={() => setCardFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Card
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32">
            <Filter className="h-4 w-4 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="cloze">Cloze</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredCards.length} card{filteredCards.length !== 1 ? "s" : ""}
        </span>
      </div>

      <CardList
        cards={filteredCards}
        projectId={project.id}
        topicId={topic.id}
        onEdit={(cardId) => setEditingCardId(cardId)}
        onAdd={() => setCardFormOpen(true)}
      />

      <CardForm
        open={cardFormOpen}
        onOpenChange={setCardFormOpen}
        projectId={project.id}
        topicId={topic.id}
      />

      {editingCard && (
        <CardForm
          open={true}
          onOpenChange={() => setEditingCardId(null)}
          projectId={project.id}
          topicId={topic.id}
          initialData={editingCard}
        />
      )}
    </div>
  )
}
