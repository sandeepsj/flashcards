import { motion } from "framer-motion"
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer"
import type { Card } from "@/types/models"
import { cn } from "@/lib/utils"

interface FlashcardViewerProps {
  card: Card
  isFlipped: boolean
  onFlip: () => void
}

export function FlashcardViewer({ card, isFlipped, onFlip }: FlashcardViewerProps) {
  const renderFront = () => {
    if (card.type === "image") {
      return (
        <div className="flex flex-col items-center gap-4">
          <img
            src={card.front}
            alt="Card image"
            className="max-h-64 rounded-lg object-contain"
          />
          <p className="text-sm text-muted-foreground">What is this?</p>
        </div>
      )
    }

    if (card.type === "cloze") {
      const clozeText = card.front.replace(
        /\{\{c\d+::(.+?)\}\}/g,
        '<span class="inline-block px-2 py-0.5 bg-primary/20 rounded text-primary font-medium">[...]</span>'
      )
      return <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: clozeText }} />
    }

    return <MarkdownRenderer content={card.front} />
  }

  const renderBack = () => {
    if (card.type === "cloze") {
      const revealed = card.front.replace(
        /\{\{c\d+::(.+?)\}\}/g,
        '<span class="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-green-700 dark:text-green-300 font-medium">$1</span>'
      )
      return (
        <div>
          <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: revealed }} />
          {card.back && (
            <div className="mt-4 pt-4 border-t">
              <MarkdownRenderer content={card.back} />
            </div>
          )}
        </div>
      )
    }

    return <MarkdownRenderer content={card.back} />
  }

  return (
    <div className="perspective-1000 w-full max-w-2xl mx-auto" onClick={onFlip}>
      <motion.div
        className="relative cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Front */}
        <div
          className={cn(
            "min-h-[300px] rounded-xl border bg-card p-8 flex items-center justify-center",
            "shadow-lg backface-hidden",
            isFlipped && "invisible"
          )}
        >
          <div className="text-center w-full">
            <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">
              {card.type === "image" ? "Image Card" : card.type === "cloze" ? "Fill in the blank" : "Question"}
            </p>
            {renderFront()}
            <p className="text-xs text-muted-foreground mt-6">
              Click or press Space to reveal
            </p>
          </div>
        </div>

        {/* Back */}
        <div
          className={cn(
            "min-h-[300px] rounded-xl border bg-card p-8 flex items-center justify-center",
            "shadow-lg backface-hidden absolute inset-0",
            !isFlipped && "invisible"
          )}
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="text-center w-full">
            <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">
              Answer
            </p>
            {renderBack()}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
