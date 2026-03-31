import { useGoogleLogin } from "@react-oauth/google"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { loadOrCreateData } from "@/lib/googleDrive"
import { GOOGLE_SCOPES } from "@/lib/constants"

export function useAuth() {
  const { login: setAuth, logout: clearAuth, isAuthenticated, user } = useAuthStore()
  const setData = useDataStore((s) => s.setData)

  const googleLogin = useGoogleLogin({
    scope: GOOGLE_SCOPES,
    onSuccess: async (tokenResponse) => {
      const token = tokenResponse.access_token

      // Fetch user info
      const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const userInfo = await userRes.json()

      setAuth(
        {
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
        },
        token
      )

      // Load data from Google Drive
      try {
        const { data, fileId } = await loadOrCreateData(token)
        setData(data, fileId)
      } catch (err) {
        console.error("Failed to load data from Google Drive:", err)
      }
    },
    onError: (error) => {
      console.error("Google login failed:", error)
    },
  })

  const logout = () => {
    clearAuth()
    window.location.reload()
  }

  return { login: googleLogin, logout, isAuthenticated, user }
}
