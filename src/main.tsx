import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"

// Token was extracted by inline script in index.html (before modules load)
const initialToken = (window as unknown as { __OAUTH_TOKEN__?: string }).__OAUTH_TOKEN__ || null

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App initialToken={initialToken} />
  </StrictMode>
)
