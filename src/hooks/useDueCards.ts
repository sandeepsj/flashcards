import { useMemo } from "react"
import { useDataStore } from "@/stores/dataStore"
import type { Card } from "@/types/models"

export interface DueCard extends Card {
  projectId: string
  projectName: string
  topicId: string
  topicName: string
}

export function useDueCards(projectId?: string, topicId?: string): DueCard[] {
  const projects = useDataStore((s) => s.data.projects)

  return useMemo(() => {
    const now = new Date().toISOString()
    const due: DueCard[] = []

    for (const project of projects) {
      if (projectId && project.id !== projectId) continue

      for (const topic of project.topics) {
        if (topicId && topic.id !== topicId) continue

        for (const card of topic.cards) {
          if (card.sm2.nextReview <= now) {
            due.push({
              ...card,
              projectId: project.id,
              projectName: project.name,
              topicId: topic.id,
              topicName: topic.name,
            })
          }
        }
      }
    }

    // Sort: overdue first (oldest nextReview), then by ease factor (hardest first)
    due.sort((a, b) => {
      const dateCompare = a.sm2.nextReview.localeCompare(b.sm2.nextReview)
      if (dateCompare !== 0) return dateCompare
      return a.sm2.easeFactor - b.sm2.easeFactor
    })

    return due
  }, [projects, projectId, topicId])
}

export function useAllCards(): DueCard[] {
  const projects = useDataStore((s) => s.data.projects)

  return useMemo(() => {
    const all: DueCard[] = []
    for (const project of projects) {
      for (const topic of project.topics) {
        for (const card of topic.cards) {
          all.push({
            ...card,
            projectId: project.id,
            projectName: project.name,
            topicId: topic.id,
            topicName: topic.name,
          })
        }
      }
    }
    return all
  }, [projects])
}
