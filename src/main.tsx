import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import { extractTokenFromHash } from "./lib/googleAuth"
import "./index.css"

// Extract OAuth token BEFORE React mounts — must happen before HashRouter
// sees the hash, otherwise it interprets #access_token=... as a route
const initialToken = extractTokenFromHash()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App initialToken={initialToken} />
  </StrictMode>
)
