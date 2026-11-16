import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return true
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme')
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const active = saved ? saved === 'dark' : systemDark
      setIsDark(active)
      if (active) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) {
        meta.setAttribute('content', active ? '#0C0A09' : '#FAFAF9')
      }
    } catch {
      // ignore storage access errors
    }
  }, [])

  function toggleTheme() {
    const nextDark = !isDark
    setIsDark(nextDark)

    if (nextDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    try {
      localStorage.setItem('theme', nextDark ? 'dark' : 'light')
    } catch {
      // storage unavailable
    }

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', nextDark ? '#0C0A09' : '#FAFAF9')
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      className={`relative inline-flex items-center justify-center h-9 w-9 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 transition-colors ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-stone-700" aria-hidden="true" />
      )}
    </button>
  )
}
