'use client'

import { useState, useEffect } from 'react'
import { Receipt, Moon, Sun, RefreshCw, Settings } from 'lucide-react'

interface HeaderProps {
  onRefresh: () => void
  onOpenSettings: () => void
  isRefreshing?: boolean
  dataSource?: 'mock' | 'server' | 'user'
}

export default function Header({ onRefresh, onOpenSettings, isRefreshing, dataSource = 'mock' }: HeaderProps) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check initial theme
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle('dark', newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  // Initialize theme from localStorage
  useEffect(() => {
    if (mounted) {
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
      setIsDark(shouldBeDark)
      document.documentElement.classList.toggle('dark', shouldBeDark)
    }
  }, [mounted])

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)]/60 backdrop-blur-xl bg-[color:var(--background)]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-transparent rounded-2xl blur-sm opacity-60"></div>
              <div className="relative p-2.5 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg">
                <Receipt className="w-5 h-5" strokeWidth={1.6} />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">
                Craft Expenses
              </h1>
              <p className="text-xs text-[var(--muted-foreground)] hidden sm:flex items-center gap-1.5 leading-tight font-medium">
                {dataSource === 'user' && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span>Connected to your Craft</span>
                  </>
                )}
                {dataSource === 'server' && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span>Connected via server</span>
                  </>
                )}
                {dataSource === 'mock' && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Using demo data</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSettings}
              className="p-2.5 hover:bg-[color:var(--accent)]/10 hover:text-[var(--accent)] rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
              title="API Settings"
            >
              <Settings className="w-5 h-5" strokeWidth={1.6} />
            </button>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2.5 hover:bg-[color:var(--accent)]/10 hover:text-[var(--accent)] rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.6} />
            </button>

            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2.5 hover:bg-[color:var(--accent)]/10 hover:text-[var(--accent)] rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <Sun className="w-5 h-5" strokeWidth={1.6} />
                ) : (
                  <Moon className="w-5 h-5" strokeWidth={1.6} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
