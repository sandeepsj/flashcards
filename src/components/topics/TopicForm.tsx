import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useDataStore } from "@/stores/dataStore"
import { toast } from "sonner"

interface TopicFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  initialData?: { id: string; name: string; description: string }
}

export function TopicForm({ open, onOpenChange, projectId, initialData }: TopicFormProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const { addTopic, updateTopic } = useDataStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (initialData) {
      updateTopic(projectId, initialData.id, {
        name: name.trim(),
        description: description.trim(),
      })
      toast.success("Topic updated")
    } else {
      addTopic(projectId, name.trim(), description.trim())
      toast.success("Topic created")
      setName("")
      setDescription("")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? "Edit Topic" : "New Topic"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topic-name">Name</Label>
              <Input
                id="topic-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Data Structures"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic-desc">Description</Label>
              <Textarea
                id="topic-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this topic"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {initialData ? "Save" : "Create Topic"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
