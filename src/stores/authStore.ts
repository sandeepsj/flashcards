import { create } from "zustand"
import type { GoogleUser } from "@/types/models"

interface AuthState {
  user: GoogleUser | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (user: GoogleUser, token: string) => void
  logout: () => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  login: (user, token) =>
    set({ user, accessToken: token, isAuthenticated: true }),

  logout: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),

  setToken: (token) =>
    set({ accessToken: token }),
}))
