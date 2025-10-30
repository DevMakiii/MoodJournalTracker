'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Mood to theme mapping
export const MOOD_THEMES = {
  1: 'mood-terrible',
  2: 'mood-bad',
  3: 'mood-okay',
  4: 'mood-good',
  5: 'mood-great',
} as const

export type MoodTheme = typeof MOOD_THEMES[keyof typeof MOOD_THEMES]

// Hook to get current mood theme
export function useMoodTheme() {
  const [moodTheme, setMoodThemeState] = React.useState<MoodTheme | null>(null)

  const setMoodTheme = React.useCallback((moodLevel: number) => {
    const theme = MOOD_THEMES[moodLevel as keyof typeof MOOD_THEMES]
    if (theme) {
      setMoodThemeState(theme)
      // Apply the theme class to document element
      document.documentElement.classList.remove(...Object.values(MOOD_THEMES))
      document.documentElement.classList.add(theme)
    }
  }, [])

  const clearMoodTheme = React.useCallback(() => {
    setMoodThemeState(null)
    document.documentElement.classList.remove(...Object.values(MOOD_THEMES))
  }, [])

  return { moodTheme, setMoodTheme, clearMoodTheme }
}
