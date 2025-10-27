"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MoodEntry {
  id: string
  created_at: string
  mood_level: number
  mood_emoji: string
  notes: string | null
}

interface MoodInsightsProps {
  entries: MoodEntry[]
}

export function MoodInsights({ entries }: MoodInsightsProps) {
  const generateInsights = () => {
    if (entries.length === 0) {
      return [
        {
          title: "Get Started",
          description: "Start tracking your mood to see personalized insights and patterns.",
          emoji: "📝",
        },
      ]
    }

    const insights = []
    const moodLevels = entries.map((e) => e.mood_level)
    const averageMood = moodLevels.reduce((a, b) => a + b, 0) / moodLevels.length

    // Insight 1: Overall mood trend
    if (averageMood >= 4) {
      insights.push({
        title: "You're doing great!",
        description: "Your average mood is above 4. Keep up the positive momentum!",
        emoji: "🌟",
      })
    } else if (averageMood >= 3) {
      insights.push({
        title: "Steady state",
        description: "Your mood is stable. Consider activities that bring you joy.",
        emoji: "⚖️",
      })
    } else {
      insights.push({
        title: "Challenging times",
        description: "Your mood has been lower recently. Consider self-care activities.",
        emoji: "🤗",
      })
    }

    // Insight 2: Mood distribution
    const moodCounts = moodLevels.reduce(
      (acc, level) => {
        acc[level] = (acc[level] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const mostCommon = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0]
    if (mostCommon) {
      const moodLabels: Record<string, string> = {
        "1": "Terrible",
        "2": "Bad",
        "3": "Okay",
        "4": "Good",
        "5": "Great",
      }
      insights.push({
        title: `Your typical mood is ${moodLabels[mostCommon]}`,
        description: `You've felt this way ${moodCounts[Number.parseInt(mostCommon)]} times in your tracked entries.`,
        emoji: "📊",
      })
    }

    // Insight 3: Consistency
    const last7Days = entries.filter((e) => {
      const date = new Date(e.created_at)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return date >= sevenDaysAgo
    })

    if (last7Days.length >= 5) {
      insights.push({
        title: "Great consistency!",
        description: `You've logged ${last7Days.length} entries in the last 7 days. Keep tracking!`,
        emoji: "✅",
      })
    }

    // Insight 4: Affirmation
    const affirmations = [
      "Remember to be kind to yourself today.",
      "Your feelings are valid and important.",
      "Every day is a new opportunity for growth.",
      "You're doing better than you think.",
      "Progress, not perfection, is the goal.",
    ]
    insights.push({
      title: "Daily Affirmation",
      description: affirmations[Math.floor(Math.random() * affirmations.length)],
      emoji: "💫",
    })

    return insights
  }

  const insights = generateInsights()

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Insights & Tips</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{insight.emoji}</span>
                <CardTitle className="text-base">{insight.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{insight.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
