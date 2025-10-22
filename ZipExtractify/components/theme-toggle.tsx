"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle({ isRefreshButton = false }: { isRefreshButton?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark" | "rainbow">("dark")
  const clickTimesRef = useRef<number[]>([])

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "rainbow" | null
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Default to dark theme
      document.documentElement.classList.add("dark")
    }
  }, [])

  const applyTheme = (newTheme: "light" | "dark" | "rainbow") => {
    document.documentElement.classList.remove("dark", "rainbow")
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else if (newTheme === "rainbow") {
      document.documentElement.classList.add("rainbow")
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    applyTheme(newTheme)
  }

  const handleRefreshClick = (onClick?: () => void) => {
    const now = Date.now()
    clickTimesRef.current.push(now)

    // Keep only clicks within the last 6 seconds
    clickTimesRef.current = clickTimesRef.current.filter((time) => now - time < 6000)

    // Check if 5 clicks happened within 6 seconds
    if (clickTimesRef.current.length >= 5) {
      if (theme === "rainbow") {
        // Turn off rainbow mode
        const newTheme = "dark"
        setTheme(newTheme)
        localStorage.setItem("theme", newTheme)
        applyTheme(newTheme)
      } else {
        // Activate rainbow mode
        setTheme("rainbow")
        localStorage.setItem("theme", "rainbow")
        applyTheme("rainbow")
      }
      clickTimesRef.current = [] // Reset clicks
    }

    // Call the original onClick handler
    if (onClick) onClick()
  }

  if (isRefreshButton) {
    return { handleRefreshClick }
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full bg-transparent">
      {theme === "dark" || theme === "rainbow" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

export function useRainbowEasterEgg() {
  const [theme, setTheme] = useState<"light" | "dark" | "rainbow">("dark")
  const clickTimesRef = useRef<number[]>([])

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "rainbow" | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  const applyTheme = (newTheme: "light" | "dark" | "rainbow") => {
    document.documentElement.classList.remove("dark", "rainbow")
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else if (newTheme === "rainbow") {
      document.documentElement.classList.add("rainbow")
    }
  }

  const handleRefreshClick = (onClick?: () => void) => {
    const now = Date.now()
    clickTimesRef.current.push(now)

    clickTimesRef.current = clickTimesRef.current.filter((time) => now - time < 6000)

    if (clickTimesRef.current.length >= 5) {
      if (theme === "rainbow") {
        const newTheme = "dark"
        setTheme(newTheme)
        localStorage.setItem("theme", newTheme)
        applyTheme(newTheme)
      } else {
        setTheme("rainbow")
        localStorage.setItem("theme", "rainbow")
        applyTheme("rainbow")
      }
      clickTimesRef.current = []
    }

    if (onClick) onClick()
  }

  return { handleRefreshClick }
}
