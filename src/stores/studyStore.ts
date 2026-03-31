import { create } from "zustand"
import type { Card } from "@/types/models"

export type StudyMode = "review" | "cram" | "quiz"

interface StudyState {
  isActive: boolean
  mode: StudyMode
  cards: (Card & { projectId: string })[]
  currentIndex: number
  isFlipped: boolean
  startTime: string | null
  reviewed: number
  correct: number
  projectId?: string
  topicId?: string

  startSession: (cards: (Card & { projectId: string })[], mode: StudyMode, projectId?: string, topicId?: string) => void
  flipCard: () => void
  nextCard: (wasCorrect: boolean) => void
  endSession: () => { cardsReviewed: number; correctCount: number; startTime: string; endTime: string }
  reset: () => void
}

export const useStudyStore = create<StudyState>((set, get) => ({
  isActive: false,
  mode: "review",
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  startTime: null,
  reviewed: 0,
  correct: 0,
  projectId: undefined,
  topicId: undefined,

  startSession: (cards, mode, projectId, topicId) =>
    set({
      isActive: true,
      mode,
      cards,
      currentIndex: 0,
      isFlipped: false,
      startTime: new Date().toISOString(),
      reviewed: 0,
      correct: 0,
      projectId,
      topicId,
    }),

  flipCard: () => set({ isFlipped: true }),

  nextCard: (wasCorrect) =>
    set((s) => ({
      currentIndex: s.currentIndex + 1,
      isFlipped: false,
      reviewed: s.reviewed + 1,
      correct: s.correct + (wasCorrect ? 1 : 0),
    })),

  endSession: () => {
    const s = get()
    const result = {
      cardsReviewed: s.reviewed,
      correctCount: s.correct,
      startTime: s.startTime!,
      endTime: new Date().toISOString(),
    }
    set({
      isActive: false,
      cards: [],
      currentIndex: 0,
      isFlipped: false,
      startTime: null,
      reviewed: 0,
      correct: 0,
    })
    return result
  },

  reset: () =>
    set({
      isActive: false,
      mode: "review",
      cards: [],
      currentIndex: 0,
      isFlipped: false,
      startTime: null,
      reviewed: 0,
      correct: 0,
    }),
}))
