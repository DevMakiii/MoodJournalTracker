import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateMoodStreak(entries: Array<{ created_at: string }>): number {
  if (!entries || entries.length === 0) return 0

  // Sort entries by date (most recent first)
  const sortedEntries = entries.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Get unique dates (considering only date, not time)
  const uniqueDates = new Set(
    sortedEntries.map(entry => {
      const date = new Date(entry.created_at)
      return date.toDateString()
    })
  )

  const dates = Array.from(uniqueDates).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  )

  if (dates.length === 0) return 0

  let streak = 0
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

  // Check if user has an entry today or yesterday to continue streak
  const hasRecentEntry = dates.includes(today) || dates.includes(yesterday)

  if (!hasRecentEntry) return 0

  // Count consecutive days
  for (let i = 0; i < dates.length; i++) {
    const currentDate = new Date(dates[i])
    const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000)

    if (currentDate.toDateString() === expectedDate.toDateString()) {
      streak++
    } else {
      break
    }
  }

  return streak
}
