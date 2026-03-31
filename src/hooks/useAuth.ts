import { useEffect } from "react"
import { useGoogleLogin } from "@react-oauth/google"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { loadOrCreateData } from "@/lib/googleDrive"
import { GOOGLE_SCOPES } from "@/lib/constants"

async function handleToken(token: string) {
  const { login: setAuth } = useAuthStore.getState()
  const { setData } = useDataStore.getState()

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
}

export function useAuth() {
  const { logout: clearAuth, isAuthenticated, user } = useAuthStore()

  // Handle redirect response — Google appends #access_token=... to the URL
  useEffect(() => {
    const hash = window.location.hash
    // The hash from OAuth redirect looks like: #access_token=...&token_type=Bearer&...
    // But our HashRouter also uses #, so the OAuth params come after the route hash
    // When redirecting back, the full hash might be: #access_token=ya29...&token_type=...
    if (hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.substring(hash.indexOf("access_token=")))
      const accessToken = params.get("access_token")
      if (accessToken) {
        // Clean up the URL
        window.history.replaceState(null, "", window.location.pathname + "#/")
        handleToken(accessToken)
      }
    }
  }, [])

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
