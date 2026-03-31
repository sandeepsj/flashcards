import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import type { Card, Project, StudySession, Topic, UserData, UserSettings } from "@/types/models"
import { DEFAULT_SM2, DEFAULT_USER_DATA } from "@/types/models"
import { generateId } from "@/lib/ids"
import { updateFile } from "@/lib/googleDrive"
import { SYNC_DEBOUNCE_MS } from "@/lib/constants"
import { useAuthStore } from "./authStore"

interface DataState {
  data: UserData
  fileId: string | null
  isLoaded: boolean
  isSyncing: boolean
  lastSyncedAt: string | null

  // Load
  setData: (data: UserData, fileId: string) => void

  // Projects
  addProject: (name: string, description: string, color: string, icon: string) => string
  updateProject: (id: string, updates: Partial<Pick<Project, "name" | "description" | "color" | "icon">>) => void
  deleteProject: (id: string) => void

  // Topics
  addTopic: (projectId: string, name: string, description: string) => string
  updateTopic: (projectId: string, topicId: string, updates: Partial<Pick<Topic, "name" | "description">>) => void
  deleteTopic: (projectId: string, topicId: string) => void

  // Cards
  addCard: (projectId: string, topicId: string, card: Pick<Card, "type" | "front" | "back" | "tags">) => string
  updateCard: (projectId: string, topicId: string, cardId: string, updates: Partial<Pick<Card, "front" | "back" | "tags" | "type">>) => void
  deleteCard: (projectId: string, topicId: string, cardId: string) => void
  updateCardSM2: (projectId: string, topicId: string, cardId: string, sm2: Card["sm2"]) => void

  // Stats
  addStudySession: (session: Omit<StudySession, "id">) => void
  updateSettings: (settings: Partial<UserSettings>) => void

  // Sync
  triggerSync: () => void
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null

export const useDataStore = create<DataState>()(
  immer((set, get) => ({
    data: DEFAULT_USER_DATA,
    fileId: null,
    isLoaded: false,
    isSyncing: false,
    lastSyncedAt: null,

    setData: (data, fileId) =>
      set((state) => {
        state.data = data
        state.fileId = fileId
        state.isLoaded = true
      }),

    addProject: (name, description, color, icon) => {
      const id = generateId()
      set((state) => {
        state.data.projects.push({
          id,
          name,
          description,
          color,
          icon,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          topics: [],
        })
      })
      get().triggerSync()
      return id
    },

    updateProject: (id, updates) => {
      set((state) => {
        const project = state.data.projects.find((p) => p.id === id)
        if (project) {
          Object.assign(project, updates, { updatedAt: new Date().toISOString() })
        }
      })
      get().triggerSync()
    },

    deleteProject: (id) => {
      set((state) => {
        state.data.projects = state.data.projects.filter((p) => p.id !== id)
      })
      get().triggerSync()
    },

    addTopic: (projectId, name, description) => {
      const id = generateId()
      set((state) => {
        const project = state.data.projects.find((p) => p.id === projectId)
        if (project) {
          project.topics.push({
            id,
            name,
            description,
            projectId,
            createdAt: new Date().toISOString(),
            cards: [],
          })
          project.updatedAt = new Date().toISOString()
        }
      })
      get().triggerSync()
      return id
    },

    updateTopic: (projectId, topicId, updates) => {
      set((state) => {
        const project = state.data.projects.find((p) => p.id === projectId)
        const topic = project?.topics.find((t) => t.id === topicId)
        if (topic) Object.assign(topic, updates)
      })
      get().triggerSync()
    },

    deleteTopic: (projectId, topicId) => {
      set((state) => {
        const project = state.data.projects.find((p) => p.id === projectId)
        if (project) {
          project.topics = project.topics.filter((t) => t.id !== topicId)
        }
      })
      get().triggerSync()
    },

    addCard: (projectId, topicId, card) => {
      const id = generateId()
      set((state) => {
        const project = state.data.projects.find((p) => p.id === projectId)
        const topic = project?.topics.find((t) => t.id === topicId)
        if (topic) {
          topic.cards.push({
            ...card,
            id,
            topicId,
            sm2: { ...DEFAULT_SM2 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
      })
      get().triggerSync()
      return id
    },

    updateCard: (projectId, topicId, cardId, updates) => {
      set((state) => {
        const project = state.data.projects.find((p) => p.id === projectId)
        const topic = project?.topics.find((t) => t.id === topicId)
        const card = topic?.cards.find((c) => c.id === cardId)
        if (card) {
          Object.assign(card, updates, { updatedAt: new Date().toISOString() })
        }
      })
      get().triggerSync()
    },

    deleteCard: (projectId, topicId, cardId) => {
      set((state) => {
        const project = state.data.projects.find((p) => p.id === projectId)
        const topic = project?.topics.find((t) => t.id === topicId)
        if (topic) {
          topic.cards = topic.cards.filter((c) => c.id !== cardId)
        }
      })
      get().triggerSync()
    },

    updateCardSM2: (projectId, topicId, cardId, sm2) => {
      set((state) => {
        const project = state.data.projects.find((p) => p.id === projectId)
        const topic = project?.topics.find((t) => t.id === topicId)
        const card = topic?.cards.find((c) => c.id === cardId)
        if (card) {
          card.sm2 = sm2
          card.updatedAt = new Date().toISOString()
        }
      })
      get().triggerSync()
    },

    addStudySession: (session) => {
      set((state) => {
        const fullSession: StudySession = { ...session, id: generateId() }
        state.data.stats.sessions.push(fullSession)
        state.data.stats.totalReviews += session.cardsReviewed

        // Update streak
        const today = new Date().toISOString().split("T")[0]
        const lastDate = state.data.stats.lastStudyDate
        if (lastDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
          state.data.stats.streak = lastDate === yesterday ? state.data.stats.streak + 1 : 1
          state.data.stats.lastStudyDate = today
        }
      })
      get().triggerSync()
    },

    updateSettings: (settings) => {
      set((state) => {
        Object.assign(state.data.settings, settings)
      })
      get().triggerSync()
    },

    triggerSync: () => {
      if (syncTimeout) clearTimeout(syncTimeout)
      syncTimeout = setTimeout(async () => {
        const { fileId, data } = get()
        const token = useAuthStore.getState().accessToken
        if (!fileId || !token) return

        set((state) => {
          state.isSyncing = true
        })
        try {
          await updateFile(token, fileId, data)
          set((state) => {
            state.isSyncing = false
            state.lastSyncedAt = new Date().toISOString()
          })
        } catch (err) {
          console.error("Sync failed:", err)
          set((state) => {
            state.isSyncing = false
          })
        }
      }, SYNC_DEBOUNCE_MS)
    },
  }))
)
