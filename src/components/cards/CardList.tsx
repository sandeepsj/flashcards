import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2, RotateCcw, Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDataStore } from "@/stores/dataStore"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { DEFAULT_SM2 } from "@/types/models"
import type { Card as CardType } from "@/types/models"
import { format } from "date-fns"
import { toast } from "sonner"

interface CardListProps {
  cards: CardType[]
  projectId: string
  topicId: string
  onEdit: (cardId: string) => void
  onAdd: () => void
}

export function CardList({ cards, projectId, topicId, onEdit, onAdd }: CardListProps) {
  const { deleteCard, updateCardSM2 } = useDataStore()
  const [deletingCard, setDeletingCard] = useState<string | null>(null)

  if (cards.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No cards yet"
        description="Create flashcards to start learning this topic."
        action={{ label: "Add Card", onClick: onAdd }}
      />
    )
  }

  return (
    <>
      <div className="grid gap-2">
        {cards.map((card) => {
          const isDue = new Date(card.sm2.nextReview) <= new Date()
          return (
            <Card key={card.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{card.front.slice(0, 80)}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {card.type}
                    </Badge>
                    {isDue && (
                      <Badge variant="outline" className="text-xs text-orange-500 border-orange-200">
                        Due
                      </Badge>
                    )}
                    {card.sm2.interval > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Next: {format(new Date(card.sm2.nextReview), "MMM d")}
                      </span>
                    )}
                    {card.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(card.id)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        updateCardSM2(projectId, topicId, card.id, { ...DEFAULT_SM2 })
                        toast.success("Card progress reset")
                      }}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeletingCard(card.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ConfirmDialog
        open={!!deletingCard}
        onOpenChange={() => setDeletingCard(null)}
        title="Delete Card"
        description="This will permanently delete this card. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deletingCard) {
            deleteCard(projectId, topicId, deletingCard)
            toast.success("Card deleted")
          }
        }}
      />
    </>
  )
}
