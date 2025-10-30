"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, PieChart, Flame, FileText } from "lucide-react"

interface MoodEntry {
  id: string
  created_at: string
  mood_level: number
  mood_emoji: string
}

interface MoodStatsProps {
  entries: MoodEntry[]
}

export function MoodStats({ entries }: MoodStatsProps) {
  const calculateStats = () => {
    if (entries.length === 0) {
      return {
        averageMood: 0,
        mostCommon: null,
        currentStreak: 0,
        totalEntries: 0,
      }
    }

    const moodLevels = entries.map((e) => e.mood_level)
    const averageMood = (moodLevels.reduce((a, b) => a + b, 0) / moodLevels.length).toFixed(1)

    const moodCounts = moodLevels.reduce(
      (acc, level) => {
        acc[level] = (acc[level] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const mostCommon = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0]

    // Calculate streak (consecutive days with entries)
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.created_at)
      entryDate.setHours(0, 0, 0, 0)

      if (entryDate.getTime() === currentDate.getTime()) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (entryDate.getTime() < currentDate.getTime()) {
        break
      }
    }

    return {
      averageMood: Number.parseFloat(averageMood),
      mostCommon: mostCommon ? Number.parseInt(mostCommon) : null,
      currentStreak: streak,
      totalEntries: entries.length,
    }
  }

  const stats = calculateStats()
  const moodLabels: Record<number, string> = {
    1: "Terrible",
    2: "Bad",
    3: "Okay",
    4: "Good",
    5: "Great",
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Average Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageMood}</div>
          <p className="text-xs text-gray-500 mt-1">out of 5</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Most Common
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.mostCommon ? moodLabels[stats.mostCommon] : "N/A"}</div>
          <p className="text-xs text-gray-500 mt-1">mood</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.currentStreak}</div>
          <p className="text-xs text-gray-500 mt-1">days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Total Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEntries}</div>
          <p className="text-xs text-gray-500 mt-1">tracked</p>
        </CardContent>
      </Card>
    </div>
  )
}
