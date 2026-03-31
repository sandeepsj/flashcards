import { useState, useCallback, useMemo } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { ArrowLeft, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useDataStore } from "@/stores/dataStore"
import { useDueCards, useAllCards } from "@/hooks/useDueCards"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { sm2, type Quality } from "@/lib/sm2"
import { FlashcardViewer } from "./FlashcardViewer"
import { RatingButtons } from "./RatingButtons"
import { SessionSummary } from "./SessionSummary"
import { EmptyState } from "@/components/shared/EmptyState"
import type { StudyMode } from "@/stores/studyStore"

export function StudySessionPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const projectFilter = searchParams.get("project") || undefined

  const { data, updateCardSM2, addStudySession } = useDataStore()
  const dueCards = useDueCards(projectFilter, topicId)
  const allCards = useAllCards()

  const [mode, setMode] = useState<StudyMode>("review")
  const [sessionCards, setSessionCards] = useState<typeof dueCards>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [startTime] = useState(new Date().toISOString())
  const [isComplete, setIsComplete] = useState(false)
  const [modeSelected, setModeSelected] = useState(false)

  // Get the project and topic for finding card locations
  const cardLocations = useMemo(() => {
    const map = new Map<string, { projectId: string; topicId: string }>()
    for (const project of data.projects) {
      for (const topic of project.topics) {
        for (const card of topic.cards) {
          map.set(card.id, { projectId: project.id, topicId: topic.id })
        }
      }
    }
    return map
  }, [data.projects])

  const startStudy = (selectedMode: StudyMode) => {
    setMode(selectedMode)
    setModeSelected(true)
    if (selectedMode === "cram") {
      // Cram: all cards from the filtered scope, shuffled
      const cards = topicId
        ? allCards.filter((c) => c.topicId === topicId)
        : projectFilter
          ? allCards.filter((c) => c.projectId === projectFilter)
          : [...allCards]
      // Shuffle
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]]
      }
      setSessionCards(cards)
    } else {
      setSessionCards([...dueCards])
    }
  }

  const currentCard = sessionCards[currentIndex]

  const handleFlip = useCallback(() => {
    if (!isFlipped && currentCard) {
      setIsFlipped(true)
    }
  }, [isFlipped, currentCard])

  const handleRate = useCallback((quality: Quality) => {
    if (!currentCard) return

    const loc = cardLocations.get(currentCard.id)
    if (loc && mode === "review") {
      const result = sm2(quality, currentCard.sm2)
      updateCardSM2(loc.projectId, loc.topicId, currentCard.id, {
        ...result,
        lastReview: result.lastReview,
      })
    }

    setReviewed((r) => r + 1)
    if (quality >= 3) setCorrect((c) => c + 1)

    if (currentIndex + 1 >= sessionCards.length) {
      // Session complete
      const endTime = new Date().toISOString()
      addStudySession({
        startTime,
        endTime,
        cardsReviewed: reviewed + 1,
        correctCount: correct + (quality >= 3 ? 1 : 0),
        projectId: projectFilter,
        topicId,
      })
      setIsComplete(true)
    } else {
      setCurrentIndex((i) => i + 1)
      setIsFlipped(false)
    }
  }, [currentCard, currentIndex, sessionCards.length, cardLocations, mode, updateCardSM2, addStudySession, startTime, reviewed, correct, projectFilter, topicId])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    " ": handleFlip,
    "1": () => isFlipped && handleRate(0),
    "2": () => isFlipped && handleRate(2),
    "3": () => isFlipped && handleRate(3),
    "4": () => isFlipped && handleRate(5),
    "escape": () => navigate(-1),
  })

  // Mode selection screen
  if (!modeSelected) {
    const cramCards = topicId
      ? allCards.filter((c) => c.topicId === topicId)
      : projectFilter
        ? allCards.filter((c) => c.projectId === projectFilter)
        : allCards

    return (
      <div className="max-w-md mx-auto space-y-6 py-8">
        <div className="text-center space-y-2">
          <GraduationCap className="h-10 w-10 text-primary mx-auto" />
          <h2 className="text-2xl font-bold">Choose Study Mode</h2>
        </div>

        <div className="grid gap-3">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start text-left"
            onClick={() => startStudy("review")}
            disabled={dueCards.length === 0}
          >
            <div className="flex items-center gap-2 w-full">
              <span className="font-medium">Normal Review</span>
              <Badge className="ml-auto">{dueCards.length} due</Badge>
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              Review cards scheduled for today. SM-2 algorithm will update intervals.
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start text-left"
            onClick={() => startStudy("cram")}
            disabled={cramCards.length === 0}
          >
            <div className="flex items-center gap-2 w-full">
              <span className="font-medium">Cram Mode</span>
              <Badge variant="secondary" className="ml-auto">{cramCards.length} cards</Badge>
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              Review all cards in random order. Ratings will not affect scheduling.
            </span>
          </Button>
        </div>

        <Button variant="ghost" className="w-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  // Session complete
  if (isComplete) {
    return (
      <SessionSummary
        cardsReviewed={reviewed}
        correctCount={correct}
        startTime={startTime}
        endTime={new Date().toISOString()}
        onStudyAgain={() => {
          setIsComplete(false)
          setCurrentIndex(0)
          setIsFlipped(false)
          setReviewed(0)
          setCorrect(0)
          setModeSelected(false)
        }}
      />
    )
  }

  // No cards
  if (sessionCards.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No cards to study"
        description="All caught up! Come back later when cards are due for review, or add new cards."
        action={{ label: "Go to Dashboard", onClick: () => navigate("/") }}
      />
    )
  }

  const progress = (currentIndex / sessionCards.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Exit
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{mode === "cram" ? "Cram" : "Review"}</Badge>
          <span>
            {currentIndex + 1} / {sessionCards.length}
          </span>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Card */}
      {currentCard && (
        <>
          <FlashcardViewer
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />

          {/* Rating buttons */}
          {isFlipped && (
            <div className="space-y-2">
              <RatingButtons sm2={currentCard.sm2} onRate={handleRate} />
              <p className="text-xs text-muted-foreground text-center">
                Keyboard: 1 = Again, 2 = Hard, 3 = Good, 4 = Easy
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
