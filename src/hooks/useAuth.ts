import { useAuthStore } from "@/stores/authStore"
import { GOOGLE_SCOPES } from "@/lib/constants"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""

export function useAuth() {
  const { logout: clearAuth, isAuthenticated, user } = useAuthStore()

  const login = () => {
    const redirectUri = window.location.origin + window.location.pathname
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "token",
      scope: GOOGLE_SCOPES,
      include_granted_scopes: "true",
      prompt: "consent",
    })
    // Full-page redirect to Google — no popup
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  const logout = () => {
    clearAuth()
    window.location.hash = "#/"
    window.location.reload()
  }

  return { login, logout, isAuthenticated, user }
}
