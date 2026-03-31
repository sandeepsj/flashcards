import { RouterProvider } from "react-router-dom"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import { router } from "@/routes/router"
import { useEffect } from "react"
import { useUIStore } from "@/stores/uiStore"
import { applyTheme, watchSystemTheme } from "@/lib/theme"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""

export default function App() {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    applyTheme(theme)
    if (theme === "system") {
      return watchSystemTheme(() => applyTheme("system"))
    }
  }, [theme])

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <TooltipProvider delayDuration={300}>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" richColors />
      </TooltipProvider>
    </GoogleOAuthProvider>
  )
}
