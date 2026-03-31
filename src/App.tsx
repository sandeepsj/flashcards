import { useState, useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import { router } from "@/routes/router"
import { useUIStore } from "@/stores/uiStore"
import { applyTheme, watchSystemTheme } from "@/lib/theme"
import { extractTokenFromHash, handleToken } from "@/lib/googleAuth"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""

export default function App() {
  const theme = useUIStore((s) => s.theme)
  const [loading, setLoading] = useState(false)

  // Handle OAuth redirect BEFORE router mounts
  useEffect(() => {
    const token = extractTokenFromHash()
    if (token) {
      setLoading(true)
      handleToken(token).finally(() => setLoading(false))
    }
  }, [])

  useEffect(() => {
    applyTheme(theme)
    if (theme === "system") {
      return watchSystemTheme(() => applyTheme("system"))
    }
  }, [theme])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Signing you in...</p>
        </div>
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <TooltipProvider delayDuration={300}>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" richColors />
      </TooltipProvider>
    </GoogleOAuthProvider>
  )
}
