import { useGoogleLogin } from "@react-oauth/google"
import { useAuthStore } from "@/stores/authStore"
import { GOOGLE_SCOPES } from "@/lib/constants"

export function useAuth() {
  const { logout: clearAuth, isAuthenticated, user } = useAuthStore()

  const googleLogin = useGoogleLogin({
    scope: GOOGLE_SCOPES,
    ux_mode: "redirect",
    redirect_uri: window.location.origin + window.location.pathname,
  })

  const logout = () => {
    clearAuth()
    window.location.hash = "#/"
    window.location.reload()
  }

  return { login: googleLogin, logout, isAuthenticated, user }
}
