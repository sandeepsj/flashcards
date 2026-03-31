import { useEffect } from "react"
import { useUIStore } from "@/stores/uiStore"

type ShortcutHandler = (e: KeyboardEvent) => void

export function useKeyboardShortcuts(shortcuts: Record<string, ShortcutHandler>) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return
      }

      const key = [
        e.metaKey || e.ctrlKey ? "mod" : "",
        e.shiftKey ? "shift" : "",
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join("+")

      if (shortcuts[key]) {
        e.preventDefault()
        shortcuts[key](e)
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [shortcuts])
}

export function useGlobalShortcuts() {
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen)

  useKeyboardShortcuts({
    "mod+k": () => setCommandPaletteOpen(true),
  })
}
