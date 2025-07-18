"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Switch to dark theme"
      case "dark":
        return "Switch to system theme"
      case "system":
        return "Switch to light theme"
      default:
        return "Toggle theme"
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="h-9 w-9 cursor-pointer"
    >
      <Sun className={`h-4 w-4 transition-all ${
        theme === "light" ? "rotate-0 scale-100" : "rotate-90 scale-0"
      }`} />
      <Moon className={`absolute h-4 w-4 transition-all ${
        theme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
      }`} />
      <Monitor className={`absolute h-4 w-4 transition-all ${
        theme === "system" ? "rotate-0 scale-100" : "rotate-90 scale-0"
      }`} />
      <span className="sr-only">{getThemeLabel()}</span>
    </Button>
  )
}
