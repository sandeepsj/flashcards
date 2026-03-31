export interface SM2Data {
  repetitions: number
  interval: number
  easeFactor: number
  nextReview: string // ISO date
  lastReview: string | null
}

export interface Card {
  id: string
  topicId: string
  type: "basic" | "cloze" | "image"
  front: string
  back: string
  tags: string[]
  sm2: SM2Data
  createdAt: string
  updatedAt: string
}

export interface Topic {
  id: string
  name: string
  description: string
  projectId: string
  createdAt: string
  cards: Card[]
}

export interface Project {
  id: string
  name: string
  description: string
  color: string
  icon: string
  createdAt: string
  updatedAt: string
  topics: Topic[]
}

export interface StudySession {
  id: string
  startTime: string
  endTime: string
  cardsReviewed: number
  correctCount: number
  projectId?: string
  topicId?: string
}

export interface UserSettings {
  theme: "light" | "dark" | "system"
  dailyGoal: number
  pomodoroWork: number
  pomodoroBreak: number
  pomodoroLongBreak: number
  pomodorosBeforeLongBreak: number
  newCardsPerDay: number
}

export interface StudyStats {
  streak: number
  lastStudyDate: string | null
  totalReviews: number
  sessions: StudySession[]
}

export interface UserData {
  version: number
  projects: Project[]
  settings: UserSettings
  stats: StudyStats
}

export interface GoogleUser {
  name: string
  email: string
  picture: string
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: "system",
  dailyGoal: 20,
  pomodoroWork: 25,
  pomodoroBreak: 5,
  pomodoroLongBreak: 15,
  pomodorosBeforeLongBreak: 4,
  newCardsPerDay: 10,
}

export const DEFAULT_SM2: SM2Data = {
  repetitions: 0,
  interval: 0,
  easeFactor: 2.5,
  nextReview: new Date().toISOString(),
  lastReview: null,
}

export const DEFAULT_USER_DATA: UserData = {
  version: 1,
  projects: [],
  settings: DEFAULT_SETTINGS,
  stats: {
    streak: 0,
    lastStudyDate: null,
    totalReviews: 0,
    sessions: [],
  },
}

export const PROJECT_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f43f5e", // rose
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#64748b", // slate
]

export const PROJECT_ICONS = [
  "📚", "🧠", "💻", "🔬", "📐", "🎨", "🌍", "📊",
  "🎵", "⚙️", "📝", "🏗️", "🧪", "📖", "🎓", "💡",
]
