import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useDataStore } from "@/stores/dataStore"
import type { Card } from "@/types/models"
import { toast } from "sonner"

interface CardFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  topicId: string
  initialData?: Card
}

export function CardForm({ open, onOpenChange, projectId, topicId, initialData }: CardFormProps) {
  const [type, setType] = useState<Card["type"]>(initialData?.type || "basic")
  const [front, setFront] = useState(initialData?.front || "")
  const [back, setBack] = useState(initialData?.back || "")
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState("")

  const { addCard, updateCard } = useDataStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!front.trim()) return

    if (initialData) {
      updateCard(projectId, topicId, initialData.id, {
        type,
        front: front.trim(),
        back: back.trim(),
        tags,
      })
      toast.success("Card updated")
    } else {
      addCard(projectId, topicId, {
        type,
        front: front.trim(),
        back: back.trim(),
        tags,
      })
      toast.success("Card created")
      setFront("")
      setBack("")
      setTags([])
    }
    onOpenChange(false)
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
    setTagInput("")
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? "Edit Card" : "New Card"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Tabs value={type} onValueChange={(v) => setType(v as Card["type"])}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="cloze">Cloze</TabsTrigger>
                <TabsTrigger value="image">Image</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Label>Front</Label>
                  <Textarea
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    placeholder="Question or prompt (supports Markdown)"
                    rows={3}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Back</Label>
                  <Textarea
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    placeholder="Answer (supports Markdown)"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="cloze" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Label>Text with Cloze Deletions</Label>
                  <Textarea
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    placeholder="Use {{c1::answer}} for cloze deletions. Example: The capital of France is {{c1::Paris}}"
                    rows={4}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Wrap answers in {"{{c1::answer}}"} syntax
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Extra Notes (optional)</Label>
                  <Textarea
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    placeholder="Additional context shown after answering"
                    rows={2}
                  />
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    placeholder="https://example.com/image.png"
                    autoFocus
                  />
                  {front && front.startsWith("http") && (
                    <img
                      src={front}
                      alt="Preview"
                      className="rounded-md max-h-32 object-contain border"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Answer / Description</Label>
                  <Textarea
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    placeholder="What is this image showing?"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!front.trim()}>
              {initialData ? "Save" : "Create Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
