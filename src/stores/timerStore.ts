import { create } from "zustand"

export type TimerMode = "work" | "shortBreak" | "longBreak"

interface TimerState {
  mode: TimerMode
  timeRemaining: number // seconds
  isRunning: boolean
  completedPomodoros: number
  workDuration: number
  breakDuration: number
  longBreakDuration: number
  pomodorosBeforeLongBreak: number

  start: () => void
  pause: () => void
  reset: () => void
  tick: () => void
  skipToNext: () => void
  setDurations: (work: number, breakTime: number, longBreak: number, count: number) => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: "work",
  timeRemaining: 25 * 60,
  isRunning: false,
  completedPomodoros: 0,
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  pomodorosBeforeLongBreak: 4,

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),

  reset: () => {
    const s = get()
    const duration =
      s.mode === "work" ? s.workDuration
        : s.mode === "shortBreak" ? s.breakDuration
          : s.longBreakDuration
    set({ timeRemaining: duration * 60, isRunning: false })
  },

  tick: () => {
    const s = get()
    if (!s.isRunning) return

    if (s.timeRemaining <= 1) {
      // Timer complete — advance to next mode
      s.skipToNext()
      return
    }

    set({ timeRemaining: s.timeRemaining - 1 })
  },

  skipToNext: () => {
    const s = get()
    if (s.mode === "work") {
      const newCompleted = s.completedPomodoros + 1
      const isLongBreak = newCompleted % s.pomodorosBeforeLongBreak === 0
      const nextMode: TimerMode = isLongBreak ? "longBreak" : "shortBreak"
      const duration = isLongBreak ? s.longBreakDuration : s.breakDuration
      set({
        mode: nextMode,
        timeRemaining: duration * 60,
        completedPomodoros: newCompleted,
        isRunning: false,
      })
    } else {
      set({
        mode: "work",
        timeRemaining: s.workDuration * 60,
        isRunning: false,
      })
    }
  },

  setDurations: (work, breakTime, longBreak, count) => {
    set((s) => {
      const duration =
        s.mode === "work" ? work
          : s.mode === "shortBreak" ? breakTime
            : longBreak
      return {
        workDuration: work,
        breakDuration: breakTime,
        longBreakDuration: longBreak,
        pomodorosBeforeLongBreak: count,
        timeRemaining: duration * 60,
      }
    })
  },
}))
