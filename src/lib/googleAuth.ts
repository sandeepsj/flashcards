import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { loadOrCreateData } from "@/lib/googleDrive"

export async function handleToken(token: string) {
  const { login: setAuth } = useAuthStore.getState()
  const { setData } = useDataStore.getState()

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

  try {
    const { data, fileId } = await loadOrCreateData(token)
    setData(data, fileId)
  } catch (err) {
    console.error("Failed to load data from Google Drive:", err)
  }
}

/**
 * Check if the current URL hash contains an OAuth access token from Google's redirect.
 * Returns the token if found, null otherwise. Cleans up the URL.
 */
export function extractTokenFromHash(): string | null {
  const hash = window.location.hash
  if (!hash.includes("access_token=")) return null

  // Google redirects with: #access_token=ya29...&token_type=Bearer&expires_in=3599&scope=...
  const params = new URLSearchParams(hash.substring(1)) // strip the leading #
  const token = params.get("access_token")

  if (token) {
    // Clean up URL so HashRouter can work
    window.history.replaceState(null, "", window.location.pathname + "#/")
  }

  return token
}
